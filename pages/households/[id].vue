<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">Household #{{ householdId }}</h1>
    <div>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions" />
    </div>
  </section>

  <section
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10"
  >
    <Trend
      color="green"
      title="Hesam"
      :amount="incomeTotal"
      :last-amount="prevIncomeTotal"
      :loading="pending"
    />
    <Trend
      color="green"
      title="Elnaz"
      :amount="expenseTotal"
      :last-amount="prevExpenseTotal"
      :loading="pending"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="text-2xl font-extrabold">Add new expense</h2>
    </div>
    <div>
      <TransactionModal v-model="isOpen" @saved="refresh($route.params.id)" />

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
    <div v-for="expense in expenses" :key="expense.id" class="mb-10">
      <Transaction
        :transaction="expense"
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
  expenses: { all: expenses, incomeTotal, expenseTotal },
} = useFetchHouseholdExpenses(dates, householdId);
await refresh(householdId);
</script>
