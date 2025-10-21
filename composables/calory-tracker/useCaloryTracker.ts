import { ref } from "vue";
import { caloryTrackerService } from "~/services/calory-tracker";

type CaloryEntry = {
  id?: string;
  user_id?: string;
  date: string;
  meal_type?: string;
  item?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  created_at?: string;
};

type UseCaloryTrackerReturn = {
  getEntriesByDate: (date: string) => Promise<CaloryEntry[]>;
  getEntriesByMonth: (
    startDate: string,
    endDate: string
  ) => Promise<CaloryEntry[]>;
  addEntry: (entry: CaloryEntry) => Promise<CaloryEntry | null>;
  deleteEntry: (id: string) => Promise<void>;
  getWeeklySummary: () => Promise<any[]>;
};

export const useCaloryTracker = (): UseCaloryTrackerReturn => {
  /* Delegate to service */
  const getEntriesByDate = caloryTrackerService.getEntriesByDate;
  const getEntriesByMonth = caloryTrackerService.getEntriesByMonth;
  const addEntry = caloryTrackerService.addEntry;
  const deleteEntry = caloryTrackerService.deleteEntry;
  const getWeeklySummary = caloryTrackerService.getWeeklySummary;

  return {
    getEntriesByDate,
    getEntriesByMonth,
    addEntry,
    deleteEntry,
    getWeeklySummary,
  };
};
