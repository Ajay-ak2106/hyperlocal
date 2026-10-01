import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { User, Phone, MapPin, Globe, Shield, LifeBuoy, CheckCircle2, Key, ShieldAlert, Mail, LogOut } from 'lucide-react';
import { UserRole } from '../types/index.js';
import { CHENNAI_AREAS } from '../constants/areas.js';

export const ProfilePage: React.FC = () => {
  const { user, profile, role, language, switchDemoRole, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.name || 'Kavitha Ramachandran');
  const [mobile, setMobile] = useState(profile?.mobile_number || '+91 98765 43210');
  const [area, setArea] = useState(profile?.area || 'Velachery');
  const [prefLang, setPrefLang] = useState<'ta' | 'en'>(language);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync inputs whenever profile data loads or updates
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.mobile_number) setMobile(profile.mobile_number);
      if (profile.area) setArea(profile.area);
      if (profile.preferred_language) {
        setPrefLang(profile.preferred_language as 'ta' | 'en');
      }
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        mobile_number: mobile.trim(),
        area: area.trim(),
        preferred_language: prefLang
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Save profile failed: ' + (err.message || 'Unknown error'));
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

  const [authEmail, setAuthEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await useAuth().sendOtp(authEmail);
      setOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !otp) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await useAuth().verifyOtp(authEmail, otp);
      alert('Successfully logged in!');
      setOtpSent(false);
      setAuthEmail('');
      setOtp('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-4xl mx-auto space-y-5">
      {/* Real Email Auth Section */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800">Secure Account Access</h2>
        </div>
        
        {useAuth().user?.email && !useAuth().user?.email?.includes('demo') ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div>
              <p className="text-xs font-bold text-emerald-800">Authenticated as</p>
              <p className="text-sm text-emerald-900">{useAuth().user?.email}</p>
            </div>
            <button 
              onClick={() => useAuth().logout()}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">Enter your email to receive a secure One-Time Password. No passwords required.</p>
            {authError && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded">{authError}</p>}
            
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Sending...' : 'Send Magic OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Login Now'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            {language === 'ta' ? 'சுயவிவரம் & அமைப்புகள்' : 'Profile & Settings'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'ta'
              ? 'உங்கள் பெயர், தொடர்பு எண் மற்றும் வசிக்கும் பகுதியை இங்கு மாற்றிக் கொள்ளலாம்.'
              : 'Update your name, contact details, locality, and disaster language preferences.'}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-emerald-400 block">{profile?.name || name}</span>
          <span className="text-[11px] text-slate-500 block">📍 {profile?.area || area}</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-100/80 border border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ta' ? 'தனிநபர் விவரங்கள் & பகுதி' : 'Personal Details & Location'}</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            {language === 'ta' ? 'உடனடி சேமிப்பு' : 'Live Saved'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {language === 'ta' ? 'முழுப் பெயர்' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vishwa / Kavitha"
              required
              className="w-full rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {language === 'ta' ? 'கைபேசி எண்' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              required
              className="w-full rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          {/* Locality / Ward (Selection & Custom) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {language === 'ta' ? 'முதன்மை பகுதி / வட்டம்' : 'Main Locality / Area'}
            </label>
            <select
              value={CHENNAI_AREAS.some(a => a.name === area) ? area : 'CUSTOM'}
              onChange={(e) => {
                if (e.target.value !== 'CUSTOM') {
                  setArea(e.target.value);
                }
              }}
              className="w-full rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none transition-colors mb-2"
            >
              {CHENNAI_AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  📍 {a.name} ({a.nameTa}) - {a.zone}
                </option>
              ))}
              <option value="CUSTOM">✏️ {language === 'ta' ? 'வேறு பகுதி (கீழே தட்டச்சு செய்யவும்)' : 'Other Locality (Type below)'}</option>
            </select>

            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={language === 'ta' ? 'பகுதி பெயரை உள்ளிடவும்...' : 'Enter your area name...'}
              required
              className="w-full rounded-xl bg-white/80 backdrop-blur-md/90 border border-slate-700/80 px-3.5 py-2 text-xs text-slate-700 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {language === 'ta' ? 'விருப்பமான மொழி' : 'Preferred Language'}
            </label>
            <select
              value={prefLang}
              onChange={(e: any) => setPrefLang(e.target.value)}
              className="w-full rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none transition-colors"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ta'
                ? `சுயவிவரம் மாற்றப்பட்டது! பகுதி: ${area}`
                : `Profile & Location saved! Active area updated to ${area}.`}
            </span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-800 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <span>{language === 'ta' ? 'சேமிக்கப்படுகிறது...' : 'Saving...'}</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ta' ? 'விவரங்களைச் சேமி' : 'Save Profile Changes'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Role Switcher Section */}
      <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Switch Role (Test Demonstration)</span>
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-md text-emerald-300 border border-slate-700">
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
                    ? 'bg-white/80 backdrop-blur-md border-emerald-500 shadow-sm'
                    : 'bg-white/80 backdrop-blur-md/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${acc.color}`} />
                    <span className="text-xs font-bold uppercase text-slate-800">
                      {acc.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-800">{acc.name}</div>
                <div className="text-[11px] text-slate-500">{acc.email}</div>
                <p className="text-[11px] text-slate-600 mt-1">{acc.desc}</p>

                {!isCurrent && (
                  <button
                    onClick={() => switchDemoRole(acc.role)}
                    className="mt-3 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-slate-800 border border-slate-700 text-xs font-semibold text-slate-700 transition-colors active:scale-95"
                  >
                    Switch to this role
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
