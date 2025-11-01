import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

export type DateInput = string | Date | number | Dayjs;

/**
 * Parse a date input into a dayjs object
 */
export function parseDate(input: DateInput): Dayjs {
  return dayjs(input);
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateKey(date: DateInput): string {
  return parseDate(date).format("YYYY-MM-DD");
}

/**
 * Format a date with time as YYYY-MM-DD HH:mm
 */
export function formatDateTime(date: DateInput): string {
  return parseDate(date).format("YYYY-MM-DD HH:mm");
}

/**
 * Get the start of a day
 */
export function startOfDay(date: DateInput): Dayjs {
  return parseDate(date).startOf("day");
}

/**
 * Get the end of a day
 */
export function endOfDay(date: DateInput): Dayjs {
  return parseDate(date).endOf("day");
}

/**
 * Get the start of a week (Monday)
 */
export function startOfWeek(date: DateInput): Dayjs {
  return parseDate(date).startOf("isoWeek");
}

/**
 * Get the end of a week (Sunday)
 */
export function endOfWeek(date: DateInput): Dayjs {
  return parseDate(date).endOf("isoWeek");
}

/**
 * Get the start of a month
 */
export function startOfMonth(date: DateInput): Dayjs {
  return parseDate(date).startOf("month");
}

/**
 * Get the end of a month
 */
export function endOfMonth(date: DateInput): Dayjs {
  return parseDate(date).endOf("month");
}

/**
 * Get the start of a year
 */
export function startOfYear(date: DateInput): Dayjs {
  return parseDate(date).startOf("year");
}

/**
 * Get the end of a year
 */
export function endOfYear(date: DateInput): Dayjs {
  return parseDate(date).endOf("year");
}

/**
 * Get date range for a day view
 */
export function getDayRange(date: DateInput): { start: Date; end: Date } {
  const day = parseDate(date);
  return {
    start: day.startOf("day").toDate(),
    end: day.endOf("day").toDate(),
  };
}

/**
 * Get date range for a week view
 */
export function getWeekRange(date: DateInput): { start: Date; end: Date } {
  const week = parseDate(date);
  return {
    start: week.startOf("isoWeek").toDate(),
    end: week.endOf("isoWeek").toDate(),
  };
}

/**
 * Get date range for a month view
 */
export function getMonthRange(date: DateInput): { start: Date; end: Date } {
  const month = parseDate(date);
  return {
    start: month.startOf("month").toDate(),
    end: month.endOf("month").toDate(),
  };
}

/**
 * Get date range for a year view
 */
export function getYearRange(date: DateInput): { start: Date; end: Date } {
  const year = parseDate(date);
  return {
    start: year.startOf("year").toDate(),
    end: year.endOf("year").toDate(),
  };
}

/**
 * Get previous period based on view mode
 */
export function getPreviousPeriod(
  date: DateInput,
  viewMode: "day" | "week" | "month" | "year"
): Date {
  const d = parseDate(date);
  switch (viewMode) {
    case "day":
      return d.subtract(1, "day").toDate();
    case "week":
      return d.subtract(1, "week").toDate();
    case "month":
      return d.subtract(1, "month").toDate();
    case "year":
      return d.subtract(1, "year").toDate();
  }
}

/**
 * Get next period based on view mode
 */
export function getNextPeriod(
  date: DateInput,
  viewMode: "day" | "week" | "month" | "year"
): Date {
  const d = parseDate(date);
  switch (viewMode) {
    case "day":
      return d.add(1, "day").toDate();
    case "week":
      return d.add(1, "week").toDate();
    case "month":
      return d.add(1, "month").toDate();
    case "year":
      return d.add(1, "year").toDate();
  }
}

/**
 * Format period label for header
 */
export function formatPeriodLabel(
  date: DateInput,
  viewMode: "day" | "week" | "month" | "year",
  locale?: string
): string {
  const d = parseDate(date);

  if (locale) {
    dayjs.locale(locale);
  }

  switch (viewMode) {
    case "day":
      return d.format("MMMM D, YYYY");
    case "week":
      const weekStart = d.startOf("isoWeek");
      const weekEnd = d.endOf("isoWeek");
      if (weekStart.month() === weekEnd.month()) {
        return `Week of ${weekStart.format("MMM D")} - ${weekEnd.format(
          "D, YYYY"
        )}`;
      }
      return `Week of ${weekStart.format("MMM D")} - ${weekEnd.format(
        "MMM D, YYYY"
      )}`;
    case "month":
      return d.format("MMMM YYYY");
    case "year":
      return d.format("YYYY");
  }
}

/**
 * Get all days in a week
 */
export function getWeekDays(date: DateInput): Date[] {
  const weekStart = startOfWeek(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(weekStart.add(i, "day").toDate());
  }
  return days;
}

/**
 * Get all days in a month (including padding for calendar grid)
 */
export function getMonthDays(date: DateInput): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = monthStart.startOf("isoWeek");
  const calendarEnd = monthEnd.endOf("isoWeek");

  const days: Date[] = [];
  let current = calendarStart;
  while (current.isBefore(calendarEnd) || current.isSame(calendarEnd, "day")) {
    days.push(current.toDate());
    current = current.add(1, "day");
  }
  return days;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  return parseDate(date1).isSame(parseDate(date2), "day");
}

/**
 * Check if a date is within a range
 */
export function isInRange(
  date: DateInput,
  start: DateInput,
  end: DateInput
): boolean {
  const d = parseDate(date);
  return (
    (d.isAfter(startOfDay(start)) || d.isSame(startOfDay(start))) &&
    (d.isBefore(endOfDay(end)) || d.isSame(endOfDay(end)))
  );
}
