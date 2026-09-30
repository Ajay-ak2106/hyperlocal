import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Bell, 
  Home as ShelterIcon, 
  AlertTriangle, 
  BookOpen, 
  Users, 
  Settings,
  Search,
  Menu,
  X,
  MapPin,
  Heart,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/map', label: 'Live Map', icon: Map },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/fund', label: 'Donate Funds', icon: Heart },
    { to: '/shelters', label: 'Shelters', icon: ShelterIcon },
    { to: '/help', label: 'Rescue Hub', icon: LifeBuoy },
    { to: '/resources', label: 'Resources', icon: BookOpen },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-slate-800 rounded-lg text-slate-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200 transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center mr-3">
            <Map size={18} />
          </div>
          <div>
            <h1 className="text-slate-800 font-bold text-lg leading-tight">HyperLocal</h1>
            <p className="text-emerald-600 text-[10px] uppercase font-semibold tracking-wider drop-shadow-sm">Disaster Help</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
             <NavLink
               key={item.to}
               to={item.to}
               onClick={() => setIsOpen(false)}
               className={({ isActive }) => `
                 flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                 ${isActive 
                   ? 'bg-emerald-500/10 text-emerald-700 font-bold' 
                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                 }
               `}
             >
               {({ isActive }) => (
                 <>
                   <item.icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                   <span className="text-sm">{item.label}</span>
                 </>
               )}
             </NavLink>
          ))}
        </nav>

        {/* Bottom Status */}
        <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm">
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
             <MapPin size={16} className="text-slate-600" />
           </div>
           <div>
             <p className="text-xs font-bold text-slate-800">Chennai</p>
             <p className="text-[10px] text-slate-500 font-medium">28°C • Heavy Rain</p>
           </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
