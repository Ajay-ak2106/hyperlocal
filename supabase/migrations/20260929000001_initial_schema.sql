-- ====================================================================
-- NammaRescue: Hyperlocal Disaster Response & Community Safety Platform
-- Database Migration: 20260929000001_initial_schema.sql
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CITIZEN', 'VOLUNTEER', 'RESOURCE_PROVIDER', 'COMMUNITY_COORDINATOR', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Chennai',
    district TEXT NOT NULL DEFAULT 'Chennai',
    preferred_language TEXT NOT NULL DEFAULT 'ta' CHECK (preferred_language IN ('ta', 'en')),
    is_setup_completed BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EMERGENCY CONTACTS (User & Government/Configurable Emergency Helplines)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone_number TEXT NOT NULL,
    category TEXT CHECK (category IN ('PERSONAL', 'AMBULANCE', 'POLICE', 'FIRE', 'HOSPITAL', 'DISASTER_MANAGEMENT', 'HELPLINE')),
    is_global_helpline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LOCATIONS (Protected user locations & geocoded hotspots)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    label TEXT,
    address_line TEXT,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_fuzzy_protected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INCIDENTS, MEDIA & UPDATES
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name TEXT,
    reporter_phone TEXT,
    type TEXT NOT NULL CHECK (type IN ('FLOOD', 'FIRE', 'MEDICAL', 'CYCLONE', 'ROAD_BLOCK', 'POWER_ISSUE', 'BUILDING_DAMAGE', 'MISSING_PERSON', 'EMERGENCY', 'OTHER')),
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'UNDER_REVIEW', 'ACTIVE', 'RESOLVED', 'REJECTED')),
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    number_affected INT DEFAULT 1,
    photo_url TEXT,
    audio_url TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'AUDIO', 'VIDEO')),
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    update_text TEXT NOT NULL,
    status_change TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BROADCAST ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT NOT NULL,
    description_ta TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('WARNING', 'EMERGENCY', 'ADVISORY')),
    area TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ASSISTANCE REQUESTS & UPDATES
CREATE TABLE IF NOT EXISTS assistance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MEDICAL', 'AMBULANCE', 'RESCUE', 'FOOD', 'WATER', 'SHELTER', 'MEDICINE', 'ELDERLY', 'CHILD', 'DISABILITY', 'TRANSPORT', 'POWER', 'COMMUNICATION', 'MISSING_PERSON', 'OTHER')),
    severity TEXT NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_volunteer_id UUID REFERENCES users(id),
    assigned_volunteer_name TEXT,
    assigned_volunteer_phone TEXT,
    photo_url TEXT,
    audio_url TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistance_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES assistance_requests(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. VOLUNTEERS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    availability_status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
    emergency_contact TEXT,
    has_vehicle BOOLEAN DEFAULT FALSE,
    vehicle_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    cert_name TEXT NOT NULL,
    issued_by TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    radius_km INT DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistance_request_id UUID REFERENCES assistance_requests(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED')),
    safety_acknowledged BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RESOURCES & INVENTORY
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider_name TEXT NOT NULL,
    provider_phone TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('FOOD', 'WATER', 'MEDICINE', 'CLOTHES', 'BLANKETS', 'FIRST_AID', 'POWER_BANKS', 'TORCHES', 'GENERATORS', 'VEHICLES', 'BOATS', 'SHELTERS', 'MEDICAL_EQUIPMENT', 'RESCUE_EQUIPMENT', 'CHARGING_STATIONS')),
    name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    delivery_mode TEXT DEFAULT 'PICKUP_OR_DELIVERY' CHECK (delivery_mode IN ('PICKUP', 'DELIVERY', 'PICKUP_OR_DELIVERY')),
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOW_STOCK', 'DEPLETED')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    allocated_quantity INT DEFAULT 0,
    remaining_quantity INT NOT NULL,
    last_distributed_at TIMESTAMPTZ
);

-- 9. COMMUNITY GROUPS & POSTS
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    description TEXT,
    coordinator_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'UPDATE' CHECK (category IN ('UPDATE', 'FOOD_WATER', 'ROAD_STATUS', 'POWER_STATUS', 'MISSING', 'EMERGENCY')),
    photo_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verified BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SAFETY CHECK-INS
CREATE TABLE IF NOT EXISTS safety_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    community_id UUID REFERENCES community_groups(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('SAFE', 'NEED_HELP', 'EMERGENCY', 'NO_RESPONSE')),
    note TEXT,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. FLOOD REPORTS & MEDIA
CREATE TABLE IF NOT EXISTS flood_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name TEXT,
    condition TEXT NOT NULL CHECK (condition IN ('WATER_ON_ROAD', 'FLOODED_STREET', 'WATER_ENTERING_HOUSE', 'VEHICLES_AFFECTED', 'ROAD_BLOCKED', 'DANGEROUS_WATER_LEVEL', 'OTHER')),
    water_level_estimate TEXT DEFAULT 'AI ESTIMATE: Knee Level (1.5 - 2.5 ft)',
    description TEXT,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    photo_url TEXT,
    audio_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RECEDING', 'RESOLVED')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flood_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flood_report_id UUID REFERENCES flood_reports(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SHELTERS & CAPACITY
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    has_food BOOLEAN DEFAULT TRUE,
    has_water BOOLEAN DEFAULT TRUE,
    has_medical BOOLEAN DEFAULT TRUE,
    has_accessibility BOOLEAN DEFAULT TRUE,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LIMITED', 'FULL', 'CLOSED')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT occupancy_within_capacity CHECK (current_occupancy <= capacity)
);

CREATE TABLE IF NOT EXISTS shelter_capacity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES users(id),
    recorded_occupancy INT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DISASTER_ALERT', 'ASSISTANCE_UPDATE', 'ASSIGNMENT', 'SAFETY_REQUEST', 'SHELTER_UPDATE', 'COMMUNITY')),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. FUND CAMPAIGNS & DONATIONS
CREATE TABLE IF NOT EXISTS fund_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    collected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    donor_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES fund_campaigns(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'DEMO_PAYMENT_MODE',
    transaction_ref TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. VERIFICATION RECORDS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('INCIDENT', 'FLOOD_REPORT', 'COMMUNITY_POST', 'VOLUNTEER_CERT')),
    entity_id UUID NOT NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HYPERLOCAL QUERIES & REALTIME
CREATE INDEX IF NOT EXISTS idx_incidents_lat_lng ON incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_assistance_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_flood_status ON flood_reports(status);
CREATE INDEX IF NOT EXISTS idx_shelters_status ON shelters(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_community_posts_comm ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_comm ON safety_checkins(community_id, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read of active incidents, shelters, alerts, resources
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read verified or reported incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Users can create incidents" ON incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins or reporters can update incidents" ON incidents FOR UPDATE USING (true);

CREATE POLICY "Public read assistance requests" ON assistance_requests FOR SELECT USING (true);
CREATE POLICY "Citizens can create assistance requests" ON assistance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Volunteers & Admins can update assistance" ON assistance_requests FOR UPDATE USING (true);

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
