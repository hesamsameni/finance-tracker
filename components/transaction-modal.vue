<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header> Add Transaction </template>
      <UForm :state="state" :schema="schema" ref="form" @submit="save">
        <UFormGroup
          label="Paid by"
          :required="true"
          name="paid_by"
          class="mb-5"
        >
          <USelect
            :options="household_users"
            placeholder="Who paid this?"
            v-model="state.paid_by"
          />
        </UFormGroup>

        <UFormGroup label="Title" :required="true" name="title" class="mb-5">
          <UInput
            type="text"
            placeholder="Enter the title..."
            icon="i-heroicons-currency-euro-solid"
            v-model="state.title"
          />
        </UFormGroup>

        <UFormGroup label="Amount" :required="true" name="amount" class="mb-5">
          <UInput
            type="number"
            placeholder="Enter the amount..."
            icon="i-heroicons-currency-euro-solid"
            v-model.number="state.amount"
          />
        </UFormGroup>

        <UFormGroup
          label="Date"
          :required="true"
          name="created_at"
          class="mb-5"
        >
          <UInput
            type="date"
            placeholder="Select the date"
            icon="i-heroicons-calendar-days-20-solid"
            v-model="state.created_at"
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
            v-model="state.description"
          />
        </UFormGroup>

        <UFormGroup
          label="Category"
          :required="true"
          name="category"
          class="mb-5"
          v-model="state.category"
        >
          <USelect :options="categories" placeholder="Category" />
        </UFormGroup>

        <UButton type="submit" color="black" variant="solid" label="Save" />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { categories, household_users } from "~/constants";

const props = defineProps({
  modelValue: Boolean,
});

const state = ref({
  paid_by: undefined,
  title: undefined,
  amount: 0,
  created_at: new Date().toISOString().split("T")[0],
  description: undefined,
  category: undefined,
  currency: "eur",
});

const emit = defineEmits(["update:modelValue"]);
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
