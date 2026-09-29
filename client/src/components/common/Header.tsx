import React, { useState, useEffect } from 'react';
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
  X,
  Radio,
  Clock,
  Activity
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';
import { getLiveChennaiTelemetry, CommandTelemetry } from '../../services/telemetry.js';

export const Header: React.FC = () => {
  const { role, profile, language, currentArea, gpsActive, t, switchDemoRole, toggleLanguage, setCurrentArea, requestGps } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useRealtime();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [offlineCount, setOfflineCount] = useState(offlineManager.getPendingCount());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [telemetry, setTelemetry] = useState<CommandTelemetry | null>(null);

  // Live Digital Clock (matching the futuristic format in the user's reference image: YYYY.MM.DD HH:MM:SS)
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      setCurrentTime(`${year}.${month}.${day} ${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live meteorological telemetry
  useEffect(() => {
    getLiveChennaiTelemetry().then(setTelemetry).catch(() => {});
  }, []);

  useEffect(() => {
    return offlineManager.subscribe((count) => setOfflineCount(count));
  }, []);

  const areas = ['Velachery', 'Tambaram', 'Pallikaranai', 'Madipakkam', 'Saidapet', 'Adyar', 'Perungudi', 'Medavakkam', 'T. Nagar'];

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string }> = {
    CITIZEN: { label: 'Citizen', icon: User, color: 'bg-emerald-950/50 text-[#00ff9d] border-[#00ff9d]/40' },
    VOLUNTEER: { label: 'Volunteer', icon: LifeBuoy, color: 'bg-cyan-950/50 text-[#00e5ff] border-[#00e5ff]/40' },
    COMMUNITY_COORDINATOR: { label: 'Coordinator', icon: Shield, color: 'bg-amber-950/50 text-[#ffb703] border-[#ffb703]/40' },
    ADMIN: { label: 'GCC Command HQ', icon: Shield, color: 'bg-rose-950/50 text-[#ff2a55] border-[#ff2a55]/40' },
    RESOURCE_PROVIDER: { label: 'Provider', icon: LifeBuoy, color: 'bg-purple-950/50 text-purple-300 border-purple-500/40' },
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.CITIZEN;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060b11]/95 backdrop-blur-md border-b border-[#00ff9d]/30 px-3 py-2 sm:px-6 shadow-[0_4px_25px_rgba(0,255,157,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Command Center Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg bg-[#0c1a1f] border border-[#00ff9d]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.35)] group">
              <span className="text-lg">🆘</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00ff9d] animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm sm:text-base tracking-wider text-white flex items-center gap-1.5">
                  NAMMA<span className="glow-text-green font-extrabold">RESCUE</span>
                  <span className="hidden md:inline text-xs text-[#00ff9d]/60 font-mono tracking-widest">// COMMAND PLATFORM</span>
                </span>
                <span className="text-[9px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/40">
                  LIVE HUD
                </span>
              </div>

              {/* Sector / Ward Selector Pill */}
              <button
                onClick={() => setShowAreaModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00ff9d] transition-colors font-mono mt-0.5"
                title="Select Hyperlocal Sector"
              >
                <MapPin className={`w-3 h-3 ${gpsActive ? 'text-[#00ff9d]' : 'text-amber-400'}`} />
                <span className="text-[#00e5ff] font-semibold underline decoration-dotted decoration-[#00e5ff]/50">
                  {currentArea} Sector
                </span>
                <span className="text-[10px] text-slate-500">
                  [{gpsActive ? 'GPS_LOCK' : 'MANUAL'}]
                </span>
              </button>
            </div>
          </div>

          {/* Center: Tactical Telemetry Banner (Hidden on small screens) */}
          <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1520] border border-[#00ff9d]/25 text-[#00ff9d]">
              <Radio className="w-3.5 h-3.5 text-[#00ff9d] animate-pulse" />
              <span className="font-bold tracking-wider">CRISIS RADAR ACTIVE</span>
              <span className="text-[10px] text-slate-400">| 15 ZONES</span>
            </div>

            {telemetry && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#140b10] border border-[#ff2a55]/30 text-[#ff2a55]">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-bold">IMD: {telemetry.active_alert_level.replace('_', ' ')}</span>
                <span className="text-[10px] text-slate-400">| 24h Rain: 284mm</span>
              </div>
            )}
          </div>

          {/* Right: Digital Clock & Command Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* High-Tech Digital Monospace Clock (matching reference screenshot) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09111a] border border-[#00ff9d]/30 font-mono text-xs text-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.15)]">
              <Clock className="w-3.5 h-3.5 text-[#00ff9d]" />
              <span className="tracking-widest font-bold">{currentTime || '2026.09.29 20:25:00'}</span>
            </div>

            {/* Offline Sync Banner if pending items */}
            {offlineCount > 0 && (
              <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-lg font-mono font-bold animate-pulse">
                SYNC_QUEUE: {offlineCount}
              </span>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0a1520] hover:bg-[#0f1f2e] border border-[#00ff9d]/30 text-xs font-mono font-semibold text-[#00ff9d] transition-all active:scale-95 touch-target shadow-[0_0_10px_rgba(0,255,157,0.1)]"
              title="Switch Language / மொழி மாற்றம்"
            >
              <Globe className="w-3.5 h-3.5 text-[#00ff9d]" />
              <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Role Switcher Pill (Persona Switcher) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all active:scale-95 touch-target shadow-sm ${currentRoleInfo.color}`}
                title="Switch Operational Persona"
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentRoleInfo.label}</span>
                <span className="text-[9px] opacity-75">▼</span>
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0a1520] border border-[#00ff9d]/40 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150 font-mono">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-[#00ff9d] uppercase tracking-wider border-b border-[#00ff9d]/20 flex items-center justify-between">
                    <span>🎬 SIMULATE PERSONA</span>
                    <span className="text-[9px] text-slate-500">LIVE SWITCH</span>
                  </div>
                  <div className="space-y-1 mt-1.5">
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
                              ? 'bg-[#00ff9d]/20 text-[#00ff9d] font-bold border border-[#00ff9d]/30'
                              : 'text-slate-300 hover:bg-[#112030]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{info.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff9d]" />}
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
                className="relative p-2 rounded-lg bg-[#0a1520] hover:bg-[#0f1f2e] border border-[#00ff9d]/30 text-slate-300 transition-colors touch-target"
                title="Tactical Alerts"
              >
                <Bell className="w-4 h-4 text-[#00ff9d]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff2a55] text-white text-[10px] font-mono font-extrabold flex items-center justify-center ring-2 ring-[#05090e] animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0a1520] border border-[#00ff9d]/40 shadow-2xl z-50 p-3 max-h-[80vh] flex flex-col font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-[#00ff9d]/20">
                    <span className="text-xs font-bold text-[#00ff9d] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-[#ff2a55]" />
                      CRISIS BROADCASTS ({notifications.length})
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#00e5ff] hover:underline"
                    >
                      Acknowledge all
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2 mt-2 flex-1 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        All sectors operational. No unacknowledged alerts.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-[#05090e]/60 border-slate-800 text-slate-400'
                              : 'bg-[#1a0c12]/80 border-[#ff2a55]/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className={n.is_read ? 'text-slate-400' : 'text-[#ff2a55]'}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-sm rounded-2xl bg-[#0a1520] border border-[#00ff9d]/40 p-5 shadow-[0_0_35px_rgba(0,255,157,0.2)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#00ff9d]/20">
              <h3 className="text-sm font-bold text-[#00ff9d] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00ff9d]" />
                SELECT TACTICAL SECTOR
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Telemetry, flood warnings, shelters, and relief supplies will calibrate to this administrative sector:
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
                      ? 'bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.3)] font-bold'
                      : 'bg-[#05090e] border-[#163044] text-slate-300 hover:border-[#00ff9d]/50 hover:bg-[#0c1a24]'
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
              className="w-full py-2.5 rounded-xl bg-[#05090e] hover:bg-[#0f1f2e] border border-[#00ff9d]/40 text-xs font-bold text-[#00ff9d] flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,255,157,0.15)]"
            >
              <MapPin className="w-4 h-4 text-[#00ff9d]" />
              ACTIVATE LIVE DEVICE GPS LOCK
            </button>
          </div>
        </div>
      )}
    </>
  );
};
