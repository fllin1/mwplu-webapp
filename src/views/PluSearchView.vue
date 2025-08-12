<template>
  <AppLayout>
    <main class="main-content">
      <section class="header-section">
        <h1 class="page-title">Répertoire de Synthèses PLU</h1>
        <p class="page-description">
          Recherchez et consultez les synthèses des Plans Locaux d'Urbanisme de votre commune.
        </p>
      </section>

      <div class="search-container">
        <PluSelectionForm variant="search" button-text="Consulter la synthèse" />
      </div>
    </main>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import PluSelectionForm from '@/components/plu/PluSelectionForm.vue'
</script>

<style scoped>
.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.header-section {
  text-align: center;
  margin-bottom: var(--space-12);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  line-height: var(--line-height-tight);
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  max-width: 600px;
  margin: 0 auto;
  line-height: var(--line-height-relaxed);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
}



/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: var(--space-6) var(--space-4);
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .page-description {
    font-size: var(--font-size-base);
  }

  .search-form {
    padding: var(--space-6);
  }

  .view-synthesis-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
