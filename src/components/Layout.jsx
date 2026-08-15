import { Outlet, NavLink } from 'react-router-dom';
import { KanbanSquare, Radar, MessageCircle, ListChecks, Brain, BarChart3, Settings, LogOut, Users, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { OrgProvider, useOrg } from '@/components/org/OrgContext';
import OrgSwitcher from '@/components/org/OrgSwitcher';
import OnboardingGate from '@/components/onboarding/OnboardingGate';
import MobileTopBar from '@/components/nav/MobileTopBar';
import MobileNav from '@/components/nav/MobileNav';
import AutopilotToggle from '@/components/agent/AutopilotToggle';

const NAV = [
  { to: '/', label: 'Pipeline', short: 'Pipeline', icon: KanbanSquare },
  { to: '/leads', label: 'Customers', short: 'Customers', icon: Users },
  { to: '/agent', label: 'Approvals', short: 'Approvals', icon: Radar },
  { to: '/chat', label: 'Ask Agent', short: 'Ask', icon: MessageCircle },
  { to: '/calendar', label: 'Calendar', short: 'Calendar', icon: CalendarDays },
  { to: '/activity', label: 'Activity', short: 'Activity', icon: ListChecks },
  { to: '/memory', label: 'Memory', short: 'Memory', icon: Brain },
  { to: '/reports', label: 'Reporting', short: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
];

function Shell() {
  const { currentOrg } = useOrg();
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col md:flex-row">
      <MobileTopBar />
      <aside className="hidden md:w-60 md:min-h-screen bg-[#101418] text-white md:flex md:flex-col shrink-0">
        <div className="px-6 pt-8 pb-4">
          <div className="font-heading text-lg font-bold tracking-tight">Loop</div>
          <div className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">GTM Agent</div>
        </div>
        <div className="px-3 pb-4 space-y-2">
          <AutopilotToggle />
          <OrgSwitcher />
        </div>
        <nav className="flex flex-col gap-1 px-3 w-full">
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
        <div className="mt-auto px-3 pb-4">
          <button
            onClick={() => base44.auth.logout('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div key={currentOrg.id} className="pb-24 md:pb-10">
          <OnboardingGate orgId={currentOrg.id}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-10">
              <Outlet />
            </div>
          </OnboardingGate>
        </div>
      </main>
      <MobileNav items={NAV} />
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