import { v } from "convex/values";
import { query } from "./_generated/server";
import { ConvexError } from "convex/values";

// التحقق من صلاحيات المسؤول
async function verifyAdmin(ctx: any, adminUsername: string) {
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_username", (q: any) => q.eq("username", adminUsername))
    .first();

  if (!admin || !admin.isActive) {
    throw new ConvexError("ليس لديك صلاحية للوصول");
  }
  return admin;
}

// إحصائيات الاشتراكات
export const getSubscriptionStats = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const members = await ctx.db.query("members").collect();
    const subscriptionHistory = await ctx.db.query("subscriptionHistory").collect();

    const currentYear = new Date().getFullYear();
    
    // إحصائيات حسب النوع
    const byTypeMap = new Map<string, number>();
    let totalAmount = 0;
    let currentYearSubscriptions = 0;

    for (const member of members) {
      if (member.subscriptionType && member.subscriptionYear === currentYear) {
        byTypeMap.set(
          member.subscriptionType,
          (byTypeMap.get(member.subscriptionType) || 0) + 1
        );
        currentYearSubscriptions++;
      }
    }

    // حساب المبالغ من السجل
    for (const sub of subscriptionHistory) {
      if (sub.year === currentYear) {
        totalAmount += sub.amount;
      }
    }

    const byType: { type: string; count: number }[] = [];
    byTypeMap.forEach((count, type) => {
      byType.push({ type, count });
    });

    return {
      totalSubscriptions: currentYearSubscriptions,
      totalAmount,
      byType,
      currentYear,
    };
  },
});

// إحصائيات شاملة ومفصلة
export const getComprehensiveStats = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const members = await ctx.db.query("members").collect();
    const activities = await ctx.db.query("activities").collect();
    const politicalActivities = await ctx.db.query("memberPoliticalActivities").collect();
    const subscriptionHistory = await ctx.db.query("subscriptionHistory").collect();
    const auditLogs = await ctx.db.query("memberAuditLog").collect();

    const now = Date.now();
    const currentYear = new Date().getFullYear();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // ========== إحصائيات أساسية ==========
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === "active").length;
    const inactiveMembers = members.filter(m => m.status === "inactive").length;
    const suspendedMembers = members.filter(m => m.status === "suspended").length;

    // ========== إحصائيات الجنس ==========
    const maleMembers = members.filter(m => m.gender === "male").length;
    const femaleMembers = members.filter(m => m.gender === "female").length;
    const unspecifiedGender = members.filter(m => !m.gender).length;

    // ========== إحصائيات العمر ==========
    const ageGroups = {
      under18: 0,
      age18to25: 0,
      age26to35: 0,
      age36to45: 0,
      age46to55: 0,
      age56to65: 0,
      over65: 0,
      unknown: 0,
    };

    members.forEach(m => {
      if (m.birthDate) {
        const age = Math.floor((now - m.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) ageGroups.under18++;
        else if (age <= 25) ageGroups.age18to25++;
        else if (age <= 35) ageGroups.age26to35++;
        else if (age <= 45) ageGroups.age36to45++;
        else if (age <= 55) ageGroups.age46to55++;
        else if (age <= 65) ageGroups.age56to65++;
        else ageGroups.over65++;
      } else {
        ageGroups.unknown++;
      }
    });

    // ========== إحصائيات المستوى التعليمي ==========
    const educationStats = {
      none: members.filter(m => m.educationLevel === "none").length,
      primary: members.filter(m => m.educationLevel === "primary").length,
      secondary: members.filter(m => m.educationLevel === "secondary").length,
      university: members.filter(m => m.educationLevel === "university").length,
      postgraduate: members.filter(m => m.educationLevel === "postgraduate").length,
      unknown: members.filter(m => !m.educationLevel).length,
    };

    // ========== إحصائيات المهنة ==========
    const professionStats = {
      unemployed: members.filter(m => m.profession === "unemployed").length,
      student: members.filter(m => m.profession === "student").length,
      employee: members.filter(m => m.profession === "employee").length,
      freelancer: members.filter(m => m.profession === "freelancer").length,
      farmer: members.filter(m => m.profession === "farmer").length,
      other: members.filter(m => m.profession === "other").length,
      unknown: members.filter(m => !m.profession).length,
    };

    // ========== إحصائيات نوع العضوية ==========
    const memberTypeStats = {
      militant: members.filter(m => m.memberType === "militant" || !m.memberType).length,
      municipal_elected: members.filter(m => m.memberType === "municipal_elected").length,
      wilaya_elected: members.filter(m => m.memberType === "wilaya_elected").length,
      apn_elected: members.filter(m => m.memberType === "apn_elected").length,
      senate_elected: members.filter(m => m.memberType === "senate_elected").length,
    };

    // ========== إحصائيات المناصب الهيكلية ==========
    const structuralPositionStats = {
      militant: members.filter(m => m.structuralPosition === "militant" || !m.structuralPosition).length,
      municipal_bureau_member: members.filter(m => m.structuralPosition === "municipal_bureau_member").length,
      wilaya_bureau_member: members.filter(m => m.structuralPosition === "wilaya_bureau_member").length,
      national_bureau_member: members.filter(m => m.structuralPosition === "national_bureau_member").length,
    };

    // ========== إحصائيات المناصب الإدارية ==========
    const administrativePositionStats = {
      militant: members.filter(m => m.administrativePosition === "militant" || !m.administrativePosition).length,
      municipal_secretary: members.filter(m => m.administrativePosition === "municipal_secretary").length,
      wilaya_secretary: members.filter(m => m.administrativePosition === "wilaya_secretary").length,
    };

    // ========== أعضاء المجلس الوطني ==========
    const nationalCouncilMembers = members.filter(m => m.isNationalCouncilMember === true).length;

    // ========== إحصائيات الولايات ==========
    const wilayaStats: Record<string, { total: number; active: number; male: number; female: number }> = {};
    members.forEach(m => {
      if (!wilayaStats[m.wilaya]) {
        wilayaStats[m.wilaya] = { total: 0, active: 0, male: 0, female: 0 };
      }
      wilayaStats[m.wilaya].total++;
      if (m.status === "active") wilayaStats[m.wilaya].active++;
      if (m.gender === "male") wilayaStats[m.wilaya].male++;
      if (m.gender === "female") wilayaStats[m.wilaya].female++;
    });

    const byWilaya = Object.entries(wilayaStats)
      .map(([wilaya, stats]) => ({ wilaya, ...stats }))
      .sort((a, b) => b.total - a.total);

    // ========== إحصائيات البلديات (أعلى 20) ==========
    const baladiyaStats: Record<string, number> = {};
    members.forEach(m => {
      baladiyaStats[m.baladiya] = (baladiyaStats[m.baladiya] || 0) + 1;
    });

    const topBaladiyat = Object.entries(baladiyaStats)
      .map(([baladiya, count]) => ({ baladiya, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // ========== إحصائيات النمو ==========
    const newMembersLastMonth = members.filter(m => m.joinDate >= oneMonthAgo).length;
    const newMembersLast3Months = members.filter(m => m.joinDate >= threeMonthsAgo).length;
    const newMembersLastYear = members.filter(m => m.joinDate >= oneYearAgo).length;

    // إحصائيات النمو الشهري (آخر 12 شهر)
    const monthlyGrowth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const count = members.filter(m => 
        m.joinDate >= monthStart.getTime() && m.joinDate < monthEnd.getTime()
      ).length;
      
      const monthName = monthStart.toLocaleDateString('ar-DZ', { month: 'short', year: 'numeric' });
      monthlyGrowth.push({ month: monthName, count });
    }

    // ========== إحصائيات الاشتراكات ==========
    const currentYearSubscriptions = members.filter(m => m.subscriptionYear === currentYear).length;
    const subscriptionRate = totalMembers > 0 ? ((currentYearSubscriptions / totalMembers) * 100).toFixed(1) : "0";

    const subscriptionTypeStats = {
      type_1: members.filter(m => m.subscriptionType === "type_1" && m.subscriptionYear === currentYear).length,
      type_2: members.filter(m => m.subscriptionType === "type_2" && m.subscriptionYear === currentYear).length,
      type_3: members.filter(m => m.subscriptionType === "type_3" && m.subscriptionYear === currentYear).length,
      type_4: members.filter(m => m.subscriptionType === "type_4" && m.subscriptionYear === currentYear).length,
    };

    // ========== إحصائيات الأنشطة ==========
    const totalActivities = activities.length;
    const upcomingActivities = activities.filter(a => a.status === "upcoming").length;
    const completedActivities = activities.filter(a => a.status === "completed").length;

    const activityTypeStats = {
      meeting: activities.filter(a => a.type === "meeting").length,
      conference: activities.filter(a => a.type === "conference").length,
      campaign: activities.filter(a => a.type === "campaign").length,
      event: activities.filter(a => a.type === "event").length,
      other: activities.filter(a => a.type === "other").length,
    };

    // ========== إحصائيات الأنشطة السياسية للمنخرطين ==========
    const totalPoliticalActivities = politicalActivities.length;
    const completedPoliticalActivities = politicalActivities.filter(a => a.status === "completed").length;
    
    const politicalActivityTypeStats = {
      public_gathering: politicalActivities.filter(a => a.activityType === "public_gathering").length,
      community_work: politicalActivities.filter(a => a.activityType === "community_work").length,
      executive_meeting: politicalActivities.filter(a => a.activityType === "executive_meeting").length,
      party_meeting: politicalActivities.filter(a => a.activityType === "party_meeting").length,
      electoral_campaign: politicalActivities.filter(a => a.activityType === "electoral_campaign").length,
      media_appearance: politicalActivities.filter(a => a.activityType === "media_appearance").length,
      citizen_reception: politicalActivities.filter(a => a.activityType === "citizen_reception").length,
      field_visit: politicalActivities.filter(a => a.activityType === "field_visit").length,
      other: politicalActivities.filter(a => a.activityType === "other").length,
    };

    // ========== إحصائيات سجل العمليات ==========
    const recentAuditLogs = auditLogs.filter(l => l.performedAt >= oneMonthAgo);
    const auditStats = {
      created: recentAuditLogs.filter(l => l.action === "created").length,
      updated: recentAuditLogs.filter(l => l.action === "updated").length,
      suspended: recentAuditLogs.filter(l => l.action === "suspended").length,
      activated: recentAuditLogs.filter(l => l.action === "activated").length,
    };

    // ========== إحصائيات سنة الانخراط الأولى ==========
    const firstJoinYearStats: Record<number, number> = {};
    members.forEach(m => {
      const year = m.firstJoinYear || new Date(m.joinDate).getFullYear();
      firstJoinYearStats[year] = (firstJoinYearStats[year] || 0) + 1;
    });

    const byFirstJoinYear = Object.entries(firstJoinYearStats)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => b.year - a.year)
      .slice(0, 10);

    // ========== إحصائيات التحقق من الهاتف ==========
    const verifiedPhones = members.filter(m => m.phoneVerified === true).length;
    const unverifiedPhones = members.filter(m => !m.phoneVerified).length;

    // ========== إحصائيات البريد الإلكتروني ==========
    const membersWithEmail = members.filter(m => m.email).length;
    const membersWithoutEmail = members.filter(m => !m.email).length;

    // ========== إحصائيات الصور الشخصية ==========
    const membersWithPhoto = members.filter(m => m.profilePhotoId).length;
    const membersWithoutPhoto = members.filter(m => !m.profilePhotoId).length;

    return {
      // إحصائيات أساسية
      overview: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        suspendedMembers,
        activeRate: totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0",
      },
      
      // إحصائيات الجنس
      gender: {
        male: maleMembers,
        female: femaleMembers,
        unspecified: unspecifiedGender,
        maleRate: totalMembers > 0 ? ((maleMembers / totalMembers) * 100).toFixed(1) : "0",
        femaleRate: totalMembers > 0 ? ((femaleMembers / totalMembers) * 100).toFixed(1) : "0",
      },
      
      // إحصائيات العمر
      ageGroups,
      
      // إحصائيات التعليم
      education: educationStats,
      
      // إحصائيات المهنة
      profession: professionStats,
      
      // إحصائيات نوع العضوية
      memberType: memberTypeStats,
      
      // إحصائيات المناصب
      structuralPosition: structuralPositionStats,
      administrativePosition: administrativePositionStats,
      nationalCouncilMembers,
      
      // إحصائيات جغرافية
      geographic: {
        totalWilayas: byWilaya.length,
        totalBaladiyat: Object.keys(baladiyaStats).length,
        byWilaya,
        topBaladiyat,
      },
      
      // إحصائيات النمو
      growth: {
        newMembersLastMonth,
        newMembersLast3Months,
        newMembersLastYear,
        monthlyGrowth,
        byFirstJoinYear,
      },
      
      // إحصائيات الاشتراكات
      subscriptions: {
        currentYear,
        totalSubscribed: currentYearSubscriptions,
        subscriptionRate,
        byType: subscriptionTypeStats,
      },
      
      // إحصائيات الأنشطة
      activities: {
        total: totalActivities,
        upcoming: upcomingActivities,
        completed: completedActivities,
        byType: activityTypeStats,
      },
      
      // إحصائيات الأنشطة السياسية
      politicalActivities: {
        total: totalPoliticalActivities,
        completed: completedPoliticalActivities,
        byType: politicalActivityTypeStats,
      },
      
      // إحصائيات سجل العمليات
      auditStats,
      
      // إحصائيات البيانات
      dataCompletion: {
        verifiedPhones,
        unverifiedPhones,
        membersWithEmail,
        membersWithoutEmail,
        membersWithPhoto,
        membersWithoutPhoto,
        emailRate: totalMembers > 0 ? ((membersWithEmail / totalMembers) * 100).toFixed(1) : "0",
        photoRate: totalMembers > 0 ? ((membersWithPhoto / totalMembers) * 100).toFixed(1) : "0",
      },
    };
  },
});
