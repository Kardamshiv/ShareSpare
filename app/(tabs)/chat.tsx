import React, { useRef, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { catIcon, Request } from '../../store/AppStore';
import { supabase } from '../../lib/supabase';

type TabType = 'posted' | 'accepted';

// Per-chat message store
const chatStore: Record<string, { text: string; sent: boolean; time: string }[]> = {
  r2: [
    { text: "Hey! Saw your DSA request 👋", sent: false, time: '9:12 AM' },
    { text: "Great! Which topics are you stuck on?", sent: true, time: '9:14 AM' },
    { text: "Graphs and DP mainly.", sent: false, time: '9:15 AM' },
    { text: "Same! Library Block C, 5 PM?", sent: true, time: '9:16 AM' },
    { text: "Sounds perfect 🙌", sent: false, time: '9:17 AM' },
  ]
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabType>('posted');
  const [openChat, setOpenChat] = useState<Request | null>(null);
  const [msgText, setMsgText] = useState('');
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [postedItems, setPostedItems] = useState<Request[]>([]);
  const [acceptedItems, setAcceptedItems] = useState<Request[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      
      const { data: postedData } = await supabase.from('requests')
        .select('*, profiles(full_name, initials)')
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false });
        
      if (postedData) {
        setPostedItems(postedData.map(r => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: r.profiles?.initials || '??', posterName: r.profiles?.full_name || 'User', color: r.color,
          accepted: false, isMine: true
        })));
      }

      const { data: acceptedMemberData } = await supabase.from('request_members')
        .select('requests(*, profiles(full_name, initials))')
        .eq('user_id', user.id);
        
      if (acceptedMemberData) {
        const acceptedReqs = acceptedMemberData.map((rm: any) => rm.requests).filter(Boolean);
        setAcceptedItems(acceptedReqs.map((r: any) => ({
          id: r.id, title: r.title, cat: r.category as any, time: r.time,
          loc: r.location, poster: r.profiles?.initials || '??', posterName: r.profiles?.full_name || 'User', color: r.color,
          accepted: true, isMine: false
        })));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const listItems = tab === 'posted' ? postedItems : acceptedItems;

  // ── Open a chat room ──
  const handleOpenChat = (req: Request) => {
    if (!chatStore[req.id]) chatStore[req.id] = [
      { text: `Hi! I accepted your request – "${req.title}" 👋`, sent: true, time: 'Just now' }
    ];
    setOpenChat(req);
  };

  // ── Send message ──
  const sendMessage = () => {
    if (!msgText.trim() || !openChat) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chatStore[openChat.id].push({ text: msgText.trim(), sent: true, time: now });
    setMsgText('');
    forceUpdate(n => n + 1);
    scrollRef.current?.scrollToEnd({ animated: true });
    // Auto reply
    setTimeout(() => {
      const replies = ['Got it! 👍', 'See you there 🙌', 'Sounds good!', 'Perfect ✅', 'Thanks!'];
      chatStore[openChat.id].push({
        text: replies[Math.floor(Math.random() * replies.length)],
        sent: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      forceUpdate(n => n + 1);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1200);
  };

  // ── CHAT ROOM VIEW ──
  if (openChat) {
    const msgs = chatStore[openChat.id] || [];
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.screen}>

          {/* Header */}
          <View style={[styles.chatHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setOpenChat(null)}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={[styles.chatAv, { backgroundColor: openChat.color }]}>
              <Text style={styles.chatAvText}>{openChat.poster}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatName}>{openChat.posterName}</Text>
              <Text style={styles.chatStatus}>● Online now</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
              <Text>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Context banner */}
          <View style={styles.contextBanner}>
            <Text style={styles.contextText}>
              {catIcon(openChat.cat)}  {openChat.title}
            </Text>
            <View style={styles.matchedBadge}>
              <Text style={styles.matchedText}>Matched</Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.msgArea}
            contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
          >
            <View style={styles.dateSep}>
              <Text style={styles.dateText}>Today</Text>
            </View>
            {msgs.map((m, i) => (
              <View key={i} style={[styles.msgWrap, m.sent ? styles.msgSent : styles.msgRecv]}>
                <View style={[styles.bubble, m.sent ? styles.bubbleSent : styles.bubbleRecv]}>
                  <Text style={[styles.bubbleText, m.sent && { color: '#fff' }]}>
                    {m.text}
                  </Text>
                </View>
                <Text style={styles.msgTime}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>😊</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message…"
              placeholderTextColor={Colors.textLight}
              value={msgText}
              onChangeText={setMsgText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={{ color: '#fff', fontSize: 14 }}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── CHAT LIST VIEW ──
  return (
    <View style={styles.screen}>
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.navTitle}>Chats</Text>
      </View>

      {/* Tab toggle: Posted / Accepted */}
      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'posted' && styles.tabBtnActive]}
          onPress={() => setTab('posted')}
        >
          <Text style={[styles.tabBtnText, tab === 'posted' && styles.tabBtnTextActive]}>
            📤  Posted
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {listItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{tab === 'posted' ? '📤' : '📥'}</Text>
            <Text style={styles.emptyTitle}>
              {tab === 'posted' ? 'No posts yet' : 'No accepted requests'}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'posted'
                ? 'Tap ＋ to post your first request'
                : 'Accept requests on the Home feed to chat'}
            </Text>
          </View>
        ) : (
          listItems.map(r => {
            const msgs = chatStore[r.id] || [];
            const last = msgs[msgs.length - 1];
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.listItem}
                onPress={() => handleOpenChat(r)}
              >
                <View style={[styles.listAv, { backgroundColor: r.color }]}>
                  <Text style={styles.listAvText}>{r.poster}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{r.posterName}</Text>
                  <Text style={styles.listReq} numberOfLines={1}>
                    {catIcon(r.cat)}  {r.title}
                  </Text>
                  {last && (
                    <Text style={styles.listMsg} numberOfLines={1}>
                      {last.sent ? 'You: ' : ''}{last.text}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {last && <Text style={styles.listTime}>{last.time}</Text>}
                  {msgs.length > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{msgs.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  tabToggle: {
    flexDirection: 'row', margin: 12,
    backgroundColor: Colors.background,
    borderRadius: 12, padding: 4,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1, padding: 9, borderRadius: 9, alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabBtnTextActive: { color: '#fff' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  listAv: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  listAvText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  listReq: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  listMsg: { fontSize: 12, color: Colors.textMuted, marginTop: 2, maxWidth: 180 },
  listTime: { fontSize: 11, color: Colors.textLight },
  unreadBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Chat room
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50,
    backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 16, color: Colors.textSecondary },
  chatAv: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  chatAvText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  onlineDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.accept, borderWidth: 2, borderColor: '#fff',
    position: 'absolute', bottom: -1, right: -1,
  },
  chatName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chatStatus: { fontSize: 11, color: Colors.accept, fontWeight: '500' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  contextBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.acceptLight,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#D1FAE5',
  },
  contextText: { flex: 1, fontSize: 12, color: '#065F46', fontWeight: '500' },
  matchedBadge: { backgroundColor: Colors.accept, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  matchedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  msgArea: { flex: 1, backgroundColor: Colors.background },
  dateSep: { alignSelf: 'center', backgroundColor: Colors.border, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  dateText: { fontSize: 11, color: Colors.textLight },
  msgWrap: { maxWidth: '78%', gap: 3 },
  msgSent: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgRecv: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: 10, borderRadius: 14 },
  bubbleSent: { backgroundColor: Colors.primary, borderBottomRightRadius: 3 },
  bubbleRecv: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 3 },
  bubbleText: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  msgTime: { fontSize: 10, color: Colors.textLight },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, paddingBottom: 24,
    backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  chatInput: {
    flex: 1, backgroundColor: Colors.background,
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: Colors.text,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});