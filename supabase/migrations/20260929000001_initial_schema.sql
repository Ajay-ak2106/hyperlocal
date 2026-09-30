-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up previous tables if they exist (for a fresh start)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS verification_records CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS fund_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS shelter_capacity CASCADE;
DROP TABLE IF EXISTS shelters CASCADE;
DROP TABLE IF EXISTS flood_media CASCADE;
DROP TABLE IF EXISTS flood_reports CASCADE;
DROP TABLE IF EXISTS safety_checkins CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS community_groups CASCADE;
DROP TABLE IF EXISTS resource_inventory CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS volunteer_assignments CASCADE;
DROP TABLE IF EXISTS volunteer_availability CASCADE;
DROP TABLE IF EXISTS volunteer_certifications CASCADE;
DROP TABLE IF EXISTS volunteer_skills CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS assistance_updates CASCADE;
DROP TABLE IF EXISTS assistance_requests CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS incident_updates CASCADE;
DROP TABLE IF EXISTS incident_media CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'volunteer', 'coordinator', 'agency')),
    language TEXT NOT NULL DEFAULT 'ta',
    area TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INCIDENTS
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('flood', 'cyclone', 'fire', 'medical', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'assigned', 'in_progress', 'resolved')),
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AID REQUESTS
CREATE TABLE aid_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    need_type TEXT NOT NULL CHECK (need_type IN ('food', 'water', 'boat', 'medical', 'shelter', 'other')),
    quantity INT DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VOLUNTEERS
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skills TEXT[],
    availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INCIDENT UPDATES
CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ALERTS / BROADCASTS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_incidents_location ON incidents(latitude, longitude);

CREATE INDEX idx_aid_requests_status ON aid_requests(status);
CREATE INDEX idx_aid_requests_created_at ON aid_requests(created_at);

CREATE INDEX idx_volunteers_location ON volunteers(current_lat, current_lng);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_incident_updates_created_at ON incident_updates(created_at);
