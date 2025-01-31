<template>
  <UCard>
    <template #header> Signing in... </template>
    Wait a moment while we sign you in...
    <div class="mt-4 text-center">
      <UButton
        v-if="showManualRedirect"
        @click="handleManualRedirect"
        color="primary"
      >
        Click here if not redirected automatically
      </UButton>
    </div>
  </UCard>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const user = useSupabaseUser();
const showManualRedirect = ref(false);

// Show manual redirect button after 5 seconds
setTimeout(() => {
  showManualRedirect.value = true;
}, 5000);

const handleRedirect = () => {
  if (route.query.inviteToken) {
    router.push(`/join?inviteToken=${route.query.inviteToken}`);
  } else {
    router.push("/");
  }
};
// Watch for user authentication
watch(
  user,
  (newUser) => {
    if (newUser) {
      handleRedirect();
    }
  },
  { immediate: true }
);

const handleManualRedirect = () => {
  handleRedirect();
};
</script>
