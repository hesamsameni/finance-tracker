<template>
  <nuxt-link to="/" class="mb-10 flex items-center cursor-pointer">
    <UIcon name="i-heroicons-chevron-left" />
    <span>Back</span>
  </nuxt-link>

  <section class="flex items-center justify-between mb-10">
    <h1 class="text-3xl font-extrabold">
      {{ $route.query.title ? $route.query.title : householdId }}
    </h1>
    <div>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions">
        <template #option-empty></template>
      </USelectMenu>
    </div>
  </section>

  <section
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10"
  >
    <UsersWidget
      v-for="(user, i) in boardMembers"
      class="my-10 lg:my-0"
      :key="i"
      :color="user.color ? user.color : 'green'"
      :title="user.user_nickname"
      :userId="user.user_id"
      :amount="getUserExpenses(user.user_id)"
      :loading="pending"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="text-2xl font-extrabold">Add new expense</h2>
    </div>
    <div>
      <AddExpenseModal
        v-model="isOpen"
        @saved="refresh($route.params.id)"
        :members="boardMembers"
      />

      <UButton
        icon="i-heroicons-plus-circle"
        color="primary"
        variant="solid"
        label="Add new"
        @click="isOpen = true"
      />
    </div>
  </section>

  <section v-if="!pending">
    <div v-for="expense in expenses" :key="expense.id">
      <Expense
        :expense="expense"
        :loading="pending"
        @deleted="refresh($route.params.id)"
        :members="boardMembers"
      />
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
  </section>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

// Reactive variables
const selectedView = ref(transactionViewOptions[1]); // Default selected view option
const isOpen = ref(false);
const route = useRoute();
const householdId = route.params.id;
const { dates } = useSelectedTimePeriod(selectedView);

const {
  pending,
  refresh,
  getUsers,
  expenses: { all: expenses, getUserExpenses },
  boardMembers: { all: boardMembers },
} = useFetchHouseholdExpenses(dates, householdId);
await refresh(householdId);
await getUsers(householdId);
</script>
