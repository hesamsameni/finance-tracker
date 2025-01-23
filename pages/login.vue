<template>
  <UCard v-if="!success">
    <template #header> Sign in </template>

    <form @submit.prevent="handleLogin">
      <UFormGroup label="Email" name="email" class="mb-4" :required="true">
        <UInput
          type="email"
          placeholder="Enter your email to recieve the login link"
          v-model="email"
          required
        />
      </UFormGroup>
      <UButton
        type="submit"
        variant="solid"
        color="primary"
        :loading="pending"
        :disabled="pending"
        >Sign in</UButton
      >
    </form>
    <UDivider label="OR" />
    <UButton
      type="submit"
      variant="solid"
      color="primary"
      :loading="pending"
      @click="handleOAuth"
      >Sign in with google</UButton
    >
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
const email = ref("");
const pending = ref(false);
const { toastError } = useAppToast();
const supabase = useSupabaseClient();

useRedirectIfAuthenticated();

const handleOAuth = async () => {
  pending.value = true;
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
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
        emailRedirectTo: "http://localhost:3000",
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
