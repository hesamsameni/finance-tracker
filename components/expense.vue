<template>
  <div>
    <div
      v-if="loading"
      class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center"
    >
      <USkeleton class="h-8 w-full" />
    </div>
    <div
      v-else
      class="grid grid-cols-5 py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
    >
      <div class="flex items-center justify-between space-x-4 col-span-4">
        <div class="flex items-center space-x-5 w-40">
          <UAvatar
            size="xs"
            src="https://avatars.githubusercontent.com/u/739984?v=4"
            alt="Avatar"
          />
          <div class="flex-1">
            <div
              class="truncate max-w-[100px] overflow-hidden whitespace-nowrap"
              :title="formatTitle(expense.title)"
            >
              {{ formatTitle(expense.title) }}
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div>{{ formatTitle(expense.paid_by) }}</div>
        </div>
        <div class="flex flex-col items-center w-24">
          <UBadge
            :icon="categoryIcons[expense.category]"
            size="sm"
            color="primary"
            variant="outline"
            :label="expense.category"
            :trailing="false"
          />
        </div>
        <div class="flex flex-col items-center">
          {{ formattedDate }}
        </div>
      </div>
      <div class="flex items-center justify-end">
        <div class="text-center">{{ currency }}</div>
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
import { format } from "date-fns";

const props = defineProps({
  expense: Object,
  loading: Boolean,
});
const { currency } = useCurrency(props.expense.amount);
const toast = useToast();
const emit = defineEmits(["deleted"]);
const isLoading = ref(false);
const supabase = useSupabaseClient();

const formattedDate = computed(() => {
  // Parse and format the date
  return format(new Date(props.expense.purchase_date), "do MMMM yyyy");
});

const deleteExpense = async () => {
  isLoading.value = true;

  try {
    const { error } = await supabase
      .from("temp_household_transactions")
      .delete()
      .eq("id", props.expense.id);

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
      emit("deleted", props.expense.id);
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

const categoryIcons = {
  Grocery: "i-heroicons-shopping-cart-20-solid",
  Rent: "i-heroicons-home-20-solid",
  Bills: "i-heroicons-banknotes-20-solid",
  "Eat out": "material-symbols:fork-spoon", // Example, you can customize the icon name
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
      click: deleteExpense,
    },
  ],
];

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};
</script>
