import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useCurrency } from '../currency.jsx';
import { useToast } from '../toast.jsx';
import { CATEGORIES, CONDITIONS, cls, formatEstimate } from '../ui.jsx';

const EMPTY = { title: '', description: '', category: CATEGORIES[0], brand: '', size: '', condition: CONDITIONS[0] };

export default function NewListing() {
  const { user } = useAuth();
  const [currency] = useCurrency();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!form.category || !form.condition) return;
    const t = setTimeout(() => {
      api('/api/listings/calculate-value', { method: 'POST', body: { category: form.category, brand: form.brand, condition: form.condition } })
        .then((d) => setPreview(d.estimatedValue))
        .catch(() => setPreview(null));
    }, 300);
    return () => clearTimeout(t);
  }, [form.category, form.brand, form.condition]);

  function onFiles(e) {
    const picked = Array.from(e.target.files || []).slice(0, 5);
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (files.length === 0) return setError('Add at least one photo of the item.');
    setBusy(true);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(form)) fd.append(k, v);
      if (user?.city) fd.append('city', user.city);
      files.forEach((f) => fd.append('images', f));
      const { listing } = await api('/api/listings', { method: 'POST', form: fd });
      toast('Listing published');
      navigate(`/items/${listing.id}`);
    } catch (err) {
      setError(err.details?.[0] ? `${err.details[0].field}: ${err.details[0].message}` : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className={cls.eyebrow}>Add To The Directory</span>
        <h1 className="font-serif text-3xl uppercase tracking-tight text-[#1A1A1A] mt-1">List a Piece</h1>
        <p className="text-sm text-[#736E65] mt-2 font-light">Clear photos and honest condition notes get better swap offers.</p>
      </div>

      <form onSubmit={submit} className="bg-white border border-[#E8E5DF] p-8 space-y-6 shadow-sm">
        <div>
          <label className={cls.label}>Photos (up to 5)</label>
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-2">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden bg-[#F4F1EA] border border-[#E8E5DF]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#B8B2A6] py-8 cursor-pointer hover:border-[#1A1A1A] transition">
            <Camera className="w-7 h-7 text-[#C5A880]" />
            <span className="text-xs text-[#736E65]">{files.length ? `${files.length} photo(s) selected — click to change` : 'Click to choose photos'}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={onFiles} />
          </label>
        </div>

        <div>
          <label className={cls.label}>Title</label>
          <input className={cls.input} value={form.title} onChange={set('title')} required minLength={3} placeholder="Double-Breasted Wool Trench Coat" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={cls.label}>Category</label><select className={cls.input} value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className={cls.label}>Condition</label><select className={cls.input} value={form.condition} onChange={set('condition')}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={cls.label}>Brand</label><input className={cls.input} value={form.brand} onChange={set('brand')} placeholder="Nike, H&M, Zara…" /></div>
          <div><label className={cls.label}>Size</label><input className={cls.input} value={form.size} onChange={set('size')} required placeholder="M, 32, UK 8…" /></div>
        </div>

        <div>
          <label className={cls.label}>Description</label>
          <textarea className={`${cls.input} min-h-24`} value={form.description} onChange={set('description')} placeholder="Fit, wear, any flaws worth mentioning…" />
        </div>

        {preview != null && (
          <div className="bg-[#F4F1EA] border border-[#E8E5DF] p-4 flex items-center justify-between text-sm">
            <span className="text-[#4A4741] uppercase tracking-wider text-xs">Estimated swap value</span>
            <span className="font-serif font-bold text-[#1A1A1A]">{preview} PTS <span className="text-xs font-mono text-[#908B82]">({formatEstimate(preview, currency)})</span></span>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-[#C0392B] bg-white border border-[#C0392B]/30 px-4 py-3">{error}</p>}

        <button className={`${cls.primary} w-full`} disabled={busy}>{busy ? 'Publishing…' : 'Publish Listing'}</button>
      </form>
    </div>
  );
}
