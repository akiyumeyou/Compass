import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new simulation
export const createSimulation = mutation({
  args: {
    pastThoughts: v.array(v.object({
      id: v.string(),
      category: v.union(v.literal("goal"), v.literal("value"), v.literal("dream"), v.literal("belief")),
      content: v.string(),
      importance: v.number(),
      period: v.union(v.literal("childhood"), v.literal("adolescence"), v.literal("early_adult"), v.literal("recent")),
      createdAt: v.number()
    })),
    currentThoughts: v.array(v.object({
      id: v.string(),
      category: v.union(v.literal("philosophy"), v.literal("priority"), v.literal("concern"), v.literal("aspiration")),
      content: v.string(),
      confidence: v.number(),
      stability: v.number(),
      createdAt: v.number()
    })),
    currentActivities: v.array(v.object({
      id: v.string(),
      category: v.union(
        v.literal("work"), 
        v.literal("hobby"), 
        v.literal("learning"), 
        v.literal("health"), 
        v.literal("relationship"), 
        v.literal("creative")
      ),
      name: v.string(),
      description: v.string(),
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("occasional")),
      satisfaction: v.number(),
      growthPotential: v.number(),
      timeInvestment: v.number(),
      createdAt: v.number()
    })),
    personalityTraits: v.object({
      openness: v.number(),
      conscientiousness: v.number(),
      extraversion: v.number(),
      agreeableness: v.number(),
      neuroticism: v.number()
    }),
    lifeContext: v.object({
      age: v.number(),
      location: v.string(),
      lifeStage: v.union(
        v.literal("student"), 
        v.literal("early_career"), 
        v.literal("mid_career"), 
        v.literal("senior_career"), 
        v.literal("retirement")
      ),
      majorLifeEvents: v.array(v.string()),
      socialSupport: v.number(),
      financialStability: v.number()
    }),
    result: v.object({
      targetYear: v.number(),
      overallSummary: v.string(),
      projections: v.object({
        career: v.object({
          category: v.string(),
          prediction: v.string(),
          confidence: v.number(),
          reasoning: v.array(v.string()),
          potentialChallenges: v.array(v.string()),
          suggestedActions: v.array(v.string())
        }),
        relationships: v.object({
          category: v.string(),
          prediction: v.string(),
          confidence: v.number(),
          reasoning: v.array(v.string()),
          potentialChallenges: v.array(v.string()),
          suggestedActions: v.array(v.string())
        }),
        personal_growth: v.object({
          category: v.string(),
          prediction: v.string(),
          confidence: v.number(),
          reasoning: v.array(v.string()),
          potentialChallenges: v.array(v.string()),
          suggestedActions: v.array(v.string())
        }),
        lifestyle: v.object({
          category: v.string(),
          prediction: v.string(),
          confidence: v.number(),
          reasoning: v.array(v.string()),
          potentialChallenges: v.array(v.string()),
          suggestedActions: v.array(v.string())
        }),
        achievements: v.object({
          category: v.string(),
          prediction: v.string(),
          confidence: v.number(),
          reasoning: v.array(v.string()),
          potentialChallenges: v.array(v.string()),
          suggestedActions: v.array(v.string())
        })
      }),
      keyTransitions: v.array(v.object({
        year: v.number(),
        description: v.string(),
        triggers: v.array(v.string())
      })),
      riskFactors: v.array(v.string()),
      opportunities: v.array(v.string()),
      confidenceScore: v.number(),
      generatedAt: v.number()
    }),
    userId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const simulationId = await ctx.db.insert("simulations", {
      userId: args.userId,
      createdAt: now,
      targetYear: args.result.targetYear,
      pastThoughts: args.pastThoughts,
      currentThoughts: args.currentThoughts,
      currentActivities: args.currentActivities,
      personalityTraits: args.personalityTraits,
      lifeContext: args.lifeContext,
      result: args.result,
      tags: args.tags,
      isPublic: args.isPublic || false
    });
    
    return simulationId;
  }
});

// Get all simulations (for a user or public ones)
export const getSimulations = query({
  args: {
    userId: v.optional(v.string()),
    includePublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      // Get user's simulations
      return await ctx.db
        .query("simulations")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .take(50);
    } else if (args.includePublic) {
      // Get public simulations
      return await ctx.db
        .query("simulations")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .take(20);
    }
    
    return [];
  }
});

// Get a specific simulation by ID
export const getSimulation = query({
  args: { simulationId: v.id("simulations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.simulationId);
  }
});

// Delete a simulation
export const deleteSimulation = mutation({
  args: {
    simulationId: v.id("simulations"),
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const simulation = await ctx.db.get(args.simulationId);
    
    if (!simulation) {
      throw new Error("Simulation not found");
    }
    
    // Check if user owns the simulation (if userId is provided)
    if (args.userId && simulation.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.simulationId);
    return { success: true };
  }
});

// Update simulation visibility
export const updateSimulationVisibility = mutation({
  args: {
    simulationId: v.id("simulations"),
    isPublic: v.boolean(),
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const simulation = await ctx.db.get(args.simulationId);
    
    if (!simulation) {
      throw new Error("Simulation not found");
    }
    
    // Check if user owns the simulation
    if (args.userId && simulation.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.simulationId, {
      isPublic: args.isPublic
    });
    
    return { success: true };
  }
});

// Get simulation statistics
export const getSimulationStats = query({
  args: {
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let simulations;
    
    if (args.userId) {
      simulations = await ctx.db
        .query("simulations")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    } else {
      simulations = await ctx.db.query("simulations").collect();
    }
    
    const totalCount = simulations.length;
    const publicCount = simulations.filter(s => s.isPublic).length;
    
    // Calculate average confidence scores
    const avgConfidence = totalCount > 0
      ? simulations.reduce((acc, s) => acc + s.result.confidenceScore, 0) / totalCount
      : 0;
    
    // Most common life stages
    const lifeStages = simulations.reduce((acc, s) => {
      const stage = s.lifeContext.lifeStage;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCount,
      publicCount,
      privateCount: totalCount - publicCount,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      lifeStages,
      recentCount: simulations.filter(s => 
        Date.now() - s.createdAt < 30 * 24 * 60 * 60 * 1000 // Last 30 days
      ).length
    };
  }
});