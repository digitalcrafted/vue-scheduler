import { ref, computed } from "vue";
import type { DateRange } from "../types";
import {
  parseDate,
  getPreviousPeriod,
  getNextPeriod,
  formatPeriodLabel,
  getDayRange,
  getWeekRange,
  getMonthRange,
  getYearRange,
} from "../utils/dateUtils";

export type ViewMode = "day" | "week" | "month" | "year";

export function useScheduler(
  initialDate?: string | Date | number,
  initialViewMode: ViewMode = "week",
  locale?: string
) {
  const currentDate = ref<Date>(
    initialDate ? parseDate(initialDate).toDate() : new Date()
  );
  const viewMode = ref<ViewMode>(initialViewMode);

  // Computed period label for header
  const periodLabel = computed(() => {
    return formatPeriodLabel(currentDate.value, viewMode.value, locale);
  });

  // Computed date range based on view mode
  const dateRange = computed<DateRange>(() => {
    switch (viewMode.value) {
      case "day":
        return getDayRange(currentDate.value);
      case "week":
        return getWeekRange(currentDate.value);
      case "month":
        return getMonthRange(currentDate.value);
      case "year":
        return getYearRange(currentDate.value);
    }
  });

  // Navigation functions
  const goToToday = () => {
    currentDate.value = new Date();
  };

  const goToPrevious = () => {
    currentDate.value = getPreviousPeriod(currentDate.value, viewMode.value);
  };

  const goToNext = () => {
    currentDate.value = getNextPeriod(currentDate.value, viewMode.value);
  };

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode;
  };

  const setCurrentDate = (date: Date) => {
    currentDate.value = date;
  };

  return {
    currentDate,
    viewMode,
    periodLabel,
    dateRange,
    goToToday,
    goToPrevious,
    goToNext,
    setViewMode,
    setCurrentDate,
  };
}
