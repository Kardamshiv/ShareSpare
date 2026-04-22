import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { allThemes, Theme } from '../constants/Colors';
import { i18nDict, Locale } from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  themeName: Theme;
  language: Locale;
  setThemeName: (t: Theme) => void;
  setLanguage: (l: Locale) => void;
  colors: typeof allThemes['light'];
  t: (key: string) => string;
  isDark: boolean;
  isLoaded: boolean;
  unreadChats: Set<string>;
  clearUnreadChat: (chatId: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeNameState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Locale>('English');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    AsyncStorage.multiGet(['app_theme', 'app_language']).then((pairs) => {
      const savedTheme = pairs[0][1] as Theme | null;
      const savedLang = pairs[1][1] as Locale | null;
      if (savedTheme && allThemes[savedTheme]) setThemeNameState(savedTheme);
      if (savedLang && i18nDict[savedLang]) setLanguageState(savedLang);
      setIsLoaded(true);
    });
  }, []);

  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        AsyncStorage.getItem('unread_chats_' + user.id).then(val => {
          if (val) setUnreadChats(new Set(JSON.parse(val)));
        });

        const channel = supabase.channel(`global_messages_${user.id}_${Date.now()}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            if (payload.new.sender_id !== user.id) {
              setUnreadChats(prev => {
                const next = new Set(prev).add(payload.new.chat_id);
                AsyncStorage.setItem('unread_chats_' + user.id, JSON.stringify(Array.from(next)));
                return next;
              });
            }
          }).subscribe();

        return () => { supabase.removeChannel(channel); };
      });
    });
  }, []);

  const clearUnreadChat = (chatId: string) => {
    setUnreadChats(prev => {
      if (!prev.has(chatId)) return prev;
      const next = new Set(prev);
      next.delete(chatId);
      import('../lib/supabase').then(({ supabase }) => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) AsyncStorage.setItem('unread_chats_' + user.id, JSON.stringify(Array.from(next)));
        });
      });
      return next;
    });
  };

  const setThemeName = (t: Theme) => {
    setThemeNameState(t);
    AsyncStorage.setItem('app_theme', t);
  };

  const setLanguage = (l: Locale) => {
    setLanguageState(l);
    AsyncStorage.setItem('app_language', l);
  };

  const colors = allThemes[themeName] || allThemes['light'];
  const isDark = colors?.isDark ?? false;

  const t = (key: string) => {
    return i18nDict[language]?.[key] || i18nDict['English']?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ themeName, language, setThemeName, setLanguage, colors, t, isDark, isLoaded, unreadChats, clearUnreadChat }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
