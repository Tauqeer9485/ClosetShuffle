import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpDown, MapPin, Search, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCurrency } from '../currency.jsx';
import { CATEGORIES, CONDITIONS, EmptyState, Loading, cls, formatEstimate } from '../ui.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { useToast } from '../toast.jsx';

const SORTS = { featured: null, valueHigh: (a, b) => b.estimatedValue - a.estimatedValue, valueLow: (a, b) => a.estimatedValue - b.estimatedValue };

export default function Listings() {
  const { user } = useAuth();
  const [currency] = useCurrency();
  const toast = useToast();
  const [filters, setFilters] = useState({ q: '', category: '', condition: '', maxDistance: '' });
  const [sortBy, setSortBy] = useState('featured');
  const [coords, setCoords] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    if (coords) { params.set('lat', coords.lat); params.set('lng', coords.lng); }
    setStatus('loading');
    api(`/api/listings?${params}`)
      .then((d) => { setItems(d.items); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [filters, coords]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const sorted = SORTS[sortBy] ? [...items].sort(SORTS[sortBy]) : items;

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast('Location is not available in this browser', 'error');
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast('Location permission was denied', 'error'),
    );
  };

  const resetFilters = () => { setFilters({ q: '', category: '', condition: '', maxDistance: '' }); setCoords(null); };

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#F4F1EA] border-b border-[#E8E5DF]">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 backdrop-blur border border-[#E8E5DF] text-xs uppercase tracking-widest text-[#736E65] mb-8 font-medium">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Redefining The Art Of Wardrobe Exchange</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-[#1A1A1A] tracking-tight leading-[1.08] mb-6 uppercase">
            Curated Wardrobes. <br /><span className="font-light italic text-[#736E65]">Zero Currency.</span>
          </h1>
          <p className="max-w-xl mx-auto text-base text-[#4A4741] font-light leading-relaxed tracking-wide mb-10">
            Trade the pieces you no longer wear for something you'll actually love. Direct, member-to-member, no money involved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? '/list' : '/login'} className={cls.primary}>List an Item <ArrowRight className="w-4 h-4" /></Link>
            <button onClick={useMyLocation} className={cls.secondary}><MapPin className="w-4 h-4" /> {coords ? 'Using your location' : 'Show items near me'}</button>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-8 border-t border-[#E8E5DF]/80 text-center">
            <div><p className="font-serif text-2xl text-[#1A1A1A]">{items.length || '—'}</p><p className="text-[11px] uppercase tracking-widest text-[#736E65] mt-1">Items browsing</p></div>
            <div><p className="font-serif text-2xl text-[#1A1A1A]">{formatEstimate(0, currency)}</p><p className="text-[11px] uppercase tracking-widest text-[#736E65] mt-1">Cash ever spent</p></div>
            <div><p className="font-serif text-2xl text-[#1A1A1A]">100%</p><p className="text-[11px] uppercase tracking-widest text-[#736E65] mt-1">Direct swaps</p></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <span className={cls.eyebrow}>The Collection</span>
          <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mt-1">Explore Directory</h2>
        </div>

        <div className="bg-white border border-[#E8E5DF] p-5 mb-10 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908B82]" />
              <input value={filters.q} onChange={set('q')} placeholder="Search designer, keyword, or title…" className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8E5DF] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors" />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
                <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Category:</span>
                <select value={filters.category} onChange={set('category')} className="bg-transparent text-sm text-[#1A1A1A] focus:outline-none cursor-pointer">
                  <option value="">All</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
                <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Condition:</span>
                <select value={filters.condition} onChange={set('condition')} className="bg-transparent text-sm text-[#1A1A1A] focus:outline-none cursor-pointer">
                  <option value="">All</option>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
                <ArrowUpDown className="w-4 h-4 text-[#908B82]" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-[#1A1A1A] focus:outline-none cursor-pointer">
                  <option value="featured">Featured First</option>
                  <option value="valueHigh">Value: High to Low</option>
                  <option value="valueLow">Value: Low to High</option>
                </select>
              </div>
              {coords && (
                <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
                  <select value={filters.maxDistance} onChange={set('maxDistance')} className="bg-transparent text-sm text-[#1A1A1A] focus:outline-none cursor-pointer">
                    <option value="">Any distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {status === 'loading' && <Loading label="Finding pieces…" />}
        {status === 'error' && <EmptyState title="Couldn't load the directory right now." action="Reset filters" onAction={resetFilters} />}
        {status === 'ready' && sorted.length === 0 && <EmptyState title="No luxury pieces match your selected filters." action="Reset Filters" onAction={resetFilters} />}
        {status === 'ready' && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((i) => <ItemCard key={i.id} item={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
