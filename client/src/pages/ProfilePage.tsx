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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-rose-500" />
            My Emergency Profile & Credentials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted contact information used for automated rescue dispatch.
          </p>
        </div>
      </div>

      {/* Demo Switcher Quick-Access Section (Requirement #33 & #45) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-400" />
            🎬 One-Click Demo Role Accounts (Hackathon Prototype)
          </h2>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            DEMO DATA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoAccounts.map((acc) => {
            const isCurrent = role === acc.role;
            return (
              <div
                key={acc.role}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-rose-950/40 border-rose-600 ring-1 ring-rose-500 shadow-lg shadow-rose-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black uppercase text-white">
                    {acc.role.replace(/_/g, ' ')}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-200">{acc.name}</div>
                <div className="text-[11px] font-mono text-slate-400">{acc.email}</div>
                <p className="text-[11px] text-slate-500 mt-1">{acc.desc}</p>

                {!isCurrent && (
                  <button
                    onClick={() => switchDemoRole(acc.role)}
                    className="mt-3 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors active:scale-95"
                  >
                    Switch to {acc.role.replace(/_/g, ' ')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-black text-white">Contact & Location Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hyperlocal Ward / Area</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Language</label>
            <select
              value={prefLang}
              onChange={(e: any) => setPrefLang(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated and persisted to real database!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 font-extrabold text-xs text-white shadow-xl shadow-rose-950 active:scale-95 transition-all touch-target"
        >
          {saving ? 'Saving...' : 'SAVE PROFILE TO DATABASE'}
        </button>
      </form>
    </div>
  );
};
