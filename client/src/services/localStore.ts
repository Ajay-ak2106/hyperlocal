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
  User,
  Profile
} from '../types/index.js';

const STORAGE_KEY = 'namma_rescue_offline_store_v2';

const initialIncidents: Incident[] = [
  {
    id: 'inc-1',
    reporter_id: 'user-citizen-1',
    reporter_name: 'Kavitha R',
    reporter_phone: '+91 98765 43210',
    type: 'FLOOD',
    severity: 'CRITICAL',
    description: 'Water logging over 3.5 feet near Velachery MRTS. Ground floor houses submerged.',
    area: 'Velachery',
    latitude: 12.9785,
    longitude: 80.2215,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 150,
    is_demo: 1,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-2',
    reporter_id: 'user-citizen-3',
    reporter_name: 'Muthu S',
    reporter_phone: '+91 97910 98765',
    type: 'ROAD_BLOCK',
    severity: 'HIGH',
    description: 'Uprooted tree blocking main GST Road near Tambaram station.',
    area: 'Tambaram',
    latitude: 12.9235,
    longitude: 80.1285,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 200,
    is_demo: 1,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-3',
    reporter_id: 'user-citizen-4',
    reporter_name: 'Anitha K',
    reporter_phone: '+91 94441 55667',
    type: 'MEDICAL',
    severity: 'CRITICAL',
    description: 'Elderly diabetic patient needing immediate insulin and ambulance transfer.',
    area: 'Madipakkam',
    latitude: 12.9635,
    longitude: 80.1990,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 1,
    is_demo: 1,
    created_at: new Date(Date.now() - 5400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-4',
    reporter_id: 'user-vol-5',
    reporter_name: 'Rajesh K',
    reporter_phone: '+91 95000 66778',
    type: 'FLOOD',
    severity: 'HIGH',
    description: 'Water entering residential street. Drainage overflowing rapidly.',
    area: 'Pallikaranai',
    latitude: 12.9355,
    longitude: 80.2140,
    status: 'ACTIVE',
    verification_status: 'UNDER_VERIFICATION',
    number_affected: 45,
    is_demo: 1,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-5',
    reporter_id: 'user-citizen-5',
    reporter_name: 'Saidapet Residents',
    reporter_phone: '+91 94440 99991',
    type: 'POWER_ISSUE',
    severity: 'MEDIUM',
    description: 'Transformer spark and power outage affecting 3 streets.',
    area: 'Saidapet',
    latitude: 13.0180,
    longitude: 80.2220,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 120,
    is_demo: 1,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-6',
    reporter_name: 'Suresh Babu',
    reporter_phone: '+91 94440 99992',
    type: 'BUILDING_DAMAGE',
    severity: 'HIGH',
    description: 'Compound wall collapsed near school lane due to heavy downpour.',
    area: 'Perungudi',
    latitude: 12.9660,
    longitude: 80.2470,
    status: 'UNDER_REVIEW',
    verification_status: 'UNDER_VERIFICATION',
    number_affected: 20,
    is_demo: 1,
    created_at: new Date(Date.now() - 18000000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-7',
    reporter_name: 'Vimala Devi',
    reporter_phone: '+91 94440 99993',
    type: 'FIRE',
    severity: 'CRITICAL',
    description: 'Short circuit electrical fire in commercial meter box.',
    area: 'Adyar',
    latitude: 13.0080,
    longitude: 80.2560,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 35,
    is_demo: 1,
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-8',
    reporter_name: 'Karthik N',
    reporter_phone: '+91 94440 99994',
    type: 'MISSING_PERSON',
    severity: 'HIGH',
    description: '72-year-old grandfather missing since morning flood evacuation.',
    area: 'Tambaram',
    latitude: 12.9210,
    longitude: 80.1260,
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    number_affected: 1,
    is_demo: 1,
    created_at: new Date(Date.now() - 25200000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-9',
    reporter_name: 'Naveen Kumar',
    reporter_phone: '+91 94440 99995',
    type: 'CYCLONE',
    severity: 'HIGH',
    description: 'Tin roofing sheets blown onto road and low tension cables dangling.',
    area: 'Medavakkam',
    latitude: 12.9180,
    longitude: 80.1920,
    status: 'ACTIVE',
    verification_status: 'UNVERIFIED',
    number_affected: 15,
    is_demo: 1,
    created_at: new Date(Date.now() - 28800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-10',
    reporter_name: 'Control Room',
    reporter_phone: '+91 94440 99996',
    type: 'ROAD_BLOCK',
    severity: 'LOW',
    description: 'Water receded near bridge. Road cleared of debris.',
    area: 'Saidapet',
    latitude: 13.0170,
    longitude: 80.2200,
    status: 'RESOLVED',
    verification_status: 'VERIFIED',
    number_affected: 0,
    is_demo: 1,
    created_at: new Date(Date.now() - 32400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialShelters: Shelter[] = [
  {
    id: 'sh-1',
    name: 'Velachery Community Hall Shelter (DEMO DATA)',
    area: 'Velachery',
    address: 'No. 12, Gandhi Salai, Velachery, Chennai',
    latitude: 12.9754,
    longitude: 80.2206,
    capacity: 350,
    current_occupancy: 142,
    has_food: 1,
    has_water: 1,
    has_medical: 1,
    has_accessibility: 1,
    contact_person: 'Officer Murugan',
    contact_phone: '+91 94440 12345',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sh-2',
    name: 'Tambaram Govt Higher Secondary School (DEMO DATA)',
    area: 'Tambaram',
    address: 'GST Road, Near Tambaram Station, Chennai',
    latitude: 12.9249,
    longitude: 80.1299,
    capacity: 500,
    current_occupancy: 480,
    has_food: 1,
    has_water: 1,
    has_medical: 1,
    has_accessibility: 1,
    contact_person: 'Headmaster Selvam',
    contact_phone: '+91 94440 23456',
    status: 'LIMITED',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sh-3',
    name: 'Pallikaranai Relief Center (DEMO DATA)',
    area: 'Pallikaranai',
    address: 'Dr. Ambedkar Road, Pallikaranai, Chennai',
    latitude: 12.9360,
    longitude: 80.2155,
    capacity: 250,
    current_occupancy: 85,
    has_food: 1,
    has_water: 1,
    has_medical: 1,
    has_accessibility: 0,
    contact_person: 'Coordinator Revathi',
    contact_phone: '+91 94440 34567',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sh-4',
    name: 'Madipakkam Disaster Relief Hub (DEMO DATA)',
    area: 'Madipakkam',
    address: 'Bazaar Road, Madipakkam, Chennai',
    latitude: 12.9620,
    longitude: 80.1980,
    capacity: 200,
    current_occupancy: 200,
    has_food: 1,
    has_water: 1,
    has_medical: 0,
    has_accessibility: 1,
    contact_person: 'Inspector Baskar',
    contact_phone: '+91 94440 45678',
    status: 'FULL',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sh-5',
    name: 'Saidapet Teachers Training College (DEMO DATA)',
    area: 'Saidapet',
    address: 'Anna Salai, Saidapet, Chennai',
    latitude: 13.0210,
    longitude: 80.2230,
    capacity: 400,
    current_occupancy: 95,
    has_food: 1,
    has_water: 1,
    has_medical: 1,
    has_accessibility: 1,
    contact_person: 'Director Raman',
    contact_phone: '+91 94440 56789',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialResources: Resource[] = [
  {
    id: 'res-1',
    provider_name: 'Velachery Youth Welfare Trust (DEMO DATA)',
    provider_phone: '+91 98400 11223',
    category: 'FOOD',
    name: 'Hot Meals & Food Packets',
    quantity: 450,
    unit: 'packets',
    area: 'Velachery',
    latitude: 12.9790,
    longitude: 80.2195,
    delivery_mode: 'PICKUP_OR_DELIVERY',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res-2',
    provider_name: 'Lions Club South Chennai (DEMO DATA)',
    provider_phone: '+91 98400 22334',
    category: 'WATER',
    name: '20L Drinking Water Cans',
    quantity: 120,
    unit: 'cans',
    area: 'Pallikaranai',
    latitude: 12.9380,
    longitude: 80.2120,
    delivery_mode: 'PICKUP',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res-3',
    provider_name: 'Red Cross Chennai Chapter (DEMO DATA)',
    provider_phone: '+91 98400 33445',
    category: 'FIRST_AID',
    name: 'Trauma & Wound First Aid Kits',
    quantity: 80,
    unit: 'kits',
    area: 'Saidapet',
    latitude: 13.0195,
    longitude: 80.2215,
    delivery_mode: 'DELIVERY',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res-4',
    provider_name: 'Chennai Marine Rescuers (DEMO DATA)',
    provider_phone: '+91 98400 44556',
    category: 'BOATS',
    name: 'Inflatable Motor Boats',
    quantity: 4,
    unit: 'boats',
    area: 'Velachery',
    latitude: 12.9730,
    longitude: 80.2240,
    delivery_mode: 'DELIVERY',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res-5',
    provider_name: 'Community Tech Group (DEMO DATA)',
    provider_phone: '+91 98400 55667',
    category: 'CHARGING_STATIONS',
    name: 'Solar Power Battery Hubs',
    quantity: 8,
    unit: 'stations',
    area: 'Tambaram',
    latitude: 12.9260,
    longitude: 80.1280,
    delivery_mode: 'PICKUP',
    status: 'AVAILABLE',
    is_demo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialAssistance: AssistanceRequest[] = [
  {
    id: 'req-1',
    citizen_id: 'user-citizen-2',
    citizen_name: 'Meenakshi Sundaram',
    citizen_phone: '+91 98401 23456',
    category: 'MEDICAL',
    severity: 'CRITICAL',
    description: 'Need oxygen cylinder and medical escort for heart patient trapped on first floor.',
    area: 'Pallikaranai',
    latitude: 12.9370,
    longitude: 80.2130,
    status: 'ACCEPTED',
    assigned_volunteer_id: 'user-vol-2',
    assigned_volunteer_name: 'Dr. Priya Narayanan',
    is_demo: 1,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-2',
    citizen_id: 'user-citizen-5',
    citizen_name: 'Ravi Shankar',
    citizen_phone: '+91 91760 11223',
    category: 'FOOD',
    severity: 'HIGH',
    description: 'Family of 6 including 2 toddlers without drinking water and food.',
    area: 'Saidapet',
    latitude: 13.0200,
    longitude: 80.2245,
    status: 'PENDING',
    is_demo: 1,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-3',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Kavitha R',
    citizen_phone: '+91 98765 43210',
    category: 'RESCUE',
    severity: 'CRITICAL',
    description: 'Elderly couple in ground floor house with flood level reaching 4 feet. Need boat rescue.',
    area: 'Velachery',
    latitude: 12.9775,
    longitude: 80.2220,
    status: 'PENDING',
    is_demo: 1,
    created_at: new Date(Date.now() - 5400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-4',
    citizen_id: 'user-citizen-4',
    citizen_name: 'Selvi P',
    citizen_phone: '+91 94440 88771',
    category: 'ELDERLY',
    severity: 'MEDIUM',
    description: 'Wheelchair bound grandmother needs relocation to dry shelter.',
    area: 'Madipakkam',
    latitude: 12.9640,
    longitude: 80.1970,
    status: 'PENDING',
    is_demo: 1,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-5',
    citizen_id: 'user-citizen-3',
    citizen_name: 'Gopal V',
    citizen_phone: '+91 94440 88772',
    category: 'POWER',
    severity: 'LOW',
    description: 'Need high-power torch and battery backup for nebulizer.',
    area: 'Tambaram',
    latitude: 12.9240,
    longitude: 80.1290,
    status: 'COMPLETED',
    assigned_volunteer_id: 'user-vol-3',
    assigned_volunteer_name: 'Karthik Raja',
    is_demo: 1,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialVolunteers: Volunteer[] = [
  {
    id: 'user-vol-1',
    full_name: 'Senthil Kumar (DEMO DATA)',
    phone: '+91 98840 99887',
    area: 'Velachery',
    latitude: 12.9780,
    longitude: 80.2210,
    availability_status: 'AVAILABLE',
    emergency_contact: '+91 98840 00001',
    has_vehicle: 1,
    vehicle_type: 'Inflatable Rescue Boat & 4x4 SUV',
    skills: ['FLOOD RESCUE', 'SWIMMING', 'BOAT OPERATION', 'FIRST AID'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-vol-2',
    full_name: 'Dr. Priya Narayanan (DEMO DATA)',
    phone: '+91 98410 44332',
    area: 'Adyar',
    latitude: 13.0067,
    longitude: 80.2570,
    availability_status: 'AVAILABLE',
    emergency_contact: '+91 98410 00002',
    has_vehicle: 1,
    vehicle_type: 'Emergency Medical Car',
    skills: ['MEDICAL', 'CPR', 'FIRST AID'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-vol-3',
    full_name: 'Karthik Raja (DEMO DATA)',
    phone: '+91 99620 77889',
    area: 'Tambaram',
    latitude: 12.9229,
    longitude: 80.1275,
    availability_status: 'AVAILABLE',
    emergency_contact: '+91 99620 00003',
    has_vehicle: 1,
    vehicle_type: 'Heavy Truck',
    skills: ['LOGISTICS', 'DRIVING'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-vol-4',
    full_name: 'Deepa Lakshmi (DEMO DATA)',
    phone: '+91 97890 33445',
    area: 'Perungudi',
    latitude: 12.9654,
    longitude: 80.2461,
    availability_status: 'AVAILABLE',
    emergency_contact: '+91 97890 00004',
    has_vehicle: 0,
    skills: ['COMMUNICATION'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-vol-5',
    full_name: 'Rajesh Kannan (DEMO DATA)',
    phone: '+91 95000 66778',
    area: 'Pallikaranai',
    latitude: 12.9348,
    longitude: 80.2138,
    availability_status: 'AVAILABLE',
    emergency_contact: '+91 95000 00005',
    has_vehicle: 1,
    vehicle_type: 'Motorcycle & Drone',
    skills: ['DRONE OPERATION'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialFloodReports: FloodReport[] = [
  {
    id: 'fl-1',
    reporter_name: 'Kavitha R',
    condition: 'DANGEROUS_WATER_LEVEL',
    water_level_estimate: 'AI ESTIMATE: Waist Level (3.0 - 4.0 ft)',
    description: 'Velachery Main Road junction water level rising over car tyres.',
    area: 'Velachery',
    latitude: 12.9785,
    longitude: 80.2215,
    status: 'ACTIVE',
    is_demo: 1,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'fl-2',
    reporter_name: 'Rajesh K',
    condition: 'FLOODED_STREET',
    water_level_estimate: 'AI ESTIMATE: Knee Level (1.5 - 2.5 ft)',
    description: 'Water entering homes along 2nd cross street.',
    area: 'Pallikaranai',
    latitude: 12.9355,
    longitude: 80.2140,
    status: 'ACTIVE',
    is_demo: 1,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const initialCommunityGroups: CommunityGroup[] = [
  {
    id: 'cg-1',
    name: 'Velachery Lake Ward Community',
    area: 'Velachery',
    description: 'Residents & volunteer network covering Velachery bypass, 100ft road and lake zone.',
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-2',
    name: 'Tambaram & Mudichur Relief Circle',
    area: 'Tambaram',
    description: 'Coordination hub for Tambaram Sanatorium, Mudichur and Krishna Nagar.',
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-3',
    name: 'Pallikaranai Marsh & Medavakkam Safety Group',
    area: 'Pallikaranai',
    description: 'Community watch and rapid alert network for marsh boundary.',
    created_at: new Date().toISOString()
  }
];

const initialCommunityPosts: CommunityPost[] = [
  {
    id: 'cp-1',
    community_id: 'cg-1',
    author_name: 'Senthil Kumar (DEMO DATA)',
    message: 'Boats stationed at Velachery MRTS bridge. Please contact if anyone stranded in 2nd main road.',
    category: 'EMERGENCY',
    latitude: 12.9780,
    longitude: 80.2210,
    verified: 1,
    is_demo: 1,
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'cp-2',
    community_id: 'cg-1',
    author_name: 'Kavitha R',
    message: 'Drinking water cans available at AGS Colony community hall.',
    category: 'FOOD_WATER',
    latitude: 12.9750,
    longitude: 80.2200,
    verified: 1,
    is_demo: 1,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

const initialCheckins: SafetyCheckin[] = [
  {
    id: 'sc-1',
    user_id: 'user-citizen-1',
    user_name: 'Kavitha Ramachandran',
    status: 'SAFE',
    note: 'Safe on 2nd floor, have water and provisions for 2 days.',
    area: 'Velachery',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sc-2',
    user_id: 'user-citizen-2',
    user_name: 'Meenakshi Sundaram',
    status: 'NEED_HELP',
    note: 'Water entering ground floor, need assistance moving elderly parent.',
    area: 'Pallikaranai',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialCampaigns: FundCampaign[] = [
  {
    id: 'fund-1',
    title: 'Chennai Flood Relief & Emergency Kitchen Fund (DEMO DATA)',
    description: 'Providing cooked meals, infant formula, blankets and water cans to low lying flooded zones.',
    target_amount: 1000000,
    collected_amount: 345000,
    donor_count: 142,
    is_active: 1,
    is_demo: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'fund-2',
    title: 'Rapid Boat & Rescue Fuel Subsidy (DEMO DATA)',
    description: 'Direct fuel and equipment replenishment for volunteer rescue boats in Velachery & Mudichur.',
    target_amount: 500000,
    collected_amount: 210000,
    donor_count: 88,
    is_active: 1,
    is_demo: 1,
    created_at: new Date().toISOString()
  }
];

const initialContacts: EmergencyContact[] = [
  { id: 'ec-1', name: 'National Emergency Helpline', phone_number: '112', category: 'POLICE', is_global_helpline: 1, created_at: new Date().toISOString() },
  { id: 'ec-2', name: 'TN Disaster Management Control Room', phone_number: '1070', category: 'DISASTER_HQ', is_global_helpline: 1, created_at: new Date().toISOString() },
  { id: 'ec-3', name: 'Greater Chennai Corporation (GCC)', phone_number: '1913', category: 'MUNICIPAL', is_global_helpline: 1, created_at: new Date().toISOString() },
  { id: 'ec-4', name: 'Emergency Medical & Ambulance', phone_number: '108', category: 'AMBULANCE', is_global_helpline: 1, created_at: new Date().toISOString() },
  { id: 'ec-5', name: 'Fire & Rescue Services', phone_number: '101', category: 'FIRE', is_global_helpline: 1, created_at: new Date().toISOString() }
];

interface StoreData {
  incidents: Incident[];
  shelters: Shelter[];
  resources: Resource[];
  assistance: AssistanceRequest[];
  volunteers: Volunteer[];
  floodReports: FloodReport[];
  communityGroups: CommunityGroup[];
  communityPosts: CommunityPost[];
  checkins: SafetyCheckin[];
  campaigns: FundCampaign[];
  contacts: EmergencyContact[];
  notifications: AppNotification[];
  currentUser: { user: User; profile: Profile; volunteer?: Volunteer; token: string };
}

function loadInitialStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.incidents) && parsed.incidents.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading from localStorage store:', e);
  }

  const defaultUser: User = {
    id: 'user-citizen-1',
    email: 'demo.citizen@example.com',
    role: 'CITIZEN',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const defaultProfile: Profile = {
    id: 'user-citizen-1',
    name: 'Kavitha Ramachandran (DEMO DATA)',
    mobile_number: '+91 98765 43210',
    area: 'Velachery',
    city: 'Chennai',
    district: 'Chennai',
    preferred_language: 'ta',
    is_setup_completed: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return {
    incidents: initialIncidents,
    shelters: initialShelters,
    resources: initialResources,
    assistance: initialAssistance,
    volunteers: initialVolunteers,
    floodReports: initialFloodReports,
    communityGroups: initialCommunityGroups,
    communityPosts: initialCommunityPosts,
    checkins: initialCheckins,
    campaigns: initialCampaigns,
    contacts: initialContacts,
    notifications: [
      {
        id: 'notif-1',
        title: '⚠️ Red Alert: Heavy Downpour in South Chennai',
        message: 'Disaster management warns of water stagnation in Velachery, Tambaram and Mudichur.',
        type: 'EMERGENCY_BROADCAST',
        is_read: 0,
        created_at: new Date().toISOString()
      }
    ],
    currentUser: {
      user: defaultUser,
      profile: defaultProfile,
      token: 'demo-token-123'
    }
  };
}

let store: StoreData = loadInitialStore();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to persist store to localStorage:', e);
  }
}

function triggerRealtime(event: string, data: any) {
  try {
    window.dispatchEvent(new CustomEvent('namma-realtime', {
      detail: { event, data }
    }));
  } catch (e) {
    // window not defined in SSR
  }
}

export const localStore = {
  // Incidents
  getIncidents: (params?: { status?: string; type?: string; area?: string }): Incident[] => {
    let list = [...store.incidents];
    if (params?.area && params.area !== 'All Areas') {
      list = list.filter(i => i.area.toLowerCase() === params.area?.toLowerCase());
    }
    if (params?.status) {
      list = list.filter(i => i.status === params.status);
    }
    if (params?.type) {
      list = list.filter(i => i.type === params.type);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getIncidentById: (id: string): Incident => {
    const inc = store.incidents.find(i => i.id === id);
    if (!inc) throw new Error('Incident not found');
    return inc;
  },
  createIncident: (payload: Partial<Incident>): Incident => {
    const id = `inc-${Date.now()}`;
    const newInc: Incident = {
      id,
      reporter_id: store.currentUser.user.id,
      reporter_name: payload.reporter_name || store.currentUser.profile.name,
      reporter_phone: payload.reporter_phone || store.currentUser.profile.mobile_number,
      type: payload.type || 'FLOOD',
      severity: payload.severity || 'HIGH',
      description: payload.description || '',
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9785,
      longitude: payload.longitude || 80.2215,
      status: 'ACTIVE',
      verification_status: 'UNDER_VERIFICATION',
      number_affected: payload.number_affected || 1,
      photo_url: payload.photo_url || null,
      audio_url: payload.audio_url || null,
      is_demo: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.incidents.unshift(newInc);
    persist();
    triggerRealtime('INCIDENT_CREATED', newInc);
    return newInc;
  },
  updateIncident: (id: string, payload: Partial<Incident>): Incident => {
    const idx = store.incidents.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Incident not found');
    store.incidents[idx] = {
      ...store.incidents[idx],
      ...payload,
      updated_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('INCIDENT_UPDATED', store.incidents[idx]);
    return store.incidents[idx];
  },

  // Flood Reports
  getFloodReports: (): FloodReport[] => {
    return [...store.floodReports];
  },
  createFloodReport: (payload: Partial<FloodReport>): { flood_report: FloodReport; incident: Incident } => {
    const id = `fl-${Date.now()}`;
    const report: FloodReport = {
      id,
      reporter_name: payload.reporter_name || store.currentUser.profile.name,
      condition: payload.condition || 'FLOODED_STREET',
      water_level_estimate: payload.water_level_estimate || 'AI ESTIMATE: 2.0 ft',
      description: payload.description || 'Water accumulation reported',
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9785,
      longitude: payload.longitude || 80.2215,
      status: 'ACTIVE',
      photo_url: payload.photo_url || null,
      audio_url: payload.audio_url || null,
      is_demo: 1,
      created_at: new Date().toISOString()
    };
    store.floodReports.unshift(report);

    // Also create matching incident
    const incident: Incident = {
      id: `inc-flood-${Date.now()}`,
      reporter_name: report.reporter_name,
      type: 'FLOOD',
      severity: 'HIGH',
      description: `[AI FLOOD MAP REPORT] ${report.condition}: ${report.description || ''}`,
      area: report.area,
      latitude: report.latitude,
      longitude: report.longitude,
      status: 'ACTIVE',
      verification_status: 'UNDER_VERIFICATION',
      is_demo: 1,
      photo_url: report.photo_url,
      audio_url: report.audio_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.incidents.unshift(incident);

    persist();
    triggerRealtime('FLOOD_REPORT_CREATED', { flood_report: report, incident });
    return { flood_report: report, incident };
  },

  // Assistance
  getAssistanceRequests: (params?: { status?: string; category?: string; area?: string }): AssistanceRequest[] => {
    let list = [...store.assistance];
    if (params?.area && params.area !== 'All Areas') {
      list = list.filter(r => r.area.toLowerCase() === params.area?.toLowerCase());
    }
    if (params?.status) {
      list = list.filter(r => r.status === params.status);
    }
    if (params?.category) {
      list = list.filter(r => r.category === params.category);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createAssistanceRequest: (payload: Partial<AssistanceRequest>): AssistanceRequest => {
    const id = `req-${Date.now()}`;
    const req: AssistanceRequest = {
      id,
      citizen_id: store.currentUser.user.id,
      citizen_name: payload.citizen_name || store.currentUser.profile.name,
      citizen_phone: payload.citizen_phone || store.currentUser.profile.mobile_number,
      category: payload.category || 'RESCUE',
      severity: payload.severity || 'HIGH',
      description: payload.description || '',
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9775,
      longitude: payload.longitude || 80.2220,
      status: 'PENDING',
      photo_url: payload.photo_url || null,
      audio_url: payload.audio_url || null,
      is_demo: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.assistance.unshift(req);
    persist();
    triggerRealtime('ASSISTANCE_REQUEST_CREATED', req);
    return req;
  },
  acceptAssistanceRequest: (id: string, payload: { volunteer_id: string; volunteer_name: string; volunteer_phone?: string }): AssistanceRequest => {
    const idx = store.assistance.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Assistance request not found');
    store.assistance[idx] = {
      ...store.assistance[idx],
      status: 'ACCEPTED',
      assigned_volunteer_id: payload.volunteer_id,
      assigned_volunteer_name: payload.volunteer_name,
      assigned_volunteer_phone: payload.volunteer_phone,
      updated_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('ASSISTANCE_STATUS_UPDATED', store.assistance[idx]);
    return store.assistance[idx];
  },
  updateAssistanceStatus: (id: string, status: any): AssistanceRequest => {
    const idx = store.assistance.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Assistance request not found');
    store.assistance[idx] = {
      ...store.assistance[idx],
      status,
      updated_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('ASSISTANCE_STATUS_UPDATED', store.assistance[idx]);
    return store.assistance[idx];
  },

  // Shelters
  getShelters: (): Shelter[] => {
    return [...store.shelters];
  },
  updateShelter: (id: string, payload: { current_occupancy?: number; change_delta?: number; status?: any }): Shelter => {
    const idx = store.shelters.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Shelter not found');
    const item = store.shelters[idx];
    let newOccupancy = item.current_occupancy;
    if (typeof payload.current_occupancy === 'number') {
      newOccupancy = payload.current_occupancy;
    } else if (typeof payload.change_delta === 'number') {
      newOccupancy = Math.max(0, Math.min(item.capacity, item.current_occupancy + payload.change_delta));
    }

    let status = item.status;
    if (payload.status) {
      status = payload.status;
    } else if (newOccupancy >= item.capacity) {
      status = 'FULL';
    } else if (newOccupancy >= item.capacity * 0.9) {
      status = 'LIMITED';
    } else {
      status = 'AVAILABLE';
    }

    store.shelters[idx] = {
      ...item,
      current_occupancy: newOccupancy,
      status,
      updated_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('SHELTER_UPDATED', store.shelters[idx]);
    return store.shelters[idx];
  },

  // Resources
  getResources: (params?: { category?: string; area?: string; status?: string }): Resource[] => {
    let list = [...store.resources];
    if (params?.area && params.area !== 'All Areas') {
      list = list.filter(r => r.area.toLowerCase() === params.area?.toLowerCase());
    }
    if (params?.category) {
      list = list.filter(r => r.category === params.category);
    }
    return list;
  },
  createResource: (payload: Partial<Resource>): Resource => {
    const id = `res-${Date.now()}`;
    const res: Resource = {
      id,
      provider_name: payload.provider_name || store.currentUser.profile.name,
      provider_phone: payload.provider_phone || store.currentUser.profile.mobile_number,
      category: payload.category || 'FOOD',
      name: payload.name || 'Emergency Relief Supplies',
      quantity: payload.quantity || 10,
      unit: payload.unit || 'units',
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9790,
      longitude: payload.longitude || 80.2195,
      delivery_mode: payload.delivery_mode || 'PICKUP_OR_DELIVERY',
      status: 'AVAILABLE',
      is_demo: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.resources.unshift(res);
    persist();
    triggerRealtime('RESOURCE_CREATED', res);
    return res;
  },
  updateResource: (id: string, payload: { quantity?: number; status?: any }): Resource => {
    const idx = store.resources.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Resource not found');
    store.resources[idx] = {
      ...store.resources[idx],
      ...payload,
      updated_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('RESOURCE_UPDATED', store.resources[idx]);
    return store.resources[idx];
  },

  // Volunteers
  getVolunteers: (): Volunteer[] => {
    return [...store.volunteers];
  },
  registerVolunteer: (payload: Partial<Volunteer>): Volunteer => {
    const id = `user-vol-${Date.now()}`;
    const vol: Volunteer = {
      id,
      full_name: payload.full_name || store.currentUser.profile.name,
      phone: payload.phone || store.currentUser.profile.mobile_number,
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9780,
      longitude: payload.longitude || 80.2210,
      availability_status: 'AVAILABLE',
      emergency_contact: payload.emergency_contact || '+91 94440 00000',
      has_vehicle: payload.has_vehicle ? 1 : 0,
      vehicle_type: payload.vehicle_type || 'Car / Bike',
      skills: payload.skills || ['FIRST AID', 'RESCUE'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.volunteers.unshift(vol);
    persist();
    triggerRealtime('VOLUNTEER_REGISTERED', vol);
    return vol;
  },
  matchVolunteers: (payload: { category: string; area: string }): Volunteer[] => {
    return store.volunteers.map(v => {
      let score = 50;
      if (v.area.toLowerCase() === payload.area.toLowerCase()) score += 35;
      if (v.has_vehicle) score += 15;
      return {
        ...v,
        distanceKm: Math.round((Math.random() * 2.5 + 0.3) * 10) / 10,
        matchScore: score,
        isHighRiskQualified: true
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  },

  // Community
  getCommunityGroups: (): CommunityGroup[] => {
    return [...store.communityGroups];
  },
  getCommunityPosts: (community_id?: string): CommunityPost[] => {
    let list = [...store.communityPosts];
    if (community_id) {
      list = list.filter(p => p.community_id === community_id);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createCommunityPost: (payload: Partial<CommunityPost>): CommunityPost => {
    const id = `cp-${Date.now()}`;
    const post: CommunityPost = {
      id,
      community_id: payload.community_id || 'cg-1',
      author_id: store.currentUser.user.id,
      author_name: payload.author_name || store.currentUser.profile.name,
      message: payload.message || '',
      category: payload.category || 'UPDATE',
      photo_url: payload.photo_url || null,
      latitude: payload.latitude || 12.9780,
      longitude: payload.longitude || 80.2210,
      verified: 1,
      is_demo: 1,
      created_at: new Date().toISOString()
    };
    store.communityPosts.unshift(post);
    persist();
    triggerRealtime('COMMUNITY_POST_CREATED', post);
    return post;
  },

  // Safety
  getSafetyStats: (community_id?: string): { summary: SafetySummary; checkins: SafetyCheckin[] } => {
    const checkins = [...store.checkins];
    const summary: SafetySummary = {
      SAFE: checkins.filter(c => c.status === 'SAFE').length,
      NEED_HELP: checkins.filter(c => c.status === 'NEED_HELP').length,
      EMERGENCY: checkins.filter(c => c.status === 'EMERGENCY').length,
      NO_RESPONSE: 8,
      TOTAL: checkins.length + 8
    };
    return { summary, checkins };
  },
  submitSafetyCheckin: (payload: Partial<SafetyCheckin>): { checkin: SafetyCheckin; summary: SafetySummary } => {
    const id = `sc-${Date.now()}`;
    const checkin: SafetyCheckin = {
      id,
      user_id: payload.user_id || store.currentUser.user.id,
      user_name: payload.user_name || store.currentUser.profile.name,
      user_phone: payload.user_phone || store.currentUser.profile.mobile_number,
      community_id: payload.community_id || 'cg-1',
      status: payload.status || 'SAFE',
      note: payload.note || '',
      area: payload.area || 'Velachery',
      latitude: payload.latitude || 12.9780,
      longitude: payload.longitude || 80.2210,
      is_demo: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Replace if same user checkin exists
    const idx = store.checkins.findIndex(c => c.user_id === checkin.user_id);
    if (idx !== -1) {
      store.checkins[idx] = checkin;
    } else {
      store.checkins.unshift(checkin);
    }
    persist();

    const { summary } = localStore.getSafetyStats();
    triggerRealtime('SAFETY_CHECKIN_SUBMITTED', { checkin, summary });
    return { checkin, summary };
  },
  triggerSafetyPoll: (payload: { community_id: string; area: string }): { success: boolean } => {
    triggerRealtime('SAFETY_POLL_TRIGGERED', payload);
    return { success: true };
  },

  // Notifications
  getNotifications: (user_id?: string): AppNotification[] => {
    return [...store.notifications];
  },
  markNotificationRead: (id: string): AppNotification => {
    const idx = store.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      store.notifications[idx].is_read = 1;
      persist();
      return store.notifications[idx];
    }
    throw new Error('Notification not found');
  },
  markAllNotificationsRead: (user_id?: string): { success: boolean } => {
    store.notifications.forEach(n => { n.is_read = 1; });
    persist();
    return { success: true };
  },

  // Funds
  getFunds: (): { campaigns: FundCampaign[]; donations: any[]; disclaimer: string } => {
    return {
      campaigns: [...store.campaigns],
      donations: [],
      disclaimer: 'Tamil Nadu State Relief Fund Direct Integration (Demo Mode active)'
    };
  },
  donate: (payload: { campaign_id: string; donor_name: string; donor_email?: string; amount: number }): { donation: any; campaign: FundCampaign } => {
    const idx = store.campaigns.findIndex(c => c.id === payload.campaign_id);
    if (idx === -1) throw new Error('Campaign not found');
    store.campaigns[idx].collected_amount += payload.amount;
    store.campaigns[idx].donor_count += 1;
    const donation = {
      id: `don-${Date.now()}`,
      campaign_id: payload.campaign_id,
      donor_name: payload.donor_name,
      amount: payload.amount,
      created_at: new Date().toISOString()
    };
    persist();
    triggerRealtime('DONATION_RECEIVED', { donation, campaign: store.campaigns[idx] });
    return { donation, campaign: store.campaigns[idx] };
  },

  // Emergency Contacts
  getContacts: (user_id?: string): EmergencyContact[] => {
    return [...store.contacts];
  },
  addContact: (payload: Partial<EmergencyContact>): EmergencyContact => {
    const id = `ec-${Date.now()}`;
    const contact: EmergencyContact = {
      id,
      user_id: payload.user_id || store.currentUser.user.id,
      name: payload.name || 'Emergency Helper',
      relationship: payload.relationship || 'Friend',
      phone_number: payload.phone_number || '+91 94440 00000',
      category: payload.category || 'FAMILY',
      is_global_helpline: 0,
      created_at: new Date().toISOString()
    };
    store.contacts.push(contact);
    persist();
    return contact;
  },

  // Auth & Demo switcher
  demoSwitch: (role: string, id?: string): { user: User; profile: Profile; volunteer?: Volunteer; token: string } => {
    const now = new Date().toISOString();
    let user: User;
    let profile: Profile;
    let volunteer: Volunteer | undefined;

    if (role === 'VOLUNTEER') {
      user = { id: 'user-vol-1', email: 'demo.volunteer@example.com', role: 'VOLUNTEER', created_at: now, updated_at: now };
      profile = {
        id: 'user-vol-1',
        name: 'Senthil Kumar (DEMO DATA)',
        mobile_number: '+91 98840 99887',
        area: 'Velachery',
        city: 'Chennai',
        district: 'Chennai',
        preferred_language: 'ta',
        is_setup_completed: 1,
        created_at: now,
        updated_at: now
      };
      volunteer = store.volunteers.find(v => v.id === 'user-vol-1') || store.volunteers[0];
    } else if (role === 'ADMIN') {
      user = { id: 'user-admin-1', email: 'demo.admin@example.com', role: 'ADMIN', created_at: now, updated_at: now };
      profile = {
        id: 'user-admin-1',
        name: 'TN State Emergency HQ (DEMO DATA)',
        mobile_number: '+91 94450 00108',
        area: 'Chennai Central',
        city: 'Chennai',
        district: 'Chennai',
        preferred_language: 'ta',
        is_setup_completed: 1,
        created_at: now,
        updated_at: now
      };
    } else {
      user = { id: 'user-citizen-1', email: 'demo.citizen@example.com', role: 'CITIZEN', created_at: now, updated_at: now };
      profile = {
        id: 'user-citizen-1',
        name: 'Kavitha Ramachandran (DEMO DATA)',
        mobile_number: '+91 98765 43210',
        area: 'Velachery',
        city: 'Chennai',
        district: 'Chennai',
        preferred_language: 'ta',
        is_setup_completed: 1,
        created_at: now,
        updated_at: now
      };
    }

    const payload = { user, profile, volunteer, token: `demo-token-${role.toLowerCase()}` };
    store.currentUser = payload;
    persist();
    triggerRealtime('AUTH_STATE_CHANGED', payload);
    return payload;
  },
  login: (email: string) => {
    return localStore.demoSwitch(email.includes('admin') ? 'ADMIN' : email.includes('vol') ? 'VOLUNTEER' : 'CITIZEN');
  },
  signup: (payload: any) => {
    return localStore.demoSwitch(payload.role || 'CITIZEN');
  },
  getMe: (user_id?: string) => {
    return store.currentUser;
  },
  updateProfile: (payload: any) => {
    store.currentUser.profile = {
      ...store.currentUser.profile,
      ...payload,
      updated_at: new Date().toISOString()
    };
    persist();
    return store.currentUser;
  },

  // Media upload fallback
  uploadFile: async (file: File | Blob, filename = 'media.webm'): Promise<{ url: string; filename: string; mimetype: string; size: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string) || '';
        resolve({
          url: base64Data,
          filename,
          mimetype: file.type || 'image/jpeg',
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    });
  }
};
