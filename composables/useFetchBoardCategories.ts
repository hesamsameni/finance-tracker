import { ref } from "vue";

export const useFetchBoardCategories = (boardId: any) => {
  const supabase = useSupabaseClient() as any;
  const categoriesPending = ref(false);
  const error = ref<any>(null);
  const categories = ref<any[]>([]);

  const getCategories = async (boardId: any) => {
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
      categories.value = (data || []).map((cat: any) => ({
        label: cat.label,
        icon: cat.icon || "i-heroicons-question-mark-circle-20-solid", // Default icon
        color: cat.color || "gray", // Default color
        ...cat,
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
