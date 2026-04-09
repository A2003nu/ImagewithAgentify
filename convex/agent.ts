import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateAgent = mutation({
  args: {
    name: v.string(),
    agentId: v.string(),
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("AgentTable", {
      name: args.name,
      agentId: args.agentId,
      published: false,
      userId: args.userId,
    });

    return await ctx.db.get(id);
  },
});


export const GetUserAgents = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("AgentTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});


export const GetAgentById = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("AgentTable")
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .first();
  },
});


export const UpdateAgentDetail = mutation({
  args: {
    id: v.id("AgentTable"),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      nodes: args.nodes,
      edges: args.edges,
    });
  },
});


export const UpdateAgentToolConfigs = mutation({
  args:{
    id:v.id("AgentTable"),
    agentToolConfig:v.any()
  },
  handler:async(ctx,args)=>{
    await ctx.db.patch(args.id,{
      agentToolConfig:args.agentToolConfig
    })

    return await ctx.db.get(args.id)
  }
})

export const UpdateComplaintData = mutation({
  args:{
    id:v.id("AgentTable"),
    complaintData:v.any()
  },
  handler:async(ctx,args)=>{
    await ctx.db.patch(args.id,{
      complaintData:args.complaintData
    })

    return await ctx.db.get(args.id)
  }
})

export const DeleteAgent = mutation({
  args: {
    id: v.id("AgentTable"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});