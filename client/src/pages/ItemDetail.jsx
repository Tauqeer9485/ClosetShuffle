import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCurrency } from '../currency.jsx';
import { useToast } from '../toast.jsx';
import { ItemImage, Loading, StatusPill, cls, formatEstimate } from '../ui.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [currency] = useCurrency();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api(`/api/listings/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-[#C0392B] max-w-7xl mx-auto px-6 py-16">{error}</p>;
  if (!data) return <Loading label="Loading item…" />;

  const { listing, owner } = data;
  const mine = user?.id === listing.userId;
  const images = listing.images?.length ? listing.images : [null];

  async function remove() {
    if (!confirm('Remove this listing? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api(`/api/listings/${listing.id}`, { method: 'DELETE' });
      toast('Listing removed');
      navigate('/dashboard');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/" className="text-xs sm:text-sm uppercase tracking-widest text-[#736E65] hover:text-[#1A1A1A] flex items-center gap-2 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Return To Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] bg-[#F4F1EA] border border-[#E8E5DF] overflow-hidden">
            <ItemImage item={{ images: [images[activeImg]], title: listing.title, brand: listing.brand }} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-4">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)} className={`w-24 h-28 border overflow-hidden transition-all ${activeImg === idx ? 'border-[#1A1A1A]' : 'border-[#E8E5DF] opacity-60 hover:opacity-100'}`}>
                  <ItemImage item={{ images: [img], title: listing.title, brand: listing.brand }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E8E5DF] p-8 sm:p-10">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#908B82] uppercase tracking-widest mb-2 font-medium">
            <span>{listing.brand || 'Unbranded'}</span>
            <StatusPill status={listing.status} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mb-6">{listing.title}</h1>

          <div className="bg-[#F9F8F6] p-5 border border-[#E8E5DF] mb-8 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Exchange Valuation</span>
              <span className="font-serif text-3xl font-medium text-[#1A1A1A]">{listing.estimatedValue} PTS</span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Reference Value</span>
              <span className="text-base font-mono text-[#1A1A1A] font-bold">{formatEstimate(listing.estimatedValue, currency)}</span>
            </div>
          </div>

          <div className="space-y-3.5 py-5 border-y border-[#E8E5DF] text-sm mb-8">
            {[['Category', listing.category], ['Size', listing.size], ['Condition', listing.condition], ['Location', listing.city || 'Not shared']].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-[#908B82] uppercase tracking-wider text-xs">{k}</span>
                <span className="text-[#1A1A1A] font-medium">{v}</span>
              </div>
            ))}
          </div>

          {listing.description && (
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-widest text-[#908B82] mb-1.5 font-semibold">Editor's Notes</h4>
              <p className="text-sm text-[#4A4741] font-light leading-relaxed">{listing.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 border border-[#E8E5DF] mb-8 bg-[#FDFBF7]">
            <span className="w-11 h-11 rounded-full border border-[#E8E5DF] bg-[#F4F1EA] flex items-center justify-center text-sm font-semibold text-[#1A1A1A]">
              {owner?.name?.[0]?.toUpperCase() || '?'}
            </span>
            <div className="flex-1">
              <span className="text-sm font-serif font-medium">{owner?.name}</span>
              <p className="text-xs text-[#736E65] uppercase tracking-wider">{owner?.city || 'Location not shared'}</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {mine ? (
              <>
                <p className="text-xs text-[#908B82] font-light">This is your item. Manage it from My Wardrobe.</p>
                <div className="flex gap-3">
                  <Link to="/dashboard" className={`${cls.secondary} flex-1`}>My Wardrobe</Link>
                  {listing.status === 'AVAILABLE' && <button onClick={remove} disabled={busy} className={cls.danger}><Trash2 className="w-4 h-4" /></button>}
                </div>
              </>
            ) : listing.status !== 'AVAILABLE' ? (
              <p className="text-sm text-[#736E65]">This item is no longer available for swap.</p>
            ) : (
              <>
                <Link to={user ? `/swap/new?target=${listing.id}` : '/login'} className={`${cls.primary} w-full`}>
                  <RefreshCw className="w-4 h-4" /> Propose Wardrobe Swap
                </Link>
                {user && (
                  <Link to={`/swap/new?target=${listing.id}`} className={`${cls.secondary} w-full`}>
                    <MessageSquare className="w-4 h-4" /> Message Owner Directly
                  </Link>
                )}
              </>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-[#908B82] pt-4"><Award className="w-3.5 h-3.5 text-[#C5A880]" /> Agree on the details in chat before you meet up or ship anything.</p>
        </div>
      </div>
    </div>
  );
}
