import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  Crosshair,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  CHENNAI_AREAS,
  findNearestArea,
  reverseGeocode,
  geocodeAddress
} from '../../constants/areas.js';

// Custom Pin Icon for Location Picker
const createPickerPinIcon = () => {
  return L.divIcon({
    className: 'picker-pin-icon',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #ef4444;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.6);
        ">
          <span style="transform: rotate(45deg); font-size: 16px; margin-top: -2px;">📍</span>
        </div>
        <div style="
          width: 8px;
          height: 8px;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
          margin-top: 2px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Component to handle map clicks and drag
const MapEventsHandler = ({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Component to fly to coordinates when updated externally
const MapFlyTo = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], map.getZoom() < 14 ? 14 : map.getZoom(), {
        duration: 0.8
      });
    }
  }, [lat, lng, map]);
  return null;
};

// Invalidate size to ensure Leaflet renders correctly inside modals
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
};

export interface LocationPickerValue {
  latitude: number;
  longitude: number;
  area: string;
  landmark: string;
  source?: 'map' | 'manual' | 'gps';
}

interface LocationPickerProps {
  value: LocationPickerValue;
  onChange: (val: LocationPickerValue) => void;
  language?: 'ta' | 'en';
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Manual coordinate inputs
  const [manualLat, setManualLat] = useState(value.latitude.toFixed(5));
  const [manualLng, setManualLng] = useState(value.longitude.toFixed(5));
  const [coordError, setCoordError] = useState<string | null>(null);

  // Keep manual inputs synced when external value changes
  useEffect(() => {
    setManualLat(value.latitude.toFixed(5));
    setManualLng(value.longitude.toFixed(5));
  }, [value.latitude, value.longitude]);

  // Handle location update from map click or drag
  const handleMapLocationChange = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    setGpsErrorMsg(null);
    let resolvedArea = value.area;
    let resolvedLandmark = value.landmark;

    try {
      const geo = await reverseGeocode(lat, lng);
      resolvedArea = geo.areaName || findNearestArea(lat, lng).name;
      if (geo.landmark && !value.landmark) {
        resolvedLandmark = geo.landmark;
      }
    } catch {
      resolvedArea = findNearestArea(lat, lng).name;
    } finally {
      setIsReverseGeocoding(false);
    }

    onChange({
      latitude: lat,
      longitude: lng,
      area: resolvedArea,
      landmark: resolvedLandmark,
      source: 'map'
    });
  };

  // Handle direct GPS request
  const handleUseCurrentGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsErrorMsg(language === 'ta' ? 'GPS வசதி கிடைக்கவில்லை' : 'Geolocation not supported');
      return;
    }

    setIsGpsLocating(true);
    setGpsErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsGpsLocating(false);

        let areaName = value.area;
        try {
          const geo = await reverseGeocode(lat, lng);
          areaName = geo.areaName || findNearestArea(lat, lng).name;
        } catch {
          areaName = findNearestArea(lat, lng).name;
        }

        onChange({
          latitude: lat,
          longitude: lng,
          area: areaName,
          landmark: value.landmark,
          source: 'gps'
        });
      },
      (err) => {
        setIsGpsLocating(false);
        setGpsErrorMsg(
          err.code === 1
            ? (language === 'ta' ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது' : 'Location permission denied')
            : (language === 'ta' ? 'GPS பெறுவதில் தோல்வி' : 'Unable to acquire GPS signal')
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  // Handle address / landmark search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await geocodeAddress(searchQuery.trim());
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a search result
  const handleSelectSearchResult = (res: any) => {
    setSearchResults([]);
    setSearchQuery('');
    onChange({
      latitude: res.latitude,
      longitude: res.longitude,
      area: res.areaName,
      landmark: res.displayName?.split(',')?.[0] || value.landmark,
      source: 'manual'
    });
  };

  // Handle manual coordinate apply
  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordError(language === 'ta' ? 'சரியான அட்சரேகை மற்றும் தீர்க்கரேகை உள்ளிடவும்' : 'Enter valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }

    setCoordError(null);
    const nearest = findNearestArea(lat, lng);
    onChange({
      latitude: lat,
      longitude: lng,
      area: nearest.name,
      landmark: value.landmark,
      source: 'manual'
    });
  };

  const pinIcon = useMemo(() => createPickerPinIcon(), []);

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 overflow-hidden shadow-inner">
      {/* Header with Mode Toggle & GPS Quick Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-800/90 border-b border-slate-700 text-xs">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வரைபடத்தில் தேர்வு' : 'Choose on Map'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'முகவரியை உள்ளிடுக' : 'Type Manually'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGps}
          disabled={isGpsLocating}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-600/40 text-sky-300 font-semibold text-[11px] active:scale-95 transition-all"
        >
          {isGpsLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span>{isGpsLocating ? (language === 'ta' ? 'கண்டறிகிறது...' : 'Locating...') : (language === 'ta' ? 'என் GPS இடம்' : 'Use Current GPS')}</span>
        </button>
      </div>

      {gpsErrorMsg && (
        <div className="px-3 py-1.5 bg-amber-950/70 border-b border-amber-800/50 text-amber-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>{gpsErrorMsg}</span>
        </div>
      )}

      {/* 1. CHOOSE ON MAP TAB */}
      {activeTab === 'map' && (
        <div className="relative">
          <div className="h-64 w-full relative z-0">
            <MapContainer
              center={[value.latitude, value.longitude]}
              zoom={14}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapResizeHandler />
              <MapFlyTo lat={value.latitude} lng={value.longitude} />
              <MapEventsHandler onLocationSelect={handleMapLocationChange} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {Number.isFinite(value.latitude) && Number.isFinite(value.longitude) && (
                <Marker
                  position={[value.latitude, value.longitude]}
                  icon={pinIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      handleMapLocationChange(position.lat, position.lng);
                    }
                  }}
                />
              )}
            </MapContainer>
          </div>

          {/* Floating Instruction Banner on Map */}
          <div className="absolute top-2 left-2 right-2 z-[400] pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-lg shadow-lg text-[11px] text-slate-200 flex items-center justify-between pointer-events-auto">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'ta'
                  ? 'வரைபடத்தில் கிளிக் செய்யவும் அல்லது குறியீட்டை இழுக்கவும்'
                  : 'Tap or drag the pin to set the exact incident spot'}
              </span>

              {isReverseGeocoding && (
                <span className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {language === 'ta' ? 'கண்டறிகிறது...' : 'Identifying...'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TYPE MANUALLY TAB */}
      {activeTab === 'manual' && (
        <div className="p-3.5 space-y-3">
          {/* Address / Landmark Search Bar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ta' ? 'இடம் அல்லது மைல்கல் தேடுக' : 'Search Place, Landmark or Street'}</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: வேளச்சேரி MRTS, அண்ணா நகர் ரவுண்டானா...'
                    : 'e.g. Velachery MRTS, Anna Nagar Roundtana, Guindy Kathipara...'
                }
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{language === 'ta' ? 'தேடு' : 'Search'}</span>
              </button>
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1.5 rounded-xl bg-slate-950 border border-slate-700 shadow-xl overflow-hidden divide-y divide-slate-800 max-h-48 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2.5 text-left text-xs hover:bg-slate-800/80 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">{item.areaName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.displayName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Locality / Zone Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                {language === 'ta' ? 'சென்னை பகுதி / மண்டலம்' : 'Locality / Zone'}
              </label>
              <select
                value={value.area}
                onChange={(e) => {
                  const areaName = e.target.value;
                  const loc = CHENNAI_AREAS.find((a) => a.name === areaName);
                  if (loc) {
                    onChange({
                      ...value,
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      area: loc.name,
                      source: 'manual'
                    });
                  } else {
                    onChange({ ...value, area: areaName, source: 'manual' });
                  }
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {CHENNAI_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    📍 {a.name} ({a.nameTa}) — {a.zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                {language === 'ta' ? 'குறிப்பிட்ட மைல்கல் / தெரு' : 'Specific Street / Landmark'}
              </label>
              <input
                type="text"
                value={value.landmark}
                onChange={(e) => onChange({ ...value, landmark: e.target.value, source: 'manual' })}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: 100 அடி சாலை, கோயில் அருகில்'
                    : 'e.g. 100ft road, Opp. Police station'
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Direct GPS Coordinates Entry */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {language === 'ta' ? 'அட்சரேகை / தீர்க்கரேகை உள்ளிடுக (விருப்பம்)' : 'Direct Coordinates (Optional)'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="Latitude (e.g. 12.9785)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="Longitude (e.g. 80.2215)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleApplyCoordinates}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
                >
                  {language === 'ta' ? 'பொருத்து' : 'Apply Coordinates'}
                </button>
              </div>
            </div>
            {coordError && (
              <p className="text-[11px] text-red-400 mt-1">{coordError}</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Location Details Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{value.area}</span>
              {value.landmark && (
                <span className="text-[11px] font-normal text-slate-300">
                  • {value.landmark}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {value.latitude.toFixed(5)}° N, {value.longitude.toFixed(5)}° E
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>
              {value.source === 'gps'
                ? 'Live GPS'
                : value.source === 'map'
                ? 'Map Pinned'
                : 'Custom Location'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
