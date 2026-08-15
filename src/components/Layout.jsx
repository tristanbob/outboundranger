import { Outlet, NavLink } from 'react-router-dom';
import { KanbanSquare, Radar, MessagesSquare, ListChecks, Brain, Settings, Building2, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { OrgProvider, useOrg } from '@/components/org/OrgContext';
import OrgSwitcher from '@/components/org/OrgSwitcher';
import OnboardingGate from '@/components/onboarding/OnboardingGate';

const NAV = [
  { to: '/', label: 'Pipeline', icon: KanbanSquare },
  { to: '/agent', label: 'Agent', icon: Radar },
  { to: '/inbox', label: 'Inbox', icon: MessagesSquare },
  { to: '/activity', label: 'Activity', icon: ListChecks },
  { to: '/memory', label: 'Memory', icon: Brain },
  { to: '/onboarding', label: 'Company', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Shell() {
  const { currentOrg } = useOrg();
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col md:flex-row">
      <aside className="md:w-60 md:min-h-screen bg-[#101418] text-white flex md:flex-col shrink-0">
        <div className="hidden md:block px-6 pt-8 pb-4">
          <div className="font-heading text-lg font-bold tracking-tight">Loop</div>
          <div className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">GTM Agent</div>
        </div>
        <div className="hidden md:block px-3 pb-4">
          <OrgSwitcher />
        </div>
        <nav className="flex md:flex-col gap-1 px-3 py-2 md:py-0 w-full overflow-x-auto">
          <div className="md:hidden shrink-0 self-center mr-1 w-44"><OrgSwitcher /></div>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block mt-auto px-3 pb-4">
          <button
            onClick={() => base44.auth.logout('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div key={currentOrg.id} className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <OnboardingGate orgId={currentOrg.id}>
            <Outlet />
          </OnboardingGate>
        </div>
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <OrgProvider>
      <Shell />
    </OrgProvider>
  );
}