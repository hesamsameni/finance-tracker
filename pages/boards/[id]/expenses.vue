<template>
  <!-- Toolbar -->
  <section class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-chart-bar"
        color="gray"
        variant="ghost"
        :label="comparisonLoading ? 'Loading...' : 'Compare'"
        size="sm"
        @click="openCompareExpensesModal"
      />
      <DateRangePicker v-model="dateRange" />
    </div>
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-sparkles"
        color="primary"
        variant="ghost"
        label="AI"
        size="sm"
        :loading="aiLoading"
        @click="openAiChat"
      />
      <UButton
        icon="i-heroicons-plus-circle"
        color="primary"
        variant="solid"
        label="Add expense"
        size="sm"
        @click="expenseModalIsOpen = true"
      />
    </div>
  </section>

  <!-- Unified Summary Card -->
  <UCard
    v-if="!pending && expenses.length"
    class="mb-6"
    :ui="{ body: { padding: 'p-5' } }"
  >
    <div class="flex flex-col lg:flex-row lg:items-start gap-6">
      <!-- Left: Total + Members -->
      <div class="flex-1 min-w-0">
        <p
          class="text-xs uppercase tracking-widest font-medium text-gray-400 dark:text-gray-500 mb-1"
        >
          Total Spent
        </p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mb-5">
          {{ formattedTotal }}
        </p>
        <div v-if="boardMembers.length > 1" class="space-y-3">
          <div
            v-for="user in boardMembers"
            :key="user.user_id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="`bg-${user.color || 'primary'}-500`"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                user.user_nickname
              }}</span>
            </div>
            <span
              class="text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              {{ formatCurrency(getUserExpenses(user.user_id)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Pie Chart (multi-category) -->
      <div
        v-if="Object.keys(categoriesForChart).length > 1"
        class="flex justify-center shrink-0"
      >
        <ClientOnly>
          <ExpensesPieChart
            :categories="categoriesForChart"
            :currency="$route.query.currency"
            :categoryMetadata="fetchedCategories"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Bar Chart (single category) -->
    <div v-if="singleCategory" class="mt-4">
      <ClientOnly>
        <ExpensesBarChart
          :expenses="expenses"
          :currency="$route.query.currency"
          :categoryMetadata="fetchedCategories"
        />
      </ClientOnly>
    </div>

    <!-- Category chips -->
    <div
      v-if="Object.keys(categoryTotals).length > 0"
      class="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800"
    >
      <div
        v-for="(total, category) in categoryTotals"
        :key="category"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
      >
        <UIcon
          :name="getCategoryIcon(String(category))"
          :class="`text-${getCategoryColor(String(category))}-400 w-3.5 h-3.5`"
        />
        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{
          category
        }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">{{
          formatCurrency(Number(total))
        }}</span>
      </div>
    </div>
  </UCard>

  <!-- Summary skeleton -->
  <UCard v-else-if="pending" class="mb-6" :ui="{ body: { padding: 'p-5' } }">
    <USkeleton class="h-32 w-full" />
  </UCard>

  <!-- Expense List -->
  <UCard :ui="{ body: { padding: 'p-0' } }">
    <div v-if="!pending">
      <div
        v-if="expenses.length"
        class="divide-y divide-gray-100 dark:divide-gray-800"
      >
        <Expense
          v-for="expense in expenses"
          :key="expense.id"
          :expense="expense"
          @deleted="refreshExpenses($route.params.id)"
          @edited="refreshExpenses($route.params.id)"
          :members="boardMembers"
          :categories="fetchedCategories"
          :currency="$route.query.currency"
        />
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600"
      >
        <UIcon name="i-heroicons-banknotes" class="w-10 h-10 mb-3" />
        <p class="text-sm">No expenses yet.</p>
      </div>
    </div>
    <div v-else class="p-4 space-y-2">
      <USkeleton class="h-12 w-full" v-for="i in 4" :key="i" />
    </div>
  </UCard>

  <!-- AI Chat -->
  <AiChat
    v-model="aiChatIsOpen"
    :expenses="aiExpenses"
    :members="boardMembers"
    :currency="$route.query.currency"
  />

  <!-- Modals -->
  <ClientOnly>
    <ExpensesComparisonModal
      v-model="compareExpensesModalIsOpen"
      :expenses="comparisonExpenses"
      :currency="$route.query.currency"
      :categories="fetchedCategories"
    />
  </ClientOnly>
  <ExpenseModal
    v-model="expenseModalIsOpen"
    @saved="refreshExpenses($route.params.id)"
    :members="boardMembers"
    :categories="fetchedCategories"
  />
</template>

<script setup>
import { startOfMonth, endOfMonth } from "date-fns";

// Reactive variables
const dateRange = ref({
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date()),
});
const expenseModalIsOpen = ref(false);
const compareExpensesModalIsOpen = ref(false);
const comparisonExpenses = ref([]); // Holds expenses for comparison
const comparisonLoading = ref(false); // Loading state for comparison data
const aiChatIsOpen = ref(false);
const aiExpenses = ref([]);
const aiLoading = ref(false);

const route = useRoute();
const boardId = route.params.id;

const {
  pending,
  refreshExpenses,
  fetchAllExpenses,
  getUsers,
  expenses,
  getUserExpenses,
  boardMembers,
  fetchedCategories,
  categoriesForChart,
} = useBoardData(boardId, dateRange);

const { categoryTotals, totalSpent, getCategoryIcon, getCategoryColor } =
  useCategoryTotals(expenses, fetchedCategories);

const formatCurrency = (amount) => {
  const curr = route.query.currency || "EUR";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: curr,
  }).format(amount);
};

const formattedTotal = computed(() => formatCurrency(totalSpent.value));

const singleCategory = computed(() => {
  return (
    fetchedCategories.value.filter(
      (category) => category.label !== "Carry Over",
    ).length === 1
  );
});

const initializeData = async () => {
  await refreshExpenses(boardId);
  await getUsers(boardId);

  if (singleCategory.value) {
    dateRange.value = { from: new Date(0), to: endOfMonth(new Date()) };
  }
};

initializeData();

const openAiChat = async () => {
  if (!aiExpenses.value.length) {
    aiLoading.value = true;
    const all = await fetchAllExpenses(boardId);
    aiExpenses.value = (all ?? []).filter((e) => e.category !== "Carry Over");
    aiLoading.value = false;
  }
  aiChatIsOpen.value = true;
};

// Fetch data for all time months when comparing expenses
const openCompareExpensesModal = async () => {
  comparisonLoading.value = true; // Set loading state
  comparisonExpenses.value = await fetchAllExpenses(boardId);
  comparisonExpenses.value = comparisonExpenses.value.filter(
    (expense) => expense.category !== "Carry Over",
  );
  compareExpensesModalIsOpen.value = true;
  comparisonLoading.value = false; // Reset loading state
};
</script>
