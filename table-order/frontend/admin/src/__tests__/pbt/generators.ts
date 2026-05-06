import fc from 'fast-check';
import type { Order, OrderItem, OrderStatus, Table } from '@/types';

export const orderStatusArb: fc.Arbitrary<OrderStatus> = fc.constantFrom(
  'PENDING' as const,
  'PREPARING' as const,
  'COMPLETED' as const
);

export const orderItemArb: fc.Arbitrary<OrderItem> = fc.record({
  menuId: fc.uuid(),
  menuName: fc.string({ minLength: 1, maxLength: 20 }),
  quantity: fc.integer({ min: 1, max: 99 }),
  unitPrice: fc.integer({ min: 1000, max: 100000 }),
  subtotal: fc.constant(0), // will be computed
}).map((item) => ({
  ...item,
  subtotal: item.quantity * item.unitPrice,
}));

export const orderArb: fc.Arbitrary<Order> = fc.record({
  id: fc.uuid(),
  orderNumber: fc.stringMatching(/^[0-9]{3,6}$/),
  tableId: fc.uuid(),
  tableNumber: fc.integer({ min: 1, max: 10 }),
  sessionId: fc.uuid(),
  items: fc.array(orderItemArb, { minLength: 1, maxLength: 10 }),
  totalAmount: fc.constant(0), // will be computed
  status: orderStatusArb,
  createdAt: fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') }).map((d) => d.toISOString()),
}).map((order) => ({
  ...order,
  totalAmount: order.items.reduce((sum, item) => sum + item.subtotal, 0),
}));

export const tableArb: fc.Arbitrary<Table> = fc.record({
  id: fc.uuid(),
  tableNumber: fc.integer({ min: 1, max: 10 }),
  sessionId: fc.option(fc.uuid(), { nil: null }),
  currentOrders: fc.array(orderArb, { minLength: 0, maxLength: 5 }),
  totalAmount: fc.constant(0), // will be computed
  lastOrderAt: fc.option(
    fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') }).map((d) => d.toISOString()),
    { nil: null }
  ),
  isHighlighted: fc.boolean(),
}).map((table) => ({
  ...table,
  totalAmount: table.currentOrders.reduce((sum, o) => sum + o.totalAmount, 0),
}));
