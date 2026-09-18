import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { clubsApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function CreateClubScreen() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入俱乐部名称');
      return;
    }

    if (!user?.id) {
      Alert.alert('提示', '请先登录');
      return;
    }

    setCreating(true);
    try {
      const club = await clubsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        creatorId: user.id,
      });

      Alert.alert('创建成功', `俱乐部"${club.name}"已创建`, [
        { text: '好的', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('创建失败', '请稍后重试');
    }
    setCreating(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'クラブを作成',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 俱乐部图标预览 */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarEmoji}>🎾</Text>
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>更换图标</Text>
            </TouchableOpacity>
          </View>

          {/* 基本信息 */}
          <View style={styles.formSection}>
            <Text style={styles.label}>俱乐部名称 *</Text>
            <TextInput
              style={styles.input}
              placeholder="输入俱乐部名称"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              maxLength={30}
            />

            <Text style={styles.label}>俱乐部简介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="介绍一下你的俱乐部..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />

            <Text style={styles.label}>所在地区</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：北京市朝阳区"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* 提示信息 */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>创建俱乐部须知</Text>
            <Text style={styles.tipItem}>• 你将成为俱乐部管理员</Text>
            <Text style={styles.tipItem}>• 可以邀请好友加入俱乐部</Text>
            <Text style={styles.tipItem}>• 可以组织俱乐部内部比赛</Text>
            <Text style={styles.tipItem}>• 俱乐部成员可查看内部排行榜</Text>
          </View>
        </ScrollView>

        {/* 创建按钮 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating}
          >
            <Text style={styles.createButtonText}>{creating ? '创建中...' : '创建俱乐部'}</Text>
          </TouchableOpacity>
        </View>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  changeAvatarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeAvatarText: {
    color: '#10B981',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
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
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
