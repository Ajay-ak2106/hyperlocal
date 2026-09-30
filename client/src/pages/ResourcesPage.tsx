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
  X,
  Loader2
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { profile, currentArea, coords, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [providerName, setProviderName] = useState(profile?.name || 'Community Volunteer');
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
      <div className="bg-white/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>📦</span>
            {language === 'ta' ? 'அத்தியாவசியப் பொருட்கள் & உணவு' : 'Emergency Supplies & Food'}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            {language === 'ta'
              ? 'உணவு பொட்டலங்கள், குடிநீர், படகுகள் மற்றும் அத்தியாவசிய பொருட்கள்.'
              : 'Community-contributed food packets, potable water, rescue boats, and supplies.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ta' ? '+ பொருட்கள் வழங்க' : '+ Offer Supplies'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap border ${
              filter === c
                ? 'bg-sky-600 text-slate-800 border-sky-500'
                : 'bg-slate-100/80 text-slate-600 border-slate-700 hover:bg-slate-700'
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
            className="p-5 rounded-2xl bg-slate-100/80 border border-slate-700 hover:border-slate-600 transition-all shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-md text-sky-300 border border-slate-700">
                  {res.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500">📍 {res.area}</span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-1">{res.name}</h3>

              <div className="mt-2.5 p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Available Quantity:</span>
                <span className="text-base font-bold text-emerald-400">
                  {res.quantity} {res.unit}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2">
                Provided by: <strong className="text-slate-800">{res.provider_name}</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-2">
              <a
                href={`tel:${res.provider_phone}`}
                className="py-2 px-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 text-sky-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Provider</span>
              </a>

              <button
                onClick={() => handleDistribute(res.id, res.quantity)}
                disabled={res.quantity <= 0}
                className="py-2 px-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 text-slate-700 text-xs font-semibold active:scale-95 disabled:opacity-30 transition-colors"
              >
                Distribute 10
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                {language === 'ta' ? 'புதிய பொருட்கள் வழங்கல்' : 'Offer Relief Supplies'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Food Packets (Veg Biryani)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 border border-slate-700 px-3 py-2 text-slate-800 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 border border-slate-700 px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="FOOD">Food</option>
                    <option value="WATER">Water</option>
                    <option value="FIRST_AID">Medical / First Aid</option>
                    <option value="BOATS">Rescue Boat</option>
                    <option value="CHARGING_STATIONS">Charging Station</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-100 border border-slate-700 px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Provider / Organization Name</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 border border-slate-700 px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={providerPhone}
                  onChange={(e) => setProviderPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 border border-slate-700 px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-800 font-bold text-sm shadow-md transition-all active:scale-98"
              >
                Submit Supply Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
