import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { SettingsProvider } from '../store/SettingsProvider';
import { LogBox } from 'react-native';
import { useSettings } from '../store/SettingsProvider';
import * as SplashScreen from 'expo-splash-screen';

LogBox.ignoreLogs([
  'Expo AV has been deprecated',
  'setLayoutAnimationEnabledExperimental',
]);

SplashScreen.preventAutoHideAsync();

function ThemeLoader({ children, appReady }: { children: React.ReactNode, appReady: boolean }) {
  const { isLoaded } = useSettings();
  
  useEffect(() => {
    if (isLoaded && appReady) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded, appReady]);

  if (!isLoaded || !appReady) return null;
  return <>{children}</>;
}

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
      router.replace('/login');
    } else if (session && isLogin) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeLoader appReady={initialized}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="terms" />
          </Stack>
        </ThemeLoader>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}