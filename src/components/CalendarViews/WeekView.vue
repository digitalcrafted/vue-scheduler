<template>
  <div class="h-full overflow-y-auto">
    <div class="relative">
      <!-- Day headers -->
      <div class="flex border-b bg-gray-50 sticky top-0 z-10">
        <div class="w-20 border-r"></div>
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="flex-1 border-r p-2 text-center text-sm font-medium text-gray-700"
        >
          <div>{{ formatDayName(day) }}</div>
          <div class="text-xs text-gray-600">{{ formatDayNumber(day) }}</div>
        </div>
      </div>

      <!-- All-day events bar -->
      <div v-if="hasAllDayEvents" class="flex border-b bg-gray-50 min-h-[40px]">
        <div class="w-20 border-r"></div>
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="flex-1 border-r p-1"
        >
          <div class="flex flex-wrap gap-1">
            <EventRenderer
              v-for="event in getDayAllDayEvents(day)"
              :key="event.id || `${event.label}-${day.toISOString()}`"
              :event="event"
            />
          </div>
        </div>
      </div>

      <!-- Time grid -->
      <div class="relative">
        <div class="absolute inset-0 flex">
          <!-- Time column -->
          <div class="w-20 border-r bg-gray-50">
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-16 border-b text-xs text-gray-600 p-2"
            >
              {{ formatHour(hour) }}
            </div>
          </div>

          <!-- Day columns -->
          <div
            v-for="day in weekDays"
            :key="day.toISOString()"
            class="flex-1 border-r relative"
          >
            <!-- Hour lines -->
            <div
              v-for="hour in hours"
              :key="hour"
              class="absolute w-full border-b border-gray-200"
              :style="{ top: `${hour * 64}px` }"
            ></div>

            <!-- Events for this day -->
            <div
              v-for="event in getDayTimedEvents(day)"
              :key="event.id || `${event.label}-${day.toISOString()}`"
              class="absolute left-0 right-0 px-1"
              :style="getEventStyle(event, day)"
            >
              <EventRenderer :event="event" />
            </div>

            <!-- Spacer for proper height -->
            <div :style="{ height: `${hours.length * 64}px` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProcessedEvent } from "../../types";
import {
  getEventsForDay,
  calculateEventPosition,
  getEventForDay,
} from "../../utils/eventUtils";
import { getWeekDays } from "../../utils/dateUtils";
import EventRenderer from "../EventRenderer.vue";

interface Props {
  date: Date;
  events: ProcessedEvent[];
}

const props = defineProps<Props>();

// Generate hours array (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i);

// Get week days
const weekDays = computed(() => {
  return getWeekDays(props.date);
});

// Format hour for display
const formatHour = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

// Format day name
const formatDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

// Format day number
const formatDayNumber = (date: Date): string => {
  return date.getDate().toString();
};

// Get all-day events for a specific day
const getDayAllDayEvents = (day: Date): ProcessedEvent[] => {
  const dayEvents = getEventsForDay(props.events, day);
  return dayEvents.filter((e) => e.isAllDay);
};

// Get timed events for a specific day
const getDayTimedEvents = (day: Date): ProcessedEvent[] => {
  const dayEvents = getEventsForDay(props.events, day);
  return dayEvents.filter((e) => !e.isAllDay);
};

// Check if there are any all-day events
const hasAllDayEvents = computed(() => {
  return weekDays.value.some((day) => getDayAllDayEvents(day).length > 0);
});

// Calculate event position style
const getEventStyle = (event: ProcessedEvent, day: Date) => {
  // Get the portion of event for this day
  const dayEvent = getEventForDay(event, day);
  if (!dayEvent) return { display: "none" };

  const position = calculateEventPosition(dayEvent, day, 64);
  return {
    top: `${position.top}px`,
    height: `${position.height}px`,
  };
};
</script>
