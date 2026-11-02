export type OrderPlacedEvent = {
  eventId: string;
  eventType: "ORDER_PLACED";
  orderId: string;
  userId: string;
  amount: number;
  createdAt: string;
};

export const ORDER_PLACED_TOPIC = "order.placed";

export function parseOrderPlacedEvent(
  value: Buffer | null,
): OrderPlacedEvent {
  if (value === null) {
    throw new Error("Received an order event with a null message value");
  }

  const parsed: unknown = JSON.parse(value.toString("utf8"));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Order event payload must be a JSON object");
  }

  const event = parsed as Record<string, unknown>;
  if (
    event.eventType !== "ORDER_PLACED" ||
    typeof event.eventId !== "string" ||
    typeof event.orderId !== "string" ||
    typeof event.userId !== "string" ||
    typeof event.amount !== "number" ||
    !Number.isFinite(event.amount) ||
    typeof event.createdAt !== "string"
  ) {
    throw new Error("Order event payload does not match the ORDER_PLACED schema");
  }

  return {
    eventId: event.eventId,
    eventType: "ORDER_PLACED",
    orderId: event.orderId,
    userId: event.userId,
    amount: event.amount,
    createdAt: event.createdAt,
  };
}
