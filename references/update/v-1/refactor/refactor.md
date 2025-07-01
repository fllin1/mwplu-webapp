# Vue Refactoring Todo List for MWPLU

## Architecture Overview

- **Frontend**: Vue 3 SPA hosted on Firebase Hosting
- **Backend**: Supabase (Database + Edge Functions + Auth)
- **No Python**: All backend logic in Supabase Edge Functions (TypeScript/JavaScript)

## Phase 1: Setup and Foundation (Week 1-2)

### 1.1 Project Setup

- [x] Create Vue 3 project with Vite

  ```bash
  npm create vite@latest mwplu_webapp
  cd mwplu_webapp
  npm install
  ```

- [x] Install essential dependencies:

  ```bash
  npm install @supabase/supabase-js
  npm install vue-router@4
  npm install pinia
  npm install @vueuse/core
  npm install axios
  npm install firebase
  npm install -g firebase-tools
  ```

- [x] Setup Firebase hosting configuration for Vue
- [x] Configure environment variables (.env files)
- [x] Setup ESLint and Prettier for code consistency

### 1.2 Project Structure Setup

Create the following folder structure:

```text
src/
├── assets/          # Static assets (copy from current project)
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/      # Reusable Vue components
│   ├── common/      # Shared components
│   ├── auth/        # Auth-related components
│   ├── plu/         # PLU-specific components
│   └── layout/      # Layout components
├── views/           # Page components (routes)
│   ├── HomeView.vue
│   ├── LoginView.vue
│   ├── SignupView.vue
│   ├── ProfileView.vue
│   └── PluSynthesisView.vue
├── router/          # Vue Router configuration
├── stores/          # Pinia state management
├── services/        # API services (Supabase connections)
├── composables/     # Reusable composition functions
├── utils/           # Utility functions
└── styles/          # Global styles
```

### 1.3 Core Infrastructure

- [x] Setup Vue Router with route guards for authentication
- [x] Setup Pinia for state management
- [x] Create Supabase service module
- [x] Setup global error handling
- [x] Configure Turnstile CAPTCHA integration

## Phase 2: Authentication System (Week 2-3)

### 2.1 Auth Store (Pinia)

- [x] Create auth store (`stores/auth.js`) with:
  - User state from Supabase Auth
  - Loading/error states
  - Computed getters (isAuthenticated, userProfile)
- [x] Implement auth actions:
  - `signIn()` - Supabase Auth signInWithPassword
  - `signUp()` - Supabase Auth signUp
  - `signOut()` - Supabase Auth signOut
  - `confirmEmail()` - Handle email confirmation
  - `initializeAuth()` - Check existing session on app load

### 2.2 Auth Components

- [x] Create `LoginForm.vue` with Turnstile integration
- [x] Create `SignupForm.vue` with Turnstile integration
- [x] Create `ConfirmationView.vue` for email verification
- [x] Create `useAuthGuard` composable for route protection
- [x] Create `TurnstileWidget.vue` component

### 2.3 Supabase Auth Integration

- [x] Implement session persistence with Supabase
- [x] Add auth state listeners for real-time updates
- [x] Configure Row Level Security (RLS) policies

## Phase 2.5: Analytics Setup (Week 3)

### 2.5.1 Google Analytics 4 Implementation

- [x] Create GA4 property in Google Analytics
- [x] Install Vue gtag plugin:

  ```bash
  npm install vue-gtag-next
  ```

- [x] Configure GA4 in `main.js` with:
  - Page view tracking
  - User ID tracking (hashed)
  - Custom dimensions for user type
- [x] Create `composables/useAnalytics.js` for:
  - Track custom events
  - Track user actions
  - Track errors

### 2.5.2 Analytics Events to Track

- [x] Authentication events:
  - `login` - successful login
  - `signup` - new user registration
  - `logout` - user logout
- [x] PLU interaction events:
  - `plu_view` - viewing a PLU synthesis
  - `plu_download` - downloading a document
  - `plu_comment` - adding a comment
  - `plu_rate` - rating a document
- [x] User flow events:
  - `city_selected` - city selection
  - `zone_selected` - complete zone selection
  - `search_performed` - if search implemented
- [x] Conversion events:
  - `contact_form_submitted`
  - `payment_initiated` (future)
  - `subscription_completed` (future)

### 2.5.3 Privacy Compliance

- [x] Implement cookie consent banner
- [x] Create privacy policy page
- [x] Add GA4 anonymize IP setting
- [x] Allow users to opt-out of tracking
- [x] Ensure GDPR compliance for EU users

## Phase 3: Layout and Navigation (Week 3-4)

### 3.1 Layout Components

- [x] Create `AppHeader.vue`:
  - Logo and navigation links
  - User menu (when authenticated)
  - Mobile hamburger menu
- [x] Create `AppFooter.vue` with legal links
- [x] Create `AppLayout.vue` as main layout wrapper
- [x] Create `BaseSpinner.vue` for loading states
- [x] Create `BaseNotification.vue` for user feedback

### 3.2 Navigation Setup

- [x] Define routes in `router/index.js`:
  - Public routes: home, login, signup, terms
  - Protected routes: profile, plu-synthesis/*
  - Future routes: blog/*, docs/*, payment/*
- [x] Implement navigation guards using auth store
- [x] Add route transitions for better UX
- [x] Create `BreadcrumbNav.vue` for PLU pages

## Phase 4: Core Features Migration (Week 4-6)

### 4.1 Home Page with PLU Selection

- [x] Create `stores/plu.js` for PLU selection state
- [x] Create `CitySelector.vue` - dropdown with search
- [x] Create `ZoningSelector.vue` - dependent on city
- [x] Create `ZoneSelector.vue` - dependent on zoning
- [x] Implement selection flow:
  1. Load cities from Supabase
  2. Update available zonings on city change
  3. Update available zones on zoning change
  4. Navigate to synthesis page on complete selection
- [x] Add analytics tracking for selection flow

### 4.2 PLU Synthesis Page

- [x] Create `PluSynthesisView.vue` main container
- [x] Create `PluTabs.vue` for tab navigation:
  - Synthesis content
  - Comments & Ratings
  - Source documents
  - Download options
- [x] Create `PluContent.vue` for synthesis display
- [x] Create `PluMetadata.vue` for document info
- [x] Fetch PLU data from Supabase based on route params

### 4.3 Comments and Ratings System

- [x] Create Supabase tables: comments, ratings
- [x] Create `CommentSection.vue` container
- [x] Create `CommentItem.vue` for single comment
- [x] Create `CommentForm.vue` with validation
- [x] Create `RatingWidget.vue` (1-5 stars)
- [x] Setup Supabase real-time subscriptions for updates

### 4.4 Download Feature

- [x] Create `DownloadSection.vue`
- [x] Implement secure file URLs with Supabase Storage
- [x] Track downloads in Supabase database
- [x] Show download count and last updated date
- [x] Track download events in GA4 with document details

## Phase 5: Additional Features (Week 6-8)

### 5.1 Contact Form

- [ ] Create `ContactView.vue` page
- [ ] Create Supabase Edge Function for email sending
- [ ] Add form validation and Turnstile
- [ ] Store submissions in Supabase for tracking

### 5.2 User Profile

- [ ] Create `ProfileView.vue` with sections:
  - Account info (read-only email)
  - Change password functionality
  - Download history
  - Comment history
- [ ] Create `ProfileSettings.vue` component
- [ ] Connect to Supabase user metadata

### 5.3 Error Handling

- [ ] Create `NotFoundView.vue` (404 page)
- [ ] Create `ErrorView.vue` (generic errors)
- [ ] Implement Vue error boundaries
- [ ] Add Sentry or similar for error tracking

## Phase 6: Future Features Preparation (Week 8-9)

### 6.1 Blog Infrastructure

- [ ] Design Supabase schema for blog posts
- [ ] Create basic blog components:

  ```text
  components/blog/
  ├── BlogCard.vue
  ├── BlogPost.vue
  └── BlogComments.vue
  ```

- [ ] Setup blog routes and views

### 6.2 Documentation System

- [ ] Design documentation structure in Supabase
- [ ] Create documentation components:

  ```text
  components/docs/
  ├── DocsSidebar.vue
  ├── DocsContent.vue
  └── DocsSearch.vue
  ```

### 6.3 Payment System Foundation

- [ ] Choose payment provider (Stripe recommended)
- [ ] Design subscription schema in Supabase
- [ ] Create payment component shells
- [ ] Plan Supabase Edge Functions for payment webhooks

### 6.4 City Voting Feature

- [ ] Design voting schema in Supabase
- [ ] Create `CityPollView.vue`
- [ ] Create `VoteCard.vue` component
- [ ] Implement voting logic with user limits

## Phase 7: Optimization and Polish (Week 9-10)

### 7.1 Performance Optimization

- [ ] Implement route-level code splitting
- [ ] Add `<Suspense>` for async components
- [ ] Optimize images with lazy loading
- [ ] Enable Vite build optimizations
- [ ] Add service worker for offline capability

### 7.2 UI/UX Refinements

- [ ] Add skeleton screens for loading states
- [ ] Implement view transitions API
- [ ] Add hover/focus states consistently
- [ ] Ensure full mobile responsiveness
- [ ] Consider adding dark mode toggle

### 7.3 Testing Strategy

- [ ] Setup Vitest for unit tests
- [ ] Test critical auth flows
- [ ] Test PLU selection workflow
- [ ] Add Playwright for E2E tests
- [ ] Test Supabase RLS policies

## Phase 8: Deployment (Week 10)

### 8.1 Production Build

- [ ] Configure Vite production build
- [ ] Set up environment variables for production
- [ ] Minimize bundle size (analyze with rollup-plugin-visualizer)
- [ ] Generate and test production build locally

### 8.2 Firebase Hosting Setup

- [ ] Update `firebase.json`:

  ```json
  {
    "hosting": {
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{
        "source": "**",
        "destination": "/index.html"
      }]
    }
  }
  ```

- [ ] Setup GitHub Actions for CI/CD
- [ ] Configure preview channels for testing
- [ ] Set up production and staging environments

### 8.3 Migration Strategy

- [ ] Deploy Vue version to subdomain first (e.g., beta.mwplu.com)
- [ ] Run both versions in parallel initially
- [ ] Gradually redirect traffic to Vue version
- [ ] Monitor for issues and user feedback
- [ ] Plan sunset date for vanilla JS version

## Key Implementation Notes

### Supabase Integration

- All API calls go through Supabase client
- Use RLS policies for security
- Leverage real-time subscriptions where needed
- Store files in Supabase Storage

### State Management

- Auth state in Pinia auth store
- PLU selection in Pinia plu store
- UI state (modals, notifications) in Pinia ui store
- Form state kept local to components

### Security Considerations

- Never expose Supabase service key
- Use RLS policies for all tables
- Validate all inputs client and server side
- Implement rate limiting on Edge Functions

### Development Workflow

1. Work on one feature at a time
2. Test locally with Supabase local development
3. Deploy to Firebase preview channel
4. Get feedback before merging to production
5. Use feature flags for gradual rollout

## Success Metrics

- [ ] All current features working in Vue version
- [ ] Page load time under 3 seconds
- [ ] Lighthouse score above 90
- [ ] Zero critical security vulnerabilities
- [ ] Positive user feedback on new version
