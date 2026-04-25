<!-- pages/join.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <JoinBoardModal
      :model-value="true"
      :initial-token="routeQuery.inviteToken"
      @close="handleModalClose"
      @joined="handleJoinSuccess"
    />
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const user = useSupabaseUser();

const routeQuery = ref({
  inviteToken: route.query.inviteToken,
});

// Wait for auth state to initialize before redirecting
watch(
  user,
  (newUser) => {
    if (newUser === null) {
      router.push({
        path: "/login",
        query: {
          redirect: "/join",
          inviteToken: routeQuery.value.inviteToken,
        },
      });
    }
  },
  { immediate: true },
);

const handleModalClose = () => {
  router.push("/");
};

const handleJoinSuccess = (board) => {
  router.push(`/boards/${board.boardId}?title=${board.boardTitle}`);
};
</script>
