<template>
  <section class="flex justify-end items-center mb-10">
    <div>
      <UButton
        icon="i-heroicons-plus-circle"
        color="primary"
        variant="solid"
        label="Add new"
        size="lg"
        @click="openNoteModal(null)"
      />
    </div>
  </section>

  <section v-if="!notesPending">
    <div v-if="notes.length">
      <UCard v-for="note in notes" :key="note.id" class="mb-4">
        <div class="flex items-center justify-between mb-5">
          <h3
            class="text-lg font-semibold text-primary-600 dark:text-primary-400"
          >
            {{ note.title }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-pencil"
              color="gray"
              variant="ghost"
              @click="openNoteModal(note)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              @click="deleteNote(note)"
            />
          </div>
        </div>
        <ul class="space-y-2">
          <li
            v-for="(item, index) in note.content.split(', ')"
            :key="index"
            class="flex items-center text-gray-700 dark:text-gray-300"
          >
            <UIcon
              name="i-heroicons-check-circle-20-solid"
              class="w-4 h-4 mr-2 text-primary-500 flex-shrink-0"
            />
            <span class="truncate">{{ item }}</span>
          </li>
        </ul>
      </UCard>
    </div>
    <div v-else>
      <p class="text-center">You don't have any notes.</p>
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
  </section>

  <NoteModal
    v-model="noteModalIsOpen"
    @saved="handleNoteSaved"
    :board-id="$route.params.id"
    :note="selectedNote"
  />
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

const noteModalIsOpen = ref(false);
const selectedNote = ref(null);
const route = useRoute();
const boardId = route.params.id;
const selectedView = ref(transactionViewOptions[1]); // Default selected view option

const { notes, notesPending, refreshNotes, addNote, updateNote, deleteNote } =
  useBoardData(boardId, selectedView);

const openNoteModal = (note = null) => {
  selectedNote.value = note;
  noteModalIsOpen.value = true;
};

const handleNoteSaved = async (newNote) => {
  if (selectedNote.value) {
    await updateNote({ ...newNote, id: selectedNote.value.id });
  } else {
    await addNote(newNote);
  }
  await refreshNotes();
  selectedNote.value = null;
};

await refreshNotes(boardId);
</script>
