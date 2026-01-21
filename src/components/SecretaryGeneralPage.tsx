import { motion } from "framer-motion";
import { Quote, User, Loader2, Globe } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

interface SecretaryGeneralPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function SecretaryGeneralPage({ setCurrentPage }: SecretaryGeneralPageProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const settings = useQuery(api.adminSettings.getSecretaryGeneralSettings);

  if (settings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  // تقسيم كلمة الأمين العام إلى فقرات
  const speechParagraphs = settings?.speechContent
    ? settings.speechContent.split("\n\n").filter((p: string) => p.trim())
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <User className="w-20 h-20 mx-auto mb-6 text-green-600" />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t('secretaryGeneral.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('secretaryGeneral.subtitle')}
        </p>
        {/* زر التبديل للنسخة الإنجليزية */}
        {setCurrentPage && (
          <button
            onClick={() => setCurrentPage("secretaryGeneralEN")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Globe className="w-5 h-5" />
            View English Version
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* صورة الأمين العام */}
        <div className="relative h-96 bg-gradient-to-br from-green-600 to-red-600">
          {settings?.photoUrl ? (
            <img 
              src={settings.photoUrl}
              alt={settings.fullName || t('secretaryGeneral.position')}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-32 h-32 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* اسم الأمين العام */}
          <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'} text-white`}>
            <h2 className={`text-2xl md:text-3xl font-bold ${isRTL ? 'text-start' : 'text-left'}`}>
              {settings?.fullName || t('secretaryGeneral.position')}
            </h2>
            <p className={`text-white/80 ${isRTL ? 'text-start' : 'text-left'}`}>{t('secretaryGeneral.position')}</p>
          </div>
        </div>

        {/* محتوى الكلمة */}
        <div className="p-8 md:p-12">
          <div className="flex items-start gap-4 mb-8">
            <Quote className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'text-start' : 'text-left'}`}>
                {t('secretaryGeneral.bismillah')}
              </h2>
              <p className={`text-lg text-gray-600 ${isRTL ? 'text-start' : 'text-left'}`}>
                {t('secretaryGeneral.greeting')}
              </p>
            </div>
          </div>

          <div className={`prose prose-lg max-w-none ${isRTL ? 'text-start' : 'text-left'} space-y-6`}>
            {speechParagraphs.length > 0 ? (
              speechParagraphs.map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">{t('secretaryGeneral.noSpeech')}</p>
            )}

            <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-6 mt-8">
              <p className="text-xl font-bold text-gray-900 text-center">
                {t('secretaryGeneral.sloganQuote')}
              </p>
              <p className="text-gray-700 text-center mt-2">
                {t('secretaryGeneral.sloganDesc')}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className={`text-gray-900 font-bold text-lg ${isRTL ? 'text-start' : 'text-left'}`}>
                {settings?.fullName || t('secretaryGeneral.position')}
              </p>
              <p className={`text-gray-600 ${isRTL ? 'text-start' : 'text-left'} mt-2`}>
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* قسم الرؤية والأهداف */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg">
          <h3 className={`text-xl font-bold text-green-800 mb-3 ${isRTL ? 'text-start' : 'text-left'}`}>{t('secretaryGeneral.ourVision')}</h3>
          <p className={`text-gray-700 ${isRTL ? 'text-start' : 'text-left'}`}>
            {t('secretaryGeneral.ourVisionText')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-lg">
          <h3 className={`text-xl font-bold text-red-800 mb-3 ${isRTL ? 'text-start' : 'text-left'}`}>{t('secretaryGeneral.ourMission')}</h3>
          <p className={`text-gray-700 ${isRTL ? 'text-start' : 'text-left'}`}>
            {t('secretaryGeneral.ourMissionText')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg">
          <h3 className={`text-xl font-bold text-blue-800 mb-3 ${isRTL ? 'text-start' : 'text-left'}`}>{t('secretaryGeneral.ourValues')}</h3>
          <p className={`text-gray-700 ${isRTL ? 'text-start' : 'text-left'}`}>
            {t('secretaryGeneral.ourValuesText')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
