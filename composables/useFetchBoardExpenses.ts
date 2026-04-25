import { ref, computed, watch } from "vue";

export const useFetchBoardExpenses = (period: any, boardId: any) => {
  const supabase = useSupabaseClient() as any;
  const pending = ref(false);
  const expenses = ref<any[]>([]);
  const boardMembers = ref<any[]>([]);

  watch(period, async () => await refreshExpenses(boardId));

  const getBoardMembers = async (boardId: any) => {
    pending.value = true;
    try {
      const { data, error } = await supabase
        .from("board_members")
        .select()
        .eq("board_id", boardId);
      if (error) {
        console.error("Error fetching board members:", error);
        return [];
      }
      return [...new Set(data)]; // Remove duplicates
    } finally {
      pending.value = false;
    }
  };

  const fetchExpenses = async (boardId: any) => {
    pending.value = true;
    try {
      const { data } = await useAsyncData(
        `expenses-${period.value.from.toDateString()}-${period.value.to.toDateString()}`,
        async () => {
          const { data, error } = await supabase
            .from("board_expenses")
            .select()
            .eq("board_id", boardId)
            .gte("purchase_date", period.value.from.toISOString())
            .lte("purchase_date", period.value.to.toISOString())
            .order("purchase_date", { ascending: false });
          return error ? [] : data || [];
        },
      );
      return data.value || [];
    } finally {
      pending.value = false;
    }
  };

  const fetchAllExpenses = async (boardId: any) => {
    try {
      const { data, error } = await supabase
        .from("board_expenses")
        .select()
        .eq("board_id", boardId)
        .order("purchase_date", { ascending: false });
      return error ? [] : data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  };

  const refreshExpenses = async (boardId: any) => {
    expenses.value = await fetchExpenses(boardId);
  };

  const loadBoardMembers = async (boardId: any) => {
    boardMembers.value = await getBoardMembers(boardId);
  };

  const expensesByUser = computed(() => {
    return boardMembers.value.reduce((acc: Record<string, any>, user: any) => {
      acc[user.user_id] = expenses.value.filter(
        (expense: any) => expense.paid_by === user.user_id,
      );
      return acc;
    }, {});
  });

  const getUserExpenses = (userId: string) => {
    return (expensesByUser.value[userId] || []).reduce(
      (total: number, expense: any) => total + (expense.amount || 0),
      0,
    );
  };

  return {
    expenses: {
      all: expenses,
      getUserExpenses,
    },
    boardMembers: {
      all: boardMembers,
    },
    refreshExpenses,
    fetchAllExpenses,
    pending,
    getUsers: loadBoardMembers,
  };
};
