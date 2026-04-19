import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Category } from '../../store/AppStore';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');

const CATEGORIES: { key: Category; icon: string; label: string; color: string }[] = [
    { key: 'cab', icon: '🚗', label: 'Cab Sharing', color: '#F59E0B' },
    { key: 'study', icon: '📚', label: 'Study Help', color: '#10B981' },
    { key: 'sports', icon: '⚽', label: 'Sports', color: '#3B82F6' },
];

const MEMBER_OPTIONS = [2, 3, 4, 5, 6];

export default function PostScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('cab');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxMembers, setMaxMembers] = useState(4);
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a request title.');
            return;
        }
        if (!time.trim()) {
            Alert.alert('Missing Time', 'Please enter the time.');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Missing Location', 'Please enter the location.');
            return;
        }

        setLoading(true);

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            Alert.alert('Auth Error', 'You must be logged in to post.');
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('requests').insert({
            title: title.trim(),
            category: category,
            time: time.trim(),
            location: location.trim(),
            max_members: category === 'cab' ? maxMembers : null,
            color: CATEGORIES.find(c => c.key === category)!.color,
            poster_id: userData.user.id
        });

        setLoading(false);

        if (error) {
            Alert.alert('Database Error', error.message);
        } else {
            Alert.alert('✅ Posted!', 'Your request is now live on the feed.');
            setTitle('');
            setTime('');
            setLocation('');
            setMaxMembers(4);
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={styles.screen}>
            {/* Navbar */}
            <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.navTitle}>Create Post</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formWrap}
                keyboardShouldPersistTaps="handled"
            >
                {/* Category Picker */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.catRow}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c.key}
                            style={[
                                styles.catChip,
                                category === c.key && { backgroundColor: c.color, borderColor: c.color },
                            ]}
                            onPress={() => setCategory(c.key)}
                        >
                            <Text style={styles.catChipIcon}>{c.icon}</Text>
                            <Text style={[
                                styles.catChipText,
                                category === c.key && { color: '#fff' },
                            ]}>
                                {c.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Title */}
                <Text style={styles.label}>Request Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Cab to Airport – Sunday 6 AM"
                    placeholderTextColor={Colors.textLight}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Time */}
                <Text style={styles.label}>Time</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Today 5:30 PM"
                    placeholderTextColor={Colors.textLight}
                    value={time}
                    onChangeText={setTime}
                />

                {/* Location */}
                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Gate B, Main Campus"
                    placeholderTextColor={Colors.textLight}
                    value={location}
                    onChangeText={setLocation}
                />

                {/* Cab Member Limit – only for cab */}
                {category === 'cab' && (
                    <>
                        <Text style={styles.label}>Max Cab Members</Text>
                        <Text style={styles.helperText}>
                            Set the maximum number of people who can join this ride
                        </Text>
                        <View style={styles.memberRow}>
                            {MEMBER_OPTIONS.map(n => (
                                <TouchableOpacity
                                    key={n}
                                    style={[
                                        styles.memberChip,
                                        maxMembers === n && styles.memberChipActive,
                                    ]}
                                    onPress={() => setMaxMembers(n)}
                                >
                                    <Text style={[
                                        styles.memberChipText,
                                        maxMembers === n && styles.memberChipTextActive,
                                    ]}>
                                        {n}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberInfoText}>
                                👥  {maxMembers} seats total (including you)
                            </Text>
                        </View>
                    </>
                )}

                {/* Submit */}
                <TouchableOpacity 
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                    onPress={handlePost}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>
                        {loading ? 'Posting...' : '📤  Post Request'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    navbar: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    navTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    formWrap: { padding: 16, paddingBottom: 40 },
    label: {
        fontSize: 12, fontWeight: '700', color: Colors.textMuted,
        textTransform: 'uppercase', letterSpacing: 1,
        marginTop: 16, marginBottom: 8,
    },
    helperText: {
        fontSize: 12, color: Colors.textLight, marginBottom: 8, marginTop: -4,
    },
    input: {
        backgroundColor: Colors.card, borderRadius: 12, padding: 14,
        fontSize: 14, color: Colors.text,
        borderWidth: 1.5, borderColor: Colors.border,
    },
    catRow: {
        flexDirection: 'row', gap: 8,
    },
    catChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, paddingVertical: 10, borderRadius: 10,
        borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
    },
    catChipIcon: { fontSize: 16 },
    catChipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },

    // Member limit picker
    memberRow: { flexDirection: 'row', gap: 8 },
    memberChip: {
        width: (SCREEN_W - 32 - 32) / 5,
        paddingVertical: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: Colors.border,
        backgroundColor: Colors.card, alignItems: 'center',
    },
    memberChipActive: {
        backgroundColor: '#F59E0B', borderColor: '#F59E0B',
    },
    memberChipText: {
        fontSize: 16, fontWeight: '700', color: Colors.textMuted,
    },
    memberChipTextActive: { color: '#fff' },
    memberInfo: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFBEB', borderRadius: 8,
        padding: 10, marginTop: 8,
        borderWidth: 1, borderColor: '#FDE68A',
    },
    memberInfoText: { fontSize: 12, fontWeight: '600', color: '#92400E' },

    // Submit
    submitBtn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        padding: 16, alignItems: 'center', marginTop: 24,
        shadowColor: Colors.primary, shadowOpacity: 0.35,
        shadowRadius: 8, elevation: 4,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});