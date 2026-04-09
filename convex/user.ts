import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
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
      });

      return await ctx.db.get(id);
    }

    return user;
  },
});