/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

type User = { id: string; name: string } | null;

type AppContextValue = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  apiBaseUrl: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  const value = useMemo(
    () => ({ 
        user, 
        setUser, 
        loading, 
        setLoading, 
        apiBaseUrl
    }),
    [
        user, 
        loading, 
        apiBaseUrl
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
}

export { AppContext };