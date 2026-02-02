/**
 * DOMAIN INVARIANTS (LOCKED)
 *
 * - NFC tags bind to physical table units
 * - Units may share one display table number
 * - Orders snapshot display number at creation
 * - Kitchen never owns orders
 * - Printer is the source of truth
 * - FIFO order is sacred
 * - Printer may be paused, orders buffer
 */

export type TableUnitSize = 2 | 4;

export interface TableUnit {
  unitId: string;        // Physical identity (NFC tag ID)
  size: TableUnitSize;  // 2 or 4 seats
  displayNumber: number | null; // Assigned by staff
}

export interface OrderSnapshot {
  orderId: string;
  displayNumber: number;
  createdAt: number;
}
