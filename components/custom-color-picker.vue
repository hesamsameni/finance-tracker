<template>
  <div class="color-picker">
    <div class="grid grid-cols-3 lg:grid-cols-6 gap-10 justify-items-center">
      <button
        v-for="color in filteredColors"
        :key="color.name"
        class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
        :class="[
          color.bg,
          selectedColor === color.name
            ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
            : 'hover:scale-105',
        ]"
        @click="selectColor(color.name)"
      >
        <UIcon
          v-if="selectedColor === color.name"
          name="i-heroicons-check"
          class="w-4 h-4 text-white"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedColor: String,
  usedColors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["select-color"]);

const colors = [
  { name: "red", bg: "bg-red-400" },
  { name: "orange", bg: "bg-orange-400" },
  { name: "amber", bg: "bg-amber-400" },
  { name: "yellow", bg: "bg-yellow-400" },
  { name: "lime", bg: "bg-lime-400" },
  { name: "green", bg: "bg-green-400" },
  { name: "emerald", bg: "bg-emerald-400" },
  { name: "teal", bg: "bg-teal-400" },
  { name: "cyan", bg: "bg-cyan-400" },
  { name: "sky", bg: "bg-sky-400" },
  { name: "blue", bg: "bg-blue-400" },
  { name: "indigo", bg: "bg-indigo-400" },
  { name: "violet", bg: "bg-violet-400" },
  { name: "purple", bg: "bg-purple-400" },
  { name: "fuchsia", bg: "bg-fuchsia-400" },
  { name: "pink", bg: "bg-pink-400" },
  { name: "rose", bg: "bg-rose-400" },
  { name: "slate", bg: "bg-slate-400" },
];

const filteredColors = ref([]);

const updateFilteredColors = () => {
  filteredColors.value = colors.filter((color) => {
    // Allow the color if it's not used or if it's the currently selected one.
    return (
      !props.usedColors.includes(color.name) ||
      props.selectedColor === color.name
    );
  });
};

watch(() => [props.usedColors, props.selectedColor], updateFilteredColors, {
  deep: true,
  immediate: true,
});

const selectColor = (color) => {
  emit("select-color", color);
};
</script>

<style scoped>
.color-picker {
  @apply p-2  rounded-lg;
}
</style>
