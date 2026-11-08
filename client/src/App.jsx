import { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Activity, ArrowRightLeft, Globe, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { useInbox } from './inbox.jsx';
import { CurrencyPicker } from './currency.jsx';
import TradeInbox from './components/TradeInbox.jsx';
import Login from './pages/Login.jsx';
import Listings from './pages/Listings.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import SwapRequest from './pages/SwapRequest.jsx';
import Chat from './pages/Chat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Admin from './pages/Admin.jsx';
import NewListing from './pages/NewListing.jsx';
import ValueCalculator from './pages/ValueCalculator.jsx';

function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="text-sm text-[#908B82] py-24 text-center font-light">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

const navLink = (active) =>
  `transition-colors hover:text-[#1A1A1A] pb-1 whitespace-nowrap ${active ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`;

export default function App() {
  const { user, logout } = useAuth();
  const { pendingIncoming, setOpen } = useInbox();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const tab = location.pathname.startsWith('/dashboard')
    ? 'dashboard'
    : location.pathname.startsWith('/admin')
    ? 'admin'
    : location.pathname.startsWith('/estimate')
    ? 'estimate'
    : location.pathname.startsWith('/list')
    ? 'list'
    : 'browse';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans antialiased selection:bg-[#EAE4D9]">
      <div className="bg-[#1A1A1A] text-[#E8E5DF] text-[11px] sm:text-xs tracking-widest uppercase py-2.5 text-center px-4 font-mono">
        <span>Curated Circular Fashion Exchange &bull; Zero Currency &bull; Zero Waste</span>
      </div>

      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="cursor-pointer group flex items-center gap-3 shrink-0">
            <div 
              onClick={() => setCurrentTab('landing')} 
              className="cursor-pointer group flex items-center gap-3"
            >
              <div className="w-9 h-9 border border-[#1A1A1A] flex items-center justify-center font-serif text-base font-semibold tracking-tighter group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                CS
              </div>
              <span className="font-serif text-2xl tracking-tight font-medium uppercase">
                Closet<span className="font-light italic text-[#908B82]">Shuffle</span>
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs sm:text-sm uppercase tracking-wider font-medium text-[#4A4741]">
            <Link to="/" className={navLink(tab === 'browse')}>Explore Directory</Link>
            <Link to="/estimate" className={navLink(tab === 'estimate')}>Valuation Engine</Link>
            {user && <Link to="/list" className={navLink(tab === 'list')}>List an Item</Link>}
            {user && <Link to="/dashboard" className={navLink(tab === 'dashboard')}>My Wardrobe</Link>}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 border border-[#E8E5DF] bg-[#F4F1EA] px-3 py-2">
              <Globe className="w-4 h-4 text-[#736E65]" />
              <CurrencyPicker />
            </div>

            {user && (
              <button
                onClick={() => setOpen(true)}
                className="relative w-10 h-10 border border-[#E8E5DF] hover:border-[#1A1A1A] flex items-center justify-center transition-colors bg-white"
                title="Negotiations"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#1A1A1A]" />
                {pendingIncoming > 0 && <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-[#C5A880] rounded-full" />}
              </button>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className={`text-xs uppercase tracking-wider px-3.5 py-2 border transition-all hidden sm:flex items-center gap-2 ${tab === 'admin' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E5DF] hover:border-[#1A1A1A] text-[#4A4741]'}`}>
                <Activity className="w-4 h-4" /> <span className="hidden xl:inline">Curation Admin</span>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen((v) => !v)} className="w-10 h-10 border border-[#E8E5DF] rounded-full flex items-center justify-center hover:border-[#1A1A1A] transition-colors bg-white">
                  <span className="text-[11px] font-semibold text-[#1A1A1A]">{user.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E5DF] shadow-xl overflow-hidden animate-pop" onMouseLeave={() => setMenuOpen(false)}>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#4A4741] hover:bg-[#F4F1EA]">My Wardrobe</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#4A4741] hover:bg-[#F4F1EA]">Curation Admin</Link>}
                    <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#C0392B] hover:bg-[#F4F1EA] text-left">
                      <LogOut className="w-3.5 h-3.5" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2.5 bg-[#1A1A1A] text-[#FDFBF7] text-xs uppercase tracking-widest hover:bg-[#333] transition-colors font-medium">
                Log in
              </Link>
            )}
          </div>
        </div>

        {user && (
          <nav className="lg:hidden flex items-center gap-5 px-4 pb-2.5 overflow-x-auto no-scrollbar text-xs uppercase tracking-wider font-medium text-[#4A4741]">
            <Link to="/" className={navLink(tab === 'browse')}>Explore</Link>
            <Link to="/estimate" className={navLink(tab === 'estimate')}>Valuation</Link>
            <Link to="/list" className={navLink(tab === 'list')}>List</Link>
            <Link to="/dashboard" className={navLink(tab === 'dashboard')}>Wardrobe</Link>
            {user.role === 'admin' && <Link to="/admin" className={navLink(tab === 'admin')}>Admin</Link>}
          </nav>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Listings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/estimate" element={<ValueCalculator />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/list" element={<Protected><NewListing /></Protected>} />
          <Route path="/swap/new" element={<Protected><SwapRequest /></Protected>} />
          <Route path="/swaps/:id/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<div className="max-w-7xl mx-auto px-6 py-16"><p className="text-[#736E65]">Page not found. <Link to="/" className="text-[#1A1A1A] underline">Return to the directory</Link>.</p></div>} />
        </Routes>
      </main>

      {user && <TradeInbox />}

      {/* <footer className="bg-[#1A1A1A] text-[#FDFBF7] pt-16 pb-10 border-t border-[#333]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#908B82]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[#FDFBF7] flex items-center justify-center font-serif text-xs font-semibold">CS</div>
            <span className="font-serif uppercase tracking-tight text-[#E8E5DF]">ClosetShuffle</span>
          </div>
          <p>© 2026 ClosetShuffle. A circular fashion exchange — no money changes hands on the platform.</p>
        </div>
      </footer> */}
      <footer className="bg-[#1A1A1A] text-[#FDFBF7] pt-20 pb-12 border-t border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-[#333333]">
          
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[#FDFBF7] flex items-center justify-center font-serif text-sm font-semibold">
                CS
              </div>
              <span className="font-serif text-xl uppercase tracking-tight">ClosetShuffle</span>
            </div>
            <p className="text-xs sm:text-sm text-[#B8B2A6] leading-relaxed font-light">
              The elevated destination for luxury circular fashion. Refresh your wardrobe through verified high-end garment exchanges worldwide.
            </p>
          </div>

          <div>
            <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Curated Directory</h5>
            <ul className="space-y-3 text-xs sm:text-sm text-[#E8E5DF] font-light">
              <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Outerwear & Coats</button></li>
              <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Tailoring & Suitings</button></li>
              <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Designer Handbags</button></li>
              <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Fine Knitwear</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Platform Intelligence</h5>
            <ul className="space-y-3 text-xs sm:text-sm text-[#E8E5DF] font-light">
              <li><button onClick={() => setCurrentTab('valueCalc')} className="hover:underline">Valuation Engine</button></li>
              <li><button onClick={() => setCurrentTab('admin')} className="hover:underline">Authenticity Protocol</button></li>
              <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Fair Swap Algorithm</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Private Membership</h5>
            <p className="text-xs sm:text-sm text-[#B8B2A6] mb-4 font-light">Receive private invitations to high-value wardrobe releases.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="bg-[#262626] border border-[#333] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A880] w-full"
              />
              <button className="bg-[#FDFBF7] text-[#1A1A1A] px-4 py-2.5 text-xs sm:text-sm uppercase tracking-wider font-medium">Join</button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#908B82]">
          <p>© 2026 ClosetShuffle Inc. All rights reserved. Editorial imagery inspired by global fashion journalism.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#FDFBF7]">Privacy Policy</a>
            <a href="#" className="hover:text-[#FDFBF7]">Terms of Curation</a>
            <a href="#" className="hover:text-[#FDFBF7]">Security Verification</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
