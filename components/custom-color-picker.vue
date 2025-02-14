<!-- components/ColorPicker.vue -->
<template>
  <div class="color-picker">
    <div class="flex flex-wrap gap-10 justify-center">
      <button
        v-for="color in colors"
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
});

const emit = defineEmits(["select-color"]);

const colors = [
  { name: "red", bg: "bg-red-500" },
  { name: "orange", bg: "bg-orange-500" },
  { name: "amber", bg: "bg-amber-500" },
  { name: "yellow", bg: "bg-yellow-500" },
  { name: "lime", bg: "bg-lime-500" },
  { name: "green", bg: "bg-green-500" },
  { name: "emerald", bg: "bg-emerald-500" },
  { name: "teal", bg: "bg-teal-500" },
  { name: "cyan", bg: "bg-cyan-500" },
  { name: "sky", bg: "bg-sky-500" },
  { name: "blue", bg: "bg-blue-500" },
  { name: "indigo", bg: "bg-indigo-500" },
  { name: "violet", bg: "bg-violet-500" },
  { name: "purple", bg: "bg-purple-500" },
  { name: "fuchsia", bg: "bg-fuchsia-500" },
  { name: "pink", bg: "bg-pink-500" },
  { name: "rose", bg: "bg-rose-500" },
  { name: "slate", bg: "bg-slate-500" },
];

const selectColor = (color) => {
  emit("select-color", color);
};
</script>

<style scoped>
.color-picker {
  @apply p-2  rounded-lg;
}
</style>
