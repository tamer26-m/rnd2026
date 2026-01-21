import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    
    // تحديث اتجاه الصفحة
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium";
  const variantClasses = variant === 'light' 
    ? "bg-white/10 hover:bg-white/20 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  return (
    <button
      onClick={toggleLanguage}
      className={`${baseClasses} ${variantClasses}`}
      title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );
}
