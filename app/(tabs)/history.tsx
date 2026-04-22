import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../../store/SettingsProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Request } from '../../store/AppStore';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, t } = useSettings();
  const styles = getStyles(colors);
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
      <View style={[styles.header, { paddingTop: insets.top + 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={styles.title}>{t('History Title')}</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={() => {
            Alert.alert('Clear History', 'Are you sure you want to clear your local history view?', [
               { text: 'Cancel', style: 'cancel' },
               { text: 'Clear', style: 'destructive', onPress: () => setHistory([]) }
            ]);
          }}>
            <Text style={{color: '#EF4444', fontWeight: '600'}}>Clear History</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Text style={{ fontSize: 14, color: colors.textLight }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search history')}
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('Request History')}</Text>
        {loading ? (
           <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : searchResults.length === 0 ? (
           <Text style={{ color: colors.textMuted }}>{t('No history found')}</Text>
        ) : searchResults.map((r: any) => (
          <TouchableOpacity 
            key={r.id + r.role} 
            style={styles.card}
            onPress={() => router.push({ pathname: '/(tabs)/chat', params: { reqId: r.id } })}
          >
            <Text style={styles.cardText}>{r.title}</Text>
            <Text style={styles.cardSub}>Posted by {r.posterName} · {t(r.role)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('Reviews Given')}</Text>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => Alert.alert('User Profile - Alex', 'Major: Computer Science\nRating: 5.0 (23 Reviews)\nBio: Always happy to share rides to the library.')}
        >
          <Text style={styles.cardText}>⭐⭐⭐⭐⭐ to Alex</Text>
          <Text style={styles.cardSub}>"Great ride, very punctual!"</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => Alert.alert('User Profile - Sam', 'Major: Mechanical Engineering\nRating: 4.8 (12 Reviews)\nBio: Need help with math and physics? Connect with me!')}
        >
          <Text style={styles.cardText}>⭐⭐⭐⭐ to Sam</Text>
          <Text style={styles.cardSub}>"Good study session."</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  searchWrap: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.background, borderRadius: 10,
    padding: 10, borderWidth: 1.5, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardText: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.textMuted },
});
