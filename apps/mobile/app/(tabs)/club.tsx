import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClubScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 自分のクラブ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自分のクラブ</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>まだクラブに参加していません</Text>
            <Text style={styles.emptySubtitle}>クラブに参加して仲間とテニスを楽しもう</Text>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>クラブを探す</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* クラブを探す */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>おすすめのクラブ</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>すべて見る &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* おすすめクラブ */}
          <View style={styles.clubCard}>
            <View style={styles.clubInfo}>
              <Text style={styles.clubIcon}>🎾</Text>
              <View style={styles.clubDetails}>
                <Text style={styles.clubName}>サンシャインテニスクラブ</Text>
                <Text style={styles.clubMeta}>⭐ 4.8 · 326人</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinSmallButton}>
              <Text style={styles.joinSmallButtonText}>参加</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.clubCard}>
            <View style={styles.clubInfo}>
              <Text style={styles.clubIcon}>🏸</Text>
              <View style={styles.clubDetails}>
                <Text style={styles.clubName}>CBDテニスリーグ</Text>
                <Text style={styles.clubMeta}>⭐ 4.6 · 198人</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinSmallButton}>
              <Text style={styles.joinSmallButtonText}>参加</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 対戦募集 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>対戦募集</Text>
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonIcon}>🚀</Text>
            <Text style={styles.comingSoonText}>近日公開予定</Text>
            <Text style={styles.comingSoonSubtext}>対戦を募集して相手を見つけよう</Text>
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
  section: {
    padding: 20,
    paddingBottom: 10,
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
    marginBottom: 15,
  },
  sectionLink: {
    fontSize: 14,
    color: '#10B981',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  clubCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  clubMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  joinSmallButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinSmallButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  comingSoonSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
