/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import "@mantine/dates/styles.css"
import { MantineProvider, ColorSchemeScript, useMantineColorScheme } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import App from '@/App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppContextProvider } from '@/Context/AppContext'
import { theme } from '@/theme'
import { BrowserRouter } from 'react-router-dom'

function PrimaryColorProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  return (
    <MantineProvider theme={{ ...theme, primaryColor: colorScheme === 'dark' ? 'rose' : 'rose' }}>
      {children}
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <PrimaryColorProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <BrowserRouter>
            <QueryClientProvider client={new QueryClient()}>
              <AppContextProvider>
                <App />
              </AppContextProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </ModalsProvider>
      </PrimaryColorProvider>
    </MantineProvider>
  </StrictMode>,
)
