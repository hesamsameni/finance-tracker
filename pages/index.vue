<template>
  <h1 class="mb-10">List of the boards you own or you are a member of:</h1>
  <div v-if="pending">Loading...</div>
  <div v-else>
    <div class="mb-10">
      <strong class="text-primary-500" @click="addBoardModalIsOpen = true"
        >Create</strong
      >
      a new board or<strong
        class="text-primary-500"
        @click="joinBoardModalIsOpen = true"
      >
        Join</strong
      >
      one
      <AddBoardModal
        v-model="addBoardModalIsOpen"
        @saved="refresh($route.params.id)"
      />

      <JoinBoardModal v-model="joinBoardModalIsOpen" @joined="refresh()" />
    </div>
    <!-- <div
        @click="isOpen = true"
        class="flex justify-center px-6 py-8 border not-prose rounded-lg border-primary cursor-pointer"
      >
        <div
          class="flex self-center rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700"
        >
          <UIcon
            name="i-heroicons-plus"
            color="primary"
            class="w-10 h-10 text-primary-500"
          />
         
        </div>
      </div> -->
    <div class="grid grid-cols-2 gap-4">
      <div v-for="household in households" :key="household.id">
        <div>
          <nuxt-link
            :to="`/households/${household.id}`"
            class="block px-6 py-8 border not-prose rounded-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
            ><div
              class="inline-flex items-center rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 ring-1 ring-gray-300 dark:ring-gray-700 mb-4 group-hover:ring-primary/50"
            >
              <UIcon name="i-heroicons-home" class="text-green-600" />
            </div>
            <p
              class="font-medium text-gray-900 dark:text-white text-[15px] mb-1"
            >
              {{ household.title }}
            </p>
            <p
              class="text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2"
            >
              Check the list of expenses of {{ household.title }} household.
            </p></nuxt-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const addBoardModalIsOpen = ref(false);
const joinBoardModalIsOpen = ref(false);

const { pending, refresh, households } = useFetchHouseholds();
await refresh();
</script>
