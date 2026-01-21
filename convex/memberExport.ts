import { v } from "convex/values";
import { query } from "./_generated/server";

// الحصول على جميع المنخرطين للتصدير
export const getMembersForExport = query({
  args: {
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    memberType: v.optional(v.string()),
    status: v.optional(v.string()),
    educationLevel: v.optional(v.string()),
    profession: v.optional(v.string()),
    gender: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let members;

    if (args.baladiya) {
      members = await ctx.db
        .query("members")
        .withIndex("by_baladiya", (q) => q.eq("baladiya", args.baladiya!))
        .collect();
      if (args.wilaya) {
        members = members.filter((m) => m.wilaya === args.wilaya);
      }
    } else if (args.wilaya) {
      members = await ctx.db
        .query("members")
        .withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!))
        .collect();
    } else {
      members = await ctx.db.query("members").collect();
    }

    // تطبيق الفلاتر
    if (args.memberType) {
      members = members.filter((m) => m.memberType === args.memberType);
    }

    if (args.status) {
      members = members.filter((m) => m.status === args.status);
    }

    if (args.educationLevel) {
      members = members.filter((m) => m.educationLevel === args.educationLevel);
    }

    if (args.profession) {
      members = members.filter((m) => m.profession === args.profession);
    }

    if (args.gender) {
      members = members.filter((m) => m.gender === args.gender);
    }

    // إرجاع البيانات بدون كلمة المرور
    return members.map((member) => ({
      ...member,
      password: undefined,
    }));
  },
});

// الحصول على إحصائيات التصدير
export const getExportStats = query({
  args: {
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    memberType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let members = await ctx.db.query("members").collect();

    if (args.wilaya) {
      members = members.filter((m) => m.wilaya === args.wilaya);
    }

    if (args.baladiya) {
      members = members.filter((m) => m.baladiya === args.baladiya);
    }

    if (args.memberType) {
      members = members.filter((m) => m.memberType === args.memberType);
    }

    if (args.status) {
      members = members.filter((m) => m.status === args.status);
    }

    return {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      inactive: members.filter((m) => m.status === "inactive").length,
      suspended: members.filter((m) => m.status === "suspended").length,
      male: members.filter((m) => m.gender === "male").length,
      female: members.filter((m) => m.gender === "female").length,
    };
  },
});
