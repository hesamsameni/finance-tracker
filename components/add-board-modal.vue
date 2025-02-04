<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Create a new table </template>
      <UForm :state="state" :schema="schema" ref="form">
        <UFormGroup label="Title" :required="true" name="title" class="mb-5">
          <UInput
            type="text"
            placeholder="Enter the title..."
            v-model="state.title"
          />
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
        <UFormGroup
          label="Currency"
          :required="true"
          name="currency"
          class="mb-5"
        >
          <UInput type="text" v-model="state.currency" />
        </UFormGroup>

        <UFormGroup label="Categories" class="mb-5">
          <div class="grid grid-cols-2 gap-4 mt-5">
            <div
              v-for="category in availableCategories"
              :key="category.label"
              class="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer"
              :class="
                selectedCategories.includes(category.label)
                  ? 'border-primary-500'
                  : 'border-gray-200 hover:border-gray-300'
              "
              @click="toggleCategory(category.label)"
            >
              <UIcon
                :name="category.icon"
                class="w-5 h-5"
                :class="
                  selectedCategories.includes(category.label)
                    ? 'text-primary-500'
                    : 'text-gray-200'
                "
              />
              <span
                :class="
                  selectedCategories.includes(category.label)
                    ? 'text-primary-500'
                    : 'text-gray-200'
                "
                >{{ category.label }}</span
              >
            </div>
          </div>
        </UFormGroup>

        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Save"
          @click="saveForm"
          :loading="isLoading"
        />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup>
import { z } from "zod"; // Import Zod for schema validation
import { nanoid } from "nanoid";
import { categories } from "~/constants";
// Define props for the component
const props = defineProps({
  modelValue: Boolean,
});

const selectedCategories = ref([]);
const availableCategories = ref(categories);
const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const { toastError, toastSuccess } = useAppToast();
const inviteToken = nanoid(16);
const user = useSupabaseUser();

const toggleCategory = (label) => {
  const index = selectedCategories.value.indexOf(label);
  if (index === -1) {
    selectedCategories.value.push(label);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};
// Reactive state to store form data
const initialState = ref({
  title: undefined,
  currency: "eur",
  invite_token: inviteToken,
  nickname: user.value ? user.value.user_metadata.full_name : "", // Default to full_name or empty string
});

const state = ref({ ...initialState.value });

// Schema for validating form data using Zod
const schema = z.object({
  title: z.string(), // Title must be a string
  category: z.string(),
  nickname: z.string(), // Validate nickname as a string
});

const saveForm = async () => {
  if (form.value.errors.length) return;
  const { title, currency, invite_token } = state.value;
  isLoading.value = true;
  try {
    const { data: board, error } = await supabase
      .from("boards")
      .upsert({ title, currency, invite_token })
      .select();

    const boardId = board[0].id;

    if (!error && boardId) {
      const { error } = await supabase.from("board_members").insert({
        board_id: boardId,
        role: "owner",
        user_nickname: state.value.nickname,
      });

      if (selectedCategories.value.length > 0) {
        const categoriesToInsert = selectedCategories.value.map((label) => {
          const category = availableCategories.value.find(
            (c) => c.label === label
          );
          return {
            board_id: boardId, // or existing board ID for edits
            label: category.label,
            icon: category.icon,
            color: category.color,
          };
        });

        const { error } = await supabase
          .from("categories")
          .upsert(categoriesToInsert);

        if (error) throw error;
      }

      if (!error) {
        toastSuccess({ title: "Board created!" });
      }

      isOpen.value = false;
      emit("saved");
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

// Emit an event to sync the modelValue with the parent component
const emit = defineEmits(["update:modelValue", "saved"]);
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
