import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Volunteer, UserRole, Language } from '../types/index.js';
import { api } from '../services/api.js';
import { ta } from '../translations/ta.js';
import { en } from '../translations/en.js';
import { getAreaLocation, findNearestArea, reverseGeocode } from '../constants/areas.js';

export type GpsStatus = 'idle' | 'locating' | 'active' | 'denied' | 'error';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  volunteer: Volunteer | null;
  role: UserRole;
  language: Language;
  currentArea: string;
  coords: { latitude: number; longitude: number };
  gpsActive: boolean;
  gpsStatus: GpsStatus;
  gpsError: string | null;
  gpsAccuracy: number | null;
  t: typeof en;
  switchDemoRole: (role: UserRole) => Promise<void>;
  toggleLanguage: () => void;
  setCurrentArea: (area: string) => void;
  setCustomLocation: (area: string, coords: { latitude: number; longitude: number }) => void;
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
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

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
    const savedGps = localStorage.getItem('namma_gps_coords');
    if (savedGps) {
      try {
        const parsed = JSON.parse(savedGps);
        if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setCoords(parsed);
          setGpsActive(true);
          setGpsStatus('active');
          if (savedArea) {
            setCurrentAreaState(savedArea);
          }
          return;
        }
      } catch {}
    }

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
    setGpsStatus('idle');
    setGpsError(null);
    localStorage.setItem('namma_selected_area', loc.name);
    localStorage.removeItem('namma_gps_coords');

    if (profile) {
      setProfile((prev) => (prev ? { ...prev, area: loc.name } : null));
      api.updateProfile({ user_id: user?.id, area: loc.name }).catch(() => {});
    }
  };

  const setCustomLocation = (area: string, customCoords: { latitude: number; longitude: number }) => {
    setCurrentAreaState(area);
    setCoords(customCoords);
    setGpsActive(false);
    setGpsStatus('idle');
    setGpsError(null);
    localStorage.setItem('namma_selected_area', area);
    localStorage.setItem('namma_gps_coords', JSON.stringify(customCoords));

    if (profile) {
      setProfile((prev) => (prev ? { ...prev, area } : null));
      api.updateProfile({ user_id: user?.id, area }).catch(() => {});
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

  const requestGps = async (): Promise<void> => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsError('Geolocation is not supported by your browser');
      setGpsActive(false);
      return;
    }

    setGpsStatus('locating');
    setGpsError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 0);

          setCoords({ latitude: lat, longitude: lng });
          setGpsActive(true);
          setGpsStatus('active');
          setGpsAccuracy(accuracy);
          setGpsError(null);

          // Reverse geocode to find friendly area name or nearest Chennai area
          try {
            const geo = await reverseGeocode(lat, lng);
            const identifiedArea = geo.areaName || findNearestArea(lat, lng).name;
            setCurrentAreaState(identifiedArea);
            localStorage.setItem('namma_selected_area', identifiedArea);
          } catch {
            const nearest = findNearestArea(lat, lng);
            setCurrentAreaState(nearest.name);
            localStorage.setItem('namma_selected_area', nearest.name);
          }

          localStorage.setItem('namma_gps_coords', JSON.stringify({ latitude: lat, longitude: lng }));
          resolve();
        },
        (err) => {
          console.warn('GPS location request error:', err.message);
          setGpsActive(false);
          const isDenied = err.code === 1; // PERMISSION_DENIED
          setGpsStatus(isDenied ? 'denied' : 'error');
          setGpsError(
            isDenied
              ? 'GPS permission denied. Please allow location access or select your locality manually.'
              : 'Unable to retrieve location accurately. Please try again or choose an area.'
          );
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
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
        gpsStatus,
        gpsError,
        gpsAccuracy,
        t,
        switchDemoRole,
        toggleLanguage,
        setCurrentArea,
        setCustomLocation,
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
