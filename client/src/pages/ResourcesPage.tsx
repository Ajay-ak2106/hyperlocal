import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Resource } from '../types/index.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import {
  Package,
  Plus,
  PhoneCall,
  MapPin,
  Utensils,
  Droplet,
  HeartPulse,
  LifeBuoy,
  Zap,
  Truck,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { user, profile, currentArea, coords, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [providerName, setProviderName] = useState(profile?.name || 'Local Welfare Trust');
  const [providerPhone, setProviderPhone] = useState(profile?.mobile_number || '+91 98400 11223');
  const [category, setCategory] = useState('FOOD');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('packets');
  const [deliveryMode, setDeliveryMode] = useState('PICKUP_OR_DELIVERY');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getResources();
      setResources(data);
    } catch (e) {
      console.warn('Error fetching resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [lastRealtimeEvent]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    try {
      await api.createResource({
        provider_name: providerName,
        provider_phone: providerPhone,
        category,
        name: itemName,
        quantity: Number(quantity),
        unit,
        area: currentArea,
        latitude: coords.latitude,
        longitude: coords.longitude,
        delivery_mode: deliveryMode,
        is_demo: 1
      });

      setShowAddModal(false);
      setItemName('');
      await fetchResources();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDistribute = async (id: string, currentQty: number) => {
    const deduct = 10;
    const newQty = Math.max(0, currentQty - deduct);
    try {
      await api.updateResource(id, { quantity: newQty });
      await fetchResources();
    } catch (err: any) {
      console.error(err);
    }
  };

  const categories = ['ALL', 'FOOD', 'WATER', 'FIRST_AID', 'BOATS', 'CHARGING_STATIONS'];

  const filtered = resources.filter((r) => {
    if (filter === 'ALL') return true;
    return r.category === filter;
  });

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      <div className="bg-cyber-panel border border-cyber-cyan/40 p-5 rounded-2xl shadow-neon-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan"></div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 glow-text-cyan">
              [LOGISTICS // CRISIS SUPPLY DEPOT]
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
            {language === 'ta' ? 'அத்தியாவசியப் பொருட்கள் & உணவு' : 'EMERGENCY SUPPLIES & RATIONS DEPOT'}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl">
            Community-verified ration drops, drinking water tankers, motorboats, and solar charging grid nodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 rounded bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>+ OFFER SUPPLIES</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap border ${
              filter === c
                ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                : 'bg-cyber-panel text-slate-400 border-cyber-border hover:border-cyber-cyan/50 hover:text-white'
            }`}
          >
            {c.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-xl bg-cyber-panel border border-cyber-border hover:border-cyber-cyan/50 shadow-lg hover:shadow-neon-cyan transition-all flex flex-col justify-between space-y-3 relative group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40">
                  {res.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">📍 SECTOR: {res.area}</span>
              </div>

              <h3 className="text-base font-mono font-bold text-white mt-1">{res.name}</h3>

              <div className="mt-2.5 p-3 rounded-lg bg-cyber-bg border border-cyber-border flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">STOCK IN INVENTORY:</span>
                <span className="text-base font-mono font-black text-cyber-green glow-text-green">
                  {res.quantity} {res.unit.toUpperCase()}
                </span>
              </div>

              <p className="text-xs font-mono text-slate-400 mt-2">
                PROVIDER: <strong className="text-slate-200">{res.provider_name}</strong> • MODE: {res.delivery_mode}
              </p>
            </div>

            <div className="pt-2 border-t border-cyber-border flex items-center justify-between gap-2 font-mono">
              <a
                href={`tel:${res.provider_phone}`}
                className="py-2 px-3 rounded bg-cyber-cyan/15 border border-cyber-cyan/40 hover:bg-cyber-cyan hover:text-black text-cyber-cyan font-bold text-xs flex items-center gap-1.5 touch-target transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>CALL DISPATCHER</span>
              </a>

              <button
                onClick={() => handleDistribute(res.id, res.quantity)}
                disabled={res.quantity <= 0}
                className="py-2 px-3 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-green text-slate-300 hover:text-cyber-green text-xs font-bold active:scale-95 disabled:opacity-30 transition-colors"
              >
                DISPATCH 10 UNITS
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-cyber-panel border border-cyber-cyan/50 p-6 shadow-neon-cyan relative">
            <div className="flex justify-between items-center pb-3 border-b border-cyber-border">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyber-cyan" />
                OFFER CRISIS SUPPLIES TO COMMUNITY
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="mt-4 space-y-3 font-mono">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">SUPPLY CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white focus:border-cyber-cyan outline-none"
                >
                  <option value="FOOD">FOOD (Meals, Biscuits)</option>
                  <option value="WATER">WATER (Cans, Bottles)</option>
                  <option value="FIRST_AID">FIRST AID & MEDICINE</option>
                  <option value="BOATS">BOATS & RESCUE</option>
                  <option value="CHARGING_STATIONS">CHARGING & GENERATORS</option>
                  <option value="CLOTHES">CLOTHES & BLANKETS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ITEM SPECIFICATION</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. 20L Water Cans or Food Packets"
                  required
                  className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white focus:border-cyber-cyan outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">QUANTITY</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white focus:border-cyber-cyan outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">UNIT</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="packets, cans, kits"
                    required
                    className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white focus:border-cyber-cyan outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">PROVIDER / TRUST CALLSIGN</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  required
                  className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white focus:border-cyber-cyan outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded bg-cyber-cyan text-black font-extrabold text-xs shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:brightness-110 touch-target uppercase tracking-wider"
              >
                SUBMIT SUPPLIES TO LIVE ROSTER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
