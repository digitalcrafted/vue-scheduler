import type { SchedulerEvent, ProcessedEvent, DateRange } from "../types";
import { parseDate, formatDateKey, startOfDay, endOfDay } from "./dateUtils";

/**
 * Process and normalize an event
 */
export function processEvent(event: SchedulerEvent): ProcessedEvent {
  const startDateObj = parseDate(event.start);
  const endDateObj = event.end ? parseDate(event.end) : startDateObj;

  const startDate = startDateObj.toDate();
  const endDate = endDateObj.toDate();

  // Check if it's an all-day event (no time component)
  // If the original input was a string without time, or if hours/minutes/seconds are all 0
  const startHasTime =
    startDateObj.hour() !== 0 ||
    startDateObj.minute() !== 0 ||
    startDateObj.second() !== 0;
  const endHasTime = event.end
    ? endDateObj.hour() !== 0 ||
      endDateObj.minute() !== 0 ||
      endDateObj.second() !== 0
    : false;
  const isAllDay = !startHasTime && !endHasTime;

  // Calculate duration in days
  const duration =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) || 1;

  return {
    ...event,
    startDate,
    endDate,
    isAllDay,
    duration,
  };
}

/**
 * Check if an event overlaps with a date range
 */
export function eventInRange(event: ProcessedEvent, range: DateRange): boolean {
  const eventStart = event.startDate;
  const eventEnd = event.endDate || event.startDate;

  // Event starts before range ends and ends after range starts
  return eventStart <= range.end && eventEnd >= range.start;
}

/**
 * Filter events by date range
 */
export function filterEventsByRange(
  events: ProcessedEvent[],
  range: DateRange
): ProcessedEvent[] {
  return events.filter((event) => eventInRange(event, range));
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(
  events: ProcessedEvent[],
  date: Date
): ProcessedEvent[] {
  const dayStart = startOfDay(date).toDate();
  const dayEnd = endOfDay(date).toDate();
  return filterEventsByRange(events, { start: dayStart, end: dayEnd });
}

/**
 * Check if an event spans multiple days
 */
export function isMultiDayEvent(event: ProcessedEvent): boolean {
  return event.duration > 1 || !isSameDay(event.startDate, event.endDate);
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2);
}

/**
 * Get the portion of an event that falls on a specific day
 */
export function getEventForDay(
  event: ProcessedEvent,
  date: Date
): ProcessedEvent | null {
  const dayStart = startOfDay(date).toDate();
  const dayEnd = endOfDay(date).toDate();

  // Event doesn't overlap with this day
  if (event.endDate < dayStart || event.startDate > dayEnd) {
    return null;
  }

  // Return a copy with adjusted dates for this day
  return {
    ...event,
    startDate: event.startDate > dayStart ? event.startDate : dayStart,
    endDate: event.endDate < dayEnd ? event.endDate : dayEnd,
  };
}

/**
 * Calculate event position and dimensions for day/week view
 */
export function calculateEventPosition(
  event: ProcessedEvent,
  dayStart: Date,
  hourHeight: number = 60
): { top: number; height: number } {
  const dayStartTime = startOfDay(dayStart).toDate();

  // If all-day event, place at top
  if (event.isAllDay) {
    return { top: 0, height: 30 };
  }

  const eventStart = event.startDate;
  const eventEnd = event.endDate || event.startDate;

  // Calculate minutes from start of day
  const startMinutes =
    (eventStart.getTime() - dayStartTime.getTime()) / (1000 * 60);
  const endMinutes =
    (eventEnd.getTime() - dayStartTime.getTime()) / (1000 * 60);

  // Calculate position (minutes * pixels per minute)
  const pixelsPerMinute = hourHeight / 60;
  const top = Math.max(0, startMinutes * pixelsPerMinute);
  const height = Math.max(20, (endMinutes - startMinutes) * pixelsPerMinute);

  return { top, height };
}

/**
 * Group events by day
 */
export function groupEventsByDay(
  events: ProcessedEvent[]
): Map<string, ProcessedEvent[]> {
  const grouped = new Map<string, ProcessedEvent[]>();

  events.forEach((event) => {
    let current = new Date(event.startDate);
    const end = new Date(event.endDate || event.startDate);

    while (current <= end) {
      const dayKey = formatDateKey(current);
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  });

  return grouped;
}
