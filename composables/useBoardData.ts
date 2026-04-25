import { computed } from "vue";

export function useBoardData(boardId: any, dateRange: any) {
  const {
    pending,
    refreshExpenses,
    fetchAllExpenses,
    getUsers,
    expenses: { all: expenses, getUserExpenses },
    boardMembers: { all: boardMembers },
  } = useFetchBoardExpenses(dateRange, boardId);

  const { categories: fetchedCategories, categoriesPending } =
    useFetchBoardCategories(boardId);

  const categoriesForChart = computed(() => {
    const categoryMap: Record<string, number> = {};
    expenses.value.forEach((expense: any) => {
      const category = expense.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
    });
    return categoryMap;
  });

  return {
    pending,
    refreshExpenses,
    fetchAllExpenses,
    getUsers,
    expenses,
    getUserExpenses,
    boardMembers,
    fetchedCategories,
    categoriesPending,
    categoriesForChart,
  };
}
