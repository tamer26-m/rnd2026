import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول المنخرطين
  members: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    firstNameLatin: v.string(),
    lastNameLatin: v.string(),
    nin: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    country: v.optional(v.string()),
    wilaya: v.string(),
    daira: v.optional(v.string()),
    baladiya: v.string(),
    address: v.string(),
    membershipNumber: v.string(),
    electoralCardNumber: v.optional(v.string()),
    electoralCardIssueDate: v.optional(v.number()),
    joinDate: v.number(),
    firstJoinYear: v.optional(v.number()),
    profilePhotoId: v.optional(v.id("_storage")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
    role: v.union(v.literal("member"), v.literal("coordinator"), v.literal("admin")),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    educationLevel: v.optional(v.union(
      v.literal("none"),
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("university"),
      v.literal("postgraduate")
    )),
    profession: v.optional(v.union(
      v.literal("unemployed"),
      v.literal("student"),
      v.literal("employee"),
      v.literal("freelancer"),
      v.literal("farmer"),
      v.literal("other")
    )),
    professionDetails: v.optional(v.string()),
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
    position: v.optional(v.union(
      v.literal("municipal_president"),
      v.literal("wilaya_president")
    )),
    userId: v.optional(v.string()),
    suspensionReason: v.optional(v.string()),
    suspensionDate: v.optional(v.number()),
    suspendedBy: v.optional(v.string()),
    lastModifiedBy: v.optional(v.string()),
    lastModifiedAt: v.optional(v.number()),
    phoneVerified: v.optional(v.boolean()),
    // حقول الاشتراك السنوي
    subscriptionType: v.optional(v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    )),
    subscriptionYear: v.optional(v.number()),
    // حالة تسديد الاشتراك
    subscriptionPaid: v.optional(v.boolean()),
    subscriptionPaidAt: v.optional(v.number()),
    subscriptionReceiptId: v.optional(v.id("_storage")),
  })
    .index("by_nin", ["nin"])
    .index("by_phone", ["phone"])
    .index("by_email", ["email"])
    .index("by_country", ["country"])
    .index("by_wilaya", ["wilaya"])
    .index("by_baladiya", ["baladiya"])
    .index("by_membership", ["membershipNumber"])
    .index("by_status", ["status"])
    .index("by_subscription_paid", ["subscriptionPaid"])
    .index("by_subscription_year", ["subscriptionYear"])
    .searchIndex("search_members", {
      searchField: "firstName",
      filterFields: ["country", "wilaya", "status"],
    }),

  // جدول السير الذاتية للمنخرطين
  memberCVs: defineTable({
    membershipNumber: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    uploadedAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_membership", ["membershipNumber"]),

  // جدول رموز التحقق OTP
  otpCodes: defineTable({
    phone: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    verified: v.boolean(),
    attempts: v.number(),
    purpose: v.union(
      v.literal("registration"),
      v.literal("password_reset"),
      v.literal("phone_change")
    ),
  })
    .index("by_phone", ["phone"])
    .index("by_phone_and_purpose", ["phone", "purpose"]),

  // جدول وثائق المنخرطين
  memberDocuments: defineTable({
    membershipNumber: v.string(),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("electoral_card")
    ),
    storageId: v.id("_storage"),
    fileName: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_membership", ["membershipNumber"])
    .index("by_membership_and_type", ["membershipNumber", "documentType"]),

  // جدول وثائق تسديد الاشتراك
  subscriptionReceipts: defineTable({
    membershipNumber: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    year: v.number(),
    subscriptionType: v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    ),
    amount: v.number(),
    uploadedAt: v.number(),
    uploadedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_membership", ["membershipNumber"])
    .index("by_year", ["year"])
    .index("by_status", ["status"])
    .index("by_membership_and_year", ["membershipNumber", "year"]),

  // جدول الأنشطة والفعاليات العامة
  activities: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    wilaya: v.string(),
    baladiya: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("conference"),
      v.literal("campaign"),
      v.literal("event"),
      v.literal("other")
    ),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
    createdBy: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_wilaya", ["wilaya"])
    .index("by_status", ["status"]),

  // جدول الأنشطة السياسية للمنخرطين
  memberPoliticalActivities: defineTable({
    membershipNumber: v.string(),
    activityType: v.union(
      v.literal("public_gathering"),
      v.literal("community_work"),
      v.literal("executive_meeting"),
      v.literal("party_meeting"),
      v.literal("electoral_campaign"),
      v.literal("media_appearance"),
      v.literal("citizen_reception"),
      v.literal("field_visit"),
      v.literal("other")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    time: v.string(),
    location: v.string(),
    wilaya: v.string(),
    baladiya: v.optional(v.string()),
    attendeesCount: v.optional(v.number()),
    notes: v.optional(v.string()),
    photoIds: v.optional(v.array(v.id("_storage"))),
    status: v.union(
      v.literal("planned"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_membership", ["membershipNumber"])
    .index("by_date", ["date"])
    .index("by_wilaya", ["wilaya"])
    .index("by_type", ["activityType"])
    .index("by_status", ["status"])
    .index("by_membership_and_date", ["membershipNumber", "date"]),

  // جدول الصور والفيديوهات
  media: defineTable({
    activityId: v.id("activities"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
    caption: v.optional(v.string()),
    uploadedBy: v.string(),
  }).index("by_activity", ["activityId"]),

  // جدول صور المعرض العام
  galleryImages: defineTable({
    storageId: v.id("_storage"),
    title: v.string(),
    caption: v.optional(v.string()),
    category: v.union(
      v.literal("events"),
      v.literal("meetings"),
      v.literal("campaigns"),
      v.literal("general")
    ),
    order: v.number(),
    isActive: v.boolean(),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_order", ["order"]),

  // جدول الإحصائيات الجغرافية
  statistics: defineTable({
    wilaya: v.string(),
    totalMembers: v.number(),
    activeMembers: v.number(),
    coordinators: v.number(),
    lastUpdated: v.number(),
  }).index("by_wilaya", ["wilaya"]),

  // جدول الإشعارات
  notifications: defineTable({
    memberId: v.optional(v.id("members")),
    membershipNumber: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
    galleryImageId: v.optional(v.id("galleryImages")),
    type: v.union(
      v.literal("activity_created"),
      v.literal("activity_updated"),
      v.literal("gallery_image_added"),
      v.literal("general")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_member", ["memberId"])
    .index("by_membership", ["membershipNumber"])
    .index("by_member_and_read", ["membershipNumber", "isRead"])
    .index("by_type", ["type"]),

  // جدول أعضاء المكتب الوطني
  nationalBureauMembers: defineTable({
    fullName: v.string(),
    position: v.string(),
    photoId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),

  // جدول المسؤولين
  admins: defineTable({
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
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  // جدول إعدادات الصفحة الرئيسية
  homePageSettings: defineTable({
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    heroBackgroundId: v.optional(v.id("_storage")),
    statsMembers: v.number(),
    statsActivities: v.number(),
    statsWilayas: v.number(),
    statsYears: v.number(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  // جدول إعدادات صفحة الأمين العام
  secretaryGeneralSettings: defineTable({
    fullName: v.string(),
    bio: v.string(),
    speechContent: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  // جدول إعدادات صفحة الأمين العام بالإنجليزية
  secretaryGeneralSettingsEN: defineTable({
    fullName: v.string(),
    bio: v.string(),
    speechContent: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  // جدول إعدادات بطاقة العضوية
  memberCardSettings: defineTable({
    backgroundId: v.optional(v.id("_storage")),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),

  // جدول سجل العمليات على المنخرطين
  memberAuditLog: defineTable({
    membershipNumber: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("suspended"),
      v.literal("activated"),
      v.literal("deleted"),
      v.literal("exported")
    ),
    performedBy: v.string(),
    performedAt: v.number(),
    details: v.optional(v.string()),
    previousData: v.optional(v.string()),
  })
    .index("by_membership", ["membershipNumber"])
    .index("by_action", ["action"])
    .index("by_performer", ["performedBy"]),

  // جدول سجل الاشتراكات السنوية
  subscriptionHistory: defineTable({
    membershipNumber: v.string(),
    subscriptionType: v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    ),
    amount: v.number(),
    year: v.number(),
    paidAt: v.number(),
  })
    .index("by_membership", ["membershipNumber"])
    .index("by_year", ["year"])
    .index("by_membership_and_year", ["membershipNumber", "year"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
