/**
 * 共有サービス: 共有カードとSNS用テキストを生成します
 */

import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

// 試合結果の共有データ
export interface MatchShareData {
  player1Name: string;
  player2Name: string;
  player1Sets: number[];
  player2Sets: number[];
  winner: 1 | 2;
  duration: number;
  date: Date;
  matchType: 'singles' | 'doubles';
}

// 実績の共有データ
export interface AchievementShareData {
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  userName: string;
}

// 練習サマリーの共有データ
export interface TrainingShareData {
  type: string;
  duration: number;
  totalShots: number;
  successRate: number;
  avgSpeed?: number;
  date: Date;
  userName: string;
}

/**
 * 試合結果の共有テキストを生成します
 */
export function generateMatchResultText(data: MatchShareData): string {
  const winnerName = data.winner === 1 ? data.player1Name : data.player2Name;
  const loserName = data.winner === 1 ? data.player2Name : data.player1Name;

  const sets = data.player1Sets.map((s, i) => `${s}-${data.player2Sets[i]}`).join(' ');

  const durationMin = Math.floor(data.duration / 60);
  const dateStr = data.date.toLocaleDateString('ja-JP');

  return `🎾 テニス試合結果

🏆 ${winnerName} の勝利！

スコア: ${sets}
試合時間: ${durationMin}分
日付: ${dateStr}
種目: ${data.matchType === 'singles' ? 'シングルス' : 'ダブルス'}

#SuperTennis #テニス #スポーツ`;
}

/**
 * 実績の共有テキストを生成します
 */
export function generateAchievementText(data: AchievementShareData): string {
  const dateStr = data.unlockedAt.toLocaleDateString('ja-JP');

  return `${data.icon} 実績を解除！

${data.title}
${data.description}

達成者: ${data.userName}
達成日: ${dateStr}

#SuperTennis #テニス #実績`;
}

/**
 * 練習サマリーの共有テキストを生成します
 */
export function generateTrainingText(data: TrainingShareData): string {
  const durationMin = Math.floor(data.duration / 60);
  const dateStr = data.date.toLocaleDateString('ja-JP');

  const typeNames: { [key: string]: string } = {
    serve: 'サーブ練習',
    forehand: 'フォアハンド',
    backhand: 'バックハンド',
    volley: 'ネット前ボレー',
    rally: 'ベースラインラリー',
  };

  let text = `🎾 練習完了！

練習種目: ${typeNames[data.type] || data.type}
練習時間: ${durationMin}分
ショット数: ${data.totalShots}
成功率: ${data.successRate}%`;

  if (data.avgSpeed) {
    text += `\n平均球速: ${data.avgSpeed.toFixed(1)} km/h`;
  }

  text += `\n日付: ${dateStr}

#SuperTennis #テニス練習 #スポーツ`;

  return text;
}

/**
 * ランキングの共有テキストを生成します
 */
export function generateLeaderboardText(
  rank: number,
  rating: number,
  userName: string,
  percentile: number
): string {
  let emoji = '';
  if (rank === 1) emoji = '🥇';
  else if (rank === 2) emoji = '🥈';
  else if (rank === 3) emoji = '🥉';
  else if (rank <= 10) emoji = '🏅';
  else emoji = '🎾';

  return `${emoji} SuperTennis ランキング

プレーヤー: ${userName}
順位: #${rank}
レーティング: ${rating}
上位: ${percentile}%

#SuperTennis #テニスランキング #スポーツ`;
}

/**
 * テキストをSNSへ共有します
 */
export async function shareText(content: string, title?: string): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        message: content,
        title: title || 'SuperTennis',
      },
      {
        dialogTitle: '共有する',
      }
    );

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * 試合結果を共有します
 */
export async function shareMatchResult(data: MatchShareData): Promise<boolean> {
  const text = generateMatchResultText(data);
  return shareText(text, '試合結果');
}

/**
 * 実績を共有します
 */
export async function shareAchievement(data: AchievementShareData): Promise<boolean> {
  const text = generateAchievementText(data);
  return shareText(text, '実績を解除');
}

/**
 * 練習サマリーを共有します
 */
export async function shareTraining(data: TrainingShareData): Promise<boolean> {
  const text = generateTrainingText(data);
  return shareText(text, '練習完了');
}

/**
 * ランキングを共有します
 */
export async function shareLeaderboard(
  rank: number,
  rating: number,
  userName: string,
  percentile: number
): Promise<boolean> {
  const text = generateLeaderboardText(rank, rating, userName, percentile);
  return shareText(text, 'ランキング');
}

/**
 * 試合結果のSVG共有カードを生成します
 */
export function generateMatchPosterSvg(data: MatchShareData): string {
  const winnerName = data.winner === 1 ? data.player1Name : data.player2Name;
  const sets = data.player1Sets.map((s, i) => `${s}-${data.player2Sets[i]}`).join('  ');
  const dateStr = data.date.toLocaleDateString('ja-JP');

  return `
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E40AF"/>
      <stop offset="100%" style="stop-color:#10B981"/>
    </linearGradient>
  </defs>

  <rect width="400" height="600" fill="url(#bg)"/>

  <text x="200" y="80" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
    🎾 SuperTennis
  </text>

  <text x="200" y="180" text-anchor="middle" fill="white" font-size="48" font-weight="bold">
    🏆
  </text>

  <text x="200" y="240" text-anchor="middle" fill="white" font-size="28" font-weight="bold">
    ${winnerName} の勝利！
  </text>

  <text x="200" y="320" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="20">
    ${data.player1Name}
  </text>
  <text x="200" y="355" text-anchor="middle" fill="white" font-size="36" font-weight="bold">
    ${sets}
  </text>
  <text x="200" y="390" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="20">
    ${data.player2Name}
  </text>

  <text x="200" y="480" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="16">
    ${dateStr} · ${data.matchType === 'singles' ? 'シングルス' : 'ダブルス'}
  </text>

  <text x="200" y="560" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="12">
    SuperTennis - あなたのテニスパートナー
  </text>
</svg>`;
}

/**
 * 実績のSVG共有カードを生成します
 */
export function generateAchievementPosterSvg(data: AchievementShareData): string {
  return `
<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FCD34D"/>
      <stop offset="100%" style="stop-color:#F59E0B"/>
    </linearGradient>
  </defs>

  <rect width="400" height="500" fill="url(#bg)"/>

  <text x="200" y="80" text-anchor="middle" fill="#1F2937" font-size="24" font-weight="bold">
    🎾 SuperTennis
  </text>

  <text x="200" y="180" text-anchor="middle" font-size="72">
    ${data.icon}
  </text>

  <text x="200" y="260" text-anchor="middle" fill="#1F2937" font-size="24" font-weight="bold">
    実績を解除！
  </text>

  <text x="200" y="310" text-anchor="middle" fill="#1F2937" font-size="20" font-weight="600">
    ${data.title}
  </text>

  <text x="200" y="350" text-anchor="middle" fill="rgba(31,41,55,0.7)" font-size="14">
    ${data.description}
  </text>

  <text x="200" y="420" text-anchor="middle" fill="rgba(31,41,55,0.6)" font-size="14">
    ${data.userName}
  </text>

  <text x="200" y="470" text-anchor="middle" fill="rgba(31,41,55,0.4)" font-size="12">
    SuperTennis - あなたのテニスパートナー
  </text>
</svg>`;
}

export default {
  shareText,
  shareMatchResult,
  shareAchievement,
  shareTraining,
  shareLeaderboard,
  generateMatchResultText,
  generateAchievementText,
  generateTrainingText,
  generateLeaderboardText,
  generateMatchPosterSvg,
  generateAchievementPosterSvg,
};
