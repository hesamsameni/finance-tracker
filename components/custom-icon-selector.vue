<template>
  <div>
    <!-- Enhanced Search input -->
    <div class="relative mb-4">
      <UInput v-model="searchQuery" type="text" placeholder="Search icons..." />
    </div>

    <div class="icons-grid" ref="iconsGrid">
      <div
        v-for="icon in visibleIcons"
        :key="icon"
        class="icon-item cursor-pointer"
        :class="{ 'selected-icon': isSelected(icon) }"
      >
        <UIcon
          :name="`fluent-emoji-high-contrast:${icon}`"
          class="h-7 w-7 transition-colors"
          :class="
            isSelected(icon)
              ? 'text-primary-500'
              : 'text-gray-700 hover:text-primary-500'
          "
          @click="selectIcon(`fluent-emoji-high-contrast:${icon}`)"
        />
      </div>
    </div>

    <div class="my-5 flex items-center gap-2" v-if="selectedIcon">
      <span class="text-sm text-gray-500">Preview:</span>
      <UIcon
        :name="selectedIcon"
        class="w-7 h-7"
        :class="`text-${selectedColor}-500`"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedIcon: String,
  selectedColor: String,
});

const searchQuery = ref("");
const iconNames = getIconNames();
const visibleCount = ref(5); // Number of icons to display initially
const iconsGrid = ref(null);

const filteredIcons = computed(() => {
  if (!searchQuery.value) return iconNames;
  return iconNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const visibleIcons = computed(() => {
  return filteredIcons.value.slice(0, visibleCount.value);
});

const emit = defineEmits(["select-icon"]);

const selectIcon = (icon) => {
  emit("select-icon", icon);
};

const isSelected = (icon) => {
  return props.selectedIcon === `fluent-emoji-high-contrast:${icon}`;
};
</script>

<style scoped>
.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
}

.selected-icon {
  border-color: #4caf50; /* Primary color */
  border-radius: 0.5rem;
}

/* Scrollbar styling */
.icons-grid::-webkit-scrollbar {
  width: 8px;
}

.icons-grid::-webkit-scrollbar-track {
  border-radius: 4px;
}

.icons-grid::-webkit-scrollbar-thumb {
  border-radius: 4px;
}
</style>
