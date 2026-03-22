import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';

const CATEGORIES = [
  { icon: '🚗', label: 'Cab Sharing', count: 12, color: '#F59E0B', bg: '#FFFBEB' },
  { icon: '📚', label: 'Study Help',  count: 8,  color: '#10B981', bg: '#ECFDF5' },
  { icon: '⚽', label: 'Sports',      count: 5,  color: '#3B82F6', bg: '#EFF6FF' },
  { icon: '🎭', label: 'Other',       count: 3,  color: '#8B5CF6', bg: '#F5F3FF' },
];

const TRENDING = [
  { icon: '🚗', bg: '#FFFBEB', title: 'Cab pool to City Mall',        meta: '📍 Gate A  🕐 Sat 3 PM',  count: '4 joined' },
  { icon: '📚', bg: '#ECFDF5', title: 'Machine Learning exam prep',   meta: '📍 Lab 2   🕐 Today 6 PM', count: '6 joined' },
  { icon: '⚽', bg: '#EFF6FF', title: '5-a-side football match',      meta: '📍 Ground B 🕐 Sun 5 PM',  count: '8 joined' },
];

export default function ExploreScreen() {
  return (
    <View style={styles.screen}>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Explore Campus 🎓</Text>
        <Text style={styles.heroSub}>Find students who share your needs</Text>
        <View style={styles.heroSearch}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>🔍</Text>
          <TextInput
            style={styles.heroInput}
            placeholder="Search categories, requests…"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Category grid */}
        <View style={styles.sectionHdr}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <View style={styles.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.label}
              style={[styles.catTile, { backgroundColor: c.bg }]}
            >
              <Text style={styles.catIcon}>{c.icon}</Text>
              <Text style={[styles.catLabel, { color: c.color }]}>{c.label}</Text>
              <View style={[styles.catCount, { backgroundColor: c.color + '22' }]}>
                <Text style={[styles.catCountText, { color: c.color }]}>
                  {c.count} active
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <View style={styles.sectionHdr}>
          <Text style={styles.sectionTitle}>Trending Near You</Text>
          <Text style={styles.seeAll}>Refresh</Text>
        </View>
        {TRENDING.map(t => (
          <TouchableOpacity key={t.title} style={styles.trendCard}>
            <View style={[styles.trendIcon, { backgroundColor: t.bg }]}>
              <Text style={{ fontSize: 18 }}>{t.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trendTitle}>{t.title}</Text>
              <Text style={styles.trendMeta}>{t.meta}</Text>
            </View>
            <Text style={styles.trendCount}>{t.count}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primary,
    padding:         16,
    paddingTop:      50,
    paddingBottom:   20,
  },
  heroTitle:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  heroSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroSearch: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius:    10,
    padding:         10,
    marginTop:       12,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.3)',
  },
  heroInput: { flex: 1, fontSize: 13, color: '#fff' },
  sectionHdr: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  seeAll:       { fontSize: 12, fontWeight: '600', color: Colors.primary },
  catGrid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: 16,
    gap:               10,
  },
  catTile: {
    width:         '47%',
    borderRadius:  14,
    padding:       16,
  },
  catIcon:  { fontSize: 28, marginBottom: 6 },
  catLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  catCount: {
    alignSelf:         'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      20,
  },
  catCountText: { fontSize: 11, fontWeight: '600' },
  trendCard: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              10,
    backgroundColor:  Colors.card,
    borderRadius:     12,
    padding:          12,
    marginHorizontal: 16,
    marginBottom:     10,
    borderWidth:      1.5,
    borderColor:      Colors.border,
  },
  trendIcon: {
    width: 40, height: 40,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  trendTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  trendMeta:  { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  trendCount: { fontSize: 12, fontWeight: '700', color: Colors.primary },
});