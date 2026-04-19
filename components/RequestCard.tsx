import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { catBg, Category, catIcon, catLabel, catTextColor } from '../store/AppStore';

type Props = {
  id: string;
  title: string;
  category: Category;
  time: string;
  location: string;
  poster: string;
  posterName: string;
  color: string;
  accepted: boolean;
  maxMembers?: number;
  currentMembers?: number;
  onAccept: () => void;
  onIgnore: () => void;
  onChat: () => void;
};

export function RequestCard({
  title, category, time, location,
  poster, color, accepted,
  maxMembers, currentMembers,
  onAccept, onIgnore, onChat
}: Props) {

  const catColors = {
    cab: { border: '#F59E0B' },
    study: { border: '#10B981' },
    sports: { border: '#3B82F6' },
  };

  return (
    <View style={[styles.card, { borderLeftColor: catColors[category].border }]}>

      {/* Top */}
      <View style={styles.topRow}>
        <View style={[styles.catBadge, { backgroundColor: catBg(category) }]}>
          <Text style={styles.catIcon}>{catIcon(category)}</Text>
          <Text style={[styles.catLabel, { color: catTextColor(category) }]}>
            {catLabel(category)}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{poster}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>🕐  {time}</Text>
        <Text style={styles.meta}>    📍  {location}</Text>
      </View>

      {/* Cab member count */}
      {category === 'cab' && maxMembers != null && (
        <View style={styles.memberRow}>
          <Text style={styles.memberText}>
            👥  {currentMembers ?? 0}/{maxMembers} seats filled
          </Text>
          <View style={styles.memberBar}>
            <View style={[styles.memberFill, { width: `${((currentMembers ?? 0) / maxMembers) * 100}%` }]} />
          </View>
        </View>
      )}

      {/* ── BUTTONS: changes based on accepted state ── */}
      <View style={styles.actions}>
        {accepted ? (
          // ── ACCEPTED STATE: show tag + Chat button ──
          <>
            <View style={styles.acceptedTag}>
              <Text style={styles.acceptedTagText}>✅  Accepted</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
              <Text style={styles.chatBtnText}>💬  Chat</Text>
            </TouchableOpacity>
          </>
        ) : (
          // ── DEFAULT STATE: Accept + Ignore ──
          <>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>✓  Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ignoreBtn} onPress={onIgnore}>
              <Text style={styles.ignoreText}>✕  Ignore</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catIcon: { fontSize: 12 },
  catLabel: { fontSize: 11, fontWeight: '700' },
  avatar: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  title: {
    fontSize: 14, fontWeight: '600',
    color: Colors.text, marginBottom: 6, lineHeight: 20,
  },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  meta: { fontSize: 11, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  // Accept button
  acceptBtn: {
    flex: 1, backgroundColor: Colors.accept,
    padding: 9, borderRadius: 8, alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  // Ignore button
  ignoreBtn: {
    flex: 1, backgroundColor: Colors.ignoreLight,
    borderWidth: 1.5, borderColor: '#FECACA',
    padding: 9, borderRadius: 8, alignItems: 'center',
  },
  ignoreText: { color: Colors.ignore, fontWeight: '600', fontSize: 12 },

  // Accepted tag (shown after accepting)
  acceptedTag: {
    backgroundColor: Colors.acceptLight,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  acceptedTagText: { color: Colors.accept, fontWeight: '700', fontSize: 12 },

  // Chat button (shown after accepting)
  chatBtn: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },

  // Cab member indicator
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  memberText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  memberBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  memberFill: { height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
});