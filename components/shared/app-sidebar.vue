<script setup>
const { boards, refresh } = useFetchBoards();
const loading = ref(true);

const initBoards = async () => {
  await refresh();
  loading.value = false;
};
await initBoards();

const links = computed(() => {
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
</script>

<template>
  <div v-if="loading" class="p-4">Loading boards...</div>
  <UVerticalNavigation v-else :links="links" />
</template>

<style scoped>
/* Optional: Custom styling for sub-items */
:deep(.vertical-navigation-link) {
  padding-left: 1rem; /* Base padding for all items */
}

/* Unfortunately, we can't target sub-items directly with scoped styles here */
/* The ↳ prefix in the label will handle the visual hierarchy */
</style>
