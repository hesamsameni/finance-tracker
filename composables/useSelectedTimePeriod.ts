import {
  startOfYear,
  endOfYear,
  sub,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { computed } from "vue";

export function useSelectedTimePeriod(selectedView: any) {
  const dates = computed(() => {
    if (!selectedView?.value) {
      return { start: null, end: null } as any;
    }

    const currentDate = new Date();
    switch (selectedView.value) {
      case "This Year":
        return {
          from: startOfYear(currentDate),
          to: endOfYear(currentDate),
        };
      case "Monthly":
        return {
          from: startOfMonth(currentDate),
          to: endOfMonth(currentDate),
        };
      case "Today":
        return {
          from: startOfDay(currentDate),
          to: endOfDay(currentDate),
        };
      case "This Month":
        return {
          from: startOfMonth(currentDate),
          to: endOfMonth(currentDate),
        };
      case "Last Month":
        const lastMonthDate = subMonths(currentDate, 1);
        return {
          from: startOfMonth(lastMonthDate),
          to: endOfMonth(lastMonthDate),
        };
      case "Last 3 Months":
        const threeMonthsAgo = subMonths(currentDate, 3);
        return {
          from: startOfMonth(threeMonthsAgo),
          to: endOfMonth(currentDate),
        };
      case "All Time":
        return {
          from: startOfDay(new Date(0)), // Unix epoch start (1970-01-01)
          to: endOfDay(currentDate),
        };
      default:
        return {
          from: startOfDay(currentDate),
          to: endOfDay(currentDate),
        };
    }
  });

  return { dates };
}
