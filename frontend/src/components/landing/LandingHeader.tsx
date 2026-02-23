import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        scrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ScriptaScuola Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-semibold text-primary">ScriptaScuola</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => scrollToSection("benefits")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Vantaggi
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Funzionalità
          </button>
          <button
            onClick={() => scrollToSection("security")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sicurezza
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Come Funziona
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="hidden sm:flex"
          >
            <Link to="/login">Accedi</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Registrati</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
