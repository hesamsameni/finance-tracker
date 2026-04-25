<template>
  <div>
    <header class="flex justify-between items-center mt-10">
      <NuxtLink
        to="/"
        class="text-xl font-bold flex items-center justify-between"
      >
        <img class="w-7 h-7 mr-2" src="/favicon-96x96.png" alt="roomie" />
        Roomie
      </NuxtLink>
      <div class="flex items-center">
        <UDropdown
          :items="items"
          :ui="{ item: { disabled: 'cursor-text select-text' }, width: 'w-64' }"
          v-if="user"
        >
          <UAvatar
            v-if="user.user_metadata.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="Avatar"
          />
          <UIcon
            v-else
            name="i-heroicons-user-circle-solid"
            class="white h-10 w-10"
          />
          <template #account="{ item }">
            <div class="text-left">
              <p>Signed in as</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
            </div>
          </template>

          <template #item="{ item }">
            <span class="truncate">{{ item.label }}</span>

            <UIcon
              :name="item.icon"
              class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
            />
          </template>
        </UDropdown>
        <UButton
          variant="ghost"
          color="gray"
          icon="heroicons:bars-3-solid"
          @click="isOpen = true"
          class="lg:hidden ml-2"
        />
      </div>
    </header>
    <USlideover v-model="isOpen" prevent-close side="right">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Roomie
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <UVerticalNavigation :links="links" @click="closeSlider" />
      </UCard>
    </USlideover>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isOpen = ref(false);

const items = [
  [
    {
      label: user.value?.email,
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-cog-8-tooth",
      click: () => console.log("Link to settings in the future"),
    },
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: async () => {
        await supabase.auth.signOut();
        return navigateTo("/login");
      },
    },
  ],
];

const { boards, refresh } = useFetchBoards();
const loading = ref(true);

const initBoards = async () => {
  await refresh();
  loading.value = false;
};
await initBoards();

const links = computed(() => {
  if (!boards.value) return [];

  const boardLinks = boards.value.flatMap((board) => [
    {
      label: board.title, // This represents the Expenses view
      to: `/boards/${board.id}/expenses?title=${board.title}&currency=${board.currency}`,
    },
  ]);

  return [
    {
      label: "Boards",
      icon: "i-heroicons-home",
      to: "/",
    },
    ...boardLinks,
  ];
});

const closeSlider = () => {
  isOpen.value = false;
};
</script>
