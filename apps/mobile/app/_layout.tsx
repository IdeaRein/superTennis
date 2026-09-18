import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

// スプラッシュ画面の自動非表示を防ぐ
SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    // ナビゲーションの準備完了後に画面遷移する
    const timer = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // 未ログイン時はログイン画面へ遷移する
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        // ログイン済みならホーム画面へ遷移する
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, segments]);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useProtectedRoute(isAuthenticated, isLoading);

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      setAppIsReady(true);
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="match/setup"
            options={{
              headerShown: true,
              title: '試合を作成',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="match/calibration"
            options={{
              headerShown: true,
              title: 'コートのキャリブレーション',
            }}
          />
          <Stack.Screen
            name="match/playing"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="match/replay"
            options={{
              headerShown: true,
              title: '判定リプレイ',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="match/result"
            options={{
              headerShown: true,
              title: '試合終了',
            }}
          />
        </Stack>
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
