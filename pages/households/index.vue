<template>
  <h1 class="mb-10">Household List</h1>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <div v-for="household in households" :key="household.id">
      <div>
        <nuxt-link
          :to="`/households/${household.id}`"
          class="block px-6 py-8 border not-prose rounded-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
          ><div
            class="inline-flex items-center rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700 mb-4 group-hover:ring-primary/50"
          >
            <UIcon name="i-heroicons-home" class="text-green-600" />
          </div>
          <p class="font-medium text-gray-900 dark:text-white text-[15px] mb-1">
            {{ household.title }}
          </p>
          <p
            class="text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2"
          >
            Check the list of expenses of {{ household.title }} household.
          </p></nuxt-link
        >
      </div>
    </div>
    <div v-if="households.length === 0">No households found.</div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient(); // Initializing the Supabase client
const households = ref([]); // Reactive array to hold transactions
const isLoading = ref(false); // Reactive boolean to indicate loading state
const refreshHouseholds = async () => {
  households.value = await fetchHouseholds(); // Update transactions after fetching
};

const fetchHouseholds = async () => {
  isLoading.value = true; // Start loading
  try {
    const { data, error } = await supabase
      .from("temp_household_users")
      .select(
        `
          temp_list_of_households (id, title)
        `
      )
      .eq("user_id", "1");

    if (error) {
      console.error("Error fetching households:", error);
      return [];
    }

    // Map data to a flat array for easier use in the template
    return data.map((record) => record.temp_list_of_households);
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  } finally {
    isLoading.value = false; // End loading
  }
};

await refreshHouseholds();
</script>
