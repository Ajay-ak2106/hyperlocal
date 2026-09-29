import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useRealtime } from '../../contexts/RealtimeContext.js';
import { UserRole } from '../../types/index.js';
import {
  MapPin,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  LifeBuoy,
  X
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';

export const Header: React.FC = () => {
  const { role, profile, language, currentArea, gpsActive, t, switchDemoRole, toggleLanguage, setCurrentArea, requestGps } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useRealtime();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [offlineCount, setOfflineCount] = useState(offlineManager.getPendingCount());

  React.useEffect(() => {
    return offlineManager.subscribe((count) => setOfflineCount(count));
  }, []);

  const areas = ['Velachery', 'Tambaram', 'Pallikaranai', 'Madipakkam', 'Saidapet', 'Adyar', 'Perungudi', 'Medavakkam'];

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string }> = {
    CITIZEN: { label: 'Citizen', icon: User, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    VOLUNTEER: { label: 'Volunteer', icon: LifeBuoy, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    COMMUNITY_COORDINATOR: { label: 'Coordinator', icon: Shield, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    ADMIN: { label: 'Disaster HQ Admin', icon: Shield, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    RESOURCE_PROVIDER: { label: 'Provider', icon: LifeBuoy, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.CITIZEN;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Area Selector */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-900/40 text-xl font-black">
              🆘
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Namma<span className="text-rose-500">Rescue</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Live
                </span>
              </div>
              <button
                onClick={() => setShowAreaModal(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                title="Tap to change your local ward"
              >
                <MapPin className={`w-3.5 h-3.5 ${gpsActive ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="font-semibold text-slate-300 underline decoration-slate-600 decoration-dotted">
                  {currentArea}
                </span>
                <span className="text-[10px] text-slate-400 hidden xs:inline">
                  ({gpsActive ? 'GPS' : 'Manual'})
                </span>
              </button>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Offline Sync Banner if pending items */}
            {offlineCount > 0 && (
              <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-lg font-bold animate-pulse">
                Queue: {offlineCount}
              </span>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all active:scale-95 touch-target"
              title="Switch Language / மொழி மாற்றம்"
            >
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Role Switcher Pill (Hackathon Demo Feature) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 touch-target ${currentRoleInfo.color}`}
                title="Switch demo user role"
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <span className="text-[10px] opacity-75">▼</span>
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    🎬 Hackathon Demo Switcher
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
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-rose-500/20 text-rose-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{info.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors touch-target"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-slate-950 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">
                      🚨 Realtime Alerts ({notifications.length})
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2 mt-2 flex-1 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No alerts at this moment. You are all caught up!
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                              : 'bg-rose-950/30 border-rose-800/50 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className={n.is_read ? 'text-slate-300' : 'text-rose-300'}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
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

      {/* Ward / Area Selection Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Select Hyperlocal Ward
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Incidents, flood reports, shelters, and resources will automatically filter around this locality:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {areas.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setCurrentArea(a);
                    setShowAreaModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    currentArea === a
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  📍 {a}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                requestGps();
                setShowAreaModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Use Current Device GPS
            </button>
          </div>
        </div>
      )}
    </>
  );
};
