<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Add Expense </template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup
          label="Paid by"
          :required="true"
          name="paid_by"
          class="mb-5"
        >
          <USelect
            :options="members"
            option-attribute="user_id"
            value-attribute="user_id"
            placeholder="Who paid this?"
            v-model="state.paid_by"
          />
        </UFormGroup>

        <UFormGroup label="Title" :required="true" name="title" class="mb-5">
          <UInput
            type="text"
            placeholder="Enter the title..."
            v-model="state.title"
          />
        </UFormGroup>

        <UFormGroup label="Amount" :required="true" name="amount" class="mb-5">
          <UInput
            type="number"
            placeholder="Enter the amount..."
            v-model.number="state.amount"
          />
        </UFormGroup>

        <UFormGroup
          label="Date"
          :required="true"
          name="purchase_date"
          class="mb-5"
        >
          <UInput
            type="date"
            placeholder="Select the date"
            v-model="state.purchase_date"
          />
        </UFormGroup>

        <UFormGroup
          label="Category"
          :required="true"
          name="category"
          class="mb-5"
        >
          <USelect
            :options="
              categories.map((category) => ({
                label: category.label,
                value: category.label,
                icon: category.icon,
              }))
            "
            placeholder="Category"
            v-model="state.category"
          >
            <template #option="{ option }">
              {{ option.label }}
            </template>
          </USelect>
        </UFormGroup>

        <UFormGroup
          label="Description"
          name="description"
          hint="Optional"
          class="mb-5"
        >
          <UTextarea
            placeholder="This is the description"
            icon="i-heroicons-pencil-20-solid"
            v-model="state.description"
          />
        </UFormGroup>

        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Save"
          @click="saveForm"
          :loading="isLoading"
        />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { categories } from "~/constants";
import { z } from "zod"; // Import Zod for schema validation

// Define props for the component
const props = defineProps({
  modelValue: Boolean,
  members: Object,
});

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const route = useRoute();
const { toastError, toastSuccess } = useAppToast();
// Reactive state to store form data
const initialState = ref({
  paid_by: undefined,
  title: undefined,
  amount: 0,
  purchase_date: new Date().toISOString().split("T")[0], // Default to today's date
  description: undefined,
  category: undefined,
  created_at: new Date(),
  board_id: route.params.id,
});

const state = ref({ ...initialState.value });

// Schema for validating form data using Zod
const schema = z.object({
  title: z.string(), // Title must be a string
  amount: z.number().positive("Enter a valid amount!"), // Amount must be a positive number
  date: z.string(), // Date must be a string
});

const saveForm = async () => {
  if (form.value.errors.length) return;

  isLoading.value = true;
  try {
    const { error } = await supabase
      .from("board_expenses")
      .upsert({ ...state.value });
    if (!error) {
      toastSuccess({ title: "Expense Added" });
      isOpen.value = false;
      emit("saved");
    }
  } catch (e) {
    toastError({
      title: "Something went wrong!",
      description: e.message,
    });
  } finally {
    isLoading.value = false;
  }
};

// Emit an event to sync the modelValue with the parent component
const emit = defineEmits(["update:modelValue", "saved"]);
const resetForm = () => {
  Object.assign(state.value, { ...initialState.value }); // Create a fresh copy of initialState

  form.value?.clear();
};
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});
</script>
