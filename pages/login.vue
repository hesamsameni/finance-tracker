<template>
  <UCard v-if="!success">
    <template #header>{{
      $route.query.inviteToken ? "Join Board" : "Sign in"
    }}</template>
    <p
      v-if="$route.query.inviteToken"
      class="mb-4 text-gray-600 dark:text-gray-300"
    >
      You've been invited to join a board. Sign in to continue.
    </p>
    <form @submit.prevent="handleLogin">
      <UFormGroup label="Email" name="email" class="mb-4" :required="true">
        <UInput
          type="email"
          placeholder="Enter your email to recieve the login link"
          v-model="email"
          required
        />
      </UFormGroup>
      <div class="flex items-center justify-center">
        <UButton
          block
          type="submit"
          variant="solid"
          color="primary"
          :loading="pending"
          :disabled="pending"
          >Sign in</UButton
        >
      </div>
    </form>

    <UDivider label="OR" class="my-10" />
    <div class="flex items-center justify-center">
      <UButton
        block
        type="submit"
        variant="solid"
        color="white"
        :loading="pending"
        @click="handleOAuth"
        icon="flat-color-icons:google"
        >Sign in with google</UButton
      >
    </div>
  </UCard>

  <UCard v-else>
    <template #header> Email has been sent </template>
    <div class="text-center">
      <p>
        We have sent an email to <strong>{{ email }}</strong> with a link to
        sign in.
      </p>
      <p>
        <strong>The link will expire in 5 minutes</strong>
      </p>
    </div>
  </UCard>
</template>

<script setup>
const success = ref(false);
const route = useRoute();
const email = ref("");
const pending = ref(false);
const { toastError } = useAppToast();
const supabase = useSupabaseClient();
const redirectUrl = useRuntimeConfig().public.baseUrl;
useRedirectIfAuthenticated();

const handleOAuth = async () => {
  pending.value = true;
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectUrl}/confirm${
          route.query.inviteToken
            ? `?inviteToken=${encodeURIComponent(route.query.inviteToken)}`
            : ""
        }`,
      },
    });

    if (error) {
      toastError({
        title: "Something went wrong!",
        description: error.message,
      });
    } else {
      toastSuccess({
        title: "Signed in with google!",
      });
    }
  } finally {
    pending.value = false;
  }
};

const handleLogin = async () => {
  pending.value = true;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${redirectUrl}/confirm${
          route.query.inviteToken
            ? `?inviteToken=${encodeURIComponent(route.query.inviteToken)}`
            : ""
        }`,
      },
    });

    if (error) {
      toastError({
        title: "Something went wrong!",
        description: error.message,
      });
    } else {
      success.value = true;
    }
  } finally {
    pending.value = false;
  }
};
</script>
