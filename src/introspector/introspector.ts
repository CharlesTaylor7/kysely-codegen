import { Kysely, sql } from 'kysely';
import type { DatabaseMetadata, Dialect } from '../core';

export type ConnectOptions = {
  connectionString: string;
  dialect: Dialect;
};

export type IntrospectOptions<DB> = {
  db: Kysely<DB>;
};

/**
 * Analyzes and returns metadata for a connected database.
 */
export abstract class Introspector<DB> {
  private async establishDatabaseConnection(db: Kysely<DB>) {
    return await sql`SELECT 1;`.execute(db);
  }

  async connect(options: ConnectOptions) {
    // Insane solution in lieu of a better one.
    // We'll create a database connection with SSL, and if it complains about SSL, try without it.
    for (const ssl of [true, false]) {
      try {
        const dialect = await options.dialect.createKyselyDialect({
          connectionString: options.connectionString,
          ssl,
        });

        const db = new Kysely<DB>({ dialect });

        await this.establishDatabaseConnection(db);

        return db;
      } catch (error) {
        const isSslError =
          error instanceof Error && /\bSSL\b/.test(error.message);
        const isUnexpectedError = !ssl || !isSslError;

        if (isUnexpectedError) {
          throw error;
        }
      }
    }

    throw new Error('Failed to connect to database.');
  }

  protected async getTables(options: IntrospectOptions<DB>) {
      return await options.db.introspection.getTables();
  }

  abstract introspect(
    options: IntrospectOptions<DB>,
  ): Promise<DatabaseMetadata>;
}
