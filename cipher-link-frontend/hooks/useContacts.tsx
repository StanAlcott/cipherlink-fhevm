"use client";

import { useState, useEffect, useCallback } from "react";
import { useCipherLink } from "./useCipherLink";
import { useWallet } from "./useWallet";
import type { 
  Contact, 
  ContactFormData, 
  AddContactResult, 
  UpdateContactResult, 
  DeleteContactResult,
  ContactFilters 
} from "../types/contact";

const STORAGE_KEY = "cipherlink.contacts";

export function useContacts() {
  const { contract, fhevmInstance } = useCipherLink();
  const { account } = useWallet();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load contacts from localStorage
  const loadContacts = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setContacts(parsed);
      }
    } catch (err) {
      console.error("Error loading contacts:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = useCallback((newContacts: Contact[]) => {
    try {
      if (typeof window === "undefined") return;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (err) {
      console.error("Error saving contacts:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Add a new contact
  const addContact = useCallback(async (formData: ContactFormData): Promise<AddContactResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Check if contact already exists
      const existingContact = contacts.find(c => c.address.toLowerCase() === formData.address.toLowerCase());
      if (existingContact) {
        throw new Error("Contact already exists");
      }

      const newContact: Contact = {
        address: formData.address.toLowerCase(),
        name: formData.name.trim(),
        addedAt: Date.now(),
        messageCount: 0,
        lastMessageTime: undefined,
        isBlocked: false,
      };

      const updatedContacts = [...contacts, newContact];
      saveContacts(updatedContacts);

      return { success: true, contact: newContact };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [contacts, saveContacts]);

  // Update an existing contact
  const updateContact = useCallback(async (address: string, updates: Partial<ContactFormData>): Promise<UpdateContactResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const contactIndex = contacts.findIndex(c => c.address.toLowerCase() === address.toLowerCase());
      if (contactIndex === -1) {
        throw new Error("Contact not found");
      }

      const updatedContact: Contact = {
        ...contacts[contactIndex],
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.address && { address: updates.address.toLowerCase() }),
      };

      const updatedContacts = [...contacts];
      updatedContacts[contactIndex] = updatedContact;
      saveContacts(updatedContacts);

      return { success: true, contact: updatedContact };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [contacts, saveContacts]);

  // Delete a contact
  const deleteContact = useCallback(async (address: string): Promise<DeleteContactResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedContacts = contacts.filter(c => c.address.toLowerCase() !== address.toLowerCase());
      saveContacts(updatedContacts);

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [contacts, saveContacts]);

  // Get contact by address
  const getContactByAddress = useCallback((address: string): Contact | undefined => {
    return contacts.find(c => c.address.toLowerCase() === address.toLowerCase());
  }, [contacts]);

  // Filter and sort contacts
  const getFilteredContacts = useCallback((filters: ContactFilters): Contact[] => {
    let filtered = [...contacts];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchLower) ||
        contact.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply blocked filter
    if (!filters.showBlocked) {
      filtered = filtered.filter(contact => !contact.isBlocked);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'lastMessage':
          aValue = a.lastMessageTime || 0;
          bValue = b.lastMessageTime || 0;
          break;
        case 'messageCount':
          aValue = a.messageCount || 0;
          bValue = b.messageCount || 0;
          break;
        case 'addedAt':
          aValue = a.addedAt;
          bValue = b.addedAt;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [contacts]);

  // Update contact message statistics (called when messages are sent/received)
  const updateContactStats = useCallback((address: string, isReceived: boolean) => {
    const contactIndex = contacts.findIndex(c => c.address.toLowerCase() === address.toLowerCase());
    if (contactIndex !== -1) {
      const updatedContacts = [...contacts];
      updatedContacts[contactIndex] = {
        ...updatedContacts[contactIndex],
        messageCount: (updatedContacts[contactIndex].messageCount || 0) + 1,
        lastMessageTime: Date.now(),
      };
      saveContacts(updatedContacts);
    }
  }, [contacts, saveContacts]);

  // Export contacts
  const exportContacts = useCallback(() => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      contacts: contacts,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cipherlink-contacts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [contacts]);

  // Import contacts
  const importContacts = useCallback(async (file: File): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.contacts || !Array.isArray(data.contacts)) {
        throw new Error("Invalid file format");
      }

      let imported = 0;
      const errors: string[] = [];
      const newContacts: Contact[] = [];

      for (const contactData of data.contacts) {
        try {
          // Validate contact data
          if (!contactData.address || !contactData.name) {
            errors.push(`Invalid contact data: missing address or name`);
            continue;
          }

          if (!/^0x[a-fA-F0-9]{40}$/.test(contactData.address)) {
            errors.push(`Invalid address format: ${contactData.address}`);
            continue;
          }

          // Check for duplicates
          const existingContact = contacts.find(c => c.address.toLowerCase() === contactData.address.toLowerCase());
          if (existingContact) {
            errors.push(`Contact already exists: ${contactData.name}`);
            continue;
          }

          const newContact: Contact = {
            address: contactData.address.toLowerCase(),
            name: contactData.name.trim(),
            addedAt: contactData.addedAt || Date.now(),
            messageCount: contactData.messageCount || 0,
            lastMessageTime: contactData.lastMessageTime,
            isBlocked: contactData.isBlocked || false,
          };

          newContacts.push(newContact);
          imported++;
        } catch (err) {
          errors.push(`Error processing contact: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      if (newContacts.length > 0) {
        const updatedContacts = [...contacts, ...newContacts];
        saveContacts(updatedContacts);
      }

      return { success: true, imported, errors };
    } catch (err) {
      return { 
        success: false, 
        imported: 0, 
        errors: [err instanceof Error ? err.message : String(err)] 
      };
    }
  }, [contacts, saveContacts]);

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    getContactByAddress,
    getFilteredContacts,
    updateContactStats,
    exportContacts,
    importContacts,
    refreshContacts: loadContacts,
  };
}
