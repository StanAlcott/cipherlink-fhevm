import { useEffect, useMemo, useRef, useState } from "react";
import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from "../types/wallet";

export interface Eip6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}

export interface Eip6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

export interface Eip6963State {
  uuids: Record<string, EIP6963ProviderDetail> | undefined;
  error: Error | undefined;
  providers: EIP6963ProviderDetail[];
  isLoading: boolean;
}

export function useEip6963(): Eip6963State {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [uuids, setUuids] = useState<
    Record<string, EIP6963ProviderDetail> | undefined
  >(undefined);
  const activeLoadId = useRef(0);
  const isListener = useRef<boolean>(false);
  
  const providers = useMemo<EIP6963ProviderDetail[]>(() => {
    if (!uuids) return [];
    
    // Sort providers: MetaMask first, then alphabetically
    const sortedProviders = Object.values(uuids).sort((a, b) => {
      // MetaMask priority
      if (a.info.name.toLowerCase().includes('metamask')) return -1;
      if (b.info.name.toLowerCase().includes('metamask')) return 1;
      
      // Alphabetical order
      return a.info.name.localeCompare(b.info.name);
    });
    
    return sortedProviders;
  }, [uuids]);

  // Add provider to internal state
  function _addProviderInternal(providerDetail: EIP6963ProviderDetail) {
    setUuids((prev) => {
      if (!prev) {
        return { [providerDetail.info.uuid]: providerDetail };
      }
      
      const existing = prev[providerDetail.info.uuid];
      if (
        existing &&
        existing.info.uuid === providerDetail.info.uuid &&
        existing.info.name === providerDetail.info.name &&
        existing.info.rdns === providerDetail.info.rdns &&
        existing.info.icon === providerDetail.info.icon &&
        existing.provider === providerDetail.provider
      ) {
        return prev; // No changes needed
      }
      
      if (existing) {
        console.log(`[EIP6963] Updated provider: ${providerDetail.info.name}`);
      } else {
        console.log(`[EIP6963] Added new provider: ${providerDetail.info.name}`);
      }
      
      return { ...prev, [providerDetail.info.uuid]: providerDetail };
    });
  }

  useEffect(() => {
    const thisLoadId = ++activeLoadId.current;

    const onEip6963AnnounceProvider = (event: Event) => {
      if ("detail" in event) {
        const providerDetail = (event as Eip6963AnnounceProviderEvent).detail;
        _addProviderInternal(providerDetail);
      }
    };

    const run = async () => {
      if (thisLoadId !== activeLoadId.current) {
        return;
      }

      if (isListener.current) {
        console.log("[EIP6963] Already listening to events");
        setIsLoading(false);
        return;
      }

      if (typeof window === "undefined") {
        console.log("[EIP6963] Window is undefined");
        setIsLoading(false);
        return;
      }

      setError(undefined);
      setIsLoading(true);

      try {
        // Start listening for announcements
        window.addEventListener(
          "eip6963:announceProvider",
          onEip6963AnnounceProvider
        );
        
        isListener.current = true;

        // Request providers to announce themselves
        window.dispatchEvent(new Event("eip6963:requestProvider"));
        
        // Give providers time to respond
        setTimeout(() => {
          if (thisLoadId === activeLoadId.current) {
            setIsLoading(false);
          }
        }, 100);
        
      } catch (e) {
        console.error("[EIP6963] Setup error:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsLoading(false);
        
        // Cleanup on error
        if (isListener.current) {
          window.removeEventListener(
            "eip6963:announceProvider",
            onEip6963AnnounceProvider
          );
          isListener.current = false;
        }
      }
    };

    run();

    // Cleanup on unmount
    return () => {
      activeLoadId.current = activeLoadId.current + 1;
      if (isListener.current) {
        window.removeEventListener(
          "eip6963:announceProvider",
          onEip6963AnnounceProvider
        );
        isListener.current = false;
      }
    };
  }, []);

  return { error, uuids, providers, isLoading };
}
