<template>
  <div>
    <h3 class="text-xl font-semibold mb-4">
      Monthly Summary – {{ monthName }}
    </h3>

    <!-- Monthly Totals -->
    <div
      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-md flex justify-between items-center"
    >
      <p class="font-semibold text-lg flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary-500 text-2xl" />
        Total Calories This Month:
      </p>
      <p class="font-bold text-lg">
        {{ monthlyTotals.calories.toLocaleString() }} kcal
      </p>
    </div>
    <!-- Monthly Tiles -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="day in monthDates"
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
import { parseISO, startOfMonth, endOfMonth, addDays, format } from "date-fns";

const { getEntriesByMonth } = useCaloryTracker();
const userDate = defineProps<{ userDate: string }>();

const currentDate =
  typeof userDate === "string"
    ? userDate
    : new Date().toISOString().slice(0, 10);

const start = startOfMonth(parseISO(currentDate));
const end = endOfMonth(parseISO(currentDate));

const monthDates: {
  date: string;
  name: string;
  dateShort: string;
}[] = [];

for (let d = start; d <= end; d = addDays(d, 1)) {
  monthDates.push({
    date: format(d, "yyyy-MM-dd"),
    name: format(d, "EE"), // Day name
    dateShort: format(d, "MM/dd"),
  });
}

const monthName = format(start, "MMMM yyyy"); // e.g., October 2025

const mealsByDay = ref<Record<string, any[]>>({});

const fetchMonthMeals = async () => {
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");
  const entries = (await getEntriesByMonth(startStr, endStr)) || [];
  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const e of entries) {
    const d = e.date;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  }
  // Ensure every day of month has an array (even empty)
  for (const day of monthDates) {
    mealsByDay.value[day.date] = grouped[day.date] || [];
  }
};
fetchMonthMeals();

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

const monthlyTotals = computed(() => {
  return monthDates.reduce<{
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
