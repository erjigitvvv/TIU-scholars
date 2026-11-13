import uz from '@/messages/uz.json';
import ru from '@/messages/ru.json';
import en from '@/messages/en.json';

const dictionaries = {
  uz,
  ru,
  en,
};

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries.uz;
}
