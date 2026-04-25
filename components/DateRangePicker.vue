<template>
  <UPopover :popper="{ placement: 'bottom-end' }">
    <UButton
      variant="outline"
      color="gray"
      size="sm"
      icon="i-heroicons-calendar-days"
      :label="label"
      trailing-icon="i-heroicons-chevron-down"
    />

    <template #panel="{ close }">
      <div class="p-4 w-72 space-y-4">
        <!-- Quick presets -->
        <div class="flex gap-2">
          <UButton
            size="xs"
            :variant="preset === 'thisMonth' ? 'solid' : 'outline'"
            color="primary"
            @click="applyPreset('thisMonth', close)"
          >
            This Month
          </UButton>
          <UButton
            size="xs"
            :variant="preset === 'allTime' ? 'solid' : 'outline'"
            color="gray"
            @click="applyPreset('allTime', close)"
          >
            All Time
          </UButton>
        </div>

        <UDivider label="Custom Range" />

        <div class="space-y-3">
          <!-- From -->
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">From</p>
            <div class="flex gap-2">
              <USelectMenu
                v-model="fromMonth"
                :options="monthNames"
                size="sm"
                class="flex-1"
              />
              <UInput
                v-model.number="fromYear"
                type="number"
                size="sm"
                class="w-24"
                :min="2000"
                :max="currentYear + 1"
              />
            </div>
          </div>

          <!-- To -->
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">To</p>
            <div class="flex gap-2">
              <USelectMenu
                v-model="toMonth"
                :options="monthNames"
                size="sm"
                class="flex-1"
              />
              <UInput
                v-model.number="toYear"
                type="number"
                size="sm"
                class="w-24"
                :min="2000"
                :max="currentYear + 1"
              />
            </div>
          </div>
        </div>

        <UButton block size="sm" color="primary" @click="applyCustom(close)">
          Apply
        </UButton>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
import { startOfMonth, endOfMonth, format } from "date-fns";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const currentYear = new Date().getFullYear();

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const preset = ref("thisMonth");

const fromMonth = ref(monthNames[new Date().getMonth()]);
const fromYear = ref(currentYear);
const toMonth = ref(monthNames[new Date().getMonth()]);
const toYear = ref(currentYear);

const label = computed(() => {
  const from = props.modelValue?.from;
  const to = props.modelValue?.to;
  if (!from || !to) return "Select period";
  if (from <= new Date(1000)) return "All Time";
  const fromStr = format(from, "MMM yyyy");
  const toStr = format(to, "MMM yyyy");
  return fromStr === toStr ? fromStr : `${fromStr} – ${toStr}`;
});

const applyPreset = (name, close) => {
  preset.value = name;
  const now = new Date();
  if (name === "thisMonth") {
    emit("update:modelValue", {
      from: startOfMonth(now),
      to: endOfMonth(now),
    });
  } else if (name === "allTime") {
    emit("update:modelValue", {
      from: new Date(0),
      to: endOfMonth(now),
    });
  }
  close();
};

const applyCustom = (close) => {
  preset.value = null;
  const fromIdx = monthNames.indexOf(fromMonth.value);
  const toIdx = monthNames.indexOf(toMonth.value);
  let fromDate = new Date(fromYear.value, fromIdx, 1);
  let toDate = new Date(toYear.value, toIdx, 1);
  if (fromDate > toDate) {
    [fromDate, toDate] = [toDate, fromDate];
  }
  emit("update:modelValue", {
    from: startOfMonth(fromDate),
    to: endOfMonth(toDate),
  });
  close();
};
</script>
