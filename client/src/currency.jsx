import { createContext, useContext, useState } from 'react';
import { CURRENCIES } from './ui.jsx';

// Cosmetic only — see ui.jsx CURRENCIES note. Persists per-browser so it's stable across visits.
const CurrencyContext = createContext(['USD', () => {}]);
export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('currency') || 'USD'; } catch { return 'USD'; }
  });
  const set = (c) => {
    setCurrency(c);
    try { localStorage.setItem('currency', c); } catch { /* ignore */ }
  };
  return <CurrencyContext.Provider value={[currency, set]}>{children}</CurrencyContext.Provider>;
}

export function CurrencyPicker() {
  const [currency, setCurrency] = useCurrency();
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="bg-transparent text-xs font-mono font-medium text-[#1A1A1A] focus:outline-none cursor-pointer"
      title="Display currency (reference only — swaps use points)"
    >
      {Object.keys(CURRENCIES).map((code) => <option key={code} value={code}>{code}</option>)}
    </select>
  );
}
