<template>
  <UModal
    v-model="isOpen"
    prevent-close
    :ui="{
      container: 'min-h-0 lg:min-h-full',
    }"
  >
    <UCard>
      <template #header>
        {{
          processingStep === "upload"
            ? "Add Discount"
            : "Review Discount Details"
        }}
      </template>

      <div v-if="processingStep === 'upload'">
        <UForm ref="form" @submit="saveFile">
          <UFormGroup :required="true" name="receipt" class="mb-5">
            <div class="flex flex-col gap-4">
              <UInput
                type="file"
                ref="fileInput"
                accept="image/*,.pdf"
                @change="handleFileChange"
                :disabled="uploading"
                size="lg"
              />
            </div>
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
      </div>
      <div v-else>
        <UForm ref="reviewForm" @submit="saveToDatabase">
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              <UIcon
                name="fluent-emoji-high-contrast:magic-wand"
                class="text-blue-800"
              />
              <span class="font-semibold">AI-Powered Data Extraction:</span
              ><br />
              We've used AI to extract information from your receipt. While our
              technology is powerful, it's not perfect. Please carefully review
              the information below and make any necessary corrections before
              saving.
            </p>
          </div>
          <UFormGroup label="Valid Until" name="valid_until" class="mb-4">
            <UInput v-model="formData.valid_until" type="date" />
          </UFormGroup>

          <UFormGroup label="Discount Offer" name="discount_offer" class="mb-4">
            <UInput v-model="formData.discount_offer" />
          </UFormGroup>

          <UFormGroup label="Useable In" name="useable_in" class="mb-4">
            <UInput v-model="formData.useable_in" />
          </UFormGroup>

          <UFormGroup label="Conditions" name="conditions" class="mb-4">
            <UTextarea v-model="formData.conditions" />
          </UFormGroup>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              @click="handleCloseModalWhenImageIsUploaded"
            >
              Back
            </UButton>
            <UButton type="submit" :loading="uploading">
              Confirm and Save
            </UButton>
          </div>
        </UForm>
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
const supabase = useSupabaseClient();
const { toastSuccess, toastError } = useAppToast();
const uploading = ref(false);
const fileInput = ref();
const form = ref();
const tempFileName = ref();

const processingStep = ref("upload"); // 'upload' or 'review'
const formData = ref({
  valid_until: "",
  useable_in: "",
  conditions: "",
  store: "",
  currency: "",
  store_logo: "",
  not_valid_for: "",
  discount_offer: "",
});

const emit = defineEmits(["update:modelValue", "saved"]);

const props = defineProps({
  modelValue: Boolean,
  boardId: String,
});

const resetForm = () => {
  form.value?.clear();
  processingStep.value = "upload";
  formData.value = {
    valid_until: "",
    useable_in: "",
    conditions: "",
    store: "",
    currency: "",
    store_logo: "",
    not_valid_for: "",
    discount_offer: "",
  };
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
    tempFileName.value = fileName;

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

    formData.value = {
      valid_until: parsedData.valid_until,
      useable_in: parsedData.useable_in,
      conditions: parsedData.conditions,
      store: parsedData.store,
      currency: parsedData.currency,
      store_logo: parsedData.store_logo,
      not_valid_for: parsedData.not_valid_for,
      discount_offer: parsedData.discount_offer,
    };

    processingStep.value = "review";
  } catch (error) {
    toastError({
      title: "Error uploading discount",
      description: error.message,
    });
  } finally {
    uploading.value = false;
  }
};

const saveToDatabase = async () => {
  try {
    uploading.value = true;

    const { error: dbError } = await supabase.from("board_discounts").insert({
      discount_file_name: tempFileName.value,
      board_id: props.boardId,
      valid_until: formData.value.valid_until,
      useable_in: formData.value.useable_in,
      condition: formData.value.conditions,
      additional_info: {
        store: formData.value.store,
        currency: formData.value.currency,
        store_logo: formData.value.store_logo,
      },
      not_valid_for: formData.value.not_valid_for,
      discount_offer: formData.value.discount_offer,
    });

    if (dbError) throw dbError;

    toastSuccess({ title: "Discount saved successfully" });
    isOpen.value = false;
    emit("saved");
  } catch (error) {
    toastError({
      title: "Error saving discount",
      description: error.message,
    });
  } finally {
    uploading.value = false;
  }
};

const handleCloseModalWhenImageIsUploaded = async () => {
  if (tempFileName.value) {
    const { error: storageError } = await supabase.storage
      .from("discounts")
      .remove([tempFileName.value]);

    if (storageError) throw storageError;
  }

  processingStep.value = "upload";
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
