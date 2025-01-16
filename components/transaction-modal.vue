<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header> Add Transaction </template>

      <UFormGroup
        label="Transaction Type"
        :required="true"
        name="transaction_type"
        class="mb-5"
      >
        <USelect
          :options="transaction_types"
          placeholder="Select the transaction type"
        />
      </UFormGroup>

      <UFormGroup label="Title" :required="true" name="title" class="mb-5">
        <UInput
          type="text"
          placeholder="Enter the title..."
          icon="i-heroicons-currency-euro-solid"
        />
      </UFormGroup>

      <UFormGroup label="Amount" :required="true" name="amount" class="mb-5">
        <UInput
          type="number"
          placeholder="Enter the amount..."
          icon="i-heroicons-currency-euro-solid"
        />
      </UFormGroup>

      <UFormGroup label="Date" :required="true" name="created_at" class="mb-5">
        <UInput
          type="date"
          placeholder="Select the date"
          icon="i-heroicons-calendar-days-20-solid"
        />
      </UFormGroup>

      <UFormGroup
        label="Description"
        name="description"
        hint="Optional"
        class="mb-5"
      >
        <UInput
          placeholder="This is the description"
          icon="i-heroicons-pencil-20-solid"
        />
      </UFormGroup>

      <UFormGroup
        label="Category"
        :required="true"
        name="category"
        class="mb-5"
      >
        <USelect :options="categories" placeholder="Category" />
      </UFormGroup>

      <UButton type="submit" color="black" variant="solid" label="Save" />
    </UCard>
  </UModal>
</template>

<script setup>
import { categories, transaction_types } from "~/constants";
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
