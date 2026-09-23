import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Search, SlidersHorizontal, ArrowUpDown, ChevronRight, 
  Heart, ShoppingBag, ArrowRight, Check, X, Shield, RefreshCw, 
  User, MessageSquare, Plus, Filter, MapPin, Award, Scale, 
  TrendingUp, Activity, CheckCircle, Clock, Send, Camera, Info, 
  Sliders, Star, Layers, Settings, LogOut, ChevronDown, CheckCircle2,
  Globe, Coins
} from 'lucide-react';

// Dynamic Currency Configurations with Symbols & Exchange Rates relative to USD (Base 1.0)
const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', code: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', code: 'GBP' },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)', code: 'INR' },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)', code: 'CAD' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD ($)', code: 'AUD' },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)', code: 'JPY' }
};

const MOCK_ITEMS = [
  {
    id: 'cs-001',
    title: 'Double-Breasted Wool Trench Coat',
    brand: 'Totême',
    category: 'Outerwear',
    size: 'M (FR 38)',
    condition: 'Pristine (Worn Once)',
    estimatedValueUSD: 890,
    swapValuePoints: 890,
    location: 'Paris, France (2.4 km)',
    owner: {
      name: 'Camille Laurent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      rating: 4.9,
      swapsCompleted: 28,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000',
    ],
    description: 'Iconic oversized silhouette tailored from heavy wool-blend. Sculptural shoulders, deep notch lapels, and detachable belt.',
    provenance: 'Purchased at Totême Rue Richelieu boutique, Fall 2023. Original garment bag included.'
  },
  {
    id: 'cs-002',
    title: 'Deconstructed Poplin Shirt',
    brand: 'Maison Margiela',
    category: 'Tops',
    size: 'S (IT 40)',
    condition: 'Excellent',
    estimatedValueUSD: 520,
    swapValuePoints: 520,
    location: 'London, UK (5.1 km)',
    owner: {
      name: 'Evelyn Vance',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      swapsCompleted: 42,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Crisp organic cotton poplin featuring four-stitches moniker on the rear collar. Asymmetrical hemline with high side slits.',
    provenance: 'Authenticated by ClosetShuffle Curator. Zero defects.'
  },
  {
    id: 'cs-003',
    title: 'Minimalist Leather Shoulder Bag',
    brand: 'Acne Studios',
    category: 'Bags',
    size: 'One Size',
    condition: 'Pristine',
    estimatedValueUSD: 780,
    swapValuePoints: 780,
    location: 'Milan, Italy (1.2 km)',
    owner: {
      name: 'Matteo Rossi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: 4.8,
      swapsCompleted: 15,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Smooth calfskin leather shoulder bag in warm almond tone. Minimal silver foil embossing and adjustable strap.',
    provenance: 'Acne Studios Flagship Store, Stockholm.'
  },
  {
    id: 'cs-004',
    title: 'Silk Wrap Midi Dress',
    brand: 'Reformation',
    category: 'Dresses',
    size: 'M (US 6)',
    condition: 'Very Good',
    estimatedValueUSD: 340,
    swapValuePoints: 340,
    location: 'New York, USA (8.9 km)',
    owner: {
      name: 'Sophia Chen',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
      rating: 4.9,
      swapsCompleted: 31,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Lightweight 100% silk charmeuse dress with V-neckline and subtle cap sleeves. Deep ivory tone.',
    provenance: 'Purchased 2023. Dry cleaned professionally.'
  },
  {
    id: 'cs-005',
    title: 'Structured Alpaca Knit Sweater',
    brand: 'Lemaire',
    category: 'Knitwear',
    size: 'L (FR 42)',
    condition: 'Pristine',
    estimatedValueUSD: 640,
    swapValuePoints: 640,
    location: 'Tokyo, Japan (3.0 km)',
    owner: {
      name: 'Kenji Sato',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      swapsCompleted: 54,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Heavy gauge alpaca-wool blend knit with raglan sleeves and rib-knit funnel neck.',
    provenance: 'Lemaire Marais Paris.'
  },
  {
    id: 'cs-006',
    title: 'Heritage Check Wool Blazer',
    brand: 'Burberry',
    category: 'Outerwear',
    size: 'S (UK 8)',
    condition: 'Excellent',
    estimatedValueUSD: 1100,
    swapValuePoints: 1100,
    location: 'London, UK (1.8 km)',
    owner: {
      name: 'Gemma Ward',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      rating: 4.9,
      swapsCompleted: 19,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Classic British tailoring in muted houndstooth wool with horn button closures and silk cupro lining.',
    provenance: 'Bond Street Boutique. Verified vintage heritage tier.'
  }
];

const USER_CLOSET = [
  {
    id: 'my-001',
    title: 'Cashmere Ribbed Cardigan',
    brand: 'Khaite',
    category: 'Knitwear',
    size: 'M',
    condition: 'Pristine',
    estimatedValueUSD: 820,
    swapValuePoints: 820,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'my-002',
    title: 'Pleated Trousers',
    brand: 'Studio Nicholson',
    category: 'Trousers',
    size: 'M',
    condition: 'Excellent',
    estimatedValueUSD: 460,
    swapValuePoints: 460,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [selectedItem, setSelectedItem] = useState(MOCK_ITEMS[0]);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [offerItem, setOfferItem] = useState(USER_CLOSET[0]);
  const [activeMessageThread, setActiveMessageThread] = useState(null);

  // Currency State Management
  const [currentCurrency, setCurrentCurrency] = useState('USD');

  // Helper function to format currency dynamically
  const formatCurrency = (usdAmount) => {
    const curr = CURRENCIES[currentCurrency];
    const converted = Math.round(usdAmount * curr.rate);
    return `${curr.symbol}${converted.toLocaleString()}`;
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Value Estimator Form State
  const [calcBrand, setCalcBrand] = useState('Totême');
  const [calcCategory, setCalcCategory] = useState('Outerwear');
  const [calcCondition, setCalcCondition] = useState('Pristine');
  const [calcRetailUSD, setCalcRetailUSD] = useState('950');
  const [estimatedResultUSD, setEstimatedResultUSD] = useState(850);

  const calculateValue = () => {
    const base = parseFloat(calcRetailUSD) || 500;
    let multiplier = 0.85;
    if (calcCondition === 'Pristine') multiplier = 0.90;
    if (calcCondition === 'Excellent') multiplier = 0.75;
    if (calcCondition === 'Very Good') multiplier = 0.60;
    
    if (['Maison Margiela', 'Totême', 'Burberry'].includes(calcBrand)) {
      multiplier += 0.05;
    }
    setEstimatedResultUSD(Math.round(base * multiplier));
  };

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchQuery, selectedCategory, selectedBrand]);

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSwap = (item) => {
    setSelectedItem(item);
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans antialiased selection:bg-[#EAE4D9]">
      
      {/* Editorial Top Announcement Bar */}
      <div className="bg-[#1A1A1A] text-[#E8E5DF] text-xs sm:text-sm tracking-widest uppercase py-2.5 text-center px-4 font-mono">
        <span>Curated Circular Fashion Exchange &bull; Guaranteed Authenticity &bull; Zero Waste Luxury</span>
      </div>

      {/* Main Luxury Header Navigation with Dynamic Currency Picker */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-6 h-22 flex items-center justify-between">
          
          {/* Brand Logo */}
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

          {/* Central Nav Links */}
          <nav className="hidden lg:flex items-center gap-9 text-xs sm:text-sm uppercase tracking-wider font-medium text-[#4A4741]">
            <button 
              onClick={() => setCurrentTab('explore')} 
              className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'explore' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
            >
              Explore Directory
            </button>
            <button 
              onClick={() => setCurrentTab('valueCalc')} 
              className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'valueCalc' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
            >
              Valuation Engine
            </button>
            <button 
              onClick={() => setCurrentTab('myCloset')} 
              className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'myCloset' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
            >
              My Wardrobe
            </button>
            <button 
              onClick={() => setCurrentTab('messages')} 
              className={`transition-colors hover:text-[#1A1A1A] pb-1 relative ${currentTab === 'messages' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
            >
              Negotiations
              <span className="absolute -top-1 -right-3 w-2 h-2 bg-[#C5A880] rounded-full"></span>
            </button>
          </nav>

          {/* Right Header Controls: Currency Dropdown & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Dynamic Currency Selector */}
            <div className="flex items-center gap-1.5 border border-[#E8E5DF] bg-[#F4F1EA] px-3 py-2 rounded-none hover:border-[#1A1A1A] transition-colors">
              <Globe className="w-4 h-4 text-[#736E65]" />
              <select 
                value={currentCurrency}
                onChange={(e) => setCurrentCurrency(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-mono font-medium text-[#1A1A1A] focus:outline-none cursor-pointer pr-1"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code}>
                    {CURRENCIES[code].label}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setCurrentTab('admin')} 
              className={`text-xs sm:text-sm uppercase tracking-wider px-3.5 py-2 border border-[#E8E5DF] hover:border-[#1A1A1A] transition-all flex items-center gap-2 ${currentTab === 'admin' ? 'bg-[#1A1A1A] text-white' : 'text-[#4A4741]'}`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden xl:inline">Curation Admin</span>
            </button>

            <button 
              onClick={() => setCurrentTab('myCloset')}
              className="w-10 h-10 border border-[#E8E5DF] rounded-full flex items-center justify-center hover:border-[#1A1A1A] transition-colors bg-white"
            >
              <User className="w-4 h-4 text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic View Router */}
      <main>
        {currentTab === 'landing' && (
          <LandingPage 
            onExplore={() => setCurrentTab('explore')} 
            onValuate={() => setCurrentTab('valueCalc')}
            onSelectItem={handleOpenDetail}
            formatCurrency={formatCurrency}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreDirectory 
            items={filteredItems} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSelectItem={handleOpenDetail}
            onSwap={handleStartSwap}
            formatCurrency={formatCurrency}
          />
        )}

        {currentTab === 'detail' && selectedItem && (
          <ItemDetailPage 
            item={selectedItem} 
            onBack={() => setCurrentTab('explore')}
            onSwap={() => handleStartSwap(selectedItem)}
            onContact={() => {
              setActiveMessageThread(selectedItem);
              setCurrentTab('messages');
            }}
            formatCurrency={formatCurrency}
          />
        )}

        {currentTab === 'valueCalc' && (
          <ValueCalculatorPage 
            calcBrand={calcBrand}
            setCalcBrand={setCalcBrand}
            calcCategory={calcCategory}
            setCalcCategory={setCalcCategory}
            calcCondition={calcCondition}
            setCalcCondition={setCalcCondition}
            calcRetailUSD={calcRetailUSD}
            setCalcRetailUSD={setCalcRetailUSD}
            estimatedResultUSD={estimatedResultUSD}
            calculateValue={calculateValue}
            onListNow={() => setCurrentTab('myCloset')}
            formatCurrency={formatCurrency}
            currentCurrency={currentCurrency}
          />
        )}

        {currentTab === 'myCloset' && (
          <MyClosetDashboard 
            closet={USER_CLOSET} 
            onNavigateExplore={() => setCurrentTab('explore')}
            formatCurrency={formatCurrency}
          />
        )}

        {currentTab === 'messages' && (
          <MessagesPage 
            initialThread={activeMessageThread} 
            formatCurrency={formatCurrency}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard 
            formatCurrency={formatCurrency}
          />
        )}
      </main>

      {/* Interactive Swap Offer Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] max-w-2xl w-full border border-[#E8E5DF] p-8 shadow-2xl relative animate-in fade-in duration-200">
            
            <button 
              onClick={() => setSwapModalOpen(false)}
              className="absolute top-6 right-6 text-[#908B82] hover:text-[#1A1A1A]"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight mb-2">Initiate Fashion Swap</h3>
            <p className="text-sm text-[#736E65] uppercase tracking-wider mb-6">
              Select an item from your wardrobe to offer in exchange for <span className="font-medium text-[#1A1A1A]">{selectedItem.title}</span>.
            </p>

            {/* Comparison Grid with Dynamic Currency */}
            <div className="grid grid-cols-2 gap-4 bg-[#F4F1EA] p-5 border border-[#E8E5DF] mb-6">
              
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-[#736E65]">Target Piece</span>
                <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-28 h-36 object-cover mx-auto my-3 border border-[#E8E5DF]" />
                <p className="text-sm font-serif font-medium">{selectedItem.title}</p>
                <p className="text-sm font-mono text-[#1A1A1A] font-semibold mt-1">
                  {selectedItem.swapValuePoints} PTS <span className="text-xs font-normal text-[#908B82]">({formatCurrency(selectedItem.estimatedValueUSD)})</span>
                </p>
              </div>

              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-[#736E65]">Your Offering</span>
                {offerItem ? (
                  <>
                    <img src={offerItem.image} alt={offerItem.title} className="w-28 h-36 object-cover mx-auto my-3 border border-[#E8E5DF]" />
                    <p className="text-sm font-serif font-medium">{offerItem.title}</p>
                    <p className="text-sm font-mono text-[#1A1A1A] font-semibold mt-1">
                      {offerItem.swapValuePoints} PTS <span className="text-xs font-normal text-[#908B82]">({formatCurrency(offerItem.estimatedValueUSD)})</span>
                    </p>
                  </>
                ) : (
                  <div className="w-28 h-36 border border-dashed border-[#B8B2A6] mx-auto my-3 flex items-center justify-center text-xs text-[#908B82]">
                    Select Below
                  </div>
                )}
              </div>
            </div>

            {/* Fairness Score Indicator */}
            {offerItem && (
              <div className="mb-6 p-4 bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#C5A880]" />
                  <span>Fairness Rating: <strong className="font-mono text-[#1A1A1A]">98.2% Balanced Match</strong></span>
                </div>
                <span className="text-[#908B82] font-mono text-xs">Delta: {formatCurrency(Math.abs(selectedItem.estimatedValueUSD - offerItem.estimatedValueUSD))}</span>
              </div>
            )}

            {/* Item Selection List */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-wider text-[#736E65] block mb-2 font-medium">Choose from your closet:</label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {USER_CLOSET.map((cItem) => (
                  <div 
                    key={cItem.id}
                    onClick={() => setOfferItem(cItem)}
                    className={`p-3 border cursor-pointer flex items-center gap-3 transition-all ${
                      offerItem?.id === cItem.id 
                        ? 'border-[#1A1A1A] bg-white' 
                        : 'border-[#E8E5DF] bg-[#FDFBF7] hover:border-[#908B82]'
                    }`}
                  >
                    <img src={cItem.image} className="w-12 h-14 object-cover" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium line-clamp-1">{cItem.title}</p>
                      <p className="text-xs font-mono text-[#736E65]">{formatCurrency(cItem.estimatedValueUSD)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E5DF]">
              <button 
                onClick={() => setSwapModalOpen(false)}
                className="px-5 py-3 text-xs sm:text-sm uppercase tracking-wider text-[#736E65] hover:text-[#1A1A1A]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setSwapModalOpen(false);
                  setActiveMessageThread(selectedItem);
                  setCurrentTab('messages');
                }}
                className="px-7 py-3 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors flex items-center gap-2"
              >
                <span>Send Exchange Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer Component */}
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

function LandingPage({ onExplore, onValuate, onSelectItem, formatCurrency }) {
  return (
    <div>
      {/* Editorial Hero Banner */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#F4F1EA] border-b border-[#E8E5DF]">
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-multiply pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Editorial Fashion Background" 
            className="w-full h-full object-cover object-top filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-[#FDFBF7]/80"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-24">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 backdrop-blur border border-[#E8E5DF] text-xs sm:text-sm uppercase tracking-widest text-[#736E65] mb-8 font-medium">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Redefining The Art Of Wardrobe Exchange</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal text-[#1A1A1A] tracking-tight leading-[1.08] mb-8 uppercase">
            Curated Luxury. <br />
            <span className="font-light italic text-[#736E65]">Zero Currency.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#4A4741] font-light leading-relaxed tracking-wide mb-12">
            Trade archival designer pieces and contemporary garments with discerning collectors worldwide. 
            An authenticated circular ecosystem powered by precision value matching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto px-9 py-4 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-all duration-200 shadow-sm flex items-center justify-center gap-3 font-medium"
            >
              <span>Explore The Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onValuate}
              className="w-full sm:w-auto px-9 py-4 bg-white border border-[#E8E5DF] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:border-[#1A1A1A] transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <span>Estimate Garment Value</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-8 border-t border-[#E8E5DF]/80 text-center">
            <div>
              <p className="font-serif text-3xl text-[#1A1A1A]">100%</p>
              <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Authenticated</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#1A1A1A]">4.8K+</p>
              <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Archival Pieces</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#1A1A1A]">{formatCurrency(0)}</p>
              <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Garment Cash Waste</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Directory Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Current Curation</span>
            <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mt-1">Featured Garments</h2>
          </div>
          <button 
            onClick={onExplore}
            className="text-xs sm:text-sm uppercase tracking-widest text-[#1A1A1A] hover:text-[#736E65] flex items-center gap-1 mt-4 md:mt-0 font-medium"
          >
            <span>View All Listings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_ITEMS.slice(0, 3).map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onSelect={() => onSelectItem(item)} 
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

      </section>

      {/* Editorial Feature Section */}
      <section className="bg-[#F4F1EA] border-y border-[#E8E5DF] py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000" 
              alt="Editorial Tailoring" 
              className="w-full h-[580px] object-cover border border-[#E8E5DF]"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-7 border border-[#E8E5DF] hidden sm:block max-w-sm">
              <p className="font-serif text-xl italic text-[#1A1A1A]">"Fashion shouldn't end in landfills. It should evolve through wardrobes."</p>
              <p className="text-xs uppercase tracking-widest text-[#908B82] mt-4 font-semibold">— Editorial Journal</p>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">The Exchange Standard</span>
            <h3 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-2 mb-8 leading-tight">
              A Museum-Grade Platform For Wardrobe Mobility
            </h3>
            
            <div className="space-y-8 font-light text-base text-[#4A4741]">
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">01</div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Precision Item Valuation</h4>
                  <p className="leading-relaxed text-sm">Our proprietary algorithm assesses designer tier, fabrication quality, condition grade, and historical resale indices to establish exact swap points.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">02</div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Curated Authenticity Check</h4>
                  <p className="leading-relaxed text-sm">Every high-tier piece undergoes provenance verification and photographic inspection by our luxury fashion archivists.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">03</div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Direct Peer Negotiation</h4>
                  <p className="leading-relaxed text-sm">Connect directly with like-minded collectors to negotiate fair exchanges, additional point balances, or local concierge drop-offs.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

function ExploreDirectory({ 
  items, searchQuery, setSearchQuery, selectedCategory, 
  setSelectedCategory, selectedBrand, setSelectedBrand, 
  sortBy, setSortBy, onSelectItem, onSwap, formatCurrency 
}) {
  const categories = ['All', 'Outerwear', 'Tops', 'Bags', 'Dresses', 'Knitwear'];
  const brands = ['All', 'Totême', 'Maison Margiela', 'Acne Studios', 'Reformation', 'Lemaire', 'Burberry'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">The Collection</span>
        <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-1">Explore Directory</h1>
        <p className="text-sm text-[#736E65] mt-2 font-light">Browse authenticated pre-owned luxury garments available for instant trade.</p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white border border-[#E8E5DF] p-5 mb-10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908B82]" />
            <input 
              type="text" 
              placeholder="Search designer, keyword, or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
              <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Category:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
              <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Brand:</span>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
              <ArrowUpDown className="w-4 h-4 text-[#908B82]" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="valueHigh">Value: High to Low</option>
                <option value="valueLow">Value: Low to High</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Directory Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#E8E5DF] bg-white">
          <p className="font-serif text-xl text-[#736E65]">No luxury pieces match your selected filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedBrand('All'); }}
            className="mt-4 text-xs sm:text-sm uppercase tracking-widest underline text-[#1A1A1A]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onSelect={() => onSelectItem(item)} 
              onSwap={() => onSwap(item)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

    </div>
  );
}

function ItemCard({ item, onSelect, onSwap, formatCurrency }) {
  return (
    <div className="group bg-white border border-[#E8E5DF] hover:border-[#1A1A1A] transition-all duration-300 flex flex-col justify-between shadow-sm">
      
      {/* Visual Image Banner */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F1EA] cursor-pointer" onClick={onSelect}>
        <img 
          src={item.images[0]} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest text-[#1A1A1A] border border-[#E8E5DF] font-medium">
          {item.brand}
        </div>

        {/* Dynamic Currency Overlay Badge */}
        <div className="absolute bottom-3 right-3 bg-[#1A1A1A] text-white px-3 py-1.5 text-xs sm:text-sm font-mono flex items-center gap-1.5">
          <span>{item.swapValuePoints} PTS</span>
          <span className="text-[#B8B2A6] border-l border-[#444] pl-1.5">({formatCurrency(item.estimatedValueUSD)})</span>
        </div>
      </div>

      {/* Item Meta Information */}
      <div className="p-6 flex-1 flex flex-col justify-between border-t border-[#E8E5DF]">
        <div>
          <div className="flex items-center justify-between text-xs text-[#908B82] uppercase tracking-wider mb-1.5 font-medium">
            <span>{item.category}</span>
            <span>{item.size}</span>
          </div>

          <h3 onClick={onSelect} className="font-serif text-lg text-[#1A1A1A] cursor-pointer hover:underline line-clamp-1 mb-2">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#736E65] line-clamp-2 font-light leading-relaxed mb-5">
            {item.description}
          </p>
        </div>

        {/* Owner Profile & Quick Action */}
        <div className="pt-4 border-t border-[#F4F1EA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={item.owner.avatar} className="w-7 h-7 rounded-full object-cover border border-[#E8E5DF]" />
            <span className="text-xs sm:text-sm text-[#4A4741] font-medium">{item.owner.name}</span>
          </div>

          <button 
            onClick={onSelect}
            className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-[#1A1A1A] hover:text-[#C5A880] transition-colors flex items-center gap-1"
          >
            <span>Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

function ItemDetailPage({ item, onBack, onSwap, onContact, formatCurrency }) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Return Button */}
      <button 
        onClick={onBack}
        className="text-xs sm:text-sm uppercase tracking-widest text-[#736E65] hover:text-[#1A1A1A] flex items-center gap-2 mb-8 transition-colors font-medium"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Return To Directory</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] bg-[#F4F1EA] border border-[#E8E5DF] overflow-hidden">
            <img src={item.images[activeImg]} alt={item.title} className="w-full h-full object-cover" />
          </div>

          {item.images.length > 1 && (
            <div className="flex gap-4">
              {item.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-24 h-28 border overflow-hidden transition-all ${
                    activeImg === idx ? 'border-[#1A1A1A]' : 'border-[#E8E5DF] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Specs */}
        <div className="lg:col-span-5 bg-white border border-[#E8E5DF] p-8 sm:p-10">
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#908B82] uppercase tracking-widest mb-2 font-medium">
            <span>{item.brand}</span>
            <span className="flex items-center gap-1.5 text-[#C5A880]"><Award className="w-4 h-4" /> Verified Piece</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mb-6">{item.title}</h1>

          {/* Dynamic Swap Valuation Box */}
          <div className="bg-[#F9F8F6] p-5 border border-[#E8E5DF] mb-8 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Exchange Valuation</span>
              <span className="font-serif text-3xl font-medium text-[#1A1A1A]">{item.swapValuePoints} PTS</span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Est. Value ({formatCurrency(item.estimatedValueUSD).slice(0,1)})</span>
              <span className="text-base font-mono text-[#1A1A1A] font-bold">{formatCurrency(item.estimatedValueUSD)}</span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3.5 py-5 border-y border-[#E8E5DF] text-xs sm:text-sm mb-8">
            <div className="flex justify-between">
              <span className="text-[#908B82] uppercase tracking-wider">Category</span>
              <span className="text-[#1A1A1A] font-medium">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#908B82] uppercase tracking-wider">Size</span>
              <span className="text-[#1A1A1A] font-medium">{item.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#908B82] uppercase tracking-wider">Condition</span>
              <span className="text-[#1A1A1A] font-medium">{item.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#908B82] uppercase tracking-wider">Location</span>
              <span className="text-[#1A1A1A] font-medium">{item.location}</span>
            </div>
          </div>

          {/* Description & Provenance */}
          <div className="space-y-5 mb-8">
            <div>
              <h4 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-1.5 font-semibold">Editor's Notes</h4>
              <p className="text-xs sm:text-sm text-[#4A4741] font-light leading-relaxed">{item.description}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-1.5 font-semibold">Garment Provenance</h4>
              <p className="text-xs sm:text-sm text-[#4A4741] font-light leading-relaxed bg-[#F4F1EA] p-4 border border-[#E8E5DF]">
                {item.provenance}
              </p>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="flex items-center gap-4 p-4 border border-[#E8E5DF] mb-8 bg-[#FDFBF7]">
            <img src={item.owner.avatar} className="w-11 h-11 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-serif font-medium">{item.owner.name}</span>
                <span className="text-xs font-mono text-[#908B82]">★ {item.owner.rating}</span>
              </div>
              <p className="text-xs text-[#736E65] uppercase tracking-wider">{item.owner.swapsCompleted} Successful Exchanges</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3.5">
            <button 
              onClick={onSwap}
              className="w-full py-4 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Propose Wardrobe Swap</span>
            </button>

            <button 
              onClick={onContact}
              className="w-full py-4 bg-white border border-[#E8E5DF] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:border-[#1A1A1A] transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Owner Directly</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

function ValueCalculatorPage({ 
  calcBrand, setCalcBrand, calcCategory, setCalcCategory, 
  calcCondition, setCalcCondition, calcRetailUSD, setCalcRetailUSD, 
  estimatedResultUSD, calculateValue, onListNow, formatCurrency, currentCurrency
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Algorithmic Precision</span>
        <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-1">Instant Valuation Engine</h1>
        <p className="text-sm text-[#736E65] mt-2 font-light max-w-lg mx-auto">
          Assess the swap point value of your luxury apparel piece based on secondary market demand and garment preservation grade.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-sm">
        
        {/* Form Controls */}
        <div className="space-y-6">
          
          <div>
            <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Designer Brand</label>
            <select 
              value={calcBrand}
              onChange={(e) => setCalcBrand(e.target.value)}
              className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="Totême">Totême</option>
              <option value="Maison Margiela">Maison Margiela</option>
              <option value="Acne Studios">Acne Studios</option>
              <option value="Burberry">Burberry</option>
              <option value="Lemaire">Lemaire</option>
              <option value="Reformation">Reformation</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Apparel Category</label>
            <select 
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="Outerwear">Outerwear & Coats</option>
              <option value="Tops">Tops & Shirts</option>
              <option value="Bags">Designer Bags</option>
              <option value="Dresses">Dresses</option>
              <option value="Knitwear">Knitwear</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Condition Grade</label>
            <select 
              value={calcCondition}
              onChange={(e) => setCalcCondition(e.target.value)}
              className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="Pristine">Pristine (New / Unworn with Tags)</option>
              <option value="Excellent">Excellent (Minor Wear / Worn 1-2 times)</option>
              <option value="Very Good">Very Good (Gentle Wear / Fully Cared For)</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Original Retail Price ($ USD Base)</label>
            <input 
              type="number" 
              value={calcRetailUSD}
              onChange={(e) => setCalcRetailUSD(e.target.value)}
              placeholder="e.g. 950" 
              className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <button 
            onClick={calculateValue}
            className="w-full py-3.5 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors font-medium"
          >
            Calculate Point Value
          </button>

        </div>

        {/* Valuation Result Panel */}
        <div className="bg-[#F4F1EA] p-8 border border-[#E8E5DF] text-center flex flex-col justify-between h-full">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Estimated Swap Power</span>
            <div className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] my-5">{estimatedResultUSD} <span className="text-2xl font-sans">PTS</span></div>
            
            <div className="p-3 bg-white border border-[#E8E5DF] inline-block w-full mb-3 font-mono text-sm">
              Converted Market Value: <strong className="text-[#1A1A1A]">{formatCurrency(estimatedResultUSD)}</strong> ({currentCurrency})
            </div>

            <p className="text-xs sm:text-sm text-[#736E65] font-light leading-relaxed">
              This garment qualifies for Tier-A luxury exchange matching with zero platform cash commissions.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8E5DF]">
            <button 
              onClick={onListNow}
              className="w-full py-3.5 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all font-medium"
            >
              Add To My Wardrobe
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function MyClosetDashboard({ closet, onNavigateExplore, formatCurrency }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Profile Banner */}
      <div className="bg-white border border-[#E8E5DF] p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
            alt="User Avatar" 
            className="w-20 h-20 rounded-full object-cover border border-[#E8E5DF]"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1A1A]">Alexandra Vance</h1>
              <span className="bg-[#F4F1EA] text-[#1A1A1A] text-xs px-2.5 py-1 border border-[#E8E5DF] uppercase tracking-widest font-mono">Verified Collector</span>
            </div>
            <p className="text-xs sm:text-sm text-[#736E65] font-light mt-1">Paris, France &bull; Member since October 2024</p>
          </div>
        </div>

        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-[#E8E5DF] pt-4 md:pt-0 md:pl-8 text-center">
          <div>
            <span className="font-serif text-3xl text-[#1A1A1A]">1,280</span>
            <p className="text-xs uppercase tracking-widest text-[#908B82] mt-1 font-medium">Available PTS</p>
            <p className="text-xs font-mono text-[#1A1A1A] font-semibold">({formatCurrency(1280)})</p>
          </div>
          <div>
            <span className="font-serif text-3xl text-[#1A1A1A]">12</span>
            <p className="text-xs uppercase tracking-widest text-[#908B82] mt-1 font-medium">Active Swaps</p>
          </div>
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
        <h2 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1A1A]">My Wardrobe Items</h2>
        <button className="px-5 py-2.5 bg-[#1A1A1A] text-white text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" />
          <span>Add New Piece</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {closet.map((item) => (
          <div key={item.id} className="bg-white border border-[#E8E5DF] p-5 flex gap-5 shadow-sm">
            <img src={item.image} alt={item.title} className="w-28 h-36 object-cover border border-[#E8E5DF]" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">{item.brand}</span>
                <h4 className="font-serif text-base font-medium text-[#1A1A1A] line-clamp-1 mt-0.5">{item.title}</h4>
                <p className="text-sm font-mono text-[#1A1A1A] font-bold mt-1.5">{item.swapValuePoints} PTS</p>
                <p className="text-xs font-mono text-[#736E65]">{formatCurrency(item.estimatedValueUSD)}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F4F1EA]">
                <span className="text-xs uppercase text-[#736E65]">{item.condition}</span>
                <span className="text-xs text-[#C5A880] uppercase tracking-widest font-semibold">Available</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function MessagesPage({ initialThread, formatCurrency }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hello! I saw your proposal for the Totême Trench Coat. Is the wool blend heavyweight?', time: '10:14 AM' },
    { id: 2, sender: 'me', text: 'Yes, absolutely. It was tailored for autumn/winter and comes with the original boutique garment bag.', time: '10:16 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: inputText, time: 'Just now' }]);
    setInputText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-white border border-[#E8E5DF] h-[680px] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
        
        {/* Left Thread List */}
        <div className="md:col-span-4 border-r border-[#E8E5DF] bg-[#FDFBF7]">
          <div className="p-5 border-b border-[#E8E5DF]">
            <h3 className="font-serif text-xl uppercase tracking-tight">Active Negotiations</h3>
          </div>

          <div className="divide-y divide-[#E8E5DF]">
            <div className="p-5 bg-white border-l-2 border-[#1A1A1A] cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-sm font-medium">Camille Laurent</span>
                <span className="text-xs text-[#908B82]">10:16 AM</span>
              </div>
              <p className="text-xs sm:text-sm text-[#736E65] line-clamp-1">Totême Wool Trench Coat Exchange</p>
            </div>
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          
          <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between bg-[#FDFBF7]">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h4 className="font-serif text-sm font-medium">Camille Laurent</h4>
                <p className="text-xs text-[#908B82] uppercase tracking-wider">Exchange Value: 890 PTS ({formatCurrency(890)})</p>
              </div>
            </div>
            <button className="text-xs sm:text-sm uppercase tracking-widest px-4 py-2 border border-[#E8E5DF] hover:border-[#1A1A1A] font-medium">
              Finalize Terms
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAF8F5]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'me' 
                    ? 'bg-[#1A1A1A] text-white' 
                    : 'bg-white border border-[#E8E5DF] text-[#1A1A1A]'
                }`}>
                  <p>{m.text}</p>
                  <span className={`text-[10px] block mt-2 text-right ${m.sender === 'me' ? 'text-[#B8B2A6]' : 'text-[#908B82]'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E8E5DF] flex gap-3 bg-white">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message or shipping proposal..." 
              className="flex-1 p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
            <button 
              onClick={handleSend}
              className="px-6 py-3 bg-[#1A1A1A] text-white text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] font-medium"
            >
              Send
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

function AdminDashboard({ formatCurrency }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Platform Governance</span>
          <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A]">Curations Moderation</h1>
        </div>
        <span className="text-xs font-mono bg-[#F4F1EA] px-3.5 py-1.5 border border-[#E8E5DF]">System Status: Operational</span>
      </div>

      {/* Admin Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 border border-[#E8E5DF]">
          <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Pending Verifications</span>
          <span className="font-serif text-4xl text-[#1A1A1A] block my-2">18</span>
          <span className="text-xs text-[#C5A880]">Requires Authenticator Approval</span>
        </div>
        <div className="bg-white p-6 border border-[#E8E5DF]">
          <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Total Swaps Completed</span>
          <span className="font-serif text-4xl text-[#1A1A1A] block my-2">1,420</span>
          <span className="text-xs text-[#736E65]">+14% this month</span>
        </div>
        <div className="bg-white p-6 border border-[#E8E5DF]">
          <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Platform Swap Volume</span>
          <span className="font-serif text-4xl text-[#1A1A1A] block my-2">890K PTS</span>
          <span className="text-xs font-mono text-[#736E65]">Valued at {formatCurrency(890000)}</span>
        </div>
        <div className="bg-white p-6 border border-[#E8E5DF]">
          <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Dispute Index</span>
          <span className="font-serif text-4xl text-[#1A1A1A] block my-2">0.02%</span>
          <span className="text-xs text-[#736E65]">Museum-grade compliance</span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white border border-[#E8E5DF]">
        <div className="p-5 border-b border-[#E8E5DF] bg-[#FDFBF7]">
          <h3 className="font-serif text-xl uppercase tracking-tight">Recent Garment Intake Queue</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F4F1EA] text-[#736E65] uppercase tracking-wider text-xs border-b border-[#E8E5DF]">
              <tr>
                <th className="p-4 font-medium">Garment Title</th>
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium">Assigned Points</th>
                <th className="p-4 font-medium">Converted Value</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              <tr>
                <td className="p-4 font-serif font-medium">Vintage Leather Trench</td>
                <td className="p-4">Bottega Veneta</td>
                <td className="p-4">Soren K.</td>
                <td className="p-4 font-mono font-bold">1,120 PTS</td>
                <td className="p-4 font-mono text-[#736E65]">{formatCurrency(1120)}</td>
                <td className="p-4"><span className="text-xs uppercase tracking-wider bg-[#FAF8F5] px-2.5 py-1 border border-[#E8E5DF] text-[#C5A880]">Pending Scan</span></td>
                <td className="p-4 text-right"><button className="text-xs uppercase tracking-widest underline font-medium">Inspect</button></td>
              </tr>
              <tr>
                <td className="p-4 font-serif font-medium">Asymmetric Wool Skirt</td>
                <td className="p-4">Jil Sander</td>
                <td className="p-4">Claire M.</td>
                <td className="p-4 font-mono font-bold">480 PTS</td>
                <td className="p-4 font-mono text-[#736E65]">{formatCurrency(480)}</td>
                <td className="p-4"><span className="text-xs uppercase tracking-wider bg-[#FAF8F5] px-2.5 py-1 border border-[#E8E5DF] text-[#1A1A1A]">Verified</span></td>
                <td className="p-4 text-right"><button className="text-xs uppercase tracking-widest underline font-medium">Inspect</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   Sparkles, Search, SlidersHorizontal, ArrowUpDown, ChevronRight, 
//   Heart, ShoppingBag, ArrowRight, Check, X, Shield, RefreshCw, 
//   User, MessageSquare, Plus, Filter, MapPin, Award, Scale, 
//   TrendingUp, Activity, CheckCircle, Clock, Send, Camera, Info, 
//   Sliders, Star, Layers, Settings, LogOut, ChevronDown, CheckCircle2,
//   Globe, Coins
// } from 'lucide-react';

// // Dynamic Currency Configurations with Symbols & Exchange Rates relative to USD (Base 1.0)
// const CURRENCIES = {
//   USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
//   EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', code: 'EUR' },
//   GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', code: 'GBP' },
//   INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)', code: 'INR' },
//   CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)', code: 'CAD' },
//   AUD: { symbol: 'A$', rate: 1.52, label: 'AUD ($)', code: 'AUD' },
//   JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)', code: 'JPY' }
// };

// const MOCK_ITEMS = [
//   {
//     id: 'cs-001',
//     title: 'Double-Breasted Wool Trench Coat',
//     brand: 'Totême',
//     category: 'Outerwear',
//     size: 'M (FR 38)',
//     condition: 'Pristine (Worn Once)',
//     estimatedValueUSD: 890,
//     swapValuePoints: 890,
//     location: 'Paris, France (2.4 km)',
//     owner: {
//       name: 'Camille Laurent',
//       avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
//       rating: 4.9,
//       swapsCompleted: 28,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000',
//     ],
//     description: 'Iconic oversized silhouette tailored from heavy wool-blend. Sculptural shoulders, deep notch lapels, and detachable belt.',
//     provenance: 'Purchased at Totême Rue Richelieu boutique, Fall 2023. Original garment bag included.'
//   },
//   {
//     id: 'cs-002',
//     title: 'Deconstructed Poplin Shirt',
//     brand: 'Maison Margiela',
//     category: 'Tops',
//     size: 'S (IT 40)',
//     condition: 'Excellent',
//     estimatedValueUSD: 520,
//     swapValuePoints: 520,
//     location: 'London, UK (5.1 km)',
//     owner: {
//       name: 'Evelyn Vance',
//       avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
//       rating: 5.0,
//       swapsCompleted: 42,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000'
//     ],
//     description: 'Crisp organic cotton poplin featuring four-stitches moniker on the rear collar. Asymmetrical hemline with high side slits.',
//     provenance: 'Authenticated by ClosetShuffle Curator. Zero defects.'
//   },
//   {
//     id: 'cs-003',
//     title: 'Minimalist Leather Shoulder Bag',
//     brand: 'Acne Studios',
//     category: 'Bags',
//     size: 'One Size',
//     condition: 'Pristine',
//     estimatedValueUSD: 780,
//     swapValuePoints: 780,
//     location: 'Milan, Italy (1.2 km)',
//     owner: {
//       name: 'Matteo Rossi',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
//       rating: 4.8,
//       swapsCompleted: 15,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1000'
//     ],
//     description: 'Smooth calfskin leather shoulder bag in warm almond tone. Minimal silver foil embossing and adjustable strap.',
//     provenance: 'Acne Studios Flagship Store, Stockholm.'
//   },
//   {
//     id: 'cs-004',
//     title: 'Silk Wrap Midi Dress',
//     brand: 'Reformation',
//     category: 'Dresses',
//     size: 'M (US 6)',
//     condition: 'Very Good',
//     estimatedValueUSD: 340,
//     swapValuePoints: 340,
//     location: 'New York, USA (8.9 km)',
//     owner: {
//       name: 'Sophia Chen',
//       avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
//       rating: 4.9,
//       swapsCompleted: 31,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1000'
//     ],
//     description: 'Lightweight 100% silk charmeuse dress with V-neckline and subtle cap sleeves. Deep ivory tone.',
//     provenance: 'Purchased 2023. Dry cleaned professionally.'
//   },
//   {
//     id: 'cs-005',
//     title: 'Structured Alpaca Knit Sweater',
//     brand: 'Lemaire',
//     category: 'Knitwear',
//     size: 'L (FR 42)',
//     condition: 'Pristine',
//     estimatedValueUSD: 640,
//     swapValuePoints: 640,
//     location: 'Tokyo, Japan (3.0 km)',
//     owner: {
//       name: 'Kenji Sato',
//       avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
//       rating: 5.0,
//       swapsCompleted: 54,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=1000'
//     ],
//     description: 'Heavy gauge alpaca-wool blend knit with raglan sleeves and rib-knit funnel neck.',
//     provenance: 'Lemaire Marais Paris.'
//   },
//   {
//     id: 'cs-006',
//     title: 'Heritage Check Wool Blazer',
//     brand: 'Burberry',
//     category: 'Outerwear',
//     size: 'S (UK 8)',
//     condition: 'Excellent',
//     estimatedValueUSD: 1100,
//     swapValuePoints: 1100,
//     location: 'London, UK (1.8 km)',
//     owner: {
//       name: 'Gemma Ward',
//       avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
//       rating: 4.9,
//       swapsCompleted: 19,
//       verified: true
//     },
//     images: [
//       'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000',
//       'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=1000'
//     ],
//     description: 'Classic British tailoring in muted houndstooth wool with horn button closures and silk cupro lining.',
//     provenance: 'Bond Street Boutique. Verified vintage heritage tier.'
//   }
// ];

// const USER_CLOSET = [
//   {
//     id: 'my-001',
//     title: 'Cashmere Ribbed Cardigan',
//     brand: 'Khaite',
//     category: 'Knitwear',
//     size: 'M',
//     condition: 'Pristine',
//     estimatedValueUSD: 820,
//     swapValuePoints: 820,
//     image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600'
//   },
//   {
//     id: 'my-002',
//     title: 'Pleated Trousers',
//     brand: 'Studio Nicholson',
//     category: 'Trousers',
//     size: 'M',
//     condition: 'Excellent',
//     estimatedValueUSD: 460,
//     swapValuePoints: 460,
//     image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600'
//   }
// ];

// export default function App() {
//   const [currentTab, setCurrentTab] = useState('landing');
//   const [selectedItem, setSelectedItem] = useState(MOCK_ITEMS[0]);
//   const [swapModalOpen, setSwapModalOpen] = useState(false);
//   const [offerItem, setOfferItem] = useState(USER_CLOSET[0]);
//   const [activeMessageThread, setActiveMessageThread] = useState(null);

//   // Currency State Management
//   const [currentCurrency, setCurrentCurrency] = useState('USD');

//   // Helper function to format currency dynamically
//   const formatCurrency = (usdAmount) => {
//     const curr = CURRENCIES[currentCurrency];
//     const converted = Math.round(usdAmount * curr.rate);
//     return `${curr.symbol}${converted.toLocaleString()}`;
//   };

//   // Filters State
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [selectedBrand, setSelectedBrand] = useState('All');
//   const [sortBy, setSortBy] = useState('featured');

//   // Value Estimator Form State
//   const [calcBrand, setCalcBrand] = useState('Totême');
//   const [calcCategory, setCalcCategory] = useState('Outerwear');
//   const [calcCondition, setCalcCondition] = useState('Pristine');
//   const [calcRetailUSD, setCalcRetailUSD] = useState('950');
//   const [estimatedResultUSD, setEstimatedResultUSD] = useState(850);

//   const calculateValue = () => {
//     const base = parseFloat(calcRetailUSD) || 500;
//     let multiplier = 0.85;
//     if (calcCondition === 'Pristine') multiplier = 0.90;
//     if (calcCondition === 'Excellent') multiplier = 0.75;
//     if (calcCondition === 'Very Good') multiplier = 0.60;
    
//     if (['Maison Margiela', 'Totême', 'Burberry'].includes(calcBrand)) {
//       multiplier += 0.05;
//     }
//     setEstimatedResultUSD(Math.round(base * multiplier));
//   };

//   const filteredItems = useMemo(() => {
//     return MOCK_ITEMS.filter(item => {
//       const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                             item.brand.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
//       const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand;
//       return matchesSearch && matchesCategory && matchesBrand;
//     });
//   }, [searchQuery, selectedCategory, selectedBrand]);

//   const handleOpenDetail = (item) => {
//     setSelectedItem(item);
//     setCurrentTab('detail');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleStartSwap = (item) => {
//     setSelectedItem(item);
//     setSwapModalOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans antialiased selection:bg-[#EAE4D9]">
      
//       {/* Editorial Top Announcement Bar */}
//       <div className="bg-[#1A1A1A] text-[#E8E5DF] text-xs sm:text-sm tracking-widest uppercase py-2.5 text-center px-4 font-mono">
//         <span>Curated Circular Fashion Exchange &bull; Guaranteed Authenticity &bull; Zero Waste Luxury</span>
//       </div>

//       {/* Main Luxury Header Navigation with Dynamic Currency Picker */}
//       <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E5DF]">
//         <div className="max-w-7xl mx-auto px-6 h-22 flex items-center justify-between">
          
//           {/* Brand Logo */}
//           <div 
//             onClick={() => setCurrentTab('landing')} 
//             className="cursor-pointer group flex items-center gap-3"
//           >
//             <div className="w-9 h-9 border border-[#1A1A1A] flex items-center justify-center font-serif text-base font-semibold tracking-tighter group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
//               CS
//             </div>
//             <span className="font-serif text-2xl tracking-tight font-medium uppercase">
//               Closet<span className="font-light italic text-[#908B82]">Shuffle</span>
//             </span>
//           </div>

//           {/* Central Nav Links */}
//           <nav className="hidden lg:flex items-center gap-9 text-xs sm:text-sm uppercase tracking-wider font-medium text-[#4A4741]">
//             <button 
//               onClick={() => setCurrentTab('explore')} 
//               className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'explore' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
//             >
//               Explore Directory
//             </button>
//             <button 
//               onClick={() => setCurrentTab('valueCalc')} 
//               className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'valueCalc' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
//             >
//               Valuation Engine
//             </button>
//             <button 
//               onClick={() => setCurrentTab('myCloset')} 
//               className={`transition-colors hover:text-[#1A1A1A] pb-1 ${currentTab === 'myCloset' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
//             >
//               My Wardrobe
//             </button>
//             <button 
//               onClick={() => setCurrentTab('messages')} 
//               className={`transition-colors hover:text-[#1A1A1A] pb-1 relative ${currentTab === 'messages' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : ''}`}
//             >
//               Negotiations
//               <span className="absolute -top-1 -right-3 w-2 h-2 bg-[#C5A880] rounded-full"></span>
//             </button>
//           </nav>

//           {/* Right Header Controls: Currency Dropdown & Profile */}
//           <div className="flex items-center gap-4">
            
//             {/* Dynamic Currency Selector */}
//             <div className="flex items-center gap-1.5 border border-[#E8E5DF] bg-[#F4F1EA] px-3 py-2 rounded-none hover:border-[#1A1A1A] transition-colors">
//               <Globe className="w-4 h-4 text-[#736E65]" />
//               <select 
//                 value={currentCurrency}
//                 onChange={(e) => setCurrentCurrency(e.target.value)}
//                 className="bg-transparent text-xs sm:text-sm font-mono font-medium text-[#1A1A1A] focus:outline-none cursor-pointer pr-1"
//               >
//                 {Object.keys(CURRENCIES).map((code) => (
//                   <option key={code} value={code}>
//                     {CURRENCIES[code].label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button 
//               onClick={() => setCurrentTab('admin')} 
//               className={`text-xs sm:text-sm uppercase tracking-wider px-3.5 py-2 border border-[#E8E5DF] hover:border-[#1A1A1A] transition-all flex items-center gap-2 ${currentTab === 'admin' ? 'bg-[#1A1A1A] text-white' : 'text-[#4A4741]'}`}
//             >
//               <Activity className="w-4 h-4" />
//               <span className="hidden xl:inline">Curation Admin</span>
//             </button>

//             <button 
//               onClick={() => setCurrentTab('myCloset')}
//               className="w-10 h-10 border border-[#E8E5DF] rounded-full flex items-center justify-center hover:border-[#1A1A1A] transition-colors bg-white"
//             >
//               <User className="w-4 h-4 text-[#1A1A1A]" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Dynamic View Router */}
//       <main>
//         {currentTab === 'landing' && (
//           <LandingPage 
//             onExplore={() => setCurrentTab('explore')} 
//             onValuate={() => setCurrentTab('valueCalc')}
//             onSelectItem={handleOpenDetail}
//             formatCurrency={formatCurrency}
//           />
//         )}

//         {currentTab === 'explore' && (
//           <ExploreDirectory 
//             items={filteredItems} 
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//             selectedCategory={selectedCategory}
//             setSelectedCategory={setSelectedCategory}
//             selectedBrand={selectedBrand}
//             setSelectedBrand={setSelectedBrand}
//             sortBy={sortBy}
//             setSortBy={setSortBy}
//             onSelectItem={handleOpenDetail}
//             onSwap={handleStartSwap}
//             formatCurrency={formatCurrency}
//           />
//         )}

//         {currentTab === 'detail' && selectedItem && (
//           <ItemDetailPage 
//             item={selectedItem} 
//             onBack={() => setCurrentTab('explore')}
//             onSwap={() => handleStartSwap(selectedItem)}
//             onContact={() => {
//               setActiveMessageThread(selectedItem);
//               setCurrentTab('messages');
//             }}
//             formatCurrency={formatCurrency}
//           />
//         )}

//         {currentTab === 'valueCalc' && (
//           <ValueCalculatorPage 
//             calcBrand={calcBrand}
//             setCalcBrand={setCalcBrand}
//             calcCategory={calcCategory}
//             setCalcCategory={setCalcCategory}
//             calcCondition={calcCondition}
//             setCalcCondition={setCalcCondition}
//             calcRetailUSD={calcRetailUSD}
//             setCalcRetailUSD={setCalcRetailUSD}
//             estimatedResultUSD={estimatedResultUSD}
//             calculateValue={calculateValue}
//             onListNow={() => setCurrentTab('myCloset')}
//             formatCurrency={formatCurrency}
//             currentCurrency={currentCurrency}
//           />
//         )}

//         {currentTab === 'myCloset' && (
//           <MyClosetDashboard 
//             closet={USER_CLOSET} 
//             onNavigateExplore={() => setCurrentTab('explore')}
//             formatCurrency={formatCurrency}
//           />
//         )}

//         {currentTab === 'messages' && (
//           <MessagesPage 
//             initialThread={activeMessageThread} 
//             formatCurrency={formatCurrency}
//           />
//         )}

//         {currentTab === 'admin' && (
//           <AdminDashboard 
//             formatCurrency={formatCurrency}
//           />
//         )}
//       </main>

//       {/* Interactive Swap Offer Modal */}
//       {swapModalOpen && (
//         <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-[#FDFBF7] max-w-2xl w-full border border-[#E8E5DF] p-8 shadow-2xl relative animate-in fade-in duration-200">
            
//             <button 
//               onClick={() => setSwapModalOpen(false)}
//               className="absolute top-6 right-6 text-[#908B82] hover:text-[#1A1A1A]"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight mb-2">Initiate Fashion Swap</h3>
//             <p className="text-sm text-[#736E65] uppercase tracking-wider mb-6">
//               Select an item from your wardrobe to offer in exchange for <span className="font-medium text-[#1A1A1A]">{selectedItem.title}</span>.
//             </p>

//             {/* Comparison Grid with Dynamic Currency */}
//             <div className="grid grid-cols-2 gap-4 bg-[#F4F1EA] p-5 border border-[#E8E5DF] mb-6">
              
//               <div className="text-center">
//                 <span className="text-xs uppercase tracking-widest text-[#736E65]">Target Piece</span>
//                 <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-28 h-36 object-cover mx-auto my-3 border border-[#E8E5DF]" />
//                 <p className="text-sm font-serif font-medium">{selectedItem.title}</p>
//                 <p className="text-sm font-mono text-[#1A1A1A] font-semibold mt-1">
//                   {selectedItem.swapValuePoints} PTS <span className="text-xs font-normal text-[#908B82]">({formatCurrency(selectedItem.estimatedValueUSD)})</span>
//                 </p>
//               </div>

//               <div className="text-center">
//                 <span className="text-xs uppercase tracking-widest text-[#736E65]">Your Offering</span>
//                 {offerItem ? (
//                   <>
//                     <img src={offerItem.image} alt={offerItem.title} className="w-28 h-36 object-cover mx-auto my-3 border border-[#E8E5DF]" />
//                     <p className="text-sm font-serif font-medium">{offerItem.title}</p>
//                     <p className="text-sm font-mono text-[#1A1A1A] font-semibold mt-1">
//                       {offerItem.swapValuePoints} PTS <span className="text-xs font-normal text-[#908B82]">({formatCurrency(offerItem.estimatedValueUSD)})</span>
//                     </p>
//                   </>
//                 ) : (
//                   <div className="w-28 h-36 border border-dashed border-[#B8B2A6] mx-auto my-3 flex items-center justify-center text-xs text-[#908B82]">
//                     Select Below
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Fairness Score Indicator */}
//             {offerItem && (
//               <div className="mb-6 p-4 bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs sm:text-sm">
//                 <div className="flex items-center gap-2">
//                   <Scale className="w-5 h-5 text-[#C5A880]" />
//                   <span>Fairness Rating: <strong className="font-mono text-[#1A1A1A]">98.2% Balanced Match</strong></span>
//                 </div>
//                 <span className="text-[#908B82] font-mono text-xs">Delta: {formatCurrency(Math.abs(selectedItem.estimatedValueUSD - offerItem.estimatedValueUSD))}</span>
//               </div>
//             )}

//             {/* Item Selection List */}
//             <div className="mb-6">
//               <label className="text-xs uppercase tracking-wider text-[#736E65] block mb-2 font-medium">Choose from your closet:</label>
//               <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
//                 {USER_CLOSET.map((cItem) => (
//                   <div 
//                     key={cItem.id}
//                     onClick={() => setOfferItem(cItem)}
//                     className={`p-3 border cursor-pointer flex items-center gap-3 transition-all ${
//                       offerItem?.id === cItem.id 
//                         ? 'border-[#1A1A1A] bg-white' 
//                         : 'border-[#E8E5DF] bg-[#FDFBF7] hover:border-[#908B82]'
//                     }`}
//                   >
//                     <img src={cItem.image} className="w-12 h-14 object-cover" />
//                     <div>
//                       <p className="text-xs sm:text-sm font-medium line-clamp-1">{cItem.title}</p>
//                       <p className="text-xs font-mono text-[#736E65]">{formatCurrency(cItem.estimatedValueUSD)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E5DF]">
//               <button 
//                 onClick={() => setSwapModalOpen(false)}
//                 className="px-5 py-3 text-xs sm:text-sm uppercase tracking-wider text-[#736E65] hover:text-[#1A1A1A]"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={() => {
//                   setSwapModalOpen(false);
//                   setActiveMessageThread(selectedItem);
//                   setCurrentTab('messages');
//                 }}
//                 className="px-7 py-3 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors flex items-center gap-2"
//               >
//                 <span>Send Exchange Proposal</span>
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* Footer Component */}
//       <footer className="bg-[#1A1A1A] text-[#FDFBF7] pt-20 pb-12 border-t border-[#333333]">
//         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-[#333333]">
          
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-8 h-8 border border-[#FDFBF7] flex items-center justify-center font-serif text-sm font-semibold">
//                 CS
//               </div>
//               <span className="font-serif text-xl uppercase tracking-tight">ClosetShuffle</span>
//             </div>
//             <p className="text-xs sm:text-sm text-[#B8B2A6] leading-relaxed font-light">
//               The elevated destination for luxury circular fashion. Refresh your wardrobe through verified high-end garment exchanges worldwide.
//             </p>
//           </div>

//           <div>
//             <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Curated Directory</h5>
//             <ul className="space-y-3 text-xs sm:text-sm text-[#E8E5DF] font-light">
//               <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Outerwear & Coats</button></li>
//               <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Tailoring & Suitings</button></li>
//               <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Designer Handbags</button></li>
//               <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Fine Knitwear</button></li>
//             </ul>
//           </div>

//           <div>
//             <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Platform Intelligence</h5>
//             <ul className="space-y-3 text-xs sm:text-sm text-[#E8E5DF] font-light">
//               <li><button onClick={() => setCurrentTab('valueCalc')} className="hover:underline">Valuation Engine</button></li>
//               <li><button onClick={() => setCurrentTab('admin')} className="hover:underline">Authenticity Protocol</button></li>
//               <li><button onClick={() => setCurrentTab('explore')} className="hover:underline">Fair Swap Algorithm</button></li>
//             </ul>
//           </div>

//           <div>
//             <h5 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-5 font-semibold">Private Membership</h5>
//             <p className="text-xs sm:text-sm text-[#B8B2A6] mb-4 font-light">Receive private invitations to high-value wardrobe releases.</p>
//             <div className="flex">
//               <input 
//                 type="email" 
//                 placeholder="Enter email address" 
//                 className="bg-[#262626] border border-[#333] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A880] w-full"
//               />
//               <button className="bg-[#FDFBF7] text-[#1A1A1A] px-4 py-2.5 text-xs sm:text-sm uppercase tracking-wider font-medium">Join</button>
//             </div>
//           </div>

//         </div>

//         <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#908B82]">
//           <p>© 2026 ClosetShuffle Inc. All rights reserved. Editorial imagery inspired by global fashion journalism.</p>
//           <div className="flex gap-6 mt-4 md:mt-0">
//             <a href="#" className="hover:text-[#FDFBF7]">Privacy Policy</a>
//             <a href="#" className="hover:text-[#FDFBF7]">Terms of Curation</a>
//             <a href="#" className="hover:text-[#FDFBF7]">Security Verification</a>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }

// function LandingPage({ onExplore, onValuate, onSelectItem, formatCurrency }) {
//   return (
//     <div>
//       {/* Editorial Hero Banner */}
//       <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#F4F1EA] border-b border-[#E8E5DF]">
//         <div className="absolute inset-0 z-0 opacity-25 mix-blend-multiply pointer-events-none">
//           <img 
//             src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
//             alt="Editorial Fashion Background" 
//             className="w-full h-full object-cover object-top filter grayscale contrast-125"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-[#FDFBF7]/80"></div>
//         </div>

//         <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-24">
          
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 backdrop-blur border border-[#E8E5DF] text-xs sm:text-sm uppercase tracking-widest text-[#736E65] mb-8 font-medium">
//             <Sparkles className="w-4 h-4 text-[#C5A880]" />
//             <span>Redefining The Art Of Wardrobe Exchange</span>
//           </div>

//           <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal text-[#1A1A1A] tracking-tight leading-[1.08] mb-8 uppercase">
//             Curated Luxury. <br />
//             <span className="font-light italic text-[#736E65]">Zero Currency.</span>
//           </h1>

//           <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#4A4741] font-light leading-relaxed tracking-wide mb-12">
//             Trade archival designer pieces and contemporary garments with discerning collectors worldwide. 
//             An authenticated circular ecosystem powered by precision value matching.
//           </p>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
//             <button 
//               onClick={onExplore}
//               className="w-full sm:w-auto px-9 py-4 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-all duration-200 shadow-sm flex items-center justify-center gap-3 font-medium"
//             >
//               <span>Explore The Directory</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>

//             <button 
//               onClick={onValuate}
//               className="w-full sm:w-auto px-9 py-4 bg-white border border-[#E8E5DF] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:border-[#1A1A1A] transition-all duration-200 flex items-center justify-center gap-2 font-medium"
//             >
//               <span>Estimate Garment Value</span>
//             </button>
//           </div>

//           {/* Quick Metrics Bar */}
//           <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-8 border-t border-[#E8E5DF]/80 text-center">
//             <div>
//               <p className="font-serif text-3xl text-[#1A1A1A]">100%</p>
//               <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Authenticated</p>
//             </div>
//             <div>
//               <p className="font-serif text-3xl text-[#1A1A1A]">4.8K+</p>
//               <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Archival Pieces</p>
//             </div>
//             <div>
//               <p className="font-serif text-3xl text-[#1A1A1A]">{formatCurrency(0)}</p>
//               <p className="text-xs uppercase tracking-widest text-[#736E65] mt-1">Garment Cash Waste</p>
//             </div>
//           </div>

//         </div>
//       </section>

//       {/* Featured Directory Grid */}
//       <section className="max-w-7xl mx-auto px-6 py-24">
        
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#E8E5DF] pb-6">
//           <div>
//             <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Current Curation</span>
//             <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mt-1">Featured Garments</h2>
//           </div>
//           <button 
//             onClick={onExplore}
//             className="text-xs sm:text-sm uppercase tracking-widest text-[#1A1A1A] hover:text-[#736E65] flex items-center gap-1 mt-4 md:mt-0 font-medium"
//           >
//             <span>View All Listings</span>
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {MOCK_ITEMS.slice(0, 3).map((item) => (
//             <ItemCard 
//               key={item.id} 
//               item={item} 
//               onSelect={() => onSelectItem(item)} 
//               formatCurrency={formatCurrency}
//             />
//           ))}
//         </div>

//       </section>

//       {/* Editorial Feature Section */}
//       <section className="bg-[#F4F1EA] border-y border-[#E8E5DF] py-24">
//         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
//           <div className="relative">
//             <img 
//               src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000" 
//               alt="Editorial Tailoring" 
//               className="w-full h-[580px] object-cover border border-[#E8E5DF]"
//             />
//             <div className="absolute -bottom-6 -right-6 bg-white p-7 border border-[#E8E5DF] hidden sm:block max-w-sm">
//               <p className="font-serif text-xl italic text-[#1A1A1A]">"Fashion shouldn't end in landfills. It should evolve through wardrobes."</p>
//               <p className="text-xs uppercase tracking-widest text-[#908B82] mt-4 font-semibold">— Editorial Journal</p>
//             </div>
//           </div>

//           <div>
//             <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">The Exchange Standard</span>
//             <h3 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-2 mb-8 leading-tight">
//               A Museum-Grade Platform For Wardrobe Mobility
//             </h3>
            
//             <div className="space-y-8 font-light text-base text-[#4A4741]">
//               <div className="flex gap-4">
//                 <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">01</div>
//                 <div>
//                   <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Precision Item Valuation</h4>
//                   <p className="leading-relaxed text-sm">Our proprietary algorithm assesses designer tier, fabrication quality, condition grade, and historical resale indices to establish exact swap points.</p>
//                 </div>
//               </div>

//               <div className="flex gap-4">
//                 <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">02</div>
//                 <div>
//                   <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Curated Authenticity Check</h4>
//                   <p className="leading-relaxed text-sm">Every high-tier piece undergoes provenance verification and photographic inspection by our luxury fashion archivists.</p>
//                 </div>
//               </div>

//               <div className="flex gap-4">
//                 <div className="w-9 h-9 rounded-full border border-[#1A1A1A] flex items-center justify-center shrink-0 font-mono text-sm font-medium">03</div>
//                 <div>
//                   <h4 className="font-medium text-[#1A1A1A] uppercase tracking-wider text-xs sm:text-sm mb-1">Direct Peer Negotiation</h4>
//                   <p className="leading-relaxed text-sm">Connect directly with like-minded collectors to negotiate fair exchanges, additional point balances, or local concierge drop-offs.</p>
//                 </div>
//               </div>
//             </div>

//           </div>

//         </div>
//       </section>
//     </div>
//   );
// }

// function ExploreDirectory({ 
//   items, searchQuery, setSearchQuery, selectedCategory, 
//   setSelectedCategory, selectedBrand, setSelectedBrand, 
//   sortBy, setSortBy, onSelectItem, onSwap, formatCurrency 
// }) {
//   const categories = ['All', 'Outerwear', 'Tops', 'Bags', 'Dresses', 'Knitwear'];
//   const brands = ['All', 'Totême', 'Maison Margiela', 'Acne Studios', 'Reformation', 'Lemaire', 'Burberry'];

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-12">
      
//       <div className="mb-10 text-center max-w-xl mx-auto">
//         <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">The Collection</span>
//         <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-1">Explore Directory</h1>
//         <p className="text-sm text-[#736E65] mt-2 font-light">Browse authenticated pre-owned luxury garments available for instant trade.</p>
//       </div>

//       {/* Filter and Search Bar Container */}
//       <div className="bg-white border border-[#E8E5DF] p-5 mb-10 shadow-sm">
//         <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
//           {/* Search Input */}
//           <div className="relative w-full lg:w-96">
//             <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908B82]" />
//             <input 
//               type="text" 
//               placeholder="Search designer, keyword, or title..." 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
//             />
//           </div>

//           {/* Filter Dropdowns */}
//           <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
//             <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
//               <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Category:</span>
//               <select 
//                 value={selectedCategory} 
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
//               >
//                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>

//             <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
//               <span className="text-xs uppercase tracking-wider text-[#908B82] font-medium">Brand:</span>
//               <select 
//                 value={selectedBrand} 
//                 onChange={(e) => setSelectedBrand(e.target.value)}
//                 className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
//               >
//                 {brands.map(b => <option key={b} value={b}>{b}</option>)}
//               </select>
//             </div>

//             <div className="flex items-center gap-2 border border-[#E8E5DF] px-3.5 py-2 bg-[#FDFBF7]">
//               <ArrowUpDown className="w-4 h-4 text-[#908B82]" />
//               <select 
//                 value={sortBy} 
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="bg-transparent text-xs sm:text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
//               >
//                 <option value="featured">Featured First</option>
//                 <option value="valueHigh">Value: High to Low</option>
//                 <option value="valueLow">Value: Low to High</option>
//               </select>
//             </div>

//           </div>

//         </div>
//       </div>

//       {/* Directory Grid */}
//       {items.length === 0 ? (
//         <div className="text-center py-20 border border-dashed border-[#E8E5DF] bg-white">
//           <p className="font-serif text-xl text-[#736E65]">No luxury pieces match your selected filters.</p>
//           <button 
//             onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedBrand('All'); }}
//             className="mt-4 text-xs sm:text-sm uppercase tracking-widest underline text-[#1A1A1A]"
//           >
//             Reset Filters
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {items.map((item) => (
//             <ItemCard 
//               key={item.id} 
//               item={item} 
//               onSelect={() => onSelectItem(item)} 
//               onSwap={() => onSwap(item)}
//               formatCurrency={formatCurrency}
//             />
//           ))}
//         </div>
//       )}

//     </div>
//   );
// }

// function ItemCard({ item, onSelect, onSwap, formatCurrency }) {
//   return (
//     <div className="group bg-white border border-[#E8E5DF] hover:border-[#1A1A1A] transition-all duration-300 flex flex-col justify-between shadow-sm">
      
//       {/* Visual Image Banner */}
//       <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F1EA] cursor-pointer" onClick={onSelect}>
//         <img 
//           src={item.images[0]} 
//           alt={item.title} 
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
//         />
        
//         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest text-[#1A1A1A] border border-[#E8E5DF] font-medium">
//           {item.brand}
//         </div>

//         {/* Dynamic Currency Overlay Badge */}
//         <div className="absolute bottom-3 right-3 bg-[#1A1A1A] text-white px-3 py-1.5 text-xs sm:text-sm font-mono flex items-center gap-1.5">
//           <span>{item.swapValuePoints} PTS</span>
//           <span className="text-[#B8B2A6] border-l border-[#444] pl-1.5">({formatCurrency(item.estimatedValueUSD)})</span>
//         </div>
//       </div>

//       {/* Item Meta Information */}
//       <div className="p-6 flex-1 flex flex-col justify-between border-t border-[#E8E5DF]">
//         <div>
//           <div className="flex items-center justify-between text-xs text-[#908B82] uppercase tracking-wider mb-1.5 font-medium">
//             <span>{item.category}</span>
//             <span>{item.size}</span>
//           </div>

//           <h3 onClick={onSelect} className="font-serif text-lg text-[#1A1A1A] cursor-pointer hover:underline line-clamp-1 mb-2">
//             {item.title}
//           </h3>

//           <p className="text-xs sm:text-sm text-[#736E65] line-clamp-2 font-light leading-relaxed mb-5">
//             {item.description}
//           </p>
//         </div>

//         {/* Owner Profile & Quick Action */}
//         <div className="pt-4 border-t border-[#F4F1EA] flex items-center justify-between">
//           <div className="flex items-center gap-2.5">
//             <img src={item.owner.avatar} className="w-7 h-7 rounded-full object-cover border border-[#E8E5DF]" />
//             <span className="text-xs sm:text-sm text-[#4A4741] font-medium">{item.owner.name}</span>
//           </div>

//           <button 
//             onClick={onSelect}
//             className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-[#1A1A1A] hover:text-[#C5A880] transition-colors flex items-center gap-1"
//           >
//             <span>Details</span>
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// }

// function ItemDetailPage({ item, onBack, onSwap, onContact, formatCurrency }) {
//   const [activeImg, setActiveImg] = useState(0);

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-12">
      
//       {/* Return Button */}
//       <button 
//         onClick={onBack}
//         className="text-xs sm:text-sm uppercase tracking-widest text-[#736E65] hover:text-[#1A1A1A] flex items-center gap-2 mb-8 transition-colors font-medium"
//       >
//         <ArrowRight className="w-4 h-4 rotate-180" />
//         <span>Return To Directory</span>
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
//         {/* Left Column: Image Gallery */}
//         <div className="lg:col-span-7 space-y-4">
//           <div className="aspect-[4/5] bg-[#F4F1EA] border border-[#E8E5DF] overflow-hidden">
//             <img src={item.images[activeImg]} alt={item.title} className="w-full h-full object-cover" />
//           </div>

//           {item.images.length > 1 && (
//             <div className="flex gap-4">
//               {item.images.map((img, idx) => (
//                 <button 
//                   key={idx}
//                   onClick={() => setActiveImg(idx)}
//                   className={`w-24 h-28 border overflow-hidden transition-all ${
//                     activeImg === idx ? 'border-[#1A1A1A]' : 'border-[#E8E5DF] opacity-60 hover:opacity-100'
//                   }`}
//                 >
//                   <img src={img} className="w-full h-full object-cover" />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Garment Specs */}
//         <div className="lg:col-span-5 bg-white border border-[#E8E5DF] p-8 sm:p-10">
          
//           <div className="flex items-center justify-between text-xs sm:text-sm text-[#908B82] uppercase tracking-widest mb-2 font-medium">
//             <span>{item.brand}</span>
//             <span className="flex items-center gap-1.5 text-[#C5A880]"><Award className="w-4 h-4" /> Verified Piece</span>
//           </div>

//           <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A] mb-6">{item.title}</h1>

//           {/* Dynamic Swap Valuation Box */}
//           <div className="bg-[#F9F8F6] p-5 border border-[#E8E5DF] mb-8 flex items-center justify-between">
//             <div>
//               <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Exchange Valuation</span>
//               <span className="font-serif text-3xl font-medium text-[#1A1A1A]">{item.swapValuePoints} PTS</span>
//             </div>
//             <div className="text-right">
//               <span className="text-xs uppercase tracking-widest text-[#736E65] block font-medium">Est. Value ({formatCurrency(item.estimatedValueUSD).slice(0,1)})</span>
//               <span className="text-base font-mono text-[#1A1A1A] font-bold">{formatCurrency(item.estimatedValueUSD)}</span>
//             </div>
//           </div>

//           {/* Specifications Table */}
//           <div className="space-y-3.5 py-5 border-y border-[#E8E5DF] text-xs sm:text-sm mb-8">
//             <div className="flex justify-between">
//               <span className="text-[#908B82] uppercase tracking-wider">Category</span>
//               <span className="text-[#1A1A1A] font-medium">{item.category}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-[#908B82] uppercase tracking-wider">Size</span>
//               <span className="text-[#1A1A1A] font-medium">{item.size}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-[#908B82] uppercase tracking-wider">Condition</span>
//               <span className="text-[#1A1A1A] font-medium">{item.condition}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-[#908B82] uppercase tracking-wider">Location</span>
//               <span className="text-[#1A1A1A] font-medium">{item.location}</span>
//             </div>
//           </div>

//           {/* Description & Provenance */}
//           <div className="space-y-5 mb-8">
//             <div>
//               <h4 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-1.5 font-semibold">Editor's Notes</h4>
//               <p className="text-xs sm:text-sm text-[#4A4741] font-light leading-relaxed">{item.description}</p>
//             </div>
//             <div>
//               <h4 className="text-xs sm:text-sm uppercase tracking-widest text-[#908B82] mb-1.5 font-semibold">Garment Provenance</h4>
//               <p className="text-xs sm:text-sm text-[#4A4741] font-light leading-relaxed bg-[#F4F1EA] p-4 border border-[#E8E5DF]">
//                 {item.provenance}
//               </p>
//             </div>
//           </div>

//           {/* Owner Profile Card */}
//           <div className="flex items-center gap-4 p-4 border border-[#E8E5DF] mb-8 bg-[#FDFBF7]">
//             <img src={item.owner.avatar} className="w-11 h-11 rounded-full object-cover" />
//             <div className="flex-1">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-serif font-medium">{item.owner.name}</span>
//                 <span className="text-xs font-mono text-[#908B82]">★ {item.owner.rating}</span>
//               </div>
//               <p className="text-xs text-[#736E65] uppercase tracking-wider">{item.owner.swapsCompleted} Successful Exchanges</p>
//             </div>
//           </div>

//           {/* Action CTAs */}
//           <div className="space-y-3.5">
//             <button 
//               onClick={onSwap}
//               className="w-full py-4 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors flex items-center justify-center gap-2 font-medium"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Propose Wardrobe Swap</span>
//             </button>

//             <button 
//               onClick={onContact}
//               className="w-full py-4 bg-white border border-[#E8E5DF] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:border-[#1A1A1A] transition-colors flex items-center justify-center gap-2 font-medium"
//             >
//               <MessageSquare className="w-4 h-4" />
//               <span>Message Owner Directly</span>
//             </button>
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// function ValueCalculatorPage({ 
//   calcBrand, setCalcBrand, calcCategory, setCalcCategory, 
//   calcCondition, setCalcCondition, calcRetailUSD, setCalcRetailUSD, 
//   estimatedResultUSD, calculateValue, onListNow, formatCurrency, currentCurrency
// }) {
//   return (
//     <div className="max-w-4xl mx-auto px-6 py-16">
      
//       <div className="text-center mb-12">
//         <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Algorithmic Precision</span>
//         <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-tight text-[#1A1A1A] mt-1">Instant Valuation Engine</h1>
//         <p className="text-sm text-[#736E65] mt-2 font-light max-w-lg mx-auto">
//           Assess the swap point value of your luxury apparel piece based on secondary market demand and garment preservation grade.
//         </p>
//       </div>

//       <div className="bg-white border border-[#E8E5DF] p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-sm">
        
//         {/* Form Controls */}
//         <div className="space-y-6">
          
//           <div>
//             <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Designer Brand</label>
//             <select 
//               value={calcBrand}
//               onChange={(e) => setCalcBrand(e.target.value)}
//               className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
//             >
//               <option value="Totême">Totême</option>
//               <option value="Maison Margiela">Maison Margiela</option>
//               <option value="Acne Studios">Acne Studios</option>
//               <option value="Burberry">Burberry</option>
//               <option value="Lemaire">Lemaire</option>
//               <option value="Reformation">Reformation</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Apparel Category</label>
//             <select 
//               value={calcCategory}
//               onChange={(e) => setCalcCategory(e.target.value)}
//               className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
//             >
//               <option value="Outerwear">Outerwear & Coats</option>
//               <option value="Tops">Tops & Shirts</option>
//               <option value="Bags">Designer Bags</option>
//               <option value="Dresses">Dresses</option>
//               <option value="Knitwear">Knitwear</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Condition Grade</label>
//             <select 
//               value={calcCondition}
//               onChange={(e) => setCalcCondition(e.target.value)}
//               className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
//             >
//               <option value="Pristine">Pristine (New / Unworn with Tags)</option>
//               <option value="Excellent">Excellent (Minor Wear / Worn 1-2 times)</option>
//               <option value="Very Good">Very Good (Gentle Wear / Fully Cared For)</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-xs uppercase tracking-wider text-[#908B82] block mb-2 font-medium">Original Retail Price ($ USD Base)</label>
//             <input 
//               type="number" 
//               value={calcRetailUSD}
//               onChange={(e) => setCalcRetailUSD(e.target.value)}
//               placeholder="e.g. 950" 
//               className="w-full p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
//             />
//           </div>

//           <button 
//             onClick={calculateValue}
//             className="w-full py-3.5 bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] transition-colors font-medium"
//           >
//             Calculate Point Value
//           </button>

//         </div>

//         {/* Valuation Result Panel */}
//         <div className="bg-[#F4F1EA] p-8 border border-[#E8E5DF] text-center flex flex-col justify-between h-full">
//           <div>
//             <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Estimated Swap Power</span>
//             <div className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] my-5">{estimatedResultUSD} <span className="text-2xl font-sans">PTS</span></div>
            
//             <div className="p-3 bg-white border border-[#E8E5DF] inline-block w-full mb-3 font-mono text-sm">
//               Converted Market Value: <strong className="text-[#1A1A1A]">{formatCurrency(estimatedResultUSD)}</strong> ({currentCurrency})
//             </div>

//             <p className="text-xs sm:text-sm text-[#736E65] font-light leading-relaxed">
//               This garment qualifies for Tier-A luxury exchange matching with zero platform cash commissions.
//             </p>
//           </div>

//           <div className="mt-8 pt-6 border-t border-[#E8E5DF]">
//             <button 
//               onClick={onListNow}
//               className="w-full py-3.5 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs sm:text-sm uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all font-medium"
//             >
//               Add To My Wardrobe
//             </button>
//           </div>
//         </div>

//       </div>

//     </div>
//   );
// }

// function MyClosetDashboard({ closet, onNavigateExplore, formatCurrency }) {
//   return (
//     <div className="max-w-7xl mx-auto px-6 py-12">
      
//       {/* Profile Banner */}
//       <div className="bg-white border border-[#E8E5DF] p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
//         <div className="flex items-center gap-6">
//           <img 
//             src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
//             alt="User Avatar" 
//             className="w-20 h-20 rounded-full object-cover border border-[#E8E5DF]"
//           />
//           <div>
//             <div className="flex items-center gap-3">
//               <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1A1A]">Alexandra Vance</h1>
//               <span className="bg-[#F4F1EA] text-[#1A1A1A] text-xs px-2.5 py-1 border border-[#E8E5DF] uppercase tracking-widest font-mono">Verified Collector</span>
//             </div>
//             <p className="text-xs sm:text-sm text-[#736E65] font-light mt-1">Paris, France &bull; Member since October 2024</p>
//           </div>
//         </div>

//         <div className="flex gap-8 border-t md:border-t-0 md:border-l border-[#E8E5DF] pt-4 md:pt-0 md:pl-8 text-center">
//           <div>
//             <span className="font-serif text-3xl text-[#1A1A1A]">1,280</span>
//             <p className="text-xs uppercase tracking-widest text-[#908B82] mt-1 font-medium">Available PTS</p>
//             <p className="text-xs font-mono text-[#1A1A1A] font-semibold">({formatCurrency(1280)})</p>
//           </div>
//           <div>
//             <span className="font-serif text-3xl text-[#1A1A1A]">12</span>
//             <p className="text-xs uppercase tracking-widest text-[#908B82] mt-1 font-medium">Active Swaps</p>
//           </div>
//         </div>
//       </div>

//       {/* Wardrobe Items Grid */}
//       <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
//         <h2 className="font-serif text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1A1A]">My Wardrobe Items</h2>
//         <button className="px-5 py-2.5 bg-[#1A1A1A] text-white text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] flex items-center gap-2 font-medium">
//           <Plus className="w-4 h-4" />
//           <span>Add New Piece</span>
//         </button>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//         {closet.map((item) => (
//           <div key={item.id} className="bg-white border border-[#E8E5DF] p-5 flex gap-5 shadow-sm">
//             <img src={item.image} alt={item.title} className="w-28 h-36 object-cover border border-[#E8E5DF]" />
//             <div className="flex-1 flex flex-col justify-between">
//               <div>
//                 <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">{item.brand}</span>
//                 <h4 className="font-serif text-base font-medium text-[#1A1A1A] line-clamp-1 mt-0.5">{item.title}</h4>
//                 <p className="text-sm font-mono text-[#1A1A1A] font-bold mt-1.5">{item.swapValuePoints} PTS</p>
//                 <p className="text-xs font-mono text-[#736E65]">{formatCurrency(item.estimatedValueUSD)}</p>
//               </div>

//               <div className="flex items-center justify-between pt-3 border-t border-[#F4F1EA]">
//                 <span className="text-xs uppercase text-[#736E65]">{item.condition}</span>
//                 <span className="text-xs text-[#C5A880] uppercase tracking-widest font-semibold">Available</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }

// function MessagesPage({ initialThread, formatCurrency }) {
//   const [messages, setMessages] = useState([
//     { id: 1, sender: 'them', text: 'Hello! I saw your proposal for the Totême Trench Coat. Is the wool blend heavyweight?', time: '10:14 AM' },
//     { id: 2, sender: 'me', text: 'Yes, absolutely. It was tailored for autumn/winter and comes with the original boutique garment bag.', time: '10:16 AM' }
//   ]);
//   const [inputText, setInputText] = useState('');

//   const handleSend = () => {
//     if (!inputText.trim()) return;
//     setMessages([...messages, { id: Date.now(), sender: 'me', text: inputText, time: 'Just now' }]);
//     setInputText('');
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-12">
//       <div className="bg-white border border-[#E8E5DF] h-[680px] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
        
//         {/* Left Thread List */}
//         <div className="md:col-span-4 border-r border-[#E8E5DF] bg-[#FDFBF7]">
//           <div className="p-5 border-b border-[#E8E5DF]">
//             <h3 className="font-serif text-xl uppercase tracking-tight">Active Negotiations</h3>
//           </div>

//           <div className="divide-y divide-[#E8E5DF]">
//             <div className="p-5 bg-white border-l-2 border-[#1A1A1A] cursor-pointer">
//               <div className="flex items-center justify-between mb-1">
//                 <span className="font-serif text-sm font-medium">Camille Laurent</span>
//                 <span className="text-xs text-[#908B82]">10:16 AM</span>
//               </div>
//               <p className="text-xs sm:text-sm text-[#736E65] line-clamp-1">Totême Wool Trench Coat Exchange</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Active Chat Panel */}
//         <div className="md:col-span-8 flex flex-col justify-between bg-white">
          
//           <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between bg-[#FDFBF7]">
//             <div className="flex items-center gap-3">
//               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" className="w-9 h-9 rounded-full object-cover" />
//               <div>
//                 <h4 className="font-serif text-sm font-medium">Camille Laurent</h4>
//                 <p className="text-xs text-[#908B82] uppercase tracking-wider">Exchange Value: 890 PTS ({formatCurrency(890)})</p>
//               </div>
//             </div>
//             <button className="text-xs sm:text-sm uppercase tracking-widest px-4 py-2 border border-[#E8E5DF] hover:border-[#1A1A1A] font-medium">
//               Finalize Terms
//             </button>
//           </div>

//           <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAF8F5]">
//             {messages.map((m) => (
//               <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
//                 <div className={`max-w-md p-4 text-xs sm:text-sm leading-relaxed ${
//                   m.sender === 'me' 
//                     ? 'bg-[#1A1A1A] text-white' 
//                     : 'bg-white border border-[#E8E5DF] text-[#1A1A1A]'
//                 }`}>
//                   <p>{m.text}</p>
//                   <span className={`text-[10px] block mt-2 text-right ${m.sender === 'me' ? 'text-[#B8B2A6]' : 'text-[#908B82]'}`}>
//                     {m.time}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="p-4 border-t border-[#E8E5DF] flex gap-3 bg-white">
//             <input 
//               type="text" 
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Type your message or shipping proposal..." 
//               className="flex-1 p-3 bg-[#FDFBF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
//             />
//             <button 
//               onClick={handleSend}
//               className="px-6 py-3 bg-[#1A1A1A] text-white text-xs sm:text-sm uppercase tracking-widest hover:bg-[#333] font-medium"
//             >
//               Send
//             </button>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

// function AdminDashboard({ formatCurrency }) {
//   return (
//     <div className="max-w-7xl mx-auto px-6 py-12">
      
//       <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
//         <div>
//           <span className="text-xs uppercase tracking-widest text-[#908B82] font-semibold">Platform Governance</span>
//           <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1A1A]">Curations Moderation</h1>
//         </div>
//         <span className="text-xs font-mono bg-[#F4F1EA] px-3.5 py-1.5 border border-[#E8E5DF]">System Status: Operational</span>
//       </div>

//       {/* Admin Metrics Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white p-6 border border-[#E8E5DF]">
//           <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Pending Verifications</span>
//           <span className="font-serif text-4xl text-[#1A1A1A] block my-2">18</span>
//           <span className="text-xs text-[#C5A880]">Requires Authenticator Approval</span>
//         </div>
//         <div className="bg-white p-6 border border-[#E8E5DF]">
//           <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Total Swaps Completed</span>
//           <span className="font-serif text-4xl text-[#1A1A1A] block my-2">1,420</span>
//           <span className="text-xs text-[#736E65]">+14% this month</span>
//         </div>
//         <div className="bg-white p-6 border border-[#E8E5DF]">
//           <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Platform Swap Volume</span>
//           <span className="font-serif text-4xl text-[#1A1A1A] block my-2">890K PTS</span>
//           <span className="text-xs font-mono text-[#736E65]">Valued at {formatCurrency(890000)}</span>
//         </div>
//         <div className="bg-white p-6 border border-[#E8E5DF]">
//           <span className="text-xs uppercase tracking-widest text-[#908B82] block font-medium">Dispute Index</span>
//           <span className="font-serif text-4xl text-[#1A1A1A] block my-2">0.02%</span>
//           <span className="text-xs text-[#736E65]">Museum-grade compliance</span>
//         </div>
//       </div>

//       {/* Moderation Queue */}
//       <div className="bg-white border border-[#E8E5DF]">
//         <div className="p-5 border-b border-[#E8E5DF] bg-[#FDFBF7]">
//           <h3 className="font-serif text-xl uppercase tracking-tight">Recent Garment Intake Queue</h3>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs sm:text-sm">
//             <thead className="bg-[#F4F1EA] text-[#736E65] uppercase tracking-wider text-xs border-b border-[#E8E5DF]">
//               <tr>
//                 <th className="p-4 font-medium">Garment Title</th>
//                 <th className="p-4 font-medium">Brand</th>
//                 <th className="p-4 font-medium">Owner</th>
//                 <th className="p-4 font-medium">Assigned Points</th>
//                 <th className="p-4 font-medium">Converted Value</th>
//                 <th className="p-4 font-medium">Status</th>
//                 <th className="p-4 font-medium text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-[#E8E5DF]">
//               <tr>
//                 <td className="p-4 font-serif font-medium">Vintage Leather Trench</td>
//                 <td className="p-4">Bottega Veneta</td>
//                 <td className="p-4">Soren K.</td>
//                 <td className="p-4 font-mono font-bold">1,120 PTS</td>
//                 <td className="p-4 font-mono text-[#736E65]">{formatCurrency(1120)}</td>
//                 <td className="p-4"><span className="text-xs uppercase tracking-wider bg-[#FAF8F5] px-2.5 py-1 border border-[#E8E5DF] text-[#C5A880]">Pending Scan</span></td>
//                 <td className="p-4 text-right"><button className="text-xs uppercase tracking-widest underline font-medium">Inspect</button></td>
//               </tr>
//               <tr>
//                 <td className="p-4 font-serif font-medium">Asymmetric Wool Skirt</td>
//                 <td className="p-4">Jil Sander</td>
//                 <td className="p-4">Claire M.</td>
//                 <td className="p-4 font-mono font-bold">480 PTS</td>
//                 <td className="p-4 font-mono text-[#736E65]">{formatCurrency(480)}</td>
//                 <td className="p-4"><span className="text-xs uppercase tracking-wider bg-[#FAF8F5] px-2.5 py-1 border border-[#E8E5DF] text-[#1A1A1A]">Verified</span></td>
//                 <td className="p-4 text-right"><button className="text-xs uppercase tracking-widest underline font-medium">Inspect</button></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// }// import { Link, Navigate, Route, Routes } from 'react-router-dom';
// import { useAuth } from './AuthContext.jsx';
// import Login from './pages/Login.jsx';
// import Listings from './pages/Listings.jsx';
// import ItemDetail from './pages/ItemDetail.jsx';
// import SwapRequest from './pages/SwapRequest.jsx';
// import Chat from './pages/Chat.jsx';
// import Dashboard from './pages/Dashboard.jsx';
// import Admin from './pages/Admin.jsx';

// function Protected({ children, admin = false }) {
//   const { user, loading } = useAuth();
//   if (loading) return <p className="muted">Loading…</p>;
//   if (!user) return <Navigate to="/login" replace />;
//   if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
//   return children;
// }

// export default function App() {
//   const { user, logout } = useAuth();
//   return (
//     <>
//       <header className="topbar">
//         <Link to="/" className="brand">ClosetShuffle</Link>
//         <nav>
//           <Link to="/">Browse</Link>
//           {user && <Link to="/dashboard">My swaps</Link>}
//           {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
//           {user ? <button className="link" onClick={logout}>Log out</button> : <Link to="/login">Log in</Link>}
//         </nav>
//       </header>
//       <main className="page">
//         <Routes>
//           <Route path="/" element={<Listings />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/items/:id" element={<ItemDetail />} />
//           <Route path="/swap/new" element={<Protected><SwapRequest /></Protected>} />
//           <Route path="/swaps/:id/chat" element={<Protected><Chat /></Protected>} />
//           <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
//           <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
//           <Route path="*" element={<p>Page not found.</p>} />
//         </Routes>
//       </main>
//     </>
//   );
// }
