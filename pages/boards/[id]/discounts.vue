<template>
  <section class="flex justify-end items-center my-10 gap-2">
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
  </section>
  <section class="flex justify-between items-center mb-10">
    <div>
      <h2 class="text-lg lg:text-2xl font-extrabold">Discounts</h2>
    </div>
    <div>
      <DiscountModal
        v-model="discountModalIsOpen"
        :board-id="$route.params.id"
        @saved="refreshDiscounts($route.params.id)"
      />
      <UButton
        icon="i-heroicons-plus-circle"
        color="primary"
        variant="solid"
        size="lg"
        label="Add new"
        @click="discountModalIsOpen = true"
      />
    </div>
  </section>

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
