-- ====================================================================
-- NammaRescue: Hyperlocal Disaster Response Seed Data
-- Clearly labeled: DEMO DATA for Hackathon Prototype Demonstration
-- ====================================================================

-- 1. DEMO USERS
INSERT INTO users (id, email, role) VALUES
('00000000-0000-0000-0000-000000000001', 'demo.citizen@example.com', 'CITIZEN'),
('00000000-0000-0000-0000-000000000002', 'kavitha.citizen@example.com', 'CITIZEN'),
('00000000-0000-0000-0000-000000000003', 'muthu.citizen@example.com', 'CITIZEN'),
('00000000-0000-0000-0000-000000000004', 'anitha.citizen@example.com', 'CITIZEN'),
('00000000-0000-0000-0000-000000000005', 'ravi.citizen@example.com', 'CITIZEN'),
('00000000-0000-0000-0000-000000000011', 'demo.volunteer@example.com', 'VOLUNTEER'),
('00000000-0000-0000-0000-000000000012', 'senthil.volunteer@example.com', 'VOLUNTEER'),
('00000000-0000-0000-0000-000000000013', 'priya.volunteer@example.com', 'VOLUNTEER'),
('00000000-0000-0000-0000-000000000014', 'karthik.volunteer@example.com', 'VOLUNTEER'),
('00000000-0000-0000-0000-000000000015', 'deepa.volunteer@example.com', 'VOLUNTEER'),
('00000000-0000-0000-0000-000000000099', 'demo.admin@example.com', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- 2. DEMO PROFILES
INSERT INTO profiles (id, name, mobile_number, area, city, district, preferred_language, is_setup_completed) VALUES
('00000000-0000-0000-0000-000000000001', 'Kavitha Ramachandran (DEMO DATA)', '+91 98765 43210', 'Velachery', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000002', 'Meenakshi Sundaram (DEMO DATA)', '+91 98401 23456', 'Pallikaranai', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000003', 'Muthukumar S (DEMO DATA)', '+91 97910 98765', 'Tambaram', 'Chennai', 'Chengalpattu', 'ta', true),
('00000000-0000-0000-0000-000000000004', 'Anitha Krishnan (DEMO DATA)', '+91 94441 55667', 'Madipakkam', 'Chennai', 'Chennai', 'en', true),
('00000000-0000-0000-0000-000000000005', 'Ravi Shankar (DEMO DATA)', '+91 91760 11223', 'Saidapet', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000011', 'Senthil Kumar (DEMO DATA)', '+91 98840 99887', 'Velachery', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000012', 'Dr. Priya Narayanan (DEMO DATA)', '+91 98410 44332', 'Adyar', 'Chennai', 'Chennai', 'en', true),
('00000000-0000-0000-0000-000000000013', 'Karthik Raja (DEMO DATA)', '+91 99620 77889', 'Tambaram', 'Chennai', 'Chengalpattu', 'ta', true),
('00000000-0000-0000-0000-000000000014', 'Deepa Lakshmi (DEMO DATA)', '+91 97890 33445', 'Perungudi', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000015', 'Rajesh Kannan (DEMO DATA)', '+91 95000 66778', 'Pallikaranai', 'Chennai', 'Chennai', 'ta', true),
('00000000-0000-0000-0000-000000000099', 'TN State Emergency HQ (DEMO DATA)', '+91 94450 00108', 'Chennai Central', 'Chennai', 'Chennai', 'ta', true)
ON CONFLICT (id) DO NOTHING;

-- 3. DEMO VOLUNTEERS
INSERT INTO volunteers (id, full_name, phone, area, latitude, longitude, availability_status, emergency_contact, has_vehicle, vehicle_type) VALUES
('00000000-0000-0000-0000-000000000011', 'Senthil Kumar (DEMO DATA)', '+91 98840 99887', 'Velachery', 12.9780, 80.2210, 'AVAILABLE', '+91 98840 00001', true, 'Inflatable Rescue Boat & 4x4 SUV'),
('00000000-0000-0000-0000-000000000012', 'Dr. Priya Narayanan (DEMO DATA)', '+91 98410 44332', 'Adyar', 13.0067, 80.2570, 'AVAILABLE', '+91 98410 00002', true, 'Emergency Medical Response Car'),
('00000000-0000-0000-0000-000000000013', 'Karthik Raja (DEMO DATA)', '+91 99620 77889', 'Tambaram', 12.9229, 80.1275, 'AVAILABLE', '+91 99620 00003', true, 'Heavy Transport Truck'),
('00000000-0000-0000-0000-000000000014', 'Deepa Lakshmi (DEMO DATA)', '+91 97890 33445', 'Perungudi', 12.9654, 80.2461, 'AVAILABLE', '+91 97890 00004', false, NULL),
('00000000-0000-0000-0000-000000000015', 'Rajesh Kannan (DEMO DATA)', '+91 95000 66778', 'Pallikaranai', 12.9348, 80.2138, 'AVAILABLE', '+91 95000 00005', true, 'Motorcycle & Drone')
ON CONFLICT (id) DO NOTHING;

-- 4. VOLUNTEER SKILLS & CERTIFICATIONS
INSERT INTO volunteer_skills (volunteer_id, skill_name) VALUES
('00000000-0000-0000-0000-000000000011', 'FLOOD RESCUE'),
('00000000-0000-0000-0000-000000000011', 'SWIMMING'),
('00000000-0000-0000-0000-000000000011', 'BOAT OPERATION'),
('00000000-0000-0000-0000-000000000011', 'FIRST AID'),
('00000000-0000-0000-0000-000000000012', 'MEDICAL'),
('00000000-0000-0000-0000-000000000012', 'CPR'),
('00000000-0000-0000-0000-000000000012', 'FIRST AID'),
('00000000-0000-0000-0000-000000000013', 'LOGISTICS'),
('00000000-0000-0000-0000-000000000013', 'DRIVING'),
('00000000-0000-0000-0000-000000000013', 'FOOD DISTRIBUTION'),
('00000000-0000-0000-0000-000000000014', 'COMMUNICATION'),
('00000000-0000-0000-0000-000000000014', 'TRANSLATION'),
('00000000-0000-0000-0000-000000000014', 'CHILD CARE'),
('00000000-0000-0000-0000-000000000015', 'DRONE OPERATION'),
('00000000-0000-0000-0000-000000000015', 'TECHNICAL SUPPORT');

-- 5. DEMO COMMUNITIES
INSERT INTO community_groups (id, name, area, description) VALUES
('10000000-0000-0000-0000-000000000001', 'Velachery Lake Ward Community', 'Velachery', 'Residents & volunteer network covering Velachery bypass, 100ft road and lake zone.'),
('10000000-0000-0000-0000-000000000002', 'Tambaram & Mudichur Relief Circle', 'Tambaram', 'Coordination hub for Tambaram Sanatorium, Mudichur and Krishna Nagar areas.'),
('10000000-0000-0000-0000-000000000003', 'Pallikaranai Marsh & Medavakkam Safety Group', 'Pallikaranai', 'Community watch and rapid alert network for low-lying marsh boundary zones.')
ON CONFLICT (id) DO NOTHING;

-- 6. DEMO SHELTERS
INSERT INTO shelters (id, name, area, address, latitude, longitude, capacity, current_occupancy, has_food, has_water, has_medical, has_accessibility, contact_person, contact_phone, status, is_demo) VALUES
('20000000-0000-0000-0000-000000000001', 'Velachery Community Hall Shelter (DEMO DATA)', 'Velachery', 'No. 12, Gandhi Salai, Velachery, Chennai', 12.9754, 80.2206, 350, 142, true, true, true, true, 'Officer Murugan', '+91 94440 12345', 'AVAILABLE', true),
('20000000-0000-0000-0000-000000000002', 'Tambaram Govt Higher Secondary School (DEMO DATA)', 'Tambaram', 'GST Road, Near Tambaram Station, Chennai', 12.9249, 80.1299, 500, 480, true, true, true, true, 'Headmaster Selvam', '+91 94440 23456', 'LIMITED', true),
('20000000-0000-0000-0000-000000000003', 'Pallikaranai Relief Center (DEMO DATA)', 'Pallikaranai', 'Dr. Ambedkar Road, Pallikaranai, Chennai', 12.9360, 80.2155, 250, 85, true, true, true, false, 'Coordinator Revathi', '+91 94440 34567', 'AVAILABLE', true),
('20000000-0000-0000-0000-000000000004', 'Madipakkam Disaster Relief Hub (DEMO DATA)', 'Madipakkam', 'Bazaar Road, Madipakkam, Chennai', 12.9620, 80.1980, 200, 200, true, true, false, true, 'Inspector Baskar', '+91 94440 45678', 'FULL', true),
('20000000-0000-0000-0000-000000000005', 'Saidapet Teachers Training College (DEMO DATA)', 'Saidapet', 'Anna Salai, Saidapet, Chennai', 13.0210, 80.2230, 400, 95, true, true, true, true, 'Director Raman', '+91 94440 56789', 'AVAILABLE', true)
ON CONFLICT (id) DO NOTHING;

-- 7. DEMO RESOURCES
INSERT INTO resources (id, provider_name, provider_phone, category, name, quantity, unit, area, latitude, longitude, delivery_mode, status, is_demo) VALUES
('30000000-0000-0000-0000-000000000001', 'Velachery Youth Welfare Trust (DEMO DATA)', '+91 98400 11223', 'FOOD', 'Packed Hot Meals (Sambar Rice & Biscuits)', 450, 'packets', 'Velachery', 12.9790, 80.2195, 'PICKUP_OR_DELIVERY', 'AVAILABLE', true),
('30000000-0000-0000-0000-000000000002', 'Lions Club South Chennai (DEMO DATA)', '+91 98400 22334', 'WATER', '20L Mineral Water Bubble Cans', 120, 'cans', 'Pallikaranai', 12.9380, 80.2120, 'PICKUP', 'AVAILABLE', true),
('30000000-0000-0000-0000-000000000003', 'Red Cross Chennai Chapter (DEMO DATA)', '+91 98400 33445', 'FIRST_AID', 'Trauma & Wound First Aid Kits', 80, 'kits', 'Saidapet', 13.0195, 80.2215, 'DELIVERY', 'AVAILABLE', true),
('30000000-0000-0000-0000-000000000004', 'Chennai Marine Rescuers (DEMO DATA)', '+91 98400 44556', 'BOATS', 'Fiberglass Inflatable Rescue Boats with Motors', 4, 'boats', 'Velachery', 12.9730, 80.2240, 'DELIVERY', 'AVAILABLE', true),
('30000000-0000-0000-0000-000000000005', 'Community Tech Group (DEMO DATA)', '+91 98400 55667', 'CHARGING_STATIONS', 'High-Capacity Multi-Port Solar Generators', 8, 'stations', 'Tambaram', 12.9260, 80.1280, 'PICKUP', 'AVAILABLE', true)
ON CONFLICT (id) DO NOTHING;

-- 8. DEMO INCIDENTS (10)
INSERT INTO incidents (id, reporter_name, reporter_phone, type, severity, description, area, latitude, longitude, status, verification_status, number_affected, is_demo) VALUES
('40000000-0000-0000-0000-000000000001', 'Kavitha R', '+91 98765 43210', 'FLOOD', 'CRITICAL', 'Water logging over 3.5 feet near Velachery MRTS. Ground floor houses flooded.', 'Velachery', 12.9785, 80.2215, 'ACTIVE', 'VERIFIED', 150, true),
('40000000-0000-0000-0000-000000000002', 'Muthu S', '+91 97910 98765', 'ROAD_BLOCK', 'HIGH', 'Uprooted banyan tree blocking main GST Road junction near Tambaram station.', 'Tambaram', 12.9235, 80.1285, 'ACTIVE', 'VERIFIED', 200, true),
('40000000-0000-0000-0000-000000000003', 'Anitha K', '+91 94441 55667', 'MEDICAL', 'CRITICAL', 'Elderly diabetic patient needing immediate insulin and ambulance transfer.', 'Madipakkam', 12.9635, 80.1990, 'ACTIVE', 'VERIFIED', 1, true),
('40000000-0000-0000-0000-000000000004', 'Rajesh K', '+91 95000 66778', 'FLOOD', 'HIGH', 'Water entering residential street. Drainage overflowing rapidly.', 'Pallikaranai', 12.9355, 80.2140, 'ACTIVE', 'UNDER_VERIFICATION', 45, true),
('40000000-0000-0000-0000-000000000005', 'Saidapet Resident Association', '+91 94440 99991', 'POWER_ISSUE', 'MEDIUM', 'Transformer spark and power outage affecting 3 streets for 10 hours.', 'Saidapet', 13.0180, 80.2220, 'ACTIVE', 'VERIFIED', 120, true),
('40000000-0000-0000-0000-000000000006', 'Suresh Babu', '+91 94440 99992', 'BUILDING_DAMAGE', 'HIGH', 'Compound wall collapsed near school lane due to heavy downpour.', 'Perungudi', 12.9660, 80.2470, 'UNDER_REVIEW', 'UNDER_VERIFICATION', 20, true),
('40000000-0000-0000-0000-000000000007', 'Vimala Devi', '+91 94440 99993', 'FIRE', 'CRITICAL', 'Short circuit electrical fire in commercial complex meter box.', 'Adyar', 13.0080, 80.2560, 'ACTIVE', 'VERIFIED', 35, true),
('40000000-0000-0000-0000-000000000008', 'Karthik N', '+91 94440 99994', 'MISSING_PERSON', 'HIGH', '72-year-old grandfather missing since morning flood evacuation.', 'Tambaram', 12.9210, 80.1260, 'ACTIVE', 'VERIFIED', 1, true),
('40000000-0000-0000-0000-000000000009', 'Naveen Kumar', '+91 94440 99995', 'CYCLONE', 'HIGH', 'Tin roofing sheets blown onto road and low tension cables dangling.', 'Medavakkam', 12.9180, 80.1920, 'ACTIVE', 'UNVERIFIED', 15, true),
('40000000-0000-0000-0000-000000000010', 'Control Room Volunteer', '+91 94440 99996', 'ROAD_BLOCK', 'LOW', 'Water receded near bridge. Road cleared of debris.', 'Saidapet', 13.0170, 80.2200, 'RESOLVED', 'VERIFIED', 0, true)
ON CONFLICT (id) DO NOTHING;

-- 9. DEMO ASSISTANCE REQUESTS (5)
INSERT INTO assistance_requests (id, citizen_name, citizen_phone, category, severity, description, area, latitude, longitude, status, assigned_volunteer_id, assigned_volunteer_name, is_demo) VALUES
('50000000-0000-0000-0000-000000000001', 'Meenakshi Sundaram', '+91 98401 23456', 'MEDICAL', 'CRITICAL', 'Need oxygen cylinder and medical escort for heart patient trapped on first floor.', 'Pallikaranai', 12.9370, 80.2130, 'ACCEPTED', '00000000-0000-0000-0000-000000000012', 'Dr. Priya Narayanan', true),
('50000000-0000-0000-0000-000000000002', 'Ravi Shankar', '+91 91760 11223', 'FOOD', 'HIGH', 'Family of 6 including 2 toddlers without drinking water and baby formula.', 'Saidapet', 13.0200, 80.2245, 'PENDING', NULL, NULL, true),
('50000000-0000-0000-0000-000000000003', 'Kavitha R', '+91 98765 43210', 'RESCUE', 'CRITICAL', 'Elderly couple in ground floor house with flood level reaching 4 feet. Need boat rescue.', 'Velachery', 12.9775, 80.2220, 'PENDING', NULL, NULL, true),
('50000000-0000-0000-0000-000000000004', 'Selvi P', '+91 94440 88771', 'ELDERLY', 'MEDIUM', 'Wheelchair bound grandmother needs relocation to dry higher ground shelter.', 'Madipakkam', 12.9640, 80.1970, 'PENDING', NULL, NULL, true),
('50000000-0000-0000-0000-000000000005', 'Gopal V', '+91 94440 88772', 'POWER', 'LOW', 'Need high-power torch and battery backup for life support nebulizer.', 'Tambaram', 12.9240, 80.1290, 'COMPLETED', '00000000-0000-0000-0000-000000000013', 'Karthik Raja', true)
ON CONFLICT (id) DO NOTHING;

-- 10. DEMO SAFETY CHECK-INS
INSERT INTO safety_checkins (id, user_name, user_phone, community_id, status, note, area, latitude, longitude, is_demo) VALUES
('60000000-0000-0000-0000-000000000001', 'Kavitha Ramachandran', '+91 98765 43210', '10000000-0000-0000-0000-000000000001', 'SAFE', 'Moved to 2nd floor, have safe food and water.', 'Velachery', 12.9780, 80.2210, true),
('60000000-0000-0000-0000-000000000002', 'Meenakshi Sundaram', '+91 98401 23456', '10000000-0000-0000-0000-000000000003', 'NEED_HELP', 'Water entering ground floor, need assistance moving elderly.', 'Pallikaranai', 12.9360, 80.2140, true),
('60000000-0000-0000-0000-000000000003', 'Muthukumar S', '+91 97910 98765', '10000000-0000-0000-0000-000000000002', 'SAFE', 'Safe at home, generator running.', 'Tambaram', 12.9230, 80.1270, true),
('60000000-0000-0000-0000-000000000004', 'Anitha Krishnan', '+91 94441 55667', '10000000-0000-0000-0000-000000000001', 'EMERGENCY', 'Medical emergency, need ambulance dispatch immediately.', 'Madipakkam', 12.9630, 80.1980, true)
ON CONFLICT (id) DO NOTHING;

-- 11. DEMO BROADCAST ALERTS
INSERT INTO alerts (id, title, title_ta, description, description_ta, severity, area, active) VALUES
('70000000-0000-0000-0000-000000000001', 
 'RED ALERT: Heavy Inflow into Chembarambakkam & Velachery Inundation',
 'சிவப்பு எச்சரிக்கை: செம்பரம்பாக்கம் ஏரி உபரி நீர் திறப்பு - வேளச்சேரி பகுதி மக்கள் எச்சரிக்கை',
 'NDRF and State Disaster Response teams deployed. Avoid low lying underpasses and ground floor dwellings.',
 'தேசிய பேரிடர் மீட்புப் படை களத்தில் உள்ளது. தாழ்வான பகுதிகள் மற்றும் சுரங்கப்பாதைகளைத் தவிர்க்கவும்.',
 'EMERGENCY', 'South Chennai Zone', true),
('70000000-0000-0000-0000-000000000002', 
 'WARNING: High Tide Advisory along ECR & Adyar Estuary',
 'எச்சரிக்கை: அடையாறு முகத்துவாரம் பகுதியில் கடல் சீற்றம்',
 'Fishermen warned not to venture into coastal backwaters until midnight.',
 'அடையாறு கழிமுகப் பகுதிகளில் மீனவர்கள் செல்ல வேண்டாம் என்று அறிவுறுத்தப்படுகிறது.',
 'WARNING', 'Adyar & ECR', true)
ON CONFLICT (id) DO NOTHING;

-- 12. DEMO FUND CAMPAIGN & DONATIONS
INSERT INTO fund_campaigns (id, title, description, target_amount, collected_amount, donor_count, is_active, is_demo) VALUES
('80000000-0000-0000-0000-000000000001', 
 'NammaChennai Cyclone & Flood Rapid Relief Fund',
 'Emergency food packs, drinking water tankers, baby essentials and medical kits distributed across affected zones in South Chennai.',
 1000000.00, 342500.00, 184, true, true)
ON CONFLICT (id) DO NOTHING;

-- 13. GLOBAL EMERGENCY HELPLINES
INSERT INTO emergency_contacts (name, relationship, phone_number, category, is_global_helpline) VALUES
('State Disaster Emergency Control Room', 'GOVT', '1070', 'DISASTER_MANAGEMENT', true),
('District Disaster Helpline (Chennai)', 'GOVT', '1077', 'DISASTER_MANAGEMENT', true),
('Ambulance Emergency Services', 'EMERGENCY', '108', 'AMBULANCE', true),
('Police Emergency Control', 'EMERGENCY', '100', 'POLICE', true),
('Fire & Rescue Services', 'EMERGENCY', '101', 'FIRE', true),
('Greater Chennai Corporation Flood Helpline', 'MUNICIPAL', '1913', 'HELPLINE', true),
('Electricity Board (TANGEDCO) Emergency', 'UTILITY', '94987 94987', 'HELPLINE', true)
ON CONFLICT DO NOTHING;
