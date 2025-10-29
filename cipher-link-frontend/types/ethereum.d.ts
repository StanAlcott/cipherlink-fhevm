// Ethereum provider types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isConnected?: () => boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      removeAllListeners?: (event?: string) => void;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      _metamask?: {
        isUnlocked?: () => Promise<boolean>;
      };
    };
  }
}

export {};
