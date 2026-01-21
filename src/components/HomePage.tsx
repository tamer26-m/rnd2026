import { motion } from "framer-motion";
import { Users, Calendar, MapPin, TrendingUp, Facebook, FileText, Shield, Loader2, Zap } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

type Page = "home" | "activities" | "members" | "dashboard" | "gallery" | "register" | "login" | "secretaryGeneral" | "adminLogin" | "stats" | "quickRegister";

export default function HomePage({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // جلب إعدادات الصفحة الرئيسية من قاعدة البيانات
  const homeSettings = useQuery(api.adminSettings.getHomePageSettings);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  // القيم الافتراضية في حالة عدم وجود إعدادات
  const heroTitle = isRTL 
    ? (homeSettings?.heroTitle || t('home.heroTitle'))
    : t('home.heroTitle');
  const heroSubtitle = isRTL 
    ? (homeSettings?.heroSubtitle || t('home.heroSubtitle'))
    : t('home.heroSubtitle');
  const statsMembers = homeSettings?.statsMembers || 50000;
  const statsActivities = homeSettings?.statsActivities || 1200;
  const statsWilayas = homeSettings?.statsWilayas || 58;
  const statsYears = homeSettings?.statsYears || 27;
  const backgroundUrl = (homeSettings as any)?.backgroundUrl || "https://polished-pony-114.convex.cloud/api/storage/a201256d-4751-4b77-b69a-842f12920cfb";

  // تنسيق الأرقام للعرض
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `+${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `+${(num / 1000).toFixed(0)},000`;
    }
    return num.toString();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={backgroundUrl}
          alt={t('siteName')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://www.facebook.com/rnd.algerie?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Facebook className="w-5 h-5" />
              {t('home.followFacebook')}
            </a>
            <button
              onClick={() => setCurrentPage("quickRegister")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {t('home.quickRegister', 'التسجيل السريع')}
            </button>
            <button
              onClick={() => setCurrentPage("register")}
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t('home.joinUs')}
            </button>
            <button
              onClick={() => setCurrentPage("adminLogin")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {t('home.adminAccess')}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-50 via-white to-red-50 rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-6 ${isRTL ? 'text-start' : 'text-left'}`}>
              {t('home.aboutTitle')}
            </h2>
            <p className={`text-lg md:text-xl text-gray-700 leading-relaxed ${isRTL ? 'text-start' : 'text-left'} mb-6`}>
              {t('home.aboutText')}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg">
                <span>{t('home.ourSlogan')}</span>
                <span className="text-2xl">{t('home.sloganText')}</span>
              </div>
              <button
                onClick={() => setCurrentPage("secretaryGeneral")}
                className="inline-flex items-center gap-2 bg-white border-2 border-green-600 text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-all"
              >
                <FileText className="w-5 h-5" />
                {t('home.secretaryGeneralWord')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {homeSettings === undefined ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
              <StatCard
                icon={Users}
                number={formatNumber(statsMembers)}
                label={t('home.activeMember')}
                color="green"
                variants={itemVariants}
              />
              <StatCard
                icon={MapPin}
                number={statsWilayas.toString()}
                label={t('home.wilaya')}
                color="red"
                variants={itemVariants}
              />
              <StatCard
                icon={Calendar}
                number={`${statsActivities}+`}
                label={t('home.annualActivity')}
                color="green"
                variants={itemVariants}
              />
              <StatCard
                icon={TrendingUp}
                number={`${statsYears}`}
                label={t('home.yearsOfGiving')}
                color="red"
                variants={itemVariants}
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('home.whyJoinTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.whyJoinSubtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard
              title={t('home.onlineRegistration')}
              description={t('home.onlineRegistrationDesc')}
              icon="📝"
              color="green"
              variants={itemVariants}
              onClick={() => setCurrentPage("register")}
            />
            <FeatureCard
              title={t('home.followActivities')}
              description={t('home.followActivitiesDesc')}
              icon="📅"
              color="red"
              variants={itemVariants}
              href="https://www.facebook.com/rnd.algerie?locale=fr_FR"
            />
            <FeatureCard
              title={t('home.personalSpace')}
              description={t('home.personalSpaceDesc')}
              icon="👤"
              color="green"
              variants={itemVariants}
              onClick={() => setCurrentPage("login")}
            />
            <FeatureCard
              title={t('home.photoGallery')}
              description={t('home.photoGalleryDesc')}
              icon="📸"
              color="red"
              variants={itemVariants}
              onClick={() => setCurrentPage("gallery")}
            />
            <FeatureCard
              title={t('home.geoStats')}
              description={t('home.geoStatsDesc')}
              icon="🗺️"
              color="green"
              variants={itemVariants}
              onClick={() => setCurrentPage("stats")}
            />

            <FeatureCard
              title={t('home.adminDashboard')}
              description={t('home.adminDashboardDesc')}
              icon="🛡️"
              color="green"
              variants={itemVariants}
              onClick={() => setCurrentPage("adminLogin")}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-700 via-green-800 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('home.bePartOfChange')}
            </h2>
            <p className="text-xl mb-8 text-green-100">
              {t('home.bePartOfChangeDesc')}
            </p>
            <button
              onClick={() => setCurrentPage("register")}
              className="px-10 py-5 bg-white text-green-700 font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
            >
              {t('home.registerNow')}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, number, label, color, variants }: any) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all ${
        color === "green" ? "bg-gradient-to-br from-green-50 to-green-100" : "bg-gradient-to-br from-red-50 to-red-100"
      }`}
    >
      <Icon className={`w-12 h-12 mb-4 ${color === "green" ? "text-green-600" : "text-red-600"}`} />
      <div className={`text-4xl font-bold mb-2 ${color === "green" ? "text-green-700" : "text-red-700"}`}>
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
}

function FeatureCard({ title, description, icon, color, variants, onClick, href }: any) {
  const content = (
    <>
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 ${
        color === "green" ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-red-500 to-red-600"
      }`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variants={variants}
        whileHover={{ scale: 1.05, y: -10 }}
        className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={onClick}
      className={`p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      {content}
    </motion.div>
  );
}
