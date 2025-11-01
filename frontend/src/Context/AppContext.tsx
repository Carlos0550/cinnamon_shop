/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { useUtils } from './useUtils';
import { useAuth } from './useAuth';
import Loading from '@/components/Loader/Loading';

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
      auth
    }),
    [
      utils,
      auth
    ]
  );

  return <AppContext.Provider value={value}>{
    auth.loading ? <Loading/> : children
  }</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
}

export { AppContext };