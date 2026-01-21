import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// الحصول على جميع أعضاء المكتب الوطني (للعرض العام)
export const listNationalBureauMembers = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db
      .query("nationalBureauMembers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const membersWithPhotos = await Promise.all(
      members.map(async (member) => {
        let photoUrl = null;
        if (member.photoId) {
          photoUrl = await ctx.storage.getUrl(member.photoId);
        }
        return {
          ...member,
          photoUrl,
        };
      })
    );

    return membersWithPhotos.sort((a, b) => a.order - b.order);
  },
});

// الحصول على جميع أعضاء المكتب الوطني (للإدارة - يشمل غير النشطين)
export const listAllNationalBureauMembers = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحيات المسؤول
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      return null;
    }

    if (!admin.permissions.canEditNationalBureau) {
      return null;
    }

    const members = await ctx.db.query("nationalBureauMembers").collect();

    const membersWithPhotos = await Promise.all(
      members.map(async (member) => {
        let photoUrl = null;
        if (member.photoId) {
          photoUrl = await ctx.storage.getUrl(member.photoId);
        }
        return {
          ...member,
          photoUrl,
        };
      })
    );

    return membersWithPhotos.sort((a, b) => a.order - b.order);
  },
});

// إضافة عضو جديد للمكتب الوطني (للمسؤولين)
export const addNationalBureauMemberByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    fullName: v.string(),
    position: v.string(),
    photoId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحيات المسؤول
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditNationalBureau) {
      throw new ConvexError("ليس لديك صلاحية تعديل المكتب الوطني");
    }

    const memberId = await ctx.db.insert("nationalBureauMembers", {
      fullName: args.fullName,
      position: args.position,
      photoId: args.photoId,
      bio: args.bio,
      order: args.order,
      isActive: true,
      createdAt: Date.now(),
    });

    return memberId;
  },
});

// تحديث عضو في المكتب الوطني (للمسؤولين)
export const updateNationalBureauMemberByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    memberId: v.id("nationalBureauMembers"),
    fullName: v.optional(v.string()),
    position: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحيات المسؤول
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditNationalBureau) {
      throw new ConvexError("ليس لديك صلاحية تعديل المكتب الوطني");
    }

    const bureauMember = await ctx.db.get(args.memberId);
    if (!bureauMember) {
      throw new ConvexError("العضو غير موجود");
    }

    const updates: any = {};
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.position !== undefined) updates.position = args.position;
    if (args.photoId !== undefined) updates.photoId = args.photoId;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.order !== undefined) updates.order = args.order;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.memberId, updates);

    return args.memberId;
  },
});

// حذف عضو من المكتب الوطني (للمسؤولين)
export const deleteNationalBureauMemberByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    memberId: v.id("nationalBureauMembers"),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحيات المسؤول
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditNationalBureau) {
      throw new ConvexError("ليس لديك صلاحية حذف أعضاء المكتب الوطني");
    }

    const bureauMember = await ctx.db.get(args.memberId);
    if (!bureauMember) {
      throw new ConvexError("العضو غير موجود");
    }

    // حذف الصورة إذا كانت موجودة
    if (bureauMember.photoId) {
      await ctx.storage.delete(bureauMember.photoId);
    }

    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});

// ============ الدوال القديمة للتوافق ============

// إضافة عضو جديد للمكتب الوطني (بواسطة رقم العضوية)
export const addNationalBureauMember = mutation({
  args: {
    membershipNumber: v.string(),
    fullName: v.string(),
    position: v.string(),
    photoId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || member.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لإضافة أعضاء المكتب الوطني");
    }

    await ctx.db.insert("nationalBureauMembers", {
      fullName: args.fullName,
      position: args.position,
      photoId: args.photoId,
      bio: args.bio,
      order: args.order,
      isActive: true,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// تحديث عضو في المكتب الوطني
export const updateNationalBureauMember = mutation({
  args: {
    membershipNumber: v.string(),
    memberId: v.id("nationalBureauMembers"),
    fullName: v.optional(v.string()),
    position: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || member.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لتحديث أعضاء المكتب الوطني");
    }

    const bureauMember = await ctx.db.get(args.memberId);
    if (!bureauMember) throw new ConvexError("العضو غير موجود");

    const updates: any = {};
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.position !== undefined) updates.position = args.position;
    if (args.photoId !== undefined) updates.photoId = args.photoId;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.order !== undefined) updates.order = args.order;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.memberId, updates);

    return { success: true };
  },
});

// حذف عضو من المكتب الوطني
export const deleteNationalBureauMember = mutation({
  args: {
    membershipNumber: v.string(),
    memberId: v.id("nationalBureauMembers"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member || member.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لحذف أعضاء المكتب الوطني");
    }

    const bureauMember = await ctx.db.get(args.memberId);
    if (!bureauMember) throw new ConvexError("العضو غير موجود");

    // حذف الصورة إذا كانت موجودة
    if (bureauMember.photoId) {
      await ctx.storage.delete(bureauMember.photoId);
    }

    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});

// رفع صورة
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// التحقق من صلاحيات المسؤول
export const checkAdminPermission = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const m = await ctx.db.query("members").withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber)).first();
    return m?.role === "admin";
  },
});
