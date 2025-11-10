'use client'
import { createContext, useContext, useMemo } from 'react';
import { useUtils } from './useUtils';
import Loading from '@/Components/Loader/Loading';

type AppContextValue = {
  utils: ReturnType<typeof useUtils>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const utils = useUtils()

  const value = useMemo(
    () => ({ 
      utils,
      Loading
    }),
    [
      utils
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