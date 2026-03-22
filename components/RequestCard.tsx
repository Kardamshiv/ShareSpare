import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

// ---------- Types ----------
type Category = 'cab' | 'study' | 'sports';

type Props = {
  title:    string;
  category: Category;
  time:     string;
  location: string;
  poster:   string;       // 2-letter initials e.g. "PM"
  onAccept: () => void;
  onIgnore: () => void;
};

// ---------- Category config ----------
const catConfig = {
  cab: {
    icon: '🚗', label: 'Cab Sharing',
    color: '#92400E', bg: '#FFFBEB',
    avatarBg: ['#F59E0B', '#D97706'],
  },
  study: {
    icon: '📚', label: 'Study Help',
    color: '#065F46', bg: '#ECFDF5',
    avatarBg: ['#10B981', '#059669'],
  },
  sports: {
    icon: '⚽', label: 'Sports',
    color: '#1E40AF', bg: '#EFF6FF',
    avatarBg: ['#3B82F6', '#2563EB'],
  },
};

// ---------- Component ----------
export function RequestCard({
  title, category, time, location, poster, onAccept, onIgnore
}: Props) {

  const cat = catConfig[category];

  return (
    <View style={styles.card}>

      {/* Top row: category badge + avatar */}
      <View style={styles.topRow}>
        <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
          <Text style={styles.catIcon}>{cat.icon}</Text>
          <Text style={[styles.catLabel, { color: cat.color }]}>
            {cat.label}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: cat.avatarBg[0] }]}>
          <Text style={styles.avatarText}>{poster}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Meta: time + location */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>🕐  {time}</Text>
        <Text style={styles.meta}>    📍  {location}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
          <Text style={styles.acceptText}>✓  Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ignoreBtn} onPress={onIgnore}>
          <Text style={styles.ignoreText}>✕  Ignore</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius:    14,
    padding:         14,
    marginBottom:    12,
    marginHorizontal:16,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    // shadow
    shadowColor:   '#000',
    shadowOpacity: 0.06,
    shadowOffset:  { width: 0, height: 2 },
    shadowRadius:  8,
    elevation:     2,
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   8,
  },
  catBadge: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            5,
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:   20,
  },
  catIcon:  { fontSize: 12 },
  catLabel: { fontSize: 11, fontWeight: '700' },
  avatar: {
    width: 30, height: 30,
    borderRadius:   9,
    alignItems:     'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  title: {
    fontSize:    14,
    fontWeight:  '600',
    color:       Colors.text,
    marginBottom: 6,
    lineHeight:  20,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom:  12,
  },
  meta: { fontSize: 11, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    flex:            1,
    backgroundColor: Colors.accept,
    padding:         9,
    borderRadius:    8,
    alignItems:      'center',
  },
  acceptText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  ignoreBtn: {
    flex:            1,
    backgroundColor: Colors.ignoreLight,
    borderWidth:     1.5,
    borderColor:     '#FECACA',
    padding:         9,
    borderRadius:    8,
    alignItems:      'center',
  },
  ignoreText: { color: Colors.ignore, fontWeight: '600', fontSize: 12 },
});