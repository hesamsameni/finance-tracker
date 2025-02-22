<template>
  <div class="my-4">
    <div class="font-bold" :class="`text-${color}-600 dark:text-${color}-400`">
      {{ title }}
    </div>

    <div
      class="text-sm lg:text-2xl font-semibold text-black dark:text-white mb-2"
    >
      <USkeleton class="h-8 w-full" v-if="loading" />
      <div v-else>{{ formattedCurrency }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  amount: Number,
  color: String,
  loading: Boolean,
  userId: String,
  currency: String,
});
const { amount } = toRefs(props);
const { formattedCurrency } = useCurrency(amount, props.currency);
</script>
