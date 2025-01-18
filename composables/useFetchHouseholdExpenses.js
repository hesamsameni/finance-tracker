export const useFetchHouseholdExpenses = (period, householdId) => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const expenses = ref([]); // Holds the entire list of expenses

  watch(period, async () => await refresh(householdId));

  const fetchExpenses = async (householdId) => {
    pending.value = true;

    try {
      const { data } = await useAsyncData(
        `expenses-${period.value.from.toDateString()}-${period.value.to.toDateString()}`,
        async () => {
          const { data, error } = await supabase
            .from("temp_household_transactions")
            .select()
            .eq("household_id", householdId)
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

  const incomeTransactions = computed(() => {
    return expenses.value.filter((expense) => expense.paid_by === "Hesam");
  });

  const incomeTotal = computed(() => {
    return incomeTransactions.value.reduce(
      (acc, current) => acc + current.amount,
      0
    );
  });

  const expenseTransactions = computed(() => {
    return expenses.value.filter((expense) => expense.paid_by === "Elnaz");
  });

  const expenseTotal = computed(() => {
    return expenseTransactions.value.reduce(
      (acc, current) => acc + current.amount,
      0
    );
  });

  return {
    expenses: {
      all: expenses, // Include the entire list of expenses
      incomeTotal,
      expenseTotal,
    },
    refresh,
    pending,
  };
};
