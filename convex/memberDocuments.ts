import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// رفع وثيقة للمنخرط
export const uploadDocument = mutation({
  args: {
    membershipNumber: v.string(),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("electoral_card")
    ),
    storageId: v.id("_storage"),
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

    // حذف الوثيقة القديمة إن وجدت
    const existingDoc = await ctx.db
      .query("memberDocuments")
      .withIndex("by_membership_and_type", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("documentType", args.documentType)
      )
      .first();

    if (existingDoc) {
      // حذف الملف القديم من التخزين
      await ctx.storage.delete(existingDoc.storageId);
      // حذف السجل القديم
      await ctx.db.delete(existingDoc._id);
    }

    // إنشاء اسم الملف بناءً على رقم الانخراط ونوع الوثيقة
    const documentTypeNames: Record<string, string> = {
      national_id: "بطاقة_التعريف",
      passport: "جواز_السفر",
      electoral_card: "بطاقة_الناخب",
    };
    const fileName = `${args.membershipNumber}_${documentTypeNames[args.documentType]}_${Date.now()}`;

    // إضافة الوثيقة الجديدة
    await ctx.db.insert("memberDocuments", {
      membershipNumber: args.membershipNumber,
      documentType: args.documentType,
      storageId: args.storageId,
      fileName,
      uploadedAt: Date.now(),
    });

    return { success: true, fileName };
  },
});

// الحصول على وثائق المنخرط
export const getMemberDocuments = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("memberDocuments")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .collect();

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const url = await ctx.storage.getUrl(doc.storageId);
        return {
          ...doc,
          url,
        };
      })
    );

    return documentsWithUrls;
  },
});

// الحصول على وثيقة محددة
export const getDocument = query({
  args: {
    membershipNumber: v.string(),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("electoral_card")
    ),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("memberDocuments")
      .withIndex("by_membership_and_type", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("documentType", args.documentType)
      )
      .first();

    if (!document) return null;

    const url = await ctx.storage.getUrl(document.storageId);
    return {
      ...document,
      url,
    };
  },
});

// حذف وثيقة
export const deleteDocument = mutation({
  args: {
    membershipNumber: v.string(),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("electoral_card")
    ),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("memberDocuments")
      .withIndex("by_membership_and_type", (q) => 
        q.eq("membershipNumber", args.membershipNumber).eq("documentType", args.documentType)
      )
      .first();

    if (!document) {
      throw new ConvexError("الوثيقة غير موجودة");
    }

    // حذف الملف من التخزين
    await ctx.storage.delete(document.storageId);
    // حذف السجل
    await ctx.db.delete(document._id);

    return { success: true };
  },
});

// توليد رابط رفع
export const generateDocumentUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
