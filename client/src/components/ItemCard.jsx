import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCurrency } from '../currency.jsx';
import { ItemImage, StatusPill, formatEstimate } from '../ui.jsx';

export default function ItemCard({ item }) {
  const [currency] = useCurrency();
  return (
    <div className="group bg-white border border-[#E8E5DF] hover:border-[#1A1A1A] transition-all duration-300 flex flex-col justify-between">
      <Link to={`/items/${item.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#F4F1EA] block">
        <ItemImage item={item} className="group-hover:scale-105 transition-transform duration-500 ease-out" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest text-[#1A1A1A] border border-[#E8E5DF] font-medium">
          {item.brand || item.category}
        </div>
        <div className="absolute bottom-3 right-3 bg-[#1A1A1A] text-white px-3 py-1.5 text-xs sm:text-sm font-mono flex items-center gap-1.5">
          <span>{item.estimatedValue} PTS</span>
          <span className="text-[#B8B2A6] border-l border-[#444] pl-1.5">({formatEstimate(item.estimatedValue, currency)})</span>
        </div>
        {item.status && item.status !== 'AVAILABLE' && (
          <div className="absolute top-3 right-3"><StatusPill status={item.status} /></div>
        )}
      </Link>

      <div className="p-6 flex-1 flex flex-col justify-between border-t border-[#E8E5DF]">
        <div>
          <div className="flex items-center justify-between text-xs text-[#908B82] uppercase tracking-wider mb-1.5 font-medium">
            <span>{item.category}</span>
            <span>Size {item.size}</span>
          </div>
          <Link to={`/items/${item.id}`}>
            <h3 className="font-serif text-lg text-[#1A1A1A] hover:underline line-clamp-1 mb-2">{item.title}</h3>
          </Link>
          {item.description && <p className="text-xs sm:text-sm text-[#736E65] line-clamp-2 font-light leading-relaxed mb-5">{item.description}</p>}
        </div>

        <div className="pt-4 border-t border-[#F4F1EA] flex items-center justify-between">
          <span className="text-xs sm:text-sm text-[#4A4741] font-medium truncate">
            {item.distanceKm != null ? `${item.distanceKm} km away` : item.condition}
          </span>
          <Link to={`/items/${item.id}`} className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-[#1A1A1A] hover:text-[#C5A880] transition-colors flex items-center gap-1 shrink-0">
            Details <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
