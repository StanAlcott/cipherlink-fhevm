"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Wallet,
  Menu,
  X,
  Shield,
  ChevronDown,
  LogOut,
  Copy,
  ExternalLink
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import toast from "react-hot-toast";

const navigation = [
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Test Wallet", href: "/test-wallet", icon: Wallet },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  
  const {
    isConnected,
    account,
    chainId,
    isConnecting,
    providers,
    providersLoading,
    connectWallet,
    disconnectWallet,
    isNetworkSupported,
    switchNetwork,
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success("Address copied to clipboard");
    }
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Hardhat";
      default:
        return "Unknown";
    }
  };

  const handleConnect = async (provider: any) => {
    const result = await connectWallet(provider);
    if (result.success) {
      toast.success(`Connected to ${provider.info.name}`);
      setIsWalletMenuOpen(false);
    } else {
      toast.error(result.error?.message || "Connection failed");
    }
  };

  const handleSwitchNetwork = async (targetChainId: number) => {
    const result = await switchNetwork(targetChainId);
    if (result.success) {
      toast.success(`Switched to ${getNetworkName(targetChainId)}`);
    } else {
      toast.error(result.error?.message || "Network switch failed");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success("Wallet disconnected");
    setIsWalletMenuOpen(false);
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 mr-8">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CipherLink</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet connection */}
          <div className="flex items-center space-x-4">
            {/* Network status */}
            {isConnected && chainId && (
              <div className="hidden sm:flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isNetworkSupported(chainId) ? "bg-success" : "bg-warning"
                  }`}
                />
                <span className="text-sm text-text-muted">
                  {getNetworkName(chainId)}
                </span>
                {!isNetworkSupported(chainId) && (
                  <button
                    onClick={() => handleSwitchNetwork(11155111)}
                    className="text-xs text-warning hover:text-warning/80 transition-colors"
                  >
                    Switch Network
                  </button>
                )}
              </div>
            )}

            {/* Wallet button */}
            <div className="relative">
              {isConnected && account ? (
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="btn-glass flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">{formatAddress(account)}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  disabled={isConnecting || providersLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isConnecting
                      ? "Connecting..."
                      : providersLoading
                      ? "Loading..."
                      : "Connect Wallet"}
                  </span>
                </button>
              )}

              {/* Wallet dropdown menu */}
              {isWalletMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 glass-panel border shadow-lg z-50">
                  {isConnected && account ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">Connected</span>
                        <div className="w-2 h-2 bg-success rounded-full" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-surface/50 rounded-lg">
                          <span className="text-sm font-mono">{account}</span>
                          <button
                            onClick={copyAddress}
                            className="p-1 hover:bg-surface rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted">Network:</span>
                          <span className="font-medium">{getNetworkName(chainId!)}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-border/50 space-y-2">
                          <button className="w-full flex items-center space-x-2 p-2 text-sm text-left hover:bg-surface rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                            <span>View on Explorer</span>
                          </button>
                          
                          <button
                            onClick={handleDisconnect}
                            className="w-full flex items-center space-x-2 p-2 text-sm text-left text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-foreground mb-3">
                        Connect Wallet
                      </h3>
                      
                      <div className="space-y-2">
                        {providers.map((provider) => (
                          <button
                            key={provider.info.uuid}
                            onClick={() => handleConnect(provider)}
                            disabled={isConnecting}
                            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
                          >
                            <img
                              src={provider.info.icon}
                              alt={provider.info.name}
                              className="w-6 h-6"
                            />
                            <span className="font-medium">{provider.info.name}</span>
                          </button>
                        ))}
                        
                        {providers.length === 0 && !providersLoading && (
                          <p className="text-sm text-text-muted text-center py-4">
                            No wallet providers found. Please install a compatible wallet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden btn-ghost p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 pt-4 pb-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {(isWalletMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsWalletMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
