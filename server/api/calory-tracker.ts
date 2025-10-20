// server/api/analyze-meals.post.ts
import OpenAI from "openai";
import { serverSupabaseUser } from "#supabase/server";

const openai = new OpenAI({ apiKey: useRuntimeConfig().openaiApiKey });

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

  const body = await readBody(event);
  const { prompt } = body;
  if (!prompt)
    throw createError({ statusCode: 400, message: "Missing prompt" });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a calorie tracker AI. Convert food descriptions into structured nutrition data.",
      },
      {
        role: "user",
        content: `Analyze this meal list: "${prompt}" and return a JSON array with fields: item, meal_type (breakfast/lunch/dinner/snack), calories, protein, carbs, fat.
        make sure first letter of item name is uppercase and please simplify the item's name, for example if user says 'Homemade Falafel Sandwich that includes 4 felafels and tomato and lettuce' then the item name should be 'Falafel Sandwich'
         because we are storing those items in the database.
         meal_type should be one of these 4 values only: breakfast, lunch, dinner, snack. make sure meal_type is always lowercase and if it's not mentioned in the prompt it should be assigned automatically based on type of the food.
        `,
      },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0].message?.content ?? "";
  // Try to extract JSON safely
  const jsonMatch = text.match(/\[.*\]/s);
  let meals = [];
  if (jsonMatch) {
    try {
      meals = JSON.parse(jsonMatch[0]);
    } catch (err) {
      meals = [];
    }
  }

  return { meals };
});
