<template>
  <UCard>
    <div>
      <div
        class="font-bold"
        :class="`text-${color}-600 dark:text-${color}-400`"
      >
        {{ title }}
      </div>

      <div class="text-2xl font-extrabold text-black dark:text-white mb-2">
        <USkeleton class="h-8 w-full" v-if="loading" />
        <div v-else>{{ currency }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  title: String,
  amount: Number,
  color: String,
  loading: Boolean,
  userId: String,
});
const { amount } = toRefs(props);
const { currency } = useCurrency(amount);
</script>
