<template>
  <div>
    <div
      v-if="loading"
      class="py-5 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center"
    >
      <USkeleton class="h-8 w-full" />
    </div>
    <div v-else>
      <div class="flex flex-col">
        <UCard class="mb-5">
          <div class="flex gap-5">
            <div class="flex flex-col items-center align-center">
              <div
                class="border border-gray-700 rounded-md flex items-center justify-center w-32"
              >
                <a :href="url" download>
                  <img
                    :src="url"
                    alt="image"
                    class="w-full h-64 object-cover"
                  />
                </a>
              </div>

              <a
                @click.prevent="downloadFile(url, 'discount_file')"
                class="cursor-pointer mt-5 text-primary-500 font-semibold"
                >Download</a
              >
            </div>

            <div class="flex flex-col flex-start gap-5">
              <div v-if="discount.valid_until != 'not-specified'">
                <span class="font-bold">Valid Until: </span>{{ formattedDate }}
              </div>
              <div v-if="discount.discount_offer != 'not-specified'">
                <span class="font-bold">Amount: </span
                ><span class="text-primary">{{ discount.discount_offer }}</span>
              </div>
              <div v-if="discount.condition != 'not-specified'">
                <span class="font-bold">Usage Conditions: </span
                >{{ discount.condition }}
              </div>
              <div v-if="parsedAdditionalInfo['store'] != 'not-specified'">
                <span class="font-bold">Store: </span
                >{{ formatTitle(parsedAdditionalInfo["store"]) }}
              </div>
              <div
                v-if="
                  discount.not_valid_for != 'not-specified' &&
                  parsedNotValidFor.length != 0
                "
              >
                <div class="font-bold mb-2">Not Valid For:</div>
                <span v-for="(item, index) in parsedNotValidFor" :key="index">
                  <UBadge color="white" class="mr-2">{{
                    formatTitle(item)
                  }}</UBadge>
                </span>
              </div>
              <div v-if="discount.useable_in != 'not-specified'">
                <span class="font-bold">Useable in: </span
                ><span class="text-primary-500">{{
                  formatTitle(discount.useable_in)
                }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from "date-fns";

const props = defineProps({
  discount: Object,
  loading: Boolean,
});

const { url } = useDiscountImage(props.discount?.discount_file_name);
const { toastError, toastSuccess } = useAppToast();
const emit = defineEmits(["deleted"]);
const isLoading = ref(false);
const supabase = useSupabaseClient();

const formattedDate = computed(() => {
  // Parse and format the date
  return format(new Date(props.discount.valid_until), "do MMMM yyyy");
});

const parsedAdditionalInfo = computed(() => {
  return JSON.parse(props.discount.additional_info);
});

const parsedNotValidFor = computed(() => {
  return JSON.parse(props.discount.not_valid_for);
});

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const downloadFile = async (url, fileName) => {
  try {
    // Fetch the file
    const response = await fetch(url);
    const blob = await response.blob();

    // Create object URL
    const objectUrl = URL.createObjectURL(blob);

    // Create temporary link
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download error:", error);
    toastError({ title: "Error downloading file" });
  }
};
</script>

<style scoped>
.image-container {
  width: 200px;
  height: 300px;
  overflow: hidden;
  position: relative;
}

.image-container img {
  position: absolute;
}
</style>
