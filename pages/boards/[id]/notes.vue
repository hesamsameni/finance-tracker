<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10 lg:hidden"
  >
    <nav class="flex justify-around py-3">
      <NuxtLink
        :to="`/boards/${boardId}/expenses?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/expenses') }"
      >
        <UIcon name="i-heroicons-banknotes" class="text-2xl" />
        <span class="text-xs">Expenses</span>
      </NuxtLink>
      <NuxtLink
        :to="`/boards/${boardId}/notes?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/notes') }"
      >
        <UIcon name="i-heroicons-pencil-square" class="text-2xl" />
        <span class="text-xs">Notes</span>
      </NuxtLink>
      <NuxtLink
        :to="`/boards/${boardId}/discounts?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/discounts') }"
      >
        <UIcon name="i-heroicons-receipt-percent" class="text-2xl" />
        <span class="text-xs">Discounts</span>
      </NuxtLink>
    </nav>
  </div>
  <section class="hidden lg:flex justify-between items-center mb-4">
    <div class="flex justify-start items-center gap-2">
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/expenses?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/expenses'),
            'text-gray-500': !$route.path.includes('/expenses'),
          }"
        >
          Expenses
        </nuxt-link>
      </div>
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/notes?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/notes'),
            'text-gray-500': !$route.path.includes('/notes'),
          }"
        >
          Notes
        </nuxt-link>
      </div>
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/discounts?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/discounts'),
            'text-gray-500': !$route.path.includes('/discounts'),
          }"
        >
          Discounts
        </nuxt-link>
      </div>
    </div>
    <UButton
      icon="i-heroicons-plus-circle"
      color="primary"
      variant="solid"
      label="Add new"
      size="sm"
      @click="openNoteModal(null)"
    />
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
