import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { matchApi, Match } from '../../src/services/api';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await matchApi.getAll();
      setMatches(data);
    } catch (err) {
      setError('无法加载比赛数据');
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [fetchMatches]);

  // 格式化比分显示
  const formatScore = (match: Match) => {
    if (match.player1Sets.length === 0) return '0-0';
    return match.player1Sets.map((s, i) => `${s}-${match.player2Sets[i] ?? 0}`).join('  ');
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化时长
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins}分钟`;
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerAvatar}>👤</Text>
          <Text style={styles.playerName} numberOfLines={1}>
            {item.player1Name}
          </Text>
        </View>
        <Text style={styles.vsText}>vs</Text>
        <View style={[styles.playerInfo, styles.playerInfoRight]}>
          <Text style={styles.playerName} numberOfLines={1}>
            {item.player2Name}
          </Text>
          <Text style={styles.playerAvatar}>👤</Text>
        </View>
      </View>
      <View style={styles.scoreSection}>
        <Text style={styles.scoreText}>{formatScore(item)}</Text>
      </View>
      <View style={styles.matchFooter}>
        {item.isFinished ? (
          <View
            style={[styles.resultBadge, item.winner === 1 ? styles.winBadge : styles.loseBadge]}
          >
            <Text style={[styles.resultText, item.winner === 1 ? styles.winText : styles.loseText]}>
              {item.winner === 1 ? item.player1Name : item.player2Name} 胜
            </Text>
          </View>
        ) : (
          <View style={[styles.resultBadge, styles.ongoingBadge]}>
            <Text style={styles.ongoingText}>进行中</Text>
          </View>
        )}
        <View style={styles.matchMeta}>
          {item.duration && (
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          )}
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={styles.startButton} onPress={fetchMatches}>
            <Text style={styles.startButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎾</Text>
          <Text style={styles.emptyTitle}>暂无比赛记录</Text>
          <Text style={styles.emptySubtitle}>开始你的第一场比赛</Text>
          <Link href="/match/setup" asChild>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>开始比赛</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
        />
      )}
    </SafeAreaView>
  );
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
  listContent: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerInfoRight: {
    justifyContent: 'flex-end',
  },
  playerAvatar: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1,
  },
  vsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 10,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 2,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  winBadge: {
    backgroundColor: '#D1FAE5',
  },
  loseBadge: {
    backgroundColor: '#FEE2E2',
  },
  ongoingBadge: {
    backgroundColor: '#FEF3C7',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '500',
  },
  winText: {
    color: '#059669',
  },
  loseText: {
    color: '#DC2626',
  },
  ongoingText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '500',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
