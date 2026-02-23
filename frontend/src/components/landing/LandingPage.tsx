import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import BenefitsSection from "./BenefitsSection";
import FeaturesSection from "./FeaturesSection";
import SecurityFreeSection from "./SecurityFreeSection";
import StatsSection from "./StatsSection";
import HowItWorksSection from "./HowItWorksSection";
import FAQSection from "./FAQSection";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <BenefitsSection />
        <FeaturesSection />
        <SecurityFreeSection />
        <StatsSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
