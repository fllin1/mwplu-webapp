# Legal Notice Page Analysis

This document details the structure, styling, and client-side logic of the Legal Notice page.

## HTML Structure

The Legal Notice page is a standard HTML5 document structured as follows:

*   `<!DOCTYPE html>`
*   `<html lang="fr">`
*   `<head>`:
    *   Standard meta tags (`charset`, `viewport`).
    *   `<title>` for the page.
*   `<body>`:
    *   `<main class="policy-container">`: The main content wrapper for the legal notice text.
        *   `<h1>MENTIONS LÉGALES</h1>`: Main heading for the page.
        *   `<div class="last-update">`: Displays the last update date.
        *   Multiple `<div class="article">`: Each article section contains:
            *   `<h2>`: Subheading for the article.
            *   `<p>`: Paragraphs for text content.
            *   `<ul>` and `<li>`: Unordered lists for enumerating details (e.g., company information, hosting details).
            *   Specific elements like `<strong>` for emphasized text.
    *   `<!-- Footer will be loaded here -->`: Comment indicating the footer's dynamic loading.
    *   `<div id="footer-placeholder"></div>`: Placeholder for the footer component, dynamically loaded by JavaScript.

## Styling Elements (CSS Classes)

The following CSS classes are used, suggesting specific styling roles:

*   `policy-container`: The main container for the policy content, likely providing padding, max-width, and centering.
*   `last-update`: Styles the text indicating the last update date.
*   `article`: Styles individual sections of the legal notice, potentially adding spacing or borders.

## Color Palette

Colors are primarily inherited from the main CSS file (`main.css`). Default text colors (likely shades of black/gray) and link colors are expected.

## CSS Effects and Transitions

No explicit CSS effects or transitions are defined within this HTML file itself. Visual effects are expected to be derived from the linked `main.css` file and common browser behaviors.

## Links Logic

*   **External Links**: Primarily `mailto:contact@mwplu.com` for email, allowing direct email communication.
*   **Internal Links**: No explicit internal navigation links within the main legal notice content, other than the overall site structure (header/footer).

## JavaScript Logic

*   **Dynamic Content Loading**: The presence of `<div id="footer-placeholder"></div>` indicates that the footer component is dynamically loaded by JavaScript, similar to other pages in the application. There is no inline JavaScript specific to the legal notice content itself.

## Full Text Content

```text
MENTIONS LÉGALES
Dernière mise à jour : 13 mai 2025

1. Éditeur du site
Le site MWPLU.COM est édité par MEWE PARTNERS SAS, société par actions simplifiée (SAS) au capital social de 1 000 euros, immatriculée au Registre du Commerce et des Sociétés de Grenoble sous le numéro 941 341 703 RCS Grenoble.

Raison sociale : MEWE PARTNERS SAS
Siège social : 40 Rue Mallifaud, 38100 Grenoble, France
Email : contact@mwplu.com
Téléphone : 06 01 84 27 20
2. Directeur de la publication
Les directeurs de la publication du site sont Zakaria TOUATI et Rim ENNACIRI, en leur qualité de représentants légaux de MEWE PARTNERS SAS.

3. Hébergement
Le site MWPLU.COM est hébergé par :

Hébergeur : Google LLC (via Firebase, Google Cloud Platform)
Adresse : 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis
4. Propriété intellectuelle
L'ensemble des contenus présents sur le site MWPLU.COM, incluant de manière non exhaustive les textes, images, photographies, graphismes, logos, icônes, sons, logiciels, ainsi que leur mise en forme, sont la propriété exclusive de MEWE PARTNERS SAS, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.

Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est formellement interdite, sauf autorisation écrite préalable de MEWE PARTNERS SAS.

Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.

5. Données personnelles
MEWE PARTNERS SAS s'engage à respecter la confidentialité des données personnelles collectées via le site MWPLU.COM et à les traiter conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, modifiée.

Les informations recueillies sur ce site sont enregistrées dans un fichier informatisé par MEWE PARTNERS SAS pour les finalités suivantes : gestion des comptes utilisateurs, amélioration de nos services, communication ciblée (sous réserve de consentement), et statistiques d'utilisation du site.

Pour toute information concernant le traitement de vos données personnelles et pour l'exercice de vos droits (accès, rectification, effacement, opposition, limitation, portabilité), nous vous invitons à consulter notre Politique de Confidentialité détaillée.

6. Responsabilité
Les informations contenues sur le site MWPLU.COM sont aussi précises que possible et le site est régulièrement mis à jour. Cependant, il peut contenir des inexactitudes, des omissions ou des lacunes. MEWE PARTNERS SAS ne saurait être tenu responsable des erreurs, omissions, ou des résultats qui pourraient être obtenus par l'usage de ces informations.

Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler par email à l'adresse contact@mwplu.com, en décrivant le problème de la manière la plus précise possible (page posant problème, type d'ordinateur et de navigateur utilisé, etc.).

MEWE PARTNERS SAS ne peut être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site MWPLU.COM, et résultant soit de l'apparition d'un bug, soit d'une incompatibilité.
```
