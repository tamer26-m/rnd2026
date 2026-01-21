import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// أنواع الاشتراكات
const SUBSCRIPTION_AMOUNTS = {
  type_1: 1000,
  type_2: 3000,
  type_3: 10000,
  type_4: 200000,
};

// رفع وثيقة تسديد الاشتراك من طرف المنخرط
export const uploadReceipt = mutation({
  args: {
    membershipNumber: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    // التحقق من وجود المنخرط
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .unique();

    if (!member) {
      throw new Error("المنخرط غير موجود");
    }

    if (!member.subscriptionType) {
      throw new Error("لم يتم تحديد نوع الاشتراك");
    }

    // التحقق من عدم وجود وثيقة سابقة لنفس السنة
    const existingReceipt = await ctx.db
      .query("subscriptionReceipts")
      .withIndex("by_membership_and_year", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("year", args.year)
      )
      .unique();

    if (existingReceipt) {
      // تحديث الوثيقة الموجودة
      await ctx.db.patch(existingReceipt._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        fileSize: args.fileSize,
        uploadedAt: Date.now(),
        status: "pending",
      });
      return existingReceipt._id;
    }

    // إنشاء وثيقة جديدة
    const receiptId = await ctx.db.insert("subscriptionReceipts", {
      membershipNumber: args.membershipNumber,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      year: args.year,
      subscriptionType: member.subscriptionType,
      amount: SUBSCRIPTION_AMOUNTS[member.subscriptionType],
      uploadedAt: Date.now(),
      status: "pending",
    });

    return receiptId;
  },
});

// الحصول على وثائق تسديد الاشتراك للمنخرط
export const getMemberReceipts = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("subscriptionReceipts")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .order("desc")
      .collect();

    return Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        url: await ctx.storage.getUrl(receipt.storageId),
      }))
    );
  },
});

// الحصول على جميع وثائق تسديد الاشتراك (للمسؤول)
export const getAllReceipts = query({
  args: {
    year: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let receipts = await ctx.db.query("subscriptionReceipts").order("desc").collect();

    // تصفية حسب السنة
    if (args.year) {
      receipts = receipts.filter((r) => r.year === args.year);
    }

    // تصفية حسب الحالة
    if (args.status) {
      receipts = receipts.filter((r) => r.status === args.status);
    }

    // الحصول على بيانات المنخرطين
    const receiptsWithDetails = await Promise.all(
      receipts.map(async (receipt) => {
        const member = await ctx.db
          .query("members")
          .withIndex("by_membership", (q) => q.eq("membershipNumber", receipt.membershipNumber))
          .unique();

        // تصفية حسب الولاية
        if (args.wilaya && member?.wilaya !== args.wilaya) {
          return null;
        }

        return {
          ...receipt,
          url: await ctx.storage.getUrl(receipt.storageId),
          member: member ? {
            firstName: member.firstName,
            lastName: member.lastName,
            wilaya: member.wilaya,
            baladiya: member.baladiya,
            phone: member.phone,
          } : null,
        };
      })
    );

    return receiptsWithDetails.filter((r) => r !== null);
  },
});

// التحقق من وثيقة تسديد الاشتراك (للمسؤول)
export const verifyReceipt = mutation({
  args: {
    receiptId: v.id("subscriptionReceipts"),
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) {
      throw new Error("الوثيقة غير موجودة");
    }

    // تحديث حالة الوثيقة
    await ctx.db.patch(args.receiptId, {
      status: "verified",
      verifiedAt: Date.now(),
      verifiedBy: args.adminUsername,
    });

    // تحديث حالة تسديد المنخرط
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", receipt.membershipNumber))
      .unique();

    if (member) {
      await ctx.db.patch(member._id, {
        subscriptionPaid: true,
        subscriptionPaidAt: Date.now(),
        subscriptionReceiptId: receipt.storageId,
      });
    }

    return { success: true };
  },
});

// رفض وثيقة تسديد الاشتراك (للمسؤول)
export const rejectReceipt = mutation({
  args: {
    receiptId: v.id("subscriptionReceipts"),
    adminUsername: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) {
      throw new Error("الوثيقة غير موجودة");
    }

    await ctx.db.patch(args.receiptId, {
      status: "rejected",
      verifiedAt: Date.now(),
      verifiedBy: args.adminUsername,
      rejectionReason: args.reason,
    });

    return { success: true };
  },
});

// إحصائيات الاشتراكات
export const getSubscriptionStats = query({
  args: {
    year: v.optional(v.number()),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentYear = args.year || new Date().getFullYear();

    // الحصول على جميع المنخرطين
    let members = await ctx.db.query("members").collect();

    // تصفية حسب الولاية
    if (args.wilaya) {
      members = members.filter((m) => m.wilaya === args.wilaya);
    }

    const totalMembers = members.length;
    const membersWithSubscription = members.filter((m) => m.subscriptionType);
    const paidMembers = members.filter(
      (m) => m.subscriptionPaid && m.subscriptionYear === currentYear
    );

    // الحصول على وثائق التسديد
    let receipts = await ctx.db
      .query("subscriptionReceipts")
      .withIndex("by_year", (q) => q.eq("year", currentYear))
      .collect();

    if (args.wilaya) {
      const memberNumbers = members.map((m) => m.membershipNumber);
      receipts = receipts.filter((r) => memberNumbers.includes(r.membershipNumber));
    }

    const pendingReceipts = receipts.filter((r) => r.status === "pending").length;
    const verifiedReceipts = receipts.filter((r) => r.status === "verified").length;
    const rejectedReceipts = receipts.filter((r) => r.status === "rejected").length;

    // حساب المبالغ
    const totalAmount = receipts
      .filter((r) => r.status === "verified")
      .reduce((sum, r) => sum + r.amount, 0);

    // إحصائيات حسب نوع الاشتراك
    const byType = {
      type_1: members.filter((m) => m.subscriptionType === "type_1").length,
      type_2: members.filter((m) => m.subscriptionType === "type_2").length,
      type_3: members.filter((m) => m.subscriptionType === "type_3").length,
      type_4: members.filter((m) => m.subscriptionType === "type_4").length,
    };

    // إحصائيات حسب الولاية - مصفوفة بدلاً من كائن
    const wilayaMap = new Map<string, { total: number; paid: number }>();
    members.forEach((m) => {
      if (!wilayaMap.has(m.wilaya)) {
        wilayaMap.set(m.wilaya, { total: 0, paid: 0 });
      }
      const s = wilayaMap.get(m.wilaya)!;
      s.total++;
      if (m.subscriptionPaid && m.subscriptionYear === currentYear) {
        s.paid++;
      }
    });
    const byWilaya = Array.from(wilayaMap.entries()).map(([w, s]) => ({
      wilaya: w, total: s.total, paid: s.paid,
    }));

    return {
      year: currentYear,
      totalMembers,
      membersWithSubscription: membersWithSubscription.length,
      paidMembers: paidMembers.length,
      unpaidMembers: membersWithSubscription.length - paidMembers.length,
      paymentRate: membersWithSubscription.length > 0 
        ? Math.round((paidMembers.length / membersWithSubscription.length) * 100) 
        : 0,
      pendingReceipts,
      verifiedReceipts,
      rejectedReceipts,
      totalAmount,
      byType,
      byWilaya,
    };
  },
});

// الحصول على قائمة المنخرطين الذين لم يسددوا
export const getUnpaidMembers = query({
  args: {
    year: v.optional(v.number()),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentYear = args.year || new Date().getFullYear();

    let members = await ctx.db.query("members").collect();

    // تصفية حسب الولاية
    if (args.wilaya) {
      members = members.filter((m) => m.wilaya === args.wilaya);
    }

    // المنخرطين الذين لديهم اشتراك ولم يسددوا
    const unpaidMembers = members.filter(
      (m) => m.subscriptionType && (!m.subscriptionPaid || m.subscriptionYear !== currentYear)
    );

    return unpaidMembers.map((m) => ({
      membershipNumber: m.membershipNumber,
      firstName: m.firstName,
      lastName: m.lastName,
      wilaya: m.wilaya,
      baladiya: m.baladiya,
      phone: m.phone,
      subscriptionType: m.subscriptionType,
    }));
  },
});

// الحصول على قائمة المنخرطين الذين سددوا
export const getPaidMembers = query({
  args: {
    year: v.optional(v.number()),
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentYear = args.year || new Date().getFullYear();

    let members = await ctx.db.query("members").collect();

    // تصفية حسب الولاية
    if (args.wilaya) {
      members = members.filter((m) => m.wilaya === args.wilaya);
    }

    // المنخرطين الذين سددوا
    const paidMembers = members.filter(
      (m) => m.subscriptionPaid && m.subscriptionYear === currentYear
    );

    return Promise.all(
      paidMembers.map(async (m) => {
        const receipt = await ctx.db
          .query("subscriptionReceipts")
          .withIndex("by_membership_and_year", (q) => 
            q.eq("membershipNumber", m.membershipNumber).eq("year", currentYear)
          )
          .unique();

        return {
          membershipNumber: m.membershipNumber,
          firstName: m.firstName,
          lastName: m.lastName,
          wilaya: m.wilaya,
          baladiya: m.baladiya,
          phone: m.phone,
          subscriptionType: m.subscriptionType,
          paidAt: m.subscriptionPaidAt,
          receiptUrl: receipt ? await ctx.storage.getUrl(receipt.storageId) : null,
        };
      })
    );
  },
});

// تأكيد تسديد الاشتراك يدوياً (للمسؤول)
export const confirmPaymentManually = mutation({
  args: {
    membershipNumber: v.string(),
    adminUsername: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .unique();

    if (!member) {
      throw new Error("المنخرط غير موجود");
    }

    await ctx.db.patch(member._id, {
      subscriptionPaid: true,
      subscriptionPaidAt: Date.now(),
      subscriptionYear: args.year,
    });

    return { success: true };
  },
});

// إلغاء تأكيد تسديد الاشتراك (للمسؤول)
export const cancelPaymentConfirmation = mutation({
  args: {
    membershipNumber: v.string(),
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .unique();

    if (!member) {
      throw new Error("المنخرط غير موجود");
    }

    await ctx.db.patch(member._id, {
      subscriptionPaid: false,
      subscriptionPaidAt: undefined,
      subscriptionReceiptId: undefined,
    });

    return { success: true };
  },
});

// إنشاء رابط رفع الملفات
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
