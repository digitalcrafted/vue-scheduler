import "./styles.css";
import Scheduler from "./components/Scheduler.vue";
import { useScheduler } from "./composables/useScheduler";
import { useEvents } from "./composables/useEvents";
import type {
  SchedulerEvent,
  SchedulerProps,
  ProcessedEvent,
  DateRange,
} from "./types";

export default Scheduler;
export { Scheduler, useScheduler, useEvents };
export type { SchedulerEvent, SchedulerProps, ProcessedEvent, DateRange };
