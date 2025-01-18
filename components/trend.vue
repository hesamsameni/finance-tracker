<template>
  <div>
    <div class="font-bold text-green-600 dark:text-green-400;">
      {{ title }}
    </div>

    <div class="text-2xl font-extrabold text-black dark:text-white mb-2">
      <USkeleton class="h-8 w-full" v-if="loading" />
      <div v-else>{{ currency }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  amount: Number,
  loading: Boolean,
});
const { amount } = toRefs(props);
const { currency } = useCurrency(amount);
</script>
