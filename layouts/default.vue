<template>
  <div class="mx-auto px-4 lg:px-8 max-w-7xl">
    <AppHeader />

    <main class="my-10">
      <div class="grid grid-cols-12 gap-10">
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
      href: "https://fonts.googleapis.com/css2?family=Raleway&display=swap",
      crossorigin: "",
    },
  ],
});
</script>

<style>
/* Set the font family for the entire site */
body {
  font-family: "Raleway";
}
/* Set the background color for the entire site */
body {
  @apply dark:bg-gray-900 bg-white;
}
</style>
