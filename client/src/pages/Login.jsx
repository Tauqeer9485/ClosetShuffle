import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { cls, ErrorNote, locate } from '../ui.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        let coords = {};
        try { coords = await locate(); } catch { /* optional */ }
        await register({ name: form.name, email: form.email, password: form.password, city: form.city || undefined, ...coords });
      }
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.details?.[0] ? `${err.details[0].field}: ${err.details[0].message}` : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <span className={cls.eyebrow}>Members Only</span>
        <h1 className="font-serif text-3xl uppercase tracking-tight text-[#1A1A1A] mt-1">
          {mode === 'login' ? 'Welcome Back' : 'Join The Circle'}
        </h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-[#E8E5DF] p-8 space-y-5 shadow-sm">
        {mode === 'register' && (
          <div>
            <label className={cls.label}>Name</label>
            <input className={cls.input} value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
          </div>
        )}
        <div>
          <label className={cls.label}>Email</label>
          <input type="email" className={cls.input} value={form.email} onChange={set('email')} required autoComplete="email" />
        </div>
        <div>
          <label className={cls.label}>Password</label>
          <input
            type="password"
            className={cls.input}
            value={form.password}
            onChange={set('password')}
            required
            minLength={mode === 'register' ? 8 : 1}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>
        {mode === 'register' && (
          <div>
            <label className={cls.label}>City or area</label>
            <input className={cls.input} value={form.city} onChange={set('city')} placeholder="Paris, France" />
            <p className="text-[11px] text-[#908B82] mt-1.5 font-light">We'll also ask for your location so nearby pieces show up first.</p>
          </div>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
        <button className={`${cls.primary} w-full`} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full text-center text-xs uppercase tracking-widest text-[#736E65] hover:text-[#1A1A1A] underline underline-offset-4"
        >
          {mode === 'login' ? "New here? Create an account" : 'Already a member? Log in'}
        </button>
      </form>
    </div>
  );
}
