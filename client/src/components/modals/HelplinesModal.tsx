import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { EmergencyContact } from '../../types/index.js';
import { PhoneCall, Shield, AlertTriangle, X, Ambulance, Flame, Building2, Zap } from 'lucide-react';

interface HelplinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplinesModal: React.FC<HelplinesModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getContacts().then((data) => {
        setContacts(data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (cat?: string) => {
    if (cat === 'AMBULANCE') return Ambulance;
    if (cat === 'FIRE') return Flame;
    if (cat === 'DISASTER_MANAGEMENT' || cat === 'MUNICIPAL') return Building2;
    if (cat === 'UTILITY') return Zap;
    return PhoneCall;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Helplines (24/7)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-2 mb-3">
          Tap any number below to dial official government emergency services directly:
        </p>

        <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading helpline contacts...</div>
          ) : (
            contacts.map((c) => {
              const Icon = getIcon(c.category);
              return (
                <a
                  key={c.id}
                  href={`tel:${c.phone_number.replace(/\s+/g, '')}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 active:scale-98 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-500/30 group-hover:bg-emerald-950/60 group-hover:text-emerald-300 group-hover:border-emerald-500/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {c.category?.replace(/_/g, ' ') || 'Emergency'}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-red-600 group-hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{c.phone_number}</span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
