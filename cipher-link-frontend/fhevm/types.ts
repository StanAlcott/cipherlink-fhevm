// Import types from @zama-fhe/relayer-sdk like reference project
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";

export type { FhevmInstance, FhevmInstanceConfig };

export type CreateFhevmInstanceOptions = {
  provider?: any;
  chainId?: number;
  config?: FhevmInstanceConfig;
};

export type FhevmInitSDKOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tfheParams?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kmsParams?: any;
  thread?: number;
};

export type FhevmCreateInstanceType = () => Promise<FhevmInstance>;
export type FhevmInitSDKType = (
  options?: FhevmInitSDKOptions
) => Promise<boolean>;
export type FhevmLoadSDKType = () => Promise<void>;
export type IsFhevmSupportedType = (chainId: number) => boolean;

export type FhevmRelayerSDKType = {
  initSDK: FhevmInitSDKType;
  createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
  SepoliaConfig: FhevmInstanceConfig;
  __initialized__?: boolean;
};

export type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

// Mock utils types (for local development) - use the actual MockFhevmInstance from @fhevm/mock-utils
export type MockFhevmInstance = FhevmInstance;

// Decryption signature storage
export type FhevmDecryptionSignature = {
  signature: string;
  publicKey: string;
  contractAddress: string;
  userAddress: string;
  timestamp: number;
};

// EIP712 types for decryption signature
export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

// Wallet types
export type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: any; // ethers provider
};

export type WalletConnectionState = {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: any | null;
  connectorId: string | null;
};

// Message types for CipherLink
export type MessageStatus = 'draft' | 'sending' | 'sent' | 'failed' | 'deleted';

export type EncryptedMessage = {
  id: string;
  sender: string;
  recipient: string;
  encryptedContent: string; // The encrypted handle from contract
  timestamp: number;
  isActive: boolean;
  status: MessageStatus;
};

export type DecryptedMessage = EncryptedMessage & {
  content: string; // Decrypted content
  isDecrypted: boolean;
};

export type Contact = {
  address: string;
  name: string;
  lastMessageTime?: number;
  messageCount?: number;
  isBlocked?: boolean;
};

export type MessageFilter = 'all' | 'unread' | 'sent' | 'received';

export type PrivacySettings = {
  messageAcceptance: 'everyone' | 'contacts' | 'whitelist';
  autoDeleteDays: number | null; // null = never
  notificationsEnabled: boolean;
  blockList: string[];
  whiteList: string[];
};
