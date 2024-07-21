import {
  SqliteDialect,
} from '../dialects';
import type { Dialect } from './dialect';

export type DialectName = 'sqlite';


/**
 * Returns a dialect instance for a pre-defined dialect name.
 */
export class DialectManager {
  getDialect(name: DialectName): Dialect {
    switch (name) {
      case 'sqlite':
        return new SqliteDialect();
      default: {
        throw new Error("Unsupported dialect");
      }
    }
  }
}
