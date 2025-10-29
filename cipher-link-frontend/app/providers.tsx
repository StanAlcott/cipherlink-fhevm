"use client";

import { createContext, useContext, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

// Global app context (can be extended with theme, settings, etc.)
interface AppContextType {
  // Future: theme, user preferences, etc.
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const value: AppContextType = {
    // Initialize context values here
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(248, 250, 252, 0.95)',
            color: '#0f172a',
            border: '1px solid rgba(226, 232, 240, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AppContext.Provider>
  );
}
