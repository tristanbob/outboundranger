import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingCTA() {
  return (
    <section className="bg-[#101418] text-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
          Put a ranger on your pipeline
        </h2>
        <p className="mt-4 text-white/60">
          Set your goal once. Wake up to leads that moved.
        </p>
        <Button asChild size="lg" className="mt-8 bg-white text-[#101418] hover:bg-white/90">
          <Link to="/register">Get started</Link>
        </Button>
      </div>
    </section>
  );
}