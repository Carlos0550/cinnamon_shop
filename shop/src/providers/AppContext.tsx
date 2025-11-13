'use client'
import { createContext, useContext, useMemo } from 'react';
import { useUtils } from './useUtils';
import { useAuth } from './useAuth';

type AppContextValue = {
  utils: ReturnType<typeof useUtils>;
  auth: ReturnType<typeof useAuth>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const utils = useUtils()
  const auth = useAuth()
  
  const value = useMemo(
    () => ({ 
      utils,
      auth,
    }),
    [
      utils,
      auth
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