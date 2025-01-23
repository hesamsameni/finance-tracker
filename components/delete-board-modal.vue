<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header> Deleting the board </template>
      <p>Are you sure you want to delete {{ board.title }} ?</p>
      <p class="text-gray-700 text-sm/4 mt-1">
        It will be hidden and we will delete it after 30 days, if you changed
        your mind please contact us to restore it.
      </p>
      <div class="grid mt-4">
        <UButton
          class="mb-4"
          color="red"
          variant="solid"
          label="Yes, delete the board"
          :loading="isLoading"
          @click="deleteBoard"
        />
        <UButton
          color="black"
          variant="solid"
          label="No, I changed my mind"
          :loading="isLoading"
          @click="isOpen = false"
        />
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
// Define props for the component
const props = defineProps({
  modelValue: Boolean,
  board: Object,
});
const isLoading = ref(false);
const supabase = useSupabaseClient();
const { toastError, toastSuccess } = useAppToast();
const emit = defineEmits(["update:modelValue", "deleted"]);

const deleteBoard = async () => {
  isLoading.value = true;

  try {
    // Step 1: Update the 'visible' column to false (soft delete)
    const { error } = await supabase
      .from("boards")
      .update({ is_visible: false })
      .eq("id", props.board.id);

    if (error) {
      throw new Error(error.message);
    }

    // Success
    toastSuccess({
      title: "Board Hidden",
      description: "This board is now hidden from the list.",
    });
    isOpen.value = false;
    emit("deleted"); // Trigger your deleted event or update state
  } catch (error) {
    // Handle any error that occurred during the update process
    toastError({
      title: "Something went wrong!",
      description: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
