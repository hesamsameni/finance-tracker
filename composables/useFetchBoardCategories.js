export const useFetchBoardCategories = () => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const error = ref(null); // Add error state
  const categories = ref([]);

  // Single unified fetch function
  const getCategories = async (boardId) => {
    pending.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      categories.value = data || [];
      return categories.value;
    } catch (err) {
      error.value = err;
      console.error("Error fetching categories:", err);
      categories.value = []; // Reset on error
      return [];
    } finally {
      pending.value = false;
    }
  };

  return {
    categories,
    pending,
    error, // Expose error state
    getCategories,
  };
};
