// printer.types.ts
// Logical printers used by the venue.

export type Printer =
  | "kitchen-main"
  | "bar-main";

export interface PrintJob {
  printer: Printer;
  orderId: string;
  payload: string; // preformatted text / ESC-POS / HTML
}
