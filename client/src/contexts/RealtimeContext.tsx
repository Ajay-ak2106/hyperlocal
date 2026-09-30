import React, { createContext, useContext, useState, useEffect } from 'react';
import { realtimeService } from '../services/realtime.js';
import { api } from '../services/api.js';
import { AppNotification } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { supabase } from '../services/supabase.js';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'safety' | 'info' | 'success';
}

interface RealtimeContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastMessage[];
  lastRealtimeEvent: string | null;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<string | null>(null);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications(user?.id);
      setNotifications(data);
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user?.id]);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to real-time events from server WebSocket or Supabase
  useEffect(() => {
    let channels: any[] = [];
    let unsubInc: any, unsubIncUp: any, unsubReq: any, unsubReqUp: any, unsubFlood: any, unsubNotif: any, unsubSafety: any, unsubShelter: any, unsubResource: any, unsubPost: any;

    if (supabase) {
      // Supabase Realtime
      const incidentChannel = supabase.channel('public:incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload: any) => {
          setLastRealtimeEvent(`INCIDENT_${payload.new?.id || payload.old?.id}_${Date.now()}`);
          if (payload.eventType === 'INSERT') {
            addToast(
              `🚨 New Incident: ${payload.new.type}`,
              `${payload.new.area}: ${payload.new.description}`,
              'emergency'
            );
          } else if (payload.eventType === 'UPDATE') {
            addToast(
              `Incident Status Updated: ${payload.new.status}`,
              `${payload.new.area} - Verification: ${payload.new.verification_status || 'updated'}`,
              'info'
            );
          }
        })
        .subscribe();

      const aidChannel = supabase.channel('public:aid_requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aid_requests' }, (payload: any) => {
          setLastRealtimeEvent(`AID_${payload.new?.id || payload.old?.id}_${Date.now()}`);
          if (payload.eventType === 'INSERT') {
            addToast(
              `🆘 Help Needed: ${payload.new.need_type}`,
              `${payload.new.category || 'Request'} in ${payload.new.area || 'Local'}`,
              'emergency'
            );
          } else if (payload.eventType === 'UPDATE') {
            let toastType: ToastMessage['type'] = 'info';
            if (payload.new.status === 'assigned') toastType = 'success';
            if (payload.new.status === 'completed') toastType = 'safety';
            addToast(
              `Assistance: ${payload.new.status}`,
              `Area: ${payload.new.area || 'Local'}`,
              toastType
            );
          }
        })
        .subscribe();

      const alertsChannel = supabase.channel('public:alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload: any) => {
          addToast(`⚠️ ALERT: ${payload.new.title}`, payload.new.message, 'emergency');
        })
        .subscribe();

      channels = [incidentChannel, aidChannel, alertsChannel];
    } else {
      // Fallback local WebSockets
    // 1. Incident Insert
    unsubInc = realtimeService.subscribe('INCIDENTS_INSERT', (payload) => {
      setLastRealtimeEvent(`INCIDENT_${payload.id}_${Date.now()}`);
      addToast(
        `🚨 New Incident: ${payload.type}`,
        `${payload.area}: ${payload.description}`,
        'emergency'
      );
    });

    // 2. Incident Update
    unsubIncUp = realtimeService.subscribe('INCIDENTS_UPDATE', (payload) => {
      setLastRealtimeEvent(`INCIDENT_UPD_${payload.id}_${Date.now()}`);
      addToast(
        `Incident Status Updated: ${payload.status}`,
        `${payload.area} - Verification: ${payload.verification_status}`,
        'info'
      );
    });

    // 3. Assistance Request Insert
    unsubReq = realtimeService.subscribe('ASSISTANCE_REQUESTS_INSERT', (payload) => {
      setLastRealtimeEvent(`ASSISTANCE_${payload.id}_${Date.now()}`);
      addToast(
        `🆘 Help Needed: ${payload.category}`,
        `${payload.citizen_name} in ${payload.area}: ${payload.description}`,
        'emergency'
      );
    });

    // 4. Assistance Request Update (Volunteer Accept, In Progress, Completed)
    unsubReqUp = realtimeService.subscribe('ASSISTANCE_REQUESTS_UPDATE', (payload) => {
      setLastRealtimeEvent(`ASSISTANCE_UPD_${payload.id}_${Date.now()}`);
      let toastType: ToastMessage['type'] = 'info';
      if (payload.status === 'ACCEPTED') toastType = 'success';
      if (payload.status === 'COMPLETED') toastType = 'safety';

      addToast(
        `Assistance: ${payload.status}`,
        `Volunteer: ${payload.assigned_volunteer_name || 'Assigned'} | Area: ${payload.area}`,
        toastType
      );
    });

    // 5. Flood Report Insert
    unsubFlood = realtimeService.subscribe('FLOOD_REPORTS_INSERT', (payload) => {
      setLastRealtimeEvent(`FLOOD_${payload.id}_${Date.now()}`);
      addToast(
        `🌊 Flood Report: ${payload.area}`,
        `${payload.condition.replace(/_/g, ' ')} (${payload.water_level_estimate || 'Active'})`,
        'emergency'
      );
    });

    // 6. Notifications Insert
    unsubNotif = realtimeService.subscribe('NOTIFICATIONS_INSERT', (payload) => {
      fetchNotifs();
      addToast(payload.title, payload.message, 'info');
    });

    // 7. Safety Check-in Update
    unsubSafety = realtimeService.subscribe('SAFETY_CHECKINS_UPDATE', (payload) => {
      setLastRealtimeEvent(`SAFETY_${Date.now()}`);
      if (payload.checkin) {
        addToast(
          `Safety Status: ${payload.checkin.status}`,
          `${payload.checkin.user_name} in ${payload.checkin.area}`,
          payload.checkin.status === 'SAFE' ? 'safety' : 'emergency'
        );
      }
    });

    // 8. Shelter Update
    unsubShelter = realtimeService.subscribe('SHELTERS_UPDATE', (payload) => {
      setLastRealtimeEvent(`SHELTER_${payload.id}_${Date.now()}`);
    });

    // 9. Resource Update
    unsubResource = realtimeService.subscribe('RESOURCES_UPDATE', (payload) => {
      setLastRealtimeEvent(`RESOURCE_${payload.id}_${Date.now()}`);
    });

    // 10. Community Posts Insert
    unsubPost = realtimeService.subscribe('COMMUNITY_POSTS_INSERT', (payload) => {
      setLastRealtimeEvent(`POST_${payload.id}_${Date.now()}`);
    });
    }

    // Also listen to local in-browser disaster sync events (offline resilience)
    const handleLocalEvent = (e: any) => {
      const { event, data } = e.detail || {};
      setLastRealtimeEvent(`${event}_${Date.now()}`);
      if (event === 'INCIDENT_CREATED') {
        addToast(`🚨 Incident Logged: ${data.type || 'Emergency'}`, `${data.area || 'Local'}: ${data.description || 'Emergency reported'}`, 'emergency');
      } else if (event === 'ASSISTANCE_REQUEST_CREATED') {
        addToast(`🆘 Emergency Request: ${data.category}`, `${data.citizen_name || 'Resident'} in ${data.area || 'Local'}`, 'emergency');
      } else if (event === 'SAFETY_CHECKIN_SUBMITTED') {
        addToast(`✅ Safety Check-In`, `${data.checkin?.user_name || 'Resident'} marked: ${data.checkin?.status}`, 'safety');
      }
    };
    window.addEventListener('namma-realtime', handleLocalEvent);

    return () => {
      window.removeEventListener('namma-realtime', handleLocalEvent);
      if (supabase) {
        channels.forEach(ch => supabase?.removeChannel(ch));
      } else {
        unsubInc();
        unsubIncUp();
        unsubReq();
        unsubReqUp();
        unsubFlood();
        unsubNotif();
        unsubSafety();
        unsubShelter();
        unsubResource();
        unsubPost();
      }
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <RealtimeContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        lastRealtimeEvent,
        addToast,
        removeToast,
        markAsRead,
        markAllRead,
        refreshNotifications: fetchNotifs
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
