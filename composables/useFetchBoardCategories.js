export const useFetchBoardCategories = (boardId) => {
  const supabase = useSupabaseClient();
  const categoriesPending = ref(false);
  const error = ref(null);
  const categories = ref([]);

  const getCategories = async (boardId) => {
    categoriesPending.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // Ensure each category has required properties with defaults
      categories.value = (data || []).map(cat => ({
        label: cat.label,
        icon: cat.icon || 'i-heroicons-question-mark-circle-20-solid', // Default icon
        color: cat.color || 'gray', // Default color
        ...cat
      }));
      
      return categories.value;
    } catch (err) {
      error.value = err;
      console.error("Error fetching categories:", err);
      return [];
    } finally {
      categoriesPending.value = false;
    }
  };

  // Automatically fetch categories if boardId is provided
  if (boardId) {
    getCategories(boardId);
  }

  return {
    categories,
    categoriesPending,
    error,
    getCategories,
  };
};
