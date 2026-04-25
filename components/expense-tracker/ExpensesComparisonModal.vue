<template>
  <UModal
    v-model="isOpen"
    :ui="{ container: 'min-h-0 lg:min-h-full' }"
    :fullscreen="isSmallScreen"
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Monthly Comparison
            </h3>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              All time · {{ grandTotalFormatted }}
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <!-- Category filter chips (only shown when multiple categories) -->
      <div v-if="usedCategories.length > 1" class="flex flex-wrap gap-2 pb-4">
        <button
          v-for="cat in usedCategories"
          :key="cat.label"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ring-1 transition-all text-xs font-medium"
          :class="
            selectedCategories.has(cat.label)
              ? 'ring-gray-200 dark:ring-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
              : 'ring-gray-100 dark:ring-gray-800 bg-transparent text-gray-400 dark:text-gray-600 opacity-40'
          "
          @click="toggleCategory(cat.label)"
        >
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :style="{ backgroundColor: tailwindColors[cat.color] || '#9ca3af' }"
          />
          {{ cat.label }}
        </button>
      </div>

      <!-- Chart -->
      <div v-if="expenses.length" class="chart-wrapper">
        <v-chart :option="chartOptions" autoresize />
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600"
      >
        <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 mb-3" />
        <p class="text-sm">No expense data to compare.</p>
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import _ from "lodash";
const { groupBy, sumBy } = _;
import { useBreakpoints } from "@vueuse/core";

const props = defineProps({
  modelValue: Boolean,
  expenses: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "EUR",
  },
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const colorMode = useColorMode();
const currentTheme = computed(() => colorMode.value);

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
});

const isSmallScreen = breakpoints.smaller("sm");

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

const fmt = (amount) => {
  const curr = props.currency || "EUR";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: curr,
  }).format(amount);
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear()
  );
}

const grandTotalFormatted = computed(() =>
  fmt(props.expenses.reduce((sum, e) => sum + e.amount, 0)),
);

const usedCategories = computed(() => {
  const usedLabels = new Set(props.expenses.map((e) => e.category));
  return props.categories.filter((c) => usedLabels.has(c.label));
});

const selectedCategories = ref(new Set());

watch(
  usedCategories,
  (cats) => {
    selectedCategories.value = new Set(cats.map((c) => c.label));
  },
  { immediate: true },
);

const toggleCategory = (label) => {
  const next = new Set(selectedCategories.value);
  if (next.has(label)) {
    if (next.size > 1) next.delete(label);
  } else {
    next.add(label);
  }
  selectedCategories.value = next;
};

const aggregatedData = computed(() => {
  const grouped = groupBy(props.expenses, (e) => formatDate(e.purchase_date));

  const sortedMonths = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const byCategory = props.categories.reduce((acc, cat) => {
    acc[cat.label] = sortedMonths.map((month) =>
      sumBy(
        grouped[month].filter((e) => e.category === cat.label),
        "amount",
      ),
    );
    return acc;
  }, {});

  return { months: sortedMonths, byCategory };
});

const chartOptions = computed(() => {
  const { months, byCategory } = aggregatedData.value;
  const isDark = currentTheme.value === "dark";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";

  const seriesData = Object.entries(byCategory)
    .filter(([cat]) => selectedCategories.value.has(cat))
    .map(([cat, data]) => ({
      name: cat,
      type: "bar",
      stack: "total",
      data,
      label: { show: false },
      itemStyle: {
        color:
          tailwindColors[
            props.categories.find((c) => c.label === cat)?.color
          ] || "#9ca3af",
      },
    }));

  return {
    grid: { left: 8, right: 8, top: 8, bottom: 56, containLabel: false },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const filtered = params.filter((p) => p.value > 0);
        if (!filtered.length) return params[0]?.axisValue ?? "";
        const total = filtered.reduce((sum, p) => sum + p.value, 0);
        let html = `<div style="font-weight:600;margin-bottom:6px">${params[0].axisValue}</div>`;
        filtered.forEach((p) => {
          html += `${p.marker} ${p.seriesName}: <b>${fmt(p.value)}</b><br/>`;
        });
        if (filtered.length > 1) {
          html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb">Total: <b>${fmt(total)}</b></div>`;
        }
        return html;
      },
    },
    legend: { show: false },
    xAxis: {
      type: "category",
      data: months,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        rotate: 45,
        color: labelColor,
        fontSize: 11,
      },
      axisLine: { lineStyle: { color: isDark ? "#374151" : "#e5e7eb" } },
    },
    yAxis: {
      type: "value",
      show: false,
      splitLine: { show: false },
    },
    series: seriesData,
  };
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 300px;
}

@media (min-width: 640px) {
  .chart-wrapper {
    height: 380px;
  }
}

@media (min-width: 1024px) {
  .chart-wrapper {
    height: 460px;
  }
}
</style>
