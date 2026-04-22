import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export function Navbar({
  title = 'ShareSpare',
  showBack = false,
  onBack,
  rightElement,
}: Props) {
  return (
    <View style={styles.navbar}>

      {/* Left: back button or logo */}
      {showBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.logo}>ShareSpare</Text>
      )}

      {/* Center title (only when back is shown) */}
      {showBack && (
        <Text style={styles.centerTitle}>{title}</Text>
      )}

      {/* Right side */}
      <View style={styles.rightSlot}>
        {rightElement ?? <View style={{ width: 34 }} />}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 16, color: Colors.textSecondary },
  centerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  rightSlot: { minWidth: 34, alignItems: 'flex-end' },
});