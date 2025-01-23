<template>
  <h1 class="mb-10">List of the boards you own or you are a member of:</h1>
  <div v-if="pending">Loading...</div>
  <div v-else>
    <div class="mb-10">
      <strong
        class="text-primary-500 cursor-pointer"
        @click="addBoardModalIsOpen = true"
        >Create</strong
      >
      a new board or
      <strong
        class="text-primary-500 cursor-pointer"
        @click="joinBoardModalIsOpen = true"
        >Join</strong
      >
      one.
      <AddBoardModal
        v-model="addBoardModalIsOpen"
        @saved="refresh($route.params.id)"
      />
      <JoinBoardModal v-model="joinBoardModalIsOpen" @joined="refresh()" />
      <DeleteBoardModal
        v-model="deleteBoardModalIsOpen"
        :board="selectedBoard"
        @deleted="refresh()"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="household in households" :key="household.id">
        <div>
          <div
            class="block px-6 py-8 border not-prose rounded-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
          >
            <div class="flex justify-between items-center">
              <nuxt-link :to="`/households/${household.id}`">
                <div
                  class="inline-flex items-center rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700 group-hover:ring-primary/50"
                >
                  <UIcon name="i-heroicons-home" class="text-green-600" />
                </div>
              </nuxt-link>
              <UPopover>
                <UButton
                  color="white"
                  variant="ghost"
                  trailing-icon="i-heroicons-ellipsis-horizontal"
                />

                <template #panel>
                  <div>
                    <div
                      v-for="item in getDropdownItems(household)"
                      :key="item.label"
                      class="dropdown-item flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      @click="item.click"
                    >
                      <UIcon :name="item.icon" />
                      <span>{{ item.label }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
            <div class="mt-4">
              <nuxt-link :to="`/households/${household.id}`">
                <div
                  class="truncate max-w-[200px] overflow-hidden whitespace-nowrap font-bold text-gray-900 dark:text-white text-[15px] mb-1"
                  :title="formatTitle(household.title)"
                >
                  {{ formatTitle(household.title) }}
                </div>
                <!-- <p
                  class="font-medium text-gray-900 dark:text-white text-[15px] mb-1"
                ></p> -->
                <p
                  class="text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2"
                >
                  Share this board if you want to add people to it
                </p>
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const addBoardModalIsOpen = ref(false);
const joinBoardModalIsOpen = ref(false);
const deleteBoardModalIsOpen = ref(false);
const selectedBoard = ref(null);
const getDropdownItems = (board) => {
  return [
    {
      label: "Share",
      icon: "i-heroicons-share-20-solid",
      click: () => handleShareBoard(board),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => openDeleteModal(board),
    },
  ];
};

const openDeleteModal = (board) => {
  selectedBoard.value = board;
  deleteBoardModalIsOpen.value = true;
};

const handleShareBoard = async (board) => {
  console.log(board.invite_token);
};

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const { pending, refresh, households } = useFetchHouseholds();
await refresh();
</script>
