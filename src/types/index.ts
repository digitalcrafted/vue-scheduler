export interface SchedulerEvent {
  label: string;
  start: string | Date | number;
  end?: string | Date | number;
  bgColor?: string;
  id?: string | number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SchedulerProps {
  events:
    | SchedulerEvent[]
    | ((params: {
        dateRange: DateRange;
        setEvents: (events: SchedulerEvent[]) => void;
      }) => void);
  initialDate?: string | Date | number;
  viewMode?: "day" | "week" | "month" | "year";
  dateLocale?: string;
  translations?: Record<string, string>;
}

export interface ProcessedEvent extends SchedulerEvent {
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  duration: number; // in days
}
