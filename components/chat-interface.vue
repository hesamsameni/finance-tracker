<!-- components/ChatInterface.vue -->
<script setup lang="ts">
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const messages = ref<ChatMessage[]>([]);
const input = ref("");
const isLoading = ref(false);
const isStreaming = ref(false);

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  isLoading.value = true;
  isStreaming.value = true;
  const userMessage = input.value;
  input.value = "";

  messages.value.push({ role: "user", content: userMessage });
  messages.value.push({ role: "assistant", content: "" });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "openai",
        messages: messages.value.slice(0, -1),
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let aiResponse = "";

    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices[0]?.delta?.content || "";
            aiResponse += content;
            messages.value[messages.value.length - 1].content = aiResponse;
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to get response");
  } finally {
    isLoading.value = false;
    isStreaming.value = false;
  }
};
</script>

<template>
  <UCard>
    <div class="flex flex-col h-full p-4">
      <div class="flex flex-col flex-grow overflow-y-auto space-y-4">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex items-center"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div v-if="msg.role === 'assistant'" class="mr-2">
            <UAvatar src="/images/ai.png" alt="AI Avatar" class="h-8 w-8" />
          </div>
          <div
            class="px-4 py-2 rounded-lg max-w-xs"
            :class="
              msg.role === 'user'
                ? 'text-primary-500 border border-primary-500'
                : 'text-zinc-200 border border-zinc-200'
            "
          >
            {{ msg.content }}
          </div>
          <div v-if="msg.role === 'user'" class="ml-2">
            <UAvatar
              v-if="user?.user_metadata.avatar_url"
              :src="user.user_metadata.avatar_url"
              alt="User Avatar"
              class="h-8 w-8"
            />
          </div>
        </div>
        <div v-if="isLoading" class="text-primary-500 italic text-center">
          Thinking...
        </div>
      </div>

      <form @submit.prevent="sendMessage" class="pt-10">
        <div class="flex justify-center items-center gap-2">
          <UInput
            v-model="input"
            color="gray"
            variant="outline"
            placeholder="Type something here..."
            class="w-full"
          />
          <UButton
            icon="i-heroicons-arrow-small-right"
            color="primary"
            type="submit"
            :disabled="isLoading"
          />
        </div>
      </form>
    </div>
  </UCard>
</template>
