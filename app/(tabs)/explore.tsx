import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../store/SettingsProvider';
import { catBg, catIcon, catLabel, initialRequests } from '../../store/AppStore';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = getStyles(colors);
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? initialRequests.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.cat.includes(query.toLowerCase()) ||
      r.loc.toLowerCase().includes(query.toLowerCase())
    )
    : null;

  return (
    <View style={styles.screen}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.heroTitle}>Explore Campus 🎓</Text>
        <Text style={styles.heroSub}>Find students who share your needs</Text>
        <View style={styles.heroSearch}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>🔍</Text>
          <TextInput
            style={styles.heroInput}
            placeholder="Search categories, requests…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Search results */}
        {results ? (
          <View>
            <View style={styles.sectionHdr}>
              <Text style={styles.sectionTitle}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</Text>
            </View>
            {results.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySub}>Try "cab", "study", or "sports"</Text>
              </View>
            ) : results.map(r => (
              <View key={r.id} style={styles.resultCard}>
                <View style={[styles.resultIcon, { backgroundColor: catBg(r.cat) }]}>
                  <Text style={{ fontSize: 18 }}>{catIcon(r.cat)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>{r.title}</Text>
                  <Text style={styles.resultMeta}>🕐 {r.time}  ·  📍 {r.loc}  ·  by {r.posterName}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          // Default view
          <>
            <View style={styles.sectionHdr}>
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={styles.catGrid}>
              {[
                { cat: 'cab',    bg: ['#F59E0B', '#D97706'], sub: 'Split ride costs' },
                { cat: 'study',  bg: ['#10B981', '#059669'], sub: 'Find study partners' },
                { cat: 'sports', bg: ['#3B82F6', '#2563EB'], sub: 'Join games' },
                { cat: 'other',  bg: ['#8B5CF6', '#7C3AED'], sub: 'Everything else' },
              ].map(c => (
                <TouchableOpacity
                  key={c.cat}
                  style={[styles.catTile, { backgroundColor: c.bg[0] }]}
                  onPress={() => setQuery(c.cat)}
                >
                  <Text style={styles.ctIcon}>{c.cat === 'other' ? '🎭' : catIcon(c.cat as any)}</Text>
                  <Text style={styles.ctLabel}>{c.cat === 'other' ? 'Other' : catLabel(c.cat as any)}</Text>
                  <Text style={styles.ctSub}>{c.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHdr}>
              <Text style={styles.sectionTitle}>Trending Near You</Text>
              <Text style={styles.seeAll}>Refresh</Text>
            </View>
            {initialRequests.slice(0, 3).map(r => (
              <View key={r.id} style={styles.trendCard}>
                <View style={[styles.trendIcon, { backgroundColor: catBg(r.cat) }]}>
                  <Text style={{ fontSize: 18 }}>{catIcon(r.cat)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trendTitle}>{r.title}</Text>
                  <Text style={styles.trendMeta}>📍 {r.loc}  ·  🕐 {r.time}</Text>
                </View>
                <Text style={styles.trendCount}>{Math.floor(Math.random() * 8) + 2} joined</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    padding: 16, paddingTop: 52, paddingBottom: 20,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.primaryTextAuto },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10, padding: 10, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroInput: { flex: 1, fontSize: 13, color: colors.primaryTextAuto },
  sectionHdr: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  seeAll: { fontSize: 12, fontWeight: '600', color: colors.primary },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  catTile: { width: (Dimensions.get('window').width - 42) / 2, borderRadius: 14, padding: 16 },
  ctIcon: { fontSize: 28, marginBottom: 6 },
  ctLabel: { fontSize: 14, fontWeight: '700', color: colors.primaryTextAuto },
  ctSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  trendCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 12, padding: 12,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border,
  },
  trendIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trendTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  trendMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  trendCount: { fontSize: 12, fontWeight: '700', color: colors.primary },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  resultIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});