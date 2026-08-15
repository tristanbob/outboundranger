import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radar } from 'lucide-react';

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-30 bg-[#101418]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Radar className="w-5 h-5" />
          <span className="font-heading font-bold tracking-tight">OutboundRanger</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-white text-[#101418] hover:bg-white/90">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}