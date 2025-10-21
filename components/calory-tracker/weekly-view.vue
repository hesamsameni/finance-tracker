<template>
  <div>
    <h3 class="text-xl font-semibold mb-4">Weekly Summary</h3>
    <!-- Weekly Totals -->
    <div
      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-md flex justify-between items-center"
    >
      <p class="font-semibold text-lg flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary-500 text-2xl" />
        Total Calories This Week:
      </p>
      <p class="font-bold text-lg">
        {{ weeklyTotals.calories.toLocaleString() }} kcal
      </p>
    </div>
    <!-- Weekly Insights -->
    <div>
      <h3 class="text-xl font-semibold mb-4">Weekly Insights</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <weekly-insight-pie :userDate="userDate" />
        <weekly-calory-bar :userDate="userDate" />
      </div>
    </div>
    <!-- Weekly Tiles -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="day in weekDates"
        :key="day.date"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-calendar"
              class="text-primary-500 text-2xl"
            />
            <p class="font-bold text-lg">
              <strong>{{ day.name }}</strong>
            </p>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ day.dateShort }}
          </p>
        </div>

        <ul class="text-sm space-y-1 mt-2">
          <li>
            <strong>🔥 Calories:</strong>
            {{ totalsByDay(day.date).calories.toFixed(1) }} kcal
          </li>
          <li>
            <strong>💪 Protein:</strong>
            {{ totalsByDay(day.date).protein.toFixed(1) }} g
          </li>
          <li>
            <strong>🍞 Carbs:</strong>
            {{ totalsByDay(day.date).carbs.toFixed(1) }} g
          </li>
          <li>
            <strong>🧈 Fat:</strong>
            {{ totalsByDay(day.date).fat.toFixed(1) }} g
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCaloryTracker } from "~/composables/calory-tracker/useCaloryTracker";
import { parseISO, startOfWeek, addDays, format } from "date-fns";
import WeeklyInsightPie from "~/components/calory-tracker/weekly-insight-pie.vue";
import WeeklyCaloryBar from "~/components/calory-tracker/weekly-calory-bar.vue";

const { getEntriesByMonth } = useCaloryTracker();
const userDate = defineProps<{ userDate: string }>();

const currentDate =
  typeof userDate === "string"
    ? userDate
    : new Date().toISOString().slice(0, 10);
const weekStart = startOfWeek(parseISO(currentDate));

// Generate 7 days with name and short format
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const dateObj = addDays(weekStart, i);
  return {
    date: format(dateObj, "yyyy-MM-dd"),
    name: format(dateObj, "EE"), // full day name
    dateShort: format(dateObj, "dd/MM"), // optional short date
  };
});

const mealsByDay = ref<Record<string, any[]>>({});

const fetchWeekMeals = async () => {
  const startStr = weekDates[0].date;
  const endStr = weekDates[weekDates.length - 1].date;
  const entries = (await getEntriesByMonth(startStr, endStr)) || [];
  const grouped: Record<string, any[]> = {};
  for (const e of entries) {
    const d = e.date;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  }
  for (const day of weekDates) {
    mealsByDay.value[day.date] = grouped[day.date] || [];
  }
};
fetchWeekMeals();

const totalsByDay = (date: string) => {
  const meals = mealsByDay.value[date] || [];
  return meals.reduce<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(
    (acc, m: any) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbs || 0;
      acc.fat += m.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

const weeklyTotals = computed(() => {
  return weekDates.reduce<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(
    (acc, day) => {
      const dayTotals = totalsByDay(day.date);
      acc.calories += dayTotals.calories;
      acc.protein += dayTotals.protein;
      acc.carbs += dayTotals.carbs;
      acc.fat += dayTotals.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
});
</script>
