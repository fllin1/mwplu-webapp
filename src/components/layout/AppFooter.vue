<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <!-- Contact Section -->
        <div class="footer-section">
          <h3 class="footer-title">Contact</h3>
          <div class="contact-info">
            <div class="contact-item">
              <a href="mailto:contact@mwplu.com" class="footer-link">contact@mwplu.com</a>
            </div>
            <div class="contact-item">
              <a href="tel:+33601842720" class="footer-link">06 01 84 27 20</a>
            </div>
          </div>
        </div>

        <!-- Quick Links Section -->
        <div class="footer-section">
          <h3 class="footer-title">Liens rapides</h3>
          <div class="footer-links">
            <div class="footer-links-column">
              <router-link to="/" class="footer-link">Accueil</router-link>
              <router-link to="/info/about" class="footer-link">À propos</router-link>
              <router-link to="/info/donation" class="footer-link">Nous soutenir</router-link>
            </div>
            <div class="footer-links-column">
              <router-link to="/docs/documentation" class="footer-link">Documentation</router-link>
              <router-link to="/contact" class="footer-link">Contact</router-link>
              <router-link to="/profile" class="footer-link">Mon compte</router-link>
            </div>
          </div>
        </div>

        <!-- Follow Us Section -->
        <div class="footer-section">
          <h3 class="footer-title">Suivez-nous</h3>
          <div class="social-links">
            <a href="https://twitter.com/mwplu" class="social-link" aria-label="Twitter">
              <span class="social-icon">
                <img
                  src="/src/assets/icons/socials/twitter-x.svg"
                  alt="Twitter Logo"
                />
              </span>
            </a>
            <a href="https://facebook.com/mwplu" class="social-link" aria-label="Facebook">
              <span class="social-icon">
                <img
                  src="/src/assets/icons/socials/facebook.svg"
                  alt="Facebook Logo"
                />
              </span>
            </a>
            <a href="https://linkedin.com/company/mwplu" class="social-link" aria-label="LinkedIn">
              <span class="social-icon">
                <img
                  src="/src/assets/icons/socials/linkedin.svg"
                  alt="LinkedIn Logo"
                />
              </span>
            </a>
            <a href="https://youtube.com/@mwplu" class="social-link" aria-label="Youtube">
              <span class="social-icon">
                <img
                  src="/src/assets/icons/socials/youtube.svg"
                  alt="Youtube Logo"
                />
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-legal">
          <router-link to="/policies/legal">Mentions Légales</router-link>
          <router-link to="/policies/terms">Conditions Générales d'Utilisation</router-link>
          <router-link to="/policies/privacy">Politique de Confidentialité</router-link>
          <router-link to="/policies/cookies">Politique de Cookies</router-link>
          <router-link to="/policies/sales">Politiques de Ventes</router-link>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2025 MWPLU. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
/**
 * AppFooter Component
 * @description Main application footer with legal links and company information
 *
 * Features:
 * - Legal compliance links (mentions légales, confidentialité, CGU)
 * - Support and product links
 * - Company branding and description
 * - Version and build information
 * - Responsive design following the minimalist approach
 *
 * Design Principles:
 * - Clean, uncluttered layout
 * - Proper typography hierarchy
 * - Accessible link navigation
 * - Consistent with header styling
 */
export default {
  name: 'AppFooter',

  setup() {
    return {}
  }
}
</script>

<style scoped>
.site-footer {
  background-color: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
  margin-top: auto;
  padding: var(--space-8) 0 var(--space-6);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Three columns for contact, quick links, social */
  gap: var(--space-12);
  margin-bottom: var(--space-8);
}

/* Footer Section general styles */
.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-1) 0;
}

/* Contact Section */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.contact-item {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.contact-item a:hover {
  color: var(--color-gray-500);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Quick Links Section */
.footer-links {
  display: flex;
  gap: var(--space-8); /* Space between link columns */
}

.footer-links-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-link {
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
  padding: var(--space-1) 0;
}

.footer-link:hover {
  color: var(--color-gray-500);
  transform: translateY(-1px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.footer-link:focus {
  outline-offset: 2px;
  border-radius: var(--radius-button);
}

/* Social Links Section */
.social-links {
  display: flex;
  gap: var(--space-4);
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-button);
}

.social-link:hover {
  background-color: var(--color-gray-200);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.social-icon {
  display: flex;
  width: var(--space-5);
  height: var(--space-5);
}

.social-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: filter var(--transition-fast);
}


/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-6);
  margin-top: var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  gap: var(--space-4);
}

.footer-legal {
  display: flex;
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
  gap: var(--space-6);
}

.footer-legal a:hover {
  color: var(--color-color-black);
  transform: translateY(-1px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.footer-copyright {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr; /* Stack columns on small screens */
    gap: var(--space-8);
  }

  .footer-links {
    flex-direction: column;
    gap: var(--space-4);
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-legal {
    justify-content: center;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 var(--space-3);
  }
}

/* Print Styles */
@media print {
  .site-footer {
    display: none;
  }
}
</style>
