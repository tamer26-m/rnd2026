import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// التحقق من صلاحيات المسؤول
async function verifyAdmin(ctx: any, adminUsername: string) {
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_username", (q: any) => q.eq("username", adminUsername))
    .first();

  if (!admin || !admin.isActive) {
    throw new ConvexError("ليس لديك صلاحية للوصول");
  }
  return admin;
}

// دالة مساعدة لإرسال الإشعارات لجميع المنخرطين
async function notifyAllMembers(
  ctx: any,
  type: "activity_created" | "activity_updated" | "gallery_image_added" | "general",
  title: string,
  message: string,
  activityId?: any,
  galleryImageId?: any
) {
  // جلب جميع المنخرطين النشطين
  const activeMembers = await ctx.db
    .query("members")
    .withIndex("by_status", (q: any) => q.eq("status", "active"))
    .collect();

  // إنشاء إشعار لكل منخرط
  for (const member of activeMembers) {
    await ctx.db.insert("notifications", {
      memberId: member._id,
      membershipNumber: member.membershipNumber,
      activityId: activityId,
      galleryImageId: galleryImageId,
      type: type,
      title: title,
      message: message,
      isRead: false,
      createdAt: Date.now(),
    });
  }

  return activeMembers.length;
}

// جلب جميع صور المعرض
export const listGalleryImages = query({
  args: {
    category: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let images;
    
    if (args.category) {
      images = await ctx.db
        .query("galleryImages")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else {
      images = await ctx.db
        .query("galleryImages")
        .withIndex("by_order")
        .collect();
    }

    // فلترة الصور النشطة فقط إذا طُلب ذلك
    if (args.activeOnly) {
      images = images.filter((img) => img.isActive);
    }

    // جلب روابط الصور
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );

    return imagesWithUrls.sort((a, b) => a.order - b.order);
  },
});

// جلب صور المعرض للإدارة
export const listGalleryImagesForAdmin = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const images = await ctx.db
      .query("galleryImages")
      .withIndex("by_order")
      .collect();

    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );

    return imagesWithUrls.sort((a, b) => a.order - b.order);
  },
});

// إضافة صورة للمعرض مع إرسال إشعارات
export const addGalleryImage = mutation({
  args: {
    adminUsername: v.string(),
    storageId: v.id("_storage"),
    title: v.string(),
    caption: v.optional(v.string()),
    category: v.union(
      v.literal("events"),
      v.literal("meetings"),
      v.literal("campaigns"),
      v.literal("general")
    ),
    sendNotification: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    // الحصول على أعلى ترتيب
    const images = await ctx.db.query("galleryImages").collect();
    const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.order)) : 0;

    const imageId = await ctx.db.insert("galleryImages", {
      storageId: args.storageId,
      title: args.title,
      caption: args.caption,
      category: args.category,
      order: maxOrder + 1,
      isActive: true,
      uploadedBy: args.adminUsername,
      uploadedAt: Date.now(),
    });

    // إرسال إشعارات لجميع المنخرطين إذا طُلب ذلك (افتراضياً: نعم)
    let notifiedCount = 0;
    if (args.sendNotification !== false) {
      notifiedCount = await notifyAllMembers(
        ctx,
        "gallery_image_added",
        "🖼️ صورة جديدة في المعرض",
        `تم إضافة صورة جديدة: ${args.title}`,
        undefined,
        imageId
      );
    }

    return { success: true, imageId, notifiedCount };
  },
});

// تحديث صورة في المعرض
export const updateGalleryImage = mutation({
  args: {
    adminUsername: v.string(),
    imageId: v.id("galleryImages"),
    title: v.optional(v.string()),
    caption: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("events"),
      v.literal("meetings"),
      v.literal("campaigns"),
      v.literal("general")
    )),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new ConvexError("الصورة غير موجودة");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.category !== undefined) updates.category = args.category;
    if (args.order !== undefined) updates.order = args.order;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.imageId, updates);

    return { success: true };
  },
});

// حذف صورة من المعرض
export const deleteGalleryImage = mutation({
  args: {
    adminUsername: v.string(),
    imageId: v.id("galleryImages"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.adminUsername);

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new ConvexError("الصورة غير موجودة");
    }

    // حذف الملف من التخزين
    await ctx.storage.delete(image.storageId);

    // حذف الإشعارات المرتبطة
    const notifications = await ctx.db.query("notifications").collect();
    for (const notif of notifications) {
      if (notif.galleryImageId === args.imageId) {
        await ctx.db.delete(notif._id);
      }
    }

    // حذف السجل من قاعدة البيانات
    await ctx.db.delete(args.imageId);

    return { success: true };
  },
});

// رفع صورة
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
