// ============================================
// THEME SYSTEM — change 'activeTheme' to switch
// Options: 'default' | 'minimal' | 'bold' | 'vibrant'
// ============================================
const activeTheme = 'default';

const themes = {
  default: {
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryLight: '#EEF2FF',
    secondary: '#7C3AED',
    background: '#F9FAFB',
    card: '#FFFFFF',
    border: '#E5E7EB',
    accept: '#22C55E',
    acceptLight: '#F0FDF4',
    ignore: '#EF4444',
    ignoreLight: '#FEF2F2',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
  },
  minimal: {
    primary: '#1a1a1a',
    primaryDark: '#000000',
    primaryLight: '#f5f5f5',
    secondary: '#333333',
    background: '#fafafa',
    card: '#ffffff',
    border: '#e0e0e0',
    accept: '#22C55E',
    acceptLight: '#F0FDF4',
    ignore: '#EF4444',
    ignoreLight: '#FEF2F2',
    text: '#1a1a1a',
    textSecondary: '#333333',
    textMuted: '#777777',
    textLight: '#aaaaaa',
  },
  bold: {
    primary: '#FF3B30',
    primaryDark: '#D4291F',
    primaryLight: '#FFF1F0',
    secondary: '#FF9500',
    background: '#FFF8F7',
    card: '#FFFFFF',
    border: '#FFD5D2',
    accept: '#22C55E',
    acceptLight: '#F0FDF4',
    ignore: '#EF4444',
    ignoreLight: '#FEF2F2',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
  },
  vibrant: {
    primary: '#00C6AD',
    primaryDark: '#009E8A',
    primaryLight: '#E0FAFA',
    secondary: '#FF6B9D',
    background: '#F0FFFE',
    card: '#FFFFFF',
    border: '#B2F0EA',
    accept: '#22C55E',
    acceptLight: '#F0FDF4',
    ignore: '#EF4444',
    ignoreLight: '#FEF2F2',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
  },
};

export const Colors = themes[activeTheme];
export type Theme = keyof typeof themes;
export const allThemes = themes;