"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Users, 
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
  Download,
  Upload,
  Settings
} from "lucide-react";
import { Navigation } from "../../components/Navigation";
import { useWallet } from "../../hooks/useWallet";
import { useContacts } from "../../hooks/useContacts";
import Link from "next/link";
import type { ContactFilters } from "../../types/contact";

export default function ContactsPage() {
  const { isConnected } = useWallet();
  const { 
    contacts, 
    isLoading, 
    error, 
    addContact, 
    updateContact, 
    deleteContact, 
    getFilteredContacts,
    exportContacts,
    importContacts 
  } = useContacts();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newContact, setNewContact] = useState({ address: "", name: "" });
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ address: "", name: "" });
  const [filters, setFilters] = useState<ContactFilters>({
    search: "",
    sortBy: "lastMessage",
    sortOrder: "desc",
    showBlocked: false,
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLastMessage = (timestamp?: number) => {
    if (!timestamp) return "Never";
    
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleAddContact = async () => {
    if (!newContact.address.trim() || !newContact.name.trim()) {
      return;
    }

    const result = await addContact(newContact);
    if (result.success) {
      setNewContact({ address: "", name: "" });
      setShowAddContact(false);
    } else {
      console.error("Failed to add contact:", result.error);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact || !editForm.address.trim() || !editForm.name.trim()) {
      return;
    }

    const result = await updateContact(editingContact, editForm);
    if (result.success) {
      setEditingContact(null);
      setEditForm({ address: "", name: "" });
    } else {
      console.error("Failed to update contact:", result.error);
    }
  };

  const handleDeleteContact = async (address: string) => {
    const result = await deleteContact(address);
    if (!result.success) {
      console.error("Failed to delete contact:", result.error);
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact.address);
    setEditForm({ address: contact.address, name: contact.name });
  };

  const handleImportContacts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importContacts(file);
    if (result.success) {
      setShowImportDialog(false);
      console.log(`Imported ${result.imported} contacts`);
      if (result.errors.length > 0) {
        console.warn("Import warnings:", result.errors);
      }
    } else {
      console.error("Import failed:", result.errors);
    }
  };

  // Update filters when search query changes
  const currentFilters = {
    ...filters,
    search: searchQuery,
  };

  const filteredContacts = getFilteredContacts(currentFilters);

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Users className="w-16 h-16 text-text-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-text-muted mb-8">
            Please connect your wallet to manage your contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contacts</h1>
            <p className="text-text-muted">
              {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""}
              {isLoading && " (Loading...)"}
            </p>
            {error && (
              <p className="text-error text-sm mt-1">
                Error: {error.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={exportContacts}
              className="btn-secondary"
              disabled={contacts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={() => setShowImportDialog(true)}
              className="btn-secondary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            
            <button
              onClick={() => setShowAddContact(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-glass max-w-md w-full">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Add New Contact
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contact name"
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ethereum Address
                  </label>
                  <input
                    type="text"
                    value={newContact.address}
                    onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="0x742d35Cc6634C0532925a3b8D6e7c4c11cf987"
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddContact}
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Contact"}
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Contacts Modal */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-glass max-w-md w-full">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Import Contacts
              </h2>
              
              <div className="space-y-4">
                <p className="text-text-muted text-sm">
                  Select a JSON file exported from CipherLink to import contacts.
                </p>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportContacts}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contact Modal */}
        {editingContact && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-glass max-w-md w-full">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Edit Contact
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contact name"
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ethereum Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="0x742d35Cc6634C0532925a3b8D6e7c4c11cf987"
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateContact}
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Contact"}
                </button>
                <button
                  onClick={() => setEditingContact(null)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </h3>
            <p className="text-text-muted mb-6">
              {searchQuery 
                ? "Try adjusting your search terms."
                : "Add contacts to easily send messages to frequently contacted addresses."
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddContact(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div key={contact.address} className="card-glass hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <p className="text-sm text-text-muted font-mono">
                        {formatAddress(contact.address)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button 
                      className="btn-ghost p-1"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Messages:</span>
                    <span className="text-foreground">{contact.messageCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Last message:</span>
                    <span className="text-foreground">{formatLastMessage(contact.lastMessageTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/messages/send?to=${contact.address}`}
                    className="btn-primary flex-1 text-sm"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Message
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteContact(contact.address)}
                    className="btn-ghost text-sm text-error hover:bg-error/10 px-3"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
