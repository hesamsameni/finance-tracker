import OpenAI from "openai";

export function createAiClient(provider: string) {
  const config = useRuntimeConfig();

  if (provider === "deepseek") {
    return {
      client: new OpenAI({
        apiKey: config.deepseekApiKey as string,
        baseURL: "https://api.deepseek.com",
      }),
      model: "deepseek-v4-flash",
    };
  }

  if (provider === "openrouter") {
    return {
      client: new OpenAI({
        apiKey: config.openrouterApiKey as string,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": config.public.baseUrl as string,
        },
      }),
      model: "google/gemini-2.5-flash-lite",
    };
  }

  return {
    client: new OpenAI({ apiKey: config.openaiApiKey as string }),
    model: "gpt-4o-mini",
  };
}
