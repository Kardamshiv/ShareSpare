import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAppGroup = segments[0] === '(tabs)' || segments[0] === 'settings' || segments[0] === 'profile';
    const isLogin = segments[0] === 'login';

    if (!session && inAppGroup) {
      // Redirect to login if unauthenticated and trying to access app
      router.replace('/login');
    } else if (session && isLogin) {
      // Redirect to tabs if authenticated and trying to access login
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="terms" />
      </Stack>
    </SafeAreaProvider>
  );
}