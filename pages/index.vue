<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">House of Hesam</h1>
    <div>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions" />
    </div>
  </section>

  <section
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10"
  >
    <Trend
      color="green"
      title="Income"
      :amount="incomeTotal"
      :last-amount="prevIncomeTotal"
      :loading="isLoading"
    />
    <Trend
      color="red"
      title="Expense"
      :amount="expenseTotal"
      :last-amount="prevExpenseTotal"
      :loading="isLoading"
    />
    <Trend
      color="green"
      title="Investments"
      :amount="4000"
      :last-amount="3000"
      :loading="isLoading"
    />
    <Trend
      color="red"
      title="Saving"
      :amount="4000"
      :last-amount="4100"
      :loading="isLoading"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="text-2xl font-extrabold">Transactions</h2>
      <div class="text-gray-500 dark:text-gray-400">
        You have {{ incomeCount }} incomes and {{ expenseCount }} expenses this
        period
      </div>
    </div>
    <div>
      <TransactionModal v-model="isOpen" />

      <UButton
        icon="i-heroicons-plus-circle"
        color="white"
        variant="solid"
        label="Add"
        @click="isOpen = true"
      />
    </div>
  </section>

  <section v-if="!isLoading">
    <div
      v-for="(transactionsOfTheDay, date) in transactionGroupedByDate"
      :key="date"
      class="mb-10"
    >
      <DailyTransactionSummary
        :date="date"
        :loading="isLoading"
        :transactions="transactionsOfTheDay"
      />
      <Transaction
        v-for="transaction in transactionsOfTheDay"
        :key="transaction.id"
        :transaction="transaction"
        :loading="isLoading"
        @deleted="refreshTransactions()"
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
const selectedView = ref(transactionViewOptions[2]); // Default selected view option
const supabase = useSupabaseClient(); // Initializing the Supabase client
const transactions = ref([]); // Reactive array to hold transactions
const isLoading = ref(false); // Reactive boolean to indicate loading state
const isOpen = ref(false);

/**
 * Fetches transactions from the database and refreshes the local list.
 */
const refreshTransactions = async () => {
  transactions.value = await fetchTransactions(); // Update transactions after fetching
};

/**
 * Fetches transactions from the database.
 * @returns {Array} An array of transactions fetched from the Supabase database.
 */
const fetchTransactions = async () => {
  isLoading.value = true; // Set loading state to true while fetching

  try {
    const { data } = await useAsyncData("transactions", async () => {
      const { data, error } = await supabase.from("transactions").select(); // Query transactions table
      if (error) return []; // Return an empty array if there's an error
      return data; // Return the fetched data
    });

    return data.value; // Return the resolved data
  } finally {
    isLoading.value = false; // Reset loading state after fetch attempt
  }
};

// Immediately refresh transactions on component setup
await refreshTransactions();

/**
 * Computed property to group transactions by their creation date.
 * @returns {Object} An object where keys are dates and values are arrays of transactions for that date.
 */
const transactionGroupedByDate = computed(() => {
  const grouped = {}; // Object to hold grouped transactions

  for (const transaction of transactions.value) {
    const date = new Date(transaction.created_at).toISOString().split("T")[0]; // Extract the date part

    if (!grouped[date]) {
      grouped[date] = []; // Initialize an empty array if the date group doesn't exist
    }

    grouped[date].push(transaction); // Add the transaction to the corresponding date group
  }

  return grouped; // Return the grouped transactions
});

/**
 * Computed property to filter transactions of type "income".
 * @returns {Array} An array of transactions where type is "income".
 */
const incomeTransactions = computed(() => {
  return transactions.value.filter(
    (transaction) => transaction.type === "income"
  );
});

const incomeCount = computed(() => incomeTransactions.value.length);
const incomeTotal = computed(() => {
  return incomeTransactions.value.reduce(
    (acc, current) => acc + current.amount,
    0
  );
});

/**
 * Computed property to filter transactions of type "expense".
 * @returns {Array} An array of transactions where type is "expense".
 */
const expenseTransactions = computed(() => {
  return transactions.value.filter(
    (transaction) => transaction.type === "expense"
  );
});

const expenseCount = computed(() => expenseTransactions.value.length);
const expenseTotal = computed(() => {
  return expenseTransactions.value.reduce(
    (acc, current) => acc + current.amount,
    0
  );
});
</script>
