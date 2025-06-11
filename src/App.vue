<template>
  <div id="app">
    <!-- Global notification component -->
    <GlobalNotification />

    <!-- Loading overlay -->
    <div
      v-if="authStore.isLoading && !authStore.isInitialized"
      class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Main app content -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import GlobalNotification from '@/components/common/GlobalNotification.vue'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialize auth state
  await authStore.initializeAuth()

  // Setup auth listener for real-time updates
  authStore.setupAuthListener()
})
</script>

<style>
/* Global styles */
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Add any global CSS here */
</style>
