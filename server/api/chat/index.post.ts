import { H3Event } from 'h3'

interface Message {
  role: string
  content: string
}

interface ChatRequest {
  provider: 'openai' | 'deepseek'
  model?: string
  messages: Message[]
  temperature?: number
  systemMessage?: string
  stream?: boolean
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
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
        defaultModel: 'gpt-3.5-turbo'
      },
      deepseek: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: config.deepseekApiKey,
        defaultModel: 'deepseek-chat'
      }
    }[body.provider]

    // Create the request payload
    const payload = {
      model: body.model || providerConfig.defaultModel,
      messages: [
        {
          role: 'system',
          content: body.systemMessage || 'You are a helpful assistant'
        },
        ...body.messages
      ],
      temperature: body.temperature ?? 0.7,
      stream: body.stream ?? false
    }

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

        // Handle streaming response
        if (body.stream) {
          setResponseHeaders(event, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          })
    
          const stream = response.body
          return sendStream(event, stream)
        }

    // Parse response
    const data = await response.json() as LLMResponse
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