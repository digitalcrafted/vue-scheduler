# vue-scheduler

A Vue 3 scheduler component with day/week/month/year views for displaying calendar events.

## Features

- 📅 Multiple view modes: Day, Week, Month, and Year
- 🎨 Customizable event colors
- ⚡ Support for static events array or dynamic event loading
- 🌍 Internationalization support with dayjs
- 📱 Responsive design with Tailwind CSS
- 🎯 TypeScript support

## Installation

```bash
npm install @digitalcrafted/vue-scheduler
```

## Usage

### Basic Example

```vue
<template>
  <Scheduler :events="events" />
</template>

<script setup>
import { Scheduler } from "@digitalcrafted/vue-scheduler";
import "@digitalcrafted/vue-scheduler/dist/style.css";

const events = [
  {
    label: "Meeting",
    start: "2024-10-08 10:00",
    end: "2024-10-08 11:00",
    bgColor: "#3498db",
  },
  {
    label: "Conference",
    start: "2024-10-09 14:00",
    end: "2024-10-09 18:00",
    bgColor: "#9575cd",
  },
];
</script>
```

### With Dynamic Event Loading

```vue
<template>
  <Scheduler :events="loadEvents" initial-date="2024-10-08" view-mode="week" />
</template>

<script setup>
import { Scheduler } from "@digitalcrafted/vue-scheduler";

const loadEvents = ({ dateRange, setEvents }) => {
  // Fetch events from API
  fetch(`/api/events?start=${dateRange.start}&end=${dateRange.end}`)
    .then((res) => res.json())
    .then((data) => setEvents(data));
};
</script>
```

### Hiding View Mode Selector

```vue
<template>
  <Scheduler
    :events="events"
    view-mode="month"
    :hide-view-mode-selector="true"
  />
</template>

<script setup>
import { Scheduler } from "@digitalcrafted/vue-scheduler";
import "@digitalcrafted/vue-scheduler/dist/style.css";

const events = [
  {
    label: "Meeting",
    start: "2024-10-08 10:00",
    end: "2024-10-08 11:00",
    bgColor: "#3498db",
  },
];
</script>
```

## Props

### `events`

- **Type**: `SchedulerEvent[] | Function`
- **Required**: Yes
- **Description**: Array of events or a function for dynamic loading

Event object structure:

```typescript
interface SchedulerEvent {
  label: string; // Event label/name
  start: string | Date | number; // Start date/time
  end?: string | Date | number; // End date/time (optional)
  bgColor?: string; // Background color (hex code)
  id?: string | number; // Unique identifier (optional)
}
```

Dynamic loading function signature:

```typescript
function loadEvents({
  dateRange: { start: Date, end: Date },
  setEvents: (events: SchedulerEvent[]) => void
}): void
```

### `initialDate`

- **Type**: `string | Date | number`
- **Default**: Current date
- **Description**: Initial date to display

### `viewMode`

- **Type**: `'day' | 'week' | 'month' | 'year'`
- **Default**: `'week'`
- **Description**: Initial view mode

### `dateLocale`

- **Type**: `string`
- **Default**: `undefined`
- **Description**: Locale for date formatting (e.g., 'en', 'fr', 'de')

### `translations`

- **Type**: `Record<string, string>`
- **Default**: `{}`
- **Description**: Translation object for custom labels

Available translation keys:

- `header.today`: Label for "Today" button

### `hideViewModeSelector`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Hides the view mode selector (day/week/month/year toggle) from the header when set to `true`

## Event Format

Events support both all-day and timed events:

```javascript
// All-day event (no time specified)
{
  label: "Holiday",
  start: "2024-10-08",
  bgColor: "#ff9800"
}

// Timed event
{
  label: "Meeting",
  start: "2024-10-08 10:00",
  end: "2024-10-08 11:00",
  bgColor: "#3498db"
}

// Multi-day event
{
  label: "Conference",
  start: "2024-10-08 09:00",
  end: "2024-10-10 18:00",
  bgColor: "#9575cd"
}
```

## Styling

The component uses Tailwind CSS for styling. Make sure Tailwind is available in your project, or import the default styles:

```javascript
import "@digitalcrafted/vue-scheduler/dist/style.css";
```

You can customize the appearance by overriding Tailwind classes or using CSS variables.

## TypeScript

TypeScript definitions are included:

```typescript
import type {
  SchedulerEvent,
  SchedulerProps,
} from "@digitalcrafted/vue-scheduler";
```

## Author

**Francis Onwumere**

- GitHub: [@digitalcrafted](https://github.com/digitalcrafted)

## License

MIT
