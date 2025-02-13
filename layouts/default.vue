<template>
  <div class="mx-auto px-4 lg:px-8 max-w-7xl">
    <AppHeader />

    <main class="my-10">
      <div class="grid grid-cols-12 lg:gap-10">
        <div class="hidden lg:block lg:col-span-2">
          <AppSidebar />
        </div>
        <div class="col-span-12 lg:col-span-8">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Link to Google Fonts
useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
      crossorigin: "",
    },
  ],
});
</script>

<style>
/* Set the font family for the entire site */
body {
  font-family: "Inter";
}
/* Set the background color for the entire site */
body {
  @apply dark:bg-gray-900 bg-white;
}

::-webkit-scrollbar {
  width: 6px; /* for vertical scrollbars */
  height: 6px; /* for horizontal scrollbars */
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}
</style>
