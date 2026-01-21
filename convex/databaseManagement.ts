import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// ============ إدارة قاعدة البيانات ============

// الحصول على عدد المنخرطين الحالي
export const getMembersCount = query({
  args: {
    requestingUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canManageMembers) {
      throw new ConvexError("ليس لديك صلاحية إدارة المنخرطين");
    }

    const members = await ctx.db.query("members").collect();
    return members.length;
  },
});

// حذف جميع المنخرطين
export const deleteAllMembers = mutation({
  args: {
    requestingUsername: v.string(),
    confirmationCode: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canManageMembers) {
      throw new ConvexError("ليس لديك صلاحية إدارة المنخرطين");
    }

    if (args.confirmationCode !== "DELETE_ALL_MEMBERS") {
      throw new ConvexError("رمز التأكيد غير صحيح. يرجى كتابة DELETE_ALL_MEMBERS للتأكيد");
    }

    const members = await ctx.db.query("members").collect();
    const totalCount = members.length;

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    return {
      success: true,
      deletedCount: totalCount,
      message: `تم حذف ${totalCount} منخرط بنجاح`,
    };
  },
});

// تفريغ جميع المنخرطين مع الملفات المرتبطة
export const clearAllMembers = mutation({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (admin.role !== "super_admin" && !admin.permissions.canManageMembers) {
      throw new ConvexError("ليس لديك صلاحية لتفريغ قاعدة البيانات");
    }

    const members = await ctx.db.query("members").collect();
    let deletedCount = 0;

    for (const member of members) {
      // حذف الصورة الشخصية
      if (member.profilePhotoId) {
        try {
          await ctx.storage.delete(member.profilePhotoId);
        } catch (e) {}
      }

      // حذف السيرة الذاتية
      const cv = await ctx.db
        .query("memberCVs")
        .withIndex("by_membership", (q) => q.eq("membershipNumber", member.membershipNumber))
        .first();
      
      if (cv) {
        if (cv.storageId) {
          try { await ctx.storage.delete(cv.storageId); } catch (e) {}
        }
        await ctx.db.delete(cv._id);
      }

      // حذف الإشعارات
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_membership", (q) => q.eq("membershipNumber", member.membershipNumber))
        .collect();
      
      for (const notif of notifications) {
        await ctx.db.delete(notif._id);
      }

      // حذف سجل الاشتراكات
      const subscriptions = await ctx.db
        .query("subscriptionHistory")
        .withIndex("by_membership", (q) => q.eq("membershipNumber", member.membershipNumber))
        .collect();
      
      for (const sub of subscriptions) {
        await ctx.db.delete(sub._id);
      }

      await ctx.db.delete(member._id);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});

// إحصائيات قاعدة البيانات
export const getDatabaseStats = query({
  args: {
    requestingUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    const members = await ctx.db.query("members").collect();
    const admins = await ctx.db.query("admins").collect();
    const activities = await ctx.db.query("activities").collect();

    return {
      membersCount: members.length,
      adminsCount: admins.length,
      activitiesCount: activities.length,
    };
  },
});
