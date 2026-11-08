import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { useInbox } from '../inbox.jsx';
import { ItemImage, StatusPill, timeAgo } from '../ui.jsx';

// Slide-over drawer listing the user's swap requests, sent and received ("Negotiations").
export default function TradeInbox() {
  const { user } = useAuth();
  const { swaps, open, setOpen } = useInbox();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex justify-end" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md bg-[#FDFBF7] border-l border-[#E8E5DF] h-full p-6 flex flex-col animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-[#E8E5DF] pb-4 shrink-0">
          <h3 className="font-serif text-xl uppercase tracking-tight">Negotiations</h3>
          <button onClick={() => setOpen(false)} className="text-[#908B82] hover:text-[#1A1A1A]" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3 mt-4 overflow-y-auto flex-1">
          {swaps.length === 0 ? (
            <p className="text-xs text-[#908B82] text-center py-10 font-light">No swap requests yet. Propose one from any item's page.</p>
          ) : (
            swaps.map((s) => {
              const incoming = s.targetOwnerId === user?.id;
              return (
                <Link key={s.id} to={`/swaps/${s.id}/chat`} onClick={() => setOpen(false)} className="block bg-white border border-[#E8E5DF] hover:border-[#1A1A1A] transition p-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[#908B82] uppercase tracking-wider">
                    <span>{incoming ? 'Request to you' : 'You proposed'}</span>
                    <span>{timeAgo(s.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 overflow-hidden bg-[#F4F1EA] shrink-0"><ItemImage item={s.targetListing} /></div>
                    <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <div className="w-10 h-10 overflow-hidden bg-[#F4F1EA] shrink-0"><ItemImage item={s.offeredListing} /></div>
                    <p className="text-xs text-[#4A4741] truncate flex-1 pl-1">{s.offeredListing?.title} ↔ {s.targetListing?.title}</p>
                  </div>
                  <StatusPill status={s.status} />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
