import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Table } from '@/types';
import { tableArb } from './generators';

/**
 * PBT: Table Sorting Properties
 *
 * Properties tested:
 * - Invariant: Sorted output has same length as input (size preservation)
 * - Invariant: Sorted output contains same elements as input (element preservation)
 * - Invariant: Tables with lastOrderAt are always before tables without
 * - Invariant: Among tables with lastOrderAt, ordering is descending by time
 */

function sortTables(tables: Table[]): Table[] {
  return [...tables].sort((a, b) => {
    if (!a.lastOrderAt && !b.lastOrderAt) return a.tableNumber - b.tableNumber;
    if (!a.lastOrderAt) return 1;
    if (!b.lastOrderAt) return -1;
    return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
  });
}

describe('Table Sorting - PBT', () => {
  it('PROPERTY: Sorting preserves array length', () => {
    fc.assert(
      fc.property(fc.array(tableArb, { minLength: 0, maxLength: 10 }), (tables) => {
        const sorted = sortTables(tables);
        expect(sorted.length).toBe(tables.length);
      })
    );
  });

  it('PROPERTY: Sorting preserves all elements (same IDs)', () => {
    fc.assert(
      fc.property(fc.array(tableArb, { minLength: 0, maxLength: 10 }), (tables) => {
        const sorted = sortTables(tables);
        const originalIds = tables.map((t) => t.id).sort();
        const sortedIds = sorted.map((t) => t.id).sort();
        expect(sortedIds).toEqual(originalIds);
      })
    );
  });

  it('PROPERTY: Tables with orders come before tables without orders', () => {
    fc.assert(
      fc.property(fc.array(tableArb, { minLength: 2, maxLength: 10 }), (tables) => {
        const sorted = sortTables(tables);

        let seenNull = false;
        for (const table of sorted) {
          if (table.lastOrderAt === null) {
            seenNull = true;
          } else if (seenNull) {
            // A table with lastOrderAt appeared after a null one — violation
            expect(true).toBe(false);
          }
        }
      })
    );
  });

  it('PROPERTY: Tables with orders are sorted by time descending', () => {
    fc.assert(
      fc.property(fc.array(tableArb, { minLength: 2, maxLength: 10 }), (tables) => {
        const sorted = sortTables(tables);
        const withOrders = sorted.filter((t) => t.lastOrderAt !== null);

        for (let i = 1; i < withOrders.length; i++) {
          const prev = new Date(withOrders[i - 1].lastOrderAt!).getTime();
          const curr = new Date(withOrders[i].lastOrderAt!).getTime();
          expect(prev).toBeGreaterThanOrEqual(curr);
        }
      })
    );
  });

  it('PROPERTY: Sorting is idempotent (sorting twice gives same result)', () => {
    fc.assert(
      fc.property(fc.array(tableArb, { minLength: 0, maxLength: 10 }), (tables) => {
        const sorted1 = sortTables(tables);
        const sorted2 = sortTables(sorted1);
        expect(sorted2.map((t) => t.id)).toEqual(sorted1.map((t) => t.id));
      })
    );
  });
});
