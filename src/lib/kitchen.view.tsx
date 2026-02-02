"use client";

import React from "react";
import { markItemDelivered } from "./kitchen.store";

export function KitchenView({
  session,
  staffId,
}: {
  session: any;
  staffId: string;
}) {
  const feed = session.feed;

  return (
    <div>
      {feed.map(
        ({ orderId, item }: { orderId: string; item: any }) => (
          <div key={item.id}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <button
              onClick={() =>
                markItemDelivered(
                  session.id,
                  orderId,
                  item.id,
                  staffId
                )
              }
            >
              Delivered
            </button>
          </div>
        )
      )}
    </div>
  );
}
