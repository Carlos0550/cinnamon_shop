'use client'
import { createContext, useContext, useMemo } from 'react';
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
  const cart = useCart()
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