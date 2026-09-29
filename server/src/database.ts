import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'namma_rescue.sqlite');

let dbInstance: Database | null = null;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Persist the database in-memory state to disk
export function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('📦 Loaded existing SQLite database from:', DB_PATH);
    } catch (e) {
      console.warn('Could not read existing DB file, initializing fresh:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('🆕 Initialized new SQLite database in memory');
  }

  initSchemaAndSeed(dbInstance);
  persistDatabase();
  return dbInstance;
}

function initSchemaAndSeed(db: Database) {
  // Execute table definitions
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Chennai',
      district TEXT NOT NULL DEFAULT 'Chennai',
      preferred_language TEXT NOT NULL DEFAULT 'ta',
      is_setup_completed INTEGER NOT NULL DEFAULT 1,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      relationship TEXT,
      phone_number TEXT NOT NULL,
      category TEXT,
      is_global_helpline INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      reporter_id TEXT,
      reporter_name TEXT,
      reporter_phone TEXT,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      area TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'REPORTED',
      verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
      verified_by TEXT,
      verified_at TEXT,
      verification_notes TEXT,
      number_affected INTEGER DEFAULT 1,
      photo_url TEXT,
      audio_url TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assistance_requests (
      id TEXT PRIMARY KEY,
      citizen_id TEXT,
      citizen_name TEXT NOT NULL,
      citizen_phone TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'HIGH',
      description TEXT NOT NULL,
      area TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      assigned_volunteer_id TEXT,
      assigned_volunteer_name TEXT,
      assigned_volunteer_phone TEXT,
      photo_url TEXT,
      audio_url TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      area TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      availability_status TEXT NOT NULL DEFAULT 'AVAILABLE',
      emergency_contact TEXT,
      has_vehicle INTEGER DEFAULT 0,
      vehicle_type TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS volunteer_skills (
      id TEXT PRIMARY KEY,
      volunteer_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS volunteer_assignments (
      id TEXT PRIMARY KEY,
      assistance_request_id TEXT NOT NULL,
      volunteer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ASSIGNED',
      safety_acknowledged INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      provider_id TEXT,
      provider_name TEXT NOT NULL,
      provider_phone TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'units',
      area TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      delivery_mode TEXT DEFAULT 'PICKUP_OR_DELIVERY',
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      area TEXT NOT NULL,
      description TEXT,
      coordinator_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      author_id TEXT,
      author_name TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT DEFAULT 'UPDATE',
      photo_url TEXT,
      latitude REAL,
      longitude REAL,
      verified INTEGER DEFAULT 0,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS safety_checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_phone TEXT,
      community_id TEXT,
      status TEXT NOT NULL,
      note TEXT,
      area TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS flood_reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT,
      reporter_name TEXT,
      condition TEXT NOT NULL,
      water_level_estimate TEXT,
      description TEXT,
      area TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      photo_url TEXT,
      audio_url TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shelters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      capacity INTEGER NOT NULL,
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      has_food INTEGER DEFAULT 1,
      has_water INTEGER DEFAULT 1,
      has_medical INTEGER DEFAULT 1,
      has_accessibility INTEGER DEFAULT 1,
      contact_person TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      related_entity_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fund_campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target_amount REAL NOT NULL,
      collected_amount REAL NOT NULL DEFAULT 0.0,
      donor_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_demo INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      donor_name TEXT NOT NULL,
      donor_email TEXT,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'DEMO_PAYMENT_MODE',
      transaction_ref TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_ta TEXT,
      description TEXT NOT NULL,
      description_ta TEXT,
      severity TEXT NOT NULL,
      area TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Check if seed data needed
  const res = db.exec("SELECT COUNT(*) as count FROM users;");
  const count = res[0]?.values[0]?.[0] as number;

  if (count === 0) {
    console.log('🌱 Seeding initial demo database records...');
    seedDemoData(db);
  }
}

function seedDemoData(db: Database) {
  const now = new Date().toISOString();

  // Users
  db.run(`
    INSERT INTO users (id, email, role, created_at, updated_at) VALUES
    ('user-citizen-1', 'demo.citizen@example.com', 'CITIZEN', '${now}', '${now}'),
    ('user-citizen-2', 'kavitha.citizen@example.com', 'CITIZEN', '${now}', '${now}'),
    ('user-citizen-3', 'muthu.citizen@example.com', 'CITIZEN', '${now}', '${now}'),
    ('user-citizen-4', 'anitha.citizen@example.com', 'CITIZEN', '${now}', '${now}'),
    ('user-citizen-5', 'ravi.citizen@example.com', 'CITIZEN', '${now}', '${now}'),
    ('user-vol-1', 'demo.volunteer@example.com', 'VOLUNTEER', '${now}', '${now}'),
    ('user-vol-2', 'senthil.volunteer@example.com', 'VOLUNTEER', '${now}', '${now}'),
    ('user-vol-3', 'priya.volunteer@example.com', 'VOLUNTEER', '${now}', '${now}'),
    ('user-vol-4', 'karthik.volunteer@example.com', 'VOLUNTEER', '${now}', '${now}'),
    ('user-vol-5', 'deepa.volunteer@example.com', 'VOLUNTEER', '${now}', '${now}'),
    ('user-admin-1', 'demo.admin@example.com', 'ADMIN', '${now}', '${now}');
  `);

  // Profiles
  db.run(`
    INSERT INTO profiles (id, name, mobile_number, area, city, district, preferred_language, is_setup_completed, created_at, updated_at) VALUES
    ('user-citizen-1', 'Kavitha Ramachandran (DEMO DATA)', '+91 98765 43210', 'Velachery', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-citizen-2', 'Meenakshi Sundaram (DEMO DATA)', '+91 98401 23456', 'Pallikaranai', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-citizen-3', 'Muthukumar S (DEMO DATA)', '+91 97910 98765', 'Tambaram', 'Chennai', 'Chengalpattu', 'ta', 1, '${now}', '${now}'),
    ('user-citizen-4', 'Anitha Krishnan (DEMO DATA)', '+91 94441 55667', 'Madipakkam', 'Chennai', 'Chennai', 'en', 1, '${now}', '${now}'),
    ('user-citizen-5', 'Ravi Shankar (DEMO DATA)', '+91 91760 11223', 'Saidapet', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-vol-1', 'Senthil Kumar (DEMO DATA)', '+91 98840 99887', 'Velachery', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-vol-2', 'Dr. Priya Narayanan (DEMO DATA)', '+91 98410 44332', 'Adyar', 'Chennai', 'Chennai', 'en', 1, '${now}', '${now}'),
    ('user-vol-3', 'Karthik Raja (DEMO DATA)', '+91 99620 77889', 'Tambaram', 'Chennai', 'Chengalpattu', 'ta', 1, '${now}', '${now}'),
    ('user-vol-4', 'Deepa Lakshmi (DEMO DATA)', '+91 97890 33445', 'Perungudi', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-vol-5', 'Rajesh Kannan (DEMO DATA)', '+91 95000 66778', 'Pallikaranai', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}'),
    ('user-admin-1', 'TN State Emergency HQ (DEMO DATA)', '+91 94450 00108', 'Chennai Central', 'Chennai', 'Chennai', 'ta', 1, '${now}', '${now}');
  `);

  // Volunteers Details & Skills
  db.run(`
    INSERT INTO volunteers (id, full_name, phone, area, latitude, longitude, availability_status, emergency_contact, has_vehicle, vehicle_type, created_at, updated_at) VALUES
    ('user-vol-1', 'Senthil Kumar (DEMO DATA)', '+91 98840 99887', 'Velachery', 12.9780, 80.2210, 'AVAILABLE', '+91 98840 00001', 1, 'Inflatable Rescue Boat & 4x4 SUV', '${now}', '${now}'),
    ('user-vol-2', 'Dr. Priya Narayanan (DEMO DATA)', '+91 98410 44332', 'Adyar', 13.0067, 80.2570, 'AVAILABLE', '+91 98410 00002', 1, 'Emergency Medical Car', '${now}', '${now}'),
    ('user-vol-3', 'Karthik Raja (DEMO DATA)', '+91 99620 77889', 'Tambaram', 12.9229, 80.1275, 'AVAILABLE', '+91 99620 00003', 1, 'Heavy Truck', '${now}', '${now}'),
    ('user-vol-4', 'Deepa Lakshmi (DEMO DATA)', '+91 97890 33445', 'Perungudi', 12.9654, 80.2461, 'AVAILABLE', '+91 97890 00004', 0, NULL, '${now}', '${now}'),
    ('user-vol-5', 'Rajesh Kannan (DEMO DATA)', '+91 95000 66778', 'Pallikaranai', 12.9348, 80.2138, 'AVAILABLE', '+91 95000 00005', 1, 'Motorcycle & Drone', '${now}', '${now}');

    INSERT INTO volunteer_skills (id, volunteer_id, skill_name, created_at) VALUES
    ('vs-1', 'user-vol-1', 'FLOOD RESCUE', '${now}'),
    ('vs-2', 'user-vol-1', 'SWIMMING', '${now}'),
    ('vs-3', 'user-vol-1', 'BOAT OPERATION', '${now}'),
    ('vs-4', 'user-vol-1', 'FIRST AID', '${now}'),
    ('vs-5', 'user-vol-2', 'MEDICAL', '${now}'),
    ('vs-6', 'user-vol-2', 'CPR', '${now}'),
    ('vs-7', 'user-vol-2', 'FIRST AID', '${now}'),
    ('vs-8', 'user-vol-3', 'LOGISTICS', '${now}'),
    ('vs-9', 'user-vol-3', 'DRIVING', '${now}'),
    ('vs-10', 'user-vol-4', 'COMMUNICATION', '${now}'),
    ('vs-11', 'user-vol-5', 'DRONE OPERATION', '${now}');
  `);

  // Shelters
  db.run(`
    INSERT INTO shelters (id, name, area, address, latitude, longitude, capacity, current_occupancy, has_food, has_water, has_medical, has_accessibility, contact_person, contact_phone, status, is_demo, created_at, updated_at) VALUES
    ('sh-1', 'Velachery Community Hall Shelter (DEMO DATA)', 'Velachery', 'No. 12, Gandhi Salai, Velachery, Chennai', 12.9754, 80.2206, 350, 142, 1, 1, 1, 1, 'Officer Murugan', '+91 94440 12345', 'AVAILABLE', 1, '${now}', '${now}'),
    ('sh-2', 'Tambaram Govt Higher Secondary School (DEMO DATA)', 'Tambaram', 'GST Road, Near Tambaram Station, Chennai', 12.9249, 80.1299, 500, 480, 1, 1, 1, 1, 'Headmaster Selvam', '+91 94440 23456', 'LIMITED', 1, '${now}', '${now}'),
    ('sh-3', 'Pallikaranai Relief Center (DEMO DATA)', 'Pallikaranai', 'Dr. Ambedkar Road, Pallikaranai, Chennai', 12.9360, 80.2155, 250, 85, 1, 1, 1, 0, 'Coordinator Revathi', '+91 94440 34567', 'AVAILABLE', 1, '${now}', '${now}'),
    ('sh-4', 'Madipakkam Disaster Relief Hub (DEMO DATA)', 'Madipakkam', 'Bazaar Road, Madipakkam, Chennai', 12.9620, 80.1980, 200, 200, 1, 1, 0, 1, 'Inspector Baskar', '+91 94440 45678', 'FULL', 1, '${now}', '${now}'),
    ('sh-5', 'Saidapet Teachers Training College (DEMO DATA)', 'Saidapet', 'Anna Salai, Saidapet, Chennai', 13.0210, 80.2230, 400, 95, 1, 1, 1, 1, 'Director Raman', '+91 94440 56789', 'AVAILABLE', 1, '${now}', '${now}');
  `);

  // Resources
  db.run(`
    INSERT INTO resources (id, provider_name, provider_phone, category, name, quantity, unit, area, latitude, longitude, delivery_mode, status, is_demo, created_at, updated_at) VALUES
    ('res-1', 'Velachery Youth Welfare Trust (DEMO DATA)', '+91 98400 11223', 'FOOD', 'Hot Meals & Food Packets', 450, 'packets', 'Velachery', 12.9790, 80.2195, 'PICKUP_OR_DELIVERY', 'AVAILABLE', 1, '${now}', '${now}'),
    ('res-2', 'Lions Club South Chennai (DEMO DATA)', '+91 98400 22334', 'WATER', '20L Drinking Water Cans', 120, 'cans', 'Pallikaranai', 12.9380, 80.2120, 'PICKUP', 'AVAILABLE', 1, '${now}', '${now}'),
    ('res-3', 'Red Cross Chennai Chapter (DEMO DATA)', '+91 98400 33445', 'FIRST_AID', 'Trauma & Wound First Aid Kits', 80, 'kits', 'Saidapet', 13.0195, 80.2215, 'DELIVERY', 'AVAILABLE', 1, '${now}', '${now}'),
    ('res-4', 'Chennai Marine Rescuers (DEMO DATA)', '+91 98400 44556', 'BOATS', 'Inflatable Motor Boats', 4, 'boats', 'Velachery', 12.9730, 80.2240, 'DELIVERY', 'AVAILABLE', 1, '${now}', '${now}'),
    ('res-5', 'Community Tech Group (DEMO DATA)', '+91 98400 55667', 'CHARGING_STATIONS', 'Solar Power Battery Hubs', 8, 'stations', 'Tambaram', 12.9260, 80.1280, 'PICKUP', 'AVAILABLE', 1, '${now}', '${now}');
  `);

  // Incidents (10)
  db.run(`
    INSERT INTO incidents (id, reporter_name, reporter_phone, type, severity, description, area, latitude, longitude, status, verification_status, number_affected, is_demo, created_at, updated_at) VALUES
    ('inc-1', 'Kavitha R', '+91 98765 43210', 'FLOOD', 'CRITICAL', 'Water logging over 3.5 feet near Velachery MRTS. Ground floor houses submerged.', 'Velachery', 12.9785, 80.2215, 'ACTIVE', 'VERIFIED', 150, 1, '${now}', '${now}'),
    ('inc-2', 'Muthu S', '+91 97910 98765', 'ROAD_BLOCK', 'HIGH', 'Uprooted tree blocking main GST Road near Tambaram station.', 'Tambaram', 12.9235, 80.1285, 'ACTIVE', 'VERIFIED', 200, 1, '${now}', '${now}'),
    ('inc-3', 'Anitha K', '+91 94441 55667', 'MEDICAL', 'CRITICAL', 'Elderly diabetic patient needing immediate insulin and ambulance transfer.', 'Madipakkam', 12.9635, 80.1990, 'ACTIVE', 'VERIFIED', 1, 1, '${now}', '${now}'),
    ('inc-4', 'Rajesh K', '+91 95000 66778', 'FLOOD', 'HIGH', 'Water entering residential street. Drainage overflowing rapidly.', 'Pallikaranai', 12.9355, 80.2140, 'ACTIVE', 'UNDER_VERIFICATION', 45, 1, '${now}', '${now}'),
    ('inc-5', 'Saidapet Residents', '+91 94440 99991', 'POWER_ISSUE', 'MEDIUM', 'Transformer spark and power outage affecting 3 streets.', 'Saidapet', 13.0180, 80.2220, 'ACTIVE', 'VERIFIED', 120, 1, '${now}', '${now}'),
    ('inc-6', 'Suresh Babu', '+91 94440 99992', 'BUILDING_DAMAGE', 'HIGH', 'Compound wall collapsed near school lane due to heavy downpour.', 'Perungudi', 12.9660, 80.2470, 'UNDER_REVIEW', 'UNDER_VERIFICATION', 20, 1, '${now}', '${now}'),
    ('inc-7', 'Vimala Devi', '+91 94440 99993', 'FIRE', 'CRITICAL', 'Short circuit electrical fire in commercial meter box.', 'Adyar', 13.0080, 80.2560, 'ACTIVE', 'VERIFIED', 35, 1, '${now}', '${now}'),
    ('inc-8', 'Karthik N', '+91 94440 99994', 'MISSING_PERSON', 'HIGH', '72-year-old grandfather missing since morning flood evacuation.', 'Tambaram', 12.9210, 80.1260, 'ACTIVE', 'VERIFIED', 1, 1, '${now}', '${now}'),
    ('inc-9', 'Naveen Kumar', '+91 94440 99995', 'CYCLONE', 'HIGH', 'Tin roofing sheets blown onto road and low tension cables dangling.', 'Medavakkam', 12.9180, 80.1920, 'ACTIVE', 'UNVERIFIED', 15, 1, '${now}', '${now}'),
    ('inc-10', 'Control Room', '+91 94440 99996', 'ROAD_BLOCK', 'LOW', 'Water receded near bridge. Road cleared of debris.', 'Saidapet', 13.0170, 80.2200, 'RESOLVED', 'VERIFIED', 0, 1, '${now}', '${now}');
  `);

  // Assistance Requests (5)
  db.run(`
    INSERT INTO assistance_requests (id, citizen_name, citizen_phone, category, severity, description, area, latitude, longitude, status, assigned_volunteer_id, assigned_volunteer_name, is_demo, created_at, updated_at) VALUES
    ('req-1', 'Meenakshi Sundaram', '+91 98401 23456', 'MEDICAL', 'CRITICAL', 'Need oxygen cylinder and medical escort for heart patient trapped on first floor.', 'Pallikaranai', 12.9370, 80.2130, 'ACCEPTED', 'user-vol-2', 'Dr. Priya Narayanan', 1, '${now}', '${now}'),
    ('req-2', 'Ravi Shankar', '+91 91760 11223', 'FOOD', 'HIGH', 'Family of 6 including 2 toddlers without drinking water and food.', 'Saidapet', 13.0200, 80.2245, 'PENDING', NULL, NULL, 1, '${now}', '${now}'),
    ('req-3', 'Kavitha R', '+91 98765 43210', 'RESCUE', 'CRITICAL', 'Elderly couple in ground floor house with flood level reaching 4 feet. Need boat rescue.', 'Velachery', 12.9775, 80.2220, 'PENDING', NULL, NULL, 1, '${now}', '${now}'),
    ('req-4', 'Selvi P', '+91 94440 88771', 'ELDERLY', 'MEDIUM', 'Wheelchair bound grandmother needs relocation to dry shelter.', 'Madipakkam', 12.9640, 80.1970, 'PENDING', NULL, NULL, 1, '${now}', '${now}'),
    ('req-5', 'Gopal V', '+91 94440 88772', 'POWER', 'LOW', 'Need high-power torch and battery backup for nebulizer.', 'Tambaram', 12.9240, 80.1290, 'COMPLETED', 'user-vol-3', 'Karthik Raja', 1, '${now}', '${now}');
  `);

  // Flood Reports
  db.run(`
    INSERT INTO flood_reports (id, reporter_name, condition, water_level_estimate, description, area, latitude, longitude, status, is_demo, created_at) VALUES
    ('fl-1', 'Kavitha R', 'DANGEROUS_WATER_LEVEL', 'AI ESTIMATE: Waist Level (3.0 - 4.0 ft)', 'Velachery Main Road junction water level rising over car tyres.', 'Velachery', 12.9785, 80.2215, 'ACTIVE', 1, '${now}'),
    ('fl-2', 'Rajesh K', 'FLOODED_STREET', 'AI ESTIMATE: Knee Level (1.5 - 2.5 ft)', 'Water entering homes along 2nd cross street.', 'Pallikaranai', 12.9355, 80.2140, 'ACTIVE', 1, '${now}');
  `);

  // Communities
  db.run(`
    INSERT INTO community_groups (id, name, area, description, created_at) VALUES
    ('cg-1', 'Velachery Lake Ward Community', 'Velachery', 'Residents & volunteer network covering Velachery bypass, 100ft road and lake zone.', '${now}'),
    ('cg-2', 'Tambaram & Mudichur Relief Circle', 'Tambaram', 'Coordination hub for Tambaram Sanatorium, Mudichur and Krishna Nagar.', '${now}'),
    ('cg-3', 'Pallikaranai Marsh & Medavakkam Safety Group', 'Pallikaranai', 'Community watch and rapid alert network for marsh boundary.', '${now}');

    INSERT INTO community_posts (id, community_id, author_name, message, category, verified, is_demo, created_at) VALUES
    ('cp-1', 'cg-1', 'Senthil Kumar (Volunteer)', 'Hot food distribution starting at Velachery Community Hall in 15 mins.', 'FOOD_WATER', 1, 1, '${now}'),
    ('cp-2', 'cg-1', 'Kavitha R', 'Velachery 100ft road near railway station has 2 feet water, please take bypass.', 'ROAD_STATUS', 1, 1, '${now}'),
    ('cp-3', 'cg-2', 'Karthik Raja (Volunteer)', 'Boat rescue team on standby near Mudichur bridge.', 'UPDATE', 1, 1, '${now}');
  `);

  // Safety Check-ins
  db.run(`
    INSERT INTO safety_checkins (id, user_id, user_name, user_phone, community_id, status, note, area, latitude, longitude, is_demo, created_at, updated_at) VALUES
    ('sc-1', 'user-citizen-1', 'Kavitha Ramachandran', '+91 98765 43210', 'cg-1', 'SAFE', 'Moved to 2nd floor, have safe food and water.', 'Velachery', 12.9780, 80.2210, 1, '${now}', '${now}'),
    ('sc-2', 'user-citizen-2', 'Meenakshi Sundaram', '+91 98401 23456', 'cg-3', 'NEED_HELP', 'Water entering ground floor, need assistance moving elderly.', 'Pallikaranai', 12.9360, 80.2140, 1, '${now}', '${now}'),
    ('sc-3', 'user-citizen-3', 'Muthukumar S', '+91 97910 98765', 'cg-2', 'SAFE', 'Safe at home, generator running.', 'Tambaram', 12.9230, 80.1270, 1, '${now}', '${now}'),
    ('sc-4', 'user-citizen-4', 'Anitha Krishnan', '+91 94441 55667', 'cg-1', 'EMERGENCY', 'Medical emergency, need ambulance dispatch immediately.', 'Madipakkam', 12.9630, 80.1980, 1, '${now}', '${now}');
  `);

  // Alerts
  db.run(`
    INSERT INTO alerts (id, title, title_ta, description, description_ta, severity, area, active, created_at) VALUES
    ('al-1', 
     'RED ALERT: Heavy Inflow into Chembarambakkam & Velachery Inundation',
     'சிவப்பு எச்சரிக்கை: செம்பரம்பாக்கம் ஏரி உபரி நீர் திறப்பு - வேளச்சேரி மக்கள் எச்சரிக்கை',
     'NDRF and State Disaster Response teams deployed. Avoid low lying underpasses.',
     'தேசிய பேரிடர் மீட்புப் படை களத்தில் உள்ளது. தாழ்வான பகுதிகளைத் தவிர்க்கவும்.',
     'EMERGENCY', 'South Chennai Zone', 1, '${now}'),
    ('al-2', 
     'WARNING: High Tide Advisory along ECR & Adyar Estuary',
     'எச்சரிக்கை: அடையாறு முகத்துவாரம் பகுதியில் கடல் சீற்றம்',
     'Fishermen warned not to venture into coastal backwaters until midnight.',
     'அடையாறு கழிமுகப் பகுதிகளில் மீனவர்கள் செல்ல வேண்டாம் என்று அறிவுறுத்தப்படுகிறது.',
     'WARNING', 'Adyar & ECR', 1, '${now}');
  `);

  // Relief Fund & Donations
  db.run(`
    INSERT INTO fund_campaigns (id, title, description, target_amount, collected_amount, donor_count, is_active, is_demo, created_at) VALUES
    ('camp-1', 
     'NammaChennai Cyclone & Flood Rapid Relief Fund',
     'Emergency food packs, clean drinking water, baby essentials, and boat rescue fuel across South Chennai flood zones.',
     1000000.0, 342500.0, 184, 1, 1, '${now}');

    INSERT INTO donations (id, campaign_id, donor_name, donor_email, amount, payment_mode, transaction_ref, created_at) VALUES
    ('don-1', 'camp-1', 'Sundar Pichai (DEMO DATA)', 'sundar@demo.org', 25000.0, 'DEMO_PAYMENT_MODE', 'TXN_DEMO_998124', '${now}'),
    ('don-2', 'camp-1', 'Anonymous Citizen', 'citizen@demo.org', 5000.0, 'DEMO_PAYMENT_MODE', 'TXN_DEMO_998125', '${now}');
  `);

  // Global Helplines
  db.run(`
    INSERT INTO emergency_contacts (id, name, relationship, phone_number, category, is_global_helpline, created_at) VALUES
    ('ec-1', 'State Disaster Emergency Control Room', 'GOVT', '1070', 'DISASTER_MANAGEMENT', 1, '${now}'),
    ('ec-2', 'District Disaster Helpline (Chennai)', 'GOVT', '1077', 'DISASTER_MANAGEMENT', 1, '${now}'),
    ('ec-3', 'Ambulance Emergency Services', 'EMERGENCY', '108', 'AMBULANCE', 1, '${now}'),
    ('ec-4', 'Police Emergency Control', 'EMERGENCY', '100', 'POLICE', 1, '${now}'),
    ('ec-5', 'Fire & Rescue Services', 'EMERGENCY', '101', 'FIRE', 1, '${now}'),
    ('ec-6', 'Greater Chennai Corporation Flood Control', 'MUNICIPAL', '1913', 'HELPLINE', 1, '${now}'),
    ('ec-7', 'Electricity Board (TANGEDCO) Emergency', 'UTILITY', '94987 94987', 'HELPLINE', 1, '${now}');
  `);
}

// Database query helpers
export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function execute(sql: string, params: any[] = []): void {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  persistDatabase();
}
