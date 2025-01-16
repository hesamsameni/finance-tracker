<template>
<div>
  <div v-if="loading" class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
    <USkeleton class="h-8 w-full"  />
  </div>
  <div v-else
    class="grid grid-cols-2 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold">
    <div class="flex items-center justify-between">
      {{ date }}
    </div>

    <div class="flex items-center justify-end mr-10">
      Total of the day: {{ currency }}
    </div>
  </div>
</div>
</template>

<script setup>
const props = defineProps({
  date: String,
  transactions: Object,
  loading: Boolean
});

const sum = computed(() => {
  let sum = 0
  for (const transaction of props.transactions){
    if(transaction.type === 'income') {
      sum += transaction.amount
    } else {
      sum -= transaction.amount
    }
  }
  return sum;
})

const { currency } = useCurrency(sum); 
</script>