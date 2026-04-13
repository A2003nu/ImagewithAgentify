import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {

    const user = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      const id = await ctx.db.insert("UserTable", {
        name: args.name,
        email: args.email,
        token: 5000,
        credits: 5000,
        createdAt: Date.now(),
        clerkUserId: args.clerkUserId,
      });

      return await ctx.db.get(id);
    }

    if (user.credits === undefined) {
      await ctx.db.patch(user._id, {
        credits: 5000,
      });
    }

    return user;
  },
});