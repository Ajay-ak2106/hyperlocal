import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, LifeBuoy, Users, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const BottomNav: React.FC = () => {
  const { t, role } = useAuth();

  const navItems = [
    { to: '/', label: t.navHome, icon: Home },
    { to: '/map', label: t.navMap, icon: Map },
    { to: '/help', label: t.navHelp, icon: LifeBuoy },
    { to: '/community', label: t.navCommunity, icon: Users },
    {
      to: role === 'ADMIN' ? '/admin' : role === 'VOLUNTEER' ? '/volunteer' : '/profile',
      label: role === 'ADMIN' ? 'HQ Admin' : role === 'VOLUNTEER' ? 'Volunteer' : t.navProfile,
      icon: role === 'ADMIN' ? ShieldAlert : User
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 touch-target ${
                  isActive
                    ? 'text-rose-400 font-extrabold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 tracking-tight truncate max-w-[68px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
