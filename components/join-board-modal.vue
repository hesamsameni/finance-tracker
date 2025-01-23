<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Join a board </template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup
          label="Invite code"
          :required="true"
          name="invite_token"
          class="mb-5"
        >
          <UInput type="text" v-model="state.invite_token" />
        </UFormGroup>

        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Join"
          @click="saveForm"
          :loading="isLoading"
        />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { z } from "zod"; // Import Zod for schema validation
// Define props for the component
const props = defineProps({
  modelValue: Boolean,
});

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();

const { toastError, toastSuccess } = useAppToast();

// Reactive state to store form data
const initialState = ref({
  invite_token: undefined,
});

const state = ref({ ...initialState.value });

// Schema for validating form data using Zod
const schema = z.object({
  invite_token: z.string(), // Title must be a string
});

const saveForm = async () => {
  if (form.value.errors.length) return;

  isLoading.value = true;
  try {
    // Step 1: Check if the invite code corresponds to a valid board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select()
      .eq("invite_token", "Ixu1wA6VYsLuYDdE");

    if (boardError) {
      throw new Error("Invalid invite code or board not found.");
    }
    const boardId = board[0].id;
    const boardTitle = board[0].title;

    if (!boardError && boardId) {
      // Step 2: Add the current user to the board as a member
      const { error: memberError } = await supabase
        .from("board_members")
        .insert([
          {
            board_id: boardId,
            role: "member", // You can change the role if needed
          },
        ]);
      if (memberError) {
        throw new Error("Failed to add user to the board.");
      }
      toastSuccess({
        title: "Successfully joined the board!",
        description: `You have successfully joined the ${boardTitle} board`,
      });
    }

    // Close the modal and emit events
    isOpen.value = false;
    emit("joined");
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
const emit = defineEmits(["update:modelValue", "joined"]);
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
