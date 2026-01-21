import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// أنواع الاشتراكات مع المبالغ
export const SUBSCRIPTION_TYPES = {
  type_1: { amount: 1000, label: "الاشتراك 01", description: "ألف دينار جزائري" },
  type_2: { amount: 3000, label: "الاشتراك 02", description: "ثلاثة آلاف دينار جزائري" },
  type_3: { amount: 10000, label: "الاشتراك 03", description: "عشرة آلاف دينار جزائري" },
  type_4: { amount: 200000, label: "الاشتراك 04", description: "مائتي ألف دينار جزائري (خاص بنواب البرلمان ومجلس الأمة)" },
};

// تحديث نوع الاشتراك للمنخرط
export const updateSubscription = mutation({
  args: {
    membershipNumber: v.string(),
    subscriptionType: v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    const currentYear = new Date().getFullYear();
    const amount = SUBSCRIPTION_TYPES[args.subscriptionType].amount;

    // تحديث بيانات المنخرط
    await ctx.db.patch(member._id, {
      subscriptionType: args.subscriptionType,
      subscriptionYear: currentYear,
    });

    // إضافة سجل الاشتراك
    await ctx.db.insert("subscriptionHistory", {
      membershipNumber: args.membershipNumber,
      subscriptionType: args.subscriptionType,
      amount,
      year: currentYear,
      paidAt: Date.now(),
    });

    return { success: true, message: "تم تحديث الاشتراك بنجاح" };
  },
});

// الحصول على سجل اشتراكات المنخرط
export const getSubscriptionHistory = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("subscriptionHistory")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .order("desc")
      .collect();

    return history;
  },
});

// الحصول على الاشتراك الحالي للمنخرط
export const getCurrentSubscription = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) return null;

    return {
      subscriptionType: member.subscriptionType,
      subscriptionYear: member.subscriptionYear,
    };
  },
});

// الحصول على أنواع الاشتراكات
export const getSubscriptionTypes = query({
  args: {},
  handler: async () => {
    return SUBSCRIPTION_TYPES;
  },
});
