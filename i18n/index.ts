import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import uk from './locales/uk.json';
import ru from './locales/ru.json';
import pl from './locales/pl.json';
import de from './locales/de.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
  { code: 'pl', label: 'Polski' },
  { code: 'de', label: 'Deutsch' },
];

const STORAGE_KEY = 'app-language';
const supported = LANGUAGES.map((l) => l.code);

function getDeviceLanguage() {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return supported.includes(code) ? code : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
    ru: { translation: ru },
    pl: { translation: pl },
    de: { translation: de },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved && supported.includes(saved)) i18n.changeLanguage(saved);
});

export async function setLanguage(code: string) {
  await AsyncStorage.setItem(STORAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export default i18n;