<template>
  <div class="vue-scheduler flex flex-col h-full">
    <Header
      :period-label="periodLabel"
      :current-view-mode="viewMode"
      :today-label="todayLabel"
      :hide-view-mode-selector="props.hideViewModeSelector"
      @previous="goToPrevious"
      @today="goToToday"
      @next="goToNext"
      @view-mode-change="setViewMode"
    />

    <div class="flex-1 relative overflow-hidden">
      <DayView
        v-if="viewMode === 'day'"
        :date="currentDate"
        :events="visibleEvents"
      />
      <WeekView
        v-else-if="viewMode === 'week'"
        :date="currentDate"
        :events="visibleEvents"
      />
      <MonthView
        v-else-if="viewMode === 'month'"
        :date="currentDate"
        :events="visibleEvents"
      />
      <YearView
        v-else-if="viewMode === 'year'"
        :date="currentDate"
        :events="visibleEvents"
      />
    </div>

    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
    >
      <div class="text-gray-600">Loading events...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import type { SchedulerProps } from "../types";
import { useScheduler, type ViewMode } from "../composables/useScheduler";
import { useEvents } from "../composables/useEvents";
import Header from "./Header.vue";
import DayView from "./CalendarViews/DayView.vue";
import WeekView from "./CalendarViews/WeekView.vue";
import MonthView from "./CalendarViews/MonthView.vue";
import YearView from "./CalendarViews/YearView.vue";

const props = withDefaults(defineProps<SchedulerProps>(), {
  viewMode: "week",
  dateLocale: undefined,
  translations: () => ({}),
  hideViewModeSelector: false,
});

const {
  currentDate,
  viewMode,
  periodLabel,
  dateRange,
  goToToday,
  goToPrevious,
  goToNext,
  setViewMode: setViewModeInternal,
} = useScheduler(props.initialDate, props.viewMode, props.dateLocale);

const { visibleEvents, loading } = useEvents(props.events, dateRange);

// Watch for external viewMode changes
watch(
  () => props.viewMode,
  (newMode) => {
    if (newMode && newMode !== viewMode.value) {
      setViewModeInternal(newMode);
    }
  }
);

// Get today label from translations
const todayLabel = computed(() => {
  return props.translations?.["header.today"] || "today";
});

const setViewMode = (mode: ViewMode) => {
  setViewModeInternal(mode);
};
</script>
