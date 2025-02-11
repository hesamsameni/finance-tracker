<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header> Add Discount </template>
      <UForm ref="form" @submit="saveFile">
        <UFormGroup
          label="Upload Receipt"
          :required="true"
          name="receipt"
          class="mb-5"
        >
          <!-- Add a ref to the input element -->
          <UInput
            type="file"
            ref="fileInput"
            accept="image/*,.pdf"
            @change="handleFileChange"
            :disabled="uploading"
            size="xl"
          />
          <p class="text-sm text-gray-500 mt-2">
            Upload a clear photo or scan of your receipt (JPG, PNG, or PDF)
          </p>
        </UFormGroup>

        <div class="flex justify-end gap-3 mt-6">
          <UButton
            type="button"
            color="gray"
            variant="ghost"
            @click="isOpen = false"
            :disabled="uploading"
          >
            Cancel
          </UButton>
          <UButton type="submit" :loading="uploading">
            {{ uploading ? "Processing The File" : "Process Receipt" }}
          </UButton>
        </div>
      </UForm>

      <UAlert
        v-if="errorMessage"
        color="red"
        variant="solid"
        class="mt-4"
        :title="errorMessage"
        @close="errorMessage = ''"
      />
    </UCard>
  </UModal>
</template>

<script setup>
const supabase = useSupabaseClient();
const { toastSuccess, toastError } = useAppToast();
const uploading = ref(false);
const fileInput = ref();
const form = ref();

const emit = defineEmits(["update:modelValue", "saved"]);

const props = defineProps({
  modelValue: Boolean,
  boardId: String,
});

const resetForm = () => {
  form.value?.clear();
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});

const saveFile = async () => {
  // 1. Get the uploaded file
  const file = fileInput.value.input.files[0];

  if (!file) {
    toastError({ title: "Select a file to upload first" });
    return;
  }

  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    uploading.value = true;

    // 1. Upload file to Supabase storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("discounts")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Send to AI
    const { data: aiData, error: aiError } = await useFetch("/api/discounts", {
      method: "POST",
      body: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract discount information from this receipt.",
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Data,
                },
              },
            ],
          },
        ],
      },
    });

    if (aiError.value) throw new Error(aiError.value.message);

    const parsedData = parseAIResponse(aiData.value);
    // 3. Insert into database
    const { error: dbError } = await supabase.from("board_discounts").insert({
      discount_file_name: fileName,
      board_id: props.boardId,
      valid_until: parsedData.valid_until,
      useable_in: parsedData.useable_in,
      condition: parsedData.conditions,
      additional_info: {
        store: parsedData.store,
        currency: parsedData.currency,
        store_logo: parsedData.store_logo,
      },
      not_valid_for: parsedData.not_valid_for,
      discount_offer: parsedData.discount_offer,
    });

    if (dbError) throw dbError;

    toastSuccess({
      title: "Discount saved successfully",
    });
    isOpen.value = false;
    emit("saved");
  } catch (error) {
    toastError({
      title: "Error uploading avatar",
      description: error.message,
    });
  } finally {
    uploading.value = false;
  }
};

const parseAIResponse = (response) => {
  try {
    // First try to parse directly if it's already JSON
    if (typeof response === "object") return response;

    // Handle cases where response might be wrapped in code blocks
    const jsonString = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Remove any extra characters before/after the JSON
    const jsonStart = jsonString.indexOf("{");
    const jsonEnd = jsonString.lastIndexOf("}") + 1;
    const cleanJson = jsonString.slice(jsonStart, jsonEnd);

    return JSON.parse(cleanJson);
  } catch (error) {
    throw new Error("Failed to parse AI response: " + error.message);
  }
};
</script>
