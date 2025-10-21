import { ref } from "vue";

export const useFetchBoardDiscounts = (boardId: any) => {
  const supabase = useSupabaseClient() as any;
  const discountsPending = ref(false);
  const discounts = ref<any[]>([]);

  const fetchDiscounts = async (boardId: any) => {
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

  const refreshDiscounts = async (boardId: any) => {
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
