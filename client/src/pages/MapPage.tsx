import React, { useState } from 'react';
import { IncidentMap } from '../components/map/IncidentMap.js';
import { Incident } from '../types/index.js';
import { AlertTriangle, Home as ShelterIcon, Navigation, Info, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

export const MapPage: React.FC = () => {
  const { language } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Mock data for the sidebar to match the UI image
  const activeAlerts = [
    { id: 1, title: 'Flood Risk Area', location: 'Adyar, Chennai', time: '2h ago', level: 'High Risk', type: 'flood' },
    { id: 2, title: 'Landslide Risk', location: 'Valparai, Coimbatore', time: '4h ago', level: 'Medium Risk', type: 'landslide' },
    { id: 3, title: 'Heavy Rainfall', location: 'Tiruvallur, Chennai', time: '5h ago', level: 'Moderate', type: 'rain' },
    { id: 4, title: 'Road Blocked', location: 'OMR Road, Chennai', time: '5h ago', level: 'Blocked', type: 'road' }
  ];

  const nearbyShelters = [
    { id: 1, name: 'Government High School', dist: '1.2 km', open: true },
    { id: 2, name: 'Community Hall', dist: '2.8 km', open: true },
  ];

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 p-2 sm:p-0">
      
      {/* Main Map Content */}
      <div className="flex-1 flex flex-col min-h-[60vh] xl:min-h-0 bg-white/40 backdrop-blur-xl border-slate-200/50 rounded-3xl border overflow-hidden shadow-xl relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-2 rounded-2xl flex gap-2 border border-slate-200/80 shadow-md">
           <button className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-sm">All</button>
           <button className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">Flood</button>
           <button className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">Landslide</button>
           <button className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">Fire</button>
           <button className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">Other</button>
        </div>

        <IncidentMap
          height="100%"
          onSelectIncident={(inc) => setSelectedIncident(inc)}
        />
        
        {/* Floating action buttons */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
           <button className="w-12 h-12 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-md transition-colors">
             <Navigation size={20} />
           </button>
           <button className="w-12 h-12 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-md transition-colors">
             <Info size={20} />
           </button>
        </div>
      </div>

      {/* Right Sidebar Widget Area */}
      <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">
        
        {/* Active Alerts Card */}
        <div className="bg-white/70 backdrop-blur-xl border-slate-200/50 rounded-3xl border p-5 shadow-lg flex-1 max-h-[50vh] xl:max-h-none overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-lg">Active Alerts</h3>
            <button className="text-emerald-600 text-xs font-bold hover:underline">View All &rarr;</button>
          </div>
          
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-2xl bg-white/60 border border-slate-200/50 hover:bg-white shadow-sm transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-50 text-red-500">
                   <AlertTriangle size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-slate-800 truncate">{alert.title}</h4>
                   <p className="text-xs text-slate-500 font-medium truncate">{alert.location}</p>
                   <p className="text-[10px] text-slate-400 mt-1 font-semibold">{alert.level}</p>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                   {alert.time}
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Shelters Card */}
        <div className="bg-white/70 backdrop-blur-xl border-slate-200/50 rounded-3xl border p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-lg">Nearby Shelters</h3>
            <button className="text-emerald-600 text-xs font-bold hover:underline">View All &rarr;</button>
          </div>
          
          <div className="space-y-3">
             {nearbyShelters.map(shelter => (
               <div key={shelter.id} className="flex gap-3 p-3 rounded-2xl bg-white/60 border border-slate-200/50 hover:bg-white shadow-sm transition-colors cursor-pointer">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                   <ShelterIcon size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-slate-800 truncate">{shelter.name}</h4>
                   <p className="text-xs text-slate-500 font-medium truncate">{shelter.dist} • Open 24/7</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};
