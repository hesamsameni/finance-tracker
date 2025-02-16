<template>
  <nuxt-link to="/" class="mb-10 flex items-center cursor-pointer">
    <UIcon name="i-heroicons-chevron-left" />
    <span>Back</span>
  </nuxt-link>

  <section class="flex items-center justify-between mb-10">
    <h1 class="text-lg lg:text-3xl font-extrabold">
      {{ $route.query.title ? $route.query.title : boardId }}
    </h1>
    <div>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions">
        <template #option-empty></template>
      </USelectMenu>
    </div>
  </section>

  <section
    class="flex flex-col-reverse justify-center lg:flex-row lg:justify-between lg:mb-20"
  >
    <div
      class="flex justify-between lg:flex-col"
      v-if="boardMembers.length > 1"
    >
      <UsersWidget
        v-for="(user, i) in boardMembers"
        class="my-2"
        :key="i"
        :color="user.color ? user.color : 'green'"
        :title="user.user_nickname"
        :userId="user.user_id"
        :amount="getUserExpenses(user.user_id)"
        :loading="pending"
        :currency="$route.query.currency"
      />
    </div>
    <div
      class="flex justify-center"
      v-if="Object.keys(categoriesForChart).length > 1"
    >
      <ClientOnly>
        <ExpensesPieChart
          v-if="expenses.length"
          :categories="categoriesForChart"
          :currency="$route.query.currency"
        />
        <p v-else class="text-center text-gray-500">
          No expenses to display chart.
        </p>
      </ClientOnly>
    </div>
  </section>
  <UTabs :items="tabs" class="w-full">
    <template #expenses>
      <section class="flex justify-between my-10">
        <div>
          <h2 class="text-lg lg:text-2xl font-extrabold">List of Expenses</h2>
        </div>
        <div>
          <ExpenseModal
            v-model="expenseModalIsOpen"
            @saved="refreshExpenses($route.params.id)"
            :members="boardMembers"
            :categories="fetchedCategories"
          />

          <UButton
            icon="i-heroicons-plus-circle"
            color="primary"
            variant="solid"
            label="Add new"
            @click="expenseModalIsOpen = true"
          />
        </div>
      </section>

      <section v-if="!pending">
        <div v-if="expenses.length">
          <div v-for="expense in expenses" :key="expense.id">
            <Expense
              :expense="expense"
              :loading="pending"
              @deleted="refreshExpenses($route.params.id)"
              @edited="refreshExpenses($route.params.id)"
              :members="boardMembers"
              :categories="fetchedCategories"
              :currency="$route.query.currency"
            />
          </div>
        </div>
        <div v-else>
          <p class="text-center">You don't have any expenses yet.</p>
        </div>
      </section>
      <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
      </section>
    </template>
    <template #discounts>
      <section class="flex justify-between my-10">
        <div>
          <h2 class="text-lg lg:text-2xl font-extrabold">List of Discounts</h2>
        </div>
        <div>
          <DiscountModal
            v-model="discountModalIsOpen"
            :board-id="$route.params.id"
            @saved="refreshDiscounts($route.params.id)"
          />

          <UButton
            icon="i-heroicons-plus-circle"
            color="primary"
            variant="solid"
            label="Add new"
            @click="discountModalIsOpen = true"
          />
        </div>
      </section>
      <section v-if="!discountsPending">
        <div v-if="discounts.length > 0">
          <div v-for="discount in discounts" :key="discount.id">
            <Discount
              :discount="discount"
              :loading="discountsPending"
              @deleted="refreshDiscounts($route.params.id)"
            />
          </div>
        </div>
        <div v-else>
          <p class="text-center">No valid discount available.</p>
        </div>
      </section>
      <section v-else>
        <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
      </section>
    </template>
    <template #notes>
      <section class="flex justify-between my-10">
        <div>
          <h2 class="text-lg lg:text-2xl font-extrabold">List of Notes</h2>
        </div>
        <div>
          <UButton
            icon="i-heroicons-plus-circle"
            color="primary"
            variant="solid"
            label="Add new"
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
        :board-id="boardId"
        :note="selectedNote"
      />
    </template>
  </UTabs>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

// Reactive variables
const selectedView = ref(transactionViewOptions[1]); // Default selected view option
const expenseModalIsOpen = ref(false);
const discountModalIsOpen = ref(false);
const noteModalIsOpen = ref(false);

const selectedNote = ref(null); // Holds the note being edited
const route = useRoute();
const boardId = route.params.id;

const {
  pending,
  refreshExpenses,
  getUsers,
  expenses,
  getUserExpenses,
  boardMembers,
  discountsPending,
  refreshDiscounts,
  discounts,
  fetchedCategories,
  categoriesPending,
  notes,
  notesPending,
  refreshNotes,
  addNote,
  updateNote,
  deleteNote,
  categoriesForChart,
} = useBoardData(boardId, selectedView);

await refreshExpenses(boardId);
await getUsers(boardId);
await refreshDiscounts(boardId);
await refreshNotes(boardId);

const openNoteModal = (note = null) => {
  selectedNote.value = note;
  noteModalIsOpen.value = true;
};

// Handle saving a note (both create and edit)
const handleNoteSaved = async (newNote) => {
  if (selectedNote.value) {
    await updateNote({ ...newNote, id: selectedNote.value.id });
  } else {
    await addNote(newNote);
  }
  await refreshNotes();
  selectedNote.value = null;
};

const tabs = [
  {
    slot: "expenses",
    label: "Expenses",
  },
  {
    slot: "notes",
    label: "Notes",
  },
  {
    slot: "discounts",
    label: "Discounts",
  },
];
</script>
