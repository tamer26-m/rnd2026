import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// رفع السيرة الذاتية
export const uploadCV = mutation({
  args: {
    membershipNumber: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // التحقق من وجود المنخرط
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (args.fileSize > maxSize) {
      throw new ConvexError("حجم الملف يتجاوز الحد المسموح (5 ميجابايت)");
    }

    // التحقق من وجود سيرة ذاتية سابقة
    const existingCV = await ctx.db
      .query("memberCVs")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (existingCV) {
      // حذف الملف القديم من التخزين
      await ctx.storage.delete(existingCV.storageId);
      
      // تحديث السجل الموجود
      await ctx.db.patch(existingCV._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        fileSize: args.fileSize,
        updatedAt: Date.now(),
      });

      return { success: true, message: "تم تحديث السيرة الذاتية بنجاح", isUpdate: true };
    }

    // إنشاء سجل جديد
    await ctx.db.insert("memberCVs", {
      membershipNumber: args.membershipNumber,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    });

    return { success: true, message: "تم رفع السيرة الذاتية بنجاح", isUpdate: false };
  },
});

// الحصول على السيرة الذاتية للمنخرط
export const getCV = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const cv = await ctx.db
      .query("memberCVs")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!cv) {
      return null;
    }

    const url = await ctx.storage.getUrl(cv.storageId);

    return {
      ...cv,
      url,
    };
  },
});

// حذف السيرة الذاتية
export const deleteCV = mutation({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const cv = await ctx.db
      .query("memberCVs")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!cv) {
      throw new ConvexError("لا توجد سيرة ذاتية لهذا المنخرط");
    }

    // حذف الملف من التخزين
    await ctx.storage.delete(cv.storageId);

    // حذف السجل
    await ctx.db.delete(cv._id);

    return { success: true, message: "تم حذف السيرة الذاتية بنجاح" };
  },
});

// الحصول على جميع السير الذاتية (للمسؤول)
export const listAllCVs = query({
  args: {
    adminUsername: v.string(),
    wilayaFilter: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // التحقق من صلاحيات المسؤول
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("ليس لديك صلاحية للوصول إلى هذه البيانات");
    }

    // الحصول على جميع السير الذاتية
    const allCVs = await ctx.db.query("memberCVs").collect();

    // الحصول على بيانات المنخرطين
    const cvsWithMemberData = await Promise.all(
      allCVs.map(async (cv) => {
        const member = await ctx.db
          .query("members")
          .withIndex("by_membership", (q) => q.eq("membershipNumber", cv.membershipNumber))
          .first();

        if (!member) return null;

        // تطبيق فلتر الولاية
        if (args.wilayaFilter && member.wilaya !== args.wilayaFilter) {
          return null;
        }

        // تطبيق البحث
        if (args.searchQuery) {
          const query = args.searchQuery.toLowerCase();
          const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
          if (!fullName.includes(query) && !cv.membershipNumber.includes(query)) {
            return null;
          }
        }

        const url = await ctx.storage.getUrl(cv.storageId);

        return {
          ...cv,
          url,
          memberName: `${member.firstName} ${member.lastName}`,
          memberNameLatin: `${member.firstNameLatin} ${member.lastNameLatin}`,
          wilaya: member.wilaya,
          baladiya: member.baladiya,
          phone: member.phone,
          email: member.email,
        };
      })
    );

    // تصفية القيم الفارغة
    return cvsWithMemberData.filter((cv) => cv !== null);
  },
});

// الحصول على إحصائيات السير الذاتية
export const getCVStats = query({
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
      throw new ConvexError("ليس لديك صلاحية للوصول إلى هذه البيانات");
    }

    const allCVs = await ctx.db.query("memberCVs").collect();
    const allMembers = await ctx.db.query("members").collect();

    // إحصائيات حسب الولاية
    const cvsByWilaya = new Map<string, number>();
    
    for (const cv of allCVs) {
      const member = allMembers.find((m) => m.membershipNumber === cv.membershipNumber);
      if (member) {
        cvsByWilaya.set(member.wilaya, (cvsByWilaya.get(member.wilaya) || 0) + 1);
      }
    }

    const wilayaStats = Array.from(cvsByWilaya.entries())
      .map(([wilaya, count]) => ({ wilaya, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCVs: allCVs.length,
      totalMembers: allMembers.length,
      cvPercentage: allMembers.length > 0 ? Math.round((allCVs.length / allMembers.length) * 100) : 0,
      wilayaStats,
    };
  },
});

// توليد رابط تحميل للسيرة الذاتية
export const getCVDownloadUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
