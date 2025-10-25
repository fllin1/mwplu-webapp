/**
 * Privacy Policy Content
 * @module privacyContent
 * @description Centralized content for Privacy Policy - used by both full page and modal
 * @version 1.0.0
 */

export const privacyContent = {
  metadata: {
    title: 'Politique de confidentialité',
    lastUpdate: '9 juin 2025',
    version: '1.0',
  },

  sections: [
    {
      id: 'section-1',
      title: '1. Collecte des données',
      content: `
        <p>
          MEWE PARTNERS SAS collecte différents types de données personnelles dans le cadre de la fourniture de ses services :
        </p>
        <ul>
          <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
          <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, navigateur utilisé</li>
          <li><strong>Données d'utilisation :</strong> pages consultées, fonctionnalités utilisées, temps de session</li>
          <li><strong>Données de paiement :</strong> informations de facturation (traitées par Stripe)</li>
          <li><strong>Données de communication :</strong> messages envoyés via les formulaires de contact</li>
        </ul>
        <p>
          Ces données sont collectées lors de la création de votre compte, de l'utilisation de nos services, ou de vos interactions avec notre plateforme.
        </p>
      `,
    },
    {
      id: 'section-2',
      title: '2. Utilisation des données',
      content: `
        <p>
          Vos données personnelles sont utilisées pour les finalités suivantes :
        </p>
        <ul>
          <li><strong>Gestion des comptes :</strong> création, authentification, maintenance des comptes utilisateurs</li>
          <li><strong>Fourniture des services :</strong> génération des synthèses PLU, accès aux fonctionnalités</li>
          <li><strong>Communication :</strong> envoi d'informations sur le service, support client</li>
          <li><strong>Amélioration du service :</strong> analyse d'usage, développement de nouvelles fonctionnalités</li>
          <li><strong>Facturation :</strong> gestion des abonnements et des paiements</li>
          <li><strong>Obligations légales :</strong> respect des exigences réglementaires</li>
        </ul>
        <p>
          Le traitement de vos données repose sur différentes bases légales : exécution du contrat, intérêt légitime, consentement, ou obligation légale selon le cas.
        </p>
      `,
    },
    {
      id: 'section-3',
      title: '3. Vos droits',
      content: `
        <p>
          Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
          <li><strong>Droit d'effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement pour motif légitime</li>
          <li><strong>Droit à la limitation :</strong> demander la restriction du traitement</li>
          <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
          <li><strong>Retrait du consentement :</strong> retirer votre consentement à tout moment</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à <a href="mailto:contact@mwplu.com">contact@mwplu.com</a>. Une pièce d'identité pourra être demandée pour vérifier votre identité.
        </p>
        <p>
          Vous avez également le droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr">www.cnil.fr</a>).
        </p>
      `,
    },
    {
      id: 'section-4',
      title: '4. Sécurité et conservation',
      content: `
        <p>
          MEWE PARTNERS SAS met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles :
        </p>
        <ul>
          <li><strong>Chiffrement :</strong> communications sécurisées (HTTPS/TLS) et stockage chiffré</li>
          <li><strong>Contrôle d'accès :</strong> accès limité aux personnes autorisées uniquement</li>
          <li><strong>Surveillance :</strong> monitoring des systèmes et détection d'intrusions</li>
          <li><strong>Sauvegarde :</strong> sauvegardes régulières et sécurisées</li>
          <li><strong>Formation :</strong> sensibilisation du personnel à la protection des données</li>
        </ul>
        <p><strong>Durées de conservation :</strong></p>
        <ul>
          <li><strong>Comptes actifs :</strong> tant que le compte est utilisé + 5 ans après la dernière activité</li>
          <li><strong>Données de facturation :</strong> 10 ans (obligations comptables)</li>
          <li><strong>Logs de sécurité :</strong> 3 ans maximum</li>
          <li><strong>Données marketing :</strong> 3 ans après le dernier contact</li>
        </ul>
        <p>
          Nos données sont hébergées dans l'Union européenne par des prestataires certifiés (Google Cloud Platform, Supabase).
        </p>
      `,
    },
    {
      id: 'section-5',
      title: '5. Cookies et traceurs',
      content: `
        <p>
          Le site utilise différents types de cookies et traceurs :
        </p>
        <ul>
          <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (authentification, sécurité)</li>
          <li><strong>Cookies analytiques :</strong> mesure d'audience et statistiques d'utilisation</li>
          <li><strong>Cookies de préférences :</strong> mémorisation de vos choix (langue, thème)</li>
        </ul>
        <p>
          Les cookies non essentiels nécessitent votre consentement préalable via notre bannière de gestion des cookies. Vous pouvez modifier vos préférences à tout moment.
        </p>
        <p>
          Pour plus d'informations, consultez notre <a href="/policies/cookies">Politique de Cookies</a> complète.
        </p>
      `,
    },
    {
      id: 'section-6',
      title: '6. Partage des données',
      content: `
        <p>
          Vos données personnelles ne sont pas vendues à des tiers. Elles peuvent être partagées dans les cas suivants :
        </p>
        <ul>
          <li><strong>Prestataires de services :</strong> hébergement (Supabase), paiement (Stripe), analytics (Google Analytics)</li>
          <li><strong>Obligations légales :</strong> autorités compétentes sur réquisition judiciaire</li>
          <li><strong>Protection des droits :</strong> en cas de litige ou pour protéger nos intérêts légitimes</li>
        </ul>
        <p>
          Tous nos prestataires sont situés dans l'Union européenne ou offrent des garanties adéquates pour la protection des données (décisions d'adéquation, clauses contractuelles types).
        </p>
        <p>
          Aucun transfert de données hors UE n'est effectué sans votre consentement explicite ou garanties appropriées.
        </p>
      `,
    },
  ],

  // Generate different content views
  getFullContent() {
    return {
      title: this.metadata.title,
      lastUpdate: this.metadata.lastUpdate,
      sections: this.sections,
    }
  },
}

export default privacyContent
