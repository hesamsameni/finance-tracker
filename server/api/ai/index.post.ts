import { serverSupabaseUser } from "#supabase/server";
import { createAiClient } from "~/server/utils/createAiClient";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const body = await readBody(event);
  const { messages, provider = "openai", model: customModel } = body;

  if (!messages?.length) {
    throw createError({ statusCode: 400, message: "Missing messages" });
  }

  const { client, model } = createAiClient(provider);

  const response = await client.chat.completions.create({
    model: customModel || model,
    messages,
  });

  console.log("token usage", response.usage);
  return { content: response.choices[0].message?.content ?? "" };
});
