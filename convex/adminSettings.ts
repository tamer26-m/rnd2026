import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// الكلمة الافتراضية للأمين العام
const DEFAULT_SPEECH = `يسعدني أن أتوجه إليكم بهذه الكلمة، معبراً عن فخري واعتزازي بانتمائكم لحزبنا العريق، حزب التجمع الوطني الديمقراطي، الذي تأسس في 21 فيفري 1997 على مبادئ راسخة من الديمقراطية والعدالة الاجتماعية والتنمية المستدامة.

إن شعارنا "معا ... رؤية و إنجاز" ليس مجرد كلمات، بل هو التزام حقيقي نحو بناء مستقبل أفضل لوطننا الحبيب الجزائر. نحن نؤمن بأن التغيير الحقيقي يبدأ من الإرادة الجماعية والعمل المشترك، ومن خلال مشاركتكم الفعالة والنشطة في الحياة السياسية.

في ظل التحديات التي تواجه بلادنا، يبقى حزبنا ملتزماً بالنضال السياسي السلمي والنزيه، ساعياً لتحقيق تطلعات الشعب الجزائري في الحرية والكرامة والازدهار. نحن نعمل جاهدين على تعزيز قيم الديمقراطية والشفافية والمساءلة في جميع مؤسسات الدولة.

أدعوكم جميعاً إلى مواصلة العمل بروح الفريق الواحد، والمساهمة الفعالة في أنشطة الحزب على جميع المستويات. كل منخرط هو سفير لقيمنا ومبادئنا، وكل جهد تبذلونه يساهم في تقوية حضورنا وتأثيرنا في المشهد السياسي الوطني.

معاً، بإذن الله، سنواصل مسيرتنا نحو تحقيق أهدافنا النبيلة، وبناء جزائر قوية ومزدهرة يفخر بها كل مواطن.

دمتم أوفياء لمبادئنا، وفقكم الله في مساعيكم، وحفظ الجزائر وشعبها.`;

// الكلمة الافتراضية للأمين العام بالإنجليزية
const DEFAULT_SPEECH_EN = `It is my pleasure to address you with this message, expressing my pride and honor in your membership in our esteemed party, the National Democratic Rally, which was founded on February 21, 1997 on solid principles of democracy, social justice and sustainable development.

Our slogan "Together ... Vision & Achievement" is not just words, but a real commitment towards building a better future for our beloved homeland Algeria. We believe that real change starts from collective will and joint work, and through your active and effective participation in political life.

In light of the challenges facing our country, our party remains committed to peaceful and honest political struggle, seeking to achieve the aspirations of the Algerian people for freedom, dignity and prosperity. We are working hard to strengthen the values of democracy, transparency and accountability in all state institutions.

I call on all of you to continue working in the spirit of one team, and to actively contribute to the party's activities at all levels. Every member is an ambassador for our values and principles, and every effort you make contributes to strengthening our presence and influence in the national political scene.

Together, God willing, we will continue our march towards achieving our noble goals, and building a strong and prosperous Algeria that every citizen is proud of.

May you remain faithful to our principles, may God grant you success in your endeavors, and may He protect Algeria and its people.`;

// الصورة الافتراضية للأمين العام
const DEFAULT_PHOTO_URL = "https://polished-pony-114.convex.cloud/api/storage/dcccd9e3-bf17-4fff-8cc0-1ab287e180ff";

// الخلفية الافتراضية لبطاقة العضوية
const DEFAULT_CARD_BACKGROUND_URL = "https://polished-pony-114.convex.cloud/api/storage/e81fb05c-0127-4644-9210-f0a3a017d5fe";

// ============ إعدادات الصفحة الرئيسية ============

export const getHomePageSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("homePageSettings").first();
    
    if (!settings) {
      return {
        heroTitle: "معا ... رؤية و إنجاز",
        heroSubtitle: "التجمع الوطني الديمقراطي - حزب سياسي تأسّس بتاريخ 21 فيفري 1997",
        heroBackgroundId: null,
        statsMembers: 50000,
        statsActivities: 1200,
        statsWilayas: 58,
        statsYears: 27,
        updatedAt: Date.now(),
        updatedBy: "system",
      };
    }

    let backgroundUrl = null;
    if (settings.heroBackgroundId) {
      backgroundUrl = await ctx.storage.getUrl(settings.heroBackgroundId);
    }

    return {
      ...settings,
      backgroundUrl,
    };
  },
});

export const updateHomePageSettings = mutation({
  args: {
    adminUsername: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    heroBackgroundId: v.optional(v.id("_storage")),
    statsMembers: v.number(),
    statsActivities: v.number(),
    statsWilayas: v.number(),
    statsYears: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditHomePage) {
      throw new ConvexError("ليس لديك صلاحية تعديل الصفحة الرئيسية");
    }

    const existing = await ctx.db.query("homePageSettings").first();

    const data = {
      heroTitle: args.heroTitle,
      heroSubtitle: args.heroSubtitle,
      heroBackgroundId: args.heroBackgroundId,
      statsMembers: args.statsMembers,
      statsActivities: args.statsActivities,
      statsWilayas: args.statsWilayas,
      statsYears: args.statsYears,
      updatedAt: Date.now(),
      updatedBy: args.adminUsername,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("homePageSettings", data);
    }
  },
});

// ============ إعدادات صفحة الأمين العام ============

export const getSecretaryGeneralSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("secretaryGeneralSettings").first();
    
    if (!settings) {
      // إرجاع قيم افتراضية مع الصورة والكلمة الحالية
      return {
        fullName: "الأمين العام لحزب التجمع الوطني الديمقراطي",
        bio: "قائد حزب التجمع الوطني الديمقراطي",
        speechContent: DEFAULT_SPEECH,
        photoId: null,
        photoUrl: DEFAULT_PHOTO_URL,
        updatedAt: Date.now(),
        updatedBy: "system",
      };
    }

    let photoUrl = settings.photoId 
      ? await ctx.storage.getUrl(settings.photoId)
      : DEFAULT_PHOTO_URL;

    return {
      ...settings,
      photoUrl,
      // إذا لم تكن هناك كلمة محفوظة، استخدم الافتراضية
      speechContent: settings.speechContent || DEFAULT_SPEECH,
    };
  },
});

export const updateSecretaryGeneralSettings = mutation({
  args: {
    adminUsername: v.string(),
    fullName: v.string(),
    bio: v.string(),
    speechContent: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditSecretaryGeneral) {
      throw new ConvexError("ليس لديك صلاحية تعديل صفحة الأمين العام");
    }

    const existing = await ctx.db.query("secretaryGeneralSettings").first();

    const data: any = {
      fullName: args.fullName,
      bio: args.bio,
      updatedAt: Date.now(),
      updatedBy: args.adminUsername,
    };

    if (args.speechContent !== undefined) {
      data.speechContent = args.speechContent;
    }

    if (args.photoId !== undefined) {
      data.photoId = args.photoId;
    }

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("secretaryGeneralSettings", data);
    }
  },
});

// ============ إعدادات صفحة الأمين العام بالإنجليزية ============

export const getSecretaryGeneralSettingsEN = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("secretaryGeneralSettingsEN").first();
    
    if (!settings) {
      return {
        fullName: "Secretary General of the National Democratic Rally",
        bio: "Leader of the National Democratic Rally Party",
        speechContent: DEFAULT_SPEECH_EN,
        updatedAt: Date.now(),
        updatedBy: "system",
      };
    }

    return {
      ...settings,
      speechContent: settings.speechContent || DEFAULT_SPEECH_EN,
    };
  },
});

export const updateSecretaryGeneralSettingsEN = mutation({
  args: {
    adminUsername: v.string(),
    fullName: v.string(),
    bio: v.string(),
    speechContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditSecretaryGeneral) {
      throw new ConvexError("ليس لديك صلاحية تعديل صفحة الأمين العام");
    }

    const existing = await ctx.db.query("secretaryGeneralSettingsEN").first();

    const data: any = {
      fullName: args.fullName,
      bio: args.bio,
      updatedAt: Date.now(),
      updatedBy: args.adminUsername,
    };

    if (args.speechContent !== undefined) {
      data.speechContent = args.speechContent;
    }

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("secretaryGeneralSettingsEN", data);
    }
  },
});

// ============ إعدادات بطاقة العضوية ============

export const getMemberCardSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("memberCardSettings").first();
    
    if (!settings) {
      return {
        backgroundId: null,
        backgroundUrl: DEFAULT_CARD_BACKGROUND_URL,
        updatedAt: Date.now(),
        updatedBy: "system",
      };
    }

    let backgroundUrl = settings.backgroundId 
      ? await ctx.storage.getUrl(settings.backgroundId)
      : DEFAULT_CARD_BACKGROUND_URL;

    return {
      ...settings,
      backgroundUrl,
    };
  },
});

export const updateMemberCardSettings = mutation({
  args: {
    adminUsername: v.string(),
    backgroundId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername))
      .first();

    if (!admin || !admin.isActive) {
      throw new ConvexError("غير مصرح لك بهذا الإجراء");
    }

    if (!admin.permissions.canEditHomePage) {
      throw new ConvexError("ليس لديك صلاحية تعديل إعدادات بطاقة العضوية");
    }

    const existing = await ctx.db.query("memberCardSettings").first();

    const data = {
      backgroundId: args.backgroundId,
      updatedAt: Date.now(),
      updatedBy: args.adminUsername,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("memberCardSettings", data);
    }
  },
});

// ============ رفع الصور ============

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
