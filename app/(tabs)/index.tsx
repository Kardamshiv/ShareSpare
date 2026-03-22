import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { RequestCard } from '../../components/RequestCard';
import { Colors } from '../../constants/Colors';

const REQUESTS = [
  {
    id:       '1',
    title:    'Cab to Airport – Sunday 6 AM',
    category: 'cab'    as const,
    time:     '6:00 AM, Sun',
    location: 'Gate B',
    poster:   'PM',
  },
  {
    id:       '2',
    title:    'DSA prep – need study partner for placements',
    category: 'study'  as const,
    time:     '2 hrs/day',
    location: 'Library, Block C',
    poster:   'AP',
  },
  {
    id:       '3',
    title:    'Need cricket partner – Saturday 4 PM',
    category: 'sports' as const,
    time:     'Sat, 4:00 PM',
    location: 'Ground A',
    poster:   'KN',
  },
];

const CHIPS = ['All', '🚗 Cab', '📚 Study', '⚽ Sports', '📍 Near Me'];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>

      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>ShareSpare</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
          </View>
        </View>
      </View>

      {/* ── Greeting ── */}
      <View style={styles.greeting}>
        <Text style={styles.greetTitle}>Good morning ☀️</Text>
        <Text style={styles.greetSub}>3 new requests near you</Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 14, color: Colors.textLight }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests, people…"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CHIPS.map((chip, i) => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, i === 0 && styles.chipActive]}
          >
            <Text style={[
              styles.chipText,
              i === 0 && styles.chipTextActive
            ]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Cards ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.sectionHdr}>
          <Text style={styles.sectionTitle}>Latest Requests</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {REQUESTS.map(r => (
          <RequestCard
            key={r.id}
            {...r}
            onAccept={() => console.log('Accepted:', r.id)}
            onIgnore={() => console.log('Ignored:', r.id)}
          />
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  navbar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navLogo:  { fontSize: 18, fontWeight: '700', color: Colors.primary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: Colors.background,
    borderWidth:     1,
    borderColor:     Colors.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatar: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  greeting:   { padding: 16, paddingBottom: 4 },
  greetTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  greetSub:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  searchBar: {
    flexDirection:   'row',
    alignItems:      'center',
    margin:          16,
    marginBottom:    8,
    backgroundColor: Colors.card,
    borderRadius:    10,
    padding:         10,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    gap:             8,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },

  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    gap:               8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       Colors.border,
    backgroundColor:   Colors.card,
  },
  chipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  chipTextActive: { color: '#fff' },

  sectionHdr: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  seeAll:       { fontSize: 12, fontWeight: '600', color: Colors.primary },
});