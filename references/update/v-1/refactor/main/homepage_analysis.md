# Home Page Analysis

This document details the structure, styling, and client-side logic of the home page.

## HTML Structure

The home page is a standard HTML5 document with the following key sections:

*   `<!DOCTYPE html>`
*   `<html lang="fr">`
*   `<head>`:
    *   `<meta charset="UTF-8" />`
    *   `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
    *   `<title>Accueil - MWPLU</title>`
*   `<body>`:
    *   `<div id="header-placeholder"></div>`: Placeholder for the header component
    *   `<main class="main-content">`:
        *   `<section class="hero-section text-center">`: Hero section with a main title and a dynamic subtitle.
            *   `<h2 class="animate-title margin-bottom-md">Répertoire des synthèses de PLU</h2>`
            *   `<p class="lead" id="typewriter-subtitle"></p>`: Placeholder for a subtitle, likely filled by a typewriter effect.
        *   `<div class="container">`:
            *   `<div id="statusMessage" class="status-message alert alert-info"></div>`: Placeholder for status messages.
            *   `<form class="margin-bottom-lg form-home">`: Main search form.
                *   `<div class="grid">`: A grid layout for form fields, likely using a 12-column grid system (`grid-col-4` suggests 3 columns of equal width).
                    *   Three grid columns, each containing a form group:
                        *   **City Select**:
                            *   A label for city selection.
                            *   A disabled select dropdown for cities (options loaded by JS).
                        *   **Zoning Select**:
                            *   A label for zoning selection.
                            *   A disabled select dropdown for zoning (placeholder option: "Sélectionnez d'abord une ville").
                        *   **Zone Select**:
                            *   A label for zone selection.
                            *   A disabled select dropdown for zones (placeholder option: "Sélectionnez d'abord un zonage").
                *   A centered div with margin utilities:
                    *   A disabled button for viewing synthesis.
    *   `<!-- Footer will be loaded here -->`: Comment indicating the footer's dynamic loading.
    *   `<div id="footer-placeholder"></div>`: Placeholder for the footer component, dynamically loaded by JavaScript.

## Styling Elements (CSS Classes)

The home page utilizes various CSS classes for layout and styling:

*   `main-content`: Styles the main content area.
*   `hero-section`: Styles the main hero area.
*   `text-center`: A utility class for center-aligning text.
*   `animate-title`: Suggests an animation applied to the main title.
*   `margin-bottom-md`, `margin-top-lg`, `margin-bottom-sm`: Utility classes for applying different sizes of margins.
*   `lead`: Styles introductory text.
*   `container`: A general layout container for defining content width and centering.
*   `status-message`, `alert`, `alert-info`: Classes for styling information, warning, or error messages.
*   `form-home`: Styles the main search form.
*   `grid`: A container for a grid layout.
*   `grid-col-4`: A grid column class, typically used in a 12-column grid system to define column width (e.g., 3 columns of equal width).
*   `form-group`: A container for grouping form elements (label and input/select).
*   `form-label`: Styles form labels.
*   `form-select`: Styles select dropdowns.
*   `to-plu-btn`, `btn`: Classes for styling primary action buttons.

## Color Palette

The home page primarily uses the following colors defined as CSS variables and direct color values:

*   `--accent-gray`: Used in the hero section background grid.
*   `--primary-white`: Used for the hero section background and form background.
*   `--primary-black`: Used for headings.
*   `--border-gray`: Used implicitly, likely for borders related to inputs or other elements.
*   `--medium-gray`: Used for lead text.
*   `rgba(0, 0, 0, 0.08)`: Used for box shadow on the form.

## CSS Effects and Transitions

The home page incorporates the following visual effects and transitions:

*   **Hero Section Background Grid (`.hero-section::before`)**:
    *   Uses `linear-gradient` to create a grid pattern.
    *   Applies `opacity: 0.5` for a subtle effect.
    *   Uses `mask: radial-gradient` (and `-webkit-mask`) for a radial gradient mask, creating a fading effect towards the edges of the grid.
*   **Shadows**:
    *   `form-home`: `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`.
*   **Animations**:
    *   `animate-title`: `animation: fadeInUp 0.6s ease-out;` (defined in `header.css` but used here).
        *   `@keyframes fadeInUp`: Fades in from `opacity: 0` and `transform: translateY(20px)` to `opacity: 1` and `transform: translateY(0)`.
*   **Layout**:
    *   `main-content`: Sets `max-width` and `margin: 0 auto` for centering.
    *   `hero-section`: Uses `width: 100vw`, `left: 50%`, `margin-left: -50vw` to span the full viewport width.
    *   `form-home`: Uses `padding` and `border-radius`.
    *   `grid`: Implements a grid layout (e.g., 3 columns).
*   **Responsive Adjustments (`@media (max-width: 768px)`)**:
    *   Adjusts `padding` for `main-content` and `hero-section`.
    *   Reduces `font-size` for `hero-section h2` and `.lead`.
    *   Adjusts form margins and grid gap.

## JavaScript Logic (Inline and Placeholder)

*   **Header Scroll Effect (Inline Script in `<head>`):**
    *   An event listener is attached to the window for scroll events.
    *   It dynamically adds or removes a `scrolled` class to the `site-header` based on the scroll position. This creates a visual effect (e.g., header shrinking or changing background) after scrolling past a certain point.
*   **Dynamic Content Loading (via JavaScript Imports):**
    *   Placeholders with specific IDs (e.g., `header-placeholder`, `footer-placeholder`) indicate that these components are dynamically loaded by external JavaScript files (e.g., in a main entry point script).
*   **Form Logic (via JavaScript Imports):**
    *   Select elements are initially disabled, with options populated and enabled via JavaScript, suggesting a cascading dropdown functionality.
    *   The submission button is also initially disabled, implying it becomes enabled only after valid selections are made in the dropdowns.
    *   A paragraph with `id="typewriter-subtitle"` suggests a JavaScript effect will dynamically populate its text (e.g., a typewriter animation).
    *   A `statusMessage` div is present as a placeholder for dynamic messages, likely updated by JavaScript based on form interactions or data fetching. 