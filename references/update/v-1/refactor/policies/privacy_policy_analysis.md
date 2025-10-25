# Privacy Policy Page Analysis

This document details the structure, styling, and client-side logic of the Privacy Policy page.

## HTML Structure

The Privacy Policy page is a standard HTML5 document structured as follows:

*   `<!DOCTYPE html>`
*   `<html lang="fr">`
*   `<head>`:
    *   Standard meta tags (`charset`, `viewport`).
    *   `<title>` for the page.
    *   A `<link rel="stylesheet" href="../css/main.css" />` to the main CSS file.
*   `<body>`:
    *   `<main class="policy-container">`: The main content wrapper for the privacy policy text.
        *   `<h1>POLITIQUE DE CONFIDENTIALITÉ</h1>`: Main heading for the page.
        *   `<div class="last-update">`: Displays the last update date.
        *   An introductory `<p>` tag.
        *   Multiple `<div class="article">`: Each article section contains:
            *   `<h2>`: Subheading for the article.
            *   `<p>`: Paragraphs for text content.
            *   `<ul>` and `<li>`: Unordered lists for enumerating details (e.g., collected data, purposes, user rights).
            *   Specific elements like `<strong>` for emphasized text and `<a>` for links (e.g., email, CNIL website).
    *   `<!-- Footer will be loaded here -->`: Comment indicating the footer's dynamic loading.
    *   `<div id="footer-placeholder"></div>`: Placeholder for the footer component, dynamically loaded by JavaScript.

## Styling Elements (CSS Classes)

The following CSS classes are used, suggesting specific styling roles:

*   `policy-container`: The main container for the policy content, likely providing padding, max-width, and centering.
*   `last-update`: Styles the text indicating the last update date.
*   `article`: Styles individual sections of the privacy policy, potentially adding spacing or borders.

## Color Palette

Colors are primarily inherited from the main CSS file (`main.css`). Default text colors (likely shades of black/gray) and link colors are expected.

## CSS Effects and Transitions

No explicit CSS effects or transitions are defined within this HTML file itself. Visual effects are expected to be derived from the linked `main.css` file and common browser behaviors.

## Links Logic

*   **External Links**: `mailto:contact@mwplu.com` for email and `http://www.cnil.fr` for the CNIL website.
*   **Internal Links**: No explicit internal navigation links within the main privacy policy content, other than the overall site structure (header/footer).

## JavaScript Logic

*   **Dynamic Content Loading**: The presence of `<div id="footer-placeholder"></div>` indicates that the footer component is dynamically loaded by JavaScript, similar to other pages in the application. There is no inline JavaScript specific to the privacy policy content itself.

## Full Text Content

```text
POLITIQUE DE CONFIDENTIALITÉ
Dernière mise à jour : 23 mai 2025 (précédente) / 9 juin 2025 (actuelle)

La présente Politique de Confidentialité décrit comment le site www.mwplu.com, édité par MEWE PARTNERS SAS, collecte, utilise, stocke et protège les données personnelles de ses utilisateurs. Nous nous engageons à respecter votre vie privée et à assurer la sécurité de vos données conformément au Règlement Général sur la Protection des Données (RGPD – UE 2016/679) et à la loi française « Informatique et Libertés » (n° 78-17 du 6 janvier 1978 modifiée).

1. Responsable du traitement
Le responsable du traitement des données personnelles collectées via le site MWPLU.COM est :

MEWE PARTNERS SAS

Siège social : 40 Rue Mallifaud, 38100 Grenoble, France
SIRET : 941 341 703 00010
Email : contact@mwplu.com
2. Données personnelles collectées
Nous nous engageons à ne collecter que les données strictement nécessaires à la fourniture et à l'amélioration de nos services, ainsi qu'à la gestion des dons. Les catégories de données que nous pouvons collecter incluent :

Données d'identité : Nom, prénom.
Données de contact : Adresse e-mail.
Données de connexion et d'utilisation : Adresse IP, logs de connexion, historique de navigation sur le site (pages consultées, fonctionnalités utilisées via cookies et autres traceurs), données d'appareil.
Données de facturation (pour les comptes Premium et les dons) : Informations nécessaires à l'établissement des factures et des reçus fiscaux pour les dons, telles que l'adresse de facturation. Les détails de paiement sensibles (numéros de carte bancaire, etc.) sont traités directement par notre prestataire de services de paiement sécurisé (Stripe) et ne sont ni collectés ni stockés sur nos serveurs.
Données relatives aux dons : Montant du don, date du don, moyen de paiement utilisé (type de carte, mais pas le numéro complet), et informations permettant l'émission d'un reçu fiscal si applicable (nom, prénom, adresse postale).
3. Finalités du traitement
Vos données personnelles sont collectées et traitées pour les finalités suivantes :

Gestion des comptes utilisateurs : Création, gestion et maintenance de votre compte MWPLU.
Fourniture et bon fonctionnement des services : Permettre l'accès aux fonctionnalités du site et assurer leur performance technique.
Gestion des dons : Traitement des transactions de dons, envoi de confirmations de dons, et émission de reçus fiscaux si demandés.
Amélioration de l'expérience utilisateur et du site : Analyse de l'utilisation du site pour optimiser son ergonomie, ses fonctionnalités et ses contenus.
Gestion de la relation client : Fourniture de support technique, envoi de notifications liées au service (mises à jour, informations importantes).
Respect de nos obligations légales et réglementaires : Notamment en matière de facturation, de fiscalité (pour les dons), de sécurité des systèmes d'information, et d'archivage légal.
Production de statistiques d'utilisation : Élaboration de statistiques agrégées et anonymisées sur l'usage du site pour le suivi d'activité et la prise de décision stratégique.
4. Base légale du traitement
Conformément à l'article 6 du RGPD, les traitements de vos données personnelles sont fondés sur les bases légales suivantes :

L'exécution d'un contrat ou de mesures précontractuelles : Pour la création et la gestion de votre compte utilisateur, l'accès aux services, la facturation des comptes Premium et le traitement des dons (réf. nos Conditions Générales d'Utilisation et les conditions de don).
Votre consentement : Pour le dépôt de cookies non-essentiels (mesure d'audience, personnalisation) et l'envoi de communications marketing (ex: newsletters, si vous y êtes inscrit). Vous pouvez retirer votre consentement à tout moment.
L'intérêt légitime de MEWE PARTNERS SAS : Pour la sécurité de nos systèmes, la prévention des fraudes, l'amélioration continue de nos services et la production de statistiques anonymisées. Nous veillons à ce que cet intérêt légitime ne porte pas atteinte à vos droits et libertés fondamentaux.
Le respect d'une obligation légale : Pour la tenue de nos registres comptables et fiscaux (notamment pour les dons et reçus fiscaux), la gestion des archives légales et la réponse aux requêtes des autorités compétentes.
5. Durée de conservation des données
Vos données personnelles sont conservées uniquement le temps nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, augmenté des durées de prescription légales.

Données de compte utilisateur : Conservées tant que votre compte est actif et jusqu'à 5 ans après la dernière activité de votre compte, à des fins de gestion administrative et pour la défense de nos intérêts en cas de litige.
Données de facturation et de don : Conservées pendant une durée de 10 ans à compter de la clôture de l'exercice comptable concerné, conformément à l'obligation légale et fiscale.
Logs de connexion et d'utilisation (non-anonymisées) : Conservés pendant une durée maximale de 3 ans.
Données collectées via cookies (non-anonymisées) : Se référer à notre Politique de Cookies.
6. Cookies et traceurs
Notre site utilise des cookies et autres traceurs pour améliorer votre expérience de navigation et analyser l'utilisation du site. Des informations détaillées sur les types de cookies utilisés, leurs finalités et la manière de les gérer (y compris votre consentement) sont disponibles dans notre Politique de Cookies. Les cookies non-essentiels (mesure d'audience, personnalisation) ne sont déposés qu'après avoir obtenu votre consentement exprès via notre bannière de gestion des cookies.

7. Sécurité des données
Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles robustes pour protéger vos données personnelles contre l'accès non autorisé, l'altération, la divulgation ou la destruction. Ces mesures incluent :

Hébergement sécurisé : Vos données sont hébergées dans l'Union Européenne (UE) sur des serveurs de Google Cloud Platform (Firebase), qui sont certifiés ISO 27001, ISO 27017, ISO 27018, et SOC 1, 2, 3.
Chiffrement : Les données sont chiffrées en transit (via TLS 1.3) et au repos.
Contrôles d'accès : Accès restreint aux données, basé sur le principe du "moindre privilège".
Systèmes de journalisation : Suivi et audit des accès et des opérations sur les données.
Procédures de sécurité : Mises à jour régulières des systèmes, formation du personnel, et procédures de gestion des incidents de sécurité.
8. Partage des données
Vos données personnelles ne sont jamais vendues, louées ou échangées à des tiers à des fins commerciales. Elles peuvent être transmises uniquement aux destinataires suivants :

Nos sous-traitants techniques : Des prestataires de services qui agissent pour notre compte et sur nos instructions (hébergement, outils d'analyse, services d'authentification comme Supabase, services de sécurité comme Cloudflare Turnstile). Pour le traitement des dons, nous utilisons Stripe, notre prestataire de services de paiement, qui collecte et traite les informations nécessaires à la transaction de manière sécurisée. Ces sous-traitants sont contractuellement engagés à respecter le RGPD et à garantir la sécurité de vos données.
Autorités compétentes : En cas d'obligation légale, de demande judiciaire ou administrative (notamment fiscales pour les dons), vos données peuvent être transmises aux autorités publiques habilitées.
9. Transfert de Données Hors UE/EEE (Espace Économique Européen)
Vos données sont principalement traitées et stockées dans l'Union Européenne. Cependant, certains de nos sous-traitants (notamment pour l'analyse d'audience avec Google Analytics, bien que les serveurs principaux soient en UE, la maison mère est aux États-Unis, et Stripe a également des opérations mondiales) peuvent être amenés à transférer des données personnelles hors de l'UE/EEE.

Dans de tels cas, nous veillons à ce que ce transfert soit encadré par des garanties appropriées, conformément au RGPD, telles que les Clauses Contractuelles Types (CCT) adoptées par la Commission Européenne, ou d'autres mécanismes reconnus offrant un niveau de protection équivalent à celui de l'UE. Nous nous assurons que nos sous-traitants respectent les exigences du RGPD et les recommandations des autorités de protection des données.

10. Vos droits
Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant vos données personnelles :

Droit d'accès : Obtenir la confirmation que vos données sont traitées ou non, et, le cas échéant, y avoir accès.
Droit de rectification : Demander la correction de données inexactes ou incomplètes.
Droit à l'effacement (« droit à l'oubli ») : Demander la suppression de vos données, sous certaines conditions.
Droit d'opposition : Vous opposer au traitement de vos données pour des raisons légitimes.
Droit à la limitation du traitement : Demander la suspension du traitement de vos données, sous certaines conditions.
Droit à la portabilité : Recevoir les données que vous nous avez fournies, dans un format structuré, couramment utilisé et lisible par machine, et les transmettre à un autre responsable de traitement.
Droit de retirer votre consentement : Retirer votre consentement à tout moment, lorsque le traitement est basé sur celui-ci.
Pour exercer ces droits, vous pouvez nous contacter en nous envoyant un email à contact@mwplu.com. Pour des raisons de sécurité, une preuve d'identité pourra vous être demandée pour confirmer votre identité avant de traiter votre demande. Nous nous engageons à répondre dans les meilleurs délais et en tout état de cause dans un délai d'un mois à compter de la réception de votre demande.

Si vous estimez que vos droits n'ont pas été respectés, vous avez également le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente en France, la Commission Nationale de l'Informatique et des Libertés (CNIL) :

Site web : www.cnil.fr
Adresse postale : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07
11. Mineurs
Nos services ne sont pas destinés aux personnes de moins de 15 ans. Nous ne collectons pas sciemment de données personnelles concernant les mineurs sans le consentement de leurs parents ou tuteurs. Si nous apprenons que des données personnelles de mineurs ont été collectées sans un consentement valide, nous prendrons les mesures nécessaires pour les supprimer dans les plus brefs délais.

12. Modifications de la Politique de Confidentialité
La présente Politique de Confidentialité peut être mise à jour périodiquement. Nous vous encourageons à la consulter régulièrement. Toute modification substantielle sera portée à votre connaissance par e-mail et/ou via une notification visible sur le site, au moins 30 jours avant son entrée en vigueur, vous laissant le temps d'examiner les changements.

13. Contact
Pour toute question ou demande concernant la présente Politique de Confidentialité ou le traitement de vos données personnelles, n'hésitez pas à nous contacter :

Email : contact@mwplu.com
Téléphone : 0601842720
```
