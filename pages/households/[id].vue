<template>
  <nuxt-link to="/" class="mb-10 flex items-center cursor-pointer">
    <UIcon name="i-heroicons-chevron-left" />
    <span>Back</span>
  </nuxt-link>

  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">Household #{{ householdId }}</h1>
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
      v-for="(user, i) in household_users"
      :key="i"
      :color="user.color"
      :title="user.name"
      :amount="getUserExpenses(user.name)"
      :loading="pending"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="text-2xl font-extrabold">Add new expense</h2>
    </div>
    <div>
      <AddExpenseModal v-model="isOpen" @saved="refresh($route.params.id)" />

      <UButton
        icon="i-heroicons-plus-circle"
        color="white"
        variant="solid"
        label="Add"
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
      />
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
  </section>
</template>

<script setup>
import { transactionViewOptions, household_users } from "~/constants";

// Reactive variables
const selectedView = ref(transactionViewOptions[1]); // Default selected view option
const isOpen = ref(false);
const route = useRoute();
const householdId = route.params.id;
const { dates } = useSelectedTimePeriod(selectedView);

const {
  pending,
  refresh,
  expenses: { all: expenses, getUserExpenses },
} = useFetchHouseholdExpenses(dates, householdId, household_users);
await refresh(householdId);
</script>
