import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { invitesApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

// 简单的日期选择选项
const getDateOptions = () => {
  const options = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    let label = '';
    if (i === 0) label = '今天';
    else if (i === 1) label = '明天';
    else if (i === 2) label = '后天';
    else label = `${date.getMonth() + 1}月${date.getDate()}日`;

    options.push({ date, label });
  }

  return options;
};

// 时间选项
const timeOptions = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export default function InviteMatchScreen() {
  const { friendId, friendName } = useLocalSearchParams<{
    friendId: string;
    friendName: string;
  }>();
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sending, setSending] = useState(false);

  const dateOptions = getDateOptions();

  const handleSendInvite = async () => {
    if (!user?.id || !friendId) return;

    setSending(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);

      await invitesApi.create({
        inviterId: user.id,
        inviteeId: friendId,
        matchTime: dateTime.toISOString(),
        location: location || undefined,
        message: message || undefined,
      });

      Alert.alert('发送成功', '比赛邀请已发送给 ' + friendName, [
        { text: '好的', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('发送失败', '请稍后重试');
    }
    setSending(false);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '試合に招待',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 对手信息 */}
          <View style={styles.friendCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friendName}</Text>
              <Text style={styles.friendLabel}>邀请对象</Text>
            </View>
          </View>

          {/* 比赛时间 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>比赛时间</Text>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>🕐</Text>
                <Text style={styles.dateTimeText}>{selectedTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 比赛地点 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>比赛地点</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：阳光网球俱乐部"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* 留言 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>留言 (可选)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="给对方说点什么..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* 快捷留言 */}
          <View style={styles.quickMessages}>
            {['来一局?', '有空约球吗?', '切磋一下?'].map((msg) => (
              <TouchableOpacity
                key={msg}
                style={styles.quickMessageButton}
                onPress={() => setMessage(msg)}
              >
                <Text style={styles.quickMessageText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 发送按钮 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendInvite}
            disabled={sending}
          >
            <Text style={styles.sendButtonText}>{sending ? '发送中...' : '发送邀请'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 日期选择器 Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>选择日期</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDone}>完成</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerOptions}>
              {dateOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerOption,
                    option.date.toDateString() === selectedDate.toDateString() &&
                      styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(option.date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      option.date.toDateString() === selectedDate.toDateString() &&
                        styles.pickerOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 时间选择器 Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>选择时间</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerDone}>完成</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerOptions}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.pickerOption,
                    time === selectedTime && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      time === selectedTime && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
  },
  friendInfo: {},
  friendName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  friendLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  dateTimeIcon: {
    fontSize: 20,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  quickMessages: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  quickMessageButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickMessageText: {
    color: '#4B5563',
    fontSize: 14,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerDone: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    minWidth: 70,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#10B981',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
