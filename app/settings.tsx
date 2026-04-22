import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../constants/Colors';
import { useSettings } from '../store/SettingsProvider';
import { Locale } from '../store/i18n';

const THEMES: { key: Theme; label: string; colors: [string, string]; emoji: string }[] = [
  { key: 'light',   label: 'Light',   colors: ['#4F46E5', '#EEF2FF'], emoji: '☀️' },
  { key: 'dark',    label: 'Dark',    colors: ['#1A1A22', '#818CF8'], emoji: '🌙' },
  { key: 'amoled',  label: 'AMOLED',  colors: ['#000000', '#60A5FA'], emoji: '⚫' },
  { key: 'blue',    label: 'Blue',    colors: ['#0EA5E9', '#E0F2FE'], emoji: '🔵' },
  { key: 'green',   label: 'Green',   colors: ['#10B981', '#D1FAE5'], emoji: '🟢' },
  { key: 'purple',  label: 'Purple',  colors: ['#A855F7', '#F3E8FF'], emoji: '🟣' },
];

const LANGUAGES: { code: Locale; flag: string; name: string }[] = [
  { code: 'English', flag: '🇺🇸', name: 'English' },
  { code: 'Hindi',   flag: '🇮🇳', name: 'हिन्दी (Hindi)' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, themeName, setThemeName, language, setLanguage, isDark, t } = useSettings();
  const styles = getStyles(colors);

  const handleTheme = (key: Theme) => {
    setThemeName(key);
  };

  const handleLang = (code: Locale) => {
    setLanguage(code);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>⚙️  Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── DARK MODE QUICK TOGGLE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌗  Appearance</Text>
          <View style={styles.darkModeRow}>
            <View style={styles.darkModeLeft}>
              <Text style={styles.darkModeIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={styles.darkModeLabel}>Dark Mode</Text>
                <Text style={styles.darkModeSub}>
                  {isDark ? 'Dark theme is active' : 'Switch to dark theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setThemeName(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* ── THEME STYLE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨  Theme Style</Text>
          <View style={styles.themeGrid}>
            {THEMES.map(th => (
              <TouchableOpacity
                key={th.key}
                style={[styles.themeTile, themeName === th.key && styles.themeTileActive]}
                onPress={() => handleTheme(th.key)}
              >
                <View style={[styles.themeSwatch, { backgroundColor: th.colors[0] }]} />
                <Text style={styles.themeName}>{th.label}</Text>
                <Text style={styles.themeEmoji}>{th.emoji}</Text>
                {themeName === th.key && (
                  <View style={styles.themeCheckBadge}>
                    <Text style={styles.themeCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LANGUAGE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐  Language</Text>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langItem, language === l.code && styles.langItemActive]}
              onPress={() => handleLang(l.code)}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langName, language === l.code && { color: colors.primary }]}>
                {l.name}
              </Text>
              {language === l.code && (
                <Text style={styles.langCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── GENERAL ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️  General</Text>
          {[
            { icon: '🔔', bg: colors.border, title: 'Notifications', sub: 'Manage alerts & updates' },
            { icon: '🔒', bg: colors.border, title: 'Privacy Policy', sub: 'How we use your data' },
            { icon: '❓', bg: colors.border, title: 'Help & Support', sub: 'FAQs and contact us' },
          ].map(item => (
            <TouchableOpacity
              key={item.title}
              style={styles.settingItem}
              onPress={() => Alert.alert(item.title, `${item.title} page coming soon!`)}
            >
              <View style={[styles.settingIcon, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Terms */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/terms')}
          >
            <View style={[styles.settingIcon, { backgroundColor: colors.border }]}>
              <Text style={{ fontSize: 16 }}>📄</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Terms & Conditions</Text>
              <Text style={styles.settingSub}>Read our policies</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── LOGOUT ── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32, marginTop: 8 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪  Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.version}>ShareSpare v1.0.0  ·  Made with ❤️ for Campus</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 16, color: colors.textSecondary },
  navTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  section: { padding: 16, paddingBottom: 4 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: colors.textLight,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },

  // Dark mode toggle row
  darkModeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: colors.border,
    marginBottom: 4,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  darkModeIcon: { fontSize: 24 },
  darkModeLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  darkModeSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  // Theme grid
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeTile: {
    width: '18%', alignItems: 'center', padding: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
    position: 'relative',
  },
  themeTileActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  themeSwatch: { width: 28, height: 28, borderRadius: 8, marginBottom: 5 },
  themeName: { fontSize: 9, fontWeight: '600', color: colors.text },
  themeEmoji: { fontSize: 12, marginTop: 2 },
  themeCheckBadge: {
    position: 'absolute', top: -5, right: -5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  themeCheck: { fontSize: 9, color: colors.primaryTextAuto, fontWeight: '700' },

  // Language
  langItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
    backgroundColor: colors.card, borderRadius: 10, marginBottom: 8,
    borderWidth: 1.5, borderColor: colors.border,
  },
  langItemActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  langFlag: { fontSize: 20 },
  langName: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  langCheck: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  // General settings rows
  settingItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    backgroundColor: colors.card, borderRadius: 10, marginBottom: 8,
    borderWidth: 1.5, borderColor: colors.border,
  },
  settingIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  settingTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  settingSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  arrow: { fontSize: 18, color: colors.textLight },

  // Logout
  logoutBtn: {
    backgroundColor: colors.ignoreLight, borderWidth: 1.5, borderColor: colors.ignore,
    borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 14,
    opacity: 0.9,
  },
  logoutText: { color: colors.ignore, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 11, color: colors.textLight },
});