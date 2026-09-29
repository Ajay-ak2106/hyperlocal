import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { User, Phone, MapPin, Globe, Shield, LifeBuoy, CheckCircle2, UserCheck, Key, ShieldAlert } from 'lucide-react';
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

  const demoAccounts: { role: UserRole; email: string; name: string; desc: string; icon: any; color: string }[] = [
    { role: 'CITIZEN', email: 'demo.citizen@example.com', name: 'Kavitha Ramachandran', desc: 'Resident in Velachery low-lying area', icon: User, color: 'text-emerald-400' },
    { role: 'VOLUNTEER', email: 'demo.volunteer@example.com', name: 'Senthil Kumar', desc: 'Certified Swift Water Rescue & Boat Operator', icon: LifeBuoy, color: 'text-sky-400' },
    { role: 'COMMUNITY_COORDINATOR', email: 'muthu.citizen@example.com', name: 'Muthukumar S', desc: 'Ward Safety Coordinator Tambaram', icon: Shield, color: 'text-amber-400' },
    { role: 'ADMIN', email: 'demo.admin@example.com', name: 'State Disaster Ops HQ', desc: 'GCC Disaster Verification & Control', icon: ShieldAlert, color: 'text-red-400' },
  ];

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-4xl mx-auto space-y-5">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            {language === 'ta' ? 'சுயவிவரம் & அமைப்புகள்' : 'Profile & Settings'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'ta'
              ? 'உங்கள் தொடர்பு விவரங்கள், பகுதி மற்றும் மொழி விருப்பங்கள்.'
              : 'Manage your contact details, locality, and emergency contact preferences.'}
          </p>
        </div>
      </div>

      {/* Role Switcher Section */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Switch Role (Test Demonstration)</span>
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-emerald-300 border border-slate-700">
            Current: {role}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoAccounts.map((acc) => {
            const isCurrent = role === acc.role;
            const Icon = acc.icon;
            return (
              <div
                key={acc.role}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-900 border-emerald-500 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${acc.color}`} />
                    <span className="text-xs font-bold uppercase text-white">
                      {acc.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-white">{acc.name}</div>
                <div className="text-[11px] text-slate-400">{acc.email}</div>
                <p className="text-[11px] text-slate-300 mt-1">{acc.desc}</p>

                {!isCurrent && (
                  <button
                    onClick={() => switchDemoRole(acc.role)}
                    className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-xs font-semibold text-slate-200 transition-colors active:scale-95"
                  >
                    Switch to this role
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Update Contact & Locality Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Locality / Ward</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Language</label>
            <select
              value={prefLang}
              onChange={(e: any) => setPrefLang(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Profile updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};
