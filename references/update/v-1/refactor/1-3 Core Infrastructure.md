# Explication des étapes

## 1.3 Core Infrastructure

### ✅ Setup Vue Router with route guards for authentication

**Objectif :**  
Permettre la navigation entre différentes pages de l’application (par exemple `/login`, `/home`, `/profile`) tout en protégeant certaines pages qui nécessitent une authentification.

**Pourquoi ?**  
Pour empêcher les utilisateurs non connectés d’accéder à des pages sensibles (comme le profil ou les documents).

**Comment ?**

- Configurer les routes dans un fichier `router/index.js`.
- Ajouter des _route guards_ qui vérifient si l’utilisateur est authentifié avant de charger certaines pages.
- Rediriger vers la page de login si l’utilisateur n’est pas connecté.

---

### ✅ Setup Pinia for state management

**Objectif :**  
Gérer un état global (comme l’utilisateur connecté, les préférences, etc.) dans toute l’application.

**Pourquoi ?**  
Pour éviter de devoir transmettre manuellement des données entre les composants (_props drilling_), ce qui devient vite compliqué à maintenir.

**Comment ?**

- Installer Pinia.
- Créer un _store_ (dans `stores/auth.js` par exemple) contenant les informations utilisateur, les fonctions de login/logout, etc.
- Utiliser ce store dans les composants via `useAuthStore()`.

---

### ✅ Create Supabase service module

**Objectif :**  
Centraliser toutes les interactions avec Supabase (base de données, authentification, etc.) dans un seul fichier.

**Pourquoi ?**  
Pour éviter la duplication de code et garder une architecture propre et modulaire.

**Comment ?**

- Créer un fichier `services/supabase.js`.
- Y configurer l'initialisation de Supabase avec les variables d’environnement.
- Y définir des fonctions comme `signUp()`, `login()`, `getUser()`.

---

### ✅ Setup global error handling

**Objectif :**  
Mettre en place un système pour gérer les erreurs (réseau, authentification, etc.) de manière uniforme dans toute l’application.

**Pourquoi ?**  
Pour ne pas laisser les erreurs invisibles ou affichées brutalement. Mieux vaut afficher un message clair et utile à l’utilisateur.

**Comment ?**

- Créer un _composable_ ou un système de _toasts_ pour afficher les erreurs.
- Utiliser `try/catch` dans les services pour attraper les erreurs.
- Ajouter des messages d’erreur dans l’interface utilisateur si besoin.

---

### ✅ Configure Turnstile CAPTCHA integration

**Objectif :**  
Protéger les formulaires de ton application (connexion, inscription, contact, etc.) contre les bots.

**Pourquoi ?**  
Sans protection, ton application pourrait être spammée par des scripts automatisés.

**Comment ?**

- Utiliser le service CAPTCHA "Turnstile" de Cloudflare.
- Ajouter un composant CAPTCHA dans les formulaires critiques.
- Vérifier la validité du CAPTCHA avant d’autoriser l’action (signup, login...).

---

> 📌 **Conseil débutant :** Chaque étape est importante pour avoir une base solide. Même si tu ne comprends pas tout dès le début, avance pas à pas, copie des exemples de la doc officielle, et n’hésite pas à tester ton code dans un petit projet d’essai pour t’entraîner.
