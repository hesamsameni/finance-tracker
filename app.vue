<template>
  <NuxtLayout>
    <NuxtPage />
    <UNotifications :ui="{ position: 'bottom-5 right-0' }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: "Roomie - The Ultimate Roommate Expense App",
  meta: [
    {
      name: "description",
      content:
        "Roomie helps you manage shared expenses, shopping lists, and notes effortlessly with roommates or partners. Simplify household management and stay organized!",
    },
    { name: "apple-mobile-web-app-title", content: "Roomie" },
  ],
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-96x96.png",
      sizes: "96x96",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "shortcut icon", href: "/favicon.ico" },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    { rel: "manifest", href: "/site.webmanifest" },
  ],
});
useSeoMeta({
  ogImage: "/favicon-96x96.png",
});
</script>
