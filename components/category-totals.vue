<!-- components/CategoryTotals.vue -->
<template>
  <section class="mb-4">
    <div
      :class="
        Object.keys(categoryTotals).length == 1
          ? 'grid grid-cols-1'
          : 'grid grid-cols-1 lg:grid-cols-2 gap-4'
      "
    >
      <!-- Category Cards -->
      <UCard
        v-if="Object.keys(categoryTotals).length > 1"
        v-for="(total, category) in categoryTotals"
        :key="category"
        class="hidden lg:block"
      >
        <div class="flex items-center space-x-4">
          <div
            class="inline-flex items-center rounded-full p-2 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700"
          >
            <UIcon
              :name="getCategoryIcon(category)"
              :class="`text-${getCategoryColor(category)}-400 w-5 h-5`"
            />
          </div>
          <div>
            <div class="font-semibold">{{ category }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ formattedCurrency(total, currency) }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Total Spent Card -->
      <UCard>
        <div class="flex items-center space-x-4">
          <div
            class="inline-flex items-center rounded-full p-2 ring-1 ring-primary-300 dark:ring-primary-700"
          >
            <UIcon
              name="i-heroicons-currency-dollar"
              class="text-primary-600 dark:text-primary-400 w-5 h-5"
            />
          </div>
          <div>
            <div class="font-semibold text-primary-600 dark:text-primary-400">
              Total Spent
            </div>
            <div class="text-sm text-primary-500 dark:text-primary-300">
              {{ formattedCurrency(totalSpent, currency) }}
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  expenses: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "EUR",
  },
});

// Get totals from composable
const {
  categoryTotals,
  totalSpent, // Make sure your composable returns this
  getCategoryIcon,
  getCategoryColor,
} = useCategoryTotals(
  computed(() => props.expenses),
  computed(() => props.categories)
);

const formattedCurrency = (total, currency) => {
  const { formattedCurrency } = useCurrency(total, currency);
  return formattedCurrency;
};
</script>
