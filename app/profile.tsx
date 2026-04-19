import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { catBg, catIcon, Request } from '../store/AppStore';
import { supabase } from '../lib/supabase';

type TabType = 'posted' | 'accepted';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabType>('posted');
  const [profile, setProfile] = useState<any>(null);
  const [postedItems, setPostedItems] = useState<Request[]>([]);
  const [acceptedItems, setAcceptedItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (userProfile) setProfile(userProfile);

      // Fetch posted
      const { data: postedData } = await supabase.from('requests')
        .select('*')
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false });
        
      if (postedData) {
        setPostedItems(postedData.map(r => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: '', posterName: '', color: r.color,
          accepted: false, isMine: true
        })));
      }

      // Fetch accepted
      const { data: acceptedMemberData } = await supabase.from('request_members')
        .select('requests(*)')
        .eq('user_id', user.id);
        
      if (acceptedMemberData) {
        const acceptedReqs = acceptedMemberData.map((rm: any) => rm.requests).filter(Boolean);
        setAcceptedItems(acceptedReqs.map((r: any) => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: '', posterName: '', color: r.color,
          accepted: true, isMine: false
        })));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const displayItems = tab === 'posted' ? postedItems : acceptedItems;

  return (
    <View style={styles.screen}>

      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <View style={styles.picBox}>
          <Text style={{ fontSize: 30 }}>👨‍💻</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Anonymous User'}</Text>
        <Text style={styles.dept}>Your beautiful profile</Text>
        <Text style={styles.stars}>★★★★★  4.9</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        {[
          [String(postedItems.length), 'Posted'],
          [String(acceptedItems.length), 'Accepted'],
          [String(postedItems.length + acceptedItems.length), 'Helped'],
        ].map(([val, key]) => (
          <View key={key} style={styles.stat}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statKey}>{key}</Text>
          </View>
        ))}
      </View>

      {/* Tab toggle */}
      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'posted' && styles.tabBtnActive]}
          onPress={() => setTab('posted')}
        >
          <Text style={[styles.tabBtnText, tab === 'posted' && styles.tabBtnTextActive]}>
            📤  My Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'accepted' && styles.tabBtnActive]}
          onPress={() => setTab('accepted')}
        >
          <Text style={[styles.tabBtnText, tab === 'accepted' && styles.tabBtnTextActive]}>
            📥  Accepted
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {displayItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{tab === 'posted' ? '📤' : '📥'}</Text>
            <Text style={styles.emptyTitle}>
              {tab === 'posted' ? 'No posts yet' : 'No accepted requests'}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'posted'
                ? 'Tap ＋ to create your first request!'
                : 'Accept requests on the Home feed'}
            </Text>
          </View>
        ) : (
          displayItems.map(r => (
            <View key={r.id} style={styles.histItem}>
              <View style={[styles.histIcon, { backgroundColor: catBg(r.cat) }]}>
                <Text style={{ fontSize: 18 }}>{catIcon(r.cat)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histTitle}>{r.title}</Text>
                <Text style={styles.histMeta}>🕐 {r.time}  ·  📍 {r.loc}</Text>
              </View>
              <View style={[styles.badge, tab === 'posted' ? styles.badgePosted : styles.badgeAccepted]}>
                <Text style={[styles.badgeText, { color: tab === 'posted' ? Colors.primary : Colors.accept }]}>
                  {tab === 'posted' ? 'Posted' : 'Accepted'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center', paddingTop: 55, paddingBottom: 36,
  },
  picBox: {
    width: 70, height: 70, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  dept: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  stars: { color: '#FCD34D', fontSize: 13, marginTop: 6, fontWeight: '600' },
  stats: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: 14, margin: 16, marginTop: -20,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  statVal: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  statKey: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  tabToggle: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 4,
    backgroundColor: Colors.background, borderRadius: 12, padding: 4,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  tabBtn: { flex: 1, padding: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabBtnTextActive: { color: '#fff' },
  histItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: 12, padding: 12,
    marginBottom: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  histIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  histTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  histMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgePosted: { backgroundColor: Colors.primaryLight },
  badgeAccepted: { backgroundColor: Colors.acceptLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});