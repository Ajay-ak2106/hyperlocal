import React, { useState } from 'react';
import { IncidentMap } from '../components/map/IncidentMap.js';
import { Incident } from '../types/index.js';
import { AlertTriangle, Home as ShelterIcon, Navigation, Info, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';

export const MapPage: React.FC = () => {
  const { language } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [nearbyShelters, setNearbyShelters] = useState<any[]>([]);
  const { lastRealtimeEvent } = useRealtime();

  React.useEffect(() => {
    Promise.all([api.getAlerts(), api.getIncidents()]).then(([alertsData, incidentsData]) => {
      const mappedAlerts = alertsData.map((alert: any) => ({
        id: alert.id,
        title: alert.title,
        location: alert.area,
        time: new Date(alert.created_at).toLocaleTimeString(),
        level: alert.severity === 'critical' ? 'CRITICAL' : 'HIGH',
        type: 'alert',
        timestamp: new Date(alert.created_at).getTime()
      }));

      const mappedIncidents = incidentsData.map((inc: any) => ({
        id: inc.id,
        title: `Reported: ${inc.type.toUpperCase().replace('_', ' ')}`,
        location: inc.address,
        time: new Date(inc.created_at).toLocaleTimeString(),
        level: inc.severity === 'critical' ? 'CRITICAL' : 'HIGH',
        type: inc.type,
        timestamp: new Date(inc.created_at).getTime()
      }));

      const combined = [...mappedAlerts, ...mappedIncidents]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4); // Top 4 for the sidebar
      setActiveAlerts(combined);
    }).catch(err => console.error(err));
    
    api.getShelters().then(data => {
      const mapped = data.slice(0, 2).map((shelter: any) => ({
        id: shelter.id,
        name: shelter.name,
        dist: 'Nearby', // Mocked distance since we don't have user location here
        open: shelter.status === 'ACTIVE' || shelter.status === 'active' || true
      }));
      setNearbyShelters(mapped);
    }).catch(err => console.error(err));
  }, [lastRealtimeEvent]);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 p-2 sm:p-0">
      
      {/* Main Map Content */}
      <div className="flex-1 flex flex-col min-h-[60vh] xl:min-h-0 bg-white/40 backdrop-blur-xl border-slate-200/50 rounded-3xl border overflow-hidden shadow-xl relative">


        <IncidentMap
          height="100%"
          onSelectIncident={(inc) => setSelectedIncident(inc)}
        />
        

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
