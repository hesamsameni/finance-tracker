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

export const useSelectedTimePeriod = (period) => {
  const dates = computed(() => {
    const currentDate = new Date();
    switch (period.value) {
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
      default:
        return {
          from: startOfDay(currentDate),
          to: endOfDay(currentDate),
        };
    }
  });

  return { dates };
};
