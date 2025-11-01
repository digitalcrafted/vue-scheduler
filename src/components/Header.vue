<template>
  <div class="flex items-center justify-between p-4 border-b bg-white">
    <!-- Left: Navigation buttons -->
    <div class="flex items-center gap-2">
      <button
        @click="$emit('previous')"
        class="px-3 py-1 border rounded hover:bg-gray-50 text-gray-700"
        type="button"
      >
        &lt;
      </button>
      <button
        @click="$emit('today')"
        class="px-3 py-1 border rounded hover:bg-gray-50 text-gray-700 text-sm"
        type="button"
      >
        {{ todayLabel }}
      </button>
      <button
        @click="$emit('next')"
        class="px-3 py-1 border rounded hover:bg-gray-50 text-gray-700"
        type="button"
      >
        &gt;
      </button>
    </div>

    <!-- Center: Period label -->
    <div class="flex-1 text-center">
      <h4 class="text-lg font-semibold text-gray-900">{{ periodLabel }}</h4>
    </div>

    <!-- Right: View mode toggle -->
    <div v-if="!hideViewModeSelector" class="flex items-center gap-2">
      <label
        v-for="mode in viewModes"
        :key="mode.value"
        class="flex items-center cursor-pointer"
      >
        <input
          type="radio"
          :value="mode.value"
          :checked="currentViewMode === mode.value"
          @change="$emit('viewModeChange', mode.value)"
          class="mr-1"
        />
        <span class="text-sm text-gray-700">{{ mode.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from "../composables/useScheduler";

interface Props {
  periodLabel: string;
  currentViewMode: ViewMode;
  todayLabel?: string;
  hideViewModeSelector?: boolean;
}

withDefaults(defineProps<Props>(), {
  todayLabel: "today",
  hideViewModeSelector: false,
});

defineEmits<{
  previous: [];
  today: [];
  next: [];
  viewModeChange: [mode: ViewMode];
}>();

const viewModes: { value: ViewMode; label: string }[] = [
  { value: "day", label: "day" },
  { value: "week", label: "week" },
  { value: "month", label: "month" },
  { value: "year", label: "year" },
];
</script>
