export const useFetchHouseholds = () => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const households = ref([]);

  const fetchHouseholds = async () => {
    pending.value = true; // Start loading
    try {
      const { data, error } = await supabase
        .from("temp_household_users")
        .select(
          `
            temp_list_of_households (id, title)
          `
        )
        .eq("user_id", "1");
      if (error) {
        console.error("Error fetching households:", error);
        return [];
      }
      return data.map((record) => record.temp_list_of_households);
    } catch (err) {
      console.error("Unexpected error:", err);
      return [];
    } finally {
      pending.value = false;
    }
  };

  const refresh = async () => {
    households.value = await fetchHouseholds();
  };

  return {
    households,
    refresh,
    pending,
  };
};
