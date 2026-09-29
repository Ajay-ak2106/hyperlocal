import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Volunteer, UserRole, Language } from '../types/index.js';
import { api } from '../services/api.js';
import { ta } from '../translations/ta.js';
import { en } from '../translations/en.js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  volunteer: Volunteer | null;
  role: UserRole;
  language: Language;
  currentArea: string;
  coords: { latitude: number; longitude: number };
  gpsActive: boolean;
  t: typeof en;
  switchDemoRole: (role: UserRole) => Promise<void>;
  toggleLanguage: () => void;
  setCurrentArea: (area: string) => void;
  requestGps: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [language, setLanguage] = useState<Language>('ta'); // Default to Tamil as primary
  const [currentArea, setCurrentArea] = useState<string>('Velachery');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9780,
    longitude: 80.2210 // Default Velachery, Chennai
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Initialize with Citizen Demo Account on launch
  useEffect(() => {
    switchDemoRole('CITIZEN');
    requestGps();
  }, []);

  const switchDemoRole = async (targetRole: UserRole) => {
    try {
      const res = await api.demoSwitch(targetRole);
      setUser(res.user);
      setProfile(res.profile);
      setVolunteer(res.volunteer || null);
      setRole(targetRole);
      if (res.profile?.area) {
        setCurrentArea(res.profile.area);
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await api.getMe(user.id);
      setUser(res.user);
      setProfile(res.profile);
      setVolunteer(res.volunteer || null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ta' ? 'en' : 'ta'));
  };

  const requestGps = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setGpsActive(true);
        },
        (err) => {
          console.log('GPS denied or unavailable, using hyperlocal defaults:', err.message);
          setGpsActive(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const logout = () => {
    switchDemoRole('CITIZEN');
  };

  const t = language === 'ta' ? (ta as typeof en) : en;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        volunteer,
        role,
        language,
        currentArea,
        coords,
        gpsActive,
        t,
        switchDemoRole,
        toggleLanguage,
        setCurrentArea,
        requestGps,
        refreshProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
