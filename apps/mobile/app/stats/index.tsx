import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { matchApi, Match } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Stats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalGamesWon: number;
  totalGamesLost: number;
  totalSetsWon: number;
  totalSetsLost: number;
  avgDuration: number;
  longestMatch: number;
  shortestMatch: number;
  monthlyMatches: { month: string; count: number }[];
  recentForm: ('W' | 'L')[];
}

export default function StatsScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calculateStats = useCallback(async () => {
    try {
      const matches = await matchApi.getAll();
      const finishedMatches = matches.filter((m: Match) => m.isFinished);

      if (finishedMatches.length === 0) {
        setStats({
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalGamesWon: 0,
          totalGamesLost: 0,
          totalSetsWon: 0,
          totalSetsLost: 0,
          avgDuration: 0,
          longestMatch: 0,
          shortestMatch: 0,
          monthlyMatches: [],
          recentForm: [],
        });
        return;
      }

      const wins = finishedMatches.filter((m: Match) => m.winner === 1).length;
      const losses = finishedMatches.length - wins;

      // 计算局数和盘数
      let totalGamesWon = 0;
      let totalGamesLost = 0;
      let totalSetsWon = 0;
      let totalSetsLost = 0;

      finishedMatches.forEach((match: Match) => {
        try {
          const p1Sets = match.player1Sets || [];
          const p2Sets = match.player2Sets || [];

          if (Array.isArray(p1Sets) && Array.isArray(p2Sets)) {
            p1Sets.forEach((games, i) => {
              totalGamesWon += games || 0;
              totalGamesLost += p2Sets[i] || 0;

              if ((games || 0) > (p2Sets[i] || 0)) {
                totalSetsWon++;
              } else if ((games || 0) < (p2Sets[i] || 0)) {
                totalSetsLost++;
              }
            });
          }
        } catch (e) {
          // Skip matches with invalid data
          console.warn('Invalid match data:', match.id);
        }
      });

      // 计算时长
      const durations = finishedMatches
        .filter((m: Match) => m.duration && m.duration > 0)
        .map((m: Match) => m.duration!);

      const avgDuration =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0;

      const longestMatch = durations.length > 0 ? Math.max(...durations) : 0;
      const shortestMatch = durations.length > 0 ? Math.min(...durations) : 0;

      // 计算月度比赛数
      const monthlyMap = new Map<string, number>();
      finishedMatches.forEach((match: Match) => {
        const date = new Date(match.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      });

      const monthlyMatches = Array.from(monthlyMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6)
        .map(([month, count]) => ({ month, count }))
        .reverse();

      // 最近战绩
      const recentForm = finishedMatches
        .slice(0, 10)
        .map((m: Match) => (m.winner === 1 ? 'W' : 'L') as 'W' | 'L');

      setStats({
        totalMatches: finishedMatches.length,
        wins,
        losses,
        winRate: Math.round((wins / finishedMatches.length) * 100),
        totalGamesWon,
        totalGamesLost,
        totalSetsWon,
        totalSetsLost,
        avgDuration,
        longestMatch,
        shortestMatch,
        monthlyMatches,
        recentForm,
      });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    calculateStats();
  }, [calculateStats]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}小时${m}分钟`;
    }
    return `${m}分钟`;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: '自分のデータ' }} />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '自分のデータ' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
        >
          {/* 核心数据 */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>总战绩</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{stats?.totalMatches || 0}</Text>
                <Text style={styles.heroStatLabel}>总场次</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, styles.winColor]}>{stats?.wins || 0}</Text>
                <Text style={styles.heroStatLabel}>胜</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, styles.loseColor]}>{stats?.losses || 0}</Text>
                <Text style={styles.heroStatLabel}>负</Text>
              </View>
            </View>

            {/* 胜率环 */}
            <View style={styles.winRateContainer}>
              <View style={styles.winRateCircle}>
                <Text style={styles.winRateValue}>{stats?.winRate || 0}%</Text>
                <Text style={styles.winRateLabel}>胜率</Text>
              </View>
            </View>
          </View>

          {/* 最近战绩 */}
          {stats?.recentForm && stats.recentForm.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>最近10场</Text>
              <View style={styles.formContainer}>
                {stats.recentForm.map((result, index) => (
                  <View
                    key={index}
                    style={[styles.formBadge, result === 'W' ? styles.formWin : styles.formLose]}
                  >
                    <Text style={styles.formText}>{result}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 局数和盘数 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>详细数据</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats?.totalSetsWon || 0}</Text>
                <Text style={styles.statBoxLabel}>赢盘数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats?.totalSetsLost || 0}</Text>
                <Text style={styles.statBoxLabel}>输盘数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats?.totalGamesWon || 0}</Text>
                <Text style={styles.statBoxLabel}>赢局数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats?.totalGamesLost || 0}</Text>
                <Text style={styles.statBoxLabel}>输局数</Text>
              </View>
            </View>
          </View>

          {/* 时长统计 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>比赛时长</Text>
            <View style={styles.durationStats}>
              <View style={styles.durationItem}>
                <Text style={styles.durationIcon}>⏱️</Text>
                <View>
                  <Text style={styles.durationValue}>
                    {formatDuration(stats?.avgDuration || 0)}
                  </Text>
                  <Text style={styles.durationLabel}>平均时长</Text>
                </View>
              </View>
              <View style={styles.durationItem}>
                <Text style={styles.durationIcon}>🏆</Text>
                <View>
                  <Text style={styles.durationValue}>
                    {formatDuration(stats?.longestMatch || 0)}
                  </Text>
                  <Text style={styles.durationLabel}>最长比赛</Text>
                </View>
              </View>
              <View style={styles.durationItem}>
                <Text style={styles.durationIcon}>⚡</Text>
                <View>
                  <Text style={styles.durationValue}>
                    {formatDuration(stats?.shortestMatch || 0)}
                  </Text>
                  <Text style={styles.durationLabel}>最短比赛</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 月度趋势 */}
          {stats?.monthlyMatches && stats.monthlyMatches.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>月度比赛趋势</Text>
              <View style={styles.chartContainer}>
                {stats.monthlyMatches.map((item, index) => {
                  const maxCount = Math.max(...stats.monthlyMatches.map((m) => m.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 80 : 0;

                  return (
                    <View key={item.month} style={styles.chartBar}>
                      <Text style={styles.chartValue}>{item.count}</Text>
                      <View style={[styles.chartBarFill, { height }]} />
                      <Text style={styles.chartLabel}>{item.month.split('-')[1]}月</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 空状态 */}
          {stats?.totalMatches === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>还没有比赛数据</Text>
              <Text style={styles.emptySubtext}>完成一场比赛后就能看到统计数据</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  heroStatLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
  },
  winColor: {
    color: '#10B981',
  },
  loseColor: {
    color: '#EF4444',
  },
  winRateContainer: {
    marginTop: 24,
  },
  winRateCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10B981',
  },
  winRateValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  winRateLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  formBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWin: {
    backgroundColor: '#D1FAE5',
  },
  formLose: {
    backgroundColor: '#FEE2E2',
  },
  formText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 64 - 12) / 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statBoxLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  durationStats: {
    gap: 16,
  },
  durationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  durationIcon: {
    fontSize: 28,
  },
  durationValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  durationLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartBarFill: {
    width: 24,
    backgroundColor: '#10B981',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
