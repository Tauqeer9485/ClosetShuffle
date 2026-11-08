import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { useCurrency } from '../currency.jsx';
import { useToast } from '../toast.jsx';
import { EmptyState, ErrorNote, ItemImage, Loading, ValueBalance, cls, formatEstimate } from '../ui.jsx';

export default function SwapRequest() {
  const [params] = useSearchParams();
  const targetId = params.get('target');
  const [currency] = useCurrency();
  const navigate = useNavigate();
  const toast = useToast();

  const [target, setTarget] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [offeredId, setOfferedId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!targetId) { setStatus('error'); setError('No item selected to swap for.'); return; }
    Promise.all([api(`/api/listings/${targetId}`), api('/api/users/profile')])
      .then(([t, me]) => {
        setTarget(t.listing);
        const available = me.listings.filter((l) => l.status === 'AVAILABLE');
        setMyItems(available);
        if (available[0]) setOfferedId(available[0].id);
        setStatus('ready');
      })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [targetId]);

  const offered = useMemo(() => myItems.find((i) => i.id === offeredId), [myItems, offeredId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { swap } = await api('/api/swaps/request', { method: 'POST', body: { offeredListingId: offeredId, targetListingId: targetId } });
      toast('Swap request sent');
      navigate(`/swaps/${swap.id}/chat`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <Loading label="Setting up your offer…" />;
  if (status === 'error') return <div className="max-w-2xl mx-auto px-6 py-16"><ErrorNote>{error}</ErrorNote></div>;
  if (myItems.length === 0) {
    return <div className="max-w-2xl mx-auto px-6 py-16"><EmptyState title="You need at least one available item in your wardrobe before you can propose a swap." action="List an item" actionTo="/list" icon={Sparkles} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <span className={cls.eyebrow}>Initiate Fashion Swap</span>
        <h1 className="font-serif text-3xl uppercase tracking-tight text-[#1A1A1A] mt-1">Propose Your Exchange</h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-[#E8E5DF] p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4 bg-[#F4F1EA] p-5 border border-[#E8E5DF] items-center">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#736E65]">Target Piece</span>
            <div className="w-28 h-36 mx-auto my-3 border border-[#E8E5DF] overflow-hidden"><ItemImage item={target} /></div>
            <p className="text-sm font-serif font-medium line-clamp-1">{target.title}</p>
            <p className="text-sm font-mono text-[#1A1A1A] font-semibold mt-1">{target.estimatedValue} PTS <span className="text-xs font-normal text-[#908B82]">({formatEstimate(target.estimatedValue, currency)})</span></p>
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#736E65]">Your Offering</span>
            {offered && <div className="w-28 h-36 mx-auto my-3 border border-[#E8E5DF] overflow-hidden"><ItemImage item={offered} /></div>}
            <select value={offeredId} onChange={(e) => setOfferedId(e.target.value)} className="w-full bg-white border border-[#E8E5DF] text-xs text-[#1A1A1A] p-1.5 focus:outline-none mt-1">
              {myItems.map((i) => <option key={i.id} value={i.id}>{i.title} ({i.estimatedValue} PTS)</option>)}
            </select>
          </div>
        </div>

        {offered && <ValueBalance give={offered.estimatedValue} get={target.estimatedValue} />}

        {error && <ErrorNote>{error}</ErrorNote>}

        <button className={`${cls.primary} w-full`} disabled={busy}>
          {busy ? 'Sending…' : <>Send Exchange Proposal <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-[11px] text-[#908B82] font-light">
          The other member will see this in Negotiations and can accept, decline, or chat first. <Link to={`/items/${targetId}`} className="text-[#1A1A1A] underline">Back to item</Link>
        </p>
      </form>
    </div>
  );
}
