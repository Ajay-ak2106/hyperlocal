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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase">
            <PhoneCall className="w-5 h-5" />
            Emergency Helplines (Direct Tap to Call)
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[65vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading helplines...</div>
          ) : (
            contacts.map((c) => {
              const Icon = getIcon(c.category);
              return (
                <a
                  key={c.id}
                  href={`tel:${c.phone_number.replace(/\s+/g, '')}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 active:scale-98 transition-all touch-target"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.category?.replace(/_/g, ' ') || 'HELPLINE'}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs flex items-center gap-1 shadow-md shadow-rose-950">
                    <PhoneCall className="w-3.5 h-3.5" />
                    {c.phone_number}
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
