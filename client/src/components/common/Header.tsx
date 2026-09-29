import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useRealtime } from '../../contexts/RealtimeContext.js';
import { UserRole } from '../../types/index.js';
import {
  MapPin,
  Globe,
  Bell,
  CheckCircle2,
  User,
  Shield,
  LifeBuoy,
  X,
  ChevronDown
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';
import { CHENNAI_AREAS } from '../../constants/areas.js';

export const Header: React.FC = () => {
  const { role, language, currentArea, gpsActive, switchDemoRole, toggleLanguage, setCurrentArea, requestGps } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useRealtime();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [offlineCount, setOfflineCount] = useState(offlineManager.getPendingCount());

  useEffect(() => {
    return offlineManager.subscribe((count) => setOfflineCount(count));
  }, []);

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string }> = {
    CITIZEN: { label: 'Citizen', icon: User, color: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40' },
    VOLUNTEER: { label: 'Volunteer', icon: LifeBuoy, color: 'bg-sky-950/70 text-sky-300 border-sky-600/40' },
    COMMUNITY_COORDINATOR: { label: 'Coordinator', icon: Shield, color: 'bg-amber-950/70 text-amber-300 border-amber-600/40' },
    ADMIN: { label: 'GCC Admin', icon: Shield, color: 'bg-red-950/70 text-red-300 border-red-600/40' },
    RESOURCE_PROVIDER: { label: 'Provider', icon: LifeBuoy, color: 'bg-purple-950/70 text-purple-300 border-purple-500/40' },
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.CITIZEN;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Brand Identity & Location */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-sm">
              🆘
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  Namma<span className="text-emerald-400">Rescue</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Chennai Relief
                </span>
              </div>

              {/* Area Selector Button */}
              <button
                onClick={() => setShowAreaModal(true)}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-emerald-400 transition-colors mt-0.5"
                title="Select Area"
              >
                <MapPin className={`w-3.5 h-3.5 ${gpsActive ? 'text-emerald-400' : 'text-sky-400'}`} />
                <span className="font-semibold underline decoration-dotted decoration-slate-500">
                  {currentArea}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right: Controls & Language */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Offline sync indicator */}
            {offlineCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-lg font-medium animate-pulse">
                Offline: {offlineCount}
              </span>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Persona/Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 shadow-sm ${currentRoleInfo.color}`}
                title="Switch Role"
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 p-1.5 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Persona
                  </div>
                  <div className="space-y-1 mt-1">
                    {(['CITIZEN', 'VOLUNTEER', 'COMMUNITY_COORDINATOR', 'ADMIN'] as UserRole[]).map((r) => {
                      const info = roleLabels[r];
                      const Icon = info.icon;
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            switchDemoRole(r);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{info.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      Alerts ({notifications.length})
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-sky-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2 mt-2 flex-1 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                              : 'bg-slate-800/80 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className={n.is_read ? 'text-slate-400' : 'text-emerald-400'}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Area Selection Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {language === 'ta' ? 'பகுதியை தேர்வு செய்க' : 'Select Your Area'}
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் பகுதியை தேர்வு செய்தால் அப்பகுதிக்கான முகாம்கள் மற்றும் தகவல்கள் காட்டப்படும்.'
                : 'Select your Chennai locality to see nearby shelters and emergency alerts:'}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto pr-1">
              {CHENNAI_AREAS.map((a) => (
                <button
                  key={a.name}
                  onClick={() => {
                    setCurrentArea(a.name);
                    setShowAreaModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    currentArea === a.name
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">📍 {a.name}</div>
                  <div className="text-[10px] text-slate-400">{a.nameTa} • {a.zone}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                requestGps();
                setShowAreaModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              {language === 'ta' ? 'தற்போதைய GPS இருப்பிடத்தைப் பயன்படுத்து' : 'Use Current Device Location'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
