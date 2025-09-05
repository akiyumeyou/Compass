export interface PastThought {
  id: string;
  category: 'goal' | 'value' | 'dream' | 'belief';
  content: string;
  importance: number; // 1-5 scale
  period: 'childhood' | 'adolescence' | 'early_adult' | 'recent';
  createdAt: Date;
}

export interface CurrentThought {
  id: string;
  category: 'philosophy' | 'priority' | 'concern' | 'aspiration';
  content: string;
  confidence: number; // 1-5 scale
  stability: number; // How stable/consistent this thought is (1-5)
  createdAt: Date;
}

export interface CurrentActivity {
  id: string;
  category: 'work' | 'hobby' | 'learning' | 'health' | 'relationship' | 'creative';
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  satisfaction: number; // 1-5 scale
  growthPotential: number; // 1-5 scale
  timeInvestment: number; // hours per week
  createdAt: Date;
}

export interface PersonalityTrait {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface LifeContext {
  age: number;
  location: string;
  lifeStage: 'student' | 'early_career' | 'mid_career' | 'senior_career' | 'retirement';
  majorLifeEvents: string[];
  socialSupport: number; // 1-5 scale
  financialStability: number; // 1-5 scale
}

export interface SimulationInput {
  pastThoughts: PastThought[];
  currentThoughts: CurrentThought[];
  currentActivities: CurrentActivity[];
  personalityTraits: PersonalityTrait;
  lifeContext: LifeContext;
}

export interface FutureProjection {
  category: string;
  prediction: string;
  confidence: number;
  reasoning: string[];
  potentialChallenges: string[];
  suggestedActions: string[];
}

export interface SimulationResult {
  targetYear: number;
  overallSummary: string;
  projections: {
    career: FutureProjection;
    relationships: FutureProjection;
    personal_growth: FutureProjection;
    lifestyle: FutureProjection;
    achievements: FutureProjection;
  };
  keyTransitions: {
    year: number;
    description: string;
    triggers: string[];
  }[];
  riskFactors: string[];
  opportunities: string[];
  confidenceScore: number;
  generatedAt: Date;
}