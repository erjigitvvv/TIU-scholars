import uz from '@/messages/uz.json';
import ru from '@/messages/ru.json';
import en from '@/messages/en.json';
import { extraDicts } from './i18n';

const dictionaries = {
  uz: { ...uz, ...extraDicts.uz },
  ru: { ...ru, ...extraDicts.ru },
  en: { ...en, ...extraDicts.en },
};

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries.uz;
}
