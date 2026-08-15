import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingAutopilot from '@/components/landing/LandingAutopilot';
import LandingLearning from '@/components/landing/LandingLearning';
import LandingCTA from '@/components/landing/LandingCTA';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingAutopilot />
      <LandingLearning />
      <LandingCTA />
      <footer className="bg-[#101418] border-t border-white/10 py-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} OutboundRanger
      </footer>
    </div>
  );
}