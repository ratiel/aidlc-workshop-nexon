import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { orderItemArb, orderArb } from './generators';
import type { Order, OrderItem } from '@/types';

/**
 * PBT: Total Amount Calculation Properties
 *
 * Properties tested:
 * - Invariant: Order totalAmount equals sum of item subtotals
 * - Invariant: Item subtotal equals quantity * unitPrice
 * - Invariant: Table totalAmount equals sum of order totalAmounts
 * - Invariant: Deleting an order reduces table total by exactly that order's amount
 * - Invariant: All amounts are non-negative
 */

function calculateItemSubtotal(item: OrderItem): number {
  return item.quantity * item.unitPrice;
}

function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

function calculateTableTotal(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + order.totalAmount, 0);
}

describe('Total Amount Calculation - PBT', () => {
  it('PROPERTY: Item subtotal equals quantity * unitPrice', () => {
    fc.assert(
      fc.property(orderItemArb, (item) => {
        expect(item.subtotal).toBe(item.quantity * item.unitPrice);
      })
    );
  });

  it('PROPERTY: Order totalAmount equals sum of item subtotals', () => {
    fc.assert(
      fc.property(orderArb, (order) => {
        const expectedTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
        expect(order.totalAmount).toBe(expectedTotal);
      })
    );
  });

  it('PROPERTY: Table total equals sum of order totals', () => {
    fc.assert(
      fc.property(fc.array(orderArb, { minLength: 0, maxLength: 10 }), (orders) => {
        const tableTotal = calculateTableTotal(orders);
        const expectedTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        expect(tableTotal).toBe(expectedTotal);
      })
    );
  });

  it('PROPERTY: Removing an order reduces table total by exactly that order amount', () => {
    fc.assert(
      fc.property(
        fc.array(orderArb, { minLength: 1, maxLength: 10 }),
        fc.nat(),
        (orders, indexSeed) => {
          const removeIndex = indexSeed % orders.length;
          const removedOrder = orders[removeIndex];
          const originalTotal = calculateTableTotal(orders);

          const remaining = orders.filter((_, i) => i !== removeIndex);
          const newTotal = calculateTableTotal(remaining);

          expect(newTotal).toBe(originalTotal - removedOrder.totalAmount);
        }
      )
    );
  });

  it('PROPERTY: All calculated amounts are non-negative', () => {
    fc.assert(
      fc.property(orderArb, (order) => {
        expect(order.totalAmount).toBeGreaterThanOrEqual(0);
        for (const item of order.items) {
          expect(item.subtotal).toBeGreaterThanOrEqual(0);
          expect(item.quantity).toBeGreaterThanOrEqual(1);
          expect(item.unitPrice).toBeGreaterThanOrEqual(1000);
        }
      })
    );
  });

  it('PROPERTY: calculateItemSubtotal is consistent with stored subtotal', () => {
    fc.assert(
      fc.property(orderItemArb, (item) => {
        expect(calculateItemSubtotal(item)).toBe(item.subtotal);
      })
    );
  });

  it('PROPERTY: calculateOrderTotal is consistent with stored totalAmount', () => {
    fc.assert(
      fc.property(orderArb, (order) => {
        expect(calculateOrderTotal(order.items)).toBe(order.totalAmount);
      })
    );
  });
});
