<script setup lang="ts">
const links = [
  [
    {
      label: "Boards",
      icon: "i-heroicons-home",
      to: "/",
    },
  ],
  [
    {
      label: "Github",
      icon: "i-heroicons-code-bracket-square",
      to: "https://github.com/hesamsameni/finance-tracker",
    },
    {
      label: "Visit me",
      icon: "i-heroicons-user",
      to: "http://hesamsameni.com",
    },
  ],
];
</script>

<template>
  <UVerticalNavigation :links="links" />
</template>
