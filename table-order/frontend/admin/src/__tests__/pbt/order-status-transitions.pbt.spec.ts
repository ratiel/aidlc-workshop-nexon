import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { OrderStatus } from '@/types';
import { orderStatusArb } from './generators';

/**
 * PBT: Order Status Transition Properties
 *
 * Properties tested:
 * - Invariant: Only valid forward transitions are allowed
 * - Invariant: COMPLETED is a terminal state
 * - Invariant: No skip transitions (PENDING cannot go directly to COMPLETED)
 */

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING'],
  PREPARING: ['COMPLETED'],
  COMPLETED: [],
};

function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

function getNextStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case 'PENDING': return 'PREPARING';
    case 'PREPARING': return 'COMPLETED';
    case 'COMPLETED': return null;
  }
}

describe('Order Status Transitions - PBT', () => {
  it('PROPERTY: COMPLETED is always a terminal state (no valid transitions from COMPLETED)', () => {
    fc.assert(
      fc.property(orderStatusArb, (targetStatus) => {
        expect(isValidTransition('COMPLETED', targetStatus)).toBe(false);
      })
    );
  });

  it('PROPERTY: Every non-COMPLETED status has exactly one valid next state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('PENDING' as const, 'PREPARING' as const),
        (status) => {
          const validNext = VALID_TRANSITIONS[status];
          expect(validNext).toHaveLength(1);
          expect(getNextStatus(status)).toBe(validNext[0]);
        }
      )
    );
  });

  it('PROPERTY: Transitions are strictly forward (no backward transitions)', () => {
    const statusOrder: OrderStatus[] = ['PENDING', 'PREPARING', 'COMPLETED'];

    fc.assert(
      fc.property(orderStatusArb, orderStatusArb, (from, to) => {
        if (isValidTransition(from, to)) {
          const fromIndex = statusOrder.indexOf(from);
          const toIndex = statusOrder.indexOf(to);
          expect(toIndex).toBeGreaterThan(fromIndex);
        }
      })
    );
  });

  it('PROPERTY: No skip transitions exist (cannot jump over intermediate states)', () => {
    // PENDING -> COMPLETED should never be valid
    expect(isValidTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  it('PROPERTY: Sequential application of valid transitions reaches COMPLETED', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('PENDING' as const, 'PREPARING' as const),
        (startStatus) => {
          let current: OrderStatus = startStatus;
          let steps = 0;
          const maxSteps = 3;

          while (current !== 'COMPLETED' && steps < maxSteps) {
            const next = getNextStatus(current);
            if (next === null) break;
            current = next;
            steps++;
          }

          expect(current).toBe('COMPLETED');
          expect(steps).toBeLessThanOrEqual(2);
        }
      )
    );
  });
});
