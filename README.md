# 🆘 NammaRescue (நம்மRescue)
### Hyperlocal Disaster Response & Community Safety Platform

> **"During an emergency, simplicity saves time."**
> A modern, real-time, hyperlocal disaster management web application engineered for citizens, volunteers, community coordinators, resource providers, and emergency administration during floods, cyclones, heavy rain, medical emergencies, road blockages, and building collapses.

---

## 🌟 Key Features

1. **Simplicity-First Emergency UX (Mobile-First)**:
   - Icon > Long text | Voice > Typing | One-Tap > Many Steps | Map > Long Description.
   - Large touch targets (≥ 48px), high contrast, rounded cards, and emergency color hierarchy.
   - Dual language interface: **தமிழ் (Tamil)** and **English** with instant one-tap toggle.

2. **Real Interactive Leaflet & OpenStreetMap**:
   - Real database-driven markers for Floods, Fires, Medical Emergencies, Road Blocks, Shelters, and Supplies.
   - Live GPS pinpointing with pulsing emergency beacons.
   - Instant map updates whenever new incidents are reported across the network.

3. **Dedicated Flood Reporting with AI Water-Level Estimation**:
   - One-tap condition selection: *Water on Road*, *Flooded Street*, *Water Entering House*, *Vehicles Submerged*, *Road Blocked*, *Dangerous Water Level*.
   - Prominently labeled **`AI ESTIMATE`** indicator (e.g. *Ankle Level <1ft*, *Knee Level 1.5–2.5ft*, *Waist Level 3–4ft*, *Chest Level >4.5ft*).
   - Real photo capture and audio voice note attachments.

4. **Real-Time Two-Way Assistance Coordination**:
   - Citizen submits request (Medical, Rescue Boat, Food, Water, Elderly, Child, Disability).
   - Nearby volunteer dashboard receives the request in real time.
   - Volunteer taps **ACCEPT** ➔ Citizen's screen immediately updates to *"Volunteer Assigned: Senthil Kumar"*.
   - Volunteer marks **IN PROGRESS** ➔ Citizen sees *"Help is on the way"*.
   - Volunteer marks **COMPLETED** ➔ Citizen sees *"Request Completed"*.
   - **Zero page refreshes required!**

5. **Tamil & English Voice Assistant**:
   - Voice assistant supporting Tamil (`ta-IN`) and English speech recognition and synthesis.
   - Intent recognition for:
     - `REQUEST_HELP` ("எனக்கு உதவி வேண்டும்", "மருத்துவம்")
     - `REPORT_FLOOD` ("எங்க பகுதியில் வெள்ளம் இருக்கு", "வெள்ளம்")
     - `SAFETY_CHECK` ("நான் பாதுகாப்பாக இருக்கிறேன்", "நான் நலம்")
     - `FIND_SHELTER` ("பாதுகாப்பான இடம் எங்கே", "முகாம்")
     - `FIND_RESOURCE` ("உணவு வேண்டும்", "குடிநீர்")
   - Voice confirmation before submitting high-impact emergency actions.

6. **Live Community Safety Dashboard (🟢 I AM SAFE)**:
   - One-tap status reporting: 🟢 SAFE, 🟡 NEED HELP, 🔴 EMERGENCY, ⚪ NO RESPONSE.
   - Live KPI counters computed directly from real database SQL aggregate queries.
   - Coordinator trigger: Broadcast *"ARE YOU SAFE?"* poll to ward residents.

7. **Shelter & Resource Supply Exchange**:
   - Real-time shelter occupancy tracking preventing overcrowding (`current_occupancy <= capacity`).
   - Amenities badges: Food, Clean Water, Medical Support, Wheelchair Accessibility.
   - Stock deduction controls for relief volunteers.

8. **Disaster Management Admin & Verification Dashboard**:
   - Real-time verification queue: Admins verify reports (`UNVERIFIED` ➔ `VERIFIED` or `REJECTED`).
   - Audit logging with timestamps and coordinator notes.
   - Real-time multi-agency KPI counters.

9. **Relief Fund & Transparent Donations**:
   - Dedicated campaign tracking with live collected totals, target progress bars, and donor counts.
   - Clearly labeled **`DEMO PAYMENT MODE`** for hackathon safety with reference ID generation (`TXN_DEMO_...`).

10. **Emergency Helplines & Clickable Calling**:
    - Direct one-tap mobile calling: Ambulance (`108`), Police (`100`), Fire (`101`), State Disaster Control (`1070`), District Helpline (`1077`), GCC Flood Control (`1913`), TANGEDCO (`94987 94987`).

11. **Offline Queue & Auto-Sync**:
    - Automatic offline queue saving when internet connectivity drops.
    - Automatic background sync as soon as network is restored (`window.addEventListener('online')`).

12. **Progressive Web App (PWA)**:
    - Installable as standalone app on mobile devices and desktops with `manifest.json` and service worker caching.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide React, Canvas Confetti |
| **Mapping** | Leaflet, React-Leaflet, OpenStreetMap Tile Servers |
| **Voice & Audio** | Web Speech Recognition API, SpeechSynthesis API, MediaRecorder API |
| **Backend** | Node.js, Express, TypeScript, tsx, Multer (media upload) |
| **Database** | Supabase PostgreSQL schema & migrations / Relational SQLite with WebAssembly (`sql.js`) |
| **Realtime** | WebSocket Server (`ws`) broadcasting live mutations across all browser windows |
| **PWA** | Service Worker (`sw.js`), Web App Manifest (`manifest.json`) |

---

## 📁 Project Structure

```
/client
  /public
    manifest.json
    sw.js
  /src
    /components
      /common        # Header, BottomNav, AlertBanner, ToastContainer, VoiceAssistantModal
      /map           # Leaflet IncidentMap with custom emoji pins
      /modals        # RequestHelpModal, ReportFloodModal, ReportIncidentModal, SafetyCheckinModal, DonateModal, HelplinesModal
    /contexts        # AuthContext (Role, GPS, Language), RealtimeContext (WebSocket subscriptions)
    /pages           # HomePage, MapPage, HelpPage, CommunityPage, SheltersPage, ResourcesPage, VolunteerDashboardPage, AdminDashboardPage, ProfilePage
    /services        # api.ts, realtime.ts, speech.ts, offline.ts, supabase.ts
    /translations    # ta.ts (Tamil), en.ts (English)
    /types           # TypeScript models
    App.tsx
    main.tsx
    index.css
/server
  /data              # Persistent SQLite database storage (namma_rescue.sqlite)
  /uploads           # Uploaded emergency photos and voice audio clips
  /src
    /routes          # incidents, flood, assistance, volunteers, resources, shelters, community, safety, notifications, funds, contacts, auth, upload
    database.ts      # Database engine with schema creation & demo seeding
    realtime.ts      # WebSocket real-time broadcast hub
    upload.ts        # Multer audio & photo handler
    index.ts         # Express & HTTP/WS server entrypoint
/supabase
  /migrations        # 20260929000001_initial_schema.sql (All 28 tables, RLS policies, indexes)
  /seed              # seed.sql (5 citizens, 5 volunteers, admin, 10 incidents, 5 shelters, resources)
.env.example
README.md
```

---

## 🎬 Demo Accounts (One-Click Switcher)

Use the role selector in the top-right corner of the application to test any scenario instantly:

| Role | Demo User | Email | Scenario |
|---|---|---|---|
| **Citizen** | Kavitha Ramachandran | `demo.citizen@example.com` | Resident in Velachery flood-prone area requesting boat/medical aid |
| **Volunteer** | Senthil Kumar | `demo.volunteer@example.com` | Certified Swift Water & Boat Rescue volunteer responding to alerts |
| **Community Coordinator** | Muthukumar S | `muthu.citizen@example.com` | Ward coordinator managing check-ins and safety polls |
| **HQ Admin** | TN Disaster HQ | `demo.admin@example.com` | Control center verifying incoming incidents and alerts |

*All seed data is clearly tagged with `DEMO DATA` badges.*

---

## 🚀 Installation & Local Execution

### Prerequisites
- Node.js LTS (v18+ or v24+)
- npm (v9+)

### 1. Clone & Install Dependencies
```bash
# In project root:
npm install

# Install server packages:
cd server && npm install

# Install client packages:
cd ../client && npm install
```

### 2. Start Backend Server
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000` with WebSocket real-time engine at `ws://localhost:5000/ws`.*

### 3. Start Frontend Client (in a separate terminal)
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Critical Real-Time Test (Judge Demo Flow)

Open **3 separate browser windows** side-by-side:
- **Window 1**: Switch role to **Citizen** (`http://localhost:5173`)
- **Window 2**: Switch role to **Volunteer** (`http://localhost:5173/volunteer`)
- **Window 3**: Switch role to **HQ Admin** (`http://localhost:5173/admin`)

### Test Sequence:
1. **Window 1 (Citizen)**:
   - Click `🌊 REPORT FLOOD`.
   - Select `DANGEROUS WATER LEVEL`.
   - Submit report.
   - **Observe**: Without refreshing, the flood marker instantly appears on the map in Window 2 & 3 with the `AI ESTIMATE` badge!

2. **Window 1 (Citizen)**:
   - Click `🆘 REQUEST HELP`.
   - Select `MEDICAL`, urgency `CRITICAL`, and submit.
   - **Observe**: Window 2 (Volunteer) instantly rings with a toast and adds the request to the live queue!

3. **Window 2 (Volunteer)**:
   - Click `ACCEPT REQUEST`.
   - **Observe**: Window 1 (Citizen) immediately changes status to *"Volunteer Assigned: Senthil Kumar"*.
   - Volunteer clicks `MARK IN PROGRESS` ➔ Citizen immediately sees *"Help is on the way"*.
   - Volunteer clicks `MARK COMPLETED` ➔ Citizen immediately sees *"Request Completed"*.

4. **Window 3 (Admin)**:
   - View the Incident Verification queue.
   - Click `VERIFY` on any community report.
   - **Observe**: Verification status updates across all connected windows in real time!

5. **Window 1 or 2**:
   - Click `🟢 I AM SAFE`.
   - **Observe**: Community Safety Dashboard counts update live in all 3 windows!

---

## 🎤 Voice Assistant Testing

1. Tap the large floating **`VOICE ASSISTANT`** button.
2. In **Tamil mode**, say:
   - *"எனக்கு உதவி வேண்டும்"* ➔ System detects `REQUEST_HELP` and asks *"மருத்துவ உதவி கேட்கவா?"*.
   - *"எங்க பகுதியில் வெள்ளம் இருக்கு"* ➔ Opens `REPORT_FLOOD`.
   - *"நான் பாதுகாப்பாக இருக்கிறேன்"* ➔ Confirms and marks safety check-in!
3. In **English mode**, say:
   - *"I need emergency help"*
   - *"Report flood"*
   - *"I am safe"*

---

## 🛡️ Safety & Disclaimer Notice

NammaRescue is a community coordination and rapid response platform. It does not replace emergency 108/100 dispatch or professional civil defense teams. High-risk rescue operations require proper qualifications and protective equipment. All AI flood estimations are clearly tagged with **`AI ESTIMATE`** and all simulated hackathon payment records are tagged with **`DEMO PAYMENT MODE`**.
