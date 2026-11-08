import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const timer = useRef();
  const toast = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current);
    setCurrent({ message, tone });
    timer.current = setTimeout(() => setCurrent(null), 3800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {current && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] max-w-sm bg-[#1A1A1A] text-[#FDFBF7] px-5 py-3.5 shadow-2xl flex items-center gap-3 animate-pop border-l-2 ${
            current.tone === 'error' ? 'border-[#C0392B]' : 'border-[#C5A880]'
          }`}
        >
          {current.tone === 'error'
            ? <AlertCircle className="w-5 h-5 text-[#E8837A] flex-shrink-0" aria-hidden="true" />
            : <CheckCircle2 className="w-5 h-5 text-[#C5A880] flex-shrink-0" aria-hidden="true" />}
          <span className="text-xs font-medium tracking-wide">{current.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
