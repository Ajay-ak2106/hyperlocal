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
  BroadcastAlert,
  AppNotification,
  FundCampaign,
  EmergencyContact,
  FloodReport
} from '../types/index.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errBody.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Incidents
  getIncidents: (params?: { status?: string; type?: string; area?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchJSON<Incident[]>(`/incidents${qs}`);
  },
  getIncidentById: (id: string) => fetchJSON<Incident>(`/incidents/${id}`),
  createIncident: (payload: Partial<Incident>) =>
    fetchJSON<Incident>('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  updateIncident: (id: string, payload: Partial<Incident>) =>
    fetchJSON<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Flood Reports
  getFloodReports: () => fetchJSON<FloodReport[]>('/flood-reports'),
  createFloodReport: (payload: Partial<FloodReport>) =>
    fetchJSON<{ flood_report: FloodReport; incident: Incident }>('/flood-reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Assistance Requests
  getAssistanceRequests: (params?: { status?: string; category?: string; area?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchJSON<AssistanceRequest[]>(`/assistance${qs}`);
  },
  createAssistanceRequest: (payload: Partial<AssistanceRequest>) =>
    fetchJSON<AssistanceRequest>('/assistance', { method: 'POST', body: JSON.stringify(payload) }),
  acceptAssistanceRequest: (id: string, payload: { volunteer_id: string; volunteer_name: string; volunteer_phone?: string }) =>
    fetchJSON<AssistanceRequest>(`/assistance/${id}/accept`, { method: 'POST', body: JSON.stringify(payload) }),
  updateAssistanceStatus: (id: string, status: string, note?: string) =>
    fetchJSON<AssistanceRequest>(`/assistance/${id}/status`, { method: 'POST', body: JSON.stringify({ status, note }) }),

  // Volunteers
  getVolunteers: () => fetchJSON<Volunteer[]>('/volunteers'),
  registerVolunteer: (payload: Partial<Volunteer>) =>
    fetchJSON<Volunteer>('/volunteers', { method: 'POST', body: JSON.stringify(payload) }),
  matchVolunteers: (payload: { category: string; area: string; latitude?: number; longitude?: number }) =>
    fetchJSON<Volunteer[]>('/volunteers/match', { method: 'POST', body: JSON.stringify(payload) }),

  // Resources
  getResources: (params?: { category?: string; area?: string; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchJSON<Resource[]>(`/resources${qs}`);
  },
  createResource: (payload: Partial<Resource>) =>
    fetchJSON<Resource>('/resources', { method: 'POST', body: JSON.stringify(payload) }),
  updateResource: (id: string, payload: { quantity?: number; status?: string }) =>
    fetchJSON<Resource>(`/resources/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Shelters
  getShelters: () => fetchJSON<Shelter[]>('/shelters'),
  updateShelter: (id: string, payload: { current_occupancy?: number; change_delta?: number; status?: string }) =>
    fetchJSON<Shelter>(`/shelters/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Community
  getCommunityGroups: () => fetchJSON<CommunityGroup[]>('/community/groups'),
  getCommunityPosts: (community_id?: string) => {
    const qs = community_id ? `?community_id=${community_id}` : '';
    return fetchJSON<CommunityPost[]>(`/community/posts${qs}`);
  },
  createCommunityPost: (payload: Partial<CommunityPost>) =>
    fetchJSON<CommunityPost>('/community/posts', { method: 'POST', body: JSON.stringify(payload) }),

  // Safety
  getSafetyStats: (community_id?: string) => {
    const qs = community_id ? `?community_id=${community_id}` : '';
    return fetchJSON<{ summary: SafetySummary; checkins: SafetyCheckin[] }>(`/safety${qs}`);
  },
  submitSafetyCheckin: (payload: Partial<SafetyCheckin>) =>
    fetchJSON<{ checkin: SafetyCheckin; summary: SafetySummary }>('/safety/checkin', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  triggerSafetyPoll: (payload: { community_id: string; area: string }) =>
    fetchJSON<{ success: boolean }>('/safety/trigger-poll', { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications
  getNotifications: (user_id?: string) => {
    const qs = user_id ? `?user_id=${user_id}` : '';
    return fetchJSON<AppNotification[]>(`/notifications${qs}`);
  },
  markNotificationRead: (id: string) => fetchJSON<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (user_id?: string) =>
    fetchJSON<{ success: boolean }>('/notifications/read-all', { method: 'POST', body: JSON.stringify({ user_id }) }),

  // Funds
  getFunds: () => fetchJSON<{ campaigns: FundCampaign[]; donations: any[]; disclaimer: string }>('/funds'),
  donate: (payload: { campaign_id: string; donor_name: string; donor_email?: string; amount: number }) =>
    fetchJSON<{ donation: any; campaign: FundCampaign }>('/funds/donate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Emergency Contacts
  getContacts: (user_id?: string) => {
    const qs = user_id ? `?user_id=${user_id}` : '';
    return fetchJSON<EmergencyContact[]>(`/contacts${qs}`);
  },
  addContact: (payload: Partial<EmergencyContact>) =>
    fetchJSON<EmergencyContact>('/contacts', { method: 'POST', body: JSON.stringify(payload) }),

  // Auth & Demo switcher
  demoSwitch: (role: string, id?: string) =>
    fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role, id })
    }),
  login: (email: string) =>
    fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  signup: (payload: any) =>
    fetchJSON<{ user: any; profile: any; volunteer?: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMe: (user_id?: string) => fetchJSON<any>(`/auth/me${user_id ? `?user_id=${user_id}` : ''}`),
  updateProfile: (payload: any) => fetchJSON<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  // Media Upload (multipart)
  uploadFile: async (file: File | Blob, filename = 'recording.webm') => {
    const formData = new FormData();
    formData.append('file', file, filename);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload media file');
    const data = await res.json();
    return data.data as { url: string; filename: string; mimetype: string; size: number };
  }
};
