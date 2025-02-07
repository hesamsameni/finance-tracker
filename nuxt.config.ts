// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1"',
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', 'nuxt-plotly'],
  supabase: {
    redirect: false
  },
  runtimeConfig: {
    deepseekApiKey: process.env.NUXT_DEEPSEEK_API_KEY,
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    public: {
      baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
    },
  },
  vite: {
    optimizeDeps: {
      include: ["plotly.js-dist-min"],
    },
  },
})
