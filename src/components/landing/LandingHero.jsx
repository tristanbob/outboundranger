import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingHero() {
  return (
    <section className="bg-[#101418] text-white">
      <div className="max-w-6xl mx-auto px-5 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 mb-6">
          Autonomous GTM agent
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Your outbound pipeline
          <br className="hidden md:block" /> works while you sleep.
        </h1>
        <p className="mt-6 text-white/60 text-lg max-w-2xl mx-auto">
          OutboundRanger finds the right accounts, drafts the outreach, picks the timing, and learns from
          every reply — so your pipeline keeps moving without a manual sequence in sight.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-white text-[#101418] hover:bg-white/90">
            <Link to="/register">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}