import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Shelter, Resource, FloodReport } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useRealtime } from '../../contexts/RealtimeContext.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { Layers, AlertTriangle, ShieldCheck, LifeBuoy, Waves, MapPin, ExternalLink, PhoneCall } from 'lucide-react';

// Custom Marker Generator with Emoji Icons
const createCustomIcon = (emoji: string, color: string, isPulsing = false) => {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div style="
        background: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
        ${isPulsing ? 'animation: pulse-border 1.5s infinite;' : ''}
      ">
        ${emoji}
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

interface IncidentMapProps {
  initialFilter?: string;
  onSelectIncident?: (incident: Incident) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ initialFilter = 'ALL', onSelectIncident }) => {
  const { coords, currentArea } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

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
        return createCustomIcon('🌊', '#0284c7', isCritical);
      case 'FIRE':
        return createCustomIcon('🔥', '#e11d48', isCritical);
      case 'MEDICAL':
        return createCustomIcon('🏥', '#f43f5e', isCritical);
      case 'ROAD_BLOCK':
        return createCustomIcon('🚧', '#f59e0b', false);
      case 'POWER_ISSUE':
        return createCustomIcon('⚡', '#eab308', false);
      case 'BUILDING_DAMAGE':
        return createCustomIcon('🏚️', '#78716c', false);
      case 'MISSING_PERSON':
        return createCustomIcon('👤', '#a855f7', isCritical);
      case 'CYCLONE':
        return createCustomIcon('🌪️', '#6366f1', isCritical);
      default:
        return createCustomIcon('🆘', '#be123c', isCritical);
    }
  };

  // Filter items
  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'ALL') return true;
    if (filter === 'FLOOD') return inc.type === 'FLOOD';
    if (filter === 'MEDICAL') return inc.type === 'MEDICAL';
    if (filter === 'ROAD_BLOCK') return inc.type === 'ROAD_BLOCK';
    return true;
  });

  const showShelters = filter === 'ALL' || filter === 'SHELTERS';
  const showResources = filter === 'ALL' || filter === 'RESOURCES';

  return (
    <div className="relative w-full h-[calc(100vh-140px)] sm:h-[650px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Hyperlocal Filter Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl max-w-full">
          {['ALL', 'FLOOD', 'MEDICAL', 'SHELTERS', 'RESOURCES'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                filter === f
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'ALL' && '🌐 All Live Data'}
              {f === 'FLOOD' && '🌊 Floods'}
              {f === 'MEDICAL' && '🏥 Medical'}
              {f === 'SHELTERS' && '🏠 Shelters'}
              {f === 'RESOURCES' && '📦 Resources'}
            </button>
          ))}
        </div>

        {/* Live Marker Count Pill */}
        <div className="hidden sm:flex pointer-events-auto items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{filteredIncidents.length + (showShelters ? shelters.length : 0)} Live Points</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterAutomatically lat={coords.latitude} lng={coords.longitude} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current User GPS Marker */}
        <Marker
          position={[coords.latitude, coords.longitude]}
          icon={createCustomIcon('📍', '#10b981', true)}
        >
          <Popup className="custom-popup">
            <div className="p-2 text-slate-900 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Your Location</span>
              <h4 className="text-sm font-extrabold">{currentArea}</h4>
              <p className="text-xs text-slate-600 mt-0.5">Hyperlocal search centered here</p>
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
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900 font-sans max-w-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                    {inc.type} • {inc.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {inc.verification_status}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                  {inc.area}
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-snug">
                  {inc.description}
                </p>
                {inc.reporter_name && (
                  <div className="text-[10px] text-slate-500 mt-1.5">
                    Reported by: {inc.reporter_name}
                  </div>
                )}
                {onSelectIncident && (
                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="w-full mt-2 py-1 px-2 rounded-lg bg-rose-600 text-white text-[11px] font-bold text-center"
                  >
                    View & Respond
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelter Markers */}
        {showShelters &&
          shelters.map((sh) => (
            <Marker
              key={sh.id}
              position={[sh.latitude, sh.longitude]}
              icon={createCustomIcon('🏠', '#16a34a', false)}
            >
              <Popup>
                <div className="p-2 text-slate-900 font-sans max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      SHELTER: {sh.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {sh.current_occupancy}/{sh.capacity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{sh.name}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{sh.address}</p>
                  <a
                    href={`tel:${sh.contact_phone}`}
                    className="mt-2 block py-1 px-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold text-center"
                  >
                    Call Shelter: {sh.contact_phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Resource Markers */}
        {showResources &&
          resources.map((res) => (
            <Marker
              key={res.id}
              position={[res.latitude, res.longitude]}
              icon={createCustomIcon('📦', '#8b5cf6', false)}
            >
              <Popup>
                <div className="p-2 text-slate-900 font-sans max-w-xs">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    RESOURCE: {res.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{res.name}</h4>
                  <p className="text-xs font-mono font-bold text-purple-900">
                    Available: {res.quantity} {res.unit}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Provider: {res.provider_name}</p>
                  <a
                    href={`tel:${res.provider_phone}`}
                    className="mt-2 block py-1 px-2 rounded-lg bg-purple-600 text-white text-[11px] font-bold text-center"
                  >
                    Call Provider
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
