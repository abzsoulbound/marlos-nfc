import { getFulfillmentArea } from "./fulfillment.utils";

export type PrintTarget = "KITCHEN" | "BAR";

type AnyOrder = {
  items?: Array<{ itemId: string } & Record<string, any>>;
  cart?: { items: Array<{ itemId: string } & Record<string, any>> };
};

export function derivePrintTargets(order: AnyOrder): PrintTarget[] {
  const targets = new Set<PrintTarget>();

  const items =
    order.items ??
    order.cart?.items ??
    [];

  for (const item of items) {
    const area = getFulfillmentArea(item.itemId);
    if (area === "bar") targets.add("BAR");
    else targets.add("KITCHEN");
  }

  return Array.from(targets);
}

// Back-compat alias if other files import a different name
export const getPrintTargets = derivePrintTargets;
