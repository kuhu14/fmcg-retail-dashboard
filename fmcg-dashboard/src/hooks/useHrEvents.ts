"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CompanyEvent,
  type CompanyEventType,
  addCustomEvent,
  getAllEvents,
  onEventsChanged,
  removeCustomEvent,
} from "@/lib/hrEvents";

export function useHrEvents() {
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEvents(getAllEvents());
    setReady(true);
    return onEventsChanged(() => setEvents(getAllEvents()));
  }, []);

  const addEvent = useCallback((input: { date: string; name: string; type: CompanyEventType }) => {
    addCustomEvent(input);
    setEvents(getAllEvents());
  }, []);

  const removeEvent = useCallback((id: string) => {
    removeCustomEvent(id);
    setEvents(getAllEvents());
  }, []);

  return { events, ready, addEvent, removeEvent };
}
