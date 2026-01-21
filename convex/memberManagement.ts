import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// التحقق من صلاحيات المسؤول
async function verifyAdminPermission(ctx: any, adminUsername: string, permission: string) {
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_username", (q: any) => q.eq("username", adminUsername))
    .first();

  if (!admin || !admin.isActive) {
    throw new ConvexError("غير مصرح لك بهذا الإجراء");
  }

  const permissions = admin.permissions as any;
  if (!permissions[permission]) {
    throw new ConvexError("ليس لديك صلاحية لهذا الإجراء");
  }

  return admin;
}

// الحصول على قائمة المنخرطين للإداريين
export const listMembersForAdmin = query({
  args: {
    adminUsername: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    wilaya: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canManageMembers");

    let allMembers;

    // تصفية حسب الحالة
    if (args.status) {
      allMembers = await ctx.db
        .query("members")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      allMembers = await ctx.db
        .query("members")
        .order("desc")
        .collect();
    }

    // تصفية إضافية حسب الولاية
    let filteredMembers = allMembers;
    if (args.wilaya) {
      filteredMembers = filteredMembers.filter(m => m.wilaya === args.wilaya);
    }

    // البحث في الاسم أو رقم العضوية
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      filteredMembers = filteredMembers.filter(m =>
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        m.membershipNumber.includes(query) ||
        m.nin.includes(query) ||
        m.phone.includes(query)
      );
    }

    // تحديد العدد
    const limit = args.limit || 50;
    const limitedMembers = filteredMembers.slice(0, limit);

    // إضافة روابط الصور
    const membersWithPhotos = await Promise.all(
      limitedMembers.map(async (member) => {
        let photoUrl = null;
        if (member.profilePhotoId) {
          photoUrl = await ctx.storage.getUrl(member.profilePhotoId);
        }
        return {
          ...member,
          password: undefined,
          photoUrl,
          fullName: `${member.firstName} ${member.lastName}`,
          fullNameLatin: `${member.firstNameLatin} ${member.lastNameLatin}`,
        };
      })
    );

    return {
      members: membersWithPhotos,
      total: filteredMembers.length,
    };
  },
});

// تحديث بيانات منخرط بواسطة الإداري
export const updateMemberByAdmin = mutation({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    firstNameLatin: v.optional(v.string()),
    lastNameLatin: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    country: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    address: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    memberType: v.optional(v.union(
      v.literal("militant"),
      v.literal("municipal_elected"),
      v.literal("wilaya_elected"),
      v.literal("apn_elected"),
      v.literal("senate_elected")
    )),
    structuralPosition: v.optional(v.union(
      v.literal("militant"),
      v.literal("municipal_bureau_member"),
      v.literal("wilaya_bureau_member"),
      v.literal("national_bureau_member")
    )),
    administrativePosition: v.optional(v.union(
      v.literal("militant"),
      v.literal("municipal_secretary"),
      v.literal("wilaya_secretary")
    )),
    isNationalCouncilMember: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("member"), v.literal("coordinator"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdminPermission(ctx, args.adminUsername, "canManageMembers");

    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    // حفظ البيانات السابقة للسجل
    const previousData = JSON.stringify({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email,
      wilaya: member.wilaya,
      status: member.status,
    });

    const updates: any = {
      lastModifiedBy: args.adminUsername,
      lastModifiedAt: Date.now(),
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.firstNameLatin !== undefined) updates.firstNameLatin = args.firstNameLatin;
    if (args.lastNameLatin !== undefined) updates.lastNameLatin = args.lastNameLatin;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email;
    if (args.country !== undefined) updates.country = args.country;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.baladiya !== undefined) updates.baladiya = args.baladiya;
    if (args.address !== undefined) updates.address = args.address;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.birthDate !== undefined) updates.birthDate = args.birthDate;
    if (args.birthPlace !== undefined) updates.birthPlace = args.birthPlace;
    if (args.memberType !== undefined) updates.memberType = args.memberType;
    if (args.structuralPosition !== undefined) updates.structuralPosition = args.structuralPosition;
    if (args.administrativePosition !== undefined) updates.administrativePosition = args.administrativePosition;
    if (args.isNationalCouncilMember !== undefined) updates.isNationalCouncilMember = args.isNationalCouncilMember;
    if (args.role !== undefined) updates.role = args.role;

    await ctx.db.patch(member._id, updates);

    // تسجيل العملية
    await ctx.db.insert("memberAuditLog", {
      membershipNumber: args.membershipNumber,
      action: "updated",
      performedBy: args.adminUsername,
      performedAt: Date.now(),
      details: "تم تحديث بيانات المنخرط",
      previousData,
    });

    return { success: true, message: "تم تحديث بيانات المنخرط بنجاح" };
  },
});

// تجميد عضوية منخرط
export const suspendMember = mutation({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdminPermission(ctx, args.adminUsername, "canSuspendMembers");

    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    if (member.status === "suspended") {
      throw new ConvexError("العضوية مجمدة بالفعل");
    }

    await ctx.db.patch(member._id, {
      status: "suspended",
      suspensionReason: args.reason,
      suspensionDate: Date.now(),
      suspendedBy: args.adminUsername,
      lastModifiedBy: args.adminUsername,
      lastModifiedAt: Date.now(),
    });

    // تسجيل العملية
    await ctx.db.insert("memberAuditLog", {
      membershipNumber: args.membershipNumber,
      action: "suspended",
      performedBy: args.adminUsername,
      performedAt: Date.now(),
      details: `سبب التجميد: ${args.reason}`,
    });

    return { success: true, message: "تم تجميد العضوية بنجاح" };
  },
});

// إعادة تفعيل عضوية منخرط
export const activateMember = mutation({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdminPermission(ctx, args.adminUsername, "canSuspendMembers");

    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    if (member.status === "active") {
      throw new ConvexError("العضوية نشطة بالفعل");
    }

    await ctx.db.patch(member._id, {
      status: "active",
      suspensionReason: undefined,
      suspensionDate: undefined,
      suspendedBy: undefined,
      lastModifiedBy: args.adminUsername,
      lastModifiedAt: Date.now(),
    });

    // تسجيل العملية
    await ctx.db.insert("memberAuditLog", {
      membershipNumber: args.membershipNumber,
      action: "activated",
      performedBy: args.adminUsername,
      performedAt: Date.now(),
      details: "تم إعادة تفعيل العضوية",
    });

    return { success: true, message: "تم إعادة تفعيل العضوية بنجاح" };
  },
});

// تصدير بيانات المنخرطين
export const exportMembersData = query({
  args: {
    adminUsername: v.string(),
    wilaya: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canExportData");

    let members = await ctx.db.query("members").collect();

    if (args.wilaya) {
      members = members.filter(m => m.wilaya === args.wilaya);
    }

    if (args.status) {
      members = members.filter(m => m.status === args.status);
    }

    // إرجاع البيانات بدون كلمات المرور
    return members.map(m => ({
      membershipNumber: m.membershipNumber,
      firstName: m.firstName,
      lastName: m.lastName,
      firstNameLatin: m.firstNameLatin,
      lastNameLatin: m.lastNameLatin,
      nin: m.nin,
      phone: m.phone,
      email: m.email,
      country: m.country,
      wilaya: m.wilaya,
      baladiya: m.baladiya,
      address: m.address,
      gender: m.gender,
      birthDate: m.birthDate,
      birthPlace: m.birthPlace,
      memberType: m.memberType,
      structuralPosition: m.structuralPosition,
      administrativePosition: m.administrativePosition,
      isNationalCouncilMember: m.isNationalCouncilMember,
      status: m.status,
      joinDate: m.joinDate,
      firstJoinYear: m.firstJoinYear,
    }));
  },
});

// الحصول على سجل العمليات
export const getMemberAuditLog = query({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canManageMembers");

    let logs;
    if (args.membershipNumber) {
      logs = await ctx.db
        .query("memberAuditLog")
        .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      logs = await ctx.db
        .query("memberAuditLog")
        .order("desc")
        .take(args.limit || 100);
    }

    return logs;
  },
});

// الحصول على إحصائيات المنخرطين
export const getMembersStats = query({
  args: {
    adminUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canViewStats");

    const members = await ctx.db.query("members").collect();

    const stats = {
      total: members.length,
      active: members.filter(m => m.status === "active").length,
      suspended: members.filter(m => m.status === "suspended").length,
      inactive: members.filter(m => m.status === "inactive").length,
      male: members.filter(m => m.gender === "male").length,
      female: members.filter(m => m.gender === "female").length,
byWilaya: [] as Array<{ wilaya: string; count: number }>,
      byMemberType: {
        militant: members.filter(m => m.memberType === "militant").length,
        municipal_elected: members.filter(m => m.memberType === "municipal_elected").length,
        wilaya_elected: members.filter(m => m.memberType === "wilaya_elected").length,
        apn_elected: members.filter(m => m.memberType === "apn_elected").length,
        senate_elected: members.filter(m => m.memberType === "senate_elected").length,
      },
    };

// إحصائيات حسب الولاية - تحويل إلى مصفوفة لتجنب مشكلة الأحرف العربية
    const wilayaCounts: Record<string, number> = {};
    members.forEach(m => {
      wilayaCounts[m.wilaya] = (wilayaCounts[m.wilaya] || 0) + 1;
    });
    
    stats.byWilaya = Object.entries(wilayaCounts).map(([wilaya, count]) => ({
      wilaya,
      count,
    }));

    return stats;
  },
});

// الحصول على تفاصيل منخرط واحد
export const getMemberDetails = query({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canManageMembers");

    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      return null;
    }

    let photoUrl = null;
    if (member.profilePhotoId) {
      photoUrl = await ctx.storage.getUrl(member.profilePhotoId);
    }

    // الحصول على سجل العمليات
    const auditLogs = await ctx.db
      .query("memberAuditLog")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .order("desc")
      .take(10);

    return {
      ...member,
      password: undefined,
      photoUrl,
      fullName: `${member.firstName} ${member.lastName}`,
      fullNameLatin: `${member.firstNameLatin} ${member.lastNameLatin}`,
      auditLogs,
    };
  },
});

// إعادة تعيين كلمة مرور منخرط
export const resetMemberPassword = mutation({
  args: {
    adminUsername: v.string(),
    membershipNumber: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdminPermission(ctx, args.adminUsername, "canManageMembers");

    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = btoa(args.newPassword);

    await ctx.db.patch(member._id, {
      password: hashedPassword,
      lastModifiedBy: args.adminUsername,
      lastModifiedAt: Date.now(),
    });

    // تسجيل العملية
    await ctx.db.insert("memberAuditLog", {
      membershipNumber: args.membershipNumber,
      action: "updated",
      performedBy: args.adminUsername,
      performedAt: Date.now(),
      details: "تم إعادة تعيين كلمة المرور",
    });

    return { success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" };
  },
});
