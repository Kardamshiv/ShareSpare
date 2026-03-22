import {
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';

const CATS = [
  { key: 'cab',    icon: '🚗', label: 'Cab Sharing' },
  { key: 'study',  icon: '📚', label: 'Study Help'  },
  { key: 'sports', icon: '⚽', label: 'Sports'      },
];

export default function PostScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Post a Request</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Category</Text>
        <View style={styles.catRow}>
          {CATS.map((c, i) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catOpt, i === 0 && styles.catOptActive]}
            >
              <Text style={styles.catIcon}>{c.icon}</Text>
              <Text style={styles.catLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Request Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Need cab to railway station"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Add more details…"
          placeholderTextColor={Colors.textLight}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.rowTwo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="📅 Dec 15"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="🕐 6:00 AM"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="📍 e.g., Gate B, Hostel Block 3"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Duration</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., One-time, 2 hours"
          placeholderTextColor={Colors.textLight}
        />

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>🚀  Post Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    paddingHorizontal: 16,
    paddingVertical:   14,
    paddingTop:        50,
    backgroundColor:   Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  body:     { padding: 16, paddingBottom: 40 },
  label: {
    fontSize:    12,
    fontWeight:  '600',
    color:       Colors.textSecondary,
    marginBottom: 6,
    marginTop:   14,
  },
  catRow: { flexDirection: 'row', gap: 8 },
  catOpt: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 12,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    backgroundColor: Colors.card,
  },
  catOptActive: {
    borderColor:     Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  catIcon:  { fontSize: 22, marginBottom: 4 },
  catLabel: { fontSize: 10, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.background,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    10,
    padding:         12,
    fontSize:        13,
    color:           Colors.text,
  },
  rowTwo:    { flexDirection: 'row', gap: 10 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    12,
    padding:         16,
    alignItems:      'center',
    marginTop:       24,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});