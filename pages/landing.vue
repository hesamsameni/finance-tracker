<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Hero Section -->
    <section
      class="relative bg-gray-800 py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <!-- Hero background image -->
      <div class="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt="People managing expenses
        together"
          class="w-full h-full object-cover opacity-20"
        />
        <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>

      <div class="relative max-w-4xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-white mb-4">Roomie App</h1>
        <UBadge color="white" class="mb-6">Seamless Expense Management</UBadge>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Keep track of every shared expense effortlessly. From rent and
          utilities to grocery runs and household supplies, Roomie-app helps you
          split costs fairly and keep everyone on the same page.
        </p>
        <UButton
          size="xl"
          color="primary"
          variant="solid"
          label="Get Started Now"
          class="shadow-lg hover:shadow-xl transition-shadow mt-10"
          to="/login"
        />
      </div>
    </section>

    <!-- Key Features -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-white mb-8 text-center">
          Key Features
        </h2>
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <UCard class="bg-gray-800 border-gray-700">
            <ul class="space-y-6">
              <li
                v-for="(feature, index) in features"
                :key="index"
                class="flex items-start"
              >
                <UIcon
                  name="i-heroicons-check-circle"
                  class="flex-shrink-0 h-6 w-6 text-primary-400 mt-1"
                />
                <div class="ml-3">
                  <h3 class="font-semibold text-white">{{ feature.title }}</h3>
                  <p class="text-gray-300 text-sm">{{ feature.description }}</p>
                </div>
              </li>
            </ul>
          </UCard>
          <img
            src="/images/smartphone.jpg"
            alt="Mobile app interface"
            class="rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>

    <!-- Collaborative Features -->
    <section class="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-white mb-4 text-center">
          Stay Organized Together
        </h2>
        <p class="text-xl text-gray-300 text-center mb-12">
          Turn household management into a breeze with our collaborative
          features:
        </p>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Digital Shopping List -->
          <div class="space-y-6">
            <img
              src="/images/paper.jpg"
              alt="Digital shopping list
            interface"
              class="rounded-lg shadow-xl mb-6"
            />
            <UCard class="bg-gray-900 border-gray-700">
              <template #header>
                <h3 class="text-2xl font-bold text-white">
                  Digital Shopping List
                </h3>
              </template>
              <ul class="space-y-4">
                <li
                  v-for="(item, index) in shoppingListFeatures"
                  :key="index"
                  class="flex items-center"
                >
                  <UIcon
                    name="i-heroicons-check"
                    class="flex-shrink-0 h-5 w-5 text-primary-400 mr-2"
                  />
                  <span class="text-gray-300">{{ item }}</span>
                </li>
              </ul>
            </UCard>
          </div>

          <!-- Smart Coupon Wallet -->
          <div class="space-y-6">
            <img
              src="/images/calculator.jpg"
              alt="Coupon management
            interface"
              class="rounded-lg shadow-xl mb-6"
            />
            <UCard class="bg-gray-900 border-gray-700">
              <template #header>
                <h3 class="text-2xl font-bold text-white">
                  Smart Coupon Wallet
                </h3>
              </template>
              <ul class="space-y-4">
                <li
                  v-for="(item, index) in couponFeatures"
                  :key="index"
                  class="flex items-center"
                >
                  <UIcon
                    name="i-heroicons-check"
                    class="flex-shrink-0 h-5 w-5 text-primary-400 mr-2"
                  />
                  <span class="text-gray-300">{{ item }}</span>
                </li>
              </ul>
            </UCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-white mb-8 text-center">
          Why Choose Roomie?
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <UCard
            v-for="(benefit, index) in benefits"
            :key="index"
            class="text-center bg-gray-800 border-gray-700 transform hover:scale-105 transition-transform duration-300"
          >
            <h3 class="font-semibold text-white mb-2">{{ benefit.title }}</h3>
            <p class="text-gray-300">{{ benefit.description }}</p>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="relative bg-primary-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <!-- CTA background image -->
      <div class="absolute inset-0">
        <img
          src="/images/laptop.jpg"
          alt="Happy roommates using app
        together"
          class="w-full h-full object-cover opacity-10"
        />
        <div class="absolute inset-0 bg-primary-900 opacity-75"></div>
      </div>

      <div class="relative max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-8">
          Ready to Simplify Your Household Expenses?
        </h2>
        <UButton
          size="xl"
          color="black"
          variant="solid"
          label="Get Started Now"
          class="shadow-lg hover:shadow-xl transition-shadow"
          to="/login"
        />
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-950 text-gray-300 py-8 px-4 text-center">
      <p>
        Made with
        <UIcon
          name="i-heroicons-heart"
          class="inline-block h-5 w-5 text-red-500"
        />
        by <a href="https://hesamsameni.com" target="_blank">Hesam Sameni</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "landing",
});

const features = [
  {
    title: "Simple Expense Tracking",
    description: "Log and categorize all household expenses in one place",
  },
  {
    title: "Monthly History",
    description:
      "Previous expenses automatically carry forward, giving you a clear view of spending patterns",
  },
  {
    title: "Flexible Recording",
    description:
      "Track both shared and individual expenses without forcing splits",
  },
];

const shoppingListFeatures = [
  "Create and share shopping lists in real-time",
  "Mark items as purchased instantly",
  "Add recurring items with one tap",
  "Never forget essential household items again",
];

const couponFeatures = [
  "Upload all your discount coupons in one place",
  "Get notifications before coupons expire",
  "Share savings opportunities with your roomies",
  "Track how much you've saved together",
];

const benefits = [
  {
    title: "Complete Flexibility",
    description: "Track expenses your way, whether shared or individual",
  },
  {
    title: "Time-Saving",
    description:
      "Spend less time managing finances and more time enjoying your shared space",
  },
  {
    title: "Budget-Friendly",
    description:
      "Make the most of your money with expense insights and coupon savings",
  },
  {
    title: "Better Together",
    description:
      "Foster transparency and trust in your shared living arrangement",
  },
];
</script>
