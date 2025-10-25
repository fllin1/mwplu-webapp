# Header Component Analysis

This document details the structure, styling, and logic of the header component.

## HTML Structure

The header is injected into a container element with a specified ID (e.g., `<div id="header-placeholder">`). The core HTML is as follows:

*   `<header class="site-header">`: The main header container.
    *   `<div class="container">`: A general container, likely for layout and centering.
        *   `<div class="flex-between">`: This class suggests a flexible container with space-between alignment, used to separate the logo and navigation.
            *   `<a href="/" class="header-logo">`: Logo link.
                *   `<img src="https://mwplu.com/assets/icons/logo/MWPLU.svg" alt="MWPLU Logo" />`: The website logo, using an absolute URL.
            *   `<nav class="main-nav auth-section">`: Main navigation, also serving as the authentication section.
                *   `<a href="/" class="auth-btn margin-right-sm">Accueil</a>`: Home link.
                *   Dynamically injected authentication links:
                    *   **If logged in**:
                        *   A link to the user profile.
                        *   A logout link with a specific ID (e.g., `logoutLinkHeader`).
                    *   **If not logged in**:
                        *   A link to the login page.
                        *   A link to the signup page.

## Styling Elements (CSS Classes)

The following CSS classes are used in the header component, suggesting specific styling rules:

*   `site-header`: The main header container.
*   `container`: A common class for defining content width and centering.
*   `flex-between`: A utility class for distributing space between flexible items, typically used for aligning elements at opposite ends.
*   `header-logo`: Styles the logo link.
*   `main-nav`: Styles the main navigation container.
*   `auth-section`: Styles the authentication links section specifically.
*   `auth-btn`: Styles authentication-related buttons or links.
*   `margin-right-sm`: A utility class for adding a small right margin.
*   `sticky`: Applied to the header when it becomes sticky.
*   `scrolled`: Applied to the header when the page is scrolled, causing visual changes.

## Color Palette

The header primarily uses the following colors and transparencies:

*   `rgba(255, 255, 255, 0.95)` / `rgba(255, 255, 255, 0.8)` / `rgba(255, 255, 255, 0.9)`: Various opacities of white for background, creating a semi-transparent effect.
*   `rgba(0, 0, 0, 0.1)` / `rgba(0, 0, 0, 0.08)` / `rgba(0, 0, 0, 0.15)`: Various opacities of black for borders and box shadows.
*   `var(--primary-black)`: Used for text color (e.g., brand, auth buttons).
*   `var(--border-gray, #eaeaea)`: Used for the bottom border when scrolled.

## CSS Effects and Transitions

The header incorporates the following visual effects and transitions:

*   **Transitions**:
    *   `site-header`: `all 0.3s ease` for background, backdrop-filter, border, and padding changes.
    *   `header-logo`: `all 0.3s ease`.
    *   `header-logo img`: `all 0.3s ease`.
    *   `brand`: `opacity 0.2s ease`.
    *   `auth-btn`: `all 0.2s ease`.
*   **Background and Filters**:
    *   `background-color: rgba(255, 255, 255, 0.95)` (default) / `rgba(255, 255, 255, 0.8)` (sticky) / `rgba(255, 255, 255, 0.9)` (scrolled).
    *   `backdrop-filter: blur(10px)` (default) / `blur(6px)` (sticky), with `-webkit-backdrop-filter` for compatibility.
*   **Sticky Header Effects (`.site-header.sticky`)**:
    *   `position: sticky`, `top: 0`, `z-index: 1000`.
    *   Changes `background-color` and `backdrop-filter`.
*   **Scrolled Header Effects (`.site-header.scrolled`)**:
    *   Changes `background-color` and `border-bottom`.
    *   Adds `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)`.
    *   Adjusts `header-logo img` height to `38px`.
*   **Hover Effects**:
    *   `header-logo:hover img`: `opacity: 0.7` and `transform: scale(1.05)`.
    *   `brand:hover`: `opacity: 0.8`.
    *   `auth-btn:hover`: `background: rgba(0, 0, 0, 0.05)`, `box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1)`, `transform: translateY(-1px)`.
*   **Active Effects**:
    *   `auth-btn:active`: `transform: translateY(0)` (resets translation on click).
*   **Shadows**:
    *   `site-header.scrolled`: `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)`.
    *   `auth-btn:hover`: `box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1)`.
*   **Layout**:
    *   `header-content`: `display: flex` with `justify-content: space-between` and `align-items: center`.
    *   `auth-section`: `display: flex` with `align-items: center` and `gap`.
    *   `header-nav`: `display: flex` with `align-items: center` and `gap`.
*   **Responsive Adjustments (`@media`)**:
    *   Changes `padding` of `site-header`.
    *   `header-content` uses `flex-wrap: wrap` and increased `gap`.
    *   `auth-section` reduces `gap`.
    *   `auth-btn` font size and padding adjusted.
    *   `header-logo img` height reduced.
    *   For smaller screens (`max-width: 480px`), `auth-section` adjusts `width` and `justify-content`, and `auth-btn` becomes flexible with `flex: 1`.

## Links Logic

*   **Internal Navigation**: All navigation links use relative paths (e.g., `/`, `/user/profile`). This implies client-side routing or server-side rendering.
*   **Logout Link**: The logout link is handled via JavaScript to perform a logout action.
*   **Logo Link**: The logo links to the root (`/`).

## JavaScript Logic (for header initialization)

An `initializeHeader` function is responsible for dynamically creating and injecting the header HTML into the DOM, based on the user's authentication status.

*   It takes a container ID as an argument.
*   It determines which set of authentication links to display based on a synchronous login status check.
*   It then sets the `innerHTML` of the header container with the complete header HTML.
*   If the user is logged in, it attaches a `click` event listener to the logout link, which prevents default navigation and calls a `logout()` function that handles the actual logout process and page redirection/reload. 