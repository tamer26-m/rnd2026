import { mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// إنشاء بيانات تجريبية للمنخرط
export const createDemoMember = mutation({
  args: {},
  handler: async (ctx) => {
    // هذه الدالة لم تعد مستخدمة بعد إزالة نظام المصادقة القديم
    throw new ConvexError("هذه الميزة لم تعد متاحة. يرجى التسجيل كمنخرط جديد.");
  },
});

// إنشاء مسؤول افتراضي للاختبار
export const createDefaultAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .first();

    if (existingAdmin) {
      throw new ConvexError("المسؤول الافتراضي موجود بالفعل");
    }

    const adminId = await ctx.db.insert("admins", {
      username: "admin",
      password: "admin123",
      fullName: "المسؤول الرئيسي",
      role: "super_admin",
      permissions: {
        canEditHomePage: true,
        canEditSecretaryGeneral: true,
        canEditNationalBureau: true,
        canManageAdmins: true,
        canViewStats: true,
        canManageMembers: true,
      },
      isActive: true,
      createdAt: Date.now(),
    });

    return { success: true, adminId };
  },
});
