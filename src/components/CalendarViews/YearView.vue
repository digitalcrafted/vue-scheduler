<template>
  <div class="h-full overflow-y-auto p-4">
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="month in months"
        :key="month.month"
        class="border rounded p-2"
      >
        <!-- Month header -->
        <div class="text-center font-semibold mb-2 text-sm">
          {{ month.name }}
        </div>

        <!-- Week day headers -->
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div
            v-for="dayName in weekDayNames"
            :key="dayName"
            class="text-xs text-center text-gray-600"
          >
            {{ dayName }}
          </div>
        </div>

        <!-- Month calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in month.days"
            :key="`${month.month}-${index}`"
            :class="[
              'text-xs p-1 min-h-[24px] flex items-center justify-center rounded',
              day.getTime() === 0
                ? 'bg-transparent'
                : isCurrentMonth(day, month.month)
                ? isTodayInMonth(day, month.month)
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-white text-gray-900'
                : 'bg-gray-50 text-gray-400',
              day.getTime() !== 0 && hasEvents(day)
                ? 'ring-1 ring-blue-300'
                : '',
            ]"
          >
            {{ day.getTime() !== 0 ? day.getDate() : "" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProcessedEvent } from "../../types";
import { getMonthDays } from "../../utils/dateUtils";
import { getEventsForDay } from "../../utils/eventUtils";

interface Props {
  date: Date;
  events: ProcessedEvent[];
}

const props = defineProps<Props>();

// Week day names (abbreviated)
const weekDayNames = ["M", "T", "W", "T", "F", "S", "S"];

// Month names
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Get all months in the year
const months = computed(() => {
  const year = props.date.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(year, i, 1);
    const days = getMonthDays(monthDate);
    // Pad to align first day of month
    const firstDay = days[0].getDay();
    const paddedDays = [];
    // Adjust for Monday as first day (ISO week)
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    for (let j = 0; j < padding; j++) {
      paddedDays.push(new Date(0)); // Placeholder dates
    }
    return {
      month: i,
      name: monthNames[i],
      days: [...paddedDays, ...days],
    };
  });
});

// Check if day is in the specified month
const isCurrentMonth = (day: Date, month: number): boolean => {
  if (day.getTime() === 0) return false;
  return day.getMonth() === month;
};

// Check if day is today and in the specified month
const isTodayInMonth = (day: Date, month: number): boolean => {
  const today = new Date();
  return (
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear() &&
    month === today.getMonth()
  );
};

// Check if day has events
const hasEvents = (day: Date): boolean => {
  if (day.getTime() === 0) return false;
  return getEventsForDay(props.events, day).length > 0;
};
</script>
