import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// ============ إدارة المسؤولين ============

export const getAllAdmins = query({
  args: {
    requestingUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const requestingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!requestingAdmin || !requestingAdmin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!requestingAdmin.permissions.canManageAdmins) {
      throw new ConvexError("ليس لديك صلاحية إدارة المسؤولين");
    }

    const admins = await ctx.db.query("admins").collect();
    
    return admins.map(admin => ({
      _id: admin._id,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
    }));
  },
});

export const createAdmin = mutation({
  args: {
    requestingUsername: v.string(),
    username: v.string(),
    password: v.string(),
    fullName: v.string(),
    role: v.string(),
    permissions: v.object({
      canEditHomePage: v.boolean(),
      canEditSecretaryGeneral: v.boolean(),
      canEditNationalBureau: v.boolean(),
      canManageAdmins: v.boolean(),
      canViewStats: v.boolean(),
      canManageMembers: v.boolean(),
      canManageGallery: v.optional(v.boolean()),
      canManageActivities: v.optional(v.boolean()),
      canExportData: v.optional(v.boolean()),
      canSuspendMembers: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const requestingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!requestingAdmin || !requestingAdmin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!requestingAdmin.permissions.canManageAdmins) {
      throw new ConvexError("ليس لديك صلاحية إضافة مسؤولين جدد");
    }

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingAdmin) {
      throw new ConvexError("اسم المستخدم موجود بالفعل");
    }

    // إضافة الصلاحيات الجديدة مع القيم الافتراضية
    const fullPermissions = {
      canEditHomePage: args.permissions.canEditHomePage,
      canEditSecretaryGeneral: args.permissions.canEditSecretaryGeneral,
      canEditNationalBureau: args.permissions.canEditNationalBureau,
      canManageAdmins: args.permissions.canManageAdmins,
      canViewStats: args.permissions.canViewStats,
      canManageMembers: args.permissions.canManageMembers,
      canManageGallery: args.permissions.canManageGallery ?? false,
      canManageActivities: args.permissions.canManageActivities ?? false,
      canExportData: args.permissions.canExportData ?? false,
      canSuspendMembers: args.permissions.canSuspendMembers ?? false,
    };

    const adminId = await ctx.db.insert("admins", {
      username: args.username,
      password: args.password,
      fullName: args.fullName,
      role: args.role,
      permissions: fullPermissions,
      isActive: true,
      createdAt: Date.now(),
    });

    return adminId;
  },
});

export const updateAdminPermissions = mutation({
  args: {
    requestingUsername: v.string(),
    adminId: v.id("admins"),
    permissions: v.object({
      canEditHomePage: v.boolean(),
      canEditSecretaryGeneral: v.boolean(),
      canEditNationalBureau: v.boolean(),
      canManageAdmins: v.boolean(),
      canViewStats: v.boolean(),
      canManageMembers: v.boolean(),
      canManageGallery: v.optional(v.boolean()),
      canManageActivities: v.optional(v.boolean()),
      canExportData: v.optional(v.boolean()),
      canSuspendMembers: v.optional(v.boolean()),
    }),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const requestingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!requestingAdmin || !requestingAdmin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!requestingAdmin.permissions.canManageAdmins) {
      throw new ConvexError("ليس لديك صلاحية تعديل صلاحيات المسؤولين");
    }

    const fullPermissions = {
      canEditHomePage: args.permissions.canEditHomePage,
      canEditSecretaryGeneral: args.permissions.canEditSecretaryGeneral,
      canEditNationalBureau: args.permissions.canEditNationalBureau,
      canManageAdmins: args.permissions.canManageAdmins,
      canViewStats: args.permissions.canViewStats,
      canManageMembers: args.permissions.canManageMembers,
      canManageGallery: args.permissions.canManageGallery ?? false,
      canManageActivities: args.permissions.canManageActivities ?? false,
      canExportData: args.permissions.canExportData ?? false,
      canSuspendMembers: args.permissions.canSuspendMembers ?? false,
    };

    await ctx.db.patch(args.adminId, {
      permissions: fullPermissions,
      role: args.role,
    });

    return args.adminId;
  },
});

export const toggleAdminStatus = mutation({
  args: {
    requestingUsername: v.string(),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const requestingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.requestingUsername))
      .first();

    if (!requestingAdmin || !requestingAdmin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!requestingAdmin.permissions.canManageAdmins) {
      throw new ConvexError("ليس لديك صلاحية تعطيل/تفعيل المسؤولين");
    }

    const targetAdmin = await ctx.db.get(args.adminId);
    if (!targetAdmin) {
      throw new ConvexError("المسؤول غير موجود");
    }

    await ctx.db.patch(args.adminId, {
      isActive: !targetAdmin.isActive,
    });

    return args.adminId;
  },
});

export const changeAdminPassword = mutation({
  args: {
    username: v.string(),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin) {
      throw new ConvexError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }

    if (admin.password !== args.oldPassword) {
      throw new ConvexError("كلمة المرور القديمة غير صحيحة");
    }

    await ctx.db.patch(admin._id, {
      password: args.newPassword,
    });

    return admin._id;
  },
});
