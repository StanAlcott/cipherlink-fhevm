export const SDK_CDN_URL =
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";

export const SEPOLIA_CHAIN_ID = 11155111;
export const LOCALHOST_CHAIN_ID = 31337;

export const FHEVM_NETWORKS = {
  [SEPOLIA_CHAIN_ID]: {
    name: "Sepolia",
    chainId: SEPOLIA_CHAIN_ID,
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
  },
  [LOCALHOST_CHAIN_ID]: {
    name: "Localhost",
    chainId: LOCALHOST_CHAIN_ID,
    rpcUrl: "http://127.0.0.1:8545",
    explorerUrl: "http://localhost:8545",
  },
} as const;

export const RELAYER_METADATA_KEY = "fhevm_relayer_metadata";

// Storage keys for wallet persistence
export const STORAGE_KEYS = {
  WALLET_CONNECTED: "wallet.connected",
  WALLET_LAST_CONNECTOR_ID: "wallet.lastConnectorId", 
  WALLET_LAST_ACCOUNTS: "wallet.lastAccounts",
  WALLET_LAST_CHAIN_ID: "wallet.lastChainId",
  FHEVM_DECRYPTION_SIGNATURE_PREFIX: "fhevm.decryptionSignature.",
} as const;
