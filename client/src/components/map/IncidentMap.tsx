import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Shelter, Resource } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useRealtime } from '../../contexts/RealtimeContext.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { PhoneCall, Navigation, Info, Shield, Layers } from 'lucide-react';

// Clean, high-contrast natural marker icon generator
const createCustomIcon = (emoji: string, bgColor: string, borderColor: string, isPulsing = false) => {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div style="
        background: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 19px;
        border: 2.5px solid ${borderColor};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        position: relative;
        cursor: pointer;
        ${isPulsing ? 'animation: pulse-border-red 1.8s infinite;' : ''}
      ">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
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

// Map Size Invalidation Helper Component (Ensures tiles never collapse)
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 200);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
};

interface IncidentMapProps {
  initialFilter?: string;
  height?: string;
  onSelectIncident?: (incident: Incident) => void;
}

// Major Emergency Relief Evacuation Corridors across Chennai
const arterialGreenCorridors: [number, number][][] = [
  // Corridor 1: Airport / Guindy -> Saidapet -> Kotturpuram -> Adyar
  [
    [12.9850, 80.1850],
    [13.0080, 80.2080],
    [13.0180, 80.2220],
    [13.0185, 80.2440],
    [13.0067, 80.2570]
  ],
  // Corridor 2: Tambaram -> Pallavaram -> Chromepet -> Velachery MRTS
  [
    [12.9235, 80.1285],
    [12.9450, 80.1450],
    [12.9650, 80.1800],
    [12.9785, 80.2215]
  ],
  // Corridor 3: Velachery -> Pallikaranai Radial Rd -> OMR Perungudi
  [
    [12.9785, 80.2215],
    [12.9550, 80.2180],
    [12.9355, 80.2140],
    [12.9660, 80.2470]
  ]
];

export const IncidentMap: React.FC<IncidentMapProps> = ({
  initialFilter = 'ALL',
  height = '500px',
  onSelectIncident
}) => {
  const { coords, currentArea, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [showCorridors, setShowCorridors] = useState(true);

  const loadMapData = async () => {
    try {
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
    }
  };

  useEffect(() => {
    loadMapData();
  }, [lastRealtimeEvent]);

  const getIncidentIcon = (type: string, severity: string) => {
    const isCritical = severity === 'CRITICAL';
    switch (type) {
      case 'FLOOD':
        return createCustomIcon('🌊', '#0284c7', '#38bdf8', isCritical);
      case 'FIRE':
        return createCustomIcon('🔥', '#dc2626', '#fca5a5', isCritical);
      case 'MEDICAL':
        return createCustomIcon('🏥', '#dc2626', '#fca5a5', isCritical);
      case 'ROAD_BLOCK':
        return createCustomIcon('🚧', '#d97706', '#fcd34d', false);
      case 'POWER_ISSUE':
        return createCustomIcon('⚡', '#d97706', '#fcd34d', false);
      case 'BUILDING_DAMAGE':
        return createCustomIcon('🏚️', '#64748b', '#cbd5e1', false);
      case 'MISSING_PERSON':
        return createCustomIcon('👤', '#9333ea', '#d8b4fe', isCritical);
      default:
        return createCustomIcon('⚠️', '#dc2626', '#fca5a5', isCritical);
    }
  };

  const centerLat = (typeof coords?.latitude === 'number' && !isNaN(coords.latitude)) ? coords.latitude : 12.9780;
  const centerLng = (typeof coords?.longitude === 'number' && !isNaN(coords.longitude)) ? coords.longitude : 80.2210;

  const filteredIncidents = incidents.filter((inc) => {
    if (!inc || typeof inc.latitude !== 'number' || isNaN(inc.latitude) || typeof inc.longitude !== 'number' || isNaN(inc.longitude)) {
      return false;
    }
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (filter === 'FLOOD') return inc.type === 'FLOOD';
    return inc.type === filter;
  });

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-700/70 shadow-2xl bg-slate-900"
      style={{ height, minHeight: '440px' }}
    >
      {/* Top Left Accessible Filter Bar */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
          }`}
        >
          {language === 'ta' ? 'அனைத்தும்' : 'All'} ({incidents.length})
        </button>

        <button
          onClick={() => setFilter('FLOOD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'FLOOD'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-sky-300 bg-slate-800/80 hover:bg-slate-700'
          }`}
        >
          {language === 'ta' ? 'வெள்ளம்' : 'Floods'} ({incidents.filter((i) => i.type === 'FLOOD').length})
        </button>

        <button
          onClick={() => setFilter('CRITICAL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'CRITICAL'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-red-300 bg-slate-800/80 hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
          {language === 'ta' ? 'அவசரம்' : 'High Priority'} ({incidents.filter((i) => i.severity === 'CRITICAL').length})
        </button>

        <button
          onClick={() => setShowCorridors(!showCorridors)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            showCorridors
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          {language === 'ta' ? 'பாதுகாப்பு பாதைகள்' : 'Safe Routes'}: {showCorridors ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Top Right Simple Map Legend */}
      <div className="absolute top-3 right-3 z-[400] hidden sm:flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs shadow-lg text-slate-200">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-700/60 font-bold text-emerald-400">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentArea} - {language === 'ta' ? 'வரைபடக் குறிப்புகள்' : 'Map Guide'}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
          <span>{language === 'ta' ? 'நிவாரணப் பாதை' : 'Safe Evacuation Route'}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
          <span>{language === 'ta' ? 'வெள்ள அபாயப் பகுதி' : 'Flood Inundation Area'}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded bg-sky-500"></span>
          <span>{language === 'ta' ? 'பாதுகாப்பு முகாம்கள்' : 'Verified Safe Shelters'} ({shelters.length})</span>
        </div>
      </div>

      {/* Main Leaflet Map with Natural OpenStreetMap Tiles */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapResizeHandler />
        <RecenterAutomatically lat={centerLat} lng={centerLng} />

        {/* 100% Free OpenStreetMap Natural Tiles - No API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Safe Evacuation Corridors (Clean Emerald Lines) */}
        {showCorridors &&
          arterialGreenCorridors.map((path, idx) => (
            <Polyline
              key={`corridor-${idx}`}
              positions={path}
              pathOptions={{
                color: '#10b981',
                weight: 5,
                opacity: 0.9,
                dashArray: '8, 8'
              }}
            />
          ))}

        {/* Flood Alert Zones (Clear Visual Circles) */}
        <Circle
          center={[12.9785, 80.2215]} // Velachery
          radius={700}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.25,
            weight: 2
          }}
        />
        <Circle
          center={[12.9355, 80.2140]} // Pallikaranai
          radius={850}
          pathOptions={{
            color: '#0284c7',
            fillColor: '#0284c7',
            fillOpacity: 0.25,
            weight: 2
          }}
        />
        <Circle
          center={[12.9235, 80.1285]} // Tambaram / Mudichur
          radius={650}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.25,
            weight: 2
          }}
        />

        {/* User's Current Location Marker */}
        <Marker
          position={[coords.latitude, coords.longitude]}
          icon={createCustomIcon('📍', '#10b981', '#ffffff', false)}
        >
          <Popup>
            <div className="p-2 text-slate-100 text-xs">
              <span className="text-[11px] font-bold text-emerald-400 block mb-0.5">
                {language === 'ta' ? 'உங்கள் இருப்பிடம்' : 'Your Location'}
              </span>
              <h4 className="text-sm font-bold text-white">{currentArea}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'ta'
                  ? 'உள்ளூர் உதவி மற்றும் முகாம்கள் அருகில் உள்ளன.'
                  : 'Hyperlocal services and relief shelters centered here.'}
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
            eventHandlers={{
              click: () => onSelectIncident?.(inc)
            }}
          >
            <Popup>
              <div className="p-2 text-slate-100 text-xs max-w-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    inc.severity === 'CRITICAL'
                      ? 'bg-red-900/60 text-red-200 border border-red-500/40'
                      : 'bg-amber-900/60 text-amber-200 border border-amber-500/40'
                  }`}>
                    {inc.type} • {inc.severity}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {inc.verification_status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">
                  {inc.area}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-snug">
                  {inc.description}
                </p>
                {inc.reporter_phone && (
                  <div className="mt-2 pt-1.5 border-t border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{language === 'ta' ? 'தொடர்பு' : 'Contact'}:</span>
                    <a
                      href={`tel:${inc.reporter_phone}`}
                      className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {inc.reporter_phone}
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Safe Shelters */}
        {(filter === 'ALL' || filter === 'SHELTERS') &&
          shelters.map((sh) => (
            <Marker
              key={sh.id}
              position={[sh.latitude, sh.longitude]}
              icon={createCustomIcon('🏠', '#10b981', '#34d399', false)}
            >
              <Popup>
                <div className="p-2 text-slate-100 text-xs max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-900/70 text-emerald-200 border border-emerald-500/40">
                      {language === 'ta' ? 'நிவாரண முகாம்' : 'Safe Shelter'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold">
                      {sh.current_occupancy} / {sh.capacity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">
                    {sh.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {sh.address}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-700 text-[11px] text-slate-300">
                    {sh.has_food && <span>🍲 Food</span>}
                    {sh.has_water && <span>💧 Water</span>}
                    {sh.has_medical && <span>🩺 Medical</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Resources */}
        {(filter === 'ALL' || filter === 'RESOURCES') &&
          resources.map((res) => (
            <Marker
              key={res.id}
              position={[res.latitude, res.longitude]}
              icon={createCustomIcon('📦', '#d97706', '#fcd34d', false)}
            >
              <Popup>
                <div className="p-2 text-slate-100 text-xs max-w-xs">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-900/70 text-amber-200 border border-amber-500/40">
                    {res.category}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">{res.name}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {res.quantity} {res.unit} • {res.provider_name}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
