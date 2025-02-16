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
import { categories as categoryMetadata } from "~/constants";

const props = defineProps({
  categories: {
    type: Object,
    required: true,
  },
  currency: String,
});


const colors = {
  red: "#f44336",
  green: "#4caf50",
  purple: "#9c27b0",
  yellow: "#ffeb3b",
  amber: "#ffc107",
  orange: "#ff9800",
  blue: "#2196f3",
  lime: "#c6ff00",
  teal: "#26a69a",
  pink: "#e91e63",
};

const filteredCategories = computed(() =>
  Object.entries(props.categories).filter(
    ([key]) => key.toLowerCase() !== "carry over"
  )
);

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
          const category = categoryMetadata.find((cat) => cat.label === key);
          return category ? colors[category.color] : "#cccccc"; // Fallback color
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
