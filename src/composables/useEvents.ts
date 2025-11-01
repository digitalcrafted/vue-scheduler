import { ref, watch, computed, type Ref } from "vue";
import type { SchedulerEvent, ProcessedEvent, DateRange } from "../types";
import { processEvent, filterEventsByRange } from "../utils/eventUtils";

export function useEvents(
  eventsInput:
    | SchedulerEvent[]
    | ((params: {
        dateRange: DateRange;
        setEvents: (events: SchedulerEvent[]) => void;
      }) => void),
  dateRange: Ref<DateRange>
) {
  const events = ref<ProcessedEvent[]>([]);
  const loading = ref(false);

  // Check if events is a function (dynamic loading)
  const isDynamic = typeof eventsInput === "function";

  // Load events function
  const loadEvents = async () => {
    if (!isDynamic) {
      // Static array - process all events
      events.value = (eventsInput as SchedulerEvent[]).map(processEvent);
      return;
    }

    // Dynamic loading
    loading.value = true;
    try {
      const eventFn = eventsInput as (params: {
        dateRange: DateRange;
        setEvents: (events: SchedulerEvent[]) => void;
      }) => void;

      eventFn({
        dateRange: dateRange.value,
        setEvents: (newEvents: SchedulerEvent[]) => {
          events.value = newEvents.map(processEvent);
          loading.value = false;
        },
      });
    } catch (error) {
      console.error("Error loading events:", error);
      loading.value = false;
    }
  };

  // Filter events by current date range
  const visibleEvents = computed(() => {
    return filterEventsByRange(events.value, dateRange.value);
  });

  // Watch date range changes for dynamic loading
  if (isDynamic) {
    watch(
      dateRange,
      () => {
        loadEvents();
      },
      { deep: true }
    );
  }

  // Initial load
  loadEvents();

  return {
    events,
    visibleEvents,
    loading,
    reload: loadEvents,
  };
}
