<template>
  <AppLayout>
    <div class="container">
      <h1>À propos de MWPLU</h1>
      <p>MWPLU est une plateforme dédiée à la simplification de l'accès aux documents d'urbanisme. Notre mission est de rendre l'information sur l'aménagement du territoire plus accessible et compréhensible pour tous.</p>
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
}
</style>
