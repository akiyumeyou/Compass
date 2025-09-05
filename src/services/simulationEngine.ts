import { SimulationInput, SimulationResult, FutureProjection } from '../types';

export class SelfSimulationEngine {

  private generateCareerProjection(input: SimulationInput): FutureProjection {
    const workActivities = input.currentActivities.filter(a => a.category === 'work');
    const learningActivities = input.currentActivities.filter(a => a.category === 'learning');
    
    const careerSatisfaction = workActivities.length > 0 ? 
      workActivities.reduce((acc, a) => acc + a.satisfaction, 0) / workActivities.length : 3;
    
    const isGrowthOriented = learningActivities.length > 0 && 
      learningActivities.some(a => a.growthPotential >= 4);

    let prediction = '';
    let confidence = 3;

    if (careerSatisfaction >= 4 && isGrowthOriented) {
      prediction = '専門性を深め、リーダーシップを発揮する役職に就いている。継続的な学習により、業界での認知度も向上している。';
      confidence = 4;
    } else if (careerSatisfaction >= 3) {
      prediction = '現在の分野で着実にスキルアップし、安定した職位を維持している。新しい挑戦にも積極的に取り組んでいる。';
      confidence = 3.5;
    } else {
      prediction = 'キャリアの転換期を経て、より満足度の高い分野に移行している可能性がある。';
      confidence = 2.5;
    }

    return {
      category: 'career',
      prediction,
      confidence,
      reasoning: [
        `現在のキャリア満足度: ${careerSatisfaction.toFixed(1)}/5`,
        `学習活動の活発度: ${learningActivities.length}項目`,
        `成長志向性: ${isGrowthOriented ? '高' : '中程度'}`
      ],
      potentialChallenges: [
        '技術の急速な変化への対応',
        'ワークライフバランスの維持',
        '市場の変動による影響'
      ],
      suggestedActions: [
        '定期的なスキルアップデート',
        'ネットワーキングの強化',
        '副業やプロジェクトでの経験拡大'
      ]
    };
  }

  private generateRelationshipProjection(input: SimulationInput): FutureProjection {
    const relationshipActivities = input.currentActivities.filter(a => a.category === 'relationship');
    const socialSupport = input.lifeContext.socialSupport;
    
    const relationshipInvestment = relationshipActivities.length > 0 ? 
      relationshipActivities.reduce((acc, a) => acc + a.timeInvestment, 0) : 0;

    let prediction = '';
    let confidence = 3;

    if (socialSupport >= 4 && relationshipInvestment >= 5) {
      prediction = '深く信頼できる人間関係を築き、コミュニティの中心的な存在となっている。家族やパートナーとの関係も非常に良好。';
      confidence = 4;
    } else if (socialSupport >= 3) {
      prediction = '適度な社交範囲を保ち、質の高い人間関係を維持している。新しい出会いにも開放的。';
      confidence = 3.5;
    } else {
      prediction = '人間関係の質を重視し、少数精鋭の深いつながりを大切にしている。';
      confidence = 3;
    }

    return {
      category: 'relationships',
      prediction,
      confidence,
      reasoning: [
        `現在の社会的サポート: ${socialSupport}/5`,
        `人間関係への時間投資: ${relationshipInvestment}時間/週`,
        `関係構築活動: ${relationshipActivities.length}項目`
      ],
      potentialChallenges: [
        '地理的な移動による関係の変化',
        '価値観の違いによる摩擦',
        '時間的制約による関係維持の困難'
      ],
      suggestedActions: [
        '定期的なコミュニケーションの維持',
        '共通の興味や活動を通じた関係深化',
        'オンラインツールを活用した関係継続'
      ]
    };
  }

  private generatePersonalGrowthProjection(input: SimulationInput): FutureProjection {
    const growthConsciousness = input.personalityTraits.conscientiousness;
    const openness = input.personalityTraits.openness;
    const learningActivities = input.currentActivities.filter(a => a.category === 'learning');
    
    const selfDevelopmentScore = (growthConsciousness + openness) / 2;
    const activelyLearning = learningActivities.length > 0;

    let prediction = '';
    let confidence = 3;

    if (selfDevelopmentScore >= 4 && activelyLearning) {
      prediction = '継続的な自己改善により、大幅な個人的成長を遂げている。新しい視点や能力を身につけ、人生に対するより深い理解を得ている。';
      confidence = 4;
    } else if (selfDevelopmentScore >= 3) {
      prediction = '着実な個人的成長を続け、自己理解が深まっている。新しい挑戦にも前向きに取り組んでいる。';
      confidence = 3.5;
    } else {
      prediction = '自分なりのペースで成長し、人生経験を通じて知恵を蓄積している。';
      confidence = 3;
    }

    return {
      category: 'personal_growth',
      prediction,
      confidence,
      reasoning: [
        `自己開発意識: ${selfDevelopmentScore.toFixed(1)}/5`,
        `学習活動の有無: ${activelyLearning ? 'あり' : 'なし'}`,
        `開放性スコア: ${openness}/5`
      ],
      potentialChallenges: [
        'モチベーションの維持',
        '時間の確保',
        '成長の停滞期の乗り越え'
      ],
      suggestedActions: [
        '定期的な自己振り返り',
        'メンターやコーチとの関係構築',
        '新しい環境や挑戦への積極的参加'
      ]
    };
  }

  private generateLifestyleProjection(input: SimulationInput): FutureProjection {
    const healthActivities = input.currentActivities.filter(a => a.category === 'health');
    const hobbyActivities = input.currentActivities.filter(a => a.category === 'hobby');
    const financialStability = input.lifeContext.financialStability;
    
    const healthFocus = healthActivities.length > 0 && 
      healthActivities.some(a => a.frequency === 'daily' || a.frequency === 'weekly');
    
    const lifeBalance = (healthActivities.length + hobbyActivities.length) / 2;

    let prediction = '';
    let confidence = 3;

    if (healthFocus && financialStability >= 4 && lifeBalance >= 2) {
      prediction = 'バランスの取れた健康的なライフスタイルを確立し、趣味や興味を追求する時間も十分に確保している。経済的安定により、選択の自由度が高い。';
      confidence = 4;
    } else if (financialStability >= 3) {
      prediction = '適度なライフスタイルを維持し、仕事とプライベートのバランスを取っている。健康管理にも配慮している。';
      confidence = 3.5;
    } else {
      prediction = '自分の価値観に基づいたシンプルながら満足度の高いライフスタイルを送っている。';
      confidence = 3;
    }

    return {
      category: 'lifestyle',
      prediction,
      confidence,
      reasoning: [
        `健康管理への取り組み: ${healthFocus ? '積極的' : '普通'}`,
        `生活バランス指数: ${lifeBalance.toFixed(1)}`,
        `経済的安定度: ${financialStability}/5`
      ],
      potentialChallenges: [
        '加齢による健康リスクの増加',
        '経済状況の変化',
        '時間管理の複雑化'
      ],
      suggestedActions: [
        '予防医学的アプローチの採用',
        '持続可能な生活習慣の確立',
        '柔軟性のある生活設計'
      ]
    };
  }

  private generateAchievementsProjection(input: SimulationInput): FutureProjection {
    const creativeActivities = input.currentActivities.filter(a => a.category === 'creative');
    const highSatisfactionActivities = input.currentActivities.filter(a => a.satisfaction >= 4);
    const conscientiousness = input.personalityTraits.conscientiousness;
    
    const achievementPotential = (highSatisfactionActivities.length * conscientiousness) / 2;

    let prediction = '';
    let confidence = 3;

    if (achievementPotential >= 4 && creativeActivities.length > 0) {
      prediction = '情熱を注げる分野で顕著な成果を上げ、周囲から認められる実績を残している。創造的な活動においても独自の表現を確立している。';
      confidence = 4;
    } else if (achievementPotential >= 3) {
      prediction = '継続的な努力により、複数の分野で着実な成果を積み重ねている。自己実現に向けて前進している。';
      confidence = 3.5;
    } else {
      prediction = '自分なりの基準で満足できる成果を得て、個人的な達成感を感じている。';
      confidence = 3;
    }

    return {
      category: 'achievements',
      prediction,
      confidence,
      reasoning: [
        `達成ポテンシャル: ${achievementPotential.toFixed(1)}/5`,
        `高満足度活動数: ${highSatisfactionActivities.length}`,
        `創造的活動への関与: ${creativeActivities.length > 0 ? 'あり' : 'なし'}`
      ],
      potentialChallenges: [
        '完璧主義による停滞',
        '外部評価への過度な依存',
        'バーンアウトのリスク'
      ],
      suggestedActions: [
        '段階的な目標設定',
        '多様な評価軸の設定',
        '持続可能な努力レベルの維持'
      ]
    };
  }

  simulate(input: SimulationInput): SimulationResult {
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + 5;

    const projections = {
      career: this.generateCareerProjection(input),
      relationships: this.generateRelationshipProjection(input),
      personal_growth: this.generatePersonalGrowthProjection(input),
      lifestyle: this.generateLifestyleProjection(input),
      achievements: this.generateAchievementsProjection(input)
    };

    const overallConfidence = Object.values(projections)
      .reduce((acc, p) => acc + p.confidence, 0) / 5;

    const keyTransitions = [
      {
        year: currentYear + 2,
        description: '専門性の深化とネットワーク拡大により、新たな機会が生まれる',
        triggers: ['スキル向上', '人脈形成', '市場の変化']
      },
      {
        year: currentYear + 4,
        description: '個人的・職業的成熟により、より大きな責任と影響力を持つ',
        triggers: ['経験の蓄積', '信頼の構築', 'リーダーシップの発揮']
      }
    ];

    return {
      targetYear,
      overallSummary: `5年後のあなたは、現在の価値観と活動を基盤として、さらに成熟した個人として成長している可能性が高い。特に${projections.career.confidence >= 4 ? 'キャリア' : projections.personal_growth.confidence >= 4 ? '個人的成長' : 'ライフスタイル'}の面で大きな発展が期待される。`,
      projections,
      keyTransitions,
      riskFactors: [
        '急激な社会情勢の変化',
        '健康問題の発生',
        '経済的な不安定要因',
        '重要な人間関係の変化'
      ],
      opportunities: [
        'テクノロジーの進歩による新たな可能性',
        'グローバル化による機会拡大',
        '人生経験の蓄積による知恵の活用',
        '多様性への理解の深化'
      ],
      confidenceScore: overallConfidence,
      generatedAt: new Date()
    };
  }
}