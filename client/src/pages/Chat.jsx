import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Send, X } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useInbox } from '../inbox.jsx';
import { connectChat } from '../realtime.js';
import { useToast } from '../toast.jsx';
import { ErrorNote, ItemImage, Loading, StatusPill, ValueBalance, cls, timeAgo } from '../ui.jsx';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { refresh } = useInbox();

  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const load = () =>
    Promise.all([api(`/api/swaps/${id}`), api(`/api/swaps/${id}/messages`)])
      .then(([s, m]) => { setSwap(s.swap); setMessages(m.messages); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const socket = connectChat();
    socketRef.current = socket;
    let pollTimer;

    socket.on('connect', () => {
      setLive(true);
      clearInterval(pollTimer);
      socket.emit('swap:join', id, (ack) => { if (!ack?.ok) setError(ack?.error || 'Could not join this chat'); });
    });
    socket.on('message:new', (m) => setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])));
    socket.on('swap:updated', ({ status }) => setSwap((prev) => (prev ? { ...prev, status } : prev)));
    socket.on('connect_error', () => {
      setLive(false);
      clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        api(`/api/swaps/${id}/messages`).then((d) =>
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = d.messages.filter((m) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          }),
        );
      }, 4000);
    });

    return () => { socket.close(); clearInterval(pollTimer); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('message:send', { swapId: id, content }, (ack) => { if (!ack?.ok) toast(ack?.error || 'Message failed to send', 'error'); });
    } else {
      try {
        const { message } = await api(`/api/swaps/${id}/messages`, { method: 'POST', body: { content } });
        setMessages((prev) => [...prev, message]);
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  }

  async function setStatus(newStatus) {
    setBusy(true);
    try {
      const { swap: updated } = await api(`/api/swaps/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      setSwap(updated);
      refresh();
      toast(`Swap ${updated.status.toLowerCase()}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16"><ErrorNote>{error}</ErrorNote></div>;
  if (!swap) return <Loading label="Loading negotiation…" />;

  const isTargetOwner = swap.targetOwnerId === user.id;
  const isRequester = swap.requesterId === user.id;
  const chatOpen = ['PENDING', 'ACCEPTED'].includes(swap.status);
  const other = isRequester ? swap.targetOwner : swap.requester;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-4">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#736E65] hover:text-[#1A1A1A]"><ArrowLeft className="w-3.5 h-3.5" /> My Wardrobe</Link>

      <div className="bg-white border border-[#E8E5DF] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 overflow-hidden bg-[#F4F1EA] border border-[#E8E5DF] shrink-0"><ItemImage item={swap.targetListing} /></div>
            <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0" />
            <div className="w-12 h-12 overflow-hidden bg-[#F4F1EA] border border-[#E8E5DF] shrink-0"><ItemImage item={swap.offeredListing} /></div>
          </div>
          <StatusPill status={swap.status} />
        </div>
        <p className="text-xs text-[#736E65]">With <strong className="text-[#1A1A1A]">{other?.name}</strong> · {swap.offeredListing?.title} ↔ {swap.targetListing?.title}</p>
        {swap.valueComparison && <ValueBalance give={swap.valueComparison.offered} get={swap.valueComparison.target} />}

        {swap.status === 'PENDING' && isTargetOwner && (
          <div className="flex gap-3">
            <button onClick={() => setStatus('ACCEPTED')} disabled={busy} className={cls.primary}><Check className="w-4 h-4" /> Accept</button>
            <button onClick={() => setStatus('REJECTED')} disabled={busy} className={cls.danger}><X className="w-4 h-4" /> Decline</button>
          </div>
        )}
        {swap.status === 'PENDING' && isRequester && <button onClick={() => setStatus('CANCELLED')} disabled={busy} className={cls.secondary}>Cancel Request</button>}
        {swap.status === 'ACCEPTED' && (
          <div className="flex gap-3">
            <button onClick={() => setStatus('COMPLETED')} disabled={busy} className={cls.primary}><Check className="w-4 h-4" /> Mark Completed</button>
            <button onClick={() => setStatus('CANCELLED')} disabled={busy} className={cls.secondary}>Cancel Swap</button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E8E5DF] flex flex-col h-[28rem] shadow-sm">
        <div className="px-5 py-3 border-b border-[#E8E5DF] flex items-center justify-between text-[11px] uppercase tracking-wider text-[#908B82]">
          <span>Negotiation</span>
          <span className={live ? 'text-[#4A4741]' : 'text-[#B8B2A6]'}>{live ? '● Live' : 'Updating periodically'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-xs text-[#908B82] text-center py-8 font-light">Say hello and work out the details of your swap.</p>}
          {messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 text-sm ${mine ? 'bg-[#1A1A1A] text-white' : 'bg-[#F4F1EA] text-[#1A1A1A]'}`}>
                  <p>{m.content}</p>
                  <span className={`block text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-[#908B82]'}`}>{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="p-3 border-t border-[#E8E5DF] flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!chatOpen}
            placeholder={chatOpen ? 'Type a message…' : 'This negotiation is closed'}
            className="flex-1 bg-[#FDFBF7] border border-[#E8E5DF] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#B8B2A6] focus:outline-none focus:border-[#1A1A1A] disabled:opacity-50"
          />
          <button disabled={!chatOpen || !draft.trim()} className="px-4 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-40 text-white transition"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
