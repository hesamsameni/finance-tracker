<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
    :fullscreen="isSmallScreen"
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Expenses Comparison
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="chart-wrapper">
        <v-chart :option="chartOptions" autoresize />
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
import { computed } from "vue";
import { groupBy, sumBy } from "lodash";
import { useCurrency } from "~/composables/useCurrency";
import { useBreakpoints } from "@vueuse/core";

const props = defineProps({
  modelValue: Boolean,
  expenses: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "$",
  },
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const colorMode = useColorMode();
const currentTheme = computed({
  get() {
    return colorMode.value;
  },
});

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
});

const isSmallScreen = breakpoints.smaller("sm");

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleString("default", { month: "short" }) +
    " " +
    d.getFullYear().toString().slice(-2)
  );
}

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

const aggregatedData = computed(() => {
  const grouped = groupBy(props.expenses, (expense) =>
    formatDate(expense.purchase_date)
  );

  const categoryData = props.categories.reduce((acc, category) => {
    acc[category.label] = Object.entries(grouped).map(([month, expenses]) => ({
      month,
      totalAmount: sumBy(
        expenses.filter((expense) => expense.category === category.label),
        "amount"
      ),
    }));
    return acc;
  }, {});

  return categoryData;
});

const chartOptions = computed(() => {
  const seriesData = Object.entries(aggregatedData.value).map(
    ([category, data]) => ({
      name: category,
      type: "bar",
      stack: "total",
      data: data.map((d) => d.totalAmount).filter((amount) => amount > 0),
      label: {
        show: true,
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
        color:
          tailwindColors[
            props.categories.find((cat) => cat.label === category)?.color
          ] || "#3182ce",
      },
    })
  );

  const xAxisData = aggregatedData.value[
    Object.keys(aggregatedData.value)[0]
  ].map((data) => data.month);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        let tooltip = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          const { formattedCurrency } = useCurrency(
            param.value,
            props.currency
          );
          tooltip += `${param.marker} ${param.seriesName}: ${formattedCurrency.value}<br/>`;
        });
        return tooltip;
      },
    },
    legend: {
      orient: "horizontal",
      top: 0,
      data: Object.keys(aggregatedData.value).filter(
        (category) => category !== "Carry Over"
      ),
      itemGap: 20, // Add space between legend items
      selectMode: false,
      textStyle: {
        color: currentTheme.value === "dark" ? "#fff" : "#000", // Change color based on theme
      },
      formatter: (name) => {
        const category = props.categories.find((cat) => cat.label === name);
        const color = category ? tailwindColors[category.color] : "#3182ce";
        return name;
      },
      tooltip: {
        show: true,
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        rotate: 90,
      },
    },
    yAxis: {
      type: "value",
      show: false, // Hide the y-axis
      splitLine: { show: false }, // Remove horizontal lines
    },
    series: seriesData,
  };
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
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
