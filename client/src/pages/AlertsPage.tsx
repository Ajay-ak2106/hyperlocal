import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { api } from '../services/api.js';

export const AlertsPage: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.getAlerts().then(data => {
      // Map supabase DB fields to the format AlertsPage expects
      const mapped = data.map((alert: any) => ({
        id: alert.id,
        type: 'Alert', 
        title: alert.title,
        location: alert.area,
        level: alert.severity === 'critical' ? 'CRITICAL' : alert.severity === 'warning' ? 'HIGH' : 'MODERATE',
        time: new Date(alert.created_at).toLocaleTimeString()
      }));
      setActiveAlerts(mapped);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Active Alerts</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time emergency and incident reports in your area</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeAlerts.map(alert => (
          <div key={alert.id} className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              alert.level === 'CRITICAL' ? 'bg-red-50 text-red-500' :
              alert.level === 'HIGH' ? 'bg-amber-50 text-amber-500' :
              'bg-blue-50 text-blue-500'
            }`}>
              <AlertTriangle size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-800 truncate">{alert.title}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  alert.level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  alert.level === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {alert.level}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                <MapPin size={14} className="text-slate-400" />
                {alert.location}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg shrink-0">
              <Clock size={14} />
              {alert.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
