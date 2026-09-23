import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/listings/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const { listing, owner } = data;
  const mine = user?.id === listing.userId;

  return (
    <article className="card">
      <h1>{listing.title}</h1>
      <p className="muted">{listing.brand} · Size {listing.size} · {listing.condition} · {listing.estimatedValue} pts</p>
      <p>{listing.description}</p>
      <p className="muted">Listed by {owner?.name}{owner?.city ? `, ${owner.city}` : ''}</p>
      {/* TODO: image gallery for listing.images; edit/delete buttons when `mine` (PUT/DELETE /api/listings/:id) */}
      {listing.status !== 'AVAILABLE'
        ? <p>This item is no longer available.</p>
        : mine
          ? <p className="muted">This is your item.</p>
          : <Link className="primary btn" to={user ? `/swap/new?target=${listing.id}` : '/login'}>Propose a swap</Link>}
    </article>
  );
}
