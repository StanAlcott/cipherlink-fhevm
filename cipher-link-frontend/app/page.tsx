"use client";

import Link from "next/link";
import { 
  Shield, 
  Lock, 
  Zap, 
  Users, 
  ArrowRight, 
  Check, 
  MessageSquare,
  Eye,
  Server,
  Smartphone,
  Globe,
  Github
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { useWallet } from "../hooks/useWallet";

export default function HomePage() {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Messages are encrypted using FHEVM technology, ensuring only you and your recipient can read them.",
    },
    {
      icon: Lock,
      title: "On-Chain Privacy", 
      description: "Data stays encrypted even on the blockchain. No plaintext exposure, ever.",
    },
    {
      icon: Zap,
      title: "No Third-Party Storage",
      description: "No IPFS, no centralized servers. Everything runs on the decentralized blockchain.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your MetaMask or compatible wallet to get started.",
      icon: Users,
    },
    {
      number: "02", 
      title: "Encrypt & Send",
      description: "Write your message and send it encrypted to any Ethereum address.",
      icon: MessageSquare,
    },
    {
      number: "03",
      title: "Recipient Decrypts",
      description: "Only the intended recipient can decrypt and read your private message.",
      icon: Eye,
    },
  ];

  const stats = [
    { label: "Messages Encrypted", value: "∞", description: "Unlimited private messaging" },
    { label: "Zero Knowledge", value: "100%", description: "Complete privacy guaranteed" },
    { label: "Decentralized", value: "24/7", description: "Always available on-chain" },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 glass-panel px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                Powered by FHEVM Technology
              </span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
              Truly Private Messages
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                on Blockchain
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl sm:text-2xl text-text-muted mb-10 max-w-3xl mx-auto text-balance">
              Send encrypted messages that only you and your recipient can read. 
              No servers, no surveillance, no compromise.
            </p>

            {/* Hero CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isConnected ? (
                <Link href="/messages" className="btn-primary text-lg px-8 py-4">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Go to Messages
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <button className="btn-primary text-lg px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-ghost text-lg px-8 py-4"
              >
                <Github className="w-5 h-5 mr-2" />
                View Source
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-text-muted">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Why Choose CipherLink?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Built with cutting-edge FHEVM technology for uncompromising privacy and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-glass text-center group hover:scale-105 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Send private messages in three simple steps. No technical knowledge required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="card-glass text-center h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent text-white rounded-xl font-bold text-lg mb-6">
                      {step.number}
                    </div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connection arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Built for Privacy by Design
              </h2>
              <p className="text-xl text-text-muted mb-8">
                CipherLink leverages Fully Homomorphic Encryption Virtual Machine (FHEVM) 
                to ensure your messages remain encrypted at all times, even during computation.
              </p>

              <div className="space-y-4">
                {[
                  "Messages encrypted with euint256 for maximum security",
                  "Smart contract access control with FHE.allow permissions", 
                  "No plaintext data ever touches the blockchain",
                  "Decentralized architecture with no single point of failure",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Server, label: "On-Chain Storage", desc: "Decentralized" },
                { icon: Lock, label: "FHEVM Encryption", desc: "Military Grade" },
                { icon: Smartphone, label: "Mobile Ready", desc: "Any Device" },
                { icon: Globe, label: "Global Access", desc: "24/7 Available" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="card-glass text-center">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="font-semibold text-foreground mb-1">{item.label}</div>
                    <div className="text-sm text-text-muted">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Send Private Messages?
          </h2>
          <p className="text-xl text-text-muted mb-10">
            Join the future of truly private communication on the blockchain.
          </p>
          
          {isConnected ? (
            <Link href="/messages" className="btn-primary text-lg px-8 py-4">
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Messaging
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <button className="btn-primary text-lg px-8 py-4">
              <Users className="w-5 h-5 mr-2" />
              Connect Wallet to Start
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">CipherLink</span>
            </div>
            
            <div className="text-sm text-text-muted">
              © 2024 CipherLink. Built with FHEVM technology.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
