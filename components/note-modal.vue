<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header>
        <h2 class="text-lg font-bold">
          {{ selectedNote ? "Edit Note" : "Add New Note" }}
        </h2>
      </template>

      <UForm @submit="saveNote">
        <UFormGroup label="Title" class="mb-5">
          <UInput
            v-model="title"
            placeholder="Enter note title (e.g., Shopping List)"
          />
        </UFormGroup>

        <UFormGroup label="Items">
          <div
            v-for="(_, index) in items"
            :key="index"
            class="flex items-center justify-between gap-2 mb-2"
          >
            <UInput
              v-model="items[index]"
              placeholder="Enter an item"
              class="flex-1"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              @click="removeItem(index)"
            />
          </div>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            variant="ghost"
            label="Add Item"
            @click="addItem"
            block
          />
        </UFormGroup>

        <div class="flex justify-end mt-4">
          <UButton type="submit" color="primary" label="Save" />
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Boolean, // Controls the visibility of the modal
  boardId: String, // The ID of the board the note belongs to
  note: Object, // The note being edited (null for creating a new note)
});

const emit = defineEmits(["update:modelValue", "saved"]);

// Controls the modal's open/close state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const title = ref(props.note?.title || ""); // Holds the title of the note
const items = ref(props.note?.content.split(", ") || [""]); // Holds the list of items

// Watch for changes to the `note` prop
watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      // If editing, populate the form with the note's data
      title.value = newNote.title;
      items.value = newNote.content.split(", ");
    } else {
      // If creating, reset the form
      title.value = "";
      items.value = [""];
    }
  },
  { immediate: true } // Trigger the watcher immediately
);

// Function to add a new item input
const addItem = () => {
  items.value.push("");
};

// Function to remove an item
const removeItem = (index) => {
  items.value.splice(index, 1);
};

// Function to save the note
const saveNote = async () => {
  if (!title.value.trim() || items.value.every((item) => !item.trim())) {
    alert("Title and at least one item are required!");
    return;
  }

  // Emit the new note data to the parent component
  emit("saved", {
    board_id: props.boardId,
    title: title.value,
    content: items.value.filter((item) => item.trim()).join(", "), // Join items into a single string
  });

  // Reset the form and close the modal
  title.value = "";
  items.value = [""];
  isOpen.value = false;
};
</script>
