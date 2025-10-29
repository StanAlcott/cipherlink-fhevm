import { ethers } from "ethers";
import type { 
  FhevmInstance, 
  MockFhevmInstance, 
  CreateFhevmInstanceOptions,
  FhevmInstanceConfig 
} from "./types";

export class FhevmError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "FhevmError";
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmError(code, message, cause ? { cause } : undefined);
}

const isFhevmWindowType = (window: any, trace?: (msg: string) => void): boolean => {
  if (!window) {
    trace?.("FhevmJS: window is not available");
    return false;
  }
  
  if (!window.fhevm_relayer_metadata) {
    trace?.("FhevmJS: window.fhevm_relayer_metadata is not available");
    return false;
  }
  
  return true;
};

export class FhevmJS {
  private _provider: any;
  private _chainId: number;
  private _relayerStatus: "not-loaded" | "loading" | "sdk-loaded" | "error" = "not-loaded";

  constructor() {
    this._provider = null;
    this._chainId = 0;
  }

  async createInstance(options: CreateFhevmInstanceOptions = {}): Promise<FhevmInstance | MockFhevmInstance> {
    const { provider, chainId, config } = options;
    
    if (!provider) {
      throwFhevmError("NO_PROVIDER", "Provider is required");
    }
    
    if (!chainId) {
      throwFhevmError("NO_CHAIN_ID", "Chain ID is required");
    }
    
    this._provider = provider;
    this._chainId = chainId;
    
    // Check if we should use mock for local development
    if (chainId === 31337) {
      console.log("Using Mock FHEVM for local development");
      return this._createMockInstance();
    }
    
    // Use real Relayer SDK for other networks
    try {
      this._relayerStatus = "loading";
      console.log("Using real FHEVM Relayer SDK");
      return this._createRelayerInstance(config);
    } catch (error) {
      this._relayerStatus = "sdk-loaded"; // Reset status on error
      throw error;
    }
  }

  private async _createMockInstance(): Promise<MockFhevmInstance> {
    // Dynamic import of mock utils to avoid including in production bundle
    const mockUtils = await import("@fhevm/mock-utils");
    
    // Get FHEVM metadata from Hardhat node like reference project
    const metadata = await this._getFHEVMRelayerMetadata();
    if (!metadata) {
      throw new Error("Failed to get FHEVM relayer metadata from Hardhat node");
    }
    
    // Create JsonRpcProvider like reference project
    const { JsonRpcProvider } = await import("ethers");
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");
    
    // Create MockFhevmInstance using the correct API from reference project
    const mockInstance = await mockUtils.MockFhevmInstance.create(
      provider, // relayerProvider
      provider, // readonlyEthersProvider  
      {
        aclContractAddress: metadata.ACLAddress,
        chainId: this._chainId,
        gatewayChainId: 55815,
        inputVerifierContractAddress: metadata.InputVerifierAddress,
        kmsContractAddress: metadata.KMSVerifierAddress,
        verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
        verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
      }
    );
    
    return mockInstance;
  }

  private async _getFHEVMRelayerMetadata(): Promise<{
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  } | null> {
    try {
      const { JsonRpcProvider } = await import("ethers");
      const rpc = new JsonRpcProvider("http://127.0.0.1:8545");
      
      const metadata = await rpc.send("fhevm_relayer_metadata", []);
      
      if (!metadata || typeof metadata !== "object") {
        return null;
      }
      
      if (
        !(
          "ACLAddress" in metadata &&
          typeof metadata.ACLAddress === "string" &&
          metadata.ACLAddress.startsWith("0x")
        )
      ) {
        return null;
      }
      
      if (
        !(
          "InputVerifierAddress" in metadata &&
          typeof metadata.InputVerifierAddress === "string" &&
          metadata.InputVerifierAddress.startsWith("0x")
        )
      ) {
        return null;
      }
      
      if (
        !(
          "KMSVerifierAddress" in metadata &&
          typeof metadata.KMSVerifierAddress === "string" &&
          metadata.KMSVerifierAddress.startsWith("0x")
        )
      ) {
        return null;
      }
      
      return {
        ACLAddress: metadata.ACLAddress as `0x${string}`,
        InputVerifierAddress: metadata.InputVerifierAddress as `0x${string}`,
        KMSVerifierAddress: metadata.KMSVerifierAddress as `0x${string}`,
      };
    } catch (error) {
      console.error("Failed to get FHEVM relayer metadata:", error);
      return null;
    }
  }

  private async _createRelayerInstance(config?: FhevmInstanceConfig): Promise<FhevmInstance> {
    if (this._relayerStatus === "not-loaded") {
      await this._loadRelayerSDK();
    }
    
    if (this._relayerStatus === "error") {
      throwFhevmError("SDK_LOAD_ERROR", "Failed to load Relayer SDK");
    }
    
    // Check if SDK is available
    if (!window.relayerSDK || !window.relayerSDK.createInstance) {
      throwFhevmError("SDK_NOT_AVAILABLE", "Relayer SDK is not available");
    }
    
    // Use SepoliaConfig as base like reference project
    const instanceConfig: FhevmInstanceConfig = {
      ...(window.relayerSDK as any).SepoliaConfig,
      network: this._provider,
      ...config
    };
    
    const instance = await window.relayerSDK.createInstance(instanceConfig);
    return instance;
  }

  reset(): void {
    this._provider = null;
    this._chainId = 0;
    this._relayerStatus = "not-loaded";
  }

  private async _loadRelayerSDK(): Promise<void> {
    if (this._relayerStatus === "loading") {
      return;
    }
    
    this._relayerStatus = "loading";
    
    try {
      // Check if SDK is already loaded
      if (typeof window !== 'undefined' && window.relayerSDK) {
        this._relayerStatus = "sdk-loaded";
        return;
      }
      
      // Load SDK from CDN
      await this._loadSDKFromCDN();
      this._relayerStatus = "sdk-loaded";
    } catch (error) {
      this._relayerStatus = "error";
      throwFhevmError("SDK_LOAD_ERROR", "Failed to load Relayer SDK", error);
    }
  }

  private async _loadSDKFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error("Window is not available"));
        return;
      }
      
      // Check if already loaded
      if (window.relayerSDK) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zama-fhe/relayer-sdk@latest/bundle/relayer-sdk-js.umd.js';
      script.async = true;
      
      script.onload = () => {
        if (window.relayerSDK) {
          resolve();
        } else {
          reject(new Error("SDK loaded but window.relayerSDK is not available"));
        }
      };
      
      script.onerror = () => {
        reject(new Error("Failed to load SDK script"));
      };
      
      document.head.appendChild(script);
    });
  }
}

// Global type declarations
declare global {
  interface Window {
    relayerSDK?: {
      createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
    };
    fhevm_relayer_metadata?: any;
  }
}