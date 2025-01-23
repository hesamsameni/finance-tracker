export const useFetchHouseholdExpenses = (period, householdId) => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const expenses = ref([]); // Holds the entire list of expenses
  const boardMembers = ref([]);

  watch(period, async () => await refresh(householdId));

  const getCurrentBoardMembers = async (householdId) => {
    pending.value = true;

    try {
      // Step 1: Fetch the board IDs where the current user is the owner
      const { data: data, error: boardMembersError } = await supabase
        .from("board_members")
        .select("user_id")
        .eq("board_id", householdId);
      if (boardMembersError) {
        console.error("Error fetching board members:", boardMembersError);
        return [];
      }

      const boardMembers = data.filter(
        (o, index, arr) =>
          arr.findIndex(
            (item) => JSON.stringify(item) === JSON.stringify(o)
          ) === index
      );

      return boardMembers;
    } finally {
      pending.value = false;
    }
  };

  const fetchExpenses = async (householdId) => {
    pending.value = true;

    try {
      const { data } = await useAsyncData(
        `expenses-${period.value.from.toDateString()}-${period.value.to.toDateString()}`,
        async () => {
          const { data, error } = await supabase
            .from("board_expenses")
            .select()
            .eq("board_id", householdId)
            .gte("purchase_date", period.value.from.toISOString())
            .lte("purchase_date", period.value.to.toISOString())
            .order("purchase_date", { ascending: false });
          if (error) return []; // Return an empty array if there's an error
          return data; // Return the fetched data
        }
      );

      return data.value; // Return the resolved data
    } finally {
      pending.value = false; // Reset loading state after fetch attempt
    }
  };

  const refresh = async (householdId) => {
    expenses.value = await fetchExpenses(householdId);
  };

  const getUsers = async (householdId) => {
    boardMembers.value = await getCurrentBoardMembers(householdId);
  };

  const expensesByUser = computed(() => {
    const userExpenses = {};
    boardMembers.value.forEach((user) => {
      userExpenses[user.user_id] = expenses.value.filter(
        (expense) => expense.paid_by === user.user_id
      );
    });
    return userExpenses;
  });

  const getUserExpenses = (userId) => {
    const userExpenses = expensesByUser.value[userId] || [];
    return userExpenses.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );
  };

  return {
    expenses: {
      all: expenses, // Include the entire list of expenses
      getUserExpenses,
    },
    boardMembers: {
      all: boardMembers,
    },
    refresh,
    pending,
    getUsers,
  };
};
