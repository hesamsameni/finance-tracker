export const useAI = () => {
  const provider = useState<string>("ai-provider", () => "openrouter");
  const openrouterModel = useState<string>(
    "ai-openrouter-model",
    () => "google/gemini-2.5-flash-lite",
  );

  const chat = async (
    messages: { role: string; content: string }[],
  ): Promise<string> => {
    const res = await $fetch<{ content: string }>("/api/ai", {
      method: "POST",
      body: {
        messages,
        provider: provider.value,
        model:
          provider.value === "openrouter" ? openrouterModel.value : undefined,
      },
    });
    return res.content;
  };

  return { provider, openrouterModel, chat };
};
