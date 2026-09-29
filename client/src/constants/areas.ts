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
