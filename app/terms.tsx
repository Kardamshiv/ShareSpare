import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const SECTIONS = [
  { title: '1. Eligibility', body: 'ShareSpare is exclusively for enrolled students of participating colleges. You must use your official college email address to register and access the platform.' },
  { title: '2. User Conduct', body: 'Users must interact respectfully. Harassment, spam, or misuse of the platform will result in immediate account suspension without notice.' },
  { title: '3. Requests & Collaboration', body: 'All requests must be campus-related (study, cab, sports). Commercial or inappropriate requests are strictly prohibited.' },
  { title: '4. Privacy', body: 'We collect minimal data required to operate the platform. Your information is never sold to third parties. See our Privacy Policy for details.' },
  { title: '5. Liability', body: 'ShareSpare facilitates connections but is not responsible for the outcome of user interactions. Users meet and collaborate at their own discretion.' },
  { title: '6. Changes', body: 'We reserve the right to update these terms at any time. Continued use of the app after changes means you accept the updated terms.' },
];

export default function TermsScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Terms & Conditions</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>ShareSpare Terms of Use</Text>
        <Text style={styles.intro}>By using ShareSpare, you agree to the following terms. Please read them carefully.</Text>
        {SECTIONS.map(s => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sTitle}>{s.title}</Text>
            <Text style={styles.sBody}>{s.body}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.acceptBtn} onPress={() => router.back()}>
          <Text style={styles.acceptText}>✓  I Accept</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 16, color: Colors.textSecondary },
  navTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  body: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  intro: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 16 },
  section: { marginBottom: 16 },
  sTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 5 },
  sBody: { fontSize: 13, color: Colors.textMuted, lineHeight: 21 },
  acceptBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});