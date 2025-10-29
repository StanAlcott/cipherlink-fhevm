"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  MessageSquare,
  Send,
  Lock,
  Unlock,
  Eye,
  Trash2,
  Clock,
  User,
  AlertCircle
} from "lucide-react";
import { Navigation } from "../../components/Navigation";
import { useWallet } from "../../hooks/useWallet";
import { useCipherLink } from "../../hooks/useCipherLink";
import toast from "react-hot-toast";

type MessageFilter = "all" | "received" | "sent";

export default function MessagesPage() {
  const { isConnected, account } = useWallet();
  const {
    isReady,
    isInitializing,
    initError,
    receivedMessages,
    sentMessages,
    isLoadingMessages,
    isDecrypting,
    loadMessages,
    decryptMessage,
    deleteMessage,
    isMessageDecrypted,
    getDecryptedContent,
  } = useCipherLink();

  const [filter, setFilter] = useState<MessageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  // Load messages when ready
  useEffect(() => {
    if (isReady) {
      loadMessages();
    }
  }, [isReady, loadMessages]);

  const handleDecryptMessage = async (messageId: string) => {
    const result = await decryptMessage(messageId);
    if (result.success) {
      toast.success("Message decrypted successfully");
    } else {
      toast.error(result.error?.message || "Failed to decrypt message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const result = await deleteMessage(messageId);
    if (result.success) {
      toast.success("Message deleted");
    } else {
      toast.error(result.error?.message || "Failed to delete message");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Filter messages based on current filter
  const filteredMessages = (() => {
    let messages;
    switch (filter) {
      case "received":
        messages = receivedMessages;
        break;
      case "sent":
        messages = sentMessages;
        break;
      default:
        messages = [...receivedMessages, ...sentMessages].sort(
          (a, b) => b.timestamp - a.timestamp
        );
    }

    // Apply search filter
    if (searchQuery) {
      messages = messages.filter(
        (msg) =>
          msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return messages;
  })();

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-text-muted mb-8">
            Please connect your wallet to access your encrypted messages.
          </p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Initialization Failed
          </h1>
          <p className="text-text-muted mb-8">
            {initError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
            <p className="text-text-muted">
              {isInitializing
                ? "Initializing encrypted messaging..."
                : `${filteredMessages.length} messages`}
            </p>
          </div>

          <Link href="/messages/send" className="btn-primary mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Link>
        </div>

        {isInitializing ? (
          <div className="text-center py-20">
            <div className="inline-block spinner w-8 h-8 mb-4" />
            <p className="text-text-muted">Setting up encrypted messaging...</p>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="glass-panel p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Message type filter */}
                <div className="flex space-x-1">
                  {[
                    { key: "all", label: "All Messages" },
                    { key: "received", label: "Received" },
                    { key: "sent", label: "Sent" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilter(item.key as MessageFilter)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        filter === item.key
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-surface"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Messages List */}
            {isLoadingMessages ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card-glass">
                    <div className="flex items-center space-x-4">
                      <div className="skeleton w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No messages found
                </h3>
                <p className="text-text-muted mb-6">
                  {filter === "all"
                    ? "Start a conversation by sending your first encrypted message."
                    : `No ${filter} messages found.`}
                </p>
                <Link href="/messages/send" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Send Message
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => {
                  const isDecrypted = isMessageDecrypted(message.id);
                  const decryptedContent = getDecryptedContent(message.id);
                  const isSent = message.sender === account;

                  return (
                    <div key={message.id} className="card-glass hover:shadow-lg transition-shadow">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSent ? "bg-primary/10" : "bg-accent/10"
                        }`}>
                          {isSent ? (
                            <Send className="w-5 h-5 text-primary" />
                          ) : (
                            <User className="w-5 h-5 text-accent" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-text-muted">
                                {isSent ? "To:" : "From:"}
                              </span>
                              <span className="font-mono text-sm text-foreground">
                                {formatAddress(isSent ? message.recipient : message.sender)}
                              </span>
                              {isSent && (
                                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                  Sent
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center text-xs text-text-muted">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimestamp(message.timestamp)}
                              </span>
                              
                              <button className="btn-ghost p-1">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="mb-3">
                            {isDecrypted && decryptedContent ? (
                              <div className="bg-surface/50 rounded-lg p-3">
                                <p className="text-foreground">{decryptedContent}</p>
                              </div>
                            ) : (
                              <div className="bg-surface/50 rounded-lg p-3 border border-dashed border-border">
                                <div className="flex items-center space-x-2 text-text-muted">
                                  <Lock className="w-4 h-4" />
                                  <span className="italic">Encrypted message</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3">
                            {!isDecrypted && (
                              <button
                                onClick={() => handleDecryptMessage(message.id)}
                                disabled={isDecrypting}
                                className="btn-secondary text-xs"
                              >
                                {isDecrypting ? (
                                  <>
                                    <div className="spinner w-3 h-3 mr-1" />
                                    Decrypting...
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3 mr-1" />
                                    Decrypt
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="btn-ghost text-xs text-error hover:bg-error/10"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>

                            {!isSent && (
                              <Link
                                href={`/messages/send?to=${message.sender}`}
                                className="btn-ghost text-xs"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Reply
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
