import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';

const HISTORY = [
  { icon:'🚗', bg:'#FFFBEB', name:'Cab to Airport – Friday',   date:'Dec 12, 2024', type:'posted'   },
  { icon:'📚', bg:'#ECFDF5', name:'DSA Study Group',            date:'Dec 10, 2024', type:'accepted' },
  { icon:'⚽', bg:'#EFF6FF', name:'Cricket partner – Sunday',   date:'Dec 8, 2024',  type:'accepted' },
  { icon:'🚗', bg:'#FFFBEB', name:'Cab to Railway Station',     date:'Dec 5, 2024',  type:'posted'   },
];

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.picBox}>
          <Text style={{ fontSize: 32 }}>👨‍💻</Text>
        </View>
        <Text style={styles.name}>Rahul Kumar</Text>
        <Text style={styles.dept}>B.Tech CSE · 3rd Year · MIT Pune</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.ratingVal}>4.9 (21 reviews)</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[['14','Posted'],['9','Accepted'],['23','Helped']].map(([val,key]) => (
          <View key={key} style={styles.stat}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statKey}>{key}</Text>
          </View>
        ))}
      </View>

      {/* History */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Request History</Text>
        {HISTORY.map(h => (
          <TouchableOpacity key={h.name} style={styles.histItem}>
            <View style={[styles.histIcon, { backgroundColor: h.bg }]}>
              <Text style={{ fontSize: 18 }}>{h.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.histName}>{h.name}</Text>
              <Text style={styles.histDate}>{h.date}</Text>
            </View>
            <View style={[
              styles.badge,
              h.type === 'posted'
                ? styles.badgePosted
                : styles.badgeAccepted
            ]}>
              <Text style={[
                styles.badgeText,
                { color: h.type === 'posted' ? Colors.primary : Colors.accept }
              ]}>
                {h.type === 'posted' ? 'Posted' : 'Accepted'}
              </Text>
            </View>
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
    alignItems:      'center',
    paddingTop:      55,
    paddingBottom:   36,
  },
  picBox: {
    width: 74, height: 74,
    borderRadius:    22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.4)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  name:      { fontSize: 20, fontWeight: '700', color: '#fff' },
  dept:      { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  ratingRow: { flexDirection:'row', alignItems:'center', gap:6, marginTop:6 },
  stars:     { color: '#FCD34D', fontSize: 14, letterSpacing: 2 },
  ratingVal: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight:'600' },
  statsRow: {
    flexDirection:   'row',
    backgroundColor: Colors.card,
    borderRadius:    16,
    margin:          16,
    marginTop:       -20,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOpacity:   0.08,
    shadowRadius:    8,
    elevation:       3,
  },
  stat: {
    flex:           1,
    alignItems:     'center',
    paddingVertical:14,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statVal: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  statKey: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize:    15,
    fontWeight:  '700',
    color:       Colors.text,
    marginBottom:12,
  },
  histItem: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: Colors.card,
    borderRadius:    12,
    padding:         12,
    marginBottom:    10,
    borderWidth:     1.5,
    borderColor:     Colors.border,
  },
  histIcon: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  histName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  histDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      8,
  },
  badgePosted:   { backgroundColor: '#EEF2FF' },
  badgeAccepted: { backgroundColor: Colors.acceptLight },
  badgeText:     { fontSize: 11, fontWeight: '700' },
});