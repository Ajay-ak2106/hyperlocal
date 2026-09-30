-- Enable Supabase Realtime for the required tables
alter publication supabase_realtime add table incidents;
alter publication supabase_realtime add table aid_requests;
alter publication supabase_realtime add table incident_updates;
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table volunteers;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- INCIDENTS POLICIES
-- ==========================================
-- Anyone can see incidents
CREATE POLICY "Incidents are viewable by everyone" ON incidents FOR SELECT USING (true);

-- Citizens (or any logged in user) can create incidents
CREATE POLICY "Authenticated users can create incidents" ON incidents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Reporters can update their own incidents; Coordinators/Agencies can update any
CREATE POLICY "Users can update own incidents or if coordinator/agency" ON incidents FOR UPDATE USING (
  auth.uid() = reporter_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coordinator', 'agency'))
);

-- ==========================================
-- AID REQUESTS POLICIES
-- ==========================================
-- Requesters see own requests. Volunteers/Coordinators/Agencies see all requests.
CREATE POLICY "Aid requests viewable by requester, volunteers, coordinators, agencies" ON aid_requests FOR SELECT USING (
  auth.uid() = requester_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('volunteer', 'coordinator', 'agency'))
);

CREATE POLICY "Authenticated users can create aid requests" ON aid_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Requesters can update own; assigned volunteers can update; coordinators/agencies can update
CREATE POLICY "Requesters, assigned volunteers, and coordinators can update aid requests" ON aid_requests FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_volunteer_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coordinator', 'agency'))
);

-- ==========================================
-- VOLUNTEERS POLICIES
-- ==========================================
-- Anyone can view volunteers (for map)
CREATE POLICY "Volunteers viewable by everyone" ON volunteers FOR SELECT USING (true);

-- Volunteers can manage their own volunteer profile
CREATE POLICY "Volunteers can insert own record" ON volunteers FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Volunteers can update own record" ON volunteers FOR UPDATE USING (auth.uid() = profile_id);

-- ==========================================
-- INCIDENT UPDATES POLICIES
-- ==========================================
-- Anyone can read updates
CREATE POLICY "Incident updates viewable by everyone" ON incident_updates FOR SELECT USING (true);

-- Anyone logged in can post updates (or restrict to coordinators/agencies if preferred, but usually reporters and responders can update)
CREATE POLICY "Authenticated users can create incident updates" ON incident_updates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================================
-- ALERTS POLICIES
-- ==========================================
-- Anyone can view alerts
CREATE POLICY "Alerts viewable by everyone" ON alerts FOR SELECT USING (true);

-- Only agencies and coordinators can create alerts
CREATE POLICY "Agencies and coordinators can create alerts" ON alerts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coordinator', 'agency'))
);
