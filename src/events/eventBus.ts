type EventType = "RSVP_CREATED" | "TEAM_JOINED" | "NEW_MESSAGE";

type EventPayload = Record<string, any>;

type Handler = (payload: EventPayload) => void;

const listeners: Record<EventType, Handler[]> = {
  RSVP_CREATED: [],
  TEAM_JOINED: [],
  NEW_MESSAGE: [],
};

export const eventBus = {
  emit: (event: EventType, payload: EventPayload) => {
    listeners[event].forEach((handler) => handler(payload));
  },
  on: (event: EventType, handler: Handler) => {
    listeners[event].push(handler);
  },
};
