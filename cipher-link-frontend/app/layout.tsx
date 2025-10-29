import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./providers";
import { designTokens } from "../design-tokens";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CipherLink - Truly Private Messages on Blockchain",
  description: "Send encrypted messages that only you and your recipient can read using FHEVM technology",
  keywords: ["blockchain", "privacy", "encryption", "FHEVM", "messaging", "decentralized"],
  authors: [{ name: "CipherLink Team" }],
  creator: "CipherLink",
  publisher: "CipherLink",
  robots: "index, follow",
  openGraph: {
    title: "CipherLink - Truly Private Messages on Blockchain",
    description: "Send encrypted messages that only you and your recipient can read using FHEVM technology",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherLink - Truly Private Messages on Blockchain",
    description: "Send encrypted messages that only you and your recipient can read using FHEVM technology",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: designTokens.colors.light.primary },
    { media: "(prefers-color-scheme: dark)", color: designTokens.colors.dark.primary },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* FHEVM required headers */}
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://cdn.zama.ai" />
        <link rel="dns-prefetch" href="https://sepolia.infura.io" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppProvider>
          <div className="min-h-screen bg-background">
            {/* Background gradient overlay */}
            <div className="fixed inset-0 bg-hero-gradient opacity-5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
