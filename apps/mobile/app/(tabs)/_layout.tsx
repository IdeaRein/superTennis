import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

// 簡易アイコン。必要に応じて @expo/vector-icons に置き換える。
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    match: '🎾',
    training: '💪',
    leaderboard: '🏆',
    profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerTitle: 'Super Tennis',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: '試合',
          headerTitle: 'マイ試合',
          tabBarIcon: ({ focused }) => <TabIcon name="match" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: '練習',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="training" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'ランキング',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="leaderboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'マイページ',
          headerTitle: 'プロフィール',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
