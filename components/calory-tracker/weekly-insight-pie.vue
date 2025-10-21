<template>
  <div class="chart-wrapper">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { toDate, toYmd } from "~/utils/date";
import { useCaloryTracker } from "~/composables/calory-tracker/useCaloryTracker";
import { parseISO, startOfWeek, addDays, format } from "date-fns";

const props = defineProps<{ userDate?: string | Date }>();

const { getEntriesByDate } = useCaloryTracker();
const meals = ref<any[]>([]);

// Build week start using safe date conversion
const baseDate = toDate(props.userDate);
const weekStart = startOfWeek(baseDate); // startOfWeek accepts Date

// fetch meals for the week safely
const fetchWeekMeals = async () => {
  meals.value = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = format(d, "yyyy-MM-dd"); // string used by supabase queries
    const entries = (await getEntriesByDate(key)) || [];
    meals.value.push(...entries);
  }
};
await fetchWeekMeals();

const macroTotals = computed(() =>
  meals.value.reduce(
    (acc, m) => {
      acc.protein += Number(m.protein || 0);
      acc.carbs += Number(m.carbs || 0);
      acc.fat += Number(m.fat || 0);
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  )
);

const chartOptions = computed(() => ({
  tooltip: { trigger: "item" },
  series: [
    {
      name: "Macros",
      type: "pie",
      radius: ["40%", "70%"],
      label: { formatter: "{b}: {d}%" },
      data: [
        {
          value: macroTotals.value.protein,
          name: "Protein",
          itemStyle: { color: "#22c55e" },
        },
        {
          value: macroTotals.value.carbs,
          name: "Carbs",
          itemStyle: { color: "#3b82f6" },
        },
        {
          value: macroTotals.value.fat,
          name: "Fat",
          itemStyle: { color: "#f97316" },
        },
      ],
    },
  ],
}));
</script>

<style scoped>
.chart-wrapper {
  width: 350px;
  height: 350px;
}
</style>
