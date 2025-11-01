<template>
  <div class="h-full overflow-y-auto">
    <!-- Week day headers -->
    <div class="grid grid-cols-7 border-b bg-gray-50 sticky top-0 z-10">
      <div
        v-for="dayName in weekDayNames"
        :key="dayName"
        class="p-2 text-center text-sm font-medium text-gray-700 border-r last:border-r-0"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7">
      <div
        v-for="day in monthDays"
        :key="day.toISOString()"
        :class="[
          'min-h-[100px] border-b border-r p-2',
          isCurrentMonth(day) ? 'bg-white' : 'bg-gray-50',
          isToday(day) ? 'ring-2 ring-blue-500' : '',
        ]"
      >
        <!-- Day number -->
        <div
          :class="[
            'text-sm mb-1',
            isCurrentMonth(day) ? 'text-gray-900' : 'text-gray-400',
            isToday(day) ? 'font-bold text-blue-600' : '',
          ]"
        >
          {{ day.getDate() }}
        </div>

        <!-- Events for this day -->
        <div class="space-y-1">
          <EventRenderer
            v-for="(event, index) in getDayEvents(day).slice(0, 3)"
            :key="event.id || `${event.label}-${day.toISOString()}-${index}`"
            :event="event"
          />
          <div
            v-if="getDayEvents(day).length > 3"
            class="text-xs text-gray-500 mt-1"
          >
            +{{ getDayEvents(day).length - 3 }} more
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProcessedEvent } from "../../types";
import { getEventsForDay, getEventForDay } from "../../utils/eventUtils";
import { getMonthDays } from "../../utils/dateUtils";
import EventRenderer from "../EventRenderer.vue";

interface Props {
  date: Date;
  events: ProcessedEvent[];
}

const props = defineProps<Props>();

// Week day names
const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Get all days in the month (including padding)
const monthDays = computed(() => {
  return getMonthDays(props.date);
});

// Check if day is in current month
const isCurrentMonth = (day: Date): boolean => {
  return (
    day.getMonth() === props.date.getMonth() &&
    day.getFullYear() === props.date.getFullYear()
  );
};

// Check if day is today
const isToday = (day: Date): boolean => {
  const today = new Date();
  return (
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear()
  );
};

// Get events for a specific day
const getDayEvents = (day: Date): ProcessedEvent[] => {
  // Get events that fall on this day
  const dayEvents = getEventsForDay(props.events, day);

  // For each event, get the portion that falls on this day
  return dayEvents
    .map((event) => getEventForDay(event, day))
    .filter((e): e is ProcessedEvent => e !== null);
};
</script>
