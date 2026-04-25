<template>
  <div class="chart-wrapper mb-4 lg:mb-0">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCurrency } from "~/composables/useCurrency"; // Import the useCurrency composable

const props = defineProps({
  categories: {
    type: Object,
    required: true,
  },
  currency: String,
  categoryMetadata: {
    type: Array,
    required: true,
  },
});

const filteredCategories = computed(() =>
  Object.entries(props.categories).filter(
    ([key]) => key.toLowerCase() !== "carry over"
  )
);

const tailwindColors = {
  red: { 400: "#f87171", 500: "#ef4444" },
  green: { 400: "#4ade80", 500: "#22c55e" },
  purple: { 400: "#c084fc", 500: "#a855f7" },
  yellow: { 400: "#facc15", 500: "#eab308" },
  amber: { 400: "#fbbf24", 500: "#f59e0b" },
  orange: { 400: "#fb923c", 500: "#f97316" },
  blue: { 400: "#60a5fa", 500: "#3b82f6" },
  lime: { 400: "#a3e635", 500: "#84cc16" },
  teal: { 400: "#2dd4bf", 500: "#14b8a6" },
  pink: { 400: "#f472b6", 500: "#ec4899" },
  gray: { 400: "#9ca3af", 500: "#6b7280" },
  emerald: { 400: "#34d399", 500: "#10b981" },
  cyan: { 400: "#22d3ee", 500: "#06b6d4" },
  sky: { 400: "#38bdf8", 500: "#0ea5e9" },
  indigo: { 400: "#818cf8", 500: "#6366f1" },
  violet: { 400: "#a78bfa", 500: "#8b5cf6" },
  fuchsia: { 400: "#e879f9", 500: "#d946ef" },
  rose: { 400: "#fb7185", 500: "#f43f5e" },
  slate: { 400: "#94a3b8", 500: "#64748b" },
  stone: { 400: "#a8a29e", 500: "#78716c" },
};

const chartOptions = computed(() => ({
  backgroundColor: "rgba(0,0,0,0)",
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  series: [
    {
      type: "pie",
      radius: ["100%", "25%"],
      padAngle: 2,
      itemStyle: {
        borderRadius: 5,
      },
      data: filteredCategories.value.map(([key, value]) => {
        const { formattedCurrency } = useCurrency(value, props.currency);
        const category = props.categoryMetadata.find(
          (cat) => cat.label === key
        );
        const color =
          category && tailwindColors[category.color]
            ? tailwindColors[category.color][category.isCustom ? 400 : 500]
            : tailwindColors.gray[500];
        return {
          value,
          name: key,
          customdata: formattedCurrency.value,
          itemStyle: { color },
        };
      }),
      label: {
        position: "inner",
        formatter: (params) => {
          return `{bold|${params.name}} \n ${params.data.customdata}`;
        },
        rich: {
          bold: {
            fontWeight: "bold",
          },
        },
        alignTo: "circle",
      },
    },
  ],
}));
</script>

<style scoped>
.chart-wrapper {
  width: 300px;
  height: 300px; /* Adjust height as needed */
}
</style>
