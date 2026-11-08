import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Plus, Shirt } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useInbox } from '../inbox.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { EmptyState, ErrorNote, ItemImage, Loading, StatusPill, cls, timeAgo } from '../ui.jsx';

const TABS = [
  { key: 'closet', label: 'My Pieces' },
  { key: 'incoming', label: 'Incoming' },
  { key: 'sent', label: 'Sent' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { swaps, refresh } = useInbox();
  const [tab, setTab] = useState('closet');
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/users/profile')
      .then((d) => { setListings(d.listings); setStatus('ready'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
    refresh();
  }, []);

  const incoming = swaps.filter((s) => s.targetOwnerId === user.id);
  const sent = swaps.filter((s) => s.requesterId === user.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white border border-[#E8E5DF] p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <span className="w-14 h-14 rounded-full border border-[#E8E5DF] bg-[#F4F1EA] flex items-center justify-center text-lg font-semibold text-[#1A1A1A]">
            {user.name?.[0]?.toUpperCase() || '?'}
          </span>
          <div>
            <h1 className="font-serif text-2xl uppercase tracking-tight">{user.name}</h1>
            <p className="text-xs text-[#736E65] mt-1 flex items-center gap-1.5 uppercase tracking-wider">
              {user.city ? <><MapPin className="w-3.5 h-3.5" /> {user.city}</> : 'Location not shared'}
            </p>
          </div>
        </div>
        <Link to="/list" className={cls.primary}><Plus className="w-4 h-4" /> List a New Piece</Link>
      </div>

      <div className="flex items-center gap-8 text-xs sm:text-sm uppercase tracking-wider font-medium text-[#4A4741] border-b border-[#E8E5DF]">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`pb-3 transition-colors hover:text-[#1A1A1A] ${tab === t.key ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}>
            {t.label}
            {t.key === 'incoming' && incoming.filter((s) => s.status === 'PENDING').length > 0 && (
              <span className="ml-1.5 text-[#C5A880]">({incoming.filter((s) => s.status === 'PENDING').length})</span>
            )}
          </button>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {tab === 'closet' && (
        status === 'loading' ? <Loading /> :
        listings.length === 0 ? (
          <EmptyState title="You haven't listed anything yet." action="List your first piece" actionTo="/list" icon={Shirt} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map((i) => <ItemCard key={i.id} item={i} />)}
          </div>
        )
      )}

      {tab === 'incoming' && (
        incoming.length === 0 ? <EmptyState title="No one has proposed a swap for your pieces yet." /> : <div className="space-y-3">{incoming.map((s) => <SwapRow key={s.id} swap={s} />)}</div>
      )}

      {tab === 'sent' && (
        sent.length === 0 ? <EmptyState title="You haven't proposed any swaps yet." action="Browse the directory" actionTo="/" /> : <div className="space-y-3">{sent.map((s) => <SwapRow key={s.id} swap={s} />)}</div>
      )}
    </div>
  );
}

function SwapRow({ swap }) {
  return (
    <Link to={`/swaps/${swap.id}/chat`} className="flex items-center gap-4 bg-white border border-[#E8E5DF] hover:border-[#1A1A1A] p-4 transition">
      <div className="w-14 h-14 overflow-hidden bg-[#F4F1EA] border border-[#E8E5DF] shrink-0"><ItemImage item={swap.targetListing} /></div>
      <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0" />
      <div className="w-14 h-14 overflow-hidden bg-[#F4F1EA] border border-[#E8E5DF] shrink-0"><ItemImage item={swap.offeredListing} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1A1A] truncate">{swap.offeredListing?.title} ↔ {swap.targetListing?.title}</p>
        <p className="text-xs text-[#908B82]">{timeAgo(swap.createdAt)}</p>
      </div>
      <StatusPill status={swap.status} />
    </Link>
  );
}
