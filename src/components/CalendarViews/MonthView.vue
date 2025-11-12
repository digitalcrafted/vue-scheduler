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
      // For multi-day events, render a segment on each row they appear in
      const rowStart = Math.floor(dayIndex / 7) * 7;
      const rowEnd = rowStart + 7;
      
      // Check if event is active on this day
      const eventStartDate = new Date(event.startDate);
      eventStartDate.setHours(0, 0, 0, 0);
      const eventEndDate = new Date(event.endDate);
      eventEndDate.setHours(23, 59, 59, 999);
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);
      
      const eventStartsBeforeOrOnDay = eventStartDate <= dayDate;
      const eventEndsAfterOrOnDay = eventEndDate >= dayDate;
      const eventIsActive = eventStartsBeforeOrOnDay && eventEndsAfterOrOnDay;
      
      // Determine if this is the start day of a row segment for this event
      // This is either:
      // 1. The row start day, if event started before this row
      // 2. The actual event start day, if it starts within this row
      let isRowSegmentStart = false;
      if (eventIsActive) {
        if (eventStartDate < new Date(monthDays.value[rowStart])) {
          // Event started before this row - render from row start
          isRowSegmentStart = dayIndex === rowStart;
        } else {
          // Event starts within this row - render from actual start day
          isRowSegmentStart = isSameDay(event.startDate, day);
        }
      }
      
      // Render a segment starting from the appropriate day
      if (isRowSegmentStart) {
        // Calculate span for this row (up to end of row or end of event)
        const spanInfo = calculateEventSpanForRow(event, dayIndex);
        
        if (spanInfo.span > 0) {
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
            key: `${eventKey}-row-${Math.floor(dayIndex / 7)}`,
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

// Calculate how many cells an event should span for a specific row
const calculateEventSpanForRow = (
  event: ProcessedEvent,
  rowStartIndex: number
): { span: number; startIndex: number } => {
  const eventStart = new Date(event.startDate);
  eventStart.setHours(0, 0, 0, 0);
  const eventEnd = new Date(event.endDate);
  eventEnd.setHours(23, 59, 59, 999);
  
  const rowStart = Math.floor(rowStartIndex / 7) * 7;
  const rowEnd = rowStart + 7;
  
  // Determine the actual start index for this row
  // If event starts before this row, start from row start
  // If event starts within this row, start from event start
  let actualStartIndex = rowStart;
  const rowStartDate = new Date(monthDays.value[rowStart]);
  rowStartDate.setHours(0, 0, 0, 0);
  
  if (eventStart >= rowStartDate) {
    // Event starts within this row, find the exact day
    for (let i = rowStart; i < rowEnd && i < monthDays.value.length; i++) {
      if (isSameDay(monthDays.value[i], eventStart)) {
        actualStartIndex = i;
        break;
      }
    }
  }
  
  // Calculate span from actualStartIndex to end of row or end of event
  let span = 1;
  for (let i = actualStartIndex + 1; i < rowEnd && i < monthDays.value.length; i++) {
    const currentDay = monthDays.value[i];
    const dayStart = new Date(currentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDay);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Check if event still overlaps with this day
    if (eventStart <= dayEnd && eventEnd >= dayStart) {
      span++;
    } else {
      // Event ends before this day, stop spanning
      break;
    }
  }
  
  // Ensure we don't exceed the row boundary
  const maxSpan = rowEnd - actualStartIndex;
  
  return {
    span: Math.min(span, maxSpan),
    startIndex: actualStartIndex,
  };
};
</script>
