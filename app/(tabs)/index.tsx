import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RequestCard } from '../../components/RequestCard';
import { Colors } from '../../constants/Colors';
import {
  Request,
  catLabel
} from '../../store/AppStore';
import { useRequests } from '../../hooks/useRequests';

type FilterType = 'all' | 'cab' | 'study' | 'sports';

const CHIPS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: '🚗 Cab', value: 'cab' },
  { label: '📚 Study', value: 'study' },
  { label: '⚽ Sports', value: 'sports' },
];

// Remote syncing is now handled by Supabase

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requests: liveRequests, loading, fetchRequests } = useRequests();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  // Sync hook data to local state for temporary local mutations (like ignoring/accepting until db updates)
  React.useEffect(() => {
    setRequests(liveRequests);
  }, [liveRequests]);

  // Search results
  const searchResults = search.trim()
    ? requests.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.cat.includes(search.toLowerCase()) ||
      r.loc.toLowerCase().includes(search.toLowerCase()) ||
      r.posterName.toLowerCase().includes(search.toLowerCase())
    )
    : null;

  // Filtered feed
  const feedItems = requests.filter(r =>
    filter === 'all' || r.cat === filter
  );

  const handleAccept = useCallback(async (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, accepted: true } : r)
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('request_members').insert({
        request_id: id,
        user_id: user.id
      });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
    }
    Alert.alert('✅ Accepted!', 'You can now chat with this person.');
  }, []);

  const handleIgnore = useCallback((id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  }, []);

  const displayList = searchResults ?? feedItems;

  return (
    <View style={styles.screen}>

      {/* ── Navbar ── */}
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.greeting}>Good morning ☀️</Text>
          <Text style={styles.navLogo}>ShareSpare</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Text style={{ fontSize: 14, color: Colors.textLight }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests, people, locations…"
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ fontSize: 14, color: Colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

    {/* ── Chips (hidden during search) ── */}
      {!search && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CHIPS.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.chip,
                filter === c.value && styles.chipActive,
                { width: 90, height: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 0, paddingVertical: 0 }
              ]}
              onPress={() => setFilter(c.value)}
            >
              <Text style={[
                styles.chipText,
                filter === c.value && styles.chipTextActive
              ]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Search result count ── */}
      {searchResults && (
        <View style={styles.searchCountRow}>
          <Text style={styles.searchCount}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
          </Text>
        </View>
      )}

      {/* ── Feed / Search Results ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {!searchResults && (
          <View style={styles.sectionHdr}>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'Latest Requests' : `${catLabel(filter as any)} Requests`}
            </Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
        )}

        {loading ? (
          <View style={[styles.emptyWrap, { paddingTop: 40 }]}>
            <Text style={styles.emptyTitle}>Loading requests...</Text>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {searchResults ? 'No results found' : 'No requests here'}
            </Text>
            <Text style={styles.emptySub}>
              {searchResults
                ? `Try searching for "cab", "study" or a person's name`
                : 'Be the first to post a request!'}
            </Text>
          </View>
        ) : (
          displayList.map(r => (
            <RequestCard
              key={r.id}
              {...r}
              category={r.cat}
              location={r.loc}
              maxMembers={r.maxMembers}
              currentMembers={r.currentMembers}
              onAccept={() => handleAccept(r.id)}
              onIgnore={() => handleIgnore(r.id)}
              onChat={() => {
                router.push('/chat');
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontSize: 11, color: Colors.textMuted },
  navLogo: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  searchWrap: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.background, borderRadius: 10,
    padding: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  chip: {
    borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  chipTextActive: { color: '#fff' },
  searchCountRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.background },
  searchCount: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  sectionHdr: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  seeAll: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  emptyWrap: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});