<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10 lg:hidden"
  >
    <nav class="flex justify-around py-3">
      <NuxtLink
        :to="`/boards/${boardId}/expenses?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/expenses') }"
      >
        <UIcon name="i-heroicons-banknotes" class="text-2xl" />
        <span class="text-xs">Expenses</span>
      </NuxtLink>
      <NuxtLink
        :to="`/boards/${boardId}/notes?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/notes') }"
      >
        <UIcon name="i-heroicons-pencil-square" class="text-2xl" />
        <span class="text-xs">Notes</span>
      </NuxtLink>
      <NuxtLink
        :to="`/boards/${boardId}/discounts?title=${$route.query.title}&currency=${$route.query.currency}`"
        class="flex flex-col items-center"
        :class="{ 'text-primary-500': $route.path.includes('/discounts') }"
      >
        <UIcon name="i-heroicons-receipt-percent" class="text-2xl" />
        <span class="text-xs">Discounts</span>
      </NuxtLink>
    </nav>
  </div>
  <section class="hidden lg:flex justify-between items-center mb-4">
    <div class="flex justify-start items-center gap-2">
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/expenses?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/expenses'),
            'text-gray-500': !$route.path.includes('/expenses'),
          }"
        >
          Expenses
        </nuxt-link>
      </div>
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/notes?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/notes'),
            'text-gray-500': !$route.path.includes('/notes'),
          }"
        >
          Notes
        </nuxt-link>
      </div>
      <div>
        <nuxt-link
          :to="`/boards/${boardId}/discounts?title=${$route.query.title}&currency=${$route.query.currency}`"
          :class="{
            'text-primary-500': $route.path.includes('/discounts'),
            'text-gray-500': !$route.path.includes('/discounts'),
          }"
        >
          Discounts
        </nuxt-link>
      </div>
    </div>
    <UButton
      icon="i-heroicons-plus-circle"
      color="primary"
      variant="solid"
      size="sm"
      label="Add new"
      @click="discountModalIsOpen = true"
    />
  </section>
  <DiscountModal
    v-model="discountModalIsOpen"
    :board-id="$route.params.id"
    @saved="refreshDiscounts($route.params.id)"
  />

  <section v-if="!discountsPending">
    <div v-if="discounts.length > 0">
      <div v-for="discount in discounts" :key="discount.id">
        <Discount
          :discount="discount"
          :loading="discountsPending"
          @deleted="refreshDiscounts($route.params.id)"
        />
      </div>
    </div>
    <div v-else>
      <p class="text-center">No valid discount available.</p>
    </div>
  </section>
  <section v-else>
    <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
  </section>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";
const discountModalIsOpen = ref(false);
const route = useRoute();
const boardId = route.params.id;
const selectedView = ref(transactionViewOptions[1]); // Default selected view option

const { discounts, discountsPending, refreshDiscounts } = useBoardData(
  boardId,
  selectedView
);
await refreshDiscounts(boardId);
</script>
