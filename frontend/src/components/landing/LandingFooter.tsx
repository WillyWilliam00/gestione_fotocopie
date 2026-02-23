import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingFooter() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Colonna 1: Logo e descrizione */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <Link to="/landing" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="ScriptaScuola Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-semibold text-primary">
                ScriptaScuola
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Il gestionale web per digitalizzare e monitorare le fotocopie
              nella tua scuola.
            </p>
          </motion.div>

          {/* Colonna 2: Prodotto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">Prodotto</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funzionalità
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Come funziona
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const faqSection = document.querySelector(
                      '[id*="faq"], [class*="FAQ"]'
                    );
                    if (faqSection) {
                      faqSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Colonna 3: Risorse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">Risorse</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentazione
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@scriptascuola.dev"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Supporto
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Colonna 4: Contatti */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">Contatti</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@scriptascuola.dev"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://williamcosta.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sviluppatore
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-muted-foreground">
            Copyright © {new Date().getFullYear()} William Costa
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sviluppato da</span>
            <a
              href="https://williamcosta.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline transition-colors"
            >
              williamcosta.dev
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
