import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { matchApi, Match } from '../../src/services/api';

export default function HomeScreen() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMatches = useCallback(async () => {
    try {
      setError(null);
      const matches = await matchApi.getAll();
      // 只显示最近3场
      setRecentMatches(matches.slice(0, 3));
    } catch (err) {
      setError('无法加载比赛数据');
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentMatches();
  }, [fetchRecentMatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecentMatches();
  }, [fetchRecentMatches]);

  // 格式化比分显示
  const formatScore = (match: Match) => {
    if (match.player1Sets.length === 0) return '0-0';
    return match.player1Sets.map((s, i) => `${s}-${match.player2Sets[i] ?? 0}`).join(' ');
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* 开始比赛按钮 */}
        <View style={styles.heroSection}>
          <Link href="/match/setup" asChild>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonIcon}>🎾</Text>
              <Text style={styles.startButtonText}>开始比赛</Text>
              <Text style={styles.startButtonSubtext}>记录你的精彩对决</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* 最近比赛 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近比赛</Text>
            <Link href="/matches" asChild>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>查看全部 &gt;</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : error ? (
            <TouchableOpacity style={styles.errorState} onPress={fetchRecentMatches}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext}>点击重试</Text>
            </TouchableOpacity>
          ) : recentMatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎾</Text>
              <Text style={styles.emptyText}>还没有比赛记录</Text>
              <Text style={styles.emptySubtext}>开始你的第一场比赛吧！</Text>
            </View>
          ) : (
            <View style={styles.matchList}>
              {recentMatches.map((match) => (
                <View key={match.id} style={styles.matchCard}>
                  <View style={styles.matchPlayers}>
                    <Text style={styles.matchPlayerName} numberOfLines={1}>
                      {match.player1Name}
                    </Text>
                    <Text style={styles.matchVs}>vs</Text>
                    <Text style={styles.matchPlayerName} numberOfLines={1}>
                      {match.player2Name}
                    </Text>
                  </View>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchScore}>{formatScore(match)}</Text>
                    <View style={styles.matchMeta}>
                      {match.isFinished && match.winner && (
                        <Text style={styles.matchWinner}>
                          {match.winner === 1 ? match.player1Name : match.player2Name} 胜
                        </Text>
                      )}
                      <Text style={styles.matchDate}>{formatDate(match.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI 演示模式 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI 功能</Text>
          </View>
          <Link href="/demo" asChild>
            <TouchableOpacity style={styles.demoCard}>
              <View style={styles.demoCardLeft}>
                <Text style={styles.demoCardIcon}>👁️</Text>
                <View>
                  <Text style={styles.demoCardTitle}>AI 演示模式</Text>
                  <Text style={styles.demoCardDesc}>测试鹰眼判定和自动记分</Text>
                </View>
              </View>
              <Text style={styles.demoCardArrow}>›</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/hawkeye" asChild>
            <TouchableOpacity style={[styles.demoCard, styles.hawkeyeCard]}>
              <View style={styles.demoCardLeft}>
                <Text style={styles.demoCardIcon}>🎯</Text>
                <View>
                  <Text style={styles.demoCardTitle}>鹰眼测试 (Beta)</Text>
                  <Text style={styles.demoCardDesc}>VisionCamera + AI 实时检测</Text>
                </View>
              </View>
              <Text style={styles.demoCardArrow}>›</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* 俱乐部动态 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>俱乐部动态</Text>
          </View>
          <View style={styles.clubCard}>
            <Text style={styles.clubCardIcon}>🔥</Text>
            <Text style={styles.clubCardText}>加入俱乐部，和球友一起打球</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  heroSection: {
    padding: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  startButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionLink: {
    fontSize: 14,
    color: '#10B981',
  },
  loadingState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  errorState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 5,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 5,
  },
  matchList: {
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  matchPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  matchPlayerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  matchVs: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  matchWinner: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  matchDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  clubCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  clubCardText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  demoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoCardIcon: {
    fontSize: 32,
  },
  demoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  demoCardDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  demoCardArrow: {
    fontSize: 24,
    color: '#6B7280',
  },
  hawkeyeCard: {
    marginTop: 12,
    backgroundColor: '#064E3B',
  },
});
