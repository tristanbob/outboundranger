import { NavLink } from 'react-router-dom';

export default function MobileNav({ items }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#101418] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-7">
        {items.map(({ to, label, short, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] leading-none ${
                isActive ? 'text-white' : 'text-white/45'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="truncate w-full text-center px-0.5">{short || label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}