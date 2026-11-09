import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();
  
  return (
    <div className="relative" role="group" aria-label={t('languageToggle')}>
      <button
        onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        className="btn-secondary px-3 py-2 gap-2"
        aria-pressed={language === 'bn'}
      >
        <span className="font-medium text-sm">
          {language === 'en' ? 'EN' : 'বাংলা'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>
    </div>
  );
}