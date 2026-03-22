import { useRouter } from 'expo-router';
import {
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.primary }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Text style={{ fontSize: 32 }}>🤝</Text>
        </View>
        <Text style={styles.appName}>ShareSpare</Text>
        <Text style={styles.tagline}>Your campus, better together.</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>Sign in with your college email</Text>

        <Text style={styles.label}>College Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@college.edu.in"
          placeholderTextColor={Colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.btnText}>Continue →</Text>
        </TouchableOpacity>

        <View style={styles.divRow}>
          <View style={styles.divLine} />
          <Text style={styles.divLabel}>OR</Text>
          <View style={styles.divLine} />
        </View>

        <TouchableOpacity
          style={styles.btnGoogle}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.btnGoogleText}>🔵  Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          New here?{'  '}
          <Text style={{ color: Colors.primary, fontWeight: '600' }}>
            Create account
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems:    'center',
    paddingTop:    70,
    paddingBottom: 44,
  },
  logoBox: {
    width: 72, height: 72,
    borderRadius:    22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.35)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
  },
  appName:  { fontSize: 28, fontWeight: '700', color: '#fff' },
  tagline:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  card: {
    flex:                1,
    backgroundColor:     Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius:28,
    padding:             28,
    paddingBottom:       50,
  },
  title:    { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 24 },
  label: {
    fontSize: 12, fontWeight: '600',
    color: Colors.textSecondary, marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth:  1.5,
    borderColor:  Colors.border,
    borderRadius: 10,
    padding:      12,
    fontSize:     14,
    color:        Colors.text,
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius:    10,
    padding:         15,
    alignItems:      'center',
    marginBottom:    16,
  },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  divRow:    { flexDirection:'row', alignItems:'center', marginBottom: 16 },
  divLine:   { flex: 1, height: 1, backgroundColor: Colors.border },
  divLabel:  { marginHorizontal: 10, fontSize: 11, color: Colors.textLight },
  btnGoogle: {
    borderWidth:  1.5,
    borderColor:  Colors.border,
    borderRadius: 10,
    padding:      13,
    alignItems:   'center',
    marginBottom: 20,
  },
  btnGoogleText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  footer:        { textAlign: 'center', fontSize: 12, color: Colors.textMuted },
});