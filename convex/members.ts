import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// دالة لتوليد رقم عضوية بالتنسيق الجديد
function generateMembershipNumber(wilayaCode: string, firstJoinYear: number, sequenceNumber: number): string {
  const wilaya = wilayaCode.padStart(2, '0');
  const year = firstJoinYear.toString();
  const sequence = sequenceNumber.toString().padStart(6, '0');
  return `${wilaya}${year}${sequence}`;
}

// دالة لاستخراج رقم الولاية من اسم الولاية
function getWilayaCode(wilayaName: string, country: string): string {
  if (country !== "الجزائر") {
    return "88";
  }
  
  const wilayaCodes: Record<string, string> = {
    "أدرار": "01", "الشلف": "02", "الأغواط": "03", "أم البواقي": "04",
    "باتنة": "05", "بجاية": "06", "بسكرة": "07", "بشار": "08",
    "البليدة": "09", "البويرة": "10", "تمنراست": "11", "تبسة": "12",
    "تلمسان": "13", "تيارت": "14", "تيزي وزو": "15", "الجزائر": "16",
    "الجلفة": "17", "جيجل": "18", "سطيف": "19", "سعيدة": "20",
    "سكيكدة": "21", "سيدي بلعباس": "22", "عنابة": "23", "قالمة": "24",
    "قسنطينة": "25", "المدية": "26", "مستغانم": "27", "المسيلة": "28",
    "معسكر": "29", "ورقلة": "30", "وهران": "31", "البيض": "32",
    "إليزي": "33", "برج بوعريريج": "34", "بومرداس": "35", "الطارف": "36",
    "تندوف": "37", "تيسمسيلت": "38", "الوادي": "39", "خنشلة": "40",
    "سوق أهراس": "41", "تيبازة": "42", "ميلة": "43", "عين الدفلى": "44",
    "النعامة": "45", "عين تموشنت": "46", "غرداية": "47", "غليزان": "48",
    "تيميمون": "49", "برج باجي مختار": "50", "أولاد جلال": "51",
    "بني عباس": "52", "عين صالح": "53", "عين قزام": "54",
    "تقرت": "55", "جانت": "56", "المغير": "57", "المنيعة": "58",
  };
  
  const wilayaNameOnly = wilayaName.split("(")[0].trim();
  return wilayaCodes[wilayaNameOnly] || "01";
}

// دالة لحساب الرقم التسلسلي التالي لولاية معينة
async function getNextSequenceNumber(ctx: any, wilayaCode: string, firstJoinYear: number): Promise<number> {
  const prefix = `${wilayaCode}${firstJoinYear}`;
  const members = await ctx.db.query("members").collect();
  const matchingMembers = members.filter((m: any) => 
    m.membershipNumber.startsWith(prefix)
  );
  
  if (matchingMembers.length === 0) {
    return 1;
  }
  
  const maxSequence = Math.max(
    ...matchingMembers.map((m: any) => {
      const sequence = m.membershipNumber.slice(-6);
      return parseInt(sequence, 10);
    })
  );
  
  return maxSequence + 1;
}

// دالة بسيطة لتشفير كلمة المرور
function hashPassword(password: string): string {
  return btoa(password);
}

// دالة للتحقق من كلمة المرور
function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// أنواع الاشتراكات مع المبالغ
const SUBSCRIPTION_AMOUNTS = {
  type_1: 1000,
  type_2: 3000,
  type_3: 10000,
  type_4: 200000,
};

// ==================== التسجيل السريع ====================
export const quickRegister = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.number(),
    birthWilaya: v.string(),
    firstJoinYear: v.number(),
    joinWilaya: v.string(),
    joinBaladiya: v.string(),
    phone: v.string(),
    password: v.string(),
    profilePhotoId: v.optional(v.id("_storage")),
    subscriptionType: v.optional(v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    )),
  },
  handler: async (ctx, args) => {
    // التحقق من عدم وجود رقم الهاتف مسبقاً
    const existingMemberByPhone = await ctx.db
      .query("members")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existingMemberByPhone) {
      throw new ConvexError("رقم الهاتف مسجل مسبقاً. إذا كنت منخرطاً سابقاً، يرجى استخدام خيار استرجاع رقم العضوية.");
    }

    // التحقق من صحة سنة الانخراط
    if (args.firstJoinYear < 1997) {
      throw new ConvexError("سنة أول انخراط يجب أن لا تكون قبل 1997");
    }
    
    if (args.firstJoinYear > new Date().getFullYear()) {
      throw new ConvexError("سنة أول انخراط لا يمكن أن تكون في المستقبل");
    }

    // التحقق من طول كلمة المرور
    if (args.password.length < 6) {
      throw new ConvexError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    // استخراج رقم الولاية
    const wilayaCode = getWilayaCode(args.joinWilaya, "الجزائر");
    
    // الحصول على الرقم التسلسلي التالي
    const sequenceNumber = await getNextSequenceNumber(ctx, wilayaCode, args.firstJoinYear);
    
    // توليد رقم العضوية
    const membershipNumber = generateMembershipNumber(wilayaCode, args.firstJoinYear, sequenceNumber);

    // تشفير كلمة المرور
    const hashedPassword = hashPassword(args.password);

    // توليد NIN مؤقت
    const tempNin = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const currentYear = new Date().getFullYear();

    await ctx.db.insert("members", {
      firstName: args.firstName,
      lastName: args.lastName,
      firstNameLatin: "-",
      lastNameLatin: "-",
      nin: tempNin,
      phone: args.phone,
      password: hashedPassword,
      country: "الجزائر",
      wilaya: args.joinWilaya,
      baladiya: args.joinBaladiya,
      address: "-",
      membershipNumber,
      joinDate: Date.now(),
      firstJoinYear: args.firstJoinYear,
      birthDate: args.birthDate,
      birthPlace: args.birthWilaya,
      profilePhotoId: args.profilePhotoId,
      status: "active",
      role: "member",
      subscriptionType: args.subscriptionType,
      subscriptionYear: args.subscriptionType ? currentYear : undefined,
    });

    // إضافة سجل الاشتراك إذا تم اختيار نوع الاشتراك
    if (args.subscriptionType) {
      await ctx.db.insert("subscriptionHistory", {
        membershipNumber,
        subscriptionType: args.subscriptionType,
        amount: SUBSCRIPTION_AMOUNTS[args.subscriptionType],
        year: currentYear,
        paidAt: Date.now(),
      });
    }

    return { success: true, membershipNumber };
  },
});

// تسجيل منخرط جديد
export const registerMember = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    firstNameLatin: v.string(),
    lastNameLatin: v.string(),
    nin: v.string(),
    phone: v.string(),
    email: v.string(),
    password: v.string(),
    country: v.optional(v.string()),
    wilaya: v.string(),
    baladiya: v.string(),
    address: v.string(),
    firstJoinYear: v.optional(v.number()),
    electoralCardNumber: v.optional(v.string()),
    electoralCardIssueDate: v.optional(v.number()),
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
    profilePhotoId: v.optional(v.id("_storage")),
    subscriptionType: v.optional(v.union(
      v.literal("type_1"),
      v.literal("type_2"),
      v.literal("type_3"),
      v.literal("type_4")
    )),
  },
  handler: async (ctx, args) => {
    // التحقق من عدم وجود رقم التعريف الوطني مسبقاً
    const existingMemberByNin = await ctx.db
      .query("members")
      .withIndex("by_nin", (q) => q.eq("nin", args.nin))
      .first();

    if (existingMemberByNin) {
      throw new ConvexError("رقم التعريف الوطني مسجل مسبقاً");
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const existingMemberByEmail = await ctx.db
      .query("members")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingMemberByEmail) {
      throw new ConvexError("البريد الإلكتروني مسجل مسبقاً");
    }

    // تحديد سنة الانخراط
    const firstJoinYear = args.firstJoinYear || new Date().getFullYear();
    
    // التحقق من صحة سنة الانخراط
    if (firstJoinYear < 1997) {
      throw new ConvexError("سنة أول انخراط يجب أن لا تكون قبل 1997");
    }
    
    if (firstJoinYear > new Date().getFullYear()) {
      throw new ConvexError("سنة أول انخراط لا يمكن أن تكون في المستقبل");
    }

    // استخراج رقم الولاية
    const wilayaCode = getWilayaCode(args.wilaya, args.country || "الجزائر");
    
    // الحصول على الرقم التسلسلي التالي
    const sequenceNumber = await getNextSequenceNumber(ctx, wilayaCode, firstJoinYear);
    
    // توليد رقم العضوية
    const membershipNumber = generateMembershipNumber(wilayaCode, firstJoinYear, sequenceNumber);

    // تشفير كلمة المرور
    const hashedPassword = hashPassword(args.password);

    const currentYear = new Date().getFullYear();

    await ctx.db.insert("members", {
      firstName: args.firstName,
      lastName: args.lastName,
      firstNameLatin: args.firstNameLatin,
      lastNameLatin: args.lastNameLatin,
      nin: args.nin,
      phone: args.phone,
      email: args.email,
      password: hashedPassword,
      country: args.country,
      wilaya: args.wilaya,
      baladiya: args.baladiya,
      address: args.address,
      membershipNumber,
      electoralCardNumber: args.electoralCardNumber,
      electoralCardIssueDate: args.electoralCardIssueDate,
      joinDate: Date.now(),
      firstJoinYear,
      gender: args.gender,
      birthDate: args.birthDate,
      birthPlace: args.birthPlace,
      educationLevel: args.educationLevel,
      profession: args.profession,
      professionDetails: args.professionDetails,
      memberType: args.memberType,
      structuralPosition: args.structuralPosition,
      administrativePosition: args.administrativePosition,
      isNationalCouncilMember: args.isNationalCouncilMember,
      position: args.position,
      profilePhotoId: args.profilePhotoId,
      status: "active",
      role: "member",
      subscriptionType: args.subscriptionType,
      subscriptionYear: args.subscriptionType ? currentYear : undefined,
    });

    // إضافة سجل الاشتراك إذا تم اختيار نوع الاشتراك
    if (args.subscriptionType) {
      await ctx.db.insert("subscriptionHistory", {
        membershipNumber,
        subscriptionType: args.subscriptionType,
        amount: SUBSCRIPTION_AMOUNTS[args.subscriptionType],
        year: currentYear,
        paidAt: Date.now(),
      });
    }

    return { success: true, membershipNumber };
  },
});

// تسجيل دخول برقم العضوية وكلمة المرور
export const loginWithMembership = mutation({
  args: {
    membershipNumber: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) =>
        q.eq("membershipNumber", args.membershipNumber)
      )
      .first();

    if (!member) {
      throw new ConvexError("رقم العضوية غير صحيح");
    }

    // التحقق من كلمة المرور
    if (!member.password || !verifyPassword(args.password, member.password)) {
      throw new ConvexError("كلمة المرور غير صحيحة");
    }

    // التحقق من حالة العضو
    if (member.status === "suspended") {
      throw new ConvexError("حسابك موقوف. يرجى التواصل مع الإدارة");
    }

    if (member.status === "inactive") {
      throw new ConvexError("حسابك غير نشط. يرجى التواصل مع الإدارة");
    }

    let profilePhotoUrl = null;
    if (member.profilePhotoId) {
      profilePhotoUrl = await ctx.storage.getUrl(member.profilePhotoId);
    }

    return {
      ...member,
      password: undefined,
      profilePhotoUrl,
      fullName: `${member.firstName} ${member.lastName}`,
      fullNameLatin: `${member.firstNameLatin} ${member.lastNameLatin}`,
    };
  },
});

// الحصول على المنخرط برقم العضوية
export const getMemberByMembershipNumber = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) =>
        q.eq("membershipNumber", args.membershipNumber)
      )
      .first();

    if (!member) return null;

    let profilePhotoUrl = null;
    if (member.profilePhotoId) {
      profilePhotoUrl = await ctx.storage.getUrl(member.profilePhotoId);
    }

    return {
      ...member,
      password: undefined,
      profilePhotoUrl,
      fullName: `${member.firstName} ${member.lastName}`,
      fullNameLatin: `${member.firstNameLatin} ${member.lastNameLatin}`,
    };
  },
});

// استرجاع رقم العضوية برقم الهاتف
export const recoverByPhone = query({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (!member) {
      return null;
    }

    return {
      membershipNumber: member.membershipNumber,
      fullName: `${member.firstName} ${member.lastName}`,
      joinDate: member.joinDate,
    };
  },
});

// استرجاع رقم العضوية برقم التعريف الوطني
export const recoverByNin = query({
  args: {
    nin: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_nin", (q) => q.eq("nin", args.nin))
      .first();

    if (!member) {
      return null;
    }

    return {
      membershipNumber: member.membershipNumber,
      fullName: `${member.firstName} ${member.lastName}`,
      joinDate: member.joinDate,
    };
  },
});

// استرجاع رقم العضوية (الدالة القديمة للتوافق)
export const recoverMembershipNumber = query({
  args: {
    nin: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_nin", (q) => q.eq("nin", args.nin))
      .first();

    if (!member || member.phone !== args.phone) {
      return null;
    }

    return {
      membershipNumber: member.membershipNumber,
      fullName: `${member.firstName} ${member.lastName}`,
      email: member.email,
    };
  },
});

// الحصول على جميع المنخرطين
export const listMembers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    wilaya: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;

    if (args.wilaya !== undefined) {
      result = await ctx.db
        .query("members")
        .withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.country !== undefined) {
      result = await ctx.db
        .query("members")
        .withIndex("by_country", (q) => q.eq("country", args.country!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("members")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const membersWithPhotos = await Promise.all(
      result.page.map(async (member) => {
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
      ...result,
      page: membersWithPhotos,
    };
  },
});

// الحصول على جميع المنخرطين (للإداريين)
export const listAllMembers = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!currentMember || currentMember.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لعرض جميع المنخرطين");
    }

    const members = await ctx.db.query("members").collect();

    const membersWithPhotos = await Promise.all(
      members.map(async (member) => {
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

    return membersWithPhotos;
  },
});

// الحصول على إحصائيات شاملة
export const getComprehensiveStats = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!currentMember || currentMember.role !== "admin") {
      throw new ConvexError("ليس لديك صلاحية لعرض الإحصائيات");
    }

    const members = await ctx.db.query("members").collect();

    // إحصائيات عامة
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "active").length;
    const maleMembers = members.filter((m) => m.gender === "male").length;
    const femaleMembers = members.filter((m) => m.gender === "female").length;

    // إحصائيات حسب الولاية
    const wilayaMap = new Map<string, number>();
    members.forEach((m) => {
      wilayaMap.set(m.wilaya, (wilayaMap.get(m.wilaya) || 0) + 1);
    });
    const wilayaStats = Array.from(wilayaMap.entries())
      .map(([wilaya, count]) => ({ wilaya, count }))
      .sort((a, b) => b.count - a.count);

    // إحصائيات حسب البلدية
    const baladiyaMap = new Map<string, number>();
    members.forEach((m) => {
      const key = `${m.wilaya} - ${m.baladiya}`;
      baladiyaMap.set(key, (baladiyaMap.get(key) || 0) + 1);
    });
    const baladiyaStats = Array.from(baladiyaMap.entries())
      .map(([baladiya, count]) => ({ baladiya, count }))
      .sort((a, b) => b.count - a.count);

    // إحصائيات حسب نوع المنخرط
    const memberTypeStats = {
      militant: members.filter((m) => m.memberType === "militant").length,
      municipal_elected: members.filter((m) => m.memberType === "municipal_elected").length,
      wilaya_elected: members.filter((m) => m.memberType === "wilaya_elected").length,
      apn_elected: members.filter((m) => m.memberType === "apn_elected").length,
      senate_elected: members.filter((m) => m.memberType === "senate_elected").length,
    };

    return {
      totalMembers,
      activeMembers,
      maleMembers,
      femaleMembers,
      wilayaStats,
      baladiyaStats,
      memberTypeStats,
    };
  },
});

// البحث عن منخرط برقم العضوية
export const findByMembershipNumber = query({
  args: {
    membershipNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) =>
        q.eq("membershipNumber", args.membershipNumber)
      )
      .first();

    if (!member) return null;

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
  },
});

// تحديث المعلومات الشخصية
export const updatePersonalInfo = mutation({
  args: {
    membershipNumber: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    firstNameLatin: v.optional(v.string()),
    lastNameLatin: v.optional(v.string()),
    nin: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    country: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    address: v.optional(v.string()),
    electoralCardNumber: v.optional(v.string()),
    electoralCardIssueDate: v.optional(v.number()),
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
    memberType: v.optional(
      v.union(
        v.literal("militant"),
        v.literal("municipal_elected"),
        v.literal("wilaya_elected"),
        v.literal("apn_elected"),
        v.literal("senate_elected")
      )
    ),
    structuralPosition: v.optional(
      v.union(
        v.literal("militant"),
        v.literal("municipal_bureau_member"),
        v.literal("wilaya_bureau_member"),
        v.literal("national_bureau_member")
      )
    ),
    administrativePosition: v.optional(
      v.union(
        v.literal("militant"),
        v.literal("municipal_secretary"),
        v.literal("wilaya_secretary")
      )
    ),
    isNationalCouncilMember: v.optional(v.boolean()),
    position: v.optional(
      v.union(
        v.literal("municipal_president"),
        v.literal("wilaya_president")
      )
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) throw new ConvexError("المنخرط غير موجود");

    const updates: any = {};
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.firstNameLatin !== undefined) updates.firstNameLatin = args.firstNameLatin;
    if (args.lastNameLatin !== undefined) updates.lastNameLatin = args.lastNameLatin;
    if (args.nin !== undefined) updates.nin = args.nin;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email;
    if (args.country !== undefined) updates.country = args.country;
    if (args.wilaya !== undefined) updates.wilaya = args.wilaya;
    if (args.baladiya !== undefined) updates.baladiya = args.baladiya;
    if (args.address !== undefined) updates.address = args.address;
    if (args.electoralCardNumber !== undefined) updates.electoralCardNumber = args.electoralCardNumber;
    if (args.electoralCardIssueDate !== undefined) updates.electoralCardIssueDate = args.electoralCardIssueDate;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.birthDate !== undefined) updates.birthDate = args.birthDate;
    if (args.birthPlace !== undefined) updates.birthPlace = args.birthPlace;
    if (args.educationLevel !== undefined) updates.educationLevel = args.educationLevel;
    if (args.profession !== undefined) updates.profession = args.profession;
    if (args.professionDetails !== undefined) updates.professionDetails = args.professionDetails;
    if (args.memberType !== undefined) updates.memberType = args.memberType;
    if (args.structuralPosition !== undefined) updates.structuralPosition = args.structuralPosition;
    if (args.administrativePosition !== undefined) updates.administrativePosition = args.administrativePosition;
    if (args.isNationalCouncilMember !== undefined) updates.isNationalCouncilMember = args.isNationalCouncilMember;
    if (args.position !== undefined) updates.position = args.position;

    await ctx.db.patch(member._id, updates);

    return { success: true, message: "تم تحديث البيانات بنجاح" };
  },
});

// تحديث الصورة الشخصية
export const updateProfilePhoto = mutation({
  args: {
    membershipNumber: v.string(),
    photoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) throw new ConvexError("المنخرط غير موجود");

    await ctx.db.patch(member._id, {
      profilePhotoId: args.photoId,
    });

    return { success: true, message: "تم تحديث الصورة بنجاح" };
  },
});

// رفع صورة
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// الحصول على رابط الصورة
export const getPhotoUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// تغيير كلمة المرور
export const changePassword = mutation({
  args: {
    membershipNumber: v.string(),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_membership", (q) => q.eq("membershipNumber", args.membershipNumber))
      .first();

    if (!member) {
      throw new ConvexError("المنخرط غير موجود");
    }

    // التحقق من كلمة المرور القديمة
    if (!member.password || !verifyPassword(args.oldPassword, member.password)) {
      throw new ConvexError("كلمة المرور القديمة غير صحيحة");
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = hashPassword(args.newPassword);

    await ctx.db.patch(member._id, {
      password: hashedPassword,
    });

    return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
  },
});
