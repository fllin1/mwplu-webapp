<template>
  <AppLayout>
    <div class="container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer vos documents et préférences.</p>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<style scoped>
.container {
  padding: var(--space-8);
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
}

p {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
}
</style>
