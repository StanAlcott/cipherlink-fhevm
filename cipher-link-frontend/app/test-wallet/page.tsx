"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";

export default function WalletTestPage() {
  const { 
    isConnected, 
    account, 
    chainId, 
    isConnecting, 
    providers, 
    providersLoading,
    connectWallet,
    disconnectWallet,
    persistedData
  } = useWallet();

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog("Wallet state changed");
    addLog(`Connected: ${isConnected}`);
    addLog(`Account: ${account || 'None'}`);
    addLog(`Chain ID: ${chainId || 'None'}`);
    addLog(`Providers loading: ${providersLoading}`);
    addLog(`Providers count: ${providers.length}`);
    
    // Add detailed provider info
    providers.forEach((provider, index) => {
      addLog(`Provider ${index}: ${provider.info.name} (${provider.info.uuid.slice(0, 8)}...)`);
    });
    
    // Add persisted data info
    if (persistedData) {
      addLog(`Persisted UUID: ${persistedData.lastConnectorId?.slice(0, 8)}...`);
      addLog(`Persisted accounts: ${persistedData.lastAccounts?.length || 0}`);
    }
  }, [isConnected, account, chainId, providersLoading, providers.length, providers, persistedData]);

  const handleConnect = async (provider: any) => {
    addLog(`Attempting to connect to ${provider.info.name}`);
    const result = await connectWallet(provider);
    if (result.success) {
      addLog(`✅ Connected successfully`);
    } else {
      addLog(`❌ Connection failed: ${result.error?.message}`);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    addLog("Disconnected wallet");
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearWalletData = () => {
    localStorage.clear();
    addLog("Cleared all localStorage data");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Wallet Connection Test</h1>
        
        {/* Current State */}
        <div className="card-glass mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Current State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Connected:</span>
              <span className={`ml-2 ${isConnected ? 'text-success' : 'text-error'}`}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Account:</span>
              <span className="ml-2 font-mono text-sm">{account || 'None'}</span>
            </div>
            <div>
              <span className="font-medium">Chain ID:</span>
              <span className="ml-2">{chainId || 'None'}</span>
            </div>
            <div>
              <span className="font-medium">Providers:</span>
              <span className="ml-2">{providers.length}</span>
            </div>
          </div>
          
          {persistedData && (
            <div className="mt-4 p-4 bg-surface/50 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Persisted Data:</h3>
              <pre className="text-sm text-text-muted">
                {JSON.stringify(persistedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card-glass mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Actions</h2>
          
          {!isConnected ? (
            <div>
              <p className="text-text-muted mb-4">Available providers:</p>
              <div className="space-y-2">
                {providers.map((provider) => (
                  <button
                    key={provider.info.uuid}
                    onClick={() => handleConnect(provider)}
                    disabled={isConnecting}
                    className="btn-primary w-full text-left flex items-center space-x-3"
                  >
                    <img
                      src={provider.info.icon}
                      alt={provider.info.name}
                      className="w-6 h-6"
                    />
                    <span>{provider.info.name}</span>
                    <span className="text-sm opacity-75">({provider.info.uuid.slice(0, 8)}...)</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={handleDisconnect}
              className="btn-secondary"
            >
              Disconnect Wallet
            </button>
          )}
        </div>

        {/* Logs */}
        <div className="card-glass">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Debug Logs</h2>
            <div className="space-x-2">
              <button
                onClick={clearLogs}
                className="btn-ghost text-sm"
              >
                Clear Logs
              </button>
              <button
                onClick={clearWalletData}
                className="btn-ghost text-sm text-error hover:bg-error/10"
              >
                Clear All Data
              </button>
            </div>
          </div>
          
          <div className="bg-surface/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-text-muted">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="card-glass mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-text-muted">
            <li>Connect your wallet using one of the providers above</li>
            <li>Check the logs for any ProviderEvent errors</li>
            <li>Refresh the page and check if auto-reconnect works</li>
            <li>Look for "Auto-reconnect successful" in the logs</li>
            <li>If issues persist, check the browser console for detailed errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
