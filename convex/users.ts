import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByClerkId = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;
    
    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkId))
      .first();
    return user;
  },
});

export const createUserIfNotExists = mutation({
  args: { clerkId: v.string(), name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkId))
      .first();

    if (!existing) {
      const id = await ctx.db.insert("UserTable", {
        name: args.name,
        email: args.email,
        token: 0,
        credits: 5000,
        createdAt: Date.now(),
        clerkUserId: args.clerkId,
      });
      return id;
    }
    return existing._id;
  },
});

export const deductCredits = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const currentCredits = user.credits ?? 0
    if (currentCredits < args.amount) {
      throw new Error("Not enough credits");
    }

    await ctx.db.patch(user._id, {
      credits: currentCredits - args.amount,
    });
  },
});

export const addCredits = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const currentCredits = user.credits ?? 0
    await ctx.db.patch(user._id, {
      credits: currentCredits + args.amount,
    });
  },
});