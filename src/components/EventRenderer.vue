<template>
  <div
    :style="{
      backgroundColor: event.bgColor || '#3498db',
      color: textColor,
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '12px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'default',
    }"
    :title="eventTooltip"
    class="event-item"
  >
    {{ event.label }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProcessedEvent } from "../types";
import { parseDate } from "../utils/dateUtils";

interface Props {
  event: ProcessedEvent;
}

const props = defineProps<Props>();

// Calculate text color based on background color brightness
const textColor = computed(() => {
  const bgColor = props.event.bgColor || "#3498db";
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? "#000000" : "#ffffff";
});

// Tooltip with event details
const eventTooltip = computed(() => {
  const start = parseDate(props.event.start);
  const end = props.event.end ? parseDate(props.event.end) : start;

  if (props.event.isAllDay) {
    if (props.event.duration > 1) {
      return `${props.event.label} - ${start.format("MMM D")} to ${end.format(
        "MMM D, YYYY"
      )}`;
    }
    return `${props.event.label} - ${start.format("MMM D, YYYY")}`;
  }

  const timeRange = `${start.format("h:mm A")} - ${end.format("h:mm A")}`;
  if (props.event.duration > 1) {
    return `${props.event.label} - ${start.format("MMM D")} to ${end.format(
      "MMM D"
    )}, ${timeRange}`;
  }
  return `${props.event.label} - ${start.format("MMM D, YYYY")}, ${timeRange}`;
});
</script>
