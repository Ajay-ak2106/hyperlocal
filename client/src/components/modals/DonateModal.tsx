import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { FundCampaign } from '../../types/index.js';
import { HeartHandshake, CheckCircle2, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [campaign, setCampaign] = useState<FundCampaign | null>(null);
  const [amount, setAmount] = useState<number>(500);
  const [donorName, setDonorName] = useState('Citizen Supporter');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <HeartHandshake className="w-5 h-5" />
            <span>Disaster Relief Fund</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successTxn ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Thank You for Your Support!</h4>
            <p className="text-xs text-slate-300">
              Your contribution of ₹{amount.toLocaleString()} has been added to the relief fund.
            </p>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
              Receipt Reference: <span className="text-emerald-400 font-bold">{successTxn}</span>
            </div>
            <button
              onClick={() => {
                setSuccessTxn(null);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="mt-4 space-y-4">
            {campaign && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase">{campaign.title}</h4>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Collected: <strong className="text-emerald-400">₹{campaign.collected_amount.toLocaleString()}</strong></span>
                  <span>Target: ₹{campaign.target_amount.toLocaleString()}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 text-right">
                  {campaign.donor_count} donors • {percentage}% funded
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Amount (₹)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[200, 500, 1000, 2500].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      amount === amt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
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
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
              <span>Contribute ₹{amount}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
