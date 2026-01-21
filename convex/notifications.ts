import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// إرسال إشعار لجميع المنخرطين النشطين
export const sendNotificationToAllMembers = internalMutation({
  args: {
    type: v.union(
      v.literal("activity_created"),
      v.literal("activity_updated"),
      v.literal("gallery_image_added"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    activityId: v.optional(v.id("activities")),
    galleryImageId: v.optional(v.id("galleryImages")),
  },
  handler: async (ctx, args) => {
    // جلب جميع المنخرطين النشطين
    const activeMembers = await ctx.db
      .query("members")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // إنشاء إشعار لكل منخرط
    for (const member of activeMembers) {
      await ctx.db.insert("notifications", {
        memberId: member._id,
        membershipNumber: member.membershipNumber,
        activityId: args.activityId,
        galleryImageId: args.galleryImageId,
        type: args.type,
        title: args.title,
        message: args.message,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true, notifiedCount: activeMembers.length };
  },
});

// جلب إشعارات المنخرط
export const getMyNotifications = query({
  args: {
    membershipNumber: v.string(),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let notifications;
    if (args.unreadOnly) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_member_and_read", (q) => 
          q.eq("membershipNumber", args.membershipNumber).eq("isRead", false)
        )
        .order("desc")
        .take(limit);
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
        .order("desc")
        .take(limit);
    }

    return notifications;
  },
});

// عدد الإشعارات غير المقروءة
export const getUnreadCount = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_member_and_read", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("isRead", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// تحديد إشعار كمقروء
export const markAsRead = mutation({
  args: {
    membershipNumber: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification) {
      throw new ConvexError("الإشعار غير موجود");
    }

    if (notification.membershipNumber !== args.membershipNumber) {
      throw new ConvexError("ليس لديك صلاحية لهذا الإجراء");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });

    return { success: true };
  },
});

// تحديد جميع الإشعارات كمقروءة
export const markAllAsRead = mutation({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_member_and_read", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("isRead", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }

    return { success: true, markedCount: unreadNotifications.length };
  },
});

// حذف إشعار
export const deleteNotification = mutation({
  args: {
    membershipNumber: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification) {
      throw new ConvexError("الإشعار غير موجود");
    }

    if (notification.membershipNumber !== args.membershipNumber) {
      throw new ConvexError("ليس لديك صلاحية لهذا الإجراء");
    }

    await ctx.db.delete(args.notificationId);

    return { success: true };
  },
});

// حذف جميع الإشعارات المقروءة
export const deleteAllRead = mutation({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const readNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .collect();

    const toDelete = readNotifications.filter(n => n.isRead);

    for (const notification of toDelete) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, deletedCount: toDelete.length };
  },
});
