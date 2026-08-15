import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import OrgSwitcher from '@/components/org/OrgSwitcher';

export default function MobileTopBar() {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#101418] text-white px-4 py-3 flex items-center gap-3">
      <div className="font-heading text-base font-bold tracking-tight shrink-0">OutboundRanger</div>
      <div className="flex-1 min-w-0"><OrgSwitcher /></div>
      <button
        onClick={() => base44.auth.logout('/')}
        aria-label="Log out"
        className="shrink-0 p-2 -mr-2 rounded-lg text-white/50 hover:text-white"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}