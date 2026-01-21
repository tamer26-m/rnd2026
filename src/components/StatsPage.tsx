import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  BarChart3, Users, MapPin, TrendingUp, PieChart,
  UserCheck, UserX, Shield, GraduationCap, Briefcase,
  Calendar, Activity, Phone, Mail, Camera, Award,
  Building2, Globe, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StatsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    gender: true,
    age: false,
    education: false,
    profession: false,
    memberType: false,
    geographic: true,
    growth: false,
    subscriptions: false,
    activities: false,
    dataCompletion: false,
  });

  // الحصول على بيانات المسؤول من sessionStorage
  const adminData = typeof window !== 'undefined' ? sessionStorage.getItem("adminUser") : null;
  const admin = adminData ? JSON.parse(adminData) : null;

  const stats = useQuery(
    api.memberStats.getComprehensiveStats,
    admin?.username ? { adminUsername: admin.username } : "skip"
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? "جاري تحميل الإحصائيات..." : "Loading statistics..."}</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ title, icon: Icon, section, color }: { title: string; icon: any; section: string; color: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${color} rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" />
        <span>{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  );

  const StatCard = ({ value, label, color, icon: Icon }: { value: string | number; label: string; color: string; icon?: any }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-90 mt-1">{label}</p>
        </div>
        {Icon && <Icon className="w-10 h-10 opacity-50" />}
      </div>
    </div>
  );

  const ProgressBar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="font-semibold text-gray-800">{value} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRTL ? "التقارير والإحصائيات الشاملة" : "Comprehensive Reports & Statistics"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isRTL ? "تحليل مفصل لقاعدة بيانات المنخرطين" : "Detailed analysis of members database"}
          </p>
        </div>
      </div>

      {/* ========== نظرة عامة ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "نظرة عامة" : "Overview"} 
          icon={Users} 
          section="overview" 
          color="from-blue-500 to-blue-600"
        />
        {expandedSections.overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <StatCard 
              value={stats.overview.totalMembers} 
              label={isRTL ? "إجمالي المنخرطين" : "Total Members"} 
              color="from-blue-500 to-blue-600"
              icon={Users}
            />
            <StatCard 
              value={stats.overview.activeMembers} 
              label={isRTL ? "النشطين" : "Active"} 
              color="from-green-500 to-green-600"
              icon={UserCheck}
            />
            <StatCard 
              value={stats.overview.inactiveMembers} 
              label={isRTL ? "غير النشطين" : "Inactive"} 
              color="from-yellow-500 to-yellow-600"
              icon={UserX}
            />
            <StatCard 
              value={stats.overview.suspendedMembers} 
              label={isRTL ? "المعلقين" : "Suspended"} 
              color="from-red-500 to-red-600"
              icon={Shield}
            />
          </div>
        )}
      </div>

      {/* ========== توزيع الجنس ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "توزيع الجنس" : "Gender Distribution"} 
          icon={PieChart} 
          section="gender" 
          color="from-purple-500 to-purple-600"
        />
        {expandedSections.gender && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center border-2 border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-blue-700">{stats.gender.male}</p>
                <p className="text-blue-600 font-medium">{isRTL ? "ذكور" : "Male"}</p>
                <p className="text-sm text-blue-500 mt-1">{stats.gender.maleRate}%</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-6 text-center border-2 border-pink-200">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-pink-700">{stats.gender.female}</p>
                <p className="text-pink-600 font-medium">{isRTL ? "إناث" : "Female"}</p>
                <p className="text-sm text-pink-500 mt-1">{stats.gender.femaleRate}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-gray-700">{stats.gender.unspecified}</p>
                <p className="text-gray-600 font-medium">{isRTL ? "غير محدد" : "Unspecified"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== الفئات العمرية ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "الفئات العمرية" : "Age Groups"} 
          icon={Calendar} 
          section="age" 
          color="from-orange-500 to-orange-600"
        />
        {expandedSections.age && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="space-y-3">
              <ProgressBar value={stats.ageGroups.under18} max={stats.overview.totalMembers} color="bg-red-500" label={isRTL ? "أقل من 18 سنة" : "Under 18"} />
              <ProgressBar value={stats.ageGroups.age18to25} max={stats.overview.totalMembers} color="bg-orange-500" label={isRTL ? "18-25 سنة" : "18-25 years"} />
              <ProgressBar value={stats.ageGroups.age26to35} max={stats.overview.totalMembers} color="bg-yellow-500" label={isRTL ? "26-35 سنة" : "26-35 years"} />
              <ProgressBar value={stats.ageGroups.age36to45} max={stats.overview.totalMembers} color="bg-green-500" label={isRTL ? "36-45 سنة" : "36-45 years"} />
              <ProgressBar value={stats.ageGroups.age46to55} max={stats.overview.totalMembers} color="bg-blue-500" label={isRTL ? "46-55 سنة" : "46-55 years"} />
              <ProgressBar value={stats.ageGroups.age56to65} max={stats.overview.totalMembers} color="bg-indigo-500" label={isRTL ? "56-65 سنة" : "56-65 years"} />
              <ProgressBar value={stats.ageGroups.over65} max={stats.overview.totalMembers} color="bg-purple-500" label={isRTL ? "أكثر من 65 سنة" : "Over 65"} />
              <ProgressBar value={stats.ageGroups.unknown} max={stats.overview.totalMembers} color="bg-gray-400" label={isRTL ? "غير محدد" : "Unknown"} />
            </div>
          </div>
        )}
      </div>

      {/* ========== المستوى التعليمي ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "المستوى التعليمي" : "Education Level"} 
          icon={GraduationCap} 
          section="education" 
          color="from-teal-500 to-teal-600"
        />
        {expandedSections.education && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'none', label: isRTL ? 'بدون' : 'None', color: 'from-gray-400 to-gray-500' },
                { key: 'primary', label: isRTL ? 'ابتدائي' : 'Primary', color: 'from-red-400 to-red-500' },
                { key: 'secondary', label: isRTL ? 'ثانوي' : 'Secondary', color: 'from-orange-400 to-orange-500' },
                { key: 'university', label: isRTL ? 'جامعي' : 'University', color: 'from-blue-400 to-blue-500' },
                { key: 'postgraduate', label: isRTL ? 'دراسات عليا' : 'Postgraduate', color: 'from-purple-400 to-purple-500' },
                { key: 'unknown', label: isRTL ? 'غير محدد' : 'Unknown', color: 'from-gray-300 to-gray-400' },
              ].map(item => (
                <div key={item.key} className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white text-center`}>
                  <p className="text-2xl font-bold">{stats.education[item.key as keyof typeof stats.education]}</p>
                  <p className="text-xs mt-1 opacity-90">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== المهنة ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "المهنة" : "Profession"} 
          icon={Briefcase} 
          section="profession" 
          color="from-cyan-500 to-cyan-600"
        />
        {expandedSections.profession && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="space-y-3">
              <ProgressBar value={stats.profession.employee} max={stats.overview.totalMembers} color="bg-blue-500" label={isRTL ? "موظف" : "Employee"} />
              <ProgressBar value={stats.profession.student} max={stats.overview.totalMembers} color="bg-green-500" label={isRTL ? "طالب" : "Student"} />
              <ProgressBar value={stats.profession.freelancer} max={stats.overview.totalMembers} color="bg-purple-500" label={isRTL ? "حر" : "Freelancer"} />
              <ProgressBar value={stats.profession.farmer} max={stats.overview.totalMembers} color="bg-yellow-500" label={isRTL ? "فلاح" : "Farmer"} />
              <ProgressBar value={stats.profession.unemployed} max={stats.overview.totalMembers} color="bg-red-500" label={isRTL ? "بدون عمل" : "Unemployed"} />
              <ProgressBar value={stats.profession.other} max={stats.overview.totalMembers} color="bg-orange-500" label={isRTL ? "أخرى" : "Other"} />
              <ProgressBar value={stats.profession.unknown} max={stats.overview.totalMembers} color="bg-gray-400" label={isRTL ? "غير محدد" : "Unknown"} />
            </div>
          </div>
        )}
      </div>

      {/* ========== نوع العضوية والمناصب ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "نوع العضوية والمناصب" : "Membership Type & Positions"} 
          icon={Award} 
          section="memberType" 
          color="from-amber-500 to-amber-600"
        />
        {expandedSections.memberType && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn space-y-6">
            {/* نوع العضوية */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                {isRTL ? "نوع العضوية" : "Membership Type"}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'militant', label: isRTL ? 'مناضل' : 'Militant' },
                  { key: 'municipal_elected', label: isRTL ? 'منتخب بلدي' : 'Municipal Elected' },
                  { key: 'wilaya_elected', label: isRTL ? 'منتخب ولائي' : 'Wilaya Elected' },
                  { key: 'apn_elected', label: isRTL ? 'نائب برلماني' : 'APN Deputy' },
                  { key: 'senate_elected', label: isRTL ? 'عضو مجلس الأمة' : 'Senator' },
                ].map(item => (
                  <div key={item.key} className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                    <p className="text-2xl font-bold text-amber-700">{stats.memberType[item.key as keyof typeof stats.memberType]}</p>
                    <p className="text-xs text-amber-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* المناصب الهيكلية */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {isRTL ? "المناصب الهيكلية" : "Structural Positions"}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'militant', label: isRTL ? 'مناضل' : 'Militant' },
                  { key: 'municipal_bureau_member', label: isRTL ? 'عضو مكتب بلدي' : 'Municipal Bureau' },
                  { key: 'wilaya_bureau_member', label: isRTL ? 'عضو مكتب ولائي' : 'Wilaya Bureau' },
                  { key: 'national_bureau_member', label: isRTL ? 'عضو مكتب وطني' : 'National Bureau' },
                ].map(item => (
                  <div key={item.key} className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-700">{stats.structuralPosition[item.key as keyof typeof stats.structuralPosition]}</p>
                    <p className="text-xs text-indigo-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* أعضاء المجلس الوطني */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{isRTL ? "أعضاء المجلس الوطني" : "National Council Members"}</p>
                  <p className="text-3xl font-bold">{stats.nationalCouncilMembers}</p>
                </div>
                <Globe className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== التوزيع الجغرافي ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "التوزيع الجغرافي" : "Geographic Distribution"} 
          icon={MapPin} 
          section="geographic" 
          color="from-red-500 to-red-600"
        />
        {expandedSections.geographic && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* إحصائيات عامة */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                  <p className="text-3xl font-bold text-red-700">{stats.geographic.totalWilayas}</p>
                  <p className="text-sm text-red-600">{isRTL ? "ولاية" : "Wilayas"}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
                  <p className="text-3xl font-bold text-orange-700">{stats.geographic.totalBaladiyat}</p>
                  <p className="text-sm text-orange-600">{isRTL ? "بلدية" : "Municipalities"}</p>
                </div>
              </div>

              {/* أعلى الولايات */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">{isRTL ? "أعلى 10 ولايات" : "Top 10 Wilayas"}</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.geographic.byWilaya.slice(0, 10).map((item, index) => (
                    <div key={item.wilaya} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item.wilaya}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600">♂ {item.male}</span>
                        <span className="text-pink-600">♀ {item.female}</span>
                        <span className="font-bold text-gray-800">{item.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* أعلى البلديات */}
            <div className="mt-6">
              <h4 className="font-bold text-gray-800 mb-3">{isRTL ? "أعلى 10 بلديات" : "Top 10 Municipalities"}</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.geographic.topBaladiyat.slice(0, 10).map((item, index) => (
                  <div key={item.baladiya} className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                    <p className="text-xl font-bold text-orange-700">{item.count}</p>
                    <p className="text-xs text-orange-600 truncate" title={item.baladiya}>{item.baladiya}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== النمو والتطور ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "النمو والتطور" : "Growth & Development"} 
          icon={TrendingUp} 
          section="growth" 
          color="from-green-500 to-green-600"
        />
        {expandedSections.growth && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            {/* إحصائيات النمو */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                <p className="text-3xl font-bold text-green-700">{stats.growth.newMembersLastMonth}</p>
                <p className="text-sm text-green-600">{isRTL ? "منخرط جديد (آخر شهر)" : "New (Last Month)"}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-3xl font-bold text-blue-700">{stats.growth.newMembersLast3Months}</p>
                <p className="text-sm text-blue-600">{isRTL ? "منخرط جديد (آخر 3 أشهر)" : "New (Last 3 Months)"}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <p className="text-3xl font-bold text-purple-700">{stats.growth.newMembersLastYear}</p>
                <p className="text-sm text-purple-600">{isRTL ? "منخرط جديد (آخر سنة)" : "New (Last Year)"}</p>
              </div>
            </div>

            {/* النمو الشهري */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">{isRTL ? "النمو الشهري (آخر 12 شهر)" : "Monthly Growth (Last 12 Months)"}</h4>
              <div className="flex items-end gap-2 h-40 bg-gray-50 rounded-xl p-4">
                {stats.growth.monthlyGrowth.map((item, index) => {
                  const maxCount = Math.max(...stats.growth.monthlyGrowth.map(m => m.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                      <span className="text-xs font-bold text-gray-700 mb-1">{item.count}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* سنوات الانخراط */}
            <div className="mt-6">
              <h4 className="font-bold text-gray-800 mb-3">{isRTL ? "توزيع حسب سنة الانخراط الأولى" : "Distribution by First Join Year"}</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.growth.byFirstJoinYear.map(item => (
                  <div key={item.year} className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                    <p className="text-xl font-bold text-indigo-700">{item.count}</p>
                    <p className="text-sm text-indigo-600">{item.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== الاشتراكات ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? `الاشتراكات ${stats.subscriptions.currentYear}` : `Subscriptions ${stats.subscriptions.currentYear}`} 
          icon={Calendar} 
          section="subscriptions" 
          color="from-emerald-500 to-emerald-600"
        />
        {expandedSections.subscriptions && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">{isRTL ? "إجمالي المشتركين" : "Total Subscribed"}</p>
                <p className="text-4xl font-bold mt-2">{stats.subscriptions.totalSubscribed}</p>
                <p className="text-sm mt-2 opacity-80">
                  {isRTL ? `نسبة الاشتراك: ${stats.subscriptions.subscriptionRate}%` : `Subscription Rate: ${stats.subscriptions.subscriptionRate}%`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'type_1', label: isRTL ? 'النوع 1' : 'Type 1', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                  { key: 'type_2', label: isRTL ? 'النوع 2' : 'Type 2', color: 'bg-green-100 text-green-700 border-green-200' },
                  { key: 'type_3', label: isRTL ? 'النوع 3' : 'Type 3', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                  { key: 'type_4', label: isRTL ? 'النوع 4' : 'Type 4', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                ].map(item => (
                  <div key={item.key} className={`rounded-lg p-3 text-center border ${item.color}`}>
                    <p className="text-2xl font-bold">{stats.subscriptions.byType[item.key as keyof typeof stats.subscriptions.byType]}</p>
                    <p className="text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== الأنشطة ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "الأنشطة والفعاليات" : "Activities & Events"} 
          icon={Activity} 
          section="activities" 
          color="from-violet-500 to-violet-600"
        />
        {expandedSections.activities && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard value={stats.activities.total} label={isRTL ? "إجمالي الأنشطة" : "Total Activities"} color="from-violet-500 to-violet-600" />
              <StatCard value={stats.activities.upcoming} label={isRTL ? "قادمة" : "Upcoming"} color="from-blue-500 to-blue-600" />
              <StatCard value={stats.activities.completed} label={isRTL ? "مكتملة" : "Completed"} color="from-green-500 to-green-600" />
            </div>

            <h4 className="font-bold text-gray-800 mb-3">{isRTL ? "حسب النوع" : "By Type"}</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'meeting', label: isRTL ? 'اجتماع' : 'Meeting' },
                { key: 'conference', label: isRTL ? 'مؤتمر' : 'Conference' },
                { key: 'campaign', label: isRTL ? 'حملة' : 'Campaign' },
                { key: 'event', label: isRTL ? 'فعالية' : 'Event' },
                { key: 'other', label: isRTL ? 'أخرى' : 'Other' },
              ].map(item => (
                <div key={item.key} className="bg-violet-50 rounded-lg p-3 text-center border border-violet-200">
                  <p className="text-xl font-bold text-violet-700">{stats.activities.byType[item.key as keyof typeof stats.activities.byType]}</p>
                  <p className="text-xs text-violet-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== اكتمال البيانات ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title={isRTL ? "اكتمال البيانات" : "Data Completion"} 
          icon={Camera} 
          section="dataCompletion" 
          color="from-slate-500 to-slate-600"
        />
        {expandedSections.dataCompletion && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* الهاتف */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-800">{isRTL ? "التحقق من الهاتف" : "Phone Verification"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{isRTL ? "موثق" : "Verified"}: {stats.dataCompletion.verifiedPhones}</span>
                  <span className="text-red-600">{isRTL ? "غير موثق" : "Unverified"}: {stats.dataCompletion.unverifiedPhones}</span>
                </div>
              </div>

              {/* البريد */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-800">{isRTL ? "البريد الإلكتروني" : "Email"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{isRTL ? "متوفر" : "Available"}: {stats.dataCompletion.membersWithEmail}</span>
                  <span className="text-gray-500">{isRTL ? "غير متوفر" : "Missing"}: {stats.dataCompletion.membersWithoutEmail}</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">{isRTL ? `نسبة التوفر: ${stats.dataCompletion.emailRate}%` : `Rate: ${stats.dataCompletion.emailRate}%`}</p>
              </div>

              {/* الصورة */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-800">{isRTL ? "الصورة الشخصية" : "Profile Photo"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{isRTL ? "متوفرة" : "Available"}: {stats.dataCompletion.membersWithPhoto}</span>
                  <span className="text-gray-500">{isRTL ? "غير متوفرة" : "Missing"}: {stats.dataCompletion.membersWithoutPhoto}</span>
                </div>
                <p className="text-xs text-purple-600 mt-2">{isRTL ? `نسبة التوفر: ${stats.dataCompletion.photoRate}%` : `Rate: ${stats.dataCompletion.photoRate}%`}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS للرسوم المتحركة */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
