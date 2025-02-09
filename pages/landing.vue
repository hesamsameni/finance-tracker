<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <h1 class="hero-title">Welcome to Our App!</h1>
      <p class="hero-subtitle">
        Your one-stop solution for managing your finances.
      </p>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="features-title">Key Features</h2>
      <ul class="features-list">
        <li>Feature 1: Easy Expense Tracking</li>
        <li>Feature 2: Budget Planning Tools</li>
        <li>Feature 3: Real-time Analytics</li>
      </ul>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>Made with love by Hesam</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
};
definePageMeta({
  layout: "landing",
});
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 50px 0;
  background-color: #f8f9fa;
}

.hero-title {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.hero-subtitle {
  font-size: 1.2em;
  color: #6c757d;
}

.features {
  padding: 20px;
}

.features-title {
  font-size: 2em;
  margin-bottom: 20px;
}

.features-list {
  list-style-type: none;
  padding: 0;
}

.footer {
  text-align: center;
  padding: 20px 0;
  background-color: #f8f9fa;
}
</style>
