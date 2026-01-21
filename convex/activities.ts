import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

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

// دالة مساعدة لإرسال الإشعارات لجميع المنخرطين
async function notifyAllMembers(
  ctx: any,
  type: "activity_created" | "activity_updated" | "gallery_image_added" | "general",
  title: string,
  message: string,
  activityId?: any,
  galleryImageId?: any
) {
  // جلب جميع المنخرطين النشطين
  const activeMembers = await ctx.db
    .query("members")
    .withIndex("by_status", (q: any) => q.eq("status", "active"))
    .collect();

  // إنشاء إشعار لكل منخرط
  for (const member of activeMembers) {
    await ctx.db.insert("notifications", {
      memberId: member._id,
      membershipNumber: member.membershipNumber,
      activityId: activityId,
      galleryImageId: galleryImageId,
      type: type,
      title: title,
      message: message,
      isRead: false,
      createdAt: Date.now(),
    });
  }

  return activeMembers.length;
}

// قائمة جميع الأنشطة
export const listActivities = query({
  args: {
    status: v.optional(v.string()),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(50);
      return activities;
    } else if (args.wilaya) {
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!))
        .order("desc")
        .take(50);
      return activities;
    }

    const activities = await ctx.db.query("activities").order("desc").take(50);
    return activities;
  },
});

// جلب الأنشطة للإدارة
export const listActivitiesForAdmin = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activities = await ctx.db.query("activities").order("desc").collect();

    // جلب الوسائط لكل نشاط
    const activitiesWithMedia = await Promise.all(
      activities.map(async (activity) => {
        const media = await ctx.db
          .query("media")
          .withIndex("by_activity", (q) => q.eq("activityId", activity._id))
          .collect();

        const mediaWithUrls = await Promise.all(
          media.map(async (item) => ({
            ...item,
            url: await ctx.storage.getUrl(item.storageId),
          }))
        );

        return {
          ...activity,
          media: mediaWithUrls,
        };
      })
    );

    return activitiesWithMedia;
  },
});

// الحصول على نشاط واحد مع الصور والفيديوهات
export const getActivity = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) return null;

    const media = await ctx.db
      .query("media")
      .withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
      .collect();

    const mediaWithUrls = await Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );

    return {
      ...activity,
      media: mediaWithUrls,
    };
  },
});

// إنشاء نشاط جديد بواسطة المسؤول مع إرسال إشعارات
export const createActivityByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    wilaya: v.string(),
    baladiya: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("conference"),
      v.literal("campaign"),
      v.literal("event"),
      v.literal("other")
    ),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activityId = await ctx.db.insert("activities", {
      title: args.title,
      description: args.description,
      date: args.date,
      wilaya: args.wilaya,
      baladiya: args.baladiya,
      location: args.location,
      type: args.type,
      status: args.status,
      createdBy: args.adminUsername,
    });

    // إرسال إشعارات لجميع المنخرطين
    const notifiedCount = await notifyAllMembers(
      ctx,
      "activity_created",
      "🎉 نشاط جديد",
      `تم إضافة نشاط جديد: ${args.title}`,
      activityId
    );

    return { success: true, activityId, notifiedCount };
  },
});

// تحديث نشاط بواسطة المسؤول مع إرسال إشعارات
export const updateActivityByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    activityId: v.id("activities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("conference"),
        v.literal("campaign"),
        v.literal("event"),
        v.literal("other")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed")
      )
    ),
    sendNotification: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.baladiya !== undefined) updates.baladiya = args.baladiya;
    if (args.location !== undefined) updates.location = args.location;
    if (args.type !== undefined) updates.type = args.type;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.activityId, updates);

    // إرسال إشعارات إذا طُلب ذلك
    let notifiedCount = 0;
    if (args.sendNotification !== false) {
      notifiedCount = await notifyAllMembers(
        ctx,
        "activity_updated",
        "📝 تحديث نشاط",
        `تم تحديث النشاط: ${args.title || activity.title}`,
        args.activityId
      );
    }

    return { success: true, notifiedCount };
  },
});

// حذف نشاط بواسطة المسؤول
export const deleteActivityByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    // حذف جميع الوسائط المرتبطة
    const media = await ctx.db
      .query("media")
      .withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
      .collect();

    for (const item of media) {
      await ctx.storage.delete(item.storageId);
      await ctx.db.delete(item._id);
    }

    // حذف الإشعارات المرتبطة
    const notifications = await ctx.db.query("notifications").collect();
    for (const notif of notifications) {
      if (notif.activityId === args.activityId) {
        await ctx.db.delete(notif._id);
      }
    }

    await ctx.db.delete(args.activityId);

    return { success: true };
  },
});

// إضافة وسائط لنشاط بواسطة المسؤول
export const addMediaToActivityByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    activityId: v.id("activities"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    await ctx.db.insert("media", {
      activityId: args.activityId,
      storageId: args.storageId,
      type: args.type,
      caption: args.caption,
      uploadedBy: args.adminUsername,
    });

    return { success: true };
  },
});

// حذف وسائط من نشاط
export const deleteMediaFromActivity = mutation({
  args: {
    adminUsername: v.string(),
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const media = await ctx.db.get(args.mediaId);
    if (!media) throw new ConvexError("الوسائط غير موجودة");

    await ctx.storage.delete(media.storageId);
    await ctx.db.delete(args.mediaId);

    return { success: true };
  },
});

// إنشاء نشاط جديد وإرسال إشعارات للأعضاء
export const createActivity = mutation({
  args: {
    membershipNumber: v.string(),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    wilaya: v.string(),
    baladiya: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("conference"),
      v.literal("campaign"),
      v.literal("event"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || (member.role !== "admin" && member.role !== "coordinator")) {
      throw new ConvexError("ليس لديك صلاحية لإنشاء نشاط");
    }

    const activityId = await ctx.db.insert("activities", {
      title: args.title,
      description: args.description,
      date: args.date,
      wilaya: args.wilaya,
      baladiya: args.baladiya,
      location: args.location,
      type: args.type,
      status: args.date > Date.now() ? "upcoming" : "ongoing",
      createdBy: args.membershipNumber,
    });

    // إرسال إشعارات لجميع المنخرطين النشطين
    const notifiedCount = await notifyAllMembers(
      ctx,
      "activity_created",
      "🎉 نشاط جديد",
      `تم إضافة نشاط جديد: ${args.title}`,
      activityId
    );

    return { success: true, activityId, notifiedCount };
  },
});

// تحديث نشاط
export const updateActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityId: v.id("activities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("conference"),
        v.literal("campaign"),
        v.literal("event"),
        v.literal("other")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || (member.role !== "admin" && member.role !== "coordinator")) {
      throw new ConvexError("ليس لديك صلاحية لتحديث نشاط");
    }

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.baladiya !== undefined) updates.baladiya = args.baladiya;
    if (args.location !== undefined) updates.location = args.location;
    if (args.type !== undefined) updates.type = args.type;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.activityId, updates);

    return { success: true };
  },
});

// حذف نشاط
export const deleteActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || member.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لحذف نشاط");
    }

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    // حذف جميع الوسائط المرتبطة
    const media = await ctx.db
      .query("media")
      .withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
      .collect();

    for (const item of media) {
      await ctx.storage.delete(item.storageId);
      await ctx.db.delete(item._id);
    }

    // حذف جميع الإشعارات المرتبطة
    const notifications = await ctx.db.query("notifications").collect();
    for (const notif of notifications) {
      if (notif.activityId === args.activityId) {
        await ctx.db.delete(notif._id);
      }
    }

    await ctx.db.delete(args.activityId);

    return { success: true };
  },
});

// رفع صورة أو فيديو لنشاط
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// إضافة وسائط لنشاط
export const addMediaToActivity = mutation({
  args: {
    membershipNumber: v.string(),
    activityId: v.id("activities"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || (member.role !== "admin" && member.role !== "coordinator")) {
      throw new ConvexError("ليس لديك صلاحية لإضافة وسائط");
    }

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new ConvexError("النشاط غير موجود");

    await ctx.db.insert("media", {
      activityId: args.activityId,
      storageId: args.storageId,
      type: args.type,
      caption: args.caption,
      uploadedBy: args.membershipNumber,
    });

    return { success: true };
  },
});
