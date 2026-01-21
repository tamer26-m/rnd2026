import { v } from "convex/values";
import { query } from "./_generated/server";

// الحصول على جميع المنخرطين لتنزيل البطاقات
export const getMembersForCards = query({
  args: {
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    memberType: v.optional(v.string()),
    status: v.optional(v.string()),
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

    if (args.memberType) {
      members = members.filter((m) => m.memberType === args.memberType);
    }

    if (args.status) {
      members = members.filter((m) => m.status === args.status);
    } else {
      members = members.filter((m) => m.status === "active");
    }

    const membersWithPhotos = await Promise.all(
      members.map(async (member) => {
        let profilePhotoUrl = null;
        if (member.profilePhotoId) {
          profilePhotoUrl = await ctx.storage.getUrl(member.profilePhotoId);
        }
        return {
          ...member,
          password: undefined,
          profilePhotoUrl,
          fullName: `${member.lastName} ${member.firstName}`,
          fullNameLatin: `${member.lastNameLatin} ${member.firstNameLatin}`,
        };
      })
    );

    return membersWithPhotos;
  },
});

// الحصول على قائمة الولايات المتاحة
export const getAvailableWilayas = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    const wilayaSet = new Set<string>();
    
    members.forEach((m) => {
      if (m.wilaya) {
        wilayaSet.add(m.wilaya);
      }
    });

    return Array.from(wilayaSet).sort();
  },
});

// الحصول على قائمة البلديات حسب الولاية
export const getAvailableBaladiyas = query({
  args: {
    wilaya: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let members;
    
    if (args.wilaya) {
      members = await ctx.db
        .query("members")
        .withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!))
        .collect();
    } else {
      members = await ctx.db.query("members").collect();
    }
    
    const baladiyaSet = new Set<string>();
    
    members.forEach((m) => {
      if (m.baladiya) {
        baladiyaSet.add(m.baladiya);
      }
    });

    return Array.from(baladiyaSet).sort();
  },
});

// الحصول على إحصائيات للتنزيل
export const getDownloadStats = query({
  args: {
    wilaya: v.optional(v.string()),
    baladiya: v.optional(v.string()),
    memberType: v.optional(v.string()),
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

    const activeMembers = members.filter((m) => m.status === "active");

    return {
      total: activeMembers.length,
      withPhoto: activeMembers.filter((m) => m.profilePhotoId).length,
      withoutPhoto: activeMembers.filter((m) => !m.profilePhotoId).length,
    };
  },
});
