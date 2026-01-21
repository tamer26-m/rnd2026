import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// أنواع الأنشطة السياسية
export const ACTIVITY_TYPES = {
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

// التحقق من المنخرط
async function verifyMember(ctx: any, membershipNumber: string) {
  const member = await ctx.db
    .query("members")
    .withIndex("by_membership", (q: any) => q.eq("membershipNumber", membershipNumber))
    .first();

  if (!member) {
    throw new ConvexError("المنخرط غير موجود");
  }
  if (member.status !== "active") {
    throw new ConvexError("حسابك غير نشط");
  }
  return member;
}

// إضافة نشاط سياسي جديد
export const addPoliticalActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityType: v.union(
      v.literal("public_gathering"),
      v.literal("community_work"),
      v.literal("executive_meeting"),
      v.literal("party_meeting"),
      v.literal("electoral_campaign"),
      v.literal("media_appearance"),
      v.literal("citizen_reception"),
      v.literal("field_visit"),
      v.literal("other")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    time: v.string(),
    location: v.string(),
    wilaya: v.string(),
    baladiya: v.optional(v.string()),
    attendeesCount: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("planned"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await verifyMember(ctx, args.membershipNumber);

    const activityId = await ctx.db.insert("memberPoliticalActivities", {
      membershipNumber: args.membershipNumber,
      activityType: args.activityType,
      title: args.title,
      description: args.description,
      date: args.date,
      time: args.time,
      location: args.location,
      wilaya: args.wilaya,
      baladiya: args.baladiya,
      attendeesCount: args.attendeesCount,
      notes: args.notes,
      status: args.status,
      createdAt: Date.now(),
    });

    return { success: true, activityId };
  },
});

// تحديث نشاط سياسي
export const updatePoliticalActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityId: v.id("memberPoliticalActivities"),
    activityType: v.optional(v.union(
      v.literal("public_gathering"),
      v.literal("community_work"),
      v.literal("executive_meeting"),
      v.literal("party_meeting"),
      v.literal("electoral_campaign"),
      v.literal("media_appearance"),
      v.literal("citizen_reception"),
      v.literal("field_visit"),
      v.literal("other")
    )),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    attendeesCount: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("planned"), v.literal("completed"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    await verifyMember(ctx, args.membershipNumber);

    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new ConvexError("النشاط غير موجود");
    }
    if (activity.membershipNumber !== args.membershipNumber) {
      throw new ConvexError("لا يمكنك تعديل نشاط منخرط آخر");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.activityType !== undefined) updates.activityType = args.activityType;
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.time !== undefined) updates.time = args.time;
    if (args.location !== undefined) updates.location = args.location;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.baladiya !== undefined) updates.baladiya = args.baladiya;
    if (args.attendeesCount !== undefined) updates.attendeesCount = args.attendeesCount;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.activityId, updates);

    return { success: true };
  },
});

// حذف نشاط سياسي
export const deletePoliticalActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityId: v.id("memberPoliticalActivities"),
  },
  handler: async (ctx, args) => {
    await verifyMember(ctx, args.membershipNumber);

    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new ConvexError("النشاط غير موجود");
    }
    if (activity.membershipNumber !== args.membershipNumber) {
      throw new ConvexError("لا يمكنك حذف نشاط منخرط آخر");
    }

    await ctx.db.delete(args.activityId);

    return { success: true };
  },
});

// جلب أنشطة المنخرط
export const getMyPoliticalActivities = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("memberPoliticalActivities")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .order("desc")
      .collect();

    return activities;
  },
});

// جلب نشاط واحد
export const getPoliticalActivity = query({
  args: {
    activityId: v.id("memberPoliticalActivities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.activityId);
  },
});

// إحصائيات أنشطة المنخرط
export const getMyActivitiesStats = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("memberPoliticalActivities")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .collect();

    const byTypeMap = new Map<string, number>();
    let totalAttendees = 0;

    for (const activity of activities) {
      byTypeMap.set(activity.activityType, (byTypeMap.get(activity.activityType) || 0) + 1);
      if (activity.attendeesCount) {
        totalAttendees += activity.attendeesCount;
      }
    }

    const byType: { type: string; count: number }[] = [];
    byTypeMap.forEach((count, type) => {
      byType.push({ type, count });
    });

    return {
      total: activities.length,
      completed: activities.filter((a) => a.status === "completed").length,
      planned: activities.filter((a) => a.status === "planned").length,
      cancelled: activities.filter((a) => a.status === "cancelled").length,
      byType,
      totalAttendees,
    };
  },
});

// ============ وظائف الإدارة ============

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

// جلب جميع الأنشطة السياسية للإدارة
export const getAllPoliticalActivitiesForAdmin = query({
  args: {
    adminUsername: v.string(),
    wilaya: v.optional(v.string()),
    activityType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    let activities;

    if (args.wilaya) {
      activities = await ctx.db
        .query("memberPoliticalActivities")
        .withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!))
        .order("desc")
        .collect();
    } else if (args.activityType) {
      activities = await ctx.db
        .query("memberPoliticalActivities")
        .withIndex("by_type", (q) => q.eq("activityType", args.activityType as any))
        .order("desc")
        .collect();
    } else if (args.status) {
      activities = await ctx.db
        .query("memberPoliticalActivities")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    } else {
      activities = await ctx.db
        .query("memberPoliticalActivities")
        .order("desc")
        .collect();
    }

    // جلب بيانات المنخرطين
    const activitiesWithMembers = await Promise.all(
      activities.map(async (activity) => {
        const member = await ctx.db
          .query("members")
          .withIndex("by_membership", (q) => q.eq("membershipNumber", activity.membershipNumber))
          .first();

        return {
          ...activity,
          memberName: member ? `${member.firstName} ${member.lastName}` : "غير معروف",
          memberType: member?.memberType || "militant",
        };
      })
    );

    return activitiesWithMembers;
  },
});

// إحصائيات شاملة للأنشطة السياسية
export const getPoliticalActivitiesStats = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activities = await ctx.db.query("memberPoliticalActivities").collect();
    const members = await ctx.db.query("members").collect();

    const byTypeMap = new Map<string, number>();
    const byWilayaMap = new Map<string, number>();
    const byMemberTypeMap = new Map<string, number>();
    const memberActivityCount = new Map<string, number>();
    const activeMembersArray: string[] = [];
    
    let totalAttendees = 0;
    let thisMonthActivities = 0;
    let thisWeekActivities = 0;
    
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    for (const activity of activities) {
      byTypeMap.set(activity.activityType, (byTypeMap.get(activity.activityType) || 0) + 1);
      byWilayaMap.set(activity.wilaya, (byWilayaMap.get(activity.wilaya) || 0) + 1);
      
      if (activity.attendeesCount) {
        totalAttendees += activity.attendeesCount;
      }
      
      if (!activeMembersArray.includes(activity.membershipNumber)) {
        activeMembersArray.push(activity.membershipNumber);
      }
      
      memberActivityCount.set(
        activity.membershipNumber, 
        (memberActivityCount.get(activity.membershipNumber) || 0) + 1
      );
      
      if (activity.date >= oneMonthAgo) {
        thisMonthActivities++;
      }
      
      if (activity.date >= oneWeekAgo) {
        thisWeekActivities++;
      }
    }

    for (const activity of activities) {
      const member = members.find((m) => m.membershipNumber === activity.membershipNumber);
      if (member) {
        const memberType = member.memberType || "militant";
        byMemberTypeMap.set(memberType, (byMemberTypeMap.get(memberType) || 0) + 1);
      }
    }

    const sortedMembers = Array.from(memberActivityCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const topActiveMembers: { membershipNumber: string; name: string; count: number }[] = [];
    for (const [membershipNumber, count] of sortedMembers) {
      const member = members.find((m) => m.membershipNumber === membershipNumber);
      topActiveMembers.push({
        membershipNumber,
        name: member ? `${member.firstName} ${member.lastName}` : "غير معروف",
        count,
      });
    }

    const byType: { type: string; count: number }[] = [];
    byTypeMap.forEach((count, type) => {
      byType.push({ type, count });
    });

    const byWilaya: { wilaya: string; count: number }[] = [];
    byWilayaMap.forEach((count, wilaya) => {
      byWilaya.push({ wilaya, count });
    });

    const byMemberType: { memberType: string; count: number }[] = [];
    byMemberTypeMap.forEach((count, memberType) => {
      byMemberType.push({ memberType, count });
    });

    return {
      totalActivities: activities.length,
      completedActivities: activities.filter((a) => a.status === "completed").length,
      plannedActivities: activities.filter((a) => a.status === "planned").length,
      cancelledActivities: activities.filter((a) => a.status === "cancelled").length,
      totalAttendees,
      byType,
      byWilaya,
      byMemberType,
      thisMonthActivities,
      thisWeekActivities,
      topActiveMembers,
      activeMembersCount: activeMembersArray.length,
    };
  },
});

// رفع صورة
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// تفريغ جميع الأنشطة السياسية
export const clearAllPoliticalActivities = mutation({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdmin(ctx, args.adminUsername);
    
    if (admin.role !== "super_admin" && !admin.permissions.canManageActivities) {
      throw new ConvexError("ليس لديك صلاحية لتفريغ قاعدة البيانات");
    }

    const activities = await ctx.db.query("memberPoliticalActivities").collect();
    
    for (const activity of activities) {
      if (activity.photoIds && activity.photoIds.length > 0) {
        for (const photoId of activity.photoIds) {
          try {
            await ctx.storage.delete(photoId);
          } catch (e) {
            // تجاهل الأخطاء
          }
        }
      }
      await ctx.db.delete(activity._id);
    }

    return { 
      success: true, 
      deletedCount: activities.length,
    };
  },
});

// جلب جميع الأنشطة للتصدير
export const getAllActivitiesForExport = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activities = await ctx.db
      .query("memberPoliticalActivities")
      .order("desc")
      .collect();

    const members = await ctx.db.query("members").collect();

    const exportData = activities.map((activity) => {
      const member = members.find((m) => m.membershipNumber === activity.membershipNumber);
      
      return {
        membershipNumber: activity.membershipNumber,
        memberName: member ? `${member.firstName} ${member.lastName}` : "غير معروف",
        memberType: member?.memberType || "militant",
        activityType: activity.activityType,
        title: activity.title,
        description: activity.description || "",
        date: activity.date,
        time: activity.time,
        location: activity.location,
        wilaya: activity.wilaya,
        baladiya: activity.baladiya || "",
        attendeesCount: activity.attendeesCount || 0,
        notes: activity.notes || "",
        status: activity.status,
        createdAt: activity.createdAt,
      };
    });

    return exportData;
  },
});
