<template>
  <nuxt-link to="/" class="mb-10 flex items-center cursor-pointer">
    <UIcon name="i-heroicons-chevron-left" />
    <span>Back</span>
  </nuxt-link>

  <section class="flex items-center justify-between mb-10">
    <h1 class="text-lg lg:text-3xl font-extrabold">
      {{ $route.query.title ? $route.query.title : boardId }}
    </h1>
    <div>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions">
        <template #option-empty></template>
      </USelectMenu>
    </div>
  </section>

  <section
    class="flex flex-col-reverse justify-center lg:flex-row lg:justify-between lg:mb-20"
  >
    <div class="flex justify-between lg:flex-col">
      <UsersWidget
        v-for="(user, i) in boardMembers"
        class="my-2"
        :key="i"
        :color="user.color ? user.color : 'green'"
        :title="user.user_nickname"
        :userId="user.user_id"
        :amount="getUserExpenses(user.user_id)"
        :loading="pending"
      />
    </div>
    <div class="flex justify-center">
      <ClientOnly>
        <ExpensesPieChart v-if="expenses.length" :categories="categories" />
        <p v-else class="text-center text-gray-500">
          No expenses to display chart.
        </p>
      </ClientOnly>
    </div>
  </section>
  <UTabs :items="tabs" class="w-full">
    <template #expenses>
      <section class="flex justify-between my-10">
        <div>
          <h2 class="text-lg lg:text-2xl font-extrabold">List of expenses</h2>
        </div>
        <div>
          <ExpenseModal
            v-model="expenseModalIsOpen"
            @saved="refreshExpenses($route.params.id)"
            :members="boardMembers"
          />

          <UButton
            icon="i-heroicons-plus-circle"
            color="primary"
            variant="solid"
            label="Add new"
            @click="expenseModalIsOpen = true"
          />
        </div>
      </section>

      <section v-if="!pending">
        <div v-for="expense in expenses" :key="expense.id">
          <Expense
            :expense="expense"
            :loading="pending"
            @deleted="refreshExpenses($route.params.id)"
            @edited="refreshExpenses($route.params.id)"
            :members="boardMembers"
          />
        </div>
      </section>
      <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
      </section>
    </template>
    <template #discounts>
      <section class="flex justify-between my-10">
        <div>
          <h2 class="text-lg lg:text-2xl font-extrabold">List of discounts</h2>
        </div>
        <div>
          <DiscountModal
            v-model="discountModalIsOpen"
            :board-id="$route.params.id"
            @saved="refreshDiscounts($route.params.id)"
          />

          <UButton
            icon="i-heroicons-plus-circle"
            color="primary"
            variant="solid"
            label="Add new"
            @click="discountModalIsOpen = true"
          />
        </div>
      </section>
      <section v-if="!discountsPending">
        <div v-if="discounts.length > 0">
          <div v-for="discount in discounts" :key="discount.id">
            <Discount :discount="discount" :loading="discountsPending" />
          </div>
        </div>
        <div v-else>
          <p class="text-center">No valid discount available.</p>
        </div>
      </section>
      <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
      </section>
    </template>
  </UTabs>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

// Reactive variables
const selectedView = ref(transactionViewOptions[1]); // Default selected view option
const expenseModalIsOpen = ref(false);
const discountModalIsOpen = ref(false);
const route = useRoute();
const boardId = route.params.id;
const { dates } = useSelectedTimePeriod(selectedView);

const {
  pending,
  refreshExpenses,
  getUsers,
  expenses: { all: expenses, getUserExpenses },
  boardMembers: { all: boardMembers },
} = useFetchBoardExpenses(dates, boardId);
await refreshExpenses(boardId);
await getUsers(boardId);

const {
  discountsPending,
  refreshDiscounts,
  discounts: { all: discounts },
} = useFetchBoardDiscounts(boardId);
await refreshDiscounts(boardId);

// Add categories data computation
// Update categories computation
const categories = computed(() => {
  const categoryMap = {};

  expenses.value.forEach((expense) => {
    const category = expense.category || "Uncategorized";
    categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
  });

  return categoryMap;
});

const tabs = [
  {
    slot: "expenses",
    label: "List Of Expenses",
  },
  {
    slot: "discounts",
    label: "List Of Discounts",
  },
];
</script>
