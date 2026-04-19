import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Request } from '../../store/AppStore';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: postedData } = await supabase.from('requests')
        .select('*, profiles(full_name, initials)')
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false });

      const { data: acceptedMemberData } = await supabase.from('request_members')
        .select('requests(*, profiles(full_name, initials))')
        .eq('user_id', user.id);

      const allReqs: any[] = [];
      if (postedData) {
        allReqs.push(...postedData.map(r => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: r.profiles?.initials || '??', posterName: r.profiles?.full_name || 'User', color: r.color,
          role: 'Posted'
        })));
      }
      
      if (acceptedMemberData) {
        const acc = acceptedMemberData.map((rm: any) => rm.requests).filter(Boolean);
        allReqs.push(...acc.map((r: any) => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: r.profiles?.initials || '??', posterName: r.profiles?.full_name || 'User', color: r.color,
          role: 'Accepted'
        })));
      }

      // Keep unique
      const uniqueReqs = Array.from(new Map(allReqs.map(item => [item.id, item])).values());
      setHistory(uniqueReqs);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const searchResults = search.trim()
    ? history.filter((r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.posterName.toLowerCase().includes(search.toLowerCase())
    )
    : history;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>History ⏳</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Text style={{ fontSize: 14, color: Colors.textLight }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search request history…"
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Request History</Text>
        {loading ? (
           <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : searchResults.length === 0 ? (
           <Text style={{ color: Colors.textMuted }}>No history found.</Text>
        ) : searchResults.map((r: any) => (
          <View key={r.id + r.role} style={styles.card}>
            <Text style={styles.cardText}>{r.title}</Text>
            <Text style={styles.cardSub}>Posted by {r.posterName} · {r.role}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Reviews Given</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>⭐⭐⭐⭐⭐ to Alex</Text>
          <Text style={styles.cardSub}>"Great ride, very punctual!"</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>⭐⭐⭐⭐ to Sam</Text>
          <Text style={styles.cardSub}>"Good study session."</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  searchWrap: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.background, borderRadius: 10,
    padding: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  card: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardText: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textMuted },
});
