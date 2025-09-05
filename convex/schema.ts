import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  simulations: defineTable({
    // User identification (optional for now)
    userId: v.optional(v.string()),
    
    // Simulation metadata
    createdAt: v.number(),
    targetYear: v.number(),
    
    // Past thoughts
    pastThoughts: v.array(v.object({
      id: v.string(),
      category: v.union(v.literal("goal"), v.literal("value"), v.literal("dream"), v.literal("belief")),
      content: v.string(),
      importance: v.number(),
      period: v.union(v.literal("childhood"), v.literal("adolescence"), v.literal("early_adult"), v.literal("recent")),
      createdAt: v.number()
    })),
    
    // Current thoughts
    currentThoughts: v.array(v.object({
      id: v.string(),
      category: v.union(v.literal("philosophy"), v.literal("priority"), v.literal("concern"), v.literal("aspiration")),
      content: v.string(),
      confidence: v.number(),
      stability: v.number(),
      createdAt: v.number()
    })),
    
    // Current activities
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
    
    // Personality traits
    personalityTraits: v.object({
      openness: v.number(),
      conscientiousness: v.number(),
      extraversion: v.number(),
      agreeableness: v.number(),
      neuroticism: v.number()
    }),
    
    // Life context
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
    
    // Simulation result
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
    
    // Optional tags for categorization
    tags: v.optional(v.array(v.string())),
    
    // Visibility settings
    isPublic: v.optional(v.boolean())
  }),
  
  // User profiles (for future expansion)
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
    lastActive: v.number()
  }).index("by_clerk_id", ["clerkId"])
});