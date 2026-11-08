import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCurrency } from '../currency.jsx';
import { CATEGORIES, CONDITIONS, cls, formatEstimate } from '../ui.jsx';

// Standalone estimator — lets anyone preview a swap value before creating an account or a listing.
// Calls the same POST /api/listings/calculate-value endpoint NewListing uses.
export default function ValueCalculator() {
  const { user } = useAuth();
  const [currency] = useCurrency();
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const calculate = async () => {
    setBusy(true);
    try {
      const d = await api('/api/listings/calculate-value', { method: 'POST', body: { category, brand, condition } });
      setResult(d.estimatedValue);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { calculate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <span className={cls.eyebrow}>Algorithmic Precision</span>
        <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-1">Instant Valuation Engine</h1>
        <p className="text-sm text-[#736E65] mt-2 font-light max-w-lg mx-auto">
          Estimate the swap point value of a garment based on category, brand tier and condition — before you list it.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-sm">
        <div className="space-y-6">
          <div>
            <label className={cls.label}>Brand</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nike, H&M, Zara…" className={cls.input} />
          </div>
          <div>
            <label className={cls.label}>Apparel Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={cls.input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={cls.label}>Condition Grade</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={cls.input}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={calculate} disabled={busy} className={`${cls.primary} w-full`}>{busy ? 'Calculating…' : 'Calculate Point Value'}</button>
        </div>

        <div className="bg-[#F4F1EA] p-8 border border-[#E8E5DF] text-center flex flex-col justify-between h-full">
          <div>
            <span className={cls.eyebrow}>Estimated Swap Power</span>
            <div className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] my-5">{result ?? '—'} <span className="text-2xl font-sans">PTS</span></div>
            <div className="p-3 bg-white border border-[#E8E5DF] inline-block w-full mb-3 font-mono text-sm">
              Reference value: <strong className="text-[#1A1A1A]">{formatEstimate(result || 0, currency)}</strong>
            </div>
            <p className="text-sm text-[#736E65] font-light leading-relaxed">
              Matches with other members' items within 25% of this value are marked as well balanced.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E8E5DF]">
            <button
              onClick={() => navigate(user ? '/list' : '/login')}
              className="w-full py-3.5 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all font-medium"
            >
              Add To My Wardrobe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
