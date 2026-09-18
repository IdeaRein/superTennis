import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { analyticsApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [technique, setTechnique] = useState<any>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [perfData, oppData, techData] = await Promise.all([
        analyticsApi.getPerformance(user.id, period),
        analyticsApi.getOpponents(user.id),
        analyticsApi.getTechniqueAnalysis(user.id),
      ]);
      setPerformance(perfData);
      setOpponents(oppData);
      setTechnique(techData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}分钟`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>加载分析数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'データ分析',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* 时间筛选 */}
          <View style={styles.periodTabs}>
            {(['week', 'month', 'year'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, period === p && styles.periodTabActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>
                  {p === 'week' ? '本周' : p === 'month' ? '本月' : '今年'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 综合统计 */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>综合表现</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{performance?.summary?.totalMatches || 0}</Text>
                <Text style={styles.summaryLabel}>比赛场次</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.winValue]}>
                  {performance?.summary?.wins || 0}
                </Text>
                <Text style={styles.summaryLabel}>胜利</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.loseValue]}>
                  {performance?.summary?.losses || 0}
                </Text>
                <Text style={styles.summaryLabel}>失败</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{performance?.summary?.winRate || 0}%</Text>
                <Text style={styles.summaryLabel}>胜率</Text>
              </View>
            </View>
          </View>

          {/* 胜率环形图 */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>胜率分析</Text>
            <View style={styles.winRateChart}>
              <View style={styles.ringContainer}>
                <View style={[styles.ringOuter, { borderColor: '#10B981' }]}>
                  <View style={styles.ringInner}>
                    <Text style={styles.ringValue}>{performance?.summary?.winRate || 0}%</Text>
                    <Text style={styles.ringLabel}>胜率</Text>
                  </View>
                </View>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>胜 {performance?.summary?.wins || 0} 场</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>负 {performance?.summary?.losses || 0} 场</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 盘局统计 */}
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>盘数统计</Text>
              <View style={styles.statsBar}>
                <View
                  style={[
                    styles.statsBarFill,
                    {
                      width: `${performance?.sets?.winRate || 50}%`,
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
              <View style={styles.statsLabels}>
                <Text style={styles.statsWin}>胜 {performance?.sets?.won || 0}</Text>
                <Text style={styles.statsLose}>负 {performance?.sets?.lost || 0}</Text>
              </View>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>局数统计</Text>
              <View style={styles.statsBar}>
                <View
                  style={[
                    styles.statsBarFill,
                    {
                      width: `${performance?.games?.winRate || 50}%`,
                      backgroundColor: '#3B82F6',
                    },
                  ]}
                />
              </View>
              <View style={styles.statsLabels}>
                <Text style={styles.statsWin}>胜 {performance?.games?.won || 0}</Text>
                <Text style={styles.statsLose}>负 {performance?.games?.lost || 0}</Text>
              </View>
            </View>
          </View>

          {/* 技术分析 */}
          {technique && technique.techniques?.length > 0 && (
            <View style={styles.techniqueCard}>
              <Text style={styles.sectionTitle}>技术分析</Text>
              {technique.techniques.map((tech: any) => (
                <View key={tech.type} style={styles.techRow}>
                  <Text style={styles.techName}>{getTypeName(tech.type)}</Text>
                  <View style={styles.techBar}>
                    <View style={[styles.techFill, { width: `${tech.successRate}%` }]} />
                  </View>
                  <Text style={styles.techValue}>{tech.successRate}%</Text>
                </View>
              ))}
              {technique.recommendations?.length > 0 && (
                <View style={styles.recommendations}>
                  <Text style={styles.recTitle}>训练建议</Text>
                  {technique.recommendations.map((rec: string, i: number) => (
                    <Text key={i} style={styles.recText}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 对手分析 */}
          <View style={styles.opponentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>对手分析</Text>
              <TouchableOpacity onPress={() => router.push('/analytics/opponents' as any)}>
                <Text style={styles.seeAllText}>查看全部</Text>
              </TouchableOpacity>
            </View>
            {opponents.length > 0 ? (
              opponents.slice(0, 5).map((opp) => (
                <TouchableOpacity
                  key={opp.name}
                  style={styles.opponentCard}
                  onPress={() =>
                    router.push(`/analytics/opponent?name=${encodeURIComponent(opp.name)}` as any)
                  }
                >
                  <View style={styles.opponentAvatar}>
                    <Text style={styles.opponentAvatarText}>👤</Text>
                  </View>
                  <View style={styles.opponentInfo}>
                    <Text style={styles.opponentName}>{opp.name}</Text>
                    <Text style={styles.opponentStats}>
                      {opp.totalMatches} 场 · 胜率 {opp.winRate}%
                    </Text>
                  </View>
                  <View style={styles.opponentRecord}>
                    <Text style={styles.opponentWins}>{opp.wins}</Text>
                    <Text style={styles.opponentVs}>-</Text>
                    <Text style={styles.opponentLosses}>{opp.losses}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>📊</Text>
                <Text style={styles.noDataText}>完成比赛后显示对手分析</Text>
              </View>
            )}
          </View>

          {/* 评分趋势 */}
          {performance?.ratingHistory?.length > 0 && (
            <View style={styles.ratingCard}>
              <Text style={styles.sectionTitle}>积分趋势</Text>
              <View style={styles.ratingTrend}>
                {performance.ratingHistory.slice(-7).map((entry: any, i: number) => {
                  const maxRating = Math.max(
                    ...performance.ratingHistory.slice(-7).map((e: any) => e.rating)
                  );
                  const minRating = Math.min(
                    ...performance.ratingHistory.slice(-7).map((e: any) => e.rating)
                  );
                  const range = maxRating - minRating || 1;
                  const height = 20 + ((entry.rating - minRating) / range) * 60;

                  return (
                    <View key={i} style={styles.ratingBar}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          {
                            height,
                            backgroundColor: entry.change >= 0 ? '#10B981' : '#EF4444',
                          },
                        ]}
                      />
                      <Text style={styles.ratingBarValue}>{entry.rating}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function getTypeName(type: string): string {
  const names: { [key: string]: string } = {
    serve: '🎾 发球',
    forehand: '💪 正手',
    backhand: '🏃 反手',
    volley: '⚡ 截击',
    rally: '🔄 底线',
  };
  return names[type] || type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  periodTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  periodTabActive: {
    backgroundColor: '#10B981',
  },
  periodTabText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  periodTabTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  winValue: {
    color: '#10B981',
  },
  loseValue: {
    color: '#EF4444',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  winRateChart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringContainer: {
    flex: 1,
    alignItems: 'center',
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  ringLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  statsBar: {
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statsBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statsWin: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  statsLose: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  techniqueCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  techName: {
    width: 80,
    fontSize: 13,
    color: '#4B5563',
  },
  techBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  techFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  techValue: {
    width: 40,
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  recommendations: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  opponentsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#10B981',
    fontWeight: '500',
  },
  opponentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  opponentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  opponentAvatarText: {
    fontSize: 20,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  opponentStats: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  opponentRecord: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentWins: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  opponentVs: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  opponentLosses: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  noDataIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noDataText: {
    color: '#9CA3AF',
  },
  ratingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ratingTrend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
  },
  ratingBar: {
    alignItems: 'center',
    width: 40,
  },
  ratingBarFill: {
    width: 20,
    borderRadius: 4,
    marginBottom: 4,
  },
  ratingBarValue: {
    fontSize: 10,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 20,
  },
});
