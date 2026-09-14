import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationsApi } from './api';

// 通知の表示方法を設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// プッシュ通知を登録
export async function registerForPushNotificationsAsync(userId: string): Promise<string | null> {
  let token: string | null = null;

  // プッシュ通知は実機でのみ利用可能
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // 権限を確認してリクエスト
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permission');
    return null;
  }

  // プッシュトークンを取得
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // 実際のExpoプロジェクトIDに置き換える
    });
    token = tokenData.data;

    // サーバーへ登録
    await notificationsApi.registerPushToken(userId, token, Platform.OS);

    console.log('Push token registered:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  // Androidでは通知チャンネルを設定
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  return token;
}

// ローカル通知を送信
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // 直ちに送信
  });
}

// 試合リマインダーを送信
export async function scheduleMatchReminder(
  matchId: string,
  matchTime: Date,
  opponentName: string,
  location?: string
) {
  // 30分前に通知
  const reminderTime = new Date(matchTime.getTime() - 30 * 60 * 1000);

  if (reminderTime <= new Date()) {
    console.log('Match reminder time has already passed');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '試合リマインダー',
      body: `${opponentName}さんとの試合が30分後に始まります${location ? `（場所: ${location}）` : ''}`,
      data: { matchId, type: 'match_reminder' },
      sound: true,
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: reminderTime },
  });

  console.log('Match reminder scheduled for:', reminderTime);
}

// すべての通知をキャンセル
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// 指定した通知をキャンセル
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// 予定済みの通知をすべて取得
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// バッジ数を設定
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// バッジを消去
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

// 通知タップのリスナーを追加
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// 通知受信のリスナーを追加
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}
