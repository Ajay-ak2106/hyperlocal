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
  ChevronDown,
  Loader2,
  AlertCircle,
  Crosshair,
  Search,
  Navigation
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';
import { CHENNAI_AREAS } from '../../constants/areas.js';

export const Header: React.FC = () => {
  const {
    role,
    language,
    currentArea,
    coords,
    gpsActive,
    gpsStatus,
    gpsError,
    gpsAccuracy,
    switchDemoRole,
    toggleLanguage,
    setCurrentArea,
    setCustomLocation,
    requestGps
  } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useRealtime();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [areaFilterQuery, setAreaFilterQuery] = useState('');
  const [customLocalityText, setCustomLocalityText] = useState('');
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

              {/* Location Status & Area Selector Button */}
              <button
                onClick={() => setShowAreaModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors mt-0.5 group"
                title="View Location Status / Select Locality"
              >
                {gpsStatus === 'locating' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ta' ? 'GPS கண்டறிகிறது...' : 'Locating...'}</span>
                  </span>
                ) : (
                  <>
                    <span className="relative flex items-center justify-center">
                      <MapPin className={`w-3.5 h-3.5 ${gpsActive ? 'text-emerald-400' : 'text-sky-400'}`} />
                      {gpsActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </span>
                    <span className="font-semibold underline decoration-dotted decoration-slate-500 group-hover:text-emerald-400">
                      {currentArea}
                    </span>
                    {gpsActive && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        GPS
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                  </>
                )}
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

      {/* Area & Location Management Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ta' ? 'இருப்பிட நிலை & பகுதி தேர்வு' : 'Location Status & Area Selection'}</span>
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Live Device GPS Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 mb-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>{language === 'ta' ? 'சாதன GPS நிலை' : 'Device GPS Status'}</span>
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                  gpsActive
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : gpsStatus === 'locating'
                    ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                    : gpsStatus === 'denied'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    gpsActive ? 'bg-emerald-400 animate-pulse' : gpsStatus === 'locating' ? 'bg-sky-400 animate-spin' : 'bg-slate-400'
                  }`}></span>
                  <span>
                    {gpsActive
                      ? (language === 'ta' ? 'நேரலை GPS இயக்கத்தில்' : 'GPS Active & Synced')
                      : gpsStatus === 'locating'
                      ? (language === 'ta' ? 'இணைக்கிறது...' : 'Locating...')
                      : gpsStatus === 'denied'
                      ? (language === 'ta' ? 'அனுமதி மறுக்கப்பட்டது' : 'Permission Blocked')
                      : (language === 'ta' ? 'கைமுறை பகுதி' : 'Manual Mode')}
                  </span>
                </span>
              </div>

              {/* Coordinates and accuracy readout */}
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white text-[11px]">
                    📍 {currentArea}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {Number(coords.latitude).toFixed(5)}° N, {Number(coords.longitude).toFixed(5)}° E
                  </div>
                </div>
                {gpsAccuracy && gpsActive && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ±{gpsAccuracy}m precision
                  </span>
                )}
              </div>

              {gpsError && (
                <div className="p-2 rounded-lg bg-red-950/50 border border-red-800/40 text-red-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* One tap GPS button with spinner */}
              <button
                type="button"
                onClick={async () => {
                  await requestGps();
                  setShowAreaModal(false);
                }}
                disabled={gpsStatus === 'locating'}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {gpsStatus === 'locating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{language === 'ta' ? 'GPS இருப்பிடத்தை தேடுகிறது...' : 'Acquiring GPS Signal...'}</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-white" />
                    <span>{language === 'ta' ? 'என் நேரலை GPS-ஐ பயன்படுத்து' : 'Use Current Device GPS'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Locality Quick Search / Select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'ta' ? 'அல்லது சென்னைப் பகுதியை தேர்வு செய்க' : 'Or Select Locality Manually'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {CHENNAI_AREAS.length} zones
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={areaFilterQuery}
                  onChange={(e) => setAreaFilterQuery(e.target.value)}
                  placeholder={language === 'ta' ? 'பகுதியை தேடுக...' : 'Filter Chennai areas...'}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {CHENNAI_AREAS.filter(
                  (a) =>
                    a.name.toLowerCase().includes(areaFilterQuery.toLowerCase()) ||
                    a.nameTa.includes(areaFilterQuery) ||
                    a.zone.toLowerCase().includes(areaFilterQuery.toLowerCase())
                ).map((a) => (
                  <button
                    key={a.name}
                    onClick={() => {
                      setCurrentArea(a.name);
                      setShowAreaModal(false);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                      currentArea === a.name && !gpsActive
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white line-clamp-1">📍 {a.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{a.nameTa} • {a.zone}</div>
                  </button>
                ))}
              </div>

              {/* Custom Locality Option */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">
                  {language === 'ta' ? 'வேறு பகுதி அல்லது தெரு பெயர்:' : 'Other area or specific street:'}
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customLocalityText}
                    onChange={(e) => setCustomLocalityText(e.target.value)}
                    placeholder={language === 'ta' ? 'எ.கா: கிழக்கு தாம்பரம், மேடவாக்கம்...' : 'e.g. East Tambaram, Porur...'}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customLocalityText.trim()}
                    onClick={() => {
                      if (customLocalityText.trim()) {
                        setCurrentArea(customLocalityText.trim());
                        setShowAreaModal(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {language === 'ta' ? 'அமைக்க' : 'Set'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
