import {
  Incident,
  AssistanceRequest,
  Volunteer,
  Shelter,
  Resource,
  CommunityGroup,
  CommunityPost,
  SafetySummary,
  SafetyCheckin,
  AppNotification,
  FundCampaign,
  EmergencyContact,
  FloodReport,
  BroadcastAlert
} from '../types/index.js';
import { localStore } from './localStore.js';
import { supabase } from './supabase.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errBody.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.data !== undefined ? data.data : data;
}

// Wrapper for offline-first disaster resiliency
async function resilientCall<T>(
  fetcher: () => Promise<T>,
  fallback: () => T | Promise<T>,
  name: string
): Promise<T> {
  const hasCustomApi = Boolean(import.meta.env.VITE_API_URL);
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // On cloud deployments (Vercel, GitHub Pages, etc.) without an external API URL,
  // directly serve and mutate the rich in-browser disaster store for 0ms latency & 0 errors.
  if (!hasCustomApi && !isLocalDev) {
    return await fallback();
  }

  try {
    return await fetcher();
  } catch (err: any) {
    console.info(`📡 [NammaRescue Resilient Mode] Remote API unreachable for '${name}'. Serving synced local store.`);
    return await fallback();
  }
}

export const api = {
  // Incidents
  getIncidents: async (params?: { status?: string; type?: string; area?: string }) => {
    if (supabase) {
      let query = supabase.from('incidents').select('*');
      if (params?.status) query = query.eq('status', params.status);
      if (params?.type) query = query.eq('type', params.type);
      if (params?.area) query = query.ilike('address', `%${params.area}%`);
      const { data, error } = await query;
      if (error) console.error('Supabase getIncidents Error:', error);
      if (data) return data;
    }
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return resilientCall(
      () => fetchJSON<Incident[]>(`/incidents${qs}`),
      () => localStore.getIncidents(params),
      'getIncidents'
    );
  },
  getIncidentById: async (id: string) => {
    if (supabase) {
      const { data, error } = await supabase.from('incidents').select('*').eq('id', id).single();
      if (error) console.error('Supabase getIncidentById Error:', error);
      if (data) return data;
    }
    return resilientCall(
      () => fetchJSON<Incident>(`/incidents/${id}`),
      () => localStore.getIncidentById(id),
      'getIncidentById'
    );
  },
  createIncident: async (payload: Partial<Incident>) => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      let mappedType = 'other';
      const inputType = payload.type?.toLowerCase() || '';
      if (['flood', 'cyclone', 'fire', 'medical'].includes(inputType)) {
        mappedType = inputType;
      }

      const dbPayload: any = {
        reporter_id: user?.id || null,
        type: mappedType,
        severity: payload.severity?.toLowerCase() || 'medium',
        description: payload.description || '',
        latitude: payload.latitude || 0,
        longitude: payload.longitude || 0,
        address: payload.area || '', // map area to address
        photo_url: payload.photo_url || null,
        status: 'reported'
      };
      
      const { data, error } = await supabase.from('incidents').insert(dbPayload).select().single();
      if (error) {
        console.error('Supabase createIncident Error:', error);
        throw error;
      }
      return data;
    }
    return resilientCall(
      () => fetchJSON<Incident>('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createIncident(payload),
      'createIncident'
    );
  },
  updateIncident: async (id: string, payload: Partial<Incident>) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('incidents')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase updateIncident Error:', error);
        throw error;
      }
      return data;
    }
    return resilientCall(
      () => fetchJSON<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      () => localStore.updateIncident(id, payload),
      'updateIncident'
    );
  },

  // Flood Reports
  getFloodReports: () =>
    resilientCall(
      () => fetchJSON<FloodReport[]>('/flood-reports'),
      () => localStore.getFloodReports(),
      'getFloodReports'
    ),
  createFloodReport: (payload: Partial<FloodReport>) =>
    resilientCall(
      () =>
        fetchJSON<{ flood_report: FloodReport; incident: Incident }>('/flood-reports', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => localStore.createFloodReport(payload),
      'createFloodReport'
    ),

  // Assistance Requests
  getAssistanceRequests: async (params?: { status?: string; category?: string; area?: string }) => {
    if (supabase) {
      let query = supabase.from('aid_requests').select('*, incidents(*)');
      if (params?.status) query = query.eq('status', params.status.toLowerCase());
      if (params?.category) query = query.eq('need_type', params.category.toLowerCase());
      const { data, error } = await query;
      if (error) console.error('Supabase getAssistanceRequests Error:', error);
      if (data) {
        return data.map((row: any) => ({
          id: row.id,
          category: row.need_type?.toUpperCase() || 'OTHER',
          severity: row.incidents?.severity?.toUpperCase() || 'HIGH',
          description: row.incidents?.description || 'Assistance Needed',
          area: row.incidents?.address || 'Unknown Area',
          status: row.status?.toUpperCase() || 'PENDING',
          latitude: row.incidents?.latitude || 0,
          longitude: row.incidents?.longitude || 0,
          citizen_name: 'Citizen', // Mocked or fetch from profiles if joined
          citizen_id: row.requester_id || 'user-1',
          citizen_phone: '+91 9999999999',
          created_at: row.created_at,
          updated_at: row.updated_at || row.created_at
        }));
      }
    }
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return resilientCall(
      () => fetchJSON<AssistanceRequest[]>(`/assistance${qs}`),
      () => localStore.getAssistanceRequests(params),
      'getAssistanceRequests'
    );
  },
  createAssistanceRequest: async (payload: Partial<AssistanceRequest>) => {
    if (supabase) {
      // Because the aid_requests schema requires an incident_id for location, 
      // but the UI doesn't supply it, we will first create an incident, then link it!
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const incidentPayload = {
        reporter_id: user?.id || null,
        type: 'medical', // generic fallback type
        severity: payload.severity?.toLowerCase() || 'high',
        description: payload.description || 'Assistance Request',
        latitude: payload.latitude || 0,
        longitude: payload.longitude || 0,
        address: payload.area || '',
        status: 'reported'
      };
      const incidentRes = await supabase.from('incidents').insert(incidentPayload).select().single();
      if (incidentRes.error) {
        console.error('Failed to create parent incident for aid request:', incidentRes.error);
        throw incidentRes.error;
      }

      let mappedNeedType = 'other';
      const inputNeedType = payload.category?.toLowerCase() || '';
      if (['food', 'water', 'boat', 'medical', 'shelter'].includes(inputNeedType)) {
        mappedNeedType = inputNeedType;
      }

      const dbPayload = {
        requester_id: user?.id || null,
        incident_id: incidentRes.data.id,
        need_type: mappedNeedType,
        status: 'pending',
      };
      const { data, error } = await supabase.from('aid_requests').insert(dbPayload).select().single();
      if (error) {
        console.error('Supabase createAssistanceRequest Error:', error);
        throw error;
      }
      return data;
    }
    return resilientCall(
      () => fetchJSON<AssistanceRequest>('/assistance', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createAssistanceRequest(payload),
      'createAssistanceRequest'
    );
  },
  acceptAssistanceRequest: (
    id: string,
    payload: { volunteer_id: string; volunteer_name: string; volunteer_phone?: string }
  ) =>
    resilientCall(
      () =>
        fetchJSON<AssistanceRequest>(`/assistance/${id}/accept`, {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => localStore.acceptAssistanceRequest(id, payload),
      'acceptAssistanceRequest'
    ),
  updateAssistanceStatus: (id: string, status: string, note?: string) =>
    resilientCall(
      () =>
        fetchJSON<AssistanceRequest>(`/assistance/${id}/status`, {
          method: 'POST',
          body: JSON.stringify({ status, note })
        }),
      () => localStore.updateAssistanceStatus(id, status as any),
      'updateAssistanceStatus'
    ),

  // Volunteers
  getVolunteers: () =>
    resilientCall(
      () => fetchJSON<Volunteer[]>('/volunteers'),
      () => localStore.getVolunteers(),
      'getVolunteers'
    ),
  registerVolunteer: (payload: Partial<Volunteer>) =>
    resilientCall(
      () => fetchJSON<Volunteer>('/volunteers', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.registerVolunteer(payload),
      'registerVolunteer'
    ),
  matchVolunteers: (payload: { category: string; area: string; latitude?: number; longitude?: number }) =>
    resilientCall(
      () => fetchJSON<Volunteer[]>('/volunteers/match', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.matchVolunteers(payload),
      'matchVolunteers'
    ),

  // Resources
  getResources: (params?: { category?: string; area?: string; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return resilientCall(
      () => fetchJSON<Resource[]>(`/resources${qs}`),
      () => localStore.getResources(params),
      'getResources'
    );
  },
  createResource: (payload: Partial<Resource>) =>
    resilientCall(
      () => fetchJSON<Resource>('/resources', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createResource(payload),
      'createResource'
    ),
  updateResource: (id: string, payload: { quantity?: number; status?: string }) =>
    resilientCall(
      () => fetchJSON<Resource>(`/resources/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      () => localStore.updateResource(id, payload),
      'updateResource'
    ),

  // Shelters
  getShelters: () =>
    resilientCall(
      () => fetchJSON<Shelter[]>('/shelters'),
      () => localStore.getShelters(),
      'getShelters'
    ),
  updateShelter: (id: string, payload: { current_occupancy?: number; change_delta?: number; status?: string }) =>
    resilientCall(
      () => fetchJSON<Shelter>(`/shelters/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      () => localStore.updateShelter(id, payload),
      'updateShelter'
    ),

  // Community
  getCommunityGroups: () =>
    resilientCall(
      () => fetchJSON<CommunityGroup[]>('/community/groups'),
      () => localStore.getCommunityGroups(),
      'getCommunityGroups'
    ),
  getCommunityPosts: (community_id?: string) => {
    const qs = community_id ? `?community_id=${community_id}` : '';
    return resilientCall(
      () => fetchJSON<CommunityPost[]>(`/community/posts${qs}`),
      () => localStore.getCommunityPosts(community_id),
      'getCommunityPosts'
    );
  },
  createCommunityPost: (payload: Partial<CommunityPost>) =>
    resilientCall(
      () => fetchJSON<CommunityPost>('/community/posts', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createCommunityPost(payload),
      'createCommunityPost'
    ),

  // Safety
  getSafetyStats: (community_id?: string) => {
    const qs = community_id ? `?community_id=${community_id}` : '';
    return resilientCall(
      () => fetchJSON<{ summary: SafetySummary; checkins: SafetyCheckin[] }>(`/safety${qs}`),
      () => localStore.getSafetyStats(community_id),
      'getSafetyStats'
    );
  },
  submitSafetyCheckin: (payload: Partial<SafetyCheckin>) =>
    resilientCall(
      () =>
        fetchJSON<{ checkin: SafetyCheckin; summary: SafetySummary }>('/safety/checkin', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => localStore.submitSafetyCheckin(payload),
      'submitSafetyCheckin'
    ),
  triggerSafetyPoll: (payload: { community_id: string; area: string }) =>
    resilientCall(
      () => fetchJSON<{ success: boolean }>('/safety/trigger-poll', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.triggerSafetyPoll(payload),
      'triggerSafetyPoll'
    ),

  // Alerts
  getAlerts: async () => {
    if (supabase) {
      const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      if (error) console.error('Supabase getAlerts Error:', error);
      if (data) return data;
    }
    return [];
  },
  createAlert: async (payload: Partial<BroadcastAlert>) => {
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const dbPayload = {
        created_by: user?.id || null,
        title: payload.title,
        message: payload.description,
        area: payload.area,
        severity: payload.severity === 'EMERGENCY' ? 'critical' : payload.severity === 'WARNING' ? 'warning' : 'info'
      };
      const { data, error } = await supabase.from('alerts').insert(dbPayload).select().single();
      if (error) {
        console.error('Supabase createAlert Error:', error);
        throw error;
      }
      return data;
    }
    return null;
  },

  // Notifications
  getNotifications: (user_id?: string) => {
    const qs = user_id ? `?user_id=${user_id}` : '';
    return resilientCall(
      () => fetchJSON<AppNotification[]>(`/notifications${qs}`),
      () => localStore.getNotifications(user_id),
      'getNotifications'
    );
  },
  markNotificationRead: (id: string) =>
    resilientCall(
      () => fetchJSON<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
      () => localStore.markNotificationRead(id),
      'markNotificationRead'
    ),
  markAllNotificationsRead: (user_id?: string) =>
    resilientCall(
      () => fetchJSON<{ success: boolean }>('/notifications/read-all', { method: 'POST', body: JSON.stringify({ user_id }) }),
      () => localStore.markAllNotificationsRead(user_id),
      'markAllNotificationsRead'
    ),

  // Funds
  getFunds: () =>
    resilientCall(
      () => fetchJSON<{ campaigns: FundCampaign[]; donations: any[]; disclaimer: string }>('/funds'),
      () => localStore.getFunds(),
      'getFunds'
    ),
  donate: (payload: { campaign_id: string; donor_name: string; donor_email?: string; amount: number }) =>
    resilientCall(
      () =>
        fetchJSON<{ donation: any; campaign: FundCampaign }>('/funds/donate', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => localStore.donate(payload),
      'donate'
    ),

  // Emergency Contacts
  getContacts: (user_id?: string) => {
    const qs = user_id ? `?user_id=${user_id}` : '';
    return resilientCall(
      () => fetchJSON<EmergencyContact[]>(`/contacts${qs}`),
      () => localStore.getContacts(user_id),
      'getContacts'
    );
  },
  addContact: (payload: Partial<EmergencyContact>) =>
    resilientCall(
      () => fetchJSON<EmergencyContact>('/contacts', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.addContact(payload),
      'addContact'
    ),

  // Auth & Demo switcher
  demoSwitch: (role: string, id?: string) =>
    resilientCall(
      () =>
        fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/demo-switch', {
          method: 'POST',
          body: JSON.stringify({ role, id })
        }),
      () => localStore.demoSwitch(role, id),
      'demoSwitch'
    ),
  login: (email: string) =>
    resilientCall(
      () =>
        fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email })
        }),
      () => localStore.login(email),
      'login'
    ),
  signup: (payload: any) =>
    resilientCall(
      () =>
        fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => localStore.signup(payload),
      'signup'
    ),
  getMe: async (user_id?: string) => {
    if (supabase && user_id) {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', user_id).single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user_id,
          name: 'New Citizen',
          role: 'citizen',
          language: 'ta',
          area: 'Chennai'
        };
        const insertRes = await supabase.from('profiles').insert(newProfile).select().single();
        if (insertRes.error) {
           console.error('Supabase Profile Creation Error:', insertRes.error);
        } else {
           data = insertRes.data;
        }
      } else if (error) {
        console.error('Supabase getMe Error:', error);
      }
      return { user: { id: user_id }, profile: data };
    }

    const qs = user_id ? `?user_id=${user_id}` : '';
    return resilientCall(
      () => fetchJSON<any>(`/auth/me${qs}`),
      () => localStore.getMe(user_id),
      'getMe'
    );
  },
  updateProfile: async (payload: any) => {
    if (supabase && payload.user_id) {
      const { user_id, ...updates } = payload;
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user_id)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase updateProfile Error:', error);
        throw error;
      }
      return { profile: data };
    }
    return resilientCall(
      () => fetchJSON<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
      () => localStore.updateProfile(payload),
      'updateProfile'
    );
  },

  // Media Upload (multipart)
  uploadFile: async (file: File | Blob, filename = 'recording.webm') => {
    return resilientCall(
      async () => {
        const formData = new FormData();
        formData.append('file', file, filename);
        const res = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Remote upload failed');
        const data = await res.json();
        return data.data as { url: string; filename: string; mimetype: string; size: number };
      },
      () => localStore.uploadFile(file, filename),
      'uploadFile'
    );
  }
};
