import { H3Event } from 'h3'

interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface Message {
  role: string;
  content: string | ContentPart[];
}

interface ChatRequest {
  provider: 'openai' | 'deepseek';
  model?: string;
  messages: Message[];
  temperature?: number;
  systemMessage?: string;
  stream?: boolean;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event) as ChatRequest

    // Validate request
    if (!body?.provider || !['openai', 'deepseek'].includes(body.provider)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid provider specified'
      })
    }

    if (!body?.messages || !Array.isArray(body.messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid messages format'
      })
    }

    // Configure provider settings
    const providerConfig = {
      openai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: config.openaiApiKey,
        defaultModel: 'gpt-4o-mini'
      },
      deepseek: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: config.deepseekApiKey,
        defaultModel: 'deepseek-chat'
      }
    }[body.provider]

    const payload = {
      model: body.model || providerConfig.defaultModel,
      messages: [
        {
          role: 'system',
          content: `YOU MUST FOLLOW THESE RULES PRECISELY:
1. Analyze receipt/document and extract EXACTLY these fields in JSON format:
{
  "store": "string",
  "store_logo": "svg-url|png-url|not-specified",
  "valid_until": "timestamp",
  "not_valid_for": ["string","string"],
  "conditions": "string",
  "currency": "3-letter-uppercase-code",
  "useable_in": "string",
  "discount_offer": "string"
}

2. DATA PROCESSING RULES:
- Dates: Convert to (YYYY-MM-DD)
- Currency: Extract from discount_offer/document, use 3-letter ISO code (e.g., EUR, USD)
- Missing values: Use "not-specified" (never null/empty)
- Translation: All text to English
- Formatting: No markdown, ONLY RAW JSON
- you should be able to find store name in the texts

3. SPECIAL FIELD INSTRUCTIONS:
→ store_logo: 
   - Preferred SVG/PNG URL from official sources
   - Only use "not-specified" if unavailable
→ not_valid_for: 
   - Array of specific restrictions (e.g., ["online purchases", "alcohol"])
   - Empty array if none found
→ useable_in: 
   - Comma-separated locations that the discount is valid in (e.g., "springfield, adidas"), you should be able to find it in the texts
→ discount_offer: 
   - Always include amount and currency (e.g., "€5 discount", "$10 off")

4. OUTPUT RULES:
- ONLY RETURN THE RAW JSON OBJECT
- NO EXTRA TEXT BEFORE/AFTER
- NO CODE BLOCKS (\`\`\`json)
- DOUBLE QUOTES ONLY
- PROPER JSON ESCAPING
- MAX 200 CHARACTERS PER STRING FIELD

FAILURE TO FOLLOW THESE RULES WILL CAUSE SYSTEM ERRORS.`
        },
        ...body.messages
      ],
      temperature: 0.7,
      max_tokens: 300
    };

    // Make the API request
    const response = await fetch(providerConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.apiKey}`
      },
      body: JSON.stringify(payload)
    })

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json()
      throw createError({
        statusCode: response.status,
        statusMessage: `${body.provider} API Error: ${errorData.error?.message || response.statusText}`
      })
    }

    // Parse response
    const data = await response.json()
    return data.choices[0].message.content

  } catch (error: any) {
    console.error('AI API Error:', error)

    // Detailed error in development
    if (process.dev) {
      return createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.message || 'AI Service Error',
        data: error.data
      })
    }

    // Generic error in production
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Failed to process AI request'
    })
  }
})
