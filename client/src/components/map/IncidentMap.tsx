import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Shelter, Resource } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useRealtime } from '../../contexts/RealtimeContext.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { Layers, AlertTriangle, ShieldCheck, LifeBuoy, Waves, MapPin, ExternalLink, PhoneCall, Radio, Eye } from 'lucide-react';

// Custom High-Tech Tactical HUD Marker Generator
const createCustomIcon = (emoji: string, glowColor: string, isCritical = false) => {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div style="
        background: #09131d;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 15px ${glowColor}, inset 0 0 8px ${glowColor};
        border: 2px solid ${glowColor};
        position: relative;
        ${isCritical ? 'animation: pulse-border-cyber 1.5s infinite;' : ''}
      ">
        ${emoji}
        <span style="
          position: absolute;
          top: -3px;
          right: -3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${glowColor};
        "></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Map Recenter Helper Component
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
};

interface IncidentMapProps {
  initialFilter?: string;
  onSelectIncident?: (incident: Incident) => void;
}

// Major Emergency Relief Evacuation Corridors across Chennai (like green routes in reference image)
const arterialGreenCorridors: [number, number][][] = [
  // Arterial 1: Airport / Guindy -> Saidapet -> Kotturpuram -> Adyar
  [
    [12.9850, 80.1850],
    [13.0080, 80.2080],
    [13.0180, 80.2220],
    [13.0185, 80.2440],
    [13.0067, 80.2570]
  ],
  // Arterial 2: Tambaram -> Pallavaram -> Chromepet -> Velachery MRTS
  [
    [12.9235, 80.1285],
    [12.9450, 80.1450],
    [12.9650, 80.1800],
    [12.9785, 80.2215]
  ],
  // Arterial 3: Velachery -> Pallikaranai Radial Rd -> OMR Perungudi
  [
    [12.9785, 80.2215],
    [12.9550, 80.2180],
    [12.9355, 80.2140],
    [12.9660, 80.2470]
  ]
];

export const IncidentMap: React.FC<IncidentMapProps> = ({ initialFilter = 'ALL', onSelectIncident }) => {
  const { coords, currentArea } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [loading, setLoading] = useState(false);
  const [showCorridors, setShowCorridors] = useState(true);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [incData, shData, resData] = await Promise.all([
        api.getIncidents(),
        api.getShelters(),
        api.getResources()
      ]);
      setIncidents(incData);
      setShelters(shData);
      setResources(resData);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [lastRealtimeEvent]);

  const getIncidentIcon = (type: string, severity: string) => {
    const isCritical = severity === 'CRITICAL';
    switch (type) {
      case 'FLOOD':
        return createCustomIcon('🌊', '#00e5ff', isCritical);
      case 'FIRE':
        return createCustomIcon('🔥', '#ff2a55', isCritical);
      case 'MEDICAL':
        return createCustomIcon('🏥', '#ff2a55', isCritical);
      case 'ROAD_BLOCK':
        return createCustomIcon('🚧', '#ffb703', false);
      case 'POWER_ISSUE':
        return createCustomIcon('⚡', '#ffb703', false);
      case 'BUILDING_DAMAGE':
        return createCustomIcon('🏚️', '#94a3b8', false);
      case 'MISSING_PERSON':
        return createCustomIcon('👤', '#a855f7', isCritical);
      default:
        return createCustomIcon('⚠️', '#ff2a55', isCritical);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (filter === 'FLOOD') return inc.type === 'FLOOD';
    if (filter === 'ROAD_BLOCK') return inc.type === 'ROAD_BLOCK';
    return inc.type === filter;
  });

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden hud-panel border border-[#00ff9d]/30 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {/* Top Left Tactical HUD Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#060b11]/90 backdrop-blur-md border border-[#00ff9d]/40 shadow-xl font-mono text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-[#00ff9d] text-slate-950 shadow-[0_0_12px_rgba(0,255,157,0.6)]'
              : 'text-slate-300 hover:text-white bg-[#0c1622] border border-[#163044]'
          }`}
        >
          ALL ({incidents.length})
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            filter === 'CRITICAL'
              ? 'bg-[#ff2a55] text-white shadow-[0_0_15px_rgba(255,42,85,0.6)]'
              : 'text-[#ff2a55] bg-[#1a0c12] border border-[#ff2a55]/40 hover:bg-[#ff2a55]/20'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          CRITICAL ({incidents.filter((i) => i.severity === 'CRITICAL').length})
        </button>
        <button
          onClick={() => setFilter('FLOOD')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'FLOOD'
              ? 'bg-[#00e5ff] text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.6)]'
              : 'text-[#00e5ff] bg-[#0c1b26] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/20'
          }`}
        >
          FLOOD ({incidents.filter((i) => i.type === 'FLOOD').length})
        </button>
        <button
          onClick={() => setShowCorridors(!showCorridors)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            showCorridors
              ? 'bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d]'
              : 'bg-[#0c1622] text-slate-400 border-slate-700'
          }`}
        >
          ROUTES: {showCorridors ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Top Right Live Telemetry Legend (like reference screenshot) */}
      <div className="absolute top-3 right-3 z-[400] hidden sm:flex flex-col gap-1 p-2.5 rounded-xl bg-[#060b11]/90 backdrop-blur-md border border-[#00ff9d]/30 font-mono text-[11px] shadow-xl text-slate-300">
        <div className="flex items-center gap-2 pb-1 border-b border-[#00ff9d]/20 font-bold text-[#00ff9d]">
          <Radio className="w-3 h-3 animate-pulse text-[#00ff9d]" />
          <span>GEO-OPS HUD // SECTOR {currentArea.toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#00ff9d] shadow-[0_0_6px_#00ff9d]"></span> Relief Corridors</span>
          <span className="text-[#00ff9d] font-bold">3 ACTIVE</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#ff2a55] shadow-[0_0_6px_#ff2a55]"></span> Critical Flood Inundation</span>
          <span className="text-[#ff2a55] font-bold">4 ZONES</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span> GCC Relief Shelters</span>
          <span className="text-[#00e5ff] font-bold">{shelters.length} HUBS</span>
        </div>
      </div>

      {/* Leaflet Map Container with CartoDB Dark Matter tiles */}
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterAutomatically lat={coords.latitude} lng={coords.longitude} />

        {/* High-Tech CartoDB Dark Matter Tiles (Pitch Black / Navy Tactical Map like reference screenshot) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Arterial Evacuation Green Corridors (Glowing neon green lines from reference image) */}
        {showCorridors &&
          arterialGreenCorridors.map((path, idx) => (
            <Polyline
              key={`corridor-${idx}`}
              positions={path}
              pathOptions={{
                color: '#00ff9d',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 6'
              }}
            />
          ))}

        {/* High Risk Flood Water Circles (Glowing red & cyan crisis zones) */}
        <Circle
          center={[12.9785, 80.2215]} // Velachery MRTS
          radius={700}
          pathOptions={{
            color: '#ff2a55',
            fillColor: '#ff2a55',
            fillOpacity: 0.22,
            weight: 2
          }}
        />
        <Circle
          center={[12.9355, 80.2140]} // Pallikaranai Marshland
          radius={850}
          pathOptions={{
            color: '#00e5ff',
            fillColor: '#00e5ff',
            fillOpacity: 0.18,
            weight: 2
          }}
        />
        <Circle
          center={[12.9235, 80.1285]} // Tambaram GST Mudichur
          radius={650}
          pathOptions={{
            color: '#ff2a55',
            fillColor: '#ff2a55',
            fillOpacity: 0.22,
            weight: 2
          }}
        />

        {/* Current User GPS Marker */}
        <Marker
          position={[coords.latitude, coords.longitude]}
          icon={createCustomIcon('📍', '#00ff9d', true)}
        >
          <Popup className="custom-cyber-popup">
            <div className="p-2.5 bg-[#0a1520] text-slate-100 font-mono text-xs border border-[#00ff9d]/50 rounded-lg shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ff9d] block mb-1">
                TACTICAL USER GPS LOCK
              </span>
              <h4 className="text-sm font-bold text-white">{currentArea} Sector</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Hyperlocal radius centered. Auto-synchronized with GCC ward command.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Incident Markers */}
        {filteredIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={getIncidentIcon(inc.type, inc.severity)}
          >
            <Popup className="custom-cyber-popup">
              <div className="p-3 bg-[#0a1520] text-slate-100 font-mono text-xs border border-[#00ff9d]/40 rounded-xl shadow-2xl max-w-xs">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                    inc.severity === 'CRITICAL'
                      ? 'bg-[#ff2a55]/20 text-[#ff2a55] border-[#ff2a55]/50'
                      : 'bg-[#ffb703]/20 text-[#ffb703] border-[#ffb703]/50'
                  }`}>
                    {inc.type} • {inc.severity}
                  </span>
                  <span className="text-[10px] text-[#00ff9d]">
                    {inc.verification_status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {inc.area}
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-2">
                  {inc.description}
                </p>
                {inc.reporter_phone && (
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Contact:</span>
                    <a href={`tel:${inc.reporter_phone}`} className="text-[#00e5ff] font-bold hover:underline flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" />
                      {inc.reporter_phone}
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelter Markers */}
        {(filter === 'ALL' || filter === 'SHELTERS') &&
          shelters.map((sh) => (
            <Marker
              key={sh.id}
              position={[sh.latitude, sh.longitude]}
              icon={createCustomIcon('🛡️', '#00ff9d', false)}
            >
              <Popup className="custom-cyber-popup">
                <div className="p-3 bg-[#0a1520] text-slate-100 font-mono text-xs border border-[#00ff9d]/40 rounded-xl shadow-2xl max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40">
                      RELIEF SHELTER
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {sh.current_occupancy}/{sh.capacity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-tight">
                    {sh.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mb-2">
                    {sh.address}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    {sh.has_food ? '🍲 Meals' : ''}
                    {sh.has_water ? ' • 💧 Water' : ''}
                    {sh.has_medical ? ' • 🩺 Medical' : ''}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Resource Markers */}
        {(filter === 'ALL' || filter === 'RESOURCES') &&
          resources.map((res) => (
            <Marker
              key={res.id}
              position={[res.latitude, res.longitude]}
              icon={createCustomIcon('📦', '#ffb703', false)}
            >
              <Popup className="custom-cyber-popup">
                <div className="p-2.5 bg-[#0a1520] text-slate-100 font-mono text-xs border border-[#ffb703]/40 rounded-xl max-w-xs">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#ffb703]/20 text-[#ffb703]">
                    SUPPLY: {res.category}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">{res.name}</h4>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    Qty: {res.quantity} {res.unit} • {res.provider_name}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
