import { StyleSheet, Text, View } from 'react-native';

type Props = {
  type: 'cab' | 'study' | 'sports';
};

const config = {
  cab:    { icon: '🚗', label: 'Cab',   color: '#92400E', bg: '#FFFBEB' },
  study:  { icon: '📚', label: 'Study', color: '#065F46', bg: '#ECFDF5' },
  sports: { icon: '⚽', label: 'Sport', color: '#1E40AF', bg: '#EFF6FF' },
};

export function CategoryBadge({ type }: Props) {
  const c = config[type];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={styles.icon}>{c.icon}</Text>
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      20,
    alignSelf:         'flex-start',
  },
  icon:  { fontSize: 11 },
  label: { fontSize: 11, fontWeight: '700' },
});