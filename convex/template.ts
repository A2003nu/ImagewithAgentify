import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
    createdAt: v.number(),
    userId: v.id("UserTable"),
    sourceAgentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("TemplateTable")
      .filter((q) => q.eq(q.field("sourceAgentId"), args.sourceAgentId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        nodes: args.nodes,
        edges: args.edges,
        createdAt: args.createdAt,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("TemplateTable", args);
    return id;
  },
});

export const getTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query("TemplateTable").order("desc").collect();
  },
});

export const getUserTemplates = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("TemplateTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const deleteTemplate = mutation({
  args: {
    id: v.id("TemplateTable"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getTemplateById = query({
  args: {
    id: v.id("TemplateTable"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});