import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Ban, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import { ErrorNote, Loading, StatusPill, cls } from '../ui.jsx';

const TABS = ['stats', 'users', 'listings', 'swaps'];

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [error, setError] = useState('');

  const loaders = {
    stats: () => api('/api/admin/stats').then(setStats),
    users: () => api('/api/admin/users').then((d) => setUsers(d.users)),
    listings: () => api('/api/admin/listings').then((d) => setListings(d.items)),
    swaps: () => api('/api/admin/swaps').then((d) => setSwaps(d.swaps)),
  };

  useEffect(() => { loaders[tab]?.().catch((e) => setError(e.message)); }, [tab]);

  async function toggleBan(u) {
    try { await api(`/api/admin/users/${u.id}/ban`, { method: 'PATCH', body: { banned: !u.banned } }); toast(u.banned ? 'User unbanned' : 'User banned'); loaders.users(); }
    catch (e) { toast(e.message, 'error'); }
  }
  async function deleteListing(id) {
    if (!confirm('Remove this listing?')) return;
    try { await api(`/api/admin/listings/${id}`, { method: 'DELETE' }); toast('Listing removed'); loaders.listings(); }
    catch (e) { toast(e.message, 'error'); }
  }
  async function resolveSwap(id, status) {
    try { await api(`/api/admin/swaps/${id}/status`, { method: 'PATCH', body: { status } }); toast(`Swap ${status.toLowerCase()}`); loaders.swaps(); }
    catch (e) { toast(e.message, 'error'); }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center gap-3 bg-[#1A1A1A] text-[#FDFBF7] p-8">
        <Activity className="w-6 h-6 text-[#C5A880]" />
        <div>
          <h1 className="font-serif text-2xl uppercase tracking-tight">Curation Admin</h1>
          <p className="text-xs text-[#B8B2A6] mt-1">Platform activity, members, listings and disputes.</p>
        </div>
      </div>

      <div className="flex items-center gap-8 text-xs sm:text-sm uppercase tracking-wider font-medium text-[#4A4741] border-b border-[#E8E5DF]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 capitalize transition-colors hover:text-[#1A1A1A] ${tab === t ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}>{t}</button>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {tab === 'stats' && (
        stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Members', stats.users], ['Listings', stats.listings], ['Available now', stats.availableListings],
              ['Messages sent', stats.messages], ['Active last 30d', stats.activeUsers30d],
              ['Completed swaps', stats.completedSwaps], ['Swap conversion', `${stats.swapConversionRate}%`],
              ['Total requests', stats.totalSwaps],
            ].map(([label, val]) => (
              <div key={label} className="bg-white border border-[#E8E5DF] p-5">
                <div className="font-serif text-2xl text-[#1A1A1A]">{val}</div>
                <div className="text-[11px] mt-1 uppercase tracking-widest text-[#908B82]">{label}</div>
              </div>
            ))}
          </div>
        ) : <Loading />
      )}

      {tab === 'users' && (
        <div className="bg-white border border-[#E8E5DF] divide-y divide-[#E8E5DF]">
          {users.length === 0 && <Loading />}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="text-sm text-[#1A1A1A] truncate">{u.name} <span className="text-[#908B82]">· {u.email}</span></p>
                <p className="text-xs text-[#908B82] uppercase tracking-wider">{u.city || 'No location set'} {u.role === 'admin' && '· Admin'}</p>
              </div>
              <button onClick={() => toggleBan(u)} className={u.banned ? cls.secondary : cls.danger}><Ban className="w-3.5 h-3.5" /> {u.banned ? 'Unban' : 'Ban'}</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'listings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.length === 0 && <Loading />}
          {listings.map((l) => (
            <div key={l.id} className="bg-white border border-[#E8E5DF] p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-[#1A1A1A] truncate">{l.title}</p>
                <StatusPill status={l.status} />
              </div>
              <p className="text-xs text-[#908B82]">{l.brand} · {l.estimatedValue} PTS</p>
              <button onClick={() => deleteListing(l.id)} className={`${cls.danger} w-full`}><Trash2 className="w-3.5 h-3.5" /> Remove</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'swaps' && (
        <div className="space-y-3">
          {swaps.length === 0 && <Loading />}
          {swaps.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-white border border-[#E8E5DF] p-4">
              <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1A1A] truncate">{s.offeredListing?.title} ↔ {s.targetListing?.title}</p>
                <p className="text-xs text-[#908B82]">{s.requester?.name} → {s.targetOwner?.name}</p>
              </div>
              <StatusPill status={s.status} />
              {(s.status === 'PENDING' || s.status === 'ACCEPTED') && (
                <div className="flex gap-2">
                  <button onClick={() => resolveSwap(s.id, 'CANCELLED')} className={cls.secondary}>Cancel</button>
                  {s.status === 'ACCEPTED' && <button onClick={() => resolveSwap(s.id, 'COMPLETED')} className={cls.primary}>Complete</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
