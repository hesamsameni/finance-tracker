// composables/useCaloryTracker.ts
import { useSupabaseClient, useSupabaseUser } from "#imports";

export const useCaloryTracker = () => {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  /* Fetch daily entries */
  const getEntriesByDate = async (date) => {
    const { data, error } = await client
      .from("calory_entries")
      .select("*")
      .eq("user_id", user.value?.id)
      .eq("date", date)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

  /* Insert new meal entry */
  const addEntry = async (entry) => {
    const { data, error } = await client
      .from("calory_entries")
      .insert({
        user_id: user.value?.id,
        date: entry.date || new Date().toISOString().slice(0, 10),
        meal_type: entry.meal_type || "other",
        item: entry.item,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
      })
      .select();
    if (error) throw error;
    return data?.[0];
  };

  /* Delete entry */
  const deleteEntry = async (id) => {
    const { error } = await client
      .from("calory_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value?.id);
    if (error) throw error;
  };

  /* Weekly summary */
  const getWeeklySummary = async () => {
    const { data, error } = await client.rpc("get_weekly_calories", {
      user_id_input: user.value?.id,
    });
    if (error) throw error;
    return data;
  };

  return { getEntriesByDate, addEntry, deleteEntry, getWeeklySummary };
};
