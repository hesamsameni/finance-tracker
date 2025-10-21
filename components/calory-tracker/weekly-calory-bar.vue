<template>
  <div class="chart-wrapper">
    <v-chart :option="chartOptions" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { toDate } from "~/utils/date";
import { useCaloryTracker } from "~/composables/calory-tracker/useCaloryTracker";
import { startOfWeek, addDays, format } from "date-fns";

const props = defineProps<{ userDate?: string | Date }>();
const { getEntriesByDate } = useCaloryTracker();

const baseDate = toDate(props.userDate);
const weekStart = startOfWeek(baseDate);

const days = Array.from({ length: 7 }).map((_, i) => {
  const dateObj = addDays(weekStart, i);
  return { name: format(dateObj, "EEE"), date: format(dateObj, "yyyy-MM-dd") };
});

const dailyCalories = ref<number[]>([]);
const fetchData = async () => {
  dailyCalories.value = [];
  for (const day of days) {
    const entries = (await getEntriesByDate(day.date)) || [];
    const total = entries.reduce((s, m) => s + Number(m.calories || 0), 0);
    dailyCalories.value.push(total);
  }
};
await fetchData();

const chartOptions = computed(() => ({
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: days.map((d) => d.name) },
  yAxis: { type: "value", name: "Calories" },
  series: [
    {
      data: dailyCalories.value,
      type: "bar",
      barWidth: "60%",
      itemStyle: { color: "#3b82f6", borderRadius: [6, 6, 0, 0] },
    },
  ],
}));
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 300px;
}
</style>
