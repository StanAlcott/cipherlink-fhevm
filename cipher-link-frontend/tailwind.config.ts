import type { Config } from "tailwindcss";
import { designTokens } from './design-tokens';

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Design system colors
      colors: {
        // Light mode colors
        primary: {
          DEFAULT: designTokens.colors.light.primary,
          foreground: designTokens.colors.light.background,
        },
        secondary: {
          DEFAULT: designTokens.colors.light.secondary,
          foreground: designTokens.colors.light.background,
        },
        accent: {
          DEFAULT: designTokens.colors.light.accent,
          foreground: designTokens.colors.light.background,
        },
        background: designTokens.colors.light.background,
        foreground: designTokens.colors.light.text,
        surface: designTokens.colors.light.surface,
        'surface-glass': designTokens.colors.light.surfaceGlass,
        muted: {
          DEFAULT: designTokens.colors.light.surface,
          foreground: designTokens.colors.light.textMuted,
        },
        'text-muted': designTokens.colors.light.textMuted,
        border: designTokens.colors.light.border,
        'border-glass': designTokens.colors.light.borderGlass,
        
        // Functional colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      
      // Typography
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.sizes,
      fontWeight: designTokens.typography.weights,
      
      // Spacing
      spacing: designTokens.spacing.scale,
      
      // Border radius - Glassmorphism style
      borderRadius: {
        none: designTokens.borderRadius.none,
        sm: designTokens.borderRadius.sm,
        DEFAULT: designTokens.borderRadius.base,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg, // 16px - Primary
        xl: designTokens.borderRadius.xl,
        '2xl': designTokens.borderRadius['2xl'],
        full: designTokens.borderRadius.full,
      },
      
      // Box shadows - Enhanced for depth
      boxShadow: {
        none: designTokens.shadows.none,
        sm: designTokens.shadows.sm,
        DEFAULT: designTokens.shadows.base,
        md: designTokens.shadows.md,
        lg: designTokens.shadows.lg, // Primary
        xl: designTokens.shadows.xl,
        glass: designTokens.shadows.glass,
      },
      
      // Animation durations
      transitionDuration: {
        DEFAULT: designTokens.transitions.duration.base,
        fast: designTokens.transitions.duration.fast,
        slow: designTokens.transitions.duration.slow, // Primary - 300ms
        slower: designTokens.transitions.duration.slower,
      },
      
      // Z-index scale
      zIndex: designTokens.zIndex,
      
      // Backdrop blur for Glassmorphism
      backdropBlur: {
        glass: '16px',
        'glass-strong': '24px',
      },
      
      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glass-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
            borderColor: 'rgba(168, 85, 247, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
            borderColor: 'rgba(168, 85, 247, 0.5)'
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'glass-glow': 'glass-glow 2s ease-in-out infinite',
      },
      
      // Background gradients for Glassmorphism
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'hero-gradient': `linear-gradient(135deg, ${designTokens.colors.light.primary} 0%, ${designTokens.colors.light.secondary} 50%, ${designTokens.colors.light.accent} 100%)`,
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom Glassmorphism utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.text-balance': {
          textWrap: 'balance',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config;
