<template>
  <nav class="breadcrumb-nav" aria-label="Fil d'Ariane">
    <ol class="breadcrumb-list">
      <!-- Home Link -->
      <li class="breadcrumb-item">
        <router-link to="/" class="breadcrumb-link home-link">
          <svg class="home-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span class="sr-only">Accueil</span>
        </router-link>
      </li>

      <!-- Dynamic Breadcrumb Items -->
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="item.path || index"
        class="breadcrumb-item"
      >
        <!-- Separator -->
        <svg class="breadcrumb-separator" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>

        <!-- Link or Text -->
        <router-link
          v-if="item.path && !item.current"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.label }}
        </router-link>
        <span
          v-else
          class="breadcrumb-current"
          :aria-current="item.current ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
/**
 * BreadcrumbNav Component
 * @description Breadcrumb navigation for hierarchical page navigation
 *
 * Features:
 * - Automatic breadcrumb generation based on current route
 * - Support for custom breadcrumb items
 * - Accessibility support with proper ARIA attributes
 * - Home icon as first item
 * - Responsive design with text truncation
 * - SEO-friendly structured data
 *
 * Props:
 * - items: Custom breadcrumb items array
 * - autoGenerate: Whether to auto-generate from route
 * - homeLabel: Custom label for home link
 * - showHome: Whether to show home link
 *
 * Item Structure:
 * {
 *   label: 'Display Text',
 *   path: '/route/path', // Optional, if not provided, item is not clickable
 *   current: boolean     // Whether this is the current page
 * }
 *
 * Design Principles:
 * - Clear visual hierarchy
 * - Accessible navigation
 * - Consistent with design system
 * - Mobile-friendly with truncation
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'BreadcrumbNav',

  props: {
    /**
     * Custom breadcrumb items
     */
    items: {
      type: Array,
      default: () => []
    },

    /**
     * Whether to auto-generate breadcrumbs from route
     */
    autoGenerate: {
      type: Boolean,
      default: false
    },

    /**
     * Custom label for home link
     */
    homeLabel: {
      type: String,
      default: 'Accueil'
    },

    /**
     * Whether to show home link
     */
    showHome: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const route = useRoute()

    /**
     * Generate breadcrumbs from current route
     */
    const generateFromRoute = () => {
      const pathSegments = route.path.split('/').filter(Boolean)
      const breadcrumbs = []

      let currentPath = ''

      for (let i = 0; i < pathSegments.length; i++) {
        currentPath += `/${pathSegments[i]}`
        const segment = pathSegments[i]
        const isLast = i === pathSegments.length - 1

        // Convert route segments to readable labels
        let label = segment

        // Common route transformations
        switch (segment) {
          case 'plu':
            label = 'PLU'
            break
          case 'synthesis':
            label = 'Synthèse'
            break
          case 'profile':
            label = 'Profil'
            break
          case 'contact':
            label = 'Contact'
            break
          case 'about':
            label = 'À propos'
            break
          default:
            // Capitalize and replace dashes/underscores
            label = segment
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())
        }

        breadcrumbs.push({
          label,
          path: isLast ? undefined : currentPath,
          current: isLast
        })
      }

      return breadcrumbs
    }

    /**
     * Final breadcrumb items to display
     */
    const breadcrumbItems = computed(() => {
      if (props.items.length > 0) {
        return props.items
      }

      if (props.autoGenerate) {
        return generateFromRoute()
      }

      return []
    })

    return {
      breadcrumbItems
    }
  }
}
</script>

<style scoped>
.breadcrumb-nav {
  margin-bottom: var(--space-6);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Home Icon */
.home-icon {
  width: 16px;
  height: 16px;
}

/* Links */
.breadcrumb-link {
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-button);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-link:hover {
  color: var(--color-blue);
  background-color: var(--color-gray-50);
}

.breadcrumb-link:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 1px;
}

.home-link {
  padding: var(--space-1);
  max-width: none;
}

.home-link:hover .home-icon {
  color: var(--color-blue);
}

/* Current Page */
.breadcrumb-current {
  color: var(--color-black);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-2);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Separator */
.breadcrumb-separator {
  width: 16px;
  height: 16px;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .breadcrumb-nav {
    margin-bottom: var(--space-4);
  }

  .breadcrumb-link,
  .breadcrumb-current {
    font-size: var(--font-size-xs);
    max-width: 100px;
  }

  .breadcrumb-current {
    max-width: 120px;
  }

  .breadcrumb-separator,
  .home-icon {
    width: 14px;
    height: 14px;
  }
}

/* Print Styles */
@media print {
  .breadcrumb-nav {
    margin-bottom: var(--space-3);
  }

  .breadcrumb-link {
    color: var(--color-black);
    text-decoration: underline;
  }

  .breadcrumb-separator {
    color: var(--color-black);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    color: var(--color-black);
  }

  .breadcrumb-link:hover {
    background-color: var(--color-black);
    color: var(--color-white);
  }

  .breadcrumb-separator {
    color: var(--color-black);
  }
}
</style>
