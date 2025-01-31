<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Join a board </template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup
          label="Invite code"
          :required="true"
          name="invite_token"
          class="mb-5"
        >
          <UInput type="text" v-model="state.invite_token" />
        </UFormGroup>
        <UFormGroup
          label="Nickname"
          :required="true"
          name="nickname"
          class="mb-5"
        >
          <UInput
            type="text"
            placeholder="Enter your nickname..."
            v-model="state.nickname"
          />
        </UFormGroup>
        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Join"
          @click="saveForm"
          :loading="isLoading"
        />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { z } from "zod"; // Import Zod for schema validation
const router = useRouter();
const route = useRoute();
const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { toastError, toastSuccess } = useAppToast();

// Define props for the component
const props = defineProps({
  modelValue: Boolean,
  initialToken: {
    type: String,
    default: "",
  },
  isStandalone: {
    type: Boolean,
    default: false,
  },
});

// Reactive state to store form data
const initialState = ref({
  invite_token: props.initialToken || route.query.inviteToken || "",
  nickname: user.value ? user.value.user_metadata.full_name : "", // Default to full_name or empty string
});

const state = ref({ ...initialState.value });

// Schema for validating form data using Zod
const schema = z.object({
  invite_token: z.string().min(1, "Invite code is required"),
  nickname: z.string().min(1, "Nickname is required"),
});

const saveForm = async () => {
  if (!user.value) {
    router.push({
      path: "/login",
      query: {
        redirect: props.isStandalone ? "/join" : route.path,
        inviteToken: state.value.invite_token,
      },
    });
    return;
  }

  if (form.value.errors.length) return;

  isLoading.value = true;

  try {
    // Step 1: Check if the invite code corresponds to a valid board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select()
      .eq("invite_token", state.value.invite_token)
      .single();

    if (boardError || !board) {
      toastError({ title: "Invalid or expired invite code!" });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("board_members")
      .select()
      .eq("board_id", board.id)
      .eq("user_id", user.value.id)
      .single();

    if (!existingMember) {
      // Add user to board members
      const { error: memberError } = await supabase
        .from("board_members")
        .insert([
          {
            board_id: board.id,
            user_id: user.value.id,
            role: "member",
            user_nickname: state.value.nickname,
          },
        ]);

      if (memberError) {
        toastError({ title: "Failed to join the board!" });
      }

      toastSuccess({
        title: "Successfully joined!",
        description: `You've joined the ${board.title} board`,
      });
    }

    if (props.isStandalone) {
      router.push(`/boards/${board.id}`);
    } else {
      emit("joined", { boardId: board.id, boardTitle: board.title });
      isOpen.value = false;
    }
  } catch (e) {
    toastError({
      title: "Something went wrong!",
      description: e.message,
    });
  } finally {
    isLoading.value = false;
  }
};

// Handle external token changes
watch(
  () => props.initialToken,
  (newVal) => {
    state.value.invite_token = newVal;
  }
);

// Emit an event to sync the modelValue with the parent component
const emit = defineEmits(["update:modelValue", "joined"]);
const resetForm = () => {
  Object.assign(state.value, { ...initialState.value }); // Create a fresh copy of initialState

  form.value?.clear();
};
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});
</script>
