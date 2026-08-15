import { Outlet, NavLink } from 'react-router-dom';
import { KanbanSquare, Radar, MessagesSquare, ListChecks, Brain, Settings, Building2 } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Pipeline', icon: KanbanSquare },
  { to: '/agent', label: 'Agent', icon: Radar },
  { to: '/inbox', label: 'Inbox', icon: MessagesSquare },
  { to: '/activity', label: 'Activity', icon: ListChecks },
  { to: '/memory', label: 'Memory', icon: Brain },
  { to: '/onboarding', label: 'Company', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col md:flex-row">
      <aside className="md:w-60 md:min-h-screen bg-[#101418] text-white flex md:flex-col shrink-0">
        <div className="hidden md:block px-6 pt-8 pb-6">
          <div className="font-heading text-lg font-bold tracking-tight">Loop</div>
          <div className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">GTM Agent</div>
        </div>
        <nav className="flex md:flex-col gap-1 px-3 py-2 md:py-0 w-full overflow-x-auto">
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
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}