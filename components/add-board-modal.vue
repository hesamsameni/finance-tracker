<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header> Create a new table </template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup label="Title" :required="true" name="title" class="mb-5">
          <UInput
            type="text"
            placeholder="Enter the title..."
            v-model="state.title"
          />
        </UFormGroup>

        <UFormGroup
          label="Currency"
          :required="true"
          name="currency"
          class="mb-5"
        >
          <UInput type="text" v-model="state.currency" />
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
import { z } from "zod"; // Import Zod for schema validation
import { nanoid } from "nanoid";
// Define props for the component
const props = defineProps({
  modelValue: Boolean,
});

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const toast = useToast();
const inviteToken = nanoid(16);
// Reactive state to store form data
const initialState = ref({
  title: undefined,
  currency: "eur",
  invite_token: inviteToken,
});

const state = ref({ ...initialState.value });

// Schema for validating form data using Zod
const schema = z.object({
  title: z.string(), // Title must be a string
  category: z.string(),
});

const saveForm = async () => {
  if (form.value.errors.length) return;

  isLoading.value = true;
  try {
    const { data: board, error } = await supabase
      .from("boards")
      .upsert({ ...state.value })
      .select();

    const boardId = board[0].id;
    if (!error && boardId) {
      const { error } = await supabase
        .from("board_members")
        .insert({ board_id: boardId, role: "owner" });

      if (!error) {
        toast.add({
          title: "Board created!",
        });
      }

      isOpen.value = false;
      emit("saved");
    }
  } catch (e) {
    toast.add({
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
