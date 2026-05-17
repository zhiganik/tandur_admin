'use client';

import { Button } from 'antd';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useI18n();

  if (availableLocales.length <= 1) {
    return (
      <Button type="text" size="small" style={{ color: '#666', cursor: 'default' }}>
        {locale.toUpperCase()}
      </Button>
    );
  }

  const next = availableLocales.find((l) => l.value !== locale) ?? availableLocales[0];

  return (
    <Button type="text" size="small" onClick={() => setLocale(next.value)}>
      {locale.toUpperCase()}
    </Button>
  );
}
