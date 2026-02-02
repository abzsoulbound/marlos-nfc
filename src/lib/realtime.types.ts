export type RealtimeEvent<T> = {
  type: string;
  channel: "kitchen" | "bar" | "admin";
  payload: T;
  timestamp: string;
};
