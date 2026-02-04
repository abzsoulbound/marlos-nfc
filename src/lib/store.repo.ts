// store.repo.ts
// Concrete repos used by the app.

import { MemoryStore } from "./store.memory";
import type { Order } from "./order.types";
import type { Bill } from "./bill.types";
import type { Session } from "./session.types";

export const orderStore = new MemoryStore<Order>();
export const billStore = new MemoryStore<Bill>();
export const sessionStore = new MemoryStore<Session>();
