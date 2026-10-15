import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme, Platform } from 'react-native';
import { useAppStore } from '@/store';
import { NotificationService } from '@/utils/NotificationService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { 
    loadSettings, 
    loadTasks, 
    loadExpenses, 
    loadFixedExpenses, 
    loadNoteLists 
  } = useAppStore();

  useEffect(() => {
    NotificationService.init();

    Promise.all([
      loadSettings(),
      loadTasks(),
      loadExpenses(),
      loadFixedExpenses(),
      loadNoteLists()
    ]).finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="fitness" options={{ headerShown: false }} />
        <Stack.Screen name="lineups" options={{ headerShown: false }} />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: "Configuración", 
            presentation: "modal", 
            headerStyle: { backgroundColor: '#1E1E1E' }, 
            headerTintColor: '#FFF' 
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
