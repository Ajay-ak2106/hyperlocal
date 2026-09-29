import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { FundCampaign } from '../../types/index.js';
import { HeartHandshake, ShieldAlert, CheckCircle2, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [campaign, setCampaign] = useState<FundCampaign | null>(null);
  const [amount, setAmount] = useState<number>(500);
  const [donorName, setDonorName] = useState('Kind Supporter');
  const [loading, setLoading] = useState(false);
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getFunds().then((data) => {
        if (data.campaigns.length > 0) {
          setCampaign(data.campaigns[0]);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setLoading(true);

    try {
      const res = await api.donate({
        campaign_id: campaign.id,
        donor_name: donorName,
        amount
      });

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      setSuccessTxn(res.donation.transaction_ref);
      setCampaign(res.campaign);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const percentage = campaign
    ? Math.min(100, Math.round((campaign.collected_amount / campaign.target_amount) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase">
            <HeartHandshake className="w-5 h-5" />
            NammaRescue Relief Fund
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Hackathon Demo Mode Disclaimer (Requirement #28) */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>DEMO PAYMENT MODE: Prototype demonstration. No real bank charges or card numbers stored.</span>
        </div>

        {successTxn ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-white">Thank You for Your Support!</h4>
            <p className="text-xs text-slate-400">
              Your contribution of ₹{amount.toLocaleString()} has been credited to the relief campaign pool.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              Ref ID: <span className="text-emerald-400 font-bold">{successTxn}</span>
            </div>
            <button
              onClick={() => {
                setSuccessTxn(null);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="mt-4 space-y-4">
            {campaign && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-1">{campaign.title}</h4>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Collected: <strong className="text-emerald-400">₹{campaign.collected_amount.toLocaleString()}</strong></span>
                  <span>Target: ₹{campaign.target_amount.toLocaleString()}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500 text-right">
                  {campaign.donor_count} donors • {percentage}% funded
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Contribution Amount (INR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[200, 500, 1000, 2500].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      amount === amt
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={50}
                required
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-2.5 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 active:scale-98 transition-all touch-target"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
              <span>CONFIRM DEMO DONATION (₹{amount})</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
