<template>
  <div class="chart-wrapper">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { groupBy, sumBy } from "lodash";

// Define the props expected by the component
const props = defineProps({
  expenses: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "$",
  },
  categoryMetadata: {
    type: Array,
    default: () => [],
  },
});

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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleString("default", { month: "short" }) +
    " " +
    d.getFullYear().toString().slice(-2)
  );
}

const aggregatedData = computed(() => {
  const grouped = groupBy(props.expenses, (expense) =>
    formatDate(expense.purchase_date)
  );

  return Object.entries(grouped).map(([month, expenses]) => ({
    month,
    totalAmount: sumBy(expenses, "amount"),
  }));
});

const chartOptions = computed(() => ({
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      const dataPoint = params[0];
      const { formattedCurrency } = useCurrency(
        dataPoint.value,
        props.currency
      );

      return `${dataPoint.name}: ${formattedCurrency.value}`;
    },
  },
  xAxis: {
    type: "category",
    data: aggregatedData.value.map((data) => data.month),
    axisTick: { alignWithLabel: true },
    inverse: true,
    axisLabel: {
      rotate: 90, // Rotate labels for better readability
    },
  },
  yAxis: {
    type: "value",
    show: false, // Hide the vertical axis
    splitLine: { show: false }, // Remove horizontal grid lines
  },
  series: [
    {
      type: "bar",
      data: aggregatedData.value.map((data) => data.totalAmount),
      label: {
        show: true,
        rotate: 90,
        position: "inside",
        formatter: (params) => {
          const { formattedCurrency } = useCurrency(
            params.value,
            props.currency
          );
          return formattedCurrency.value;
        },
      },
      itemStyle: {
        color: tailwindColors[props.categoryMetadata[0]?.color] || "#3182ce",
        borderRadius: [10, 10, 0, 0],
        borderColor: "transparent",
      },
    },
  ],
}));
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 330px; /* Adjust height as needed */
}

@media (min-width: 640px) {
  .chart-wrapper {
    height: 400px; /* Adjust height for larger screens */
  }
}

@media (min-width: 1024px) {
  .chart-wrapper {
    height: 500px; /* Adjust height for even larger screens */
  }
}
</style>
