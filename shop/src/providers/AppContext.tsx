'use client'
import { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { useUtils } from './useUtils';
import { useAuth } from './useAuth';
import useCart from './useCart';

type AppContextValue = {
  utils: ReturnType<typeof useUtils>;
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const utils = useUtils()
  const auth = useAuth()
  const cart = useCart(utils.baseUrl, auth.state.token)
  const value = useMemo(
    () => ({ 
      utils,
      auth,
      cart,
    }),
    [
      utils,
      auth,
      cart
    ]
  );

  const syncRef = useRef(cart.syncWithServer)
  useEffect(() => { syncRef.current = cart.syncWithServer }, [cart.syncWithServer])
  useEffect(() => {
    const token = auth.state.token
    if (!token) return
    syncRef.current(utils.baseUrl, token)
  }, [auth.state.token, utils.baseUrl])

  return <AppContext.Provider value={value}>{
    children
  }</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
}

export { AppContext };
