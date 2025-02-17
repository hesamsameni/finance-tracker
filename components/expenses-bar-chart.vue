<template>
  <client-only>
    <nuxt-plotly
      :data="barData"
      :layout="barLayout"
      :display-mode-bar="true"
    ></nuxt-plotly>
  </client-only>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { groupBy, sumBy } from "lodash";
import { useCurrency } from "~/composables/useCurrency"; // Import the useCurrency composable

// Define props
const props = defineProps({
  expenses: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  categoryMetadata: {
    type: Array,
    required: true,
  },
});

// Tailwind color configuration
const tailwindColors = {
  red: "#ef4444",
  green: "#22c55e",
  purple: "#a855f7",
  yellow: "#eab308",
  amber: "#f59e0b",
  orange: "#f97316",
  blue: "#3b82f6",
  lime: "#84cc16",
  teal: "#14b8a6",
  pink: "#ec4899",
  gray: "#6b7280",
  emerald: "#10b981",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  fuchsia: "#d946ef",
  rose: "#f43f5e",
  slate: "#64748b",
  stone: "#78716c",
};

// Helper function to format date to 'MMM YY' format
const formatDateToMonth = (dateString) => {
  if (!dateString) return ""; // Handle null or undefined dates
  const date = new Date(dateString);
  const options = { year: "2-digit", month: "short" };
  return date.toLocaleDateString("en-US", options);
};

// Aggregate expenses by month
const aggregatedData = computed(() => {
  if (!props.expenses || props.expenses.length === 0) return [];

  // Group expenses by purchase_date month
  const grouped = groupBy(props.expenses, (expense) =>
    formatDateToMonth(expense.purchase_date)
  );

  // Calculate total amount for each month
  return Object.entries(grouped).map(([month, expenses]) => ({
    month,
    totalAmount: sumBy(expenses, "amount"),
  }));
});

// Prepare Plotly bar chart data
const barData = ref([]);
const computedColor = computed(() => {
  return props.categoryMetadata.length > 0
    ? tailwindColors[props.categoryMetadata[0].color] || "#0ea5e9" // Default to sky if not found
    : "#0ea5e9";
});

watch(
  aggregatedData,
  (newData, oldData) => {
    if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
      const months = newData.map((data) => data.month);
      const values = newData.map((data) => data.totalAmount);

      barData.value = [
        {
          x: months,
          y: values,
          type: "bar",
          marker: {
            color: computedColor.value,
          },
          text: values.map(
            (value) =>
              useCurrency(value, props.currency).formattedCurrency.value
          ),
          textposition: "auto",
          hoverinfo: "none",
        },
      ];
    }
  },
  { immediate: true }
);

// Define Plotly layout
const barLayout = ref({
  height: 300,
  width: 500,
  showlegend: false,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    family: "Inter",
    weight: 500,
  },
  margin: {
    l: 0,
    r: 0,
    b: 80,
    t: 0,
    pad: 0,
  },
  barcornerradius: 15,
  xaxis: {
    tickangle: 90,
    tickmode: "array",
    tickvals: aggregatedData.value.map((data) => data.month),
    ticktext: aggregatedData.value.map((data) => `  ${data.month}`), // Add a space before the month
  },
  yaxis: {
    showgrid: false, // Remove horizontal grid lines
  },
});
</script>
