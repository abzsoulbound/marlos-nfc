import type { Order } from "./order.types";
import type { PrintJob } from "./printer.types";
import { getFulfillmentArea } from "./fulfillment.utils";
import { PRINTER_BY_AREA } from "./printer.map";

export function buildPrintJobs(order: Order): PrintJob[] {
  const jobs: PrintJob[] = [];
  const byArea: Record<"kitchen" | "bar", string[]> = {
    kitchen: [],
    bar: [],
  };

  for (const item of order.cart.items) {
    const area = getFulfillmentArea(item.itemId);
    byArea[area].push(item.quantity + "x " + item.name);
}

  (Object.keys(byArea) as Array<"kitchen" | "bar">).forEach((area) => {
    if (!byArea[area].length) return;

    jobs.push({
      printer: PRINTER_BY_AREA[area],
      orderId: order.id,
      payload: byArea[area].join("\n"),
    });
  });

  return jobs;
}
