<template>
  <div>
    <div
      v-if="loading"
      class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center"
    >
      <USkeleton class="h-8 w-full" />
    </div>
    <div v-else>
      <div
        class="hidden lg:grid lg:grid-cols-5 py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
      >
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:col-span-4"
        >
          <div class="flex items-center space-x-5 w-40 mb-5 lg:mb-0">
            <div
              class="inline-flex items-center rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700 group-hover:ring-primary/50"
            >
              <UIcon
                :name="categoryDetails.icon"
                :class="`text-${categoryDetails.color}-400 w-7 h-7`"
              />
            </div>
            <div class="flex-1">
              <div
                class="font-bold truncate max-w-[100px] overflow-hidden whitespace-nowrap"
                :title="formatTitle(expense.title)"
              >
                {{ formatTitle(expense.title) }}
              </div>
            </div>
          </div>
          <div class="mb-0 text-left">
            <div>{{ formatTitle(paidByNickname) }}</div>
          </div>
          <div class="lg:flex lg:flex-col lg:items-center">
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
      <div class="flex flex-col lg:hidden">
        <UCard class="mb-5">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="text-right mb-2">
                {{ formattedDate }}
              </div>
              <div>
                <UDropdown
                  :items="items"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    color="white"
                    variant="ghost"
                    trailing-icon="i-heroicons-ellipsis-horizontal"
                    :loading="isLoading"
                  />
                </UDropdown>
              </div>
            </div>
          </template>
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div
                class="inline-flex items-center rounded-full p-4 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700 group-hover:ring-primary/50"
              >
                <UIcon
                  :name="categoryDetails.icon"
                  :class="`text-${categoryDetails.color}-400 w-7 h-7`"
                />
              </div>
              <div>
                <div
                  class="font-bold truncate max-w-[100px] overflow-hidden whitespace-nowrap"
                  :title="formatTitle(expense.title)"
                >
                  {{ formatTitle(expense.title) }}
                </div>
                <div :class="`text-xs text-${categoryDetails.color}-400`">
                  {{ expense.category }}
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-end space-x-4">
              <div class="text-right mb-2">{{ currency }}</div>
              <div class="text-right">{{ formatTitle(paidByNickname) }}</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from "date-fns";
import { categories } from "~/constants";

const props = defineProps({
  expense: Object,
  loading: Boolean,
  members: Object,
});
const { currency } = useCurrency(props.expense.amount);
const { toastError, toastSuccess } = useAppToast();
const emit = defineEmits(["deleted"]);
const isLoading = ref(false);
const supabase = useSupabaseClient();

const formattedDate = computed(() => {
  // Parse and format the date
  return format(new Date(props.expense.purchase_date), "do MMMM yyyy");
});

const paidByNickname = computed(() => {
  const member = props.members.find(
    (member) => member.user_id === props.expense.paid_by
  );
  return member ? member.user_nickname : "Unknown";
});

// Map category to its corresponding icon and color
const categoryDetails = computed(() => {
  const category = categories.find(
    (cat) => cat.label === props.expense.category
  );
  return category
    ? { icon: category.icon, color: category.color }
    : { icon: "i-heroicons-question-mark-circle-20-solid", color: "gray" }; // Default values if not found
});

const deleteExpense = async () => {
  isLoading.value = true;

  try {
    const { error } = await supabase
      .from("board_expenses")
      .delete()
      .eq("id", props.expense.id);

    if (error) {
      toastError({
        title: "Something went wrong!",
        description: error.message,
      });
    } else {
      toastSuccess({
        title: "Expense Deleted",
      });
      emit("deleted", props.expense.id);
    }
  } catch (exception) {
    toastError({
      title: "Something went wrong!",
      description: exception.message,
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
      click: deleteExpense,
    },
  ],
];

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};
</script>
