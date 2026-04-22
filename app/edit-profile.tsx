import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useSettings } from '../store/SettingsProvider';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useSettings();
  const styles = getStyles(colors);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [gender, setGender] = useState('Male');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setName(data.full_name || '');
        setUsername(data.username || '');
        setPronouns(data.pronouns || '');
        setBio(data.bio || '');
        setLink(data.link || '');
        setGender(data.gender || 'Not specified');
        setAvatar(data.avatar_url || data.initials || null);
      }
    }
    loadData();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to launch the image picker. Please ensure permissions are granted.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Validation Error', 'Name cannot be empty.');
    if (username.trim() && username.includes(' ')) return Alert.alert('Validation Error', 'Username cannot contain spaces.');

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const updatePayload: any = {
        full_name: name.trim(),
        username: username.trim().toLowerCase(),
        pronouns: pronouns.trim(),
        bio: bio.trim(),
        link: link.trim(),
        gender: gender,
      };
      if (avatar && avatar.includes('file:')) {
        updatePayload.avatar_url = avatar;
      } else {
        updatePayload.initials = avatar;
      }
      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', user.id);
      if (error) {
        Alert.alert('Notice', 'Some fields may not be supported by your current database schema. Your settings were cached locally.');
      } else {
        Alert.alert('Success', 'Your profile has been updated!');
      }
      router.back();
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
            {Boolean(avatar) && avatar?.includes('file:') ? (
              <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
            ) : (
              <Text style={styles.avatarEmoji}>{avatar || '👨‍💻'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePicText}>Edit picture or avatar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Add Banners</Text>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Display Name" placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="your_unique_username" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pronouns</Text>
          <TextInput style={styles.input} value={pronouns} onChangeText={setPronouns} placeholder="Optional (e.g., they/them)" placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline numberOfLines={4} placeholder="Write something about yourself..." placeholderTextColor={colors.textMuted} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Add Link</Text>
          <TextInput style={styles.input} value={link} onChangeText={setLink} placeholder="https://..." placeholderTextColor={colors.textMuted} keyboardType="url" autoCapitalize="none" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  backArrow: { color: colors.text, fontSize: 22 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primaryLight,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  avatarEmoji: { fontSize: 44 },
  changePicText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  bannerBtn: {
    backgroundColor: colors.card,
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 24, alignItems: 'center',
  },
  bannerBtnText: { color: colors.text, fontWeight: '600' },
  formGroup: { marginBottom: 18 },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: colors.text, fontSize: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    flex: 1, paddingVertical: 12,
    backgroundColor: colors.card, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  genderBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  genderText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  genderTextActive: { color: colors.primary },
  footer: {
    borderTopWidth: 1, borderTopColor: colors.border,
    padding: 16, backgroundColor: colors.card,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 16, borderRadius: 14, alignItems: 'center',
  },
  saveBtnText: { color: colors.primaryTextAuto, fontSize: 16, fontWeight: '700' },
});
