"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useEip6963 } from "./useEip6963";
import { STORAGE_KEYS, SEPOLIA_CHAIN_ID, LOCALHOST_CHAIN_ID } from "../fhevm/constants";
import type {
  WalletConnectionState,
  WalletEventHandler,
  PersistedWalletData,
  WalletConnectOptions,
  WalletConnectResult,
  NetworkSwitchResult,
  EIP6963ProviderDetail,
} from "../types/wallet";

const SUPPORTED_CHAIN_IDS = [SEPOLIA_CHAIN_ID, LOCALHOST_CHAIN_ID];

export function useWallet(options: WalletConnectOptions = {}) {
  const { 
    autoConnect = true, 
    showRequestAccountsOnLoad = false,
    persistConnection = true 
  } = options;

  const { providers, isLoading: providersLoading } = useEip6963();
  const [walletState, setWalletState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    provider: null,
    rawProvider: null,
    connectorId: null,
    signer: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const eventHandlers = useRef<WalletEventHandler[]>([]);
  const hasAutoConnected = useRef(false);

  // Utility functions for localStorage
  const getPersistedData = useCallback((): PersistedWalletData | null => {
    if (typeof window === "undefined") return null;
    try {
      const connected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === "true";
      const lastConnectorId = localStorage.getItem(STORAGE_KEYS.WALLET_LAST_CONNECTOR_ID);
      const lastAccounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLET_LAST_ACCOUNTS) || "[]");
      const lastChainId = parseInt(localStorage.getItem(STORAGE_KEYS.WALLET_LAST_CHAIN_ID) || "0");

      if (!connected || !lastConnectorId || lastAccounts.length === 0) {
        return null;
      }

      return {
        connected,
        lastConnectorId,
        lastAccounts,
        lastChainId,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[Wallet] Error reading persisted data:", error);
      return null;
    }
  }, []);

  const persistWalletData = useCallback((data: Partial<PersistedWalletData>) => {
    if (!persistConnection || typeof window === "undefined") return;
    
    try {
      if (data.connected !== undefined) {
        localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, String(data.connected));
      }
      if (data.lastConnectorId) {
        localStorage.setItem(STORAGE_KEYS.WALLET_LAST_CONNECTOR_ID, data.lastConnectorId);
      }
      if (data.lastAccounts) {
        localStorage.setItem(STORAGE_KEYS.WALLET_LAST_ACCOUNTS, JSON.stringify(data.lastAccounts));
      }
      if (data.lastChainId) {
        localStorage.setItem(STORAGE_KEYS.WALLET_LAST_CHAIN_ID, String(data.lastChainId));
      }
    } catch (error) {
      console.error("[Wallet] Error persisting data:", error);
    }
  }, [persistConnection]);

  const clearPersistedData = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        if (key.startsWith("wallet.") || key.startsWith("fhevm.decryptionSignature.")) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("[Wallet] Error clearing persisted data:", error);
    }
  }, []);

  // Event emission helper
  const emitEvent = useCallback((eventType: string, data?: any) => {
    eventHandlers.current.forEach(handler => {
      try {
        handler(eventType as any, data);
      } catch (error) {
        console.error("[Wallet] Event handler error:", error);
      }
    });
  }, []);

  // Update wallet state helper
  const updateWalletState = useCallback(async (
    provider: any,
    connectorId: string,
    showError = true
  ) => {
    try {
      setConnectionError(null);
      
      const ethProvider = new BrowserProvider(provider);
      const accounts = await provider.request({ method: "eth_accounts" });
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const signer = await ethProvider.getSigner();
      const account = accounts[0];

      const newState: WalletConnectionState = {
        isConnected: true,
        account,
        chainId,
        provider: ethProvider,
        rawProvider: provider, // Store the original EIP-1193 provider
        connectorId,
        signer,
      };

      setWalletState(newState);

      // Persist connection data
      persistWalletData({
        connected: true,
        lastConnectorId: connectorId,
        lastAccounts: accounts,
        lastChainId: chainId,
      });

      emitEvent('connect', { account, chainId });
      
      return { success: true, account, chainId };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (showError) {
        setConnectionError(err);
      }
      console.error("[Wallet] Update state error:", err);
      return { success: false, error: err };
    }
  }, [persistWalletData, emitEvent]);

  // Connect to specific provider
  const connectWallet = useCallback(async (
    providerDetail: EIP6963ProviderDetail,
    requestAccounts = true
  ): Promise<WalletConnectResult> => {
    if (isConnecting) {
      return { success: false, error: new Error("Connection already in progress") };
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const { provider } = providerDetail;
      
      // Request account access if needed
      if (requestAccounts) {
        await provider.request({ method: "eth_requestAccounts" });
      }

      const result = await updateWalletState(provider, providerDetail.info.uuid);
      
      if (result.success) {
        console.log(`[Wallet] Connected to ${providerDetail.info.name}`);
      }
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setConnectionError(err);
      console.error("[Wallet] Connect error:", err);
      return { success: false, error: err };
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, updateWalletState]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      account: null,
      chainId: null,
      provider: null,
      rawProvider: null,
      connectorId: null,
      signer: null,
    });

    clearPersistedData();
    emitEvent('disconnect');
    console.log("[Wallet] Disconnected");
  }, [clearPersistedData, emitEvent]);

  // Auto-reconnect on page load
  const autoReconnect = useCallback(async () => {
    if (hasAutoConnected.current || !autoConnect || providersLoading) {
      return;
    }

    hasAutoConnected.current = true;
    const persistedData = getPersistedData();
    
    if (!persistedData || !persistedData.connected) {
      console.log("[Wallet] No persisted connection data found");
      return;
    }

    console.log("[Wallet] Found persisted data:", persistedData);

    // Find the previously connected provider
    // First try exact UUID match
    let lastProvider = providers.find(p => p.info.uuid === persistedData.lastConnectorId);
    
    // If not found, try to match by name (for MetaMask)
    if (!lastProvider) {
      console.log("[Wallet] Exact UUID match failed, trying name match");
      lastProvider = providers.find(p => 
        p.info.name.toLowerCase().includes('metamask') && 
        persistedData.lastConnectorId.includes('metamask')
      );
    }
    
    // If still not found, try any MetaMask provider
    if (!lastProvider) {
      console.log("[Wallet] Name match failed, trying any MetaMask provider");
      lastProvider = providers.find(p => p.info.name.toLowerCase().includes('metamask'));
    }
    
    if (!lastProvider) {
      console.log("[Wallet] Previously connected provider not found, clearing persisted data");
      console.log("[Wallet] Available providers:", providers.map(p => ({ name: p.info.name, uuid: p.info.uuid })));
      console.log("[Wallet] Looking for UUID:", persistedData.lastConnectorId);
      clearPersistedData();
      return;
    }

    console.log(`[Wallet] Auto-reconnecting to ${lastProvider.info.name}`);
    
    try {
      // Check if provider is still available and has accounts
      const accounts = await lastProvider.provider.request({ method: "eth_accounts" });
      
      if (accounts.length === 0) {
        console.log("[Wallet] No accounts found in provider, clearing persisted data");
        clearPersistedData();
        return;
      }

      // Check if the persisted account is still available
      const persistedAccount = persistedData.lastAccounts[0];
      if (!accounts.includes(persistedAccount)) {
        console.log("[Wallet] Persisted account not found in provider, clearing persisted data");
        console.log("[Wallet] Persisted account:", persistedAccount);
        console.log("[Wallet] Available accounts:", accounts);
        clearPersistedData();
        return;
      }

      // Attempt silent reconnection (no eth_requestAccounts)
      const result = await connectWallet(lastProvider, false);
      
      if (!result.success) {
        console.log("[Wallet] Auto-reconnect failed, clearing persisted data");
        clearPersistedData();
      } else {
        console.log("[Wallet] Auto-reconnect successful");
      }
    } catch (error) {
      console.error("[Wallet] Auto-reconnect error:", error);
      clearPersistedData();
    }
  }, [autoConnect, providersLoading, providers, getPersistedData, connectWallet, clearPersistedData]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number): Promise<NetworkSwitchResult> => {
    if (!walletState.provider || !walletState.isConnected) {
      return { success: false, error: new Error("Wallet not connected") };
    }

    try {
      const chainIdHex = `0x${chainId.toString(16)}`;
      
      await walletState.provider.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });

      return { success: true, chainId };
    } catch (error: any) {
      console.error("[Wallet] Network switch error:", error);
      
      // Handle user rejection
      if (error?.code === 4001) {
        return { success: false, error: new Error("User rejected network switch") };
      }
      
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }, [walletState]);

  // Check if network is supported
  const isNetworkSupported = useCallback((chainId: number): boolean => {
    return SUPPORTED_CHAIN_IDS.includes(chainId);
  }, []);

  // Event listeners setup
  useEffect(() => {
    if (!walletState.rawProvider) return;

    // Use the stored raw provider (original EIP-1193 provider)
    const rawProvider = walletState.rawProvider;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[Wallet] Accounts changed:", accounts);
      
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== walletState.account) {
        // Account changed, update state
        updateWalletState(rawProvider, walletState.connectorId || '', false);
      }
      
      emitEvent('accountsChanged', accounts);
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      console.log("[Wallet] Chain changed:", chainId);
      
      setWalletState(prev => ({ ...prev, chainId }));
      persistWalletData({ lastChainId: chainId });
      emitEvent('chainChanged', chainId);
    };

    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log("[Wallet] Provider connected:", connectInfo);
      emitEvent('connect', connectInfo);
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log("[Wallet] Provider disconnected:", error);
      disconnectWallet();
    };

    // Add event listeners using the raw provider directly (not through ethers BrowserProvider)
    // ethers.js v6 BrowserProvider doesn't support EIP-1193 event subscription
    try {
      rawProvider.on("accountsChanged", handleAccountsChanged);
      rawProvider.on("chainChanged", handleChainChanged);
      rawProvider.on("connect", handleConnect);
      rawProvider.on("disconnect", handleDisconnect);
    } catch (error) {
      console.error("[Wallet] Error setting up event listeners:", error);
      // Fallback: try using window.ethereum if available
      if (typeof window !== 'undefined' && window.ethereum && window.ethereum === rawProvider) {
        console.log("[Wallet] Using window.ethereum as fallback for event listeners");
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
        window.ethereum.on("connect", handleConnect);
        window.ethereum.on("disconnect", handleDisconnect);
      }
    }

    // Cleanup
    return () => {
      try {
        rawProvider.removeListener("accountsChanged", handleAccountsChanged);
        rawProvider.removeListener("chainChanged", handleChainChanged);
        rawProvider.removeListener("connect", handleConnect);
        rawProvider.removeListener("disconnect", handleDisconnect);
      } catch (error) {
        console.error("[Wallet] Error removing event listeners:", error);
        // Fallback cleanup
        if (typeof window !== 'undefined' && window.ethereum && window.ethereum === rawProvider) {
          try {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
            window.ethereum.removeListener("connect", handleConnect);
            window.ethereum.removeListener("disconnect", handleDisconnect);
          } catch (fallbackError) {
            console.error("[Wallet] Error in fallback cleanup:", fallbackError);
          }
        }
      }
    };
  }, [walletState.rawProvider, walletState.account, walletState.connectorId, updateWalletState, disconnectWallet, persistWalletData, emitEvent]);

  // Auto-reconnect trigger
  useEffect(() => {
    if (!providersLoading && providers.length > 0) {
      autoReconnect();
    }
  }, [providersLoading, providers, autoReconnect]);

  // Event handler registration
  const addEventListener = useCallback((handler: WalletEventHandler) => {
    eventHandlers.current.push(handler);
    
    // Return cleanup function
    return () => {
      const index = eventHandlers.current.indexOf(handler);
      if (index > -1) {
        eventHandlers.current.splice(index, 1);
      }
    };
  }, []);

  return {
    // State
    ...walletState,
    isConnecting,
    connectionError,
    providersLoading,
    providers,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Utilities
    isNetworkSupported,
    addEventListener,
    
    // Data
    persistedData: getPersistedData(),
  };
}
