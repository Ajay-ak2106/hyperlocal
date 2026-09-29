import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Volunteer, UserRole, Language } from '../types/index.js';
import { api } from '../services/api.js';
import { ta } from '../translations/ta.js';
import { en } from '../translations/en.js';
import { getAreaLocation } from '../constants/areas.js';

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
  updateProfile: (updates: Partial<Profile>) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [language, setLanguage] = useState<Language>('ta');
  const [currentArea, setCurrentAreaState] = useState<string>('Velachery');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9785,
    longitude: 80.2215 // Default Velachery, Chennai
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Initialize from storage or defaults on launch
  useEffect(() => {
    // 1. Check if user already exists in storage or session
    api.getMe().then((res) => {
      if (res && res.user && res.profile) {
        setUser(res.user);
        setProfile(res.profile);
        setVolunteer(res.volunteer || null);
        setRole(res.user.role || 'CITIZEN');
        
        const savedArea = localStorage.getItem('namma_selected_area') || res.profile.area;
        if (savedArea) {
          const loc = getAreaLocation(savedArea);
          setCurrentAreaState(loc.name);
          setCoords({ latitude: loc.latitude, longitude: loc.longitude });
        }
        if (res.profile.preferred_language) {
          setLanguage(res.profile.preferred_language as Language);
        }
      } else {
        switchDemoRole('CITIZEN');
      }
    }).catch(() => {
      switchDemoRole('CITIZEN');
    });

    // 2. Load saved area or attempt GPS
    const savedArea = localStorage.getItem('namma_selected_area');
    if (savedArea) {
      const loc = getAreaLocation(savedArea);
      setCurrentAreaState(loc.name);
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });
    } else {
      requestGps();
    }
  }, []);

  const setCurrentArea = (area: string) => {
    const loc = getAreaLocation(area);
    setCurrentAreaState(loc.name);
    setCoords({ latitude: loc.latitude, longitude: loc.longitude });
    setGpsActive(false);
    localStorage.setItem('namma_selected_area', loc.name);

    if (profile) {
      setProfile((prev) => (prev ? { ...prev, area: loc.name } : null));
      api.updateProfile({ user_id: user?.id, area: loc.name }).catch(() => {});
    }
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    try {
      const res = await api.demoSwitch(targetRole);
      setUser(res.user);
      setProfile(res.profile);
      setVolunteer(res.volunteer || null);
      setRole(targetRole);
      
      const targetArea = localStorage.getItem('namma_selected_area') || res.profile?.area || 'Velachery';
      const loc = getAreaLocation(targetArea);
      setCurrentAreaState(loc.name);
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });

      if (res.profile?.preferred_language) {
        setLanguage(res.profile.preferred_language as Language);
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await api.getMe(user.id);
      if (res) {
        setUser(res.user || user);
        setProfile(res.profile || profile);
        setVolunteer(res.volunteer || null);
        if (res.profile?.area) {
          const loc = getAreaLocation(res.profile.area);
          setCurrentAreaState(loc.name);
          setCoords({ latitude: loc.latitude, longitude: loc.longitude });
        }
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const res = await api.updateProfile({ user_id: user?.id, ...updates });
      const updatedProfile = res?.profile || res?.data || (profile ? { ...profile, ...updates } : updates);
      setProfile(updatedProfile);

      if (updates.name && user) {
        setUser({ ...user, name: updates.name } as any);
      }
      if (updates.area) {
        const loc = getAreaLocation(updates.area);
        setCurrentAreaState(loc.name);
        setCoords({ latitude: loc.latitude, longitude: loc.longitude });
        localStorage.setItem('namma_selected_area', loc.name);
      }
      if (updates.preferred_language) {
        setLanguage(updates.preferred_language as Language);
      }
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile in context:', err);
      throw err;
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'ta' ? 'en' : 'ta';
      if (profile) {
        updateProfile({ preferred_language: next }).catch(() => {});
      }
      return next;
    });
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
          console.log('GPS unavailable or denied, keeping selected area coords:', err.message);
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
        updateProfile,
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
