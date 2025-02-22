<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-lg lg:text-3xl font-extrabold">
      {{ $route.query.title ? $route.query.title : boardId }}
    </h1>
    <div class="flex items-center gap-2">
      <UButton
        icon="i-heroicons-chart-bar"
        color="primary"
        variant="outline"
        :label="comparisonLoading ? 'Loading Data' : 'Compare'"
        size="xs"
        @click="openCompareExpensesModal"
      />
      <USelectMenu v-model="selectedView" :options="transactionViewOptions">
        <template #option-empty></template>
      </USelectMenu>
    </div>
  </section>

  <section v-if="!pending">
    <section
      class="flex flex-col-reverse justify-center lg:flex-row lg:justify-between"
      v-if="Object.keys(categoriesForChart).length > 1"
    >
      <div>
        <CategoryTotals
          v-if="expenses.length"
          :expenses="expenses"
          :categories="fetchedCategories"
          :currency="$route.query.currency"
        />
      </div>
      <div
        class="flex justify-center"
        v-if="Object.keys(categoriesForChart).length > 1"
      >
        <ClientOnly>
          <ExpensesPieChart
            v-if="expenses.length"
            :categories="categoriesForChart"
            :currency="$route.query.currency"
            :categoryMetadata="fetchedCategories"
          />
          <p v-else class="text-center text-gray-500">
            No expenses to display chart.
          </p>
        </ClientOnly>
      </div>
    </section>

    <section>
      <div
        class="flex justify-center -mt-10 -z-10 relative"
        v-if="Object.keys(categoriesForChart).length == 1"
      >
        <ClientOnly>
          <ExpensesBarChart
            v-if="expenses.length"
            :expenses="expenses"
            :currency="$route.query.currency"
            :categoryMetadata="fetchedCategories"
          />
          <p v-else class="text-center text-gray-500">
            No expenses to display chart.
          </p>
        </ClientOnly>
      </div>
      <div v-if="Object.keys(categoriesForChart).length == 1">
        <CategoryTotals
          v-if="expenses.length"
          :expenses="expenses"
          :categories="fetchedCategories"
          :currency="$route.query.currency"
        />
      </div>
    </section>
  </section>
  <section v-else>
    <div class="flex justify-between gap-2">
      <USkeleton class="h-32 w-full my-2" />
    </div>
  </section>

  <section v-if="!pending">
    <div class="flex justify-between" v-if="boardMembers.length > 1">
      <UsersWidget
        v-for="(user, i) in boardMembers"
        class="my-2"
        :key="i"
        :color="user.color ? user.color : 'green'"
        :title="user.user_nickname"
        :userId="user.user_id"
        :amount="getUserExpenses(user.user_id)"
        :loading="pending"
        :currency="$route.query.currency"
      />
    </div>
  </section>
  <section v-else>
    <div class="flex justify-between gap-2">
      <USkeleton class="h-16 w-full my-4" v-for="i in 4" :key="i" />
    </div>
  </section>

  <section class="flex justify-between items-center my-10">
    <div>
      <h2 class="text-lg lg:text-2xl font-extrabold">Expenses</h2>
    </div>
    <div>
      <ExpenseModal
        v-model="expenseModalIsOpen"
        @saved="refreshExpenses($route.params.id)"
        :members="boardMembers"
        :categories="fetchedCategories"
      />
      <UButton
        icon="i-heroicons-plus-circle"
        color="primary"
        variant="solid"
        label="Add new"
        size="lg"
        @click="expenseModalIsOpen = true"
      />
    </div>
  </section>

  <section v-if="!pending">
    <div v-if="expenses.length">
      <div v-for="expense in expenses" :key="expense.id">
        <Expense
          :expense="expense"
          :loading="pending"
          @deleted="refreshExpenses($route.params.id)"
          @edited="refreshExpenses($route.params.id)"
          :members="boardMembers"
          :categories="fetchedCategories"
          :currency="$route.query.currency"
        />
      </div>
    </div>
    <div v-else>
      <p class="text-center">You don't have any expenses yet.</p>
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
  </section>

  <section class="flex justify-between items-center my-10">
    <div>
      <nuxt-link
        :to="`/boards/${boardId}/notes?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="text-primary-500"
      >
        View Notes
      </nuxt-link>
    </div>
    <div>
      <nuxt-link
        :to="`/boards/${boardId}/discounts?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="text-primary-500"
      >
        View Discounts
      </nuxt-link>
    </div>
  </section>

  <ClientOnly>
    <ExpensesComparisonModal
      v-model="compareExpensesModalIsOpen"
      :expenses="comparisonExpenses"
      :currency="$route.query.currency"
      :categories="fetchedCategories"
    />
  </ClientOnly>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

// Reactive variables
const selectedView = ref(transactionViewOptions[1]); // Default selected view option to "This Month"
const expenseModalIsOpen = ref(false);
const compareExpensesModalIsOpen = ref(false);
const comparisonExpenses = ref([]); // Holds expenses for comparison
const comparisonLoading = ref(false); // Loading state for comparison data

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
} = useBoardData(boardId, selectedView);

const initializeData = async () => {
  await refreshExpenses(boardId);
  await getUsers(boardId);
  if (Object.keys(categoriesForChart.value).length === 1) {
    selectedView.value = transactionViewOptions[5];
  }
};

initializeData();

// Fetch data for all time months when comparing expenses
const openCompareExpensesModal = async () => {
  comparisonLoading.value = true; // Set loading state
  comparisonExpenses.value = await fetchAllExpenses(boardId);
  comparisonExpenses.value = comparisonExpenses.value.filter(
    (expense) => expense.category !== "Carry Over"
  );
  compareExpensesModalIsOpen.value = true;
  comparisonLoading.value = false; // Reset loading state
};
</script>
