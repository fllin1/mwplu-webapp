# Sales Policy Page Analysis

This document details the structure, styling, and client-side logic of the Sales Policy page.

## HTML Structure

The Sales Policy page is a standard HTML5 document structured as follows:

*   `<!DOCTYPE html>`
*   `<html lang="fr">`
*   `<head>`:
    *   Standard meta tags (`charset`, `viewport`).
    *   `<title>` for the page.
    *   A `<link rel="stylesheet" href="../css/main.css" />` to the main CSS file.
*   `<body>`:
    *   `<main class="policy-container">`: The main content wrapper for the sales policy text.
        *   `<h1>POLITIQUES DE VENTES</h1>`: Main heading for the page.
        *   `<div class="last-update">`: Displays the last update date.
        *   Multiple `<div class="article">`: Each article section contains:
            *   `<h2>`: Subheading for the article.
            *   `<p>`: Paragraphs for text content.
            *   `<ul>` and `<li>`: Unordered lists for enumerating details (e.g., refund conditions).
            *   Specific elements like `<strong>` for emphasized text and `<em>` for italicized text.
            *   `<a>` tags for internal links (e.g., to Terms of Use).
    *   `<!-- Footer will be loaded here -->`: Comment indicating the footer's dynamic loading.
    *   `<div id="footer-placeholder"></div>`: Placeholder for the footer component, dynamically loaded by JavaScript.

## Styling Elements (CSS Classes)

The following CSS classes are used, suggesting specific styling roles:

*   `policy-container`: The main container for the policy content, likely providing padding, max-width, and centering.
*   `last-update`: Styles the text indicating the last update date.
*   `article`: Styles individual sections of the sales policy, potentially adding spacing or borders.

## Color Palette

Colors are primarily inherited from the main CSS file (`main.css`). Default text colors (likely shades of black/gray) and link colors are expected.

## CSS Effects and Transitions

No explicit CSS effects or transitions are defined within this HTML file itself. Visual effects are expected to be derived from the linked `main.css` file and common browser behaviors.

## Links Logic

*   **External Links**: Primarily `mailto:contact@mwplu.com` for email, allowing direct email communication.
*   **Internal Links**: Links to other policy pages, specifically `/policies/terms` for "Conditions d'utilisation".

## JavaScript Logic

*   **Dynamic Content Loading**: The presence of `<div id="footer-placeholder"></div>` indicates that the footer component is dynamically loaded by JavaScript, similar to other pages in the application. There is no inline JavaScript specific to the sales policy content itself.

## Full Text Content

```text
POLITIQUES DE VENTES
Dernière mise à jour : 16 mai 2024

Applicabilité
Ces politiques de ventes s'appliquent à tous les services payants, produits ou abonnements proposés par MWPLU (ci-après dénommé "le Service"). En utilisant ou en achetant nos services payants, vous acceptez d'être lié par ces politiques. Si vous n'êtes pas d'accord avec ces termes, veuillez ne pas utiliser ou acheter nos services payants.

Description des Services/Produits
MWPLU propose [Décrivez ici en détail les services, produits ou abonnements que vous vendez. Soyez précis sur ce qui est inclus, les fonctionnalités, les limites, les différents niveaux d'abonnement s'il y en a, etc.].
Exemple :
"Accès premium à des synthèses de PLU détaillées, incluant des analyses approfondies et des données historiques. Nos plans d'abonnement sont mensuels ou annuels, avec les caractéristiques suivantes..."
Les détails spécifiques de chaque service ou plan d'abonnement, y compris les prix, sont décrits sur les pages de service correspondantes de notre site.

Commandes et Paiement
Pour souscrire à un service payant, vous devez suivre le processus de commande indiqué sur notre site. Vous acceptez de fournir des informations de paiement actuelles, complètes et exactes.
Les paiements sont traités via notre partenaire de paiement sécurisé [Nom du processeur de paiement, ex: Stripe, PayPal]. Nous ne stockons pas les informations complètes de votre carte de crédit.
Les prix sont indiqués en [Devise, ex: EUR] et sont [TTC (toutes taxes comprises) / HT (hors taxes) - précisez la gestion de la TVA si applicable]. Les abonnements sont renouvelés automatiquement sauf annulation de votre part avant la date de renouvellement.

Livraison / Accès au Service
L'accès aux services payants est généralement accordé immédiatement après la confirmation du paiement. Vous recevrez un e-mail de confirmation avec les détails nécessaires pour accéder au service.
En cas de problème technique empêchant l'accès, veuillez contacter notre support à contact@mwplu.com.

Politique de Remboursement et d'Annulation
Annulation : Vous pouvez annuler votre abonnement à tout moment depuis la section "Mon Profil" de votre compte ou en nous contactant. L'annulation prendra effet à la fin de la période de facturation en cours. Vous continuerez à avoir accès au service jusqu'à cette date.
Remboursement : [Définissez clairement votre politique de remboursement. Exemples :
"En général, nous n'offrons pas de remboursement pour les périodes d'abonnement déjà entamées ou payées, sauf si la loi l'exige ou dans des circonstances exceptionnelles à notre seule discrétion."
"Vous pouvez demander un remboursement dans les X jours suivant votre achat initial si vous n'êtes pas satisfait du service, sous réserve de [conditions spécifiques]."
Pour toute demande de remboursement, veuillez contacter contact@mwplu.com avec les détails de votre commande.

Utilisation du Service et Propriété Intellectuelle
L'accès aux services payants vous accorde une licence limitée, non exclusive, non transférable et révocable pour utiliser le Service conformément à nos Conditions d'utilisation.
Tout le contenu fourni dans le cadre du Service, y compris les textes, graphiques, logos, et les synthèses de PLU elles-mêmes, est la propriété de MWPLU ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle.

Limitation de Responsabilité
Notre responsabilité concernant les services payants est régie par nos Conditions d'utilisation. Nous nous efforçons de fournir un service fiable et précis, mais ne pouvons garantir l'absence d'erreurs ou d'interruptions.

Modification des Politiques et des Prix
Nous nous réservons le droit de modifier ces politiques de ventes et les prix de nos services à tout moment. Les modifications des politiques prendront effet dès leur publication sur notre site. Les modifications de prix pour les abonnements existants vous seront notifiées au préalable (par exemple, 30 jours avant leur application) et s'appliqueront lors du prochain cycle de renouvellement.

Contact
Pour toute question concernant ces politiques de ventes ou nos services, veuillez nous contacter :
- Email : contact@mwplu.com
- Téléphone : 06 01 84 27 20
- Adresse : MEWE PARTNERS SAS, 40 Rue Mallifaud, 38100 Grenoble
```
