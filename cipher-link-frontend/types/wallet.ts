// EIP-6963 Provider types
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any; // ethers provider
}

// Wallet connection state
export interface WalletConnectionState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: any | null; // BrowserProvider instance
  rawProvider: any | null; // Original EIP-1193 provider
  connectorId: string | null;
  signer: any | null;
}

// Wallet connection events
export type WalletEventType = 
  | 'accountsChanged'
  | 'chainChanged' 
  | 'connect'
  | 'disconnect';

export interface WalletEventHandler {
  (event: WalletEventType, data?: any): void;
}

// Persisted wallet data
export interface PersistedWalletData {
  connected: boolean;
  lastConnectorId: string;
  lastAccounts: string[];
  lastChainId: number;
  timestamp: number;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Wallet connection options
export interface WalletConnectOptions {
  autoConnect?: boolean;
  showRequestAccountsOnLoad?: boolean;
  persistConnection?: boolean;
}

// Wallet connection result
export interface WalletConnectResult {
  success: boolean;
  account?: string;
  chainId?: number;
  error?: Error;
}

// Network switch result  
export interface NetworkSwitchResult {
  success: boolean;
  chainId?: number;
  error?: Error;
}
