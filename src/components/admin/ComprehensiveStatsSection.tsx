import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  RefreshCw, PieChart, Users, Activity, CreditCard, MapPin, TrendingUp, Calendar,
  UserCheck, UserX, Shield, GraduationCap, Briefcase, Award, Building2, Globe,
  Phone, Mail, Camera, ChevronDown, ChevronUp, BarChart3
} from "lucide-react";
import { useState } from "react";

interface ComprehensiveStatsSectionProps {
  adminUsername: string;
}

const ACTIVITY_TYPES: Record<string, string> = {
  public_gathering: "تجمع شعبي",
  community_work: "عمل جواري",
  executive_meeting: "لقاء مع مسؤول تنفيذي",
  party_meeting: "اجتماع حزبي",
  electoral_campaign: "حملة انتخابية",
  media_appearance: "ظهور إعلامي",
  citizen_reception: "استقبال المواطنين",
  field_visit: "زيارة ميدانية",
  other: "أخرى",
};

const SUBSCRIPTION_TYPES: Record<string, { label: string; amount: number }> = {
  type_1: { label: "الاشتراك 01", amount: 1000 },
  type_2: { label: "الاشتراك 02", amount: 3000 },
  type_3: { label: "الاشتراك 03", amount: 10000 },
  type_4: { label: "الاشتراك 04", amount: 200000 },
};

export default function ComprehensiveStatsSection({ adminUsername }: ComprehensiveStatsSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    gender: true,
    age: false,
    education: false,
    profession: false,
    memberType: false,
    geographic: true,
    growth: false,
    subscriptions: true,
    activities: true,
    dataCompletion: false,
  });

  const stats = useQuery(api.memberStats.getComprehensiveStats, { adminUsername });
  const activityStats = useQuery(api.memberPoliticalActivities.getPoliticalActivitiesStats, { adminUsername });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات الشاملة</h2>
          <p className="text-gray-500 text-sm">تحليل مفصل لقاعدة بيانات المنخرطين</p>
        </div>
      </div>

      {/* ========== نظرة عامة ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="نظرة عامة" 
          icon={Users} 
          section="overview" 
          color="from-blue-500 to-blue-600"
        />
        {expandedSections.overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <StatCard 
              value={stats.overview.totalMembers} 
              label="إجمالي المنخرطين" 
              color="from-blue-500 to-blue-600"
              icon={Users}
            />
            <StatCard 
              value={stats.overview.activeMembers} 
              label="النشطين" 
              color="from-green-500 to-green-600"
              icon={UserCheck}
            />
            <StatCard 
              value={stats.overview.inactiveMembers} 
              label="غير النشطين" 
              color="from-yellow-500 to-yellow-600"
              icon={UserX}
            />
            <StatCard 
              value={stats.overview.suspendedMembers} 
              label="المعلقين" 
              color="from-red-500 to-red-600"
              icon={Shield}
            />
          </div>
        )}
      </div>

      {/* ========== توزيع الجنس ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="توزيع الجنس" 
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
                <p className="text-blue-600 font-medium">ذكور</p>
                <p className="text-sm text-blue-500 mt-1">{stats.gender.maleRate}%</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-6 text-center border-2 border-pink-200">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-pink-700">{stats.gender.female}</p>
                <p className="text-pink-600 font-medium">إناث</p>
                <p className="text-sm text-pink-500 mt-1">{stats.gender.femaleRate}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-gray-700">{stats.gender.unspecified}</p>
                <p className="text-gray-600 font-medium">غير محدد</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== الفئات العمرية ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="الفئات العمرية" 
          icon={Calendar} 
          section="age" 
          color="from-orange-500 to-orange-600"
        />
        {expandedSections.age && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="space-y-3">
              <ProgressBar value={stats.ageGroups.under18} max={stats.overview.totalMembers} color="bg-red-500" label="أقل من 18 سنة" />
              <ProgressBar value={stats.ageGroups.age18to25} max={stats.overview.totalMembers} color="bg-orange-500" label="18-25 سنة" />
              <ProgressBar value={stats.ageGroups.age26to35} max={stats.overview.totalMembers} color="bg-yellow-500" label="26-35 سنة" />
              <ProgressBar value={stats.ageGroups.age36to45} max={stats.overview.totalMembers} color="bg-green-500" label="36-45 سنة" />
              <ProgressBar value={stats.ageGroups.age46to55} max={stats.overview.totalMembers} color="bg-blue-500" label="46-55 سنة" />
              <ProgressBar value={stats.ageGroups.age56to65} max={stats.overview.totalMembers} color="bg-indigo-500" label="56-65 سنة" />
              <ProgressBar value={stats.ageGroups.over65} max={stats.overview.totalMembers} color="bg-purple-500" label="أكثر من 65 سنة" />
              <ProgressBar value={stats.ageGroups.unknown} max={stats.overview.totalMembers} color="bg-gray-400" label="غير محدد" />
            </div>
          </div>
        )}
      </div>

      {/* ========== المستوى التعليمي ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="المستوى التعليمي" 
          icon={GraduationCap} 
          section="education" 
          color="from-teal-500 to-teal-600"
        />
        {expandedSections.education && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'none', label: 'بدون', color: 'from-gray-400 to-gray-500' },
                { key: 'primary', label: 'ابتدائي', color: 'from-red-400 to-red-500' },
                { key: 'secondary', label: 'ثانوي', color: 'from-orange-400 to-orange-500' },
                { key: 'university', label: 'جامعي', color: 'from-blue-400 to-blue-500' },
                { key: 'postgraduate', label: 'دراسات عليا', color: 'from-purple-400 to-purple-500' },
                { key: 'unknown', label: 'غير محدد', color: 'from-gray-300 to-gray-400' },
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
          title="المهنة" 
          icon={Briefcase} 
          section="profession" 
          color="from-cyan-500 to-cyan-600"
        />
        {expandedSections.profession && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="space-y-3">
              <ProgressBar value={stats.profession.employee} max={stats.overview.totalMembers} color="bg-blue-500" label="موظف" />
              <ProgressBar value={stats.profession.student} max={stats.overview.totalMembers} color="bg-green-500" label="طالب" />
              <ProgressBar value={stats.profession.freelancer} max={stats.overview.totalMembers} color="bg-purple-500" label="حر" />
              <ProgressBar value={stats.profession.farmer} max={stats.overview.totalMembers} color="bg-yellow-500" label="فلاح" />
              <ProgressBar value={stats.profession.unemployed} max={stats.overview.totalMembers} color="bg-red-500" label="بدون عمل" />
              <ProgressBar value={stats.profession.other} max={stats.overview.totalMembers} color="bg-orange-500" label="أخرى" />
              <ProgressBar value={stats.profession.unknown} max={stats.overview.totalMembers} color="bg-gray-400" label="غير محدد" />
            </div>
          </div>
        )}
      </div>

      {/* ========== نوع العضوية والمناصب ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="نوع العضوية والمناصب" 
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
                نوع العضوية
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'militant', label: 'مناضل' },
                  { key: 'municipal_elected', label: 'منتخب بلدي' },
                  { key: 'wilaya_elected', label: 'منتخب ولائي' },
                  { key: 'apn_elected', label: 'نائب برلماني' },
                  { key: 'senate_elected', label: 'عضو مجلس الأمة' },
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
                المناصب الهيكلية
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'militant', label: 'مناضل' },
                  { key: 'municipal_bureau_member', label: 'عضو مكتب بلدي' },
                  { key: 'wilaya_bureau_member', label: 'عضو مكتب ولائي' },
                  { key: 'national_bureau_member', label: 'عضو مكتب وطني' },
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
                  <p className="text-sm opacity-90">أعضاء المجلس الوطني</p>
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
          title="التوزيع الجغرافي" 
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
                  <p className="text-sm text-red-600">ولاية</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
                  <p className="text-3xl font-bold text-orange-700">{stats.geographic.totalBaladiyat}</p>
                  <p className="text-sm text-orange-600">بلدية</p>
                </div>
              </div>

              {/* أعلى الولايات */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">أعلى 10 ولايات</h4>
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
              <h4 className="font-bold text-gray-800 mb-3">أعلى 10 بلديات</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.geographic.topBaladiyat.slice(0, 10).map((item) => (
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
          title="النمو والتطور" 
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
                <p className="text-sm text-green-600">منخرط جديد (آخر شهر)</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-3xl font-bold text-blue-700">{stats.growth.newMembersLast3Months}</p>
                <p className="text-sm text-blue-600">منخرط جديد (آخر 3 أشهر)</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <p className="text-3xl font-bold text-purple-700">{stats.growth.newMembersLastYear}</p>
                <p className="text-sm text-purple-600">منخرط جديد (آخر سنة)</p>
              </div>
            </div>

            {/* النمو الشهري */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">النمو الشهري (آخر 12 شهر)</h4>
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
              <h4 className="font-bold text-gray-800 mb-3">توزيع حسب سنة الانخراط الأولى</h4>
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
          title={`الاشتراكات ${stats.subscriptions.currentYear}`} 
          icon={CreditCard} 
          section="subscriptions" 
          color="from-emerald-500 to-emerald-600"
        />
        {expandedSections.subscriptions && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">إجمالي المشتركين</p>
                <p className="text-4xl font-bold mt-2">{stats.subscriptions.totalSubscribed}</p>
                <p className="text-sm mt-2 opacity-80">
                  نسبة الاشتراك: {stats.subscriptions.subscriptionRate}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SUBSCRIPTION_TYPES).map(([key, { label, amount }]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.subscriptions.byType[key as keyof typeof stats.subscriptions.byType]}
                    </p>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-xs text-gray-400">{amount.toLocaleString()} دج</p>
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
          title="الأنشطة والفعاليات" 
          icon={Activity} 
          section="activities" 
          color="from-violet-500 to-violet-600"
        />
        {expandedSections.activities && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard value={stats.activities.total} label="إجمالي الأنشطة" color="from-violet-500 to-violet-600" />
              <StatCard value={stats.activities.upcoming} label="قادمة" color="from-blue-500 to-blue-600" />
              <StatCard value={stats.activities.completed} label="مكتملة" color="from-green-500 to-green-600" />
            </div>

            {/* أنشطة المنخرطين السياسية */}
            {activityStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    الأنشطة السياسية حسب النوع
                  </h4>
                  <div className="space-y-3">
                    {activityStats.byType?.slice(0, 8).map((item: any) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="text-gray-600">{ACTIVITY_TYPES[item.type] || item.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{
                                width: `${(item.count / (activityStats.totalActivities || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    نشاط الفترة الأخيرة
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-700">{activityStats.thisWeekActivities}</p>
                      <p className="text-blue-600 text-sm">هذا الأسبوع</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-indigo-700">{activityStats.thisMonthActivities}</p>
                      <p className="text-indigo-600 text-sm">هذا الشهر</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-600">إجمالي الحضور</p>
                    <p className="text-2xl font-bold text-green-700">{activityStats.totalAttendees}</p>
                  </div>
                </div>
              </div>
            )}

            {/* أكثر المنخرطين نشاطاً */}
            {activityStats?.topActiveMembers && activityStats.topActiveMembers.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  أكثر المنخرطين نشاطاً
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">#</th>
                        <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">الاسم</th>
                        <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">رقم العضوية</th>
                        <th className="px-4 py-3 text-start text-sm font-semibold text-gray-700">عدد الأنشطة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activityStats.topActiveMembers.slice(0, 5).map((member: any, index: number) => (
                        <tr key={member.membershipNumber} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                          <td className="px-4 py-3 text-gray-600">{member.membershipNumber}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {member.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== اكتمال البيانات ========== */}
      <div className="space-y-4">
        <SectionHeader 
          title="اكتمال البيانات" 
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
                  <span className="font-bold text-gray-800">التحقق من الهاتف</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">موثق: {stats.dataCompletion.verifiedPhones}</span>
                  <span className="text-red-600">غير موثق: {stats.dataCompletion.unverifiedPhones}</span>
                </div>
              </div>

              {/* البريد */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-800">البريد الإلكتروني</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">متوفر: {stats.dataCompletion.membersWithEmail}</span>
                  <span className="text-gray-500">غير متوفر: {stats.dataCompletion.membersWithoutEmail}</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">نسبة التوفر: {stats.dataCompletion.emailRate}%</p>
              </div>

              {/* الصورة */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-800">الصورة الشخصية</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">متوفرة: {stats.dataCompletion.membersWithPhoto}</span>
                  <span className="text-gray-500">غير متوفرة: {stats.dataCompletion.membersWithoutPhoto}</span>
                </div>
                <p className="text-xs text-purple-600 mt-2">نسبة التوفر: {stats.dataCompletion.photoRate}%</p>
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
