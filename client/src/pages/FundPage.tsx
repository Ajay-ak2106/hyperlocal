import React, { useState } from 'react';
import { Heart, CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const FundPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'bank'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const predefinedAmounts = [100, 500, 1000, 2000];

  const handleDonate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Thank you for your donation!</h2>
        <p className="text-slate-600 font-medium max-w-lg mb-8">
          Your contribution goes directly towards providing essential supplies, rescue operations, and relief materials to the affected areas.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
          <Heart size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Disaster Relief Fund</h1>
          <p className="text-sm text-slate-500 font-medium">100% of proceeds go to verified relief camps and rescue teams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Select Amount (₹)</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {predefinedAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-xl font-bold transition-all border-2 ${
                  selectedAmount === amount 
                    ? 'border-rose-500 bg-rose-50 text-rose-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
                }`}
              >
                ₹ {amount}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                placeholder="Other Amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-8 pr-4 font-bold text-slate-800 focus:border-rose-500 outline-none transition-colors"
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Method</h3>
          <div className="space-y-3 mb-8">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div className="text-left">
                <div className={`font-bold ${paymentMethod === 'upi' ? 'text-emerald-700' : 'text-slate-700'}`}>UPI (GPay, PhonePe)</div>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-sky-600' : 'text-slate-500'}`} />
              <div className="text-left">
                <div className={`font-bold ${paymentMethod === 'card' ? 'text-sky-700' : 'text-slate-700'}`}>Credit / Debit Card</div>
              </div>
            </button>
          </div>

          <button
            onClick={handleDonate}
            disabled={(!selectedAmount && !customAmount) || isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50 flex justify-center"
          >
            {isProcessing ? 'Processing...' : `Donate ₹${selectedAmount || customAmount}`}
          </button>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Secure & Transparent</h3>
            <p className="text-slate-600 font-medium text-sm">
              All transactions are encrypted and processed securely. We provide full transparency reports on how your funds are utilized for disaster relief.
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-4 text-sky-600">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Where does the money go?</h3>
            <ul className="text-slate-600 font-medium text-sm space-y-2">
              <li className="flex items-center gap-2">• Medical supplies and first-aid kits</li>
              <li className="flex items-center gap-2">• Food and clean drinking water for shelters</li>
              <li className="flex items-center gap-2">• Rescue boat fuel and operational costs</li>
              <li className="flex items-center gap-2">• Blanket and clothing distributions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
