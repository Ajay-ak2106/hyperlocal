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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-cyber-panel border border-cyber-green/50 p-6 shadow-neon-green relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

        <div className="flex justify-between items-center pb-3 border-b border-cyber-border font-mono">
          <div className="flex items-center gap-2 text-cyber-green font-bold text-xs uppercase glow-text-green">
            <HeartHandshake className="w-4 h-4" />
            [RELIEF FUND // CITIZEN DISASTER AID]
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Disclaimer */}
        <div className="mt-3 p-2.5 rounded bg-cyber-amber/10 border border-cyber-amber/30 flex items-center gap-2 text-[11px] text-cyber-amber font-mono">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>SIMULATED CITIZEN FUNDING POOL (PROTOTYPE DEMONSTRATION).</span>
        </div>

        {successTxn ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-14 h-14 text-cyber-green mx-auto animate-bounce glow-text-green" />
            <h4 className="text-lg font-bold text-white uppercase">CONTRIBUTION VERIFIED</h4>
            <p className="text-xs text-slate-400 font-sans">
              Your contribution of ₹{amount.toLocaleString()} has been credited to the relief campaign pool.
            </p>
            <div className="p-3 rounded bg-cyber-bg border border-cyber-green/40 font-mono text-xs text-slate-300">
              TXN HASH: <span className="text-cyber-green font-bold">{successTxn}</span>
            </div>
            <button
              onClick={() => {
                setSuccessTxn(null);
                onClose();
              }}
              className="w-full py-2.5 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-green text-slate-300 hover:text-cyber-green font-bold text-xs"
            >
              CLOSE WINDOW
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="mt-4 space-y-4 font-mono">
            {campaign && (
              <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border">
                <h4 className="text-xs font-bold text-white mb-1 uppercase">{campaign.title}</h4>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>DISPERSED: <strong className="text-cyber-green">₹{campaign.collected_amount.toLocaleString()}</strong></span>
                  <span>TARGET: ₹{campaign.target_amount.toLocaleString()}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyber-green shadow-neon-green transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500 text-right">
                  {campaign.donor_count} PATRONS • {percentage}% FUNDED
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                SELECT PLEDGE AMOUNT (INR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2 font-mono">
                {[200, 500, 1000, 2500].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded text-xs font-bold border transition-all ${
                      amount === amt
                        ? 'bg-cyber-green text-black border-cyber-green shadow-neon-green'
                        : 'bg-cyber-bg border-cyber-border text-slate-300 hover:border-cyber-green/50'
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
                className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-mono focus:border-cyber-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                PATRON CALLSIGN / NAME
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                className="w-full rounded bg-cyber-bg border border-cyber-border p-2.5 text-xs text-white font-sans focus:border-cyber-green outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-cyber-green text-black font-extrabold text-xs shadow-neon-green flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all touch-target"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <HeartHandshake className="w-4 h-4" />}
              <span>DISPATCH PLEDGE (₹{amount})</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
