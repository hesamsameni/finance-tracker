import { useSupabaseClient, useSupabaseUser } from "#imports";

export type CaloryEntry = {
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

const ensureAuth = (user: any) => {
  if (!user?.value?.id) throw new Error("Not authenticated");
};

export const caloryTrackerService = {
  async getEntriesByDate(date: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    if (!user?.value?.id) return [];
    const { data, error } = await client
      .from("calory_entries")
      .select("*")
      .eq("user_id", user.value.id)
      .eq("date", date)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as CaloryEntry[]) || [];
  },

  async getEntriesByMonth(startDate: string, endDate: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    if (!user?.value?.id) return [];
    const { data, error } = await client
      .from("calory_entries")
      .select("*")
      .eq("user_id", user.value.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as CaloryEntry[]) || [];
  },

  async addEntry(entry: Partial<CaloryEntry>) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const payload = {
      user_id: user.value!.id,
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
  },

  async deleteEntry(id: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);
    const { error } = await client
      .from("calory_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value!.id);
    if (error) throw error;
  },

  async getWeeklySummary() {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    if (!user?.value?.id) return [];
    const { data, error } = await client.rpc("get_weekly_calories", {
      user_id_input: user.value.id,
    });
    if (error) throw error;
    return data || [];
  },
};

export default caloryTrackerService;
