import { useRouter } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RequestCard } from '../../components/RequestCard';
import { useSettings } from '../../store/SettingsProvider';
import {
  Request,
  catLabel
} from '../../store/AppStore';
import { useRequests } from '../../hooks/useRequests';

type FilterType = 'all' | 'cab' | 'study' | 'sports';

const CHIPS: { labelKey: string; value: FilterType }[] = [
  { labelKey: 'All', value: 'all' },
  { labelKey: 'Cab', value: 'cab' },
  { labelKey: 'Study', value: 'study' },
  { labelKey: 'Sports', value: 'sports' },
];

// Remote syncing is now handled by Supabase

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, t } = useSettings();
  const styles = getStyles(colors);
  const { requests: liveRequests, loading, fetchRequests } = useRequests();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setNotifModalVisible(true);
    setHasNewNotifications(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  // Sync hook data to local state for temporary local mutations (like ignoring/accepting until db updates)
  React.useEffect(() => {
    setRequests(liveRequests);
  }, [liveRequests]);

  // Realtime Notification dots
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const channel = supabase.channel(`notif-alert-${user.id}-${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          setHasNewNotifications(true);
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    });
  }, []);

  // Search results
  const searchResults = search.trim()
    ? requests.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.cat.includes(search.toLowerCase()) ||
      r.loc.toLowerCase().includes(search.toLowerCase()) ||
      r.posterName.toLowerCase().includes(search.toLowerCase())
    )
    : null;

  // Filtered feed
  const feedItems = requests.filter(r =>
    filter === 'all' || r.cat === filter
  );

  const handleAccept = useCallback(async (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, accepted: true } : r)
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('request_members').insert({
        request_id: id,
        user_id: user.id
      });
      if (error && error.code !== '23505') {
        Alert.alert('Error', error.message);
        return;
      }
      
      const targetRequest = requests.find(r => r.id === id);
      if (targetRequest && targetRequest.posterId) {
        const user1 = user.id < targetRequest.posterId ? user.id : targetRequest.posterId;
        const user2 = user.id > targetRequest.posterId ? user.id : targetRequest.posterId;
        await supabase.from('chats').insert({ user1_id: user1, user2_id: user2 }).select().single();
        // Ignore unique constraint errors here; if it fails, the chat already exists, which is fine
        
        // Setup Notification
        const { data: myProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        const myName = myProfile?.full_name || 'Someone';
        await supabase.from('notifications').insert({
          user_id: targetRequest.posterId,
          icon: '✅',
          background_color: '#ECFDF5',
          text: `${user.id}|Your request has been accepted by ${myName}`
        });

        // Auto-redirect removed: User will click the Chat button manually if they wish.
      }
    }
  }, [requests, router]);

  const [ignoredRequests, setIgnoredRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('ignored_requests').then(val => {
        if (val) setIgnoredRequests(new Set(JSON.parse(val)));
      });
    });
  }, []);

  const handleIgnore = useCallback(async (id: string) => {
    // Hide it locally immediately
    setRequests(prev => prev.filter(r => r.id !== id));
    
    // Save to AsyncStorage
    setIgnoredRequests(prev => {
      const next = new Set(prev).add(id);
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem('ignored_requests', JSON.stringify(Array.from(next)));
      });
      return next;
    });
  }, []);
  const handleDelete = useCallback(async (id: string) => {
    // Optimistic UI update
    setRequests(prev => prev.filter(r => r.id !== id));
    
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'Failed to delete request: ' + error.message);
      // Re-fetch to restore state if it failed
      fetchRequests();
    } else {
      Alert.alert('Deleted', 'Your request has been removed.');
    }
  }, [fetchRequests]);

  const displayList = (searchResults ?? feedItems).filter(r => !ignoredRequests.has(r.id));

  return (
    <View style={styles.screen}>

      {/* ── Navbar ── */}
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.greeting}>{t('Good morning')}</Text>
          <Text style={styles.navLogo}>ShareSpare</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={loadNotifications}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {hasNewNotifications && (
              <View style={{position: 'absolute', top: -3, right: -3, backgroundColor: '#EF4444', width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.card}}/>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Text style={{ fontSize: 14, color: colors.textLight }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search requests...')}
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

    {/* ── Chips (hidden during search) ── */}
      {!search && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={{ maxHeight: 52 }}
        >
          {CHIPS.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.chip,
                filter === c.value && styles.chipActive,
                { width: 90, height: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 0, paddingVertical: 0 }
              ]}
              onPress={() => setFilter(c.value)}
            >
              <Text style={[
                styles.chipText,
                filter === c.value && styles.chipTextActive
              ]}>
                {t(c.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Search result count ── */}
      {searchResults && (
        <View style={styles.searchCountRow}>
          <Text style={styles.searchCount}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
          </Text>
        </View>
      )}

      {/* ── Feed / Search Results ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {!searchResults && (
          <View style={styles.sectionHdr}>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? t('Latest Requests') : `${catLabel(filter as any)} Requests`}
            </Text>
            <Text style={styles.seeAll}>{t('See all')}</Text>
          </View>
        )}

        {loading ? (
          <View style={[styles.emptyWrap, { paddingTop: 40 }]}>
            <Text style={styles.emptyTitle}>{t('Loading requests...')}</Text>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {searchResults ? t('No results found') : t('No requests here')}
            </Text>
            <Text style={styles.emptySub}>
              {searchResults
                ? `Try searching for "cab", "study" or a person's name`
                : t('Be the first to post')}
            </Text>
          </View>
        ) : (
          displayList.map(r => (
            <RequestCard
              key={r.id}
              {...r}
              category={r.cat}
              location={r.loc}
              maxMembers={r.maxMembers}
              currentMembers={r.currentMembers}
              isMine={r.isMine}
              onAccept={() => handleAccept(r.id)}
              onIgnore={() => handleIgnore(r.id)}
              onDelete={() => handleDelete(r.id)}
              onChat={() => {
                router.push({ pathname: '/chat', params: { targetUserId: r.posterId } });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal visible={notifModalVisible} transparent animationType="slide" onRequestClose={() => setNotifModalVisible(false)}>
         <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'}}>
            <View style={{backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: '60%', paddingBottom: 40}}>
               <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                 <Text style={{fontSize: 18, fontWeight: '700', color: colors.text}}>{t('Notifications')}</Text>
                 <TouchableOpacity onPress={() => setNotifModalVisible(false)}><Text style={{fontSize: 22, color: colors.textMuted}}>✕</Text></TouchableOpacity>
               </View>
               <ScrollView>
                 {notifications.length === 0 ? (
                    <Text style={{color: colors.textMuted, textAlign: 'center', marginTop: 40}}>{t('No notifications yet.')}</Text>
                 ) : (
                    notifications.map(n => {
                      const parts = n.text.split('|');
                      const hasAction = parts.length > 1;
                      const senderId = hasAction ? parts[0] : null;
                      const msg = hasAction ? parts.slice(1).join('|') : parts[0];
                      return (
                         <View key={n.id} style={{backgroundColor: colors.card, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border}}>
                           <Text style={{fontSize: 14, color: colors.text, fontWeight: '500'}}>{n.icon} {msg}</Text>
                           {hasAction && senderId && (
                             <View style={{flexDirection: 'row', gap: 10, marginTop: 14}}>
                               <TouchableOpacity style={{flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center'}} onPress={() => { setNotifModalVisible(false); router.push({ pathname: '/chat', params: { targetUserId: senderId } }); }}>
                                  <Text style={{color: colors.primaryTextAuto, fontWeight: '700'}}>{t('Chat')}</Text>
                               </TouchableOpacity>
                               <TouchableOpacity style={{flex: 1, backgroundColor: colors.background, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border}} onPress={async () => {
                                  setNotifications(prev => prev.filter(x => x.id !== n.id));
                                  await supabase.from('notifications').delete().eq('id', n.id);
                               }}>
                                  <Text style={{color: colors.text, fontWeight: '700'}}>{t('Ignore')}</Text>
                               </TouchableOpacity>
                             </View>
                           )}
                         </View>
                      )
                    })
                 )}
               </ScrollView>
            </View>
         </View>
      </Modal>

    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: 11, color: colors.textMuted },
  navLogo: { fontSize: 18, fontWeight: '700', color: colors.primary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.primaryTextAuto, fontSize: 12, fontWeight: '700' },
  searchWrap: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.background, borderRadius: 10,
    padding: 10, borderWidth: 1.5, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  chipsRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0, gap: 6 },
  chip: {
    borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.primaryTextAuto },
  searchCountRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.background },
  searchCount: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  sectionHdr: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  seeAll: { fontSize: 12, fontWeight: '600', color: colors.primary },
  emptyWrap: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});