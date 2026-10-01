export interface AreaLocation {
  name: string;
  nameTa: string;
  zone: string;
  latitude: number;
  longitude: number;
}

export const CHENNAI_AREAS: AreaLocation[] = [
  { name: 'Velachery', nameTa: 'வேளச்சேரி', zone: 'Zone 13', latitude: 12.9785, longitude: 80.2215 },
  { name: 'Tambaram', nameTa: 'தாம்பரம்', zone: 'Tambaram Corp', latitude: 12.9235, longitude: 80.1285 },
  { name: 'Pallikaranai', nameTa: 'பள்ளிக்கரணை', zone: 'Zone 14', latitude: 12.9355, longitude: 80.2140 },
  { name: 'Madipakkam', nameTa: 'மடிப்பாக்கம்', zone: 'Zone 14', latitude: 12.9635, longitude: 80.1990 },
  { name: 'Saidapet', nameTa: 'சைதாப்பேட்டை', zone: 'Zone 10', latitude: 13.0210, longitude: 80.2230 },
  { name: 'Adyar', nameTa: 'அடையாறு', zone: 'Zone 13', latitude: 13.0067, longitude: 80.2570 },
  { name: 'Perungudi', nameTa: 'பெருங்குடி', zone: 'Zone 14', latitude: 12.9660, longitude: 80.2470 },
  { name: 'Medavakkam', nameTa: 'மேடவாக்கம்', zone: 'South Zone', latitude: 12.9180, longitude: 80.1920 },
  { name: 'T. Nagar', nameTa: 'தி. நகர்', zone: 'Zone 10', latitude: 13.0418, longitude: 80.2341 },
  { name: 'Guindy', nameTa: 'கிண்டி', zone: 'Zone 13', latitude: 13.0067, longitude: 80.2025 },
  { name: 'Mylapore', nameTa: 'மயிலாப்பூர்', zone: 'Zone 9', latitude: 13.0336, longitude: 80.2678 },
  { name: 'Sholinganallur', nameTa: 'சோழிங்கநல்லூர்', zone: 'Zone 15', latitude: 12.9010, longitude: 80.2279 },
  { name: 'Anna Nagar', nameTa: 'அண்ணா நகர்', zone: 'Zone 8', latitude: 13.0850, longitude: 80.2101 },
  { name: 'Koyambedu', nameTa: 'கோயம்பேடு', zone: 'Zone 8', latitude: 13.0694, longitude: 80.1948 }
];

export const getAreaLocation = (areaName: string): AreaLocation => {
  const found = CHENNAI_AREAS.find(
    (a) => a.name.toLowerCase() === areaName.toLowerCase() || a.nameTa === areaName
  );
  return found || CHENNAI_AREAS[0];
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findNearestArea = (lat: number, lng: number): AreaLocation => {
  let minDistance = Infinity;
  let closest = CHENNAI_AREAS[0];

  for (const area of CHENNAI_AREAS) {
    const d = calculateDistance(lat, lng, area.latitude, area.longitude);
    if (d < minDistance) {
      minDistance = d;
      closest = area;
    }
  }

  return closest;
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ areaName: string; displayName?: string; landmark?: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2600);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    const addr = data.address || {};
    const locality =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.quarter ||
      addr.city_district ||
      addr.town ||
      addr.village ||
      addr.city ||
      findNearestArea(lat, lng).name;
    const landmark = addr.road || addr.amenity || addr.building || data.display_name?.split(',')?.[0];
    return { areaName: locality, displayName: data.display_name, landmark };
  } catch {
    const nearest = findNearestArea(lat, lng);
    return { areaName: nearest.name };
  }
};

export const geocodeAddress = async (
  query: string
): Promise<{ latitude: number; longitude: number; displayName: string; areaName: string }[]> => {
  if (!query || query.trim().length < 2) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const cleanQuery = query.toLowerCase().includes('chennai') || query.toLowerCase().includes('tamil') 
      ? query 
      : `${query}, Chennai`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&limit=5&addressdetails=1&viewbox=79.8,13.4,80.4,12.7`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Search failed');
    const list = await res.json();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const addr = item.address || {};
        const areaName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city ||
          findNearestArea(lat, lon).name;
        return {
          latitude: lat,
          longitude: lon,
          displayName: item.display_name,
          areaName
        };
      });
    }
    throw new Error('No results from online search');
  } catch {
    // Offline / Local match fallback
    const qLower = query.toLowerCase();
    const matches = CHENNAI_AREAS.filter(
      (a) =>
        a.name.toLowerCase().includes(qLower) ||
        a.nameTa.includes(query) ||
        a.zone.toLowerCase().includes(qLower)
    );
    return matches.map((m) => ({
      latitude: m.latitude,
      longitude: m.longitude,
      displayName: `${m.name} (${m.nameTa}), Chennai — ${m.zone}`,
      areaName: m.name
    }));
  }
};
