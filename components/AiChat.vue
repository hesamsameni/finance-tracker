<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-lg' }">
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        body: { padding: 'p-0' },
        header: { padding: 'px-4 py-3' },
        footer: { padding: 'px-3 py-3' },
      }"
    >
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-sparkles"
              class="w-4 h-4 text-primary-500"
            />
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-xs"
            >
              <button
                v-for="p in providers"
                :key="p.id"
                class="px-2.5 py-1 transition-colors font-medium"
                :class="
                  provider === p.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                "
                @click="provider = p.id"
              >
                {{ p.label }}
              </button>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              size="xs"
              @click="isOpen = false"
            />
          </div>
        </div>
      </template>

      <!-- Messages -->
      <div
        ref="scrollContainer"
        class="h-[420px] lg:h-[500px] overflow-y-auto px-4 py-4 space-y-3"
      >
        <!-- Empty state -->
        <div
          v-if="!messages.length"
          class="flex flex-col items-center text-center py-6 space-y-4"
        >
          <div
            class="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="w-6 h-6 text-primary-500"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Ask about your expenses
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              Your full spending history is loaded as context
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              v-for="s in suggestions"
              :key="s"
              class="text-xs px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 text-gray-600 dark:text-gray-400 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all text-left"
              @click="sendSuggestion(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Message bubbles -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-primary-500 text-white rounded-tr-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
            "
          >
            <pre class="whitespace-pre-wrap font-sans text-sm">{{
              msg.content
            }}</pre>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading" class="flex justify-start">
          <div
            class="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3"
          >
            <div class="flex gap-1 items-center h-4">
              <span
                class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style="animation-delay: -0.3s"
              />
              <span
                class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style="animation-delay: -0.15s"
              />
              <span
                class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <template #footer>
        <div class="flex gap-2">
          <UInput
            v-model="input"
            placeholder="Ask about your expenses..."
            class="flex-1"
            size="sm"
            :disabled="loading"
            @keydown.enter.prevent="send"
          />
          <UButton
            icon="i-heroicons-paper-airplane"
            color="primary"
            size="sm"
            :loading="loading"
            :disabled="!input.trim() || loading"
            @click="send"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
import { nextTick } from "vue";

const props = defineProps({
  modelValue: Boolean,
  expenses: {
    type: Array,
    default: () => [],
  },
  members: {
    type: Array,
    default: () => [],
  },
  currency: {
    type: String,
    default: "EUR",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const { provider, openrouterModel, chat } = useAI();

const providers = [
  { id: "openrouter", label: "OpenRouter" },
  { id: "deepseek", label: "DeepSeek" },
];

const suggestions = [
  "How much did I spend last month?",
  "What's my biggest spending category?",
  "Who spent the most overall?",
  "Compare my spending month by month",
];

const messages = ref([]);
const conversationHistory = ref([]);
const input = ref("");
const loading = ref(false);
const scrollContainer = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const systemPrompt = computed(() => {
  const curr = props.currency || "EUR";
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(n);

  const memberTotals = {};
  props.members.forEach((m) => {
    memberTotals[m.user_nickname] = 0;
  });

  const categoryTotals = {};
  const monthTotals = {};

  props.expenses.forEach((e) => {
    const member = props.members.find((m) => m.user_id === e.paid_by);
    const name = member?.user_nickname || "Unknown";
    memberTotals[name] = (memberTotals[name] || 0) + e.amount;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    const month = e.purchase_date?.split("T")[0]?.slice(0, 7);
    if (month) monthTotals[month] = (monthTotals[month] || 0) + e.amount;
  });

  const grandTotal = props.expenses.reduce((s, e) => s + e.amount, 0);

  const lines = (obj, sort = false) => {
    let entries = Object.entries(obj);
    if (sort) entries = entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([k, v]) => `  ${k}: ${fmt(v)}`).join("\n");
  };

  const expensesList = props.expenses.map((e) => {
    const member = props.members.find((m) => m.user_id === e.paid_by);
    return {
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.purchase_date?.split("T")[0],
      paid_by: member?.user_nickname || "Unknown",
    };
  });

  return `You are a finance assistant. Use the PRE-COMPUTED STATISTICS for all totals and summaries — never manually sum from the raw records.

Currency: ${curr}
Members: ${props.members.map((m) => m.user_nickname).join(", ") || "N/A"}
Total records: ${props.expenses.length}

=== PRE-COMPUTED STATISTICS (always use these for totals) ===

Grand total (all time): ${fmt(grandTotal)}

Per member:
${lines(memberTotals, true)}

Per category:
${lines(categoryTotals, true)}

Per month (YYYY-MM):
${Object.entries(monthTotals)
  .sort()
  .map(([k, v]) => `  ${k}: ${fmt(v)}`)
  .join("\n")}

=== RAW RECORDS (use only for item-level lookups) ===
${JSON.stringify(expensesList)}

Rules:
- For any question about totals or summaries, READ from the pre-computed section above — do not sum raw records
- For period-specific totals not in the monthly breakdown, sum only the relevant months from the monthly section
- Format all amounts in ${curr}
- Be concise`;
});

const send = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  input.value = "";
  loading.value = true;

  messages.value.push({ id: Date.now(), role: "user", content: text });
  conversationHistory.value.push({ role: "user", content: text });
  await scrollToBottom();

  try {
    const apiMessages = [
      { role: "system", content: systemPrompt.value },
      ...conversationHistory.value,
    ];

    const content = await chat(apiMessages);
    messages.value.push({ id: Date.now() + 1, role: "assistant", content });
    conversationHistory.value.push({ role: "assistant", content });
  } catch {
    const content =
      "Sorry, something went wrong. Please check your API key and try again.";
    messages.value.push({ id: Date.now() + 1, role: "assistant", content });
    conversationHistory.value.pop();
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};

const sendSuggestion = (s) => {
  input.value = s;
  send();
};
</script>
