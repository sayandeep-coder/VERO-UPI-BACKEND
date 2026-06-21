export type DomainEventName =
  | "USER_REGISTERED"
  | "USER_SESSION_CREATED"
  | "USER_DEVICE_REGISTERED"
  | "BANK_ACCOUNT_CREATED"
  | "UPI_ID_CREATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "BALANCE_UPDATED"
  | "GOAL_CREATED"
  | "GOAL_COMPLETED"
  | "AI_INSIGHT_GENERATED";

export interface DomainEvent<TPayload> {
  eventId: string;
  eventType: DomainEventName;
  eventVersion: number;
  occurredAt: string;
  correlationId: string;
  producer: string;
  payload: TPayload;
}

export interface UserRegisteredPayload {
  userId: string;
  mobileNumber: string;
  fullName: string | null;
  registeredAt: string;
}

export type UserRegisteredEvent = DomainEvent<UserRegisteredPayload> & {
  eventType: "USER_REGISTERED";
};
