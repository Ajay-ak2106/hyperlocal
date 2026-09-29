import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { User, Phone, MapPin, Globe, Shield, LifeBuoy, CheckCircle2, UserCheck, Key } from 'lucide-react';
import { UserRole } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, profile, role, language, switchDemoRole, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || 'Kavitha Ramachandran');
  const [mobile, setMobile] = useState(profile?.mobile_number || '+91 98765 43210');
  const [area, setArea] = useState(profile?.area || 'Velachery');
  const [prefLang, setPrefLang] = useState<'ta' | 'en'>(language);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      await api.updateProfile({
        user_id: user.id,
        name,
        mobile_number: mobile,
        area,
        preferred_language: prefLang
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert('Save profile failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const demoAccounts: { role: UserRole; email: string; name: string; desc: string }[] = [
    { role: 'CITIZEN', email: 'demo.citizen@example.com', name: 'Kavitha Ramachandran', desc: 'Family in Velachery low-lying zone' },
    { role: 'VOLUNTEER', email: 'demo.volunteer@example.com', name: 'Senthil Kumar', desc: 'Certified Swift Water Rescue & Boat Operator' },
    { role: 'COMMUNITY_COORDINATOR', email: 'muthu.citizen@example.com', name: 'Muthukumar S', desc: 'Ward Safety Coordinator Tambaram' },
    { role: 'ADMIN', email: 'demo.admin@example.com', name: 'TN State Emergency HQ', desc: 'Disaster Verification & Broadcast HQ' },
  ];

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-4xl mx-auto space-y-5">
      {/* Title */}
      <div className="bg-cyber-panel border border-cyber-green/40 p-5 rounded-2xl shadow-neon-green flex items-center justify-between relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

        <div>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-green/15 text-cyber-green border border-cyber-green/40 glow-text-green">
            [USER IDENTITY // DISASTER DISPATCH CREDS]
          </span>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2 mt-1">
            <User className="w-6 h-6 text-cyber-green" />
            OPERATIVE PROFILE & AUTH CREDENTIALS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Persisted contact telemetry used for automated rescue dispatch and SOS triangulation.
          </p>
        </div>
      </div>

      {/* Role Switcher Quick-Access Section */}
      <div className="p-5 rounded-xl bg-cyber-panel border border-cyber-border shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-cyber-cyan uppercase tracking-widest flex items-center gap-1.5 glow-text-cyan">
            <Key className="w-4 h-4 text-cyber-cyan" />
            OPERATIONAL CALLSIGN & ACCESS ROLE
          </h2>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyber-green/20 text-cyber-green border border-cyber-green/40">
            AUTHENTICATED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoAccounts.map((acc) => {
            const isCurrent = role === acc.role;
            return (
              <div
                key={acc.role}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyber-bg border-cyber-green shadow-neon-green ring-1 ring-cyber-green/50'
                    : 'bg-cyber-bg/60 border-cyber-border hover:border-cyber-green/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase text-white">
                    [{acc.role.replace(/_/g, ' ')}]
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-cyber-green flex items-center gap-1 glow-text-green">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE LINK
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-cyber-cyan">{acc.name}</div>
                <div className="text-[11px] font-mono text-slate-400">{acc.email}</div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">{acc.desc}</p>

                {!isCurrent && (
                  <button
                    onClick={() => switchDemoRole(acc.role)}
                    className="mt-3 w-full py-2 rounded bg-cyber-panel hover:bg-cyber-green hover:text-black border border-cyber-border text-xs font-bold text-slate-300 transition-colors active:scale-95"
                  >
                    ACTIVATE ROLE
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-cyber-panel border border-cyber-border shadow-xl space-y-4 font-mono">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase">&gt; UPDATE CONTACT & SECTOR TELEMETRY</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">CALLSIGN / FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-sans focus:border-cyber-green outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">CALLBACK PHONE FREQ</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-mono focus:border-cyber-green outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">GEO-SECTOR / WARD</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-sans focus:border-cyber-green outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">COMMUNICATION FREQ LANGUAGE</label>
            <select
              value={prefLang}
              onChange={(e: any) => setPrefLang(e.target.value)}
              className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-sans focus:border-cyber-green outline-none"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded bg-cyber-green/15 border border-cyber-green text-cyber-green text-xs font-bold flex items-center gap-2 glow-text-green">
            <CheckCircle2 className="w-4 h-4" />
            OPERATIVE PROFILE TRANSMITTED AND PERSISTED TO SECURE VAULT!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded bg-cyber-green text-black font-extrabold text-xs shadow-neon-green hover:brightness-110 active:scale-95 transition-all touch-target"
        >
          {saving ? 'SYNCHRONIZING...' : 'PERSIST PROFILE UPDATES'}
        </button>
      </form>
    </div>
  );
};
