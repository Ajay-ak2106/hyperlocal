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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              📦 Emergency Resource Exchange
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'ta' ? 'அத்தியாவசியப் பொருட்கள் & உணவு' : 'Emergency Supplies & Food Hub'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Community-supplied food, drinking water, motorboats, and solar charging points.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-purple-950 flex items-center justify-center gap-2 active:scale-95 transition-all touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>OFFER SUPPLIES</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === c
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {res.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-bold text-slate-400">📍 {res.area}</span>
              </div>

              <h3 className="text-base font-extrabold text-white">{res.name}</h3>

              <div className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Available Stock:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {res.quantity} {res.unit}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Provider: <strong className="text-slate-200">{res.provider_name}</strong> • Mode: {res.delivery_mode}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={`tel:${res.provider_phone}`}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 touch-target"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Provider</span>
              </a>

              <button
                onClick={() => handleDistribute(res.id, res.quantity)}
                disabled={res.quantity <= 0}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold active:scale-95 disabled:opacity-50"
              >
                Distribute 10 Units
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Offer Supplies to Community
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Item Title</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. 20L Water Cans or Food Packets"
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="packets, cans, kits"
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Provider Name</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 font-extrabold text-xs text-white shadow-xl shadow-purple-950 touch-target"
              >
                SUBMIT SUPPLIES TO DATABASE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
