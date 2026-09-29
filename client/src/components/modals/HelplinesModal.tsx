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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-cyber-panel border border-cyber-red/50 p-6 shadow-neon-red relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-red"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-red"></div>

        <div className="flex justify-between items-center pb-3 border-b border-cyber-border font-mono">
          <div className="flex items-center gap-2 text-cyber-red font-bold text-xs uppercase glow-text-red">
            <PhoneCall className="w-4 h-4 animate-pulse" />
            [SOS PROTOCOL // OFFICIAL EMERGENCY HELPLINES]
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[65vh] overflow-y-auto pr-1 font-mono">
          {loading ? (
            <div className="py-8 text-center text-xs text-cyber-green">CONNECTING TO GCC HELPLINE SWITCHBOARD...</div>
          ) : (
            contacts.map((c) => {
              const Icon = getIcon(c.category);
              return (
                <a
                  key={c.id}
                  href={`tel:${c.phone_number.replace(/\s+/g, '')}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-cyber-bg hover:bg-cyber-panel border border-cyber-border hover:border-cyber-green/50 active:scale-98 transition-all touch-target group shadow-sm hover:shadow-neon-green"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-cyber-red/20 text-cyber-red flex items-center justify-center border border-cyber-red/40 group-hover:border-cyber-green group-hover:text-cyber-green transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white leading-tight">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.category?.replace(/_/g, ' ') || 'HOTLINE'}
                      </span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-cyber-red text-white font-mono font-bold text-xs flex items-center gap-1 shadow-neon-red group-hover:bg-cyber-green group-hover:text-black group-hover:shadow-neon-green transition-all">
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
