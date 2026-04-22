import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../store/SettingsProvider';
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
  isMine: boolean;
  onAccept: () => void;
  onIgnore: () => void;
  onChat: () => void;
  onDelete?: () => void;
};

export function RequestCard({
  title, category, time, location,
  poster, color, accepted, isMine,
  maxMembers, currentMembers,
  onAccept, onIgnore, onChat, onDelete
}: Props) {
  const { colors } = useSettings();
  const styles = getStyles(colors);

  const catBorderColors = {
    cab:    { border: '#F59E0B' },
    study:  { border: '#10B981' },
    sports: { border: '#3B82F6' },
  };

  return (
    <View style={[styles.card, { borderLeftColor: catBorderColors[category].border }]}>

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

      {/* ── BUTTONS ── */}
      <View style={styles.actions}>
        {isMine ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.deleteText}>🗑️  Delete</Text>
          </TouchableOpacity>
        ) : accepted ? (
          <>
            <View style={styles.acceptedTag}>
              <Text style={styles.acceptedTagText}>✅  Accepted</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
              <Text style={styles.chatBtnText}>💬  Chat</Text>
            </TouchableOpacity>
          </>
        ) : (
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

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderLeftWidth: 3,
    shadowColor: colors.text,
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
  avatarText: { color: colors.primaryTextAuto, fontSize: 11, fontWeight: '700' },
  title: {
    fontSize: 14, fontWeight: '600',
    color: colors.text, marginBottom: 6, lineHeight: 20,
  },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  meta: { fontSize: 11, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  acceptBtn: {
    flex: 1, backgroundColor: colors.accept,
    padding: 9, borderRadius: 8, alignItems: 'center',
  },
  acceptText: { color: colors.primaryTextAuto, fontWeight: '600', fontSize: 12 },

  ignoreBtn: {
    flex: 1, backgroundColor: colors.ignoreLight,
    borderWidth: 1.5, borderColor: colors.ignore,
    padding: 9, borderRadius: 8, alignItems: 'center',
  },
  ignoreText: { color: colors.ignore, fontWeight: '600', fontSize: 12 },

  acceptedTag: {
    backgroundColor: colors.acceptLight,
    borderWidth: 1,
    borderColor: colors.accept,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  acceptedTagText: { color: colors.accept, fontWeight: '700', fontSize: 12 },

  chatBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  deleteBtn: {
    flex: 1, backgroundColor: colors.ignoreLight,
    borderWidth: 1.5, borderColor: colors.ignore,
    padding: 9, borderRadius: 8, alignItems: 'center',
  },
  deleteText: { color: colors.ignore, fontWeight: '700', fontSize: 12 },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  memberText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  memberBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  memberFill: { height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
});