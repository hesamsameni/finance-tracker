<template>
  <div>
    <ExpenseModal
      v-model="isEdittingModalOpen"
      :expense="expense"
      :categories="categories"
      @saved="emit('edited')"
    />

    <!-- Desktop Row -->
    <div
      class="hidden lg:grid grid-cols-6 items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div class="col-span-2 flex items-center gap-3 min-w-0">
        <div
          class="inline-flex shrink-0 items-center rounded-full p-2.5 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
        >
          <UIcon
            :name="categoryDetails.icon"
            :class="`text-${categoryDetails.color}-400 w-5 h-5`"
          />
        </div>
        <div class="min-w-0">
          <div
            class="font-semibold text-sm truncate text-gray-900 dark:text-gray-100"
            :title="formatTitle(expense.title)"
          >
            {{ formatTitle(expense.title) }}
          </div>
          <div :class="`text-xs text-${categoryDetails.color}-400`">
            {{ expense.category }}
          </div>
        </div>
      </div>

      <div
        class="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400"
      >
        <span class="w-24 truncate">{{ formatTitle(paidByNickname) }}</span>
        <span>{{ formattedDate }}</span>
      </div>

      <div class="col-span-2 flex items-center justify-end gap-3">
        <span class="font-semibold text-sm text-gray-900 dark:text-gray-100">{{
          formattedCurrency
        }}</span>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            variant="ghost"
            trailing-icon="i-heroicons-ellipsis-horizontal"
            :loading="isLoading"
            size="xs"
          />
        </UDropdown>
      </div>
    </div>

    <!-- Mobile Row -->
    <div
      class="lg:hidden flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="inline-flex shrink-0 items-center rounded-full p-2 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
        >
          <UIcon
            :name="categoryDetails.icon"
            :class="`text-${categoryDetails.color}-400 w-4 h-4`"
          />
        </div>
        <div class="min-w-0">
          <div
            class="text-sm font-semibold truncate text-gray-900 dark:text-gray-100"
            :title="formatTitle(expense.title)"
          >
            {{ formatTitle(expense.title) }}
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {{ expense.category }} · {{ formattedDate }}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0 ml-3">
        <div class="text-right mr-1">
          <div class="text-sm font-semibold text-primary-500">
            {{ formattedCurrency }}
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500">
            {{ formatTitle(paidByNickname) }}
          </div>
        </div>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            variant="ghost"
            trailing-icon="i-heroicons-ellipsis-horizontal"
            :loading="isLoading"
            size="xs"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from "date-fns";

const props = defineProps({
  expense: Object,
  members: Object,
  categories: Array,
  currency: String,
});

const isEdittingModalOpen = ref(false);
const { formattedCurrency } = useCurrency(props.expense.amount, props.currency);
const { toastError, toastSuccess } = useAppToast();
const emit = defineEmits(["deleted", "edited"]);
const isLoading = ref(false);
const supabase = useSupabaseClient();

const formattedDate = computed(() => {
  // Parse and format the date
  return format(new Date(props.expense.purchase_date), "do MMM yyyy");
});

const paidByNickname = computed(() => {
  const member = props.members.find(
    (member) => member.user_id === props.expense.paid_by,
  );
  return member ? member.user_nickname : "Unknown";
});

const categoryDetails = computed(() => {
  if (props.categories && props.categories.length > 0) {
    const category = props.categories.find(
      (cat) => cat.label === props.expense.category,
    );
    return category
      ? {
          icon: category.icon || "i-heroicons-question-mark-circle-20-solid",
          color: category.color || "gray",
        }
      : {
          icon: "i-heroicons-question-mark-circle-20-solid",
          color: "gray",
        };
  }
  return { icon: "i-heroicons-question-mark-circle-20-solid", color: "gray" };
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
      click: () => (isEdittingModalOpen.value = true),
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
