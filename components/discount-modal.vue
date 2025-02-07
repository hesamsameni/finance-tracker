<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Add Discount </template>
      <UForm ref="form">
        <UFormGroup
          label="Who paid it?"
          :required="true"
          name="paid_by"
          class="mb-5"
        >
          <UInput />
        </UFormGroup>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
const form = ref();
// Define props for the component
const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "saved"]);

const resetForm = () => {
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
