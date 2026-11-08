import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shirt } from 'lucide-react';

// Shared class recipes — editorial cream/ink/gold system, sharp corners, no shadows.
export const cls = {
  input:
    'w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-sm text-[#1A1A1A] placeholder-[#B8B2A6] focus:outline-none focus:border-[#1A1A1A] transition-colors',
  label: 'text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium',
  primary:
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#E8E5DF] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:border-[#1A1A1A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#C0392B]/40 text-[#C0392B] text-xs sm:text-sm uppercase tracking-widest hover:border-[#C0392B] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed',
  panel: 'bg-white border border-[#E8E5DF]',
  heading: 'font-serif uppercase tracking-tight text-[#1A1A1A]',
  eyebrow: 'text-xs uppercase tracking-widest text-[#908B82] font-semibold',
};

export const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Dresses', 'Ethnic Wear'];
export const CONDITIONS = ['New with tags', 'Like New', 'Good', 'Fair'];

// A swap counts as balanced when the two values are within 25% (same rule as the server)
export const FAIR_RATIO = 1.25;

export const pts = (n) => `${Number(n || 0).toLocaleString()} PTS`;

// Cosmetic display-only currency conversion. The server only ever deals in points;
// nothing here is sent back to the API, it just gives members a familiar reference number.
export const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 83.5 },
};
export const formatEstimate = (points, currency = 'USD') => {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  return `${c.symbol}${Math.round((points || 0) * c.rate).toLocaleString()}`;
};

export function timeAgo(date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return 'Just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

// Resolves with {lat, lng} or rejects with a readable error
export const locate = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not available in this browser'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Location permission was denied')),
      { timeout: 10000 },
    );
  });

export function ItemImage({ item, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = item?.images?.[0];
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={item.title}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#F4F1EA] text-[#B8B2A6]">
      <Shirt className="w-9 h-9 text-[#C5A880]/60" aria-hidden="true" />
      <span className="text-[10px] uppercase tracking-widest px-2 text-center">{item?.brand || item?.category}</span>
    </div>
  );
}

const TONES = {
  emerald: 'bg-[#F4F1EA] text-[#4A4741] border-[#1A1A1A]/20',
  amber: 'bg-white text-[#A9822F] border-[#C5A880]/60',
  red: 'bg-white text-[#C0392B] border-[#C0392B]/30',
  zinc: 'bg-[#F4F1EA] text-[#908B82] border-[#E8E5DF]',
};
const STATUS = {
  AVAILABLE: ['Available', 'emerald'],
  PENDING_SWAP: ['In a swap', 'amber'],
  SWAPPED: ['Swapped', 'zinc'],
  PENDING: ['Awaiting reply', 'amber'],
  ACCEPTED: ['Accepted', 'emerald'],
  REJECTED: ['Declined', 'red'],
  CANCELLED: ['Cancelled', 'zinc'],
  COMPLETED: ['Completed', 'emerald'],
};
export function StatusPill({ status }) {
  const [label, tone] = STATUS[status] || [status, 'zinc'];
  return <span className={`px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider ${TONES[tone]}`}>{label}</span>;
}

// Two values side by side with a proportional bar and a plain-language fairness verdict
export function ValueBalance({ give, get }) {
  const total = give + get;
  const givePct = total ? Math.round((give / total) * 100) : 50;
  const hi = Math.max(give, get);
  const lo = Math.min(give, get);
  const fair = lo > 0 && hi / lo <= FAIR_RATIO;
  const pct = total ? Math.round((1 - Math.abs(give - get) / total) * 1000) / 10 : 100;
  return (
    <div className="p-4 bg-[#FAF8F5] border border-[#E8E5DF] space-y-3">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-[#4A4741]">Fairness rating: <strong className="font-mono text-[#1A1A1A]">{pct}% balanced</strong></span>
        <span className="text-[#908B82] font-mono text-xs">Delta: {Math.abs(give - get)} pts</span>
      </div>
      <div className="flex h-1.5 bg-[#E8E5DF]" role="img" aria-label={`You give ${give} points, you get ${get} points`}>
        <div className="bg-[#1A1A1A]" style={{ width: `${givePct}%` }} />
        <div className="bg-[#C5A880]" style={{ width: `${100 - givePct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[#736E65]">
        <span>You give <strong className="font-mono text-[#1A1A1A]">{pts(give)}</strong></span>
        <span>You get <strong className="font-mono text-[#1A1A1A]">{pts(get)}</strong></span>
      </div>
      {!fair && (
        <p className="text-[11px] text-[#908B82] italic">
          The gap is more than 25%. You can still send the request and settle the difference in chat.
        </p>
      )}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return <p className="text-sm text-[#908B82] py-12 text-center font-light">{label}</p>;
}

export function ErrorNote({ children }) {
  return <p role="alert" className="text-sm text-[#C0392B] bg-white border border-[#C0392B]/30 px-4 py-3">{children}</p>;
}

export function EmptyState({ title, action, actionTo, onAction, icon: Icon = Search }) {
  return (
    <div className="text-center py-20 border border-dashed border-[#E8E5DF] bg-white space-y-3">
      <Icon className="w-8 h-8 text-[#B8B2A6] mx-auto" aria-hidden="true" />
      <p className="font-serif text-xl text-[#736E65]">{title}</p>
      {action && actionTo && <Link to={actionTo} className={`${cls.primary} mt-2`}>{action}</Link>}
      {action && onAction && <button onClick={onAction} className={`${cls.primary} mt-2`}>{action}</button>}
    </div>
  );
}
