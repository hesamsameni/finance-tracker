export function useBoardData(boardId, selectedView) {
  const { dates } = useSelectedTimePeriod(selectedView);

  const {
    pending,
    refreshExpenses,
    fetchAllExpenses,
    getUsers,
    expenses: { all: expenses, getUserExpenses },
    boardMembers: { all: boardMembers },
  } = useFetchBoardExpenses(dates, boardId);

  const {
    discountsPending,
    refreshDiscounts,
    discounts: { all: discounts },
  } = useFetchBoardDiscounts(boardId);

  const { categories: fetchedCategories, categoriesPending } =
    useFetchBoardCategories(boardId);

  const { notes, notesPending, refreshNotes, addNote, updateNote, deleteNote } =
    useFetchBoardNotes(boardId);

  const categoriesForChart = computed(() => {
    const categoryMap = {};
    expenses.value.forEach((expense) => {
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
    discountsPending,
    refreshDiscounts,
    discounts,
    fetchedCategories,
    categoriesPending,
    notes,
    notesPending,
    refreshNotes,
    addNote,
    updateNote,
    deleteNote,
    categoriesForChart,
  };
}
