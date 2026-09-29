export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'RESOURCE_PROVIDER' | 'COMMUNITY_COORDINATOR' | 'ADMIN';

export type Language = 'ta' | 'en';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  mobile_number: string;
  area: string;
  city: string;
  district: string;
  preferred_language: Language;
  is_setup_completed: boolean | number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type IncidentType =
  | 'FLOOD'
  | 'FIRE'
  | 'MEDICAL'
  | 'CYCLONE'
  | 'ROAD_BLOCK'
  | 'POWER_ISSUE'
  | 'BUILDING_DAMAGE'
  | 'MISSING_PERSON'
  | 'EMERGENCY'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'REPORTED' | 'UNDER_REVIEW' | 'ACTIVE' | 'RESOLVED' | 'REJECTED';

export type VerificationStatus = 'UNVERIFIED' | 'UNDER_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface Incident {
  id: string;
  reporter_id?: string;
  reporter_name?: string;
  reporter_phone?: string;
  type: IncidentType;
  severity: SeverityLevel;
  description: string;
  area: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  number_affected?: number;
  photo_url?: string | null;
  audio_url?: string | null;
  is_demo?: boolean | number;
  created_at: string;
  updated_at: string;
}

export type HelpCategory =
  | 'MEDICAL'
  | 'AMBULANCE'
  | 'RESCUE'
  | 'FOOD'
  | 'WATER'
  | 'SHELTER'
  | 'MEDICINE'
  | 'ELDERLY'
  | 'CHILD'
  | 'DISABILITY'
  | 'TRANSPORT'
  | 'POWER'
  | 'COMMUNICATION'
  | 'MISSING_PERSON'
  | 'OTHER';

export type AssistanceStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AssistanceRequest {
  id: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone: string;
  category: HelpCategory;
  severity: SeverityLevel;
  description: string;
  area: string;
  latitude: number;
  longitude: number;
  status: AssistanceStatus;
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  assigned_volunteer_phone?: string;
  photo_url?: string | null;
  audio_url?: string | null;
  is_demo?: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: string;
  full_name: string;
  phone: string;
  area: string;
  latitude?: number;
  longitude?: number;
  availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  emergency_contact?: string;
  has_vehicle?: boolean | number;
  vehicle_type?: string;
  skills?: string[];
  distanceKm?: number;
  matchScore?: number;
  isHighRiskQualified?: boolean;
  created_at: string;
  updated_at: string;
}

export type FloodCondition =
  | 'WATER_ON_ROAD'
  | 'FLOODED_STREET'
  | 'WATER_ENTERING_HOUSE'
  | 'VEHICLES_AFFECTED'
  | 'ROAD_BLOCKED'
  | 'DANGEROUS_WATER_LEVEL'
  | 'OTHER';

export interface FloodReport {
  id: string;
  reporter_id?: string;
  reporter_name?: string;
  condition: FloodCondition;
  water_level_estimate?: string;
  description?: string;
  area: string;
  latitude: number;
  longitude: number;
  photo_url?: string | null;
  audio_url?: string | null;
  status: 'ACTIVE' | 'RECEDING' | 'RESOLVED';
  is_demo?: boolean | number;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  has_food: boolean | number;
  has_water: boolean | number;
  has_medical: boolean | number;
  has_accessibility: boolean | number;
  contact_person: string;
  contact_phone: string;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED';
  is_demo?: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  provider_id?: string;
  provider_name: string;
  provider_phone: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  area: string;
  latitude: number;
  longitude: number;
  delivery_mode: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'DEPLETED';
  is_demo?: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  area: string;
  description: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id?: string;
  author_name: string;
  message: string;
  category: 'UPDATE' | 'FOOD_WATER' | 'ROAD_STATUS' | 'POWER_STATUS' | 'MISSING' | 'EMERGENCY';
  photo_url?: string | null;
  latitude?: number;
  longitude?: number;
  verified?: boolean | number;
  is_demo?: boolean | number;
  created_at: string;
}

export type SafetyStatus = 'SAFE' | 'NEED_HELP' | 'EMERGENCY' | 'NO_RESPONSE';

export interface SafetyCheckin {
  id: string;
  user_id: string;
  user_name: string;
  user_phone?: string;
  community_id?: string;
  status: SafetyStatus;
  note?: string;
  area: string;
  latitude?: number;
  longitude?: number;
  is_demo?: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface SafetySummary {
  SAFE: number;
  NEED_HELP: number;
  EMERGENCY: number;
  NO_RESPONSE: number;
  TOTAL: number;
}

export interface BroadcastAlert {
  id: string;
  title: string;
  title_ta?: string;
  description: string;
  description_ta?: string;
  severity: 'EMERGENCY' | 'WARNING' | 'ADVISORY';
  area: string;
  active: boolean | number;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  related_entity_id?: string;
  is_read: boolean | number;
  created_at: string;
}

export interface FundCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  collected_amount: number;
  donor_count: number;
  is_active: boolean | number;
  is_demo: boolean | number;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id?: string;
  name: string;
  relationship?: string;
  phone_number: string;
  category?: string;
  is_global_helpline?: boolean | number;
  created_at: string;
}
