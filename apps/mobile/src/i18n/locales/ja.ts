/**
 * 日本語言語パック
 */
export default {
  // 共通
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    back: '戻る',
    next: '次へ',
    done: '完成',
    loading: '読み込み中...',
    error: 'エラー',
    success: '完了',
    retry: '再試行',
    close: '閉じる',
  },

  // ホーム
  home: {
    title: 'SuperTennis',
    subtitle: 'AIテニススコアリング',
    startMatch: '試合を開始',
    matchHistory: '試合履歴',
    settings: '設定',
    noMatches: '試合履歴はありません',
  },

  // 試合設定
  matchSetup: {
    title: '試合設定',
    player1: 'プレーヤー1',
    player2: 'プレーヤー2',
    playerName: '名前を入力',
    matchType: '試合形式',
    singles: 'シングルス',
    doubles: 'ダブルス',
    sets: 'セット数',
    oneSet: '1セット',
    threeSets: '3セットマッチ',
    fiveSets: '5セットマッチ',
    tiebreak: 'タイブレーク',
    startMatch: '試合を開始',
  },

  // コートキャリブレーション
  calibration: {
    title: 'コートキャリブレーション',
    instruction: 'コートの4つの角を順にタップしてください',
    topLeft: '左上',
    topRight: '右上',
    bottomRight: '右下',
    bottomLeft: '左下',
    reset: 'リセット',
    startMatch: '試合を開始',
    tip: 'ヒント: コート全体が映るよう、スマートフォンをサイドラインに固定してください',
    point: '点',
    pointsRemaining: 'あと {{count}} 点をマークしてください',
    complete: 'キャリブレーション完了',
  },

  // 試合中
  match: {
    title: '試合',
    set: 'セット',
    game: 'ゲーム',
    point: 'ポイント',
    serve: 'サーブ',
    score: 'スコア',
    advantage: 'アドバンテージ',
    deuce: 'デュース',
    gamePoint: 'ゲームポイント',
    setPoint: 'セットポイント',
    matchPoint: 'マッチポイント',
    breakPoint: 'ブレークポイント',
    tiebreak: 'タイブレーク',
    player1Scores: '{{name}} の得点',
    player2Scores: '{{name}} の得点',
    endMatch: '試合を終了',
    pauseMatch: '一時停止',
    resumeMatch: '再開',
  },

  // AI機能
  ai: {
    status: 'AIステータス',
    idle: 'AI待機中',
    tracking: 'AI追跡中',
    bounceDetected: 'バウンドを検出',
    autoScore: '自動採点',
    autoScoreEnabled: '自動採点を有効にしました',
    autoScoreDisabled: '自動採点を無効にしました',
    inBounds: 'イン',
    outOfBounds: 'アウト',
    confidence: '信頼度',
    fps: 'FPS',
    hawkEye: 'ホークアイ',
    analyzing: '解析中...',
    noData: 'データなし',
  },

  // ホークアイ判定
  hawkEye: {
    title: 'ホークアイ判定',
    in: 'イン',
    out: 'アウト',
    distance: 'ラインからの距離',
    mm: 'mm',
    reviewing: 'リプレイを解析中...',
    noCallAvailable: '判定データはありません',
  },

  // 試合リプレイ
  replay: {
    title: '試合リプレイ',
    events: 'イベント一覧',
    noEvents: 'イベント記録はありません',
    bounce: 'バウンド',
    shot: 'ショット',
    out: 'アウト',
    statistics: '統計',
    timeline: 'タイムライン',
  },

  // 試合結果
  result: {
    title: '試合終了',
    winner: '勝者',
    finalScore: '最終スコア',
    duration: '試合時間',
    totalPoints: '総得点',
    aces: 'Aces',
    doubleFaults: 'ダブルフォルト',
    winners: 'ウィナー',
    errors: 'アンフォーストエラー',
    saveMatch: '試合を保存',
    newMatch: '新しい試合',
    share: '共有',
  },

  // 設定
  settings: {
    title: '設定',
    language: '言語',
    japanese: '日本語',
    english: 'English',
    camera: 'カメラ',
    cameraPermission: 'カメラの権限',
    aiSettings: 'AI設定',
    sensitivity: '検出感度',
    low: '低',
    medium: '中',
    high: '高',
    about: 'アプリについて',
    version: 'バージョン',
    feedback: 'フィードバック',
    privacyPolicy: 'プライバシーポリシー',
  },

  // 権限
  permissions: {
    cameraTitle: 'カメラの権限が必要です',
    cameraMessage: 'AIホークアイ機能を使うには、カメラへのアクセスを許可してください',
    goToSettings: '設定を開く',
    denied: '権限が拒否されました',
  },

  // エラーメッセージ
  errors: {
    networkError: 'ネットワークエラーです。接続を確認してください',
    serverError: 'サーバーエラーです。しばらくしてから再試行してください',
    saveError: '保存に失敗しました',
    loadError: '読み込みに失敗しました',
    cameraError: 'カメラを起動できませんでした',
    calibrationError: 'キャリブレーションに失敗しました。再試行してください',
  },

  // テニス用語
  tennis: {
    serve: 'サーブ',
    return: 'リターン',
    forehand: 'フォアハンド',
    backhand: 'バックハンド',
    volley: 'ボレー',
    smash: 'スマッシュ',
    lob: 'ロブ',
    dropShot: 'ドロップショット',
    ace: 'Ace',
    doubleFault: 'ダブルフォルト',
    let: 'Let',
    fault: 'フォルト',
    net: 'ネット',
    baseline: 'ベースライン',
    sideline: 'サイドライン',
    serviceLine: 'サービスライン',
    centerLine: 'センターライン',
    deuceCourt: 'デュースサイド',
    adCourt: 'アドサイド',
  },
};
