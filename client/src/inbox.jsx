import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken } from './api.js';
import { useAuth } from './AuthContext.jsx';

const InboxContext = createContext(null);
export const useInbox = () => useContext(InboxContext);

// Keeps the signed-in user's swaps in one place: header badge, drawer and dashboard all read from it.
export function InboxProvider({ children }) {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) return setSwaps([]);
    try {
      const data = await api('/api/swaps');
      setSwaps(data.swaps);
    } catch {
      /* keep the previous list if the request fails */
    }
  }, []);

  useEffect(() => {
    if (!user) return setSwaps([]);
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [user, refresh]);

  const pendingIncoming = user
    ? swaps.filter((s) => s.status === 'PENDING' && s.targetOwnerId === user.id).length
    : 0;

  return (
    <InboxContext.Provider value={{ swaps, refresh, open, setOpen, pendingIncoming }}>
      {children}
    </InboxContext.Provider>
  );
}
