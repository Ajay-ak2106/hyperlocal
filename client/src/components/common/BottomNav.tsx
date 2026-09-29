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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cyber-bg/95 backdrop-blur-xl border-t border-cyber-green/30 px-2 py-1 safe-area-pb shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
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
                    ? 'text-cyber-green font-bold scale-105 drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]'
                    : 'text-slate-400 hover:text-cyber-green/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.5px] text-cyber-green' : 'stroke-2'}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyber-green shadow-[0_0_8px_#00ff9d]" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 font-mono tracking-tight truncate max-w-[68px]">
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
