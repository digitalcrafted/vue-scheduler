<template>
  <div class="h-full overflow-y-auto">
    <div class="relative">
      <!-- Time slots -->
      <div class="absolute left-0 top-0 w-20 border-r bg-gray-50">
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-16 border-b text-xs text-gray-600 p-2"
        >
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- All-day events bar -->
      <div
        v-if="allDayEvents.length > 0"
        class="ml-20 border-b bg-gray-50 p-2 min-h-[40px]"
      >
        <div class="flex flex-wrap gap-1">
          <EventRenderer
            v-for="event in allDayEvents"
            :key="event.id || event.label"
            :event="event"
          />
        </div>
      </div>

      <!-- Time grid -->
      <div class="ml-20 relative">
        <div class="absolute inset-0">
          <!-- Hour lines -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="absolute w-full border-b border-gray-200"
            :style="{ top: `${hour * 64}px` }"
          ></div>

          <!-- Events -->
          <div
            v-for="event in timedEvents"
            :key="event.id || event.label"
            class="absolute left-0 right-0 px-1"
            :style="getEventStyle(event)"
          >
            <EventRenderer :event="event" />
          </div>
        </div>

        <!-- Spacer for proper height -->
        <div :style="{ height: `${hours.length * 64}px` }"></div>
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
} from "../../utils/eventUtils";
import EventRenderer from "../EventRenderer.vue";

interface Props {
  date: Date;
  events: ProcessedEvent[];
}

const props = defineProps<Props>();

// Generate hours array (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i);

// Format hour for display
const formatHour = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

// Get events for this day
const dayEvents = computed(() => {
  return getEventsForDay(props.events, props.date);
});

// Separate all-day and timed events
const allDayEvents = computed(() => {
  return dayEvents.value.filter((e) => e.isAllDay);
});

const timedEvents = computed(() => {
  return dayEvents.value.filter((e) => !e.isAllDay);
});

// Calculate event position style
const getEventStyle = (event: ProcessedEvent) => {
  const position = calculateEventPosition(
    event,
    props.date,
    64 // 64px per hour (4rem)
  );
  return {
    top: `${position.top}px`,
    height: `${position.height}px`,
  };
};
</script>
