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

if (!user.value) {
  router.push({
    path: "/login",
    query: {
      redirect: "/join",
      inviteToken: routeQuery.value.inviteToken,
    },
  });
}

const handleModalClose = () => {
  router.push("/");
};

const handleJoinSuccess = (board) => {
  router.push(`/boards/${board.boardId}?title=${board.boardTitle}`);
};
</script>
