<template>
  <div>
    <div
      v-if="loading"
      class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
    >
      <USkeleton class="h-8 w-full" />
    </div>
    <div
      v-else
      class="grid grid-cols-3 py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
    >
      <div class="flex items-center justify-between space-x-4 col-span-2">
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-arrow-up-right" class="text-green-600" />
          <div class="flex items-center space-x-1">
            <div>{{ formatTitle(transaction.description) }}</div>
          </div>
        </div>
        <div>
          <UBadge color="white">Bills</UBadge>
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
              :loading="isLoading"
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
  loading: Boolean,
});
const { currency } = useCurrency(props.transaction.amount);
const toast = useToast();
const emit = defineEmits(["deleted"]);
const isLoading = ref(false);
const supabase = useSupabaseClient();
const deteleTransaction = async () => {
  isLoading.value = true;

  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", props.transaction.id);

    if (error) {
      toast.add({
        title: "Something Happened!",
        description: error.message,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
        timeout: 0,
      });
    } else {
      toast.add({
        title: "Transaction Deleted",
        icon: "i-heroicons-check-circle",
        color: "green",
        timeout: 4000,
      });
      emit("deleted", props.transaction.id);
    }
  } catch (exception) {
    toast.add({
      title: "Unexpected Error!",
      description: exception.message,
      icon: "i-heroicons-exclamation-circle",
      color: "red",
      timeout: 0,
    });
  } finally {
    isLoading.value = false;
  }
};

const items = [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: deteleTransaction,
    },
  ],
];

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};
</script>
