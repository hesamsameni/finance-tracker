<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header>
        {{ headerText }}
      </template>

      <!-- Add/Edit Form -->
      <template v-if="mode !== 'delete'">
        <UForm :state="state" :schema="schema" ref="form">
          <UFormGroup label="Title" required name="title" class="mb-5">
            <UInput
              type="text"
              placeholder="Enter the title..."
              v-model="state.title"
            />
          </UFormGroup>

          <UFormGroup label="Nickname" required name="nickname" class="mb-5">
            <UInput
              type="text"
              placeholder="Enter your nickname..."
              v-model="state.nickname"
            />
          </UFormGroup>

          <UFormGroup label="Currency" required name="currency" class="mb-5">
            <UInput type="text" v-model="state.currency" />
          </UFormGroup>

          <UFormGroup
            label="Automatically balance member payments each month?"
            name="auto_carry_over"
            class="mb-5"
          >
            <div class="flex">
              <span class="text-gray-500 text-xs">
                When enabled, the app will calculate payment imbalances from the
                previous month and create adjustment entries to ensure fair
                splits.
              </span>
              <div>
                <UToggle v-model="state.auto_carry_over" />
              </div>
            </div>
          </UFormGroup>
          <UDivider label="Categories" size="sm" />

          <UFormGroup class="my-5">
            <div class="grid grid-cols-2 gap-4 mt-5">
              <div
                v-for="category in availableCategories"
                :key="category.label"
                class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer"
                :class="
                  selectedCategories.includes(category.label)
                    ? 'border-primary-500'
                    : 'border-gray-200 hover:border-gray-300'
                "
                @click="toggleCategory(category.label)"
              >
                <UIcon
                  :name="category.icon"
                  class="w-4 h-4"
                  :class="
                    selectedCategories.includes(category.label)
                      ? 'text-primary-500'
                      : 'text-gray-200'
                  "
                />
                <span
                  class="text-sm"
                  :class="
                    selectedCategories.includes(category.label)
                      ? 'text-primary-500'
                      : 'text-gray-200'
                  "
                  >{{ category.label }}</span
                >
              </div>
              <div
                class="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer border-gray-200 hover:border-gray-300"
                @click="showCustomCategoryForm = true"
              >
                <UIcon name="i-heroicons-plus" class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-400">Add Custom</span>
              </div>
            </div>
          </UFormGroup>

          <div
            v-if="showCustomCategoryForm"
            class="mt-4 p-4 border border-primary-500 rounded-lg space-y-4"
          >
            <UFormGroup label="Category Name" required>
              <UInput
                v-model="customCategoryName"
                placeholder="Enter category name"
              />
            </UFormGroup>

            <UFormGroup label="Select Icon" required>
              <CustomIconSelector
                @select-icon="selectedIcon = $event"
                :selected-icon="selectedIcon"
                :selected-color="selectedColor"
              />
            </UFormGroup>

            <UFormGroup label="Select Color" required>
              <CustomColorPicker
                @select-color="selectedColor = $event"
                :selected-color="selectedColor"
                class="mt-2"
              />
            </UFormGroup>

            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="gray"
                @click="cancelCustomCategory"
              />
              <UButton
                label="Add Category"
                color="primary"
                :disabled="!customCategoryName || !selectedIcon"
                @click="addCustomCategory"
              />
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              :label="saveButtonLabel"
              @click="handleSave"
              :loading="isLoading"
            />
          </div>
        </UForm>
      </template>

      <!-- Delete Confirmation -->
      <template v-else>
        <p>Are you sure you want to delete {{ board.title }} ?</p>
        <p class="text-gray-700 text-sm/4 mt-1">
          It will be hidden and we will delete it after 30 days, if you changed
          your mind please contact us to restore it.
        </p>
        <div class="grid mt-4">
          <UButton
            class="mb-4"
            color="red"
            variant="solid"
            label="Yes, delete the board"
            :loading="isLoading"
            @click="handleDelete"
          />
          <UButton
            color="black"
            variant="solid"
            label="No, I changed my mind"
            :loading="isLoading"
            @click="isOpen = false"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
import { z } from "zod";
import { nanoid } from "nanoid";
import { categories } from "~/constants";
import { useBoardApi } from "~/composables/useBoardApi";

const props = defineProps({
  modelValue: Boolean,
  mode: {
    type: String,
    validator: (value) => ["add", "edit", "delete"].includes(value),
    required: true,
  },
  board: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "saved", "deleted"]);

// Composables
const { toastError, toastSuccess } = useAppToast();
const {
  createBoard,
  updateBoard,
  deleteBoard,
  addBoardMember,
  addCategoriesToBoard,
  deleteBoardCategories,
} = useBoardApi();
const user = useSupabaseUser();

// Refs
const form = ref();
const isLoading = ref(false);
const selectedCategories = ref([]);
const showCustomCategoryForm = ref(false);
const customCategoryName = ref("");
const selectedIcon = ref("");
const availableCategories = ref([...categories]);
const selectedColor = ref("pink");

// Computed
const headerText = computed(() => {
  return {
    add: "Create a new table",
    edit: "Edit Board",
    delete: "Deleting the board",
  }[props.mode];
});

const saveButtonLabel = computed(
  () =>
    ({
      add: "Create",
      edit: "Save",
    }[props.mode])
);

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  nickname: z.string().min(1, "Nickname is required"),
  currency: z.string().min(1, "Currency is required"),
});

// State
const initialState = computed(() => ({
  title: props.board?.title || "",
  currency: props.board?.currency || "eur",
  auto_carry_over: props.board?.auto_carry_over || false,
  nickname: props.board?.nickname || user.value?.user_metadata?.full_name || "",
  invite_token: props.board?.invite_token || nanoid(16),
}));

const state = ref({ ...initialState.value });

// Methods

const addCustomCategory = () => {
  const newCategory = {
    label: customCategoryName.value,
    icon: selectedIcon.value,
    color: selectedColor.value,
    isCustom: true,
  };

  availableCategories.value.push(newCategory);
  toggleCategory(newCategory.label);
  cancelCustomCategory();
};

const cancelCustomCategory = () => {
  showCustomCategoryForm.value = false;
  customCategoryName.value = "";
  selectedIcon.value = "";
};

const toggleCategory = (label) => {
  const index = selectedCategories.value.indexOf(label);
  index === -1
    ? selectedCategories.value.push(label)
    : selectedCategories.value.splice(index, 1);
};

const handleSave = async () => {
  if (form.value.errors.length) return;
  isLoading.value = true;

  try {
    const boardId =
      props.mode === "add"
        ? await createBoard(state.value)
        : await updateBoard(props.board.id, state.value);

    if (props.mode === "add") {
      await addBoardMember(boardId, state.value.nickname);
    }

    const currentBoardId = boardId || props.board.id;
    if (props.mode === "edit") {
      await deleteBoardCategories(currentBoardId);
    }

    if (selectedCategories.value.length > 0) {
      const categoriesToInsert = selectedCategories.value.map((label) => {
        const category = availableCategories.value.find(
          (c) => c.label === label
        );
        return {
          board_id: boardId || props.board.id,
          ...category,
        };
      });
      await addCategoriesToBoard(categoriesToInsert);
    }

    toastSuccess({
      title: `Board ${props.mode === "add" ? "created" : "updated"}!`,
    });
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

const handleDelete = async () => {
  isLoading.value = true;
  try {
    await deleteBoard(props.board.id);
    toastSuccess({ title: "Board deleted!" });
    isOpen.value = false;
    emit("deleted");
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
  state.value = { ...initialState.value };
  selectedCategories.value = [];
  form.value?.clear();
};

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});

// Watchers
watch(
  () => props.board,
  (newBoard) => {
    if (!newBoard) return;

    // Reset available categories to default + any existing custom
    availableCategories.value = [...categories];

    if (newBoard?.categories) {
      selectedCategories.value = newBoard.categories.map((c) => c.label);

      // Add existing custom categories
      newBoard.categories.forEach((category) => {
        if (!categories.some((c) => c.label === category.label)) {
          availableCategories.value.push(category);
        }
      });
    }
  },
  { immediate: true }
);
</script>
