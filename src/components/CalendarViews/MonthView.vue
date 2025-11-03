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
    <div class="grid grid-cols-7 relative">
      <!-- Day cells -->
      <div
        v-for="(day, dayIndex) in monthDays"
        :key="day.toISOString()"
        :class="[
          'min-h-[100px] border-b border-r p-2 relative',
          isCurrentMonth(day) ? 'bg-white' : 'bg-gray-50',
          isToday(day) ? 'ring-2 ring-blue-500' : '',
        ]"
        style="overflow: visible"
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

        <!-- Events container for this day -->
        <div class="space-y-1 relative" style="overflow: visible; z-index: 10">
          <!-- Single-day events and start of multi-day events -->
          <div
            v-for="eventInfo in getDayEventInfo(day, dayIndex)"
            :key="eventInfo.key"
            :style="eventInfo.spanStyle"
            :class="eventInfo.spanClass"
          >
            <EventRenderer :event="eventInfo.event" />
          </div>
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
import {
  getEventsForDay,
  getEventForDay,
  isMultiDayEvent,
} from "../../utils/eventUtils";
import { getMonthDays, formatDateKey, isSameDay } from "../../utils/dateUtils";
import EventRenderer from "../EventRenderer.vue";

interface Props {
  date: Date;
  events: ProcessedEvent[];
}

interface EventInfo {
  event: ProcessedEvent;
  key: string;
  spanStyle: Record<string, string>;
  spanClass: string;
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


// Get event info with span calculations for multi-day events
const getDayEventInfo = (
  day: Date,
  dayIndex: number
): EventInfo[] => {
  const dayEvents = getEventsForDay(props.events, day);
  const eventInfos: EventInfo[] = [];

  dayEvents.forEach((event, index) => {
    const eventKey = String(event.id || `${event.label}-${formatDateKey(day)}-${index}`);
    
    // Check if this is a multi-day event
    if (isMultiDayEvent(event)) {
      // Check if this day is the start of the event in the visible month
      const eventStartDate = new Date(event.startDate);
      eventStartDate.setHours(0, 0, 0, 0);
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);
      
      // Only render if this is the start day of the event (or the event starts before visible month)
      const isEventStart = isSameDay(event.startDate, day) || 
        (eventStartDate < monthDays.value[0] && dayIndex === 0);
      
      if (isEventStart) {
        // Calculate span across days
        const spanInfo = calculateEventSpan(event, dayIndex);
        
        if (spanInfo.span > 0 && spanInfo.span <= 7) {
          // Calculate width to span across multiple cells
          // Since we're inside a cell, 100% = cell width
          // To span N cells, we need width = 100% * N
          // We also need to account for borders between cells (1px each)
          const borderWidth = 1; // 1px border between cells  
          const totalBorders = (spanInfo.span - 1) * borderWidth;
          
          // Width is cell width * number of cells, plus borders
          const widthCalc = spanInfo.span > 1 
            ? `calc(${spanInfo.span} * 100% + ${totalBorders}px)`
            : '100%';
          
          eventInfos.push({
            event,
            key: eventKey,
            spanStyle: {
              width: widthCalc,
              marginRight: spanInfo.span > 1 ? `-${totalBorders}px` : '0',
              position: 'relative',
              zIndex: '5',
            },
            spanClass: "",
          });
        }
      }
    } else {
      // Single-day event - render normally
      eventInfos.push({
        event,
        key: eventKey,
        spanStyle: {},
        spanClass: "",
      });
    }
  });

  return eventInfos.slice(0, 3); // Limit to 3 events per day
};

// Calculate how many cells an event should span
const calculateEventSpan = (
  event: ProcessedEvent,
  startDayIndex: number
): { span: number; startIndex: number } => {
  const eventStart = new Date(event.startDate);
  eventStart.setHours(0, 0, 0, 0);
  const eventEnd = new Date(event.endDate);
  eventEnd.setHours(23, 59, 59, 999);
  
  // Find the actual start index in monthDays
  let actualStartIndex = startDayIndex;
  if (eventStart < monthDays.value[0]) {
    actualStartIndex = 0;
  } else {
    for (let i = 0; i < monthDays.value.length; i++) {
      if (isSameDay(monthDays.value[i], eventStart)) {
        actualStartIndex = i;
        break;
      }
    }
  }
  
  // Calculate how many days the event spans within the visible month
  let span = 1;
  for (let i = actualStartIndex + 1; i < monthDays.value.length; i++) {
    const currentDay = monthDays.value[i];
    const dayStart = new Date(currentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDay);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Check if event overlaps with this day
    if (eventStart <= dayEnd && eventEnd >= dayStart) {
      span++;
    } else {
      break;
    }
  }
  
  // Don't span beyond the current row (7 columns)
  const rowStart = Math.floor(actualStartIndex / 7) * 7;
  const rowEnd = rowStart + 7;
  const maxSpan = rowEnd - actualStartIndex;
  
  return {
    span: Math.min(span, maxSpan),
    startIndex: actualStartIndex,
  };
};
</script>
