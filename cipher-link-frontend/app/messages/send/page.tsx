"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  Lock, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { Navigation } from "../../../components/Navigation";
import { useWallet } from "../../../hooks/useWallet";
import { useCipherLink } from "../../../hooks/useCipherLink";
import toast from "react-hot-toast";

function SendMessageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, account } = useWallet();
  const { isReady, isInitializing, initError, sendMessage, isSending } = useCipherLink();

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ recipient?: string; message?: string }>({});

  // Pre-fill recipient from URL params
  useEffect(() => {
    const toParam = searchParams.get("to");
    if (toParam) {
      setRecipient(toParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { recipient?: string; message?: string } = {};
    
    // Validate recipient address
    if (!recipient.trim()) {
      newErrors.recipient = "Recipient address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
      newErrors.recipient = "Invalid Ethereum address";
    } else if (recipient.toLowerCase() === account?.toLowerCase()) {
      newErrors.recipient = "Cannot send message to yourself";
    }

    // Validate message
    if (!message.trim()) {
      newErrors.message = "Message content is required";
    } else if (message.trim().length > 32) {
      newErrors.message = "Message too long (max 32 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await sendMessage(recipient.trim(), message.trim());
    
    if (result.success) {
      toast.success("Message sent successfully!");
      router.push("/messages");
    } else {
      toast.error(result.error?.message || "Failed to send message");
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Clear message error when user starts typing
    if (errors.message && value.trim()) {
      setErrors(prev => ({ ...prev, message: undefined }));
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    
    // Clear recipient error when user starts typing
    if (errors.recipient && value.trim()) {
      setErrors(prev => ({ ...prev, recipient: undefined }));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-text-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-text-muted mb-8">
            Please connect your wallet to send encrypted messages.
          </p>
          <Link href="/messages" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Link>
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
          <Link href="/messages" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/messages" className="btn-ghost mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Send Message</h1>
            <p className="text-text-muted">
              Send an encrypted message to any Ethereum address
            </p>
          </div>
        </div>

        {isInitializing ? (
          <div className="text-center py-20">
            <div className="inline-block spinner w-8 h-8 mb-4" />
            <p className="text-text-muted">Setting up encrypted messaging...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSend} className="space-y-6">
                <div className="card-glass">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Recipient
                  </h2>
                  
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-foreground mb-2">
                      Ethereum Address
                    </label>
                    <input
                      id="recipient"
                      type="text"
                      value={recipient}
                      onChange={handleRecipientChange}
                      placeholder="0x742d35Cc6634C0532925a3b8D6e7c4c11cf987"
                      className={`input ${errors.recipient ? "border-error" : ""}`}
                      disabled={isSending}
                      autoComplete="off"
                    />
                    {errors.recipient && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.recipient}
                      </p>
                    )}
                  </div>
                </div>

                <div className="card-glass">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Message
                  </h2>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message Content
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={handleMessageChange}
                      placeholder="Type your private message here..."
                      rows={4}
                      className={`input resize-none ${errors.message ? "border-error" : ""}`}
                      disabled={isSending}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {errors.message && (
                          <p className="text-error text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.message}
                          </p>
                        )}
                      </div>
                      <span className={`text-sm ${
                        message.length > 32 ? "text-error" : 
                        message.length > 24 ? "text-warning" : "text-text-muted"
                      }`}>
                        {message.length}/32 characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSending || !isReady}
                    className="btn-primary flex-1"
                  >
                    {isSending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                  
                  <Link href="/messages" className="btn-secondary flex-1 text-center">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              <div className="card-glass">
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Privacy Features
                </h3>
                <div className="space-y-3 text-sm text-text-muted">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>End-to-end encryption using FHEVM</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Only you and recipient can decrypt</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Messages stored encrypted on-chain</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>No third-party servers required</span>
                  </div>
                </div>
              </div>

              <div className="card-glass">
                <h3 className="font-semibold text-foreground mb-3">
                  Message Limits
                </h3>
                <div className="space-y-3 text-sm text-text-muted">
                  <div className="flex justify-between">
                    <span>Max length:</span>
                    <span className="font-mono">32 characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption:</span>
                    <span className="text-success">euint256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas cost:</span>
                    <span>~0.01 ETH</span>
                  </div>
                </div>
              </div>

              {!isReady && !isInitializing && (
                <div className="card-glass border-warning bg-warning/5">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        System Initializing
                      </h3>
                      <p className="text-sm text-text-muted">
                        Please wait while we set up encrypted messaging for your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SendMessagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-block spinner w-8 h-8 mb-4" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    }>
      <SendMessageForm />
    </Suspense>
  );
}
