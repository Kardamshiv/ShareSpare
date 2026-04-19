import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/Colors';

const THEMES: { key: Theme; label: string; colors: [string, string] }[] = [
  { key: 'default', label: 'Default', colors: ['#4F46E5', '#7C3AED'] },
  { key: 'minimal', label: 'Minimal', colors: ['#1a1a1a', '#444444'] },
  { key: 'bold', label: 'Bold', colors: ['#FF3B30', '#FF9500'] },
  { key: 'vibrant', label: 'Vibrant', colors: ['#00C6AD', '#FF6B9D'] },
];

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी (Hindi)' },
  { code: 'mr', flag: '🇮🇳', name: 'मराठी (Marathi)' },
  { code: 'ta', flag: '🇮🇳', name: 'தமிழ் (Tamil)' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు (Telugu)' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState<Theme>('default');
  const [selectedLang, setSelectedLang] = useState('en');

  const handleTheme = (key: Theme) => {
    setSelectedTheme(key);
    Alert.alert('Theme Changed', `"${key}" theme applied!\n\nNote: In the full app, restart to see theme changes.`);
  };

  const handleLang = (code: string, name: string) => {
    setSelectedLang(code);
    Alert.alert('Language Changed', `Language set to ${name}`);
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
        <Text style={styles.navTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── THEME ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨  Theme Style</Text>
          <View style={styles.themeGrid}>
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.themeTile, selectedTheme === t.key && styles.themeTileActive]}
                onPress={() => handleTheme(t.key)}
              >
                <View style={[styles.themeSwatch, {
                  backgroundColor: t.colors[0],
                }]} />
                <Text style={styles.themeName}>{t.label}</Text>
                {selectedTheme === t.key && (
                  <Text style={styles.themeCheck}>✓</Text>
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
              style={[styles.langItem, selectedLang === l.code && styles.langItemActive]}
              onPress={() => handleLang(l.code, l.name)}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langName, selectedLang === l.code && { color: Colors.primary }]}>
                {l.name}
              </Text>
              {selectedLang === l.code && (
                <Text style={styles.langCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── GENERAL ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️  General</Text>
          {[
            { icon: '🔔', bg: '#EEF2FF', title: 'Notifications', sub: 'Manage alerts & updates' },
            { icon: '🔒', bg: '#FFF7ED', title: 'Privacy Policy', sub: 'How we use your data' },
            { icon: '❓', bg: '#F5F3FF', title: 'Help & Support', sub: 'FAQs and contact us' },
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
            <View style={[styles.settingIcon, { backgroundColor: '#F0FDF4' }]}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  section: { padding: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  themeGrid: { flexDirection: 'row', gap: 8 },
  themeTile: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card },
  themeTileActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  themeSwatch: { width: 32, height: 32, borderRadius: 10, marginBottom: 6 },
  themeName: { fontSize: 11, fontWeight: '600', color: Colors.text },
  themeCheck: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  langItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: Colors.card, borderRadius: 10, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border },
  langItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langFlag: { fontSize: 20 },
  langName: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
  langCheck: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  settingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: Colors.card, borderRadius: 10, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border },
  settingIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  settingSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  arrow: { fontSize: 18, color: Colors.textLight },
  logoutBtn: { backgroundColor: Colors.ignoreLight, borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 14 },
  logoutText: { color: Colors.ignore, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 11, color: Colors.textLight },
});