export const useFetchBoardCategories = () => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const error = ref(null);
  const categories = ref([]);

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
      categories.value = [];
      return [];
    } finally {
      pending.value = false;
    }
  };

  return {
    categories,
    pending,
    error,
    getCategories,
  };
};
