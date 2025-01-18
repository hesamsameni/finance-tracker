<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">Household #56</h1>
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
      :loading="isLoading"
    />
    <Trend
      color="green"
      title="Elnaz"
      :amount="expenseTotal"
      :last-amount="prevExpenseTotal"
      :loading="isLoading"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="text-2xl font-extrabold">Add new expense</h2>
    </div>
    <div>
      <TransactionModal v-model="isOpen" @saved="refreshTransactions()" />

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
    <Transaction
      v-for="transaction in transactions"
      :key="transaction.id"
      :transaction="transaction"
      :loading="isLoading"
      @deleted="refreshTransactions()"
    />
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
const route = useRoute();
const householdId = route.params.id;
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
    const { data } = await useAsyncData(
      "temp_household_transactions",
      async () => {
        const { data, error } = await supabase
          .from("temp_household_transactions")
          .select()
          .eq("household_id", householdId)
          .order("date", { ascending: false });
        if (error) return []; // Return an empty array if there's an error
        return data; // Return the fetched data
      }
    );

    return data.value; // Return the resolved data
  } finally {
    isLoading.value = false; // Reset loading state after fetch attempt
  }
};

// Immediately refresh transactions on component setup
await refreshTransactions();

/**
 * Computed property to filter transactions of type "income".
 * @returns {Array} An array of transactions where type is "income".
 */
const incomeTransactions = computed(() => {
  return transactions.value.filter(
    (transaction) => transaction.paid_by === "Hesam"
  );
});

const incomeTotal = computed(() => {
  return incomeTransactions.value.reduce(
    (acc, current) => acc + current.amount,
    0
  );
});

const expenseTransactions = computed(() => {
  return transactions.value.filter(
    (transaction) => transaction.paid_by === "Elnaz"
  );
});

const expenseTotal = computed(() => {
  return expenseTransactions.value.reduce(
    (acc, current) => acc + current.amount,
    0
  );
});
</script>
