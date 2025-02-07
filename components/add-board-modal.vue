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
import { z } from "zod";
import { nanoid } from "nanoid";
import { categories } from "~/constants";
import { useBoardApi } from "~/composables/useBoardApi"; // Refactored API logic

// Props and Emits
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue", "saved"]);

// Refs and State
const selectedCategories = ref([]);
const availableCategories = ref(categories);
const form = ref();
const isLoading = ref(false);
const user = useSupabaseUser();
const { toastError, toastSuccess } = useAppToast();
const { createBoard, addBoardMember, addCategoriesToBoard } = useBoardApi();

// Form State
const initialState = {
  title: undefined,
  currency: "eur",
  invite_token: nanoid(16),
  nickname: user.value ? user.value.user_metadata.full_name : "",
};
const state = ref({ ...initialState });

// Schema Validation
const schema = z.object({
  title: z.string(),
  category: z.string(),
  nickname: z.string(),
});

// Methods
const toggleCategory = (label) => {
  const index = selectedCategories.value.indexOf(label);
  if (index === -1) {
    selectedCategories.value.push(label);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

const saveForm = async () => {
  if (form.value.errors.length) return;
  isLoading.value = true;

  try {
    const boardId = await createBoard(state.value);
    await addBoardMember(boardId, state.value.nickname);

    if (selectedCategories.value.length > 0) {
      const categoriesToInsert = selectedCategories.value.map((label) => {
        const category = availableCategories.value.find(
          (c) => c.label === label
        );
        return {
          board_id: boardId,
          label: category.label,
          icon: category.icon,
          color: category.color,
        };
      });
      await addCategoriesToBoard(categoriesToInsert);
    }

    toastSuccess({ title: "Board created!" });
    isOpen.value = false;
    emit("saved");
  } catch (error) {
    toastError({
      title: "Something went wrong!",
      description: error.message,
    });
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  state.value = { ...initialState };
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
