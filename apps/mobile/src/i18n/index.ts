/**
 * 国際化（i18n）モジュール
 * 日本語と英語の切替をサポートします
 */

import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ja from './locales/ja';
import en from './locales/en';

// 支持的语言
export type Locale = 'ja' | 'en';

// 语言包类型
export type Translations = typeof ja;

// 语言包映射
const translations: Record<Locale, Translations> = {
  ja,
  en,
};

// 端末の標準言語を取得
function getDeviceLocale(): Locale {
  const locales = getLocales();
  const deviceLanguage = locales[0]?.languageCode;

  if (deviceLanguage === 'ja') {
    return 'ja';
  }
  return 'en';
}

// i18n Store
interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: getDeviceLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * 获取当前语言的翻译
 */
export function useTranslation() {
  const { locale, setLocale } = useI18nStore();
  const t = translations[locale];

  return {
    t,
    locale,
    setLocale,
    isJa: locale === 'ja',
    isEn: locale === 'en',
  };
}

/**
 * パラメーターを含む翻訳文を整形します
 * 例: formatMessage('こんにちは、{{name}}さん', { name: 'World' }) => 'こんにちは、Worldさん'
 */
export function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    template
  );
}

/**
 * 翻訳文を取得します（コンポーネント外でも利用可能）
 */
export function getTranslations(locale?: Locale): Translations {
  const currentLocale = locale || useI18nStore.getState().locale;
  return translations[currentLocale];
}

/**
 * 言語名の対応表
 */
export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

export default {
  useTranslation,
  useI18nStore,
  formatMessage,
  getTranslations,
  localeNames,
};
