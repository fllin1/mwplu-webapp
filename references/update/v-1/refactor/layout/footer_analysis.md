# Footer Component Analysis

This document details the structure, styling, and logic of the footer component.

## HTML Structure

The footer is encapsulated within a `<footer class="site-footer">` element. It is divided into two main sections:

1.  `<div class="container">`: This appears to be a general container for layout purposes, ensuring content is centered and has appropriate max-width.
    *   `<div class="footer-content">`: This section contains three main content columns, each with a `footer-section` class.
        *   **Contact Section**:
            *   `<h3 class="footer-title">Contact</h3>`
            *   `<div class="contact-info">`
                *   `<div class="contact-item">` for email (`mailto:`)
                *   `<div class="contact-item">` for phone (`tel:`)
                *   `<div class="contact-item">` for address (`https://maps.google.com?q=...`, `target="_blank"`)
        *   **Quick Links Section**:
            *   `<h3 class="footer-title">Liens rapides</h3>`
            *   `<div class="footer-links">`
                *   `<div class="footer-links-column">` (first column)
                    *   Links: `Accueil` (`/`), `À propos` (`/info/about`), `Nous soutenir` (`/info/donation`)
                *   `<div class="footer-links-column">` (second column)
                    *   Links: `Documentation` (`/docs/documentation`), `Contact` (`/info/contact`), `Mon compte` (`/user/profile`)
        *   **Follow Us Section**:
            *   `<h3 class="footer-title">Suivez-nous</h3>`
            *   `<div class="social-links">`
                *   Multiple `<a>` tags with a class for social links and `aria-label` for accessibility.
                *   Each social link contains a `<span>` which in turn contains an `<img>` tag.
                *   Social Icons: Twitter (`twitter-x.svg`), Facebook (`facebook.svg`), LinkedIn (`linkedin.svg`), Youtube (`youtube.svg`). All image sources are absolute URLs starting with `https://mwplu.com/assets/icons/social/`.
    *   `<div class="footer-bottom">`: This section contains legal links and copyright information.
        *   `<div class="footer-legal">`
            *   Links: `Mentions légales` (`/policies/legal-notice`), `CGU` (`/policies/terms`), `Confidentialité` (`/policies/privacy`), `Cookies` (`/policies/cookies`)
        *   `<div class="footer-copyright">`
            *   `<p>&copy; 2025 MWPLU. Tous droits réservés.</p>`

## Styling Elements (CSS Classes)

The following CSS classes are used in the footer component, suggesting specific styling rules:

*   `site-footer`: The main container for the footer.
*   `container`: A common class for defining content width and centering.
*   `footer-content`: Organizes the main sections of the footer, likely using flexible layout (e.g., flexbox or grid).
*   `footer-section`: Styles individual content blocks within the footer.
*   `footer-title`: Styles the headings within the footer sections.
*   `contact-info`: Styles the container for contact details.
*   `contact-item`: Styles individual contact entries.
*   `footer-links`: Styles the container for quick navigation links.
*   `footer-links-column`: Styles columns within the quick links section, for multi-column layouts.
*   `footer-link`: Styles individual navigation links.
*   `social-links`: Styles the container for social media icons.
*   `social-link`: Styles individual social media links.
*   `social-icon`: Styles the wrapper for social media images, possibly for icon sizing or alignment.
*   `footer-bottom`: Styles the bottom section of the footer, containing legal and copyright information.
*   `footer-legal`: Styles the container for legal links.
*   `legal-link`: Styles individual legal navigation links.
*   `footer-copyright`: Styles the copyright text block.

## Color Palette

The footer primarily uses the following colors defined as CSS variables:

*   `--accent-gray`: Used for the footer's background.
*   `--primary-black`: Used for footer titles and hover states of links.
*   `--medium-gray`: Used for general text and unhovered link colors.
*   `--background-white`: Used for social link backgrounds.
*   `--border-gray`: Used for the top border in the `footer-bottom` section.
*   Specific color `#0066cc` is used for `contact-item a:hover`.

## CSS Effects and Transitions

The footer incorporates the following visual effects:

*   **Transitions**:
    *   `contact-item a`: `color 0.3s ease`
    *   `footer-link`: `color 0.2s ease`
    *   `social-link`: `all 0.2s ease`
    *   `legal-link`: `color 0.2s ease`
*   **Hover Effects**:
    *   `contact-item a:hover`: Changes color to `#0066cc` and adds `text-decoration: underline`.
    *   `footer-link:hover`: Changes color to `--primary-black`.
    *   `social-link:hover`: Applies a `transform: translateY(-2px)` for a subtle lift and `box-shadow` for depth (`0 4px 8px rgba(0, 0, 0, 0.15)`).
    *   `legal-link:hover`: Changes color to `--primary-black`.
*   **Shadows**:
    *   `social-link`: `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)` (default) and `0 4px 8px rgba(0, 0, 0, 0.15)` (on hover).
*   **Layout**:
    *   `footer-content`: Uses `display: grid` with `grid-template-columns: 1fr 1fr 1fr` for a 3-column layout on larger screens.
    *   `footer-links`: Uses `display: grid` with `grid-template-columns: 1fr 1fr` for a 2-column layout.
    *   `footer-bottom`: Uses `display: flex` with `justify-content: space-between` and `align-items: center`.
*   **Responsive Adjustments (`@media (max-width: 768px)`)**:
    *   `footer-content`: Switches to a single column layout (`grid-template-columns: 1fr`).
    *   `footer-links`: Switches to a single column layout (`grid-template-columns: 1fr`) and removes `max-width`.
    *   `footer-bottom`: Changes to `flex-direction: column` and `text-align: center`.
    *   `footer-legal`: Centers content with `justify-content: center`.

## Links Logic

*   **Internal Links**: Most links within the footer use relative paths (e.g., `/`, `/info/about`). This indicates client-side routing or server-side rendering with simple path-based navigation.
*   **External Links**:
    *   `mailto:` for email.
    *   `tel:` for phone numbers.
    *   `https://maps.google.com?q=...` for the address, with `target="_blank"` to open in a new tab.
*   **Social Links**: All social links `href` attributes are currently set to `#`, indicating placeholder values that would need to be replaced with actual social media profile URLs. The `src` attributes for the social icons are absolute URLs: `https://mwplu.com/assets/icons/social/...`.

## JavaScript Logic (for footer loading)

A `loadFooter` function is responsible for injecting the footer HTML into the DOM.

*   It first tries to find an element with a specific ID (e.g., `footer-placeholder`).
*   If found, it populates that element with the generated footer HTML.
*   If no such placeholder is found, it appends the footer HTML to the document body.
*   The function is designed to be loaded automatically when the DOM is ready, either via a `DOMContentLoaded` listener or by direct invocation if the DOM is already complete.
