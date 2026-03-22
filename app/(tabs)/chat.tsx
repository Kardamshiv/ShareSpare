import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';

const MESSAGES = [
  { id:'1', text:"Hey! Saw your study request for DSA 👋",       sent: false, time:'9:12 AM' },
  { id:'2', text:"Oh great! Which topics are you stuck on?",      sent: true,  time:'9:14 AM' },
  { id:'3', text:"Graphs and DP mainly. You?",                    sent: false, time:'9:15 AM' },
  { id:'4', text:"Same 😅 Library Block C from 5 PM today?",      sent: true,  time:'9:16 AM' },
  { id:'5', text:"Sounds perfect! I'll be there 🙌",              sent: false, time:'9:17 AM' },
  { id:'6', text:"✅ See you at 5!",                               sent: true,  time:'9:18 AM' },
];

export default function ChatScreen() {
  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.chatAvatar}>
          <Text style={styles.chatAvatarText}>AP</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>Arjun Patel</Text>
          <Text style={styles.chatStatus}>● Online now</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Context banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>📚  DSA prep – study partner request</Text>
        <View style={styles.matchedBadge}>
          <Text style={styles.matchedText}>Matched</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        contentContainerStyle={styles.msgs}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateSep}>Today</Text>
        {MESSAGES.map(m => (
          <View
            key={m.id}
            style={[styles.msgWrap, m.sent ? styles.msgRight : styles.msgLeft]}
          >
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
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 16 }}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message…"
          placeholderTextColor={Colors.textLight}
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={{ fontSize: 16, color: '#fff' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingHorizontal: 16,
    paddingVertical:   12,
    paddingTop:        50,
    backgroundColor:   Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatAvatar: {
    width: 40, height: 40,
    borderRadius:    12,
    backgroundColor: '#10B981',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
  },
  chatAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  onlineDot: {
    width: 10, height: 10,
    borderRadius:    5,
    backgroundColor: Colors.accept,
    borderWidth:     2,
    borderColor:     '#fff',
    position:        'absolute',
    bottom:          -1,
    right:           -1,
  },
  chatName:   { fontSize: 15, fontWeight: '700', color: Colors.text },
  chatStatus: { fontSize: 11, color: Colors.accept, fontWeight: '500' },
  iconBtn: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: Colors.background,
    borderWidth:     1,
    borderColor:     Colors.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  banner: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.acceptLight,
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  bannerText:   { flex: 1, fontSize: 12, color: '#065F46', fontWeight: '500' },
  matchedBadge: {
    backgroundColor: Colors.accept,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  matchedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  msgs: { padding: 16, gap: 10, paddingBottom: 8 },
  dateSep: {
    textAlign:       'center',
    fontSize:        11,
    color:           Colors.textLight,
    backgroundColor: Colors.border,
    alignSelf:       'center',
    paddingHorizontal: 12,
    paddingVertical:   3,
    borderRadius:      20,
    marginBottom:      8,
  },
  msgWrap:  { maxWidth: '80%', gap: 3 },
  msgLeft:  { alignSelf: 'flex-start', alignItems: 'flex-start' },
  msgRight: { alignSelf: 'flex-end',   alignItems: 'flex-end'   },
  bubble: {
    padding:      10,
    borderRadius: 14,
    maxWidth:     '100%',
  },
  bubbleSent: {
    backgroundColor:      Colors.primary,
    borderBottomRightRadius: 3,
  },
  bubbleRecv: {
    backgroundColor:     Colors.card,
    borderWidth:         1,
    borderColor:         Colors.border,
    borderBottomLeftRadius: 3,
  },
  bubbleText: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  msgTime:    { fontSize: 10, color: Colors.textLight },
  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    padding:           12,
    paddingBottom:     24,
    backgroundColor:   Colors.card,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
  },
  chatInput: {
    flex:            1,
    backgroundColor: Colors.background,
    borderRadius:    22,
    paddingHorizontal: 14,
    paddingVertical:   10,
    fontSize:        13,
    color:           Colors.text,
    borderWidth:     1.5,
    borderColor:     Colors.border,
  },
  sendBtn: {
    width:           38,
    height:          38,
    borderRadius:    12,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
});