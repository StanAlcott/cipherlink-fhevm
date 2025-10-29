import crypto from 'crypto';

// 计算确定性 seed
const projectName = "CipherLink";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "CipherLink.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');

// 根据 seed 选择设计维度
const seedNum = parseInt(seed.substring(0, 8), 16);
const designSystem = ['Material', 'Fluent', 'Neumorphism', 'Glassmorphism', 'Minimal'][seedNum % 5];
const colorScheme = seedNum % 8; // 0-7 对应 A-H
const typography = ['Serif', 'Sans', 'Mono'][seedNum % 3];
const layout = ['Sidebar', 'Masonry', 'Tabs', 'Grid', 'Wizard'][seedNum % 5];

// E 组配色方案 (Purple/Deep Purple/Indigo) - 奢华神秘
const colorPalettes = [
  // A - Indigo/Purple/Pink
  { primary: '#4F46E5', secondary: '#9333EA', accent: '#EC4899', name: 'Creative' },
  // B - Blue/Cyan/Teal  
  { primary: '#3B82F6', secondary: '#06B6D4', accent: '#14B8A6', name: 'Professional' },
  // C - Green/Lime/Yellow
  { primary: '#10B981', secondary: '#84CC16', accent: '#EAB308', name: 'Natural' },
  // D - Orange/Amber/Red
  { primary: '#F97316', secondary: '#F59E0B', accent: '#EF4444', name: 'Energetic' },
  // E - Purple/Deep Purple/Indigo
  { primary: '#A855F7', secondary: '#7C3AED', accent: '#6366F1', name: 'Luxury' },
  // F - Teal/Green/Cyan
  { primary: '#14B8A6', secondary: '#10B981', accent: '#06B6D4', name: 'Fresh' },
  // G - Red/Pink/Orange
  { primary: '#EF4444', secondary: '#EC4899', accent: '#F97316', name: 'Passionate' },
  // H - Cyan/Blue/Light Blue
  { primary: '#06B6D4', secondary: '#3B82F6', accent: '#0EA5E9', name: 'Calm' }
];

const selectedPalette = colorPalettes[colorScheme];

export const designTokens = {
  // Meta information
  system: designSystem, // 'Glassmorphism'
  seed: seed,
  palette: selectedPalette.name, // 'Luxury'
  
  // Color system
  colors: {
    light: {
      primary: selectedPalette.primary,       // '#A855F7' 
      secondary: selectedPalette.secondary,   // '#7C3AED'
      accent: selectedPalette.accent,         // '#6366F1'
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceGlass: 'rgba(248, 250, 252, 0.8)', // Glassmorphism
      text: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderGlass: 'rgba(226, 232, 240, 0.3)',
    },
    dark: {
      primary: '#C084FC',         // Lighter purple for dark mode
      secondary: '#A78BFA',       // Lighter deep purple
      accent: '#818CF8',          // Lighter indigo
      background: '#0F172A',
      surface: '#1E293B',
      surfaceGlass: 'rgba(30, 41, 59, 0.8)', // Glassmorphism
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      border: '#334155',
      borderGlass: 'rgba(51, 65, 85, 0.3)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    scale: 1.25, // Major third
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.25rem',     // 20px
      xl: '1.563rem',    // 25px
      '2xl': '1.953rem', // 31px
      '3xl': '2.441rem', // 39px
      '4xl': '3.052rem', // 49px
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Spacing system (8px base unit)
  spacing: {
    unit: 8,
    scale: {
      '0': '0',
      '1': '0.25rem',  // 4px
      '2': '0.5rem',   // 8px
      '3': '0.75rem',  // 12px
      '4': '1rem',     // 16px
      '5': '1.25rem',  // 20px
      '6': '1.5rem',   // 24px
      '8': '2rem',     // 32px
      '10': '2.5rem',  // 40px
      '12': '3rem',    // 48px
      '16': '4rem',    // 64px
      '20': '5rem',    // 80px
      '24': '6rem',    // 96px
    },
  },
  
  // Border radius - 大圆角 (16px) for Glassmorphism
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px - Primary choice
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },
  
  // Shadows - 大阴影 for Glassmorphism depth
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px rgba(0, 0, 0, 0.1)',
    md: '0 8px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.15)', // Primary choice
    xl: '0 25px 50px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)', // Glassmorphism specific
  },
  
  // Border - 细边框 (1px)
  borderWidth: {
    '0': '0',
    DEFAULT: '1px', // Primary choice
    '2': '2px',
    '4': '4px',
    '8': '8px',
  },
  
  // Animation - 平滑 (300ms)
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms', // Primary choice
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      out: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Layout - Sidebar
  layout: {
    type: 'sidebar', // Primary choice
    sidebar: {
      width: '280px',
      collapsedWidth: '64px',
    },
    content: {
      maxWidth: '1200px',
      padding: '2rem',
    },
  },
  
  // Component density
  density: {
    compact: {
      padding: { sm: '4px 8px', md: '8px 16px', lg: '12px 24px' },
      gap: '8px',
      height: { sm: '32px', md: '40px', lg: '48px' },
    },
    comfortable: {
      padding: { sm: '8px 16px', md: '16px 24px', lg: '20px 32px' },
      gap: '16px',
      height: { sm: '40px', md: '48px', lg: '56px' },
    },
  },
  
  // Glassmorphism specific tokens
  glassmorphism: {
    backdrop: 'blur(16px)',
    backdropStrong: 'blur(24px)',
    surface: 'rgba(255, 255, 255, 0.1)',
    surfaceDark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    borderDark: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: '0px',      // < 768px
    tablet: '768px',    // 768px - 1024px  
    desktop: '1024px',  // > 1024px
  },
  
  // Z-index scale
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800',
  },
};

// Export individual token categories for easier imports
export const designColors = designTokens.colors;
export const designTypography = designTokens.typography;
export const designSpacing = designTokens.spacing;
export const designShadows = designTokens.shadows;
export const designTransitions = designTokens.transitions;
