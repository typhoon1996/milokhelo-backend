// Define event types with their corresponding payload interfaces
type EventType = "RSVP_CREATED" | "TEAM_JOINED" | "NEW_MESSAGE";

interface RSVPCreatedPayload {
  rsvpId: string;
  eventId: string;
  userId: string;
  status: "going" | "not_going" | "maybe";
}

interface TeamJoinedPayload {
  teamId: string;
  userId: string;
  role?: string;
}

interface NewMessagePayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

type EventPayloadMap = {
  RSVP_CREATED: RSVPCreatedPayload;
  TEAM_JOINED: TeamJoinedPayload;
  NEW_MESSAGE: NewMessagePayload;
};

type Handler<T> = (payload: T) => void;

type EventListeners = {
  [K in EventType]: Array<Handler<EventPayloadMap[K]>>;
};

const listeners: EventListeners = {
  RSVP_CREATED: [],
  TEAM_JOINED: [],
  NEW_MESSAGE: [],
};

export const eventBus = {
  /**
   * Emit an event with a strongly-typed payload
   * @param event The event type
   * @param payload The event payload matching the event type
   */
  emit: <T extends EventType>(event: T, payload: EventPayloadMap[T]) => {
    listeners[event].forEach((handler) => handler(payload));
  },

  /**
   * Register an event handler for a specific event type
   * @param event The event type to listen for
   * @param handler The handler function that will receive the typed payload
   */
  on: <T extends EventType>(event: T, handler: Handler<EventPayloadMap[T]>) => {
    // Type assertion is safe because we know the types will match at runtime
    (listeners[event] as Array<Handler<EventPayloadMap[T]>>).push(handler);
  },

  /**
   * Remove an event handler
   * @param event The event type
   * @param handler The handler function to remove
   */
  off: <T extends EventType>(event: T, handler: Handler<EventPayloadMap[T]>) => {
    const index = (listeners[event] as Array<Handler<EventPayloadMap[T]>>).indexOf(handler);
    if (index > -1) {
      listeners[event].splice(index, 1);
    }
  },
};
