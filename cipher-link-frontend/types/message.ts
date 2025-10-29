// Message types for CipherLink dApp

export type MessageStatus = 'draft' | 'sending' | 'sent' | 'failed' | 'deleted';

export interface EncryptedMessage {
  id: string;
  sender: string;
  recipient: string;
  encryptedContent: string; // The encrypted handle from contract
  timestamp: number;
  isActive: boolean;
  status: MessageStatus;
}

export interface DecryptedMessage extends EncryptedMessage {
  content: string; // Decrypted content
  isDecrypted: boolean;
}

export type MessageFilter = 'all' | 'unread' | 'sent' | 'received';

export interface MessageFormData {
  recipient: string;
  content: string;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  transactionHash?: string;
  error?: Error;
}

export interface DecryptMessageResult {
  success: boolean;
  content?: string;
  error?: Error;
}

// Message thread types
export interface MessageThread {
  participantAddress: string;
  participantName?: string;
  lastMessage: EncryptedMessage;
  unreadCount: number;
  messageCount: number;
}

// Message draft for compose UI
export interface MessageDraft {
  recipient: string;
  content: string;
  timestamp: number;
  isValid: boolean;
}
