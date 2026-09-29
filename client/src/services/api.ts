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
  FloodReport
} from '../types/index.js';
import { localStore } from './localStore.js';

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
  try {
    return await fetcher();
  } catch (err: any) {
    console.info(`📡 [NammaRescue Resilient Mode] Remote API unreachable for '${name}'. Serving synced local store.`);
    return await fallback();
  }
}

export const api = {
  // Incidents
  getIncidents: (params?: { status?: string; type?: string; area?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return resilientCall(
      () => fetchJSON<Incident[]>(`/incidents${qs}`),
      () => localStore.getIncidents(params),
      'getIncidents'
    );
  },
  getIncidentById: (id: string) =>
    resilientCall(
      () => fetchJSON<Incident>(`/incidents/${id}`),
      () => localStore.getIncidentById(id),
      'getIncidentById'
    ),
  createIncident: (payload: Partial<Incident>) =>
    resilientCall(
      () => fetchJSON<Incident>('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createIncident(payload),
      'createIncident'
    ),
  updateIncident: (id: string, payload: Partial<Incident>) =>
    resilientCall(
      () => fetchJSON<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      () => localStore.updateIncident(id, payload),
      'updateIncident'
    ),

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
  getAssistanceRequests: (params?: { status?: string; category?: string; area?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return resilientCall(
      () => fetchJSON<AssistanceRequest[]>(`/assistance${qs}`),
      () => localStore.getAssistanceRequests(params),
      'getAssistanceRequests'
    );
  },
  createAssistanceRequest: (payload: Partial<AssistanceRequest>) =>
    resilientCall(
      () => fetchJSON<AssistanceRequest>('/assistance', { method: 'POST', body: JSON.stringify(payload) }),
      () => localStore.createAssistanceRequest(payload),
      'createAssistanceRequest'
    ),
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
  getMe: (user_id?: string) => {
    const qs = user_id ? `?user_id=${user_id}` : '';
    return resilientCall(
      () => fetchJSON<any>(`/auth/me${qs}`),
      () => localStore.getMe(user_id),
      'getMe'
    );
  },
  updateProfile: (payload: any) =>
    resilientCall(
      () => fetchJSON<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
      () => localStore.updateProfile(payload),
      'updateProfile'
    ),

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
