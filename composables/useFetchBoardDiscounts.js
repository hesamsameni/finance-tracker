export const useFetchBoardDiscounts = (boardId) => {
  const supabase = useSupabaseClient();
  const discountsPending = ref(false);
  const discounts = ref([]);

  const fetchDiscounts = async (boardId) => {
    discountsPending.value = true;
    try {
      const { data, error } = await supabase
        .from("board_discounts")
        .select()
        .eq("board_id", boardId);
      if (error) {
        console.error("Error fetching board members:", error);
        return [];
      }
      return data;
    } finally {
      discountsPending.value = false;
    }
  };

  const refreshDiscounts = async (boardId) => {
    discounts.value = await fetchDiscounts(boardId);
  };

  return {
    discounts: {
      all: discounts,
    },
    refreshDiscounts,
    discountsPending,
  };
};
