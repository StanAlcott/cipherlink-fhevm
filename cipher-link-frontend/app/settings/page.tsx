"use client";

import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Wallet, 
  Bell, 
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Globe,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { Navigation } from "../../components/Navigation";
import { useWallet } from "../../hooks/useWallet";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { isConnected, account, chainId, disconnectWallet } = useWallet();
  
  // Settings state
  const [privacySettings, setPrivacySettings] = useState({
    messageAcceptance: "everyone" as "everyone" | "contacts" | "whitelist",
    autoDeleteDays: null as number | null,
    notificationsEnabled: true,
  });
  
  const [theme, setTheme] = useState("light");

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
        return "Sepolia Testnet";
      case 31337:
        return "Hardhat Local";
      default:
        return "Unknown Network";
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("wallet.") || key.startsWith("fhevm.")) {
          localStorage.removeItem(key);
        }
      });
      toast.success("Local data cleared");
    }
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      account,
      contacts: [], // Would be actual contacts data
      settings: privacySettings,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cipherlink-data-${account?.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <SettingsIcon className="w-16 h-16 text-text-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-text-muted mb-8">
            Please connect your wallet to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-text-muted">
            Manage your privacy, account, and application preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Connected Address</div>
                  <div className="text-sm text-text-muted font-mono">{account}</div>
                </div>
                <button
                  onClick={copyAddress}
                  className="btn-ghost p-2"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Network</div>
                  <div className="text-sm text-text-muted">{getNetworkName(chainId!)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm text-success">Connected</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <button
                  onClick={disconnectWallet}
                  className="btn-ghost text-error hover:bg-error/10"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy & Security
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Message Acceptance
                </label>
                <div className="space-y-2">
                  {[
                    { value: "everyone", label: "Everyone", desc: "Accept messages from any address" },
                    { value: "contacts", label: "Contacts Only", desc: "Only accept messages from saved contacts" },
                    { value: "whitelist", label: "Whitelist Only", desc: "Only accept messages from approved addresses" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface/50 cursor-pointer">
                      <input
                        type="radio"
                        name="messageAcceptance"
                        value={option.value}
                        checked={privacySettings.messageAcceptance === option.value}
                        onChange={(e) => setPrivacySettings(prev => ({ 
                          ...prev, 
                          messageAcceptance: e.target.value as any 
                        }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-text-muted">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Auto-Delete Messages
                </label>
                <select
                  value={privacySettings.autoDeleteDays || ""}
                  onChange={(e) => setPrivacySettings(prev => ({ 
                    ...prev, 
                    autoDeleteDays: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="input"
                >
                  <option value="">Never delete</option>
                  <option value="7">After 7 days</option>
                  <option value="30">After 30 days</option>
                  <option value="90">After 90 days</option>
                </select>
                <p className="text-sm text-text-muted mt-1">
                  Automatically delete old messages from local storage
                </p>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Browser Notifications</div>
                  <div className="text-sm text-text-muted">Get notified when you receive new messages</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.notificationsEnabled}
                  onChange={(e) => setPrivacySettings(prev => ({ 
                    ...prev, 
                    notificationsEnabled: e.target.checked 
                  }))}
                  className="toggle"
                />
              </label>
            </div>
          </section>

          {/* Application Settings */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Application
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Theme</div>
                  <div className="text-sm text-text-muted">Choose your preferred appearance</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`btn-ghost p-2 ${theme === "light" ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`btn-ghost p-2 ${theme === "dark" ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Language</div>
                  <div className="text-sm text-text-muted">Application language</div>
                </div>
                <select className="input w-32" disabled>
                  <option>English</option>
                </select>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Export Data</div>
                  <div className="text-sm text-text-muted">Download your contacts and settings</div>
                </div>
                <button
                  onClick={handleExportData}
                  className="btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Clear Local Data</div>
                  <div className="text-sm text-text-muted">Remove all locally stored data</div>
                </div>
                <button
                  onClick={handleClearData}
                  className="btn-ghost text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </button>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="card-glass">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              About CipherLink
            </h2>
            
            <div className="space-y-4 text-sm text-text-muted">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build:</span>
                <span className="font-mono">202510-main</span>
              </div>
              <div className="flex justify-between">
                <span>FHEVM SDK:</span>
                <span className="font-mono">0.2.0</span>
              </div>
              
              <div className="pt-4 border-t border-border/50 space-y-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Source Code
                </a>
                <br />
                <a
                  href="https://docs.zama.ai"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  FHEVM Documentation
                </a>
              </div>
            </div>
          </section>

          {/* Save Settings */}
          <div className="flex justify-end">
            <button
              onClick={() => toast.success("Settings saved successfully")}
              className="btn-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
