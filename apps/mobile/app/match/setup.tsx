import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchStore } from '../../src/stores/matchStore';

export default function MatchSetupScreen() {
  const { settings, setSettings } = useMatchStore();

  const handleNext = () => {
    router.push('/match/calibration');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 試合種目 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>試合種目</Text>
          <View style={styles.optionRow}>
            <OptionButton
              selected={settings.matchType === 'singles'}
              onPress={() => setSettings({ matchType: 'singles' })}
              label="シングルス"
            />
            <OptionButton
              selected={settings.matchType === 'doubles'}
              onPress={() => setSettings({ matchType: 'doubles' })}
              label="ダブルス"
            />
          </View>
        </View>

        {/* 試合形式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>試合形式</Text>
          <View style={styles.optionRow}>
            <OptionButton
              selected={settings.setFormat === 'one'}
              onPress={() => setSettings({ setFormat: 'one' })}
              label="1セット"
            />
            <OptionButton
              selected={settings.setFormat === 'three'}
              onPress={() => setSettings({ setFormat: 'three' })}
              label="3セット"
            />
            <OptionButton
              selected={settings.setFormat === 'tiebreak10'}
              onPress={() => setSettings({ setFormat: 'tiebreak10' })}
              label="10ポイントTB"
            />
          </View>

          <View style={styles.checkboxRow}>
            <CheckboxItem
              checked={settings.useTiebreak}
              onPress={() => setSettings({ useTiebreak: !settings.useTiebreak })}
              label="最終セットTB"
            />
            <CheckboxItem
              checked={settings.useAdvantage}
              onPress={() => setSettings({ useAdvantage: !settings.useAdvantage })}
              label="アドバンテージ制"
            />
          </View>
        </View>

        {/* 選手情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>選手情報</Text>

          <Text style={styles.inputLabel}>自分（戦績に反映されます）</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🟢</Text>
            <TextInput
              style={styles.input}
              placeholder="自分の名前を入力"
              placeholderTextColor="#9CA3AF"
              value={settings.player1Name}
              onChangeText={(text) => setSettings({ player1Name: text })}
            />
          </View>

          <Text style={styles.inputLabel}>対戦相手</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🟣</Text>
            <TextInput
              style={styles.input}
              placeholder="対戦相手の名前を入力"
              placeholderTextColor="#9CA3AF"
              value={settings.player2Name}
              onChangeText={(text) => setSettings({ player2Name: text })}
            />
          </View>
        </View>

        {/* 最初のサーバー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最初にサーブするのは？</Text>
          <View style={styles.optionRow}>
            <OptionButton
              selected={settings.firstServer === 1}
              onPress={() => setSettings({ firstServer: 1 })}
              label="手前の選手"
            />
            <OptionButton
              selected={settings.firstServer === 2}
              onPress={() => setSettings({ firstServer: 2 })}
              label="奥の選手"
            />
          </View>
        </View>
      </ScrollView>

      {/* 次へ */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>次へ：スマートフォンを設置</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OptionButton({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CheckboxItem({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity style={styles.checkboxItem} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionButtonTextSelected: {
    color: '#059669',
  },
  checkboxRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 20,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
