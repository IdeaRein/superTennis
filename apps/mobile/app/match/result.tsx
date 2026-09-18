import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../../src/stores/matchStore';

export default function ResultScreen() {
  const { settings, score, duration, resetMatch } = useMatchStore();

  const player1Name = settings.player1Name || '自分';
  const player2Name = settings.player2Name || '対戦相手';
  const isPlayer1Winner = score.winner === 1;
  const winnerName = isPlayer1Winner ? player1Name : player2Name;

  // 時間を表示用に整形
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}時間${m}分`;
    }
    return `${m}分`;
  };

  // 総ゲーム数を計算
  const totalGames = score.player1Games.reduce(
    (sum, g, i) => sum + g + (score.player2Games[i] || 0),
    0
  );

  // セットスコアを表示用に整形
  const formatSetScores = () => {
    if (settings.setFormat === 'tiebreak10') {
      return `${score.player1Points} - ${score.player2Points}`;
    }
    return score.player1Games.map((g1, i) => `${g1}-${score.player2Games[i]}`).join('  ');
  };

  const handleGoHome = () => {
    resetMatch();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 勝者表示 */}
        <View style={styles.headerSection}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.congratsText}>{winnerName} の勝利！</Text>
        </View>

        {/* スコア */}
        <View style={styles.scoreCard}>
          <View style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerAvatar}>👤</Text>
              <Text style={styles.playerName}>{player1Name}</Text>
            </View>
            <View style={styles.scoreSection}>
              {settings.setFormat === 'tiebreak10' ? (
                <Text style={styles.setScore}>{score.player1Points}</Text>
              ) : (
                score.player1Games.map((g, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.setScore,
                      i < score.player1Games.length - 1 && styles.setScoreMargin,
                    ]}
                  >
                    {g}
                  </Text>
                ))
              )}
            </View>
            <View style={[styles.resultBadge, !isPlayer1Winner && styles.resultBadgeLose]}>
              <Text style={[styles.resultText, !isPlayer1Winner && styles.resultTextLose]}>
                {isPlayer1Winner ? '勝' : '敗'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerAvatar}>👤</Text>
              <Text style={styles.playerName}>{player2Name}</Text>
            </View>
            <View style={styles.scoreSection}>
              {settings.setFormat === 'tiebreak10' ? (
                <Text style={styles.setScore}>{score.player2Points}</Text>
              ) : (
                score.player2Games.map((g, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.setScore,
                      i < score.player2Games.length - 1 && styles.setScoreMargin,
                    ]}
                  >
                    {g}
                  </Text>
                ))
              )}
            </View>
            <View style={[styles.resultBadge, isPlayer1Winner && styles.resultBadgeLose]}>
              <Text style={[styles.resultText, isPlayer1Winner && styles.resultTextLose]}>
                {isPlayer1Winner ? '敗' : '勝'}
              </Text>
            </View>
          </View>

          <View style={styles.matchMeta}>
            <Text style={styles.metaText}>試合時間: {formatDuration(duration)}</Text>
            {settings.setFormat !== 'tiebreak10' && (
              <Text style={styles.metaText}>総ゲーム数: {totalGames}ゲーム</Text>
            )}
          </View>
        </View>

        {/* 操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>詳細な統計</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📹</Text>
            <Text style={styles.actionText}>ハイライトを再生</Text>
          </TouchableOpacity>
        </View>

        {/* 共有 */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonIcon}>📤</Text>
          <Text style={styles.shareButtonText}>画像を作成して共有</Text>
        </TouchableOpacity>

        {/* ホームへ戻る */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>ホームへ戻る</Text>
        </TouchableOpacity>
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  trophyIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scoreCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreSection: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  setScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  setScoreMargin: {
    marginRight: 8,
  },
  resultBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultBadgeLose: {
    backgroundColor: '#F3F4F6',
  },
  resultText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '600',
  },
  resultTextLose: {
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 5,
  },
  matchMeta: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaText: {
    color: '#6B7280',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 25,
    marginHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginTop: 25,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  shareButtonIcon: {
    fontSize: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  homeButton: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
