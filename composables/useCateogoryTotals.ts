import { computed } from "vue";

export const useCategoryTotals = (
  expenses: any,
  categories: any,
  excludeCategory = "Carry Over"
) => {
  const categoryTotals = computed(() => {
    const totals: Record<string, number> = {};
    if (!expenses.value) return totals; // Handle undefined expenses

    expenses.value.forEach((expense: any) => {
      if (expense.category === excludeCategory) return; // Exclude "Carry Over"
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    return totals;
  });

  const getCategoryIcon = (category: string) => {
    if (!categories.value) return "i-heroicons-question-mark-circle-20-solid"; // Handle undefined categories
    const cat = categories.value.find((c: any) => c.label === category);
    return cat?.icon || "i-heroicons-question-mark-circle-20-solid";
  };

  const getCategoryColor = (category: string) => {
    if (!categories.value) return "gray"; // Handle undefined categories
    const cat = categories.value.find((c: any) => c.label === category);
    return cat?.color || "gray";
  };

  const totalSpent = computed(() => {
    return Object.values(categoryTotals.value).reduce(
      (acc, curr) => acc + curr,
      0
    );
  });

  return {
    categoryTotals,
    getCategoryIcon,
    getCategoryColor,
    totalSpent,
  };
};
