import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// تسجيل دخول المسؤول
export const loginAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // البحث عن المسؤول في قاعدة البيانات
    let admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    // إذا كان المسؤول الافتراضي ولم يكن موجوداً، قم بإنشائه
    if (!admin && args.username === "admin" && args.password === "admin") {
      await ctx.db.insert("admins", {
        username: "admin",
        password: "admin",
        fullName: "المسؤول العام",
        role: "super_admin",
        permissions: {
          canEditHomePage: true,
          canEditSecretaryGeneral: true,
          canEditNationalBureau: true,
          canManageAdmins: true,
          canViewStats: true,
          canManageMembers: true,
          canManageGallery: true,
          canManageActivities: true,
          canExportData: true,
          canSuspendMembers: true,
        },
        isActive: true,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
      
      return { 
        success: true, 
        message: "تم تسجيل الدخول بنجاح! 🎉",
        admin: {
          username: "admin",
          fullName: "المسؤول العام",
          role: "super_admin",
          permissions: {
            canEditHomePage: true,
            canEditSecretaryGeneral: true,
            canEditNationalBureau: true,
            canManageAdmins: true,
            canViewStats: true,
            canManageMembers: true,
            canManageGallery: true,
            canManageActivities: true,
            canExportData: true,
            canSuspendMembers: true,
          },
        }
      };
    }

    // التحقق من وجود المسؤول وكلمة المرور
    if (admin && admin.password === args.password) {
      if (!admin.isActive) {
        throw new ConvexError("حسابك معطل - يرجى التواصل مع المسؤول الرئيسي");
      }
      
      await ctx.db.patch(admin._id, { lastLogin: Date.now() });
      
      return { 
        success: true, 
        message: "تم تسجيل الدخول بنجاح! 🎉",
        admin: {
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions,
        }
      };
    }
    
    throw new ConvexError("اسم المستخدم أو كلمة المرور غير صحيحة");
  },
});

// الحصول على صلاحيات المسؤول
export const getAdminPermissions = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
      permissions: admin.permissions,
    };
  },
});

// التحقق من حالة تسجيل الدخول
export const checkAdminSession = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken === "admin-session-token") {
      return {
        isValid: true,
        admin: {
          username: "admin",
          fullName: "المسؤول العام",
          role: "admin"
        }
      };
    }
    return { isValid: false };
  },
});
