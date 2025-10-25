# Cookies Policy Page Analysis

This document details the structure, styling, and client-side logic of the Cookies Policy page.

## HTML Structure

The Cookies Policy page is a standard HTML5 document structured as follows:

*   `<!DOCTYPE html>`
*   `<html lang="fr">`
*   `<head>`:
    *   Standard meta tags (`charset`, `viewport`).
    *   `<title>` for the page.
    *   A `<link rel="stylesheet" href="../css/main.css" />` to the main CSS file.
*   `<body>`:
    *   `<main class="policy-container">`: The main content wrapper for the policy text.
        *   `<h1>POLITIQUE DES COOKIES</h1>`: Main heading for the page.
        *   `<div class="last-update">`: Displays the last update date.
        *   Multiple `<div class="article">`: Each article section contains:
            *   `<h2>`: Subheading for the article.
            *   `<p>`: Paragraphs for text content.
            *   `<ul>` and `<li>`: Unordered lists for enumerating points (e.g., types of cookies, browser instructions).
            *   Specific containers like `<div class="highlight">` and `<div class="warning">` for emphasized content.
            *   `<div class="contact-info">` for contact details, which includes `<h3>`, `<p>`, and an `<a>` tag for email.
    *   `<!-- Footer will be loaded here -->`: Comment indicating the footer's dynamic loading.
    *   `<div id="footer-placeholder"></div>`: Placeholder for the footer component, dynamically loaded by JavaScript.

## Styling Elements (CSS Classes)

The following CSS classes are used, suggesting specific styling roles:

*   `policy-container`: The main container for the policy content, likely providing padding, max-width, and centering.
*   `last-update`: Styles the text indicating the last update date.
*   `article`: Styles individual sections of the policy, potentially adding spacing or borders.
*   `highlight`: Styles a highlighted block of text, drawing attention.
*   `warning`: Styles a warning block, typically with distinct background/border colors to indicate caution.
*   `contact-info`: Styles the contact details section.

## Color Palette

Colors are primarily inherited from the main CSS file (`main.css`). Specific colors evident from the context of `highlight` and `warning` classes (though their explicit definitions aren't in this HTML, they imply visual distinction from default text) and link styling.

*   Default text colors (likely shades of black/gray).
*   Link colors (default blue, possibly changing on hover).
*   `highlight` and `warning` classes suggest use of specific background/text colors to convey emphasis or caution (e.g., yellow/orange for warning, light blue/gray for highlight).

## CSS Effects and Transitions

No explicit CSS effects or transitions are defined within this HTML file itself. Visual effects are expected to be derived from the linked `main.css` file and common browser behaviors.

## Links Logic

*   **External Links**: Primarily `mailto:contact@mwplu.com` for email, allowing direct email communication.
*   **Internal Links**: No explicit internal navigation links within the main policy content, other than the overall site structure (header/footer).

## JavaScript Logic

*   **Dynamic Content Loading**: The presence of `<div id="footer-placeholder"></div>` indicates that the footer component is dynamically loaded by JavaScript, similar to other pages in the application. There is no inline JavaScript specific to the policy content itself.

## Full Text Content

```text
POLITIQUE DES COOKIES
Dernière mise à jour : 13 mai 2025

1. Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web. Les cookies permettent au site de reconnaître votre appareil et de mémoriser certaines informations sur vos préférences ou actions passées, ce qui améliore votre expérience de navigation et permet l'analyse de l'utilisation du site.

2. Types de cookies utilisés par MWPLU
MWPLU utilise les types de cookies suivants :

Cookies strictement nécessaires : Ces cookies sont indispensables au bon fonctionnement de notre site web. Ils permettent des fonctionnalités de base comme l'authentification des utilisateurs, la gestion de la sécurité et la navigation essentielle sur le site. Leur désactivation pourrait rendre certaines parties du site inutilisables. La base légale de leur utilisation est l'intérêt légitime de MWPLU à assurer le fonctionnement technique du site.
Cookies de performance et d'analyse : Ces cookies collectent des informations anonymes sur la manière dont les visiteurs utilisent notre site (par exemple, les pages les plus visitées, les temps de chargement, les erreurs rencontrées). Ces données nous aident à comprendre le comportement des utilisateurs et à améliorer la performance et l'ergonomie de notre site web. L'utilisation de ces cookies est soumise à votre consentement préalable.
Cookies fonctionnels : Ces cookies mémorisent vos choix et préférences (comme la langue ou les paramètres d'affichage) pour vous offrir une expérience utilisateur plus personnalisée et plus fluide lors de vos visites ultérieures. L'utilisation de ces cookies est soumise à votre consentement préalable.
Cookies de sécurité : Ces cookies sont spécifiquement utilisés pour renforcer la sécurité de notre site, notamment pour protéger contre les abus automatisés et les tentatives de spam (par exemple, via des systèmes de CAPTCHA). La base légale de leur utilisation est l'intérêt légitime de MWPLU à assurer la sécurité de son service et la protection de ses utilisateurs.
3. Cookies tiers
Nous utilisons des services tiers qui peuvent déposer leurs propres cookies sur votre appareil. L'utilisation de ces cookies est soumise à votre consentement, sauf pour ceux strictement nécessaires au service.

Supabase : Utilisé pour la gestion de l'authentification des utilisateurs (connexion, inscription), le stockage des données et les fonctions de base de notre base de données. Supabase peut déposer des cookies essentiels pour maintenir votre session active et sécurisée.
Cloudflare Turnstile : Un service de Cloudflare que nous utilisons pour distinguer les humains des bots et protéger notre site contre les activités automatisées malveillantes (anti-spam et sécurité). Il peut déposer des cookies de sécurité à cette fin.
Google Analytics (GA4) :
Qu'est-ce que Google Analytics ? Google Analytics est un service d'analyse web fourni par Google qui nous permet de mesurer et d'analyser le trafic et le comportement des utilisateurs sur notre site. Il nous aide à comprendre comment les visiteurs interagissent avec notre site, quelles pages sont populaires, d'où viennent nos utilisateurs, etc.
Comment MWPLU utilise Google Analytics (GA4) : Nous avons configuré une propriété GA4 pour collecter des données sur :
Les vues de pages (pages visitées).
Le suivi de l'ID utilisateur (un identifiant unique et pseudonymisé/haché attribué à chaque utilisateur, qui ne permet pas votre identification directe) pour avoir une vue consolidée de votre parcours sur notre site, même si vous changez d'appareil.
Des dimensions personnalisées pour catégoriser les types d'utilisateurs.
Événements spécifiques tracés : Nous suivons des événements personnalisés pour mieux comprendre les interactions sur notre plateforme. Cela inclut :
Événements d'authentification : login (connexion réussie), signup (inscription), logout (déconnexion).
Événements d'interaction avec le PLU : plu_view (consultation d'une synthèse de PLU), plu_download (téléchargement d'un document), plu_comment (ajout d'un commentaire), plu_rate (notation d'un document).
Événements de parcours utilisateur : city_selected (sélection d'une ville), zone_selected (sélection complète d'une zone), search_performed (si une recherche est effectuée).
Événements de conversion : contact_form_submitted (soumission d'un formulaire de contact), ainsi que payment_initiated et subscription_completed pour nos futures fonctionnalités de paiement et d'abonnement.
Confidentialité et conformité avec Google Analytics : Afin de respecter votre vie privée et d'assurer la conformité au RGPD, nous avons implémenté les mesures suivantes pour Google Analytics :
Anonymisation des adresses IP : Votre adresse IP est systématiquement anonymisée (tronquée) avant d'être stockée par Google, de sorte qu'elle ne peut plus être utilisée pour vous identifier.
Nous ne partageons pas les données brutes de Google Analytics avec d'autres services Google à des fins publicitaires.
Les données collectées via Google Analytics ne sont utilisées que pour l'analyse du comportement des utilisateurs sur notre site et l'amélioration de nos services.
4. Votre Consentement et Gestion des cookies (Le Bandeau Cookie)

Dès votre première visite sur notre site, un bandeau de consentement aux cookies apparaît. Ce bandeau vous informe de l'utilisation des cookies et vous offre les options suivantes :

Accepter tout : En cliquant sur ce bouton, vous consentez au dépôt de tous les cookies (nécessaires, de performance, fonctionnels, de sécurité et d'analyse).
Refuser tout : En cliquant sur ce bouton, vous refusez le dépôt de tous les cookies non-essentiels. Seuls les cookies strictement nécessaires au fonctionnement du site seront conservés.
Gérer mes préférences / Personnaliser : Ce lien vous permet d'accéder à un panneau de contrôle où vous pouvez donner ou retirer votre consentement pour chaque catégorie de cookies (performance, fonctionnels, analyse) de manière granulaire.
Votre choix est enregistré et vous pouvez le modifier à tout moment en cliquant sur le lien "Gestion des Cookies" (ou un lien similaire) généralement situé dans le pied de page de notre site.

5. Conséquences de la désactivation
Attention : La désactivation de certains cookies peut affecter le fonctionnement du site. En particulier :

Les cookies strictement nécessaires étant essentiels, leur blocage total via les paramètres de votre navigateur peut empêcher la connexion ou le maintien de votre session.
La perte des préférences et paramètres personnalisés.
Des fonctionnalités réduites ou indisponibles (par exemple, si vous bloquez les cookies fonctionnels).
Le blocage des cookies d'analyse (Google Analytics) n'affectera pas le fonctionnement du site mais nous privera d'informations précieuses pour l'améliorer.
6. Durée de conservation
Les cookies sont conservés pour les durées suivantes :

Cookies de session : Supprimés automatiquement à la fermeture de votre navigateur.
Cookies persistants : Restent sur votre appareil pour une durée définie, généralement entre 30 jours et 2 ans selon leur fonction (par exemple, les cookies de préférences ou d'analyse).
Cookies d'authentification : Conservés jusqu'à votre déconnexion manuelle.
7. Vos Droits
Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits concernant vos données personnelles, y compris celles collectées via les cookies : droit d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition au traitement et de portabilité des données. Pour exercer ces droits, veuillez-vous référer à notre Politique de Confidentialité pour les détails complets et la procédure à suivre.

8. Le Responsable de Traitement
Le responsable du traitement de vos données personnelles collectées via ce site web, y compris les données des cookies, est :
MEWE PARTNERS SAS

9. Contact
Pour toute question concernant notre politique des cookies, vous pouvez nous contacter à l'adresse suivante :
Email : contact@mwplu.com
Adresse : 40 Rue Mallifaud, 38100 Grenoble, France
```
