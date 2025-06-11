<template>
  <AppLayout>
    <div class="container">
      <h1>Soutenez MWPLU</h1>
      <p>Votre soutien nous aide à maintenir et à améliorer la plateforme MWPLU, en rendant l'accès aux documents d'urbanisme plus facile pour tous.</p>
      <p>Merci pour votre générosité !</p>
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
  line-height: 1.6;
  margin-bottom: var(--space-4);
}
</style>
