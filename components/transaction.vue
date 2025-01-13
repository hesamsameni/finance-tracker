<template>
<div>
  <div v-if="loading" class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
    <USkeleton class="h-8 w-full"  />
  </div>
  <div v-else
    class="grid grid-cols-2 py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <UIcon name="i-heroicons-arrow-up-right" class="text-green-600" />
        <div class="flex items-center space-x-1">
          <div>{{ formatTitle(transaction.type) }}</div>
          <div class="text-xs font-light text-gray-400">
            ({{ formatTitle(transaction.description) }})
          </div>
        </div>
      </div>
      <div>
        <UBadge color="white">Bills</UBadge>
        <UBadge color="white">Grocerries</UBadge>
        <UBadge color="white">Rent</UBadge>
      </div>
    </div>
    <div class="flex items-center justify-end">
      <div>{{ currency }}</div>
      <div>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            variant="ghost"
            trailing-icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
const props = defineProps({
  transaction: Object,
  loading: Boolean
});
const { currency } = useCurrency(props.transaction.amount);

const items = [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
    },
  ],
];

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};
</script>