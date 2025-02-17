<template>
  <client-only>
    <nuxt-plotly
      :data="data"
      :layout="layout"
      :display-mode-bar="false"
    ></nuxt-plotly>
  </client-only>
</template>

<script setup>
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

const data = computed(() => {
  return [
    {
      values: filteredCategories.value.map(([, value]) => value),
      labels: filteredCategories.value.map(([key]) => key),
      customdata: filteredCategories.value.map(([key, value]) => {
        const { formattedCurrency } = useCurrency(value, props.currency);
        return formattedCurrency.value;
      }),
      texttemplate: "<b>%{label}</b><br>%{customdata}",
      type: "pie",
      hole: 0.35,
      marker: {
        colors: filteredCategories.value.map(([key]) => {
          const category = props.categoryMetadata.find(
            (cat) => cat.label === key
          );
          if (category && tailwindColors[category.color]) {
            // Use hue 400 if isCustom is true, else hue 500
            return tailwindColors[category.color][
              category.isCustom ? 400 : 500
            ];
          }
          // Fallback to gray hue 500 if category not found or color missing
          return tailwindColors.gray[500];
        }),
      },
      hoverinfo: "label+value",
      textposition: "inside",
    },
  ];
});

const layout = ref({
  height: 300,
  width: 300,
  paper_bgcolor: "rgba(0,0,0,0)",
  showlegend: false,
  font: {
    family: "Inter",
    weight: 500,
  },
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: 0,
    autoexpand: false,
  },
  hovermode: false,
});
</script>
