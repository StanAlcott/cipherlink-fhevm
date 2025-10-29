// Contact types for CipherLink dApp

export interface Contact {
  address: string;
  name: string;
  lastMessageTime?: number;
  messageCount?: number;
  isBlocked?: boolean;
  addedAt: number;
}

export interface ContactFormData {
  address: string;
  name: string;
}

export interface ContactList {
  contacts: Contact[];
  totalCount: number;
  lastUpdated: number;
}

// Contact management results
export interface AddContactResult {
  success: boolean;
  contact?: Contact;
  error?: Error;
}

export interface UpdateContactResult {
  success: boolean;
  contact?: Contact;
  error?: Error;
}

export interface DeleteContactResult {
  success: boolean;
  error?: Error;
}

// Contact filters and search
export type ContactSortBy = 'name' | 'lastMessage' | 'messageCount' | 'addedAt';
export type ContactSortOrder = 'asc' | 'desc';

export interface ContactFilters {
  search: string;
  sortBy: ContactSortBy;
  sortOrder: ContactSortOrder;
  showBlocked: boolean;
}

// Contact export/import
export interface ContactExportData {
  version: string;
  exportDate: string;
  contacts: Contact[];
}

export interface ContactImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}
