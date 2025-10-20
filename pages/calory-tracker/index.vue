<template>
  <div>
    <!-- Header Tabs -->
    <section class="flex flex-row flex-row items-center justify-between mb-4">
      <div class="flex justify-start items-center gap-2">
        <div v-for="view in views" :key="view">
          <span
            class="cursor-pointer capitalize"
            :class="{
              'text-primary-500 font-medium': selectedView === view,
              'text-gray-500': selectedView !== view,
            }"
            @click="selectedView = view"
          >
            {{ view }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-2 lg:mt-0">
        <!-- Date picker -->
        <UInput
          type="date"
          v-model="selectedDate"
          @change="fetchMealsForDate"
        />
      </div>
    </section>

    <!-- AI Input Section -->
    <section class="mb-4">
      <UTextarea
        v-model="aiPrompt"
        placeholder="Describe your meals..."
        class="w-full"
        rows="4"
      />
      <div class="flex justify-end mt-2">
        <UButton
          icon="i-heroicons-sparkles"
          color="primary"
          variant="solid"
          label="Let AI Track"
          size="sm"
          :loading="aiLoading"
          @click="analyzeMeals"
        />
      </div>
    </section>

    <!-- DAILY VIEW -->
    <section v-if="selectedView === 'daily'">
      <div class="mb-6">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
          <h3 class="text-sm mb-4">
            Totals for
            <span class="text-lg font-semibold text-primary-500">{{
              formattedDate
            }}</span>
          </h3>

          <ul class="text-sm mt-2">
            <li class="mb-4">
              <strong>🔥 Calories:</strong>
              {{ macroTotals.calories.toLocaleString() }} kcal
            </li>
            <li class="mb-4">
              <strong>💪 Protein:</strong>
              {{ macroTotals.protein.toFixed(1) }} g
            </li>
            <li class="mb-4">
              <strong>🍞 Carbs:</strong> {{ macroTotals.carbs.toFixed(1) }} g
            </li>
            <li><strong>🧈 Fat:</strong> {{ macroTotals.fat.toFixed(1) }} g</li>
          </ul>
        </div>
      </div>

      <!-- Meals grouped by type -->
      <div
        v-for="type in mealTypesOrdered"
        :key="type"
        class="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
      >
        <div
          class="flex justify-between items-center bg-gray-100 dark:bg-gray-900 px-4 py-2 cursor-pointer"
          @click="toggleSection(type)"
        >
          <h4 class="font-medium capitalize">
            {{ type }}
            <span class="text-sm text-primary-500"
              >({{ caloriesByType(type) }} kcal)</span
            >
          </h4>
          <UIcon
            :name="
              openSections[type]
                ? 'i-heroicons-chevron-up'
                : 'i-heroicons-chevron-down'
            "
          />
        </div>
        <div v-show="openSections[type]" class="p-3 bg-white dark:bg-gray-900">
          <div v-for="meal in mealsByType(type)" :key="meal.id" class="mb-2">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ meal.item }}</p>
                <p class="text-sm text-gray-500">
                  {{ meal.calories }} kcal · {{ meal.protein }}g P ·
                  {{ meal.carbs }}g C · {{ meal.fat }}g F
                </p>
              </div>
              <UButton
                icon="i-heroicons-trash"
                color="red"
                variant="ghost"
                size="xs"
                @click="deleteMeal(meal.id)"
              />
            </div>
          </div>
          <div
            v-if="mealsByType(type).length === 0"
            class="text-gray-500 text-sm"
          >
            No meals logged for {{ type }}.
          </div>
        </div>
      </div>
    </section>

    <!-- WEEKLY VIEW -->
    <weekly-view v-if="selectedView === 'weekly'" :userDate="selectedDate" />

    <!-- MONTHLY VIEW -->
    <monthly-view v-if="selectedView === 'monthly'" :userDate="selectedDate" />
  </div>
</template>

<script setup lang="ts">
import { useCaloryTracker } from "~/composables/useCaloryTracker";
import WeeklyView from "~/components/calory-tracker/weekly-view.vue";
import MonthlyView from "~/components/calory-tracker/monthly-view.vue";
import { format, parseISO } from "date-fns";

const aiPrompt = ref("");
const aiLoading = ref(false);
const selectedView = ref<"daily" | "weekly" | "monthly">("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));

const { getEntriesByDate, addEntry, deleteEntry } = useCaloryTracker();
const meals = ref<any[]>([]);

// Meal types
const mealTypesOrdered = ["breakfast", "lunch", "dinner", "snack"];
const openSections = reactive({
  breakfast: false,
  lunch: false,
  dinner: false,
  snack: false,
});

const toggleSection = (type: string) => {
  openSections[type] = !openSections[type];
};

const mealsByType = (type: string) =>
  meals.value.filter((m) => m.meal_type === type);
const caloriesByType = (type: string) =>
  mealsByType(type).reduce((acc, m) => acc + m.calories, 0);

const macroTotals = computed(() =>
  meals.value.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
);

const fetchMealsForDate = async () => {
  meals.value = (await getEntriesByDate(selectedDate.value)) || [];
};
fetchMealsForDate();

const analyzeMeals = async () => {
  if (!aiPrompt.value.trim()) return;
  aiLoading.value = true;
  try {
    const { meals: aiMeals } = await $fetch("/api/calory-tracker", {
      method: "POST",
      body: { prompt: aiPrompt.value },
    });

    for (const meal of aiMeals || []) {
      await addEntry({ ...meal, date: selectedDate.value });
    }
    await fetchMealsForDate();
    aiPrompt.value = "";
  } finally {
    aiLoading.value = false;
  }
};

const deleteMeal = async (id: string) => {
  await deleteEntry(id);
  meals.value = meals.value.filter((m) => m.id !== id);
};

const formattedDate = computed(() => {
  if (!selectedDate.value) return "";
  const dateObj = parseISO(selectedDate.value);
  return format(dateObj, "do MMMM yyyy"); // e.g., 20th October 2025
});

// Tab options
const views = ["daily", "weekly", "monthly"];
</script>
