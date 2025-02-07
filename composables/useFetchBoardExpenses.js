export const useFetchBoardExpenses = (period, boardId) => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const expenses = ref([]);
  const boardMembers = ref([]);

  watch(period, async () => await refresh(boardId));

  const getBoardMembers = async (boardId) => {
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

  const fetchExpenses = async (boardId) => {
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
          return error ? [] : data;
        }
      );
      return data.value;
    } finally {
      pending.value = false;
    }
  };

  const refresh = async (boardId) => {
    expenses.value = await fetchExpenses(boardId);
  };

  const loadBoardMembers = async (boardId) => {
    boardMembers.value = await getBoardMembers(boardId);
  };

  const expensesByUser = computed(() => {
    return boardMembers.value.reduce((acc, user) => {
      acc[user.user_id] = expenses.value.filter(
        (expense) => expense.paid_by === user.user_id
      );
      return acc;
    }, {});
  });

  const getUserExpenses = (userId) => {
    return (expensesByUser.value[userId] || []).reduce(
      (total, expense) => total + (expense.amount || 0),
      0
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
    refresh,
    pending,
    getUsers: loadBoardMembers,
  };
};
