import { useSupabaseClient, useSupabaseUser } from "#imports";
import { ref } from "vue";

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
  const client = useSupabaseClient() as any;
  const user = useSupabaseUser();

  /* Fetch daily entries */
  const getEntriesByDate = async (date: string) => {
    if (!user.value?.id) return [];
    const { data, error } = await client
      .from("calory_entries")
      .select("*")
      .eq("user_id", user.value.id)
      .eq("date", date)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  /* Fetch entries for a date range (e.g., whole month) */
  const getEntriesByMonth = async (startDate: string, endDate: string) => {
    if (!user.value?.id) return [];
    const { data, error } = await client
      .from("calory_entries")
      .select("*")
      .eq("user_id", user.value.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  /* Insert new meal entry */
  const addEntry = async (entry: any) => {
    if (!user.value?.id) throw new Error("Not authenticated");
    const payload = {
      user_id: user.value.id,
      date: entry.date || new Date().toISOString().slice(0, 10),
      meal_type: entry.meal_type || "other",
      item: entry.item,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    };
    const { data, error } = await client
      .from("calory_entries")
      .insert(payload)
      .select();
    if (error) throw error;
    return (data && data[0]) || null;
  };

  /* Delete entry */
  const deleteEntry = async (id: string) => {
    if (!user.value?.id) throw new Error("Not authenticated");
    const { error } = await client
      .from("calory_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value.id);
    if (error) throw error;
  };

  /* Weekly summary */
  const getWeeklySummary = async () => {
    if (!user.value?.id) return [];
    const { data, error } = await client.rpc("get_weekly_calories", {
      user_id_input: user.value.id,
    });
    if (error) throw error;
    return data || [];
  };

  return {
    getEntriesByDate,
    getEntriesByMonth,
    addEntry,
    deleteEntry,
    getWeeklySummary,
  };
};
