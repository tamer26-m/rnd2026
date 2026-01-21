import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// توليد رمز OTP عشوائي من 6 أرقام
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// إرسال رمز OTP (محاكاة - في الإنتاج استخدم خدمة SMS حقيقية)
export const sendOTP = mutation({
  args: {
    phone: v.string(),
    purpose: v.union(
      v.literal("registration"),
      v.literal("password_reset"),
      v.literal("phone_change")
    ),
  },
  handler: async (ctx, args) => {
    // التحقق من صيغة رقم الهاتف
    const phoneRegex = /^(0|\+213)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(args.phone.replace(/\s/g, ""))) {
      throw new ConvexError("صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ 05 أو 06 أو 07");
    }

    // التحقق من عدم وجود رقم الهاتف مسبقاً (للتسجيل فقط)
    if (args.purpose === "registration") {
      const existingMember = await ctx.db
        .query("members")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();

      if (existingMember) {
        throw new ConvexError("رقم الهاتف مسجل مسبقاً. إذا كنت منخرطاً سابقاً، يرجى استخدام خيار استرجاع رقم العضوية.");
      }
    }

    // حذف أي رموز OTP سابقة لنفس الرقم والغرض
    const existingOTPs = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone_and_purpose", (q) => 
        q.eq("phone", args.phone).eq("purpose", args.purpose)
      )
      .collect();

    for (const otp of existingOTPs) {
      await ctx.db.delete(otp._id);
    }

    // توليد رمز OTP جديد
    const code = generateOTPCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // صالح لمدة 5 دقائق

    // حفظ رمز OTP في قاعدة البيانات
    await ctx.db.insert("otpCodes", {
      phone: args.phone,
      code,
      expiresAt,
      verified: false,
      attempts: 0,
      purpose: args.purpose,
    });

    // في الإنتاج: إرسال SMS حقيقي هنا
    // للتطوير: نعرض الرمز في الـ console
    console.log(`📱 OTP Code for ${args.phone}: ${code}`);

    return { 
      success: true, 
      message: "تم إرسال رمز التحقق إلى هاتفك",
      // للتطوير فقط - احذف هذا في الإنتاج
      devCode: code,
    };
  },
});

// التحقق من رمز OTP
export const verifyOTP = mutation({
  args: {
    phone: v.string(),
    code: v.string(),
    purpose: v.union(
      v.literal("registration"),
      v.literal("password_reset"),
      v.literal("phone_change")
    ),
  },
  handler: async (ctx, args) => {
    // البحث عن رمز OTP
    const otpRecord = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone_and_purpose", (q) => 
        q.eq("phone", args.phone).eq("purpose", args.purpose)
      )
      .first();

    if (!otpRecord) {
      throw new ConvexError("لم يتم إرسال رمز تحقق لهذا الرقم. يرجى طلب رمز جديد.");
    }

    // التحقق من عدد المحاولات
    if (otpRecord.attempts >= 5) {
      await ctx.db.delete(otpRecord._id);
      throw new ConvexError("تم تجاوز عدد المحاولات المسموح. يرجى طلب رمز جديد.");
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > otpRecord.expiresAt) {
      await ctx.db.delete(otpRecord._id);
      throw new ConvexError("انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.");
    }

    // التحقق من صحة الرمز
    if (otpRecord.code !== args.code) {
      await ctx.db.patch(otpRecord._id, {
        attempts: otpRecord.attempts + 1,
      });
      const remaining = 5 - (otpRecord.attempts + 1);
      throw new ConvexError(`رمز التحقق غير صحيح. المحاولات المتبقية: ${remaining}`);
    }

    // تحديث حالة التحقق
    await ctx.db.patch(otpRecord._id, {
      verified: true,
    });

    return { 
      success: true, 
      message: "تم التحقق من رقم الهاتف بنجاح",
    };
  },
});

// التحقق من حالة OTP (للتأكد قبل التسجيل)
export const checkOTPStatus = query({
  args: {
    phone: v.string(),
    purpose: v.union(
      v.literal("registration"),
      v.literal("password_reset"),
      v.literal("phone_change")
    ),
  },
  handler: async (ctx, args) => {
    const otpRecord = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone_and_purpose", (q) => 
        q.eq("phone", args.phone).eq("purpose", args.purpose)
      )
      .first();

    if (!otpRecord) {
      return { exists: false, verified: false };
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > otpRecord.expiresAt) {
      return { exists: true, verified: false, expired: true };
    }

    return { 
      exists: true, 
      verified: otpRecord.verified,
      expired: false,
    };
  },
});

// حذف رمز OTP بعد التسجيل الناجح
export const deleteOTP = mutation({
  args: {
    phone: v.string(),
    purpose: v.union(
      v.literal("registration"),
      v.literal("password_reset"),
      v.literal("phone_change")
    ),
  },
  handler: async (ctx, args) => {
    const otpRecords = await ctx.db
      .query("otpCodes")
      .withIndex("by_phone_and_purpose", (q) => 
        q.eq("phone", args.phone).eq("purpose", args.purpose)
      )
      .collect();

    for (const otp of otpRecords) {
      await ctx.db.delete(otp._id);
    }

    return { success: true };
  },
});
