import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { Search, Bell, Globe, MapPin, Heart, Map as MapIcon, Home as HomeIcon } from 'lucide-react';
import { ToastContainer } from './ToastContainer.js';
import { AlertBanner } from './AlertBanner.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { CHENNAI_AREAS } from '../../constants/areas.js';
import { DonateModal } from '../modals/DonateModal.js';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, toggleLanguage, currentArea, setCurrentArea } = useAuth();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  // Mock search results
  const searchResults = [
    { title: 'Velachery Relief Camp', type: 'Shelter', icon: HomeIcon, path: '/shelters' },
    { title: 'Active Flood Warnings', type: 'Alert', icon: Bell, path: '/alerts' },
    { title: 'View Safe Routes', type: 'Map', icon: MapIcon, path: '/map' }
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen text-slate-800 font-sans overflow-hidden relative">
      {/* Background Image with Bright Overlay */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 z-[-1] bg-white/80 backdrop-blur-md" />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 relative min-w-0">
        
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-slate-200/50 bg-white/50 backdrop-blur-xl flex flex-col justify-center z-10 shrink-0 shadow-sm relative">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                placeholder={language === 'ta' ? 'தேடுக...' : 'Search location, alerts, shelters...'}
                className="w-full bg-white/70 border border-slate-300/50 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors backdrop-blur-sm shadow-sm"
              />
              
              {/* Search Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(result.path);
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <result.icon size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{result.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">{result.type}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 font-medium text-center">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="md:hidden flex-1" /> {/* Spacer for mobile */}

            {/* Actions */}
            <div className="flex items-center gap-3">
              
              {/* Location Switcher */}
              <div className="relative flex items-center bg-white/60 border border-slate-300/50 rounded-full px-3 py-1.5 shadow-sm hover:bg-white/80 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                <select 
                  value={currentArea}
                  onChange={(e) => setCurrentArea(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none pr-4"
                >
                  {CHENNAI_AREAS.map(a => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                  <option value="Custom">Custom Location</option>
                </select>
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-700 transition-all active:scale-95 shadow-sm"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
              </button>

              <button className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors bg-white/60 hover:bg-white/80 rounded-full shadow-sm">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              
              <div className="flex items-center gap-2 pl-3 border-l border-slate-300/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  AV
                </div>
                <span className="text-sm font-bold hidden sm:block text-slate-800">Ajay V</span>
              </div>
            </div>
          </div>
        </header>

        {/* Banners */}
        <div className="z-10 relative">
          <AlertBanner />
          <ToastContainer />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative z-0">
          {children}
        </main>
      </div>

      {/* Modals */}
      <DonateModal 
        isOpen={showDonateModal} 
        onClose={() => setShowDonateModal(false)} 
      />
    </div>
  );
};
