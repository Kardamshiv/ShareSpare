import { Tabs, useSegments } from 'expo-router';
import { Text, View } from 'react-native';
import { useSettings } from '../../store/SettingsProvider';

function PlusIcon({ colors }: { colors: any }) {
  return (
    <View style={{
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      shadowColor: colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 8,
      elevation: 6,
    }}>
      <Text style={{ fontSize: 24, color: colors.primaryTextAuto }}>＋</Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors, t, unreadChats } = useSettings();
  const segments = useSegments();
  const hideNav = segments.includes('chat');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          display: hideNav ? 'none' : 'flex',
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('Explore'),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarIcon: () => <PlusIcon colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('Chat'),
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 20, color }}>💬</Text>
              {unreadChats.size > 0 && (
                <View style={{position: 'absolute', top: -3, right: -6, backgroundColor: colors.ignore, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.card}}/>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('History'),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⏳</Text>
          ),
        }}
      />
    </Tabs>
  );
}