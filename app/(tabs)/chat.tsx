import React, { useRef, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  LayoutAnimation,
  UIManager,
  Image,
  Animated,
  Linking,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../store/SettingsProvider';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  // Legacy flag, no-op in New Architecture, safely handled by Expo internally now
}

// Live Message Type
type MessageType = {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

type ChatItem = {
  id: string;
  otherUserId: string;
  name: string;
  initials: string;
  color: string;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors, t, unreadChats, clearUnreadChat } = useSettings();
  const styles = getStyles(colors);
  
  const [openChat, setOpenChat] = useState<ChatItem | null>(null);
  const [msgText, setMsgText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<MessageType[]>([]);

  // Menu States
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [mutedChats, setMutedChats] = useState<Set<string>>(new Set());
  const [chatThemes, setChatThemes] = useState<Record<string, string>>({});
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
  const [deletedChats, setDeletedChats] = useState<Set<string>>(new Set());
  const [ignoredChats, setIgnoredChats] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  // ── Voice Recording States ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordSecs, setRecordSecs] = useState(0);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micPulse = useRef(new Animated.Value(1)).current;
  const micPulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      setCurrentUser(user);
      
      const { data: myChats } = await supabase.from('chats')
        .select(`
          id,
          user1:profiles!user1_id(id, full_name, initials),
          user2:profiles!user2_id(id, full_name, initials)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
      if (myChats) {
        setChatList(myChats.map((c: any) => {
          const isUser1 = c.user1.id === user.id;
          const otherUser = isUser1 ? c.user2 : c.user1;
          return {
            id: c.id,
            otherUserId: otherUser.id,
            name: otherUser.full_name || 'Anonymous',
            initials: otherUser.initials || '??',
            color: '#3B82F6', // Generic color for now
          };
        }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const { targetUserId } = useLocalSearchParams();

  useEffect(() => {
    if (targetUserId && !loading) {
      const target = chatList.find(c => c.otherUserId === targetUserId);
      if (target) {
        handleOpenChat(target);
      } else {
        supabase.from('chats').select('id, user1_id, user2_id').or(`user1_id.eq.${currentUser?.id},user2_id.eq.${currentUser?.id}`).then(({ data }) => {
           const specificChat = data?.find(c => c.user1_id === targetUserId || c.user2_id === targetUserId);
           if (specificChat) {
             supabase.from('profiles').select('full_name, initials').eq('id', targetUserId).single().then(({ data: prof }) => {
                const newChat = { id: specificChat.id, otherUserId: targetUserId, name: prof?.full_name || 'Anonymous', initials: prof?.initials || '??', color: '#3B82F6' };
                setChatList(prev => [...prev, newChat as ChatItem]);
                handleOpenChat(newChat as ChatItem);
             });
           }
        });
      }
    }
  }, [targetUserId, loading]);

  // Presence Tracking
  useEffect(() => {
    if (!currentUser) return;
    const room = supabase.channel('online-users', {
       config: { presence: { key: currentUser.id } }
    });
    room.on('presence', { event: 'sync' }, () => {
       const state = room.presenceState();
       const currentOnline = new Set<string>();
       Object.keys(state).forEach(k => currentOnline.add(k));
       setOnlineUsers(currentOnline);
    }).subscribe(async (status) => {
       if (status === 'SUBSCRIBED') {
         await room.track({ online_at: new Date().toISOString() });
       }
    });
    return () => { supabase.removeChannel(room); };
  }, [currentUser]);

  // Optionally map generic list
  const listItems = chatList.filter(c => !blockedUsers.has(c.otherUserId) && !deletedChats.has(c.id) && !ignoredChats.has(c.id));
  const displayListItems = [...listItems].sort((a, b) => {
      const aPinned = pinnedChats.has(a.id) ? 1 : 0;
      const bPinned = pinnedChats.has(b.id) ? 1 : 0;
      return bPinned - aPinned;
  });

  // ── Fetch Messages when room opens ──
  useEffect(() => {
    if (!openChat) return;
    
    // Initial fetch
    async function loadMessages() {
      const { data } = await supabase.from('messages')
        .select('*')
        .eq('chat_id', openChat!.id)
        .order('created_at', { ascending: true });
      if (data) setChatMessages(data as MessageType[]);
    }
    loadMessages();

    // Subscribe to incoming messages
    const channel = supabase.channel(`messages:${openChat.id}_${Date.now()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${openChat.id}`
      }, payload => {
        setChatMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as MessageType];
        });
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [openChat?.id]);

  // ── Open a chat room ──
  const handleOpenChat = (c: ChatItem) => {
    setChatMessages([]);
    setOpenChat(c);
    if (unreadChats.has(c.id)) {
      clearUnreadChat(c.id);
    }
  };

  // ── Send message ──
  const sendMessage = async () => {
    if (!msgText.trim() || !openChat || !currentUser) return;
    const textToSend = msgText.trim();
    setMsgText('');
    
    const tempId = Math.random().toString();
    const tempMsg = { id: tempId, chat_id: openChat.id, sender_id: currentUser.id, text: textToSend, created_at: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const { data } = await supabase.from('messages').insert({ chat_id: openChat.id, sender_id: currentUser.id, text: textToSend }).select().single();
    if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
  };

  const sendPayloadHelper = async (payload: string) => {
    if (!openChat || !currentUser) return;
    
    const tempId = Math.random().toString();
    const tempMsg = { id: tempId, chat_id: openChat.id, sender_id: currentUser.id, text: payload, created_at: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const { data } = await supabase.from('messages').insert({ chat_id: openChat.id, sender_id: currentUser.id, text: payload }).select().single();
    if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
  };

  const uploadMediaHelper = async (localUri: string, prefix: string) => {
    try {
      const ext = localUri.split('.').pop() || 'tmp';
      const fileName = `${openChat?.id}_${prefix}_${Date.now()}.${ext}`;
      
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: fileName,
        type: prefix === 'img' ? 'image/jpeg' : 'audio/m4a'
      } as any);

      const { data, error } = await supabase.storage.from('chat_media').upload(fileName, formData);
      if (error) {
         console.warn('Upload err', error);
         return null;
      }
      const { data: pub } = supabase.storage.from('chat_media').getPublicUrl(fileName);
      return pub.publicUrl;
    } catch (e) {
      console.warn('Upload exception', e);
      return null;
    }
  };
  // ── Voice Recording Helpers ──
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    // Guard: don't start a new recording if one is already active
    if (isRecording) return;
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone access is required to record voice messages.');
        return;
      }

      // Safety net: if a stale recording object exists, unload it first
      if (recordingObj) {
        try { await recordingObj.stopAndUnloadAsync(); } catch (_) {}
        setRecordingObj(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setRecordSecs(0);
      setIsRecording(true);

      // Start timer
      recordTimerRef.current = setInterval(() => {
        setRecordSecs(prev => prev + 1);
      }, 1000);

      // Start pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.35, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      micPulseAnim.current = pulse;
      pulse.start();
    } catch (e) {
      console.error('Failed to start recording', e);
      // Reset state so the button isn't stuck
      setIsRecording(false);
      setRecordingObj(null);
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;

    // Stop timer + animation immediately
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    micPulseAnim.current?.stop();
    micPulse.setValue(1);
    setIsRecording(false);

    let uri: string | null = null;
    try {
      await recordingObj.stopAndUnloadAsync();
      uri = recordingObj.getURI();
    } catch (e) {
      console.error('Failed to stop recording', e);
    } finally {
      // Always clear the recording object so the next attempt can start fresh
      setRecordingObj(null);
      try { await Audio.setAudioModeAsync({ allowsRecordingIOS: false }); } catch (_) {}
    }

    if (uri) {
      setRecordedUri(uri);
      setVoiceModalVisible(true);
    }
  };

  const sendVoiceMessage = async () => {
    const duration = formatDuration(recordSecs);
    setVoiceModalVisible(false);
    if (!recordedUri) return;
    
    // Add pending bubble first
    const tempId = Math.random().toString();
    const tempMsg = { id: tempId, chat_id: openChat!.id, sender_id: currentUser.id, text: `[AUDIO] uploading...|${duration}`, created_at: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    
    const remoteUrl = await uploadMediaHelper(recordedUri, 'audio');
    const finalPayload = `[AUDIO] ${remoteUrl || recordedUri}|${duration}`;
    
    const { data } = await supabase.from('messages').insert({ chat_id: openChat!.id, sender_id: currentUser.id, text: finalPayload }).select().single();
    if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
    
    setRecordedUri(null);
    setRecordSecs(0);
  };

  const dismissVoiceMessage = () => {
    setVoiceModalVisible(false);
    setRecordedUri(null);
    setRecordSecs(0);
  };

  const renderMessageContent = (text: string, sent: boolean, actColor: string) => {
     if (text.startsWith('[IMAGE] ')) {
        const uri = text.replace('[IMAGE] ', '');
        if (uri === 'uploading...') {
           return <View style={{ width: 220, height: 260, borderRadius: 8, marginTop: 4, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}><Text style={{color: colors.primaryTextAuto, fontWeight: 'bold'}}>Uploading...</Text></View>;
        }
        return <Image source={{ uri }} style={{ width: 220, height: 260, borderRadius: 8, marginTop: 4 }} resizeMode="cover" />;
     }
     if (text.startsWith('[STICKER] ')) {
        const s = text.replace('[STICKER] ', '');
        return <Text style={{ fontSize: 65 }}>{s}</Text>;
     }
     if (text.startsWith('[LOCATION] ')) {
        const parts = text.replace('[LOCATION] ', '').split('|');
        const loc = parts[0];
        const duration = parts[1];
        const label = duration ? `Live Location (${duration})` : `📍 Current Location`;
        return (
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc}`)} style={{ borderRadius: 12, overflow: 'hidden', width: 220, height: 160 }}>
             <Image source={{ uri: 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/w_2560%2Cc_limit/GoogleMapTA.jpg' }} style={{ width: '100%', height: '100%' }} />
             <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', padding: 10 }}>
                <Text style={{ color: colors.primaryTextAuto, fontSize: 13, fontWeight: '700' }}>{label}</Text>
                <Text style={{ color: '#ccc', fontSize: 10, marginTop: 2 }}>{loc}</Text>
             </View>
          </TouchableOpacity>
        );
     }
     if (text.startsWith('[AUDIO] ')) {
        const parts = text.replace('[AUDIO] ', '').split('|');
        const uriOrUploading = parts[0];
        const dur = parts[1] || parts[0]; // fallback
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
             <TouchableOpacity onPress={() => { /* stub to just indicate it's audio */ }}>
               <Ionicons name="play-circle" size={38} color={sent ? colors.primaryTextAuto : actColor} />
             </TouchableOpacity>
             <View style={{ height: 4, width: 100, backgroundColor: sent ? 'rgba(255,255,255,0.4)' : colors.border, borderRadius: 2 }} />
             <Text style={[styles.bubbleText, sent && { color: colors.primaryTextAuto }, { fontSize: 12, fontWeight: '700' }]}>{uriOrUploading === 'uploading...' ? '⏳' : dur}</Text>
          </View>
        );
     }
     return <Text style={[styles.bubbleText, sent && { color: colors.primaryTextAuto }]}>{text}</Text>;
  };

  if (openChat) {
    const msgs = chatMessages;
    const activeColor = chatThemes[openChat.id] || colors.primary;
    
    // Parse Real-time Hidden Block States
    const amIBlocked = [...msgs].reverse().find(m => m.sender_id === openChat.otherUserId && m.text.startsWith('[SYSTEM_'))?.text === '[SYSTEM_BLOCK]';
    const didIBlock = blockedUsers.has(openChat.otherUserId) || [...msgs].reverse().find(m => m.sender_id === currentUser?.id && m.text.startsWith('[SYSTEM_'))?.text === '[SYSTEM_BLOCK]';

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.screen}>

          {/* Header */}
          <View style={[styles.chatHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setOpenChat(null)}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={[styles.chatAv, { backgroundColor: openChat.color }]}>
              <Text style={styles.chatAvText}>{openChat.initials}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatName}>{openChat.name}</Text>
              <Text style={[styles.chatStatus, !onlineUsers.has(openChat.otherUserId) && { color: colors.textMuted }]}>
                {onlineUsers.has(openChat.otherUserId) ? t('Online now') : t('Offline')} {mutedChats.has(openChat.id) ? '🔇' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
              <Text>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Context banner removed for generic DMs */}

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={[styles.msgArea, { backgroundColor: chatThemes[openChat.id] ? activeColor + '15' : colors.background }]}
            contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
          >
            <View style={styles.dateSep}>
              <Text style={styles.dateText}>{t('Today')}</Text>
            </View>
            {msgs.filter(m => !m.text.startsWith('[SYSTEM_')).map((m, i) => {
              const sent = m.sender_id === currentUser?.id;
              const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isTemp = m.id.length < 20;
              return (
              <TouchableOpacity key={m.id || i} style={[styles.msgWrap, sent ? styles.msgSent : styles.msgRecv]} activeOpacity={0.9} onLongPress={() => {
                Alert.alert('Message Options', 'Choose an action', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete Message', style: 'destructive', onPress: async () => {
                     setChatMessages(prev => prev.filter(x => x.id !== m.id));
                     await supabase.from('messages').delete().eq('id', m.id);
                  }}
                ]);
              }}>
                <View style={[
                  styles.bubble, 
                  sent ? [styles.bubbleSent, { backgroundColor: activeColor }] : styles.bubbleRecv,
                  (m.text.startsWith('[STICKER] ') || m.text.startsWith('[IMAGE] ') || m.text.startsWith('[LOCATION] ')) && { backgroundColor: 'transparent', borderWidth: 0, padding: 0 }
                ]}>
                  {renderMessageContent(m.text, sent, activeColor)}
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Text style={styles.msgTime}>{timeStr}</Text>
                  {sent && (
                    <Text style={{fontSize: 10, color: isTemp ? '#9ca3af' : '#3b82f6'}}>{isTemp ? '✓' : '✓✓'}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )})}
          </ScrollView>

          {amIBlocked ? (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedText}>🚫 You can't send message to this user</Text>
            </View>
          ) : didIBlock ? (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedText}>🚫 You blocked this user.</Text>
              <TouchableOpacity onPress={async () => { 
                setBlockedUsers(prev => { const n = new Set(prev); n.delete(openChat.otherUserId); return n; });
                await supabase.from('messages').insert({ chat_id: openChat.id, sender_id: currentUser!.id, text: '[SYSTEM_UNBLOCK]' });
              }} style={{marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.background, borderRadius: 8}}>
                 <Text style={{color: colors.text, fontWeight: '600'}}>Unblock to interact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.capsuleWrap}>
              <View style={styles.pillContainer}>
                {/* Left Action Edge */}
                {msgText.length === 0 ? (
                  <TouchableOpacity style={styles.pillCameraBtn} onPress={async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') return Alert.alert('Permission needed', 'Camera access is required.');
                    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
                    if (!result.canceled) {
                       const tempId = Math.random().toString();
                       setChatMessages(prev => [...prev, { id: tempId, chat_id: openChat!.id, sender_id: currentUser!.id, text: `[IMAGE] uploading...`, created_at: new Date().toISOString() }]);
                       setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                       const remote = await uploadMediaHelper(result.assets[0].uri, 'img');
                       const { data } = await supabase.from('messages').insert({ chat_id: openChat!.id, sender_id: currentUser!.id, text: '[IMAGE] ' + (remote || result.assets[0].uri) }).select().single();
                       if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
                    }
                  }}>
                    <Ionicons name="camera" size={24} color={colors.primaryTextAuto} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.pillGifBtn} onPress={() => Alert.alert('Search', 'GIF and emoji pane opening...')}>
                     <View style={{backgroundColor: colors.primaryTextAuto, borderRadius: 16, width: 28, height: 28, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{ fontSize: 16, color: activeColor, fontWeight: '900' }}>🔍</Text>
                     </View>
                  </TouchableOpacity>
                )}

                {/* Center Input Edge */}
                <TextInput
                  style={styles.pillInput}
                  placeholder="Message..."
                  placeholderTextColor="#7D7D7D"
                  value={msgText}
                  onChangeText={(text) => {
                     if ((msgText.length === 0 && text.length > 0) || (msgText.length > 0 && text.length === 0)) {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                     }
                     setMsgText(text);
                  }}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />

                {/* Right Action Edge */}
                {msgText.length === 0 ? (
                  <View style={styles.pillRightActions}>
                    {/* Mic: Hold to Record */}
                    <View>
                      <Animated.View style={{ transform: [{ scale: micPulse }] }}>
                        <TouchableOpacity
                          onPressIn={startRecording}
                          onPressOut={stopRecording}
                          style={[styles.micHoldBtn, isRecording && { backgroundColor: '#EF4444' }]}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name={isRecording ? 'mic' : 'mic-outline'}
                            size={26}
                            color={isRecording ? colors.primaryTextAuto : colors.primaryTextAuto}
                          />
                        </TouchableOpacity>
                      </Animated.View>
                      {isRecording && (
                        <Text style={styles.recordingTimer}>{formatDuration(recordSecs)}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={async () => {
                      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
                      if (!result.canceled) {
                         const tempId = Math.random().toString();
                         setChatMessages(prev => [...prev, { id: tempId, chat_id: openChat!.id, sender_id: currentUser!.id, text: `[IMAGE] uploading...`, created_at: new Date().toISOString() }]);
                         setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                         const remote = await uploadMediaHelper(result.assets[0].uri, 'img');
                         const { data } = await supabase.from('messages').insert({ chat_id: openChat!.id, sender_id: currentUser!.id, text: '[IMAGE] ' + (remote || result.assets[0].uri) }).select().single();
                         if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
                      }
                    }}>
                      <Ionicons name="image-outline" size={26} color={colors.primaryTextAuto} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowStickers(!showStickers)}>
                      <Ionicons name="happy-outline" size={26} color={colors.primaryTextAuto} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async () => {
                        let { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== 'granted') { Alert.alert('Permission Denied', 'Enable location access to share.'); return; }
                        let location = await Location.getCurrentPositionAsync({});
                        Alert.alert('Share Location', 'Choose duration', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Current Location', onPress: () => sendPayloadHelper(`[LOCATION] ${location.coords.latitude},${location.coords.longitude}`) },
                          { text: 'Live for 15 Mins', onPress: () => sendPayloadHelper(`[LOCATION] ${location.coords.latitude},${location.coords.longitude}|15m`) },
                          { text: 'Live for 1 Hour', onPress: () => sendPayloadHelper(`[LOCATION] ${location.coords.latitude},${location.coords.longitude}|1h`) }
                        ]);
                    }}>
                      <Ionicons name="add-circle-outline" size={28} color={colors.primaryTextAuto} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.pillSendBtn, { backgroundColor: activeColor }]} onPress={sendMessage}>
                    <Ionicons name="send" size={18} color={colors.primaryTextAuto} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Sticker View */}
          {showStickers && !blockedUsers.has(openChat.otherUserId) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60, backgroundColor: colors.card, paddingVertical: 10 }}>
               <View style={{ flexDirection: 'row', gap: 15, paddingHorizontal: 16 }}>
                 {['😂','❤️','🔥','👍','🎉','✨','🐶','🐱','🚀'].map(s => (
                   <TouchableOpacity key={s} onPress={() => { setShowStickers(false); sendPayloadHelper(`[STICKER] ${s}`); }}>
                     <Text style={{ fontSize: 32 }}>{s}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </ScrollView>
          )}

          {/* ----- VOICE REVIEW MODAL ----- */}
          <Modal
            transparent
            visible={voiceModalVisible}
            animationType="slide"
            onRequestClose={dismissVoiceMessage}
          >
            <View style={styles.modalBg}>
              <View style={styles.voiceModal}>
                <View style={styles.voiceModalHandle} />
                <Text style={styles.voiceModalTitle}>🎙️ Voice Message</Text>
                <Text style={styles.voiceModalSub}>Recording complete</Text>

                {/* Waveform Preview */}
                <View style={styles.voiceWaveRow}>
                  <Ionicons name="play-circle" size={44} color={colors.primary} />
                  <View style={styles.voiceWaveBars}>
                    {[0.4, 0.7, 1.0, 0.6, 0.85, 0.5, 0.9, 0.65, 0.75, 0.45, 0.8, 0.55].map((h, i) => (
                      <View
                        key={i}
                        style={[
                          styles.voiceWaveBar,
                          { height: 6 + h * 28, backgroundColor: colors.primary, opacity: 0.6 + h * 0.4 }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.voiceDuration}>{formatDuration(recordSecs)}</Text>
                </View>

                {/* Actions */}
                <View style={styles.voiceActions}>
                  <TouchableOpacity style={styles.voiceDismissBtn} onPress={dismissVoiceMessage}>
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                    <Text style={styles.voiceDismissText}>Dismiss</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.voiceSendBtn, { backgroundColor: colors.primary }]} onPress={sendVoiceMessage}>
                    <Ionicons name="send" size={20} color={colors.primaryTextAuto} />
                    <Text style={styles.voiceSendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ----- MODALS ----- */}
          {/* Main Dropdown Menu */}
          <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => {setMenuVisible(false); setExpandedMenu(false);}}>
              <View style={styles.dropdownWrap}>
                {!expandedMenu ? (
                  <>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); setProfileVisible(true); }}>
                      <Text style={styles.dropdownText}>👤 View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); setMediaVisible(true); }}>
                      <Text style={styles.dropdownText}>🖼️ Media & Links</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { 
                       setMenuVisible(false); 
                       setMutedChats(prev => {
                          const next = new Set(prev);
                          if (next.has(openChat.id)) next.delete(openChat.id); else next.add(openChat.id);
                          return next;
                       });
                    }}>
                      <Text style={styles.dropdownText}>{mutedChats.has(openChat.id) ? '🔊 Unmute Notifications' : '🔇 Mute Notifications'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); setThemeVisible(true); }}>
                      <Text style={styles.dropdownText}>🎨 Chat Theme</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.dropdownItem, {borderBottomWidth: 0}]} onPress={() => setExpandedMenu(true)}>
                      <Text style={styles.dropdownText}>⚙️ More...</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => setExpandedMenu(false)}>
                       <Text style={styles.dropdownText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={async () => { 
                       setMenuVisible(false); setExpandedMenu(false); 
                       setChatMessages([]);
                       if (openChat?.id) {
                         await supabase.from('chats').delete().eq('id', openChat.id);
                         setChatList(prev => prev.filter(c => c.id !== openChat.id));
                         setOpenChat(null);
                       }
                    }}>
                       <Text style={[styles.dropdownText, {color: colors.primary}]}>🧹 Clear Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { 
                       setMenuVisible(false); setExpandedMenu(false);
                    }}>
                       <Text style={[styles.dropdownText, {color: colors.primary}]}>⚠️ Report User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.dropdownItem, {borderBottomWidth: 0}]} onPress={async () => { 
                       setBlockedUsers(prev => new Set(prev).add(openChat.otherUserId));
                       setMenuVisible(false);
                       setExpandedMenu(false);
                       await supabase.from('messages').insert({ chat_id: openChat.id, sender_id: currentUser!.id, text: '[SYSTEM_BLOCK]' });
                    }}>
                       <Text style={[styles.dropdownText, {color: '#EF4444', fontWeight:'700'}]}>🚫 Block User</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Profile Modal */}
          <Modal transparent visible={profileVisible} animationType="slide" onRequestClose={() => setProfileVisible(false)}>
            <View style={styles.modalBg}>
              <View style={styles.profileModal}>
                <TouchableOpacity style={styles.modalClose} onPress={() => setProfileVisible(false)}>
                  <Text style={{fontSize: 20, color: colors.textMuted}}>✕</Text>
                </TouchableOpacity>
                <View style={[styles.bigAv, {backgroundColor: openChat.color}]}>
                   <Text style={styles.bigAvText}>{openChat.initials}</Text>
                </View>
                <Text style={styles.profName}>{openChat.name}</Text>
                <Text style={styles.profStatus}>Major: Computer Science</Text>
                <View style={styles.profStats}>
                   <Text style={{fontSize: 20}}>⭐ 4.8</Text>
                   <Text style={{color: colors.textMuted, fontSize: 13}}> (24 reviews)</Text>
                </View>
                <Text style={styles.profBio}>"Always happy to share rides or study together. Hit me up!"</Text>
              </View>
            </View>
          </Modal>

          {/* Media Modal */}
          <Modal transparent visible={mediaVisible} animationType="slide" onRequestClose={() => setMediaVisible(false)}>
            <View style={styles.modalBg}>
               <View style={styles.mediaModal}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Media & Links</Text>
                     <TouchableOpacity onPress={() => setMediaVisible(false)}>
                       <Text style={{fontSize: 16, color: colors.textMuted, fontWeight: '700'}}>Close</Text>
                     </TouchableOpacity>
                  </View>
                  <View style={styles.mediaGrid}>
                     <View style={styles.mediaPlaceholder}><Text style={{color: colors.textMuted}}>No Media</Text></View>
                     <View style={styles.mediaPlaceholder}><Text style={{color: colors.textMuted}}>No Links</Text></View>
                  </View>
               </View>
            </View>
          </Modal>

          {/* Theme Modal */}
          <Modal transparent visible={themeVisible} animationType="slide" onRequestClose={() => setThemeVisible(false)}>
            <View style={styles.modalBg}>
               <View style={styles.themeModal}>
                  <Text style={styles.modalTitle}>Select Theme</Text>
                  <View style={styles.themeGrid}>
                     {[
                       {c: colors.primary, n: 'Default'},
                       {c: '#10B981', n: 'Emerald'},
                       {c: '#8B5CF6', n: 'Purple'},
                       {c: '#F43F5E', n: 'Rose Pink'}
                     ].map(th => (
                       <TouchableOpacity key={th.c} style={[styles.themeBox, {backgroundColor: th.c}]} 
                          onPress={() => {
                             setChatThemes(prev => ({...prev, [openChat.id]: th.c}));
                             setThemeVisible(false); 
                          }}>
                          <Text style={{color: colors.primaryTextAuto, fontWeight: 'bold'}}>{th.n}</Text>
                       </TouchableOpacity>
                     ))}
                  </View>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setThemeVisible(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </Modal>
          {/* ----- END MODALS ----- */}
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── CHAT LIST VIEW ──
  return (
    <View style={styles.screen}>
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.navTitle}>{t('Chats')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {displayListItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📥</Text>
            <Text style={styles.emptyTitle}>
              {t('No messages yet')}
            </Text>
            <Text style={styles.emptySub}>
              {t('Accept a request on the feed to start chatting')}
            </Text>
          </View>
        ) : (
          displayListItems.map(c => {
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.listItem}
                onPress={() => handleOpenChat(c)}
                onLongPress={() => {
                  import('react-native').then(({ Alert }) => {
                    Alert.alert('Chat Options', c.name, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: pinnedChats.has(c.id) ? 'Unpin Chat' : 'Pin Chat', onPress: () => setPinnedChats(prev => { const n = new Set(prev); if(n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; }) },
                      { text: 'Ignore Chat', onPress: () => setIgnoredChats(prev => new Set(prev).add(c.id)) },
                      { text: 'Delete Chat', style: 'destructive', onPress: async () => {
                          setChatList(prev => prev.filter(x => x.id !== c.id));
                          await supabase.from('chats').delete().eq('id', c.id);
                      }}
                    ]);
                  });
                }}
              >
                <View style={[styles.listAv, { backgroundColor: c.color }]}>
                  <Text style={styles.listAvText}>{c.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{c.name}</Text>
                  <Text style={styles.listReq} numberOfLines={1}>
                    Direct Message
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {pinnedChats.has(c.id) && <Text style={{fontSize: 12}}>📌</Text>}
                  {unreadChats.has(c.id) && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>1</Text>
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

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  navbar: {
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  tabToggle: {
    flexDirection: 'row', margin: 12,
    backgroundColor: colors.background,
    borderRadius: 12, padding: 4,
    borderWidth: 1.5, borderColor: colors.border,
  },
  tabBtn: {
    flex: 1, padding: 9, borderRadius: 9, alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabBtnTextActive: { color: colors.primaryTextAuto },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  listAv: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  listAvText: { color: colors.primaryTextAuto, fontWeight: '700', fontSize: 14 },
  listName: { fontSize: 14, fontWeight: '600', color: colors.text },
  listReq: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  listMsg: { fontSize: 12, color: colors.textMuted, marginTop: 2, maxWidth: 180 },
  listTime: { fontSize: 11, color: colors.textLight },
  unreadBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: colors.primaryTextAuto, fontSize: 10, fontWeight: '700' },

  // Chat room
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 16, color: colors.textSecondary },
  chatAv: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  chatAvText: { color: colors.primaryTextAuto, fontWeight: '700', fontSize: 14 },
  onlineDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: colors.accept, borderWidth: 2, borderColor: colors.card,
    position: 'absolute', bottom: -1, right: -1,
  },
  chatName: { fontSize: 15, fontWeight: '700', color: colors.text },
  chatStatus: { fontSize: 11, color: colors.accept, fontWeight: '500' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  contextBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.acceptLight,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#D1FAE5',
  },
  contextText: { flex: 1, fontSize: 12, color: '#065F46', fontWeight: '500' },
  matchedBadge: { backgroundColor: colors.accept, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  matchedText: { color: colors.primaryTextAuto, fontSize: 10, fontWeight: '700' },
  msgArea: { flex: 1, backgroundColor: colors.background },
  dateSep: { alignSelf: 'center', backgroundColor: colors.border, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  dateText: { fontSize: 11, color: colors.textLight },
  msgWrap: { maxWidth: '78%', gap: 3 },
  msgSent: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgRecv: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: 10, borderRadius: 14 },
  bubbleSent: { backgroundColor: colors.primary, borderBottomRightRadius: 3 },
  bubbleRecv: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 3 },
  bubbleText: { fontSize: 13, color: colors.text, lineHeight: 19 },
  msgTime: { fontSize: 10, color: colors.textLight },
  capsuleWrap: {
    padding: 12, paddingBottom: 20, 
    backgroundColor: 'transparent',
  },
  pillContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#262626', // Bright distinct dark grey for pill
    borderRadius: 30, paddingHorizontal: 6, paddingVertical: 6,
  },
  pillCameraBtn: {
    backgroundColor: '#60A5FA', width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', marginRight: 8
  },
  pillGifBtn: {
    backgroundColor: colors.card, width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', marginRight: 8
  },
  pillInput: {
    flex: 1, color: colors.text, fontSize: 15, paddingVertical: 8, paddingHorizontal: 4,
  },
  pillRightActions: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 10
  },
  pillUtilIcon: {
    fontSize: 20, color: '#A3A3A3'
  },
  pillSendBtn: {
    width: 60, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Modals Custom UI
  dropdownWrap: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80, right: 16, backgroundColor: colors.card, paddingVertical: 4, borderRadius: 16, shadowColor: colors.text, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, minWidth: 220, borderWidth: 1, borderColor: colors.border },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownText: { fontSize: 15, color: colors.text, fontWeight: '600' },
  
  modalBg: { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'flex-end' },
  profileModal: { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center', paddingBottom: 60 },
  modalClose: { position: 'absolute', top: 20, right: 24, padding: 8 },
  bigAv: { width: 90, height: 90, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: colors.text, shadowOpacity: 0.1, shadowRadius: 10 },
  bigAvText: { fontSize: 36, fontWeight: 'bold', color: colors.primaryTextAuto },
  profName: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  profStatus: { fontSize: 14, color: colors.textMuted, marginBottom: 16, fontWeight: '500' },
  profStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: colors.background, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  profBio: { fontSize: 15, color: colors.text, fontStyle: 'italic', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 20 },

  mediaModal: { backgroundColor: colors.card, height: '65%', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  mediaPlaceholder: { width: '48%', height: 110, backgroundColor: colors.background, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },

  themeModal: { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 24, justifyContent: 'space-between' },
  themeBox: { width: '48%', paddingVertical: 36, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.text, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  cancelBtn: { backgroundColor: colors.background, padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  cancelText: { fontSize: 16, fontWeight: '700', color: colors.text },

  blockedBanner: { padding: 24, backgroundColor: colors.ignoreLight, borderTopWidth: 1, borderTopColor: colors.ignore, alignItems: 'center', paddingBottom: 45 },
  blockedText: { fontSize: 14, fontWeight: '700', color: colors.ignore },

  // Mic / Recording
  micHoldBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  recordingTimer: {
    fontSize: 10, color: '#EF4444', fontWeight: '700',
    textAlign: 'center', marginTop: 2,
  },

  // Voice Review Modal
  voiceModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 48, alignItems: 'center',
  },
  voiceModalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4,
  },
  voiceModalSub: {
    fontSize: 13, color: colors.textMuted, marginBottom: 24,
  },
  voiceWaveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.background, borderRadius: 20,
    padding: 14, width: '100%', marginBottom: 28,
    borderWidth: 1, borderColor: colors.border,
  },
  voiceWaveBars: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 3, height: 40, justifyContent: 'center',
  },
  voiceWaveBar: {
    width: 4, borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 13, fontWeight: '700', color: colors.text,
  },
  voiceActions: {
    flexDirection: 'row', gap: 12, width: '100%',
  },
  voiceDismissBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 18,
    backgroundColor: colors.ignoreLight, borderWidth: 1.5, borderColor: colors.ignore,
  },
  voiceDismissText: {
    fontSize: 15, fontWeight: '700', color: colors.ignore,
  },
  voiceSendBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 18,
  },
  voiceSendText: {
    fontSize: 15, fontWeight: '700', color: colors.primaryTextAuto,
  },
});