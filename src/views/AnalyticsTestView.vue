<template>
    <AppLayout>
        <div class="analytics-test-page">
            <div class="container">
                <h1>Analytics Test Page</h1>
                <p>This page is for testing Firebase Analytics integration.</p>

                <div class="test-buttons">
                    <button @click="testCustomEvent" class="btn btn-primary">
                        Test Custom Event
                    </button>

                    <button @click="testLoginEvent" class="btn btn-secondary">
                        Test Login Event
                    </button>

                    <button @click="testPluViewEvent" class="btn btn-outline">
                        Test PLU View Event
                    </button>

                    <button @click="testErrorEvent" class="btn btn-danger">
                        Test Error Event
                    </button>
                </div>

                <div v-if="lastEvent" class="event-display">
                    <h3>Last Event Tracked:</h3>
                    <pre>{{ lastEvent }}</pre>
                </div>

                <div class="analytics-info">
                    <h3>Analytics Status:</h3>
                    <ul>
                        <li>Analytics Initialized: {{ analyticsStatus.initialized }}</li>
                        <li>Can Track: {{ analyticsStatus.canTrack }}</li>
                        <li>Debug Mode: {{ analyticsStatus.debugMode }}</li>
                        <li>User Opted Out: {{ analyticsStatus.optedOut }}</li>
                    </ul>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import AppLayout from '@/components/layout/AppLayout.vue'

const lastEvent = ref(null)

const {
    isInitialized,
    canTrack,
    debugMode,
    isOptedOut,
    trackEvent,
    trackLogin,
    trackPluView,
    trackError,
    enableDebug
} = useAnalytics()

// Enable debug mode for testing
enableDebug()

const analyticsStatus = computed(() => ({
    initialized: isInitialized.value,
    canTrack: canTrack.value,
    debugMode: debugMode.value,
    optedOut: isOptedOut.value
}))

const testCustomEvent = () => {
    const eventData = {
        test_parameter: 'test_value',
        timestamp: Date.now(),
        page: 'analytics_test'
    }

    trackEvent('test_custom_event', eventData)
    lastEvent.value = {
        name: 'test_custom_event',
        parameters: eventData
    }
}

const testLoginEvent = () => {
    trackLogin('test_method')
    lastEvent.value = {
        name: 'login',
        parameters: { method: 'test_method' }
    }
}

const testPluViewEvent = () => {
    trackPluView('Test City', 'Test Zone', 'test-plu-id')
    lastEvent.value = {
        name: 'plu_view',
        parameters: {
            content_type: 'plu_document',
            item_id: 'test-plu-id',
            city: 'Test City',
            zone: 'Test Zone'
        }
    }
}

const testErrorEvent = () => {
    trackError('test_error', 'This is a test error message', 'analytics_test_page')
    lastEvent.value = {
        name: 'exception',
        parameters: {
            description: 'This is a test error message',
            fatal: false,
            error_type: 'test_error',
            error_location: 'analytics_test_page'
        }
    }
}
</script>

<style scoped>
.analytics-test-page {
    padding: var(--space-8) 0;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--space-4);
}

h1 {
    color: var(--color-black);
    margin-bottom: var(--space-6);
}

.test-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: var(--space-8) 0;
}

.event-display {
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin: var(--space-8) 0;
}

.event-display h3 {
    margin-bottom: var(--space-4);
    color: var(--color-black);
}

.event-display pre {
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-button);
    padding: var(--space-4);
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-sm);
}

.analytics-info {
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-card);
    padding: var(--space-6);
}

.analytics-info h3 {
    margin-bottom: var(--space-4);
    color: var(--color-black);
}

.analytics-info ul {
    list-style: none;
    padding: 0;
}

.analytics-info li {
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-gray-200);
}

.analytics-info li:last-child {
    border-bottom: none;
}
</style>
