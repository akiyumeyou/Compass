import React from 'react';
import { SimulationResult } from '../types';
import './ResultDisplay.css';

interface Props {
  result: SimulationResult;
  onReset: () => void;
}

const ResultDisplay: React.FC<Props> = ({ result, onReset }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return '#4CAF50';
    if (confidence >= 3.5) return '#FF9800';
    if (confidence >= 3) return '#2196F3';
    return '#9E9E9E';
  };

  const renderProjection = (title: string, projection: any) => (
    <div className="projection-card">
      <div className="projection-header">
        <h3>{title}</h3>
        <div 
          className="confidence-badge"
          style={{ backgroundColor: getConfidenceColor(projection.confidence) }}
        >
          信頼度: {projection.confidence.toFixed(1)}/5
        </div>
      </div>
      
      <div className="projection-content">
        <div className="prediction">
          <h4>予測</h4>
          <p>{projection.prediction}</p>
        </div>
        
        <div className="reasoning">
          <h4>根拠</h4>
          <ul>
            {projection.reasoning.map((reason: string, index: number) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
        
        <div className="challenges">
          <h4>想定される課題</h4>
          <ul className="challenge-list">
            {projection.potentialChallenges.map((challenge: string, index: number) => (
              <li key={index}>{challenge}</li>
            ))}
          </ul>
        </div>
        
        <div className="actions">
          <h4>推奨アクション</h4>
          <ul className="action-list">
            {projection.suggestedActions.map((action: string, index: number) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="result-display">
      <div className="result-header">
        <h1>{result.targetYear}年の自分</h1>
        <div className="result-meta">
          <div className="overall-confidence">
            <span>総合信頼度: </span>
            <div 
              className="confidence-score"
              style={{ color: getConfidenceColor(result.confidenceScore) }}
            >
              {result.confidenceScore.toFixed(1)}/5
            </div>
          </div>
          <div className="generated-date">
            生成日時: {formatDate(result.generatedAt)}
          </div>
        </div>
      </div>

      <div className="overall-summary">
        <h2>総合的な展望</h2>
        <p>{result.overallSummary}</p>
      </div>

      <div className="projections-grid">
        {renderProjection('キャリア', result.projections.career)}
        {renderProjection('人間関係', result.projections.relationships)}
        {renderProjection('個人的成長', result.projections.personal_growth)}
        {renderProjection('ライフスタイル', result.projections.lifestyle)}
        {renderProjection('達成・成果', result.projections.achievements)}
      </div>

      <div className="key-transitions">
        <h2>重要な転換点</h2>
        <div className="timeline">
          {result.keyTransitions.map((transition, index) => (
            <div key={index} className="transition-item">
              <div className="transition-year">{transition.year}</div>
              <div className="transition-content">
                <h3>{transition.description}</h3>
                <div className="triggers">
                  <span>きっかけ: </span>
                  {transition.triggers.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="risk-and-opportunities">
        <div className="risks">
          <h2>リスク要因</h2>
          <ul>
            {result.riskFactors.map((risk, index) => (
              <li key={index} className="risk-item">{risk}</li>
            ))}
          </ul>
        </div>

        <div className="opportunities">
          <h2>機会・可能性</h2>
          <ul>
            {result.opportunities.map((opportunity, index) => (
              <li key={index} className="opportunity-item">{opportunity}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="result-actions">
        <button className="reset-button" onClick={onReset}>
          新しいシミュレーションを開始
        </button>
        
        <button 
          className="export-button"
          onClick={() => {
            const jsonData = JSON.stringify(result, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `自己実現シミュレーション_${result.targetYear}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          結果をエクスポート
        </button>
      </div>

      <div className="disclaimer">
        <p>
          ※ この結果は現在の情報に基づく予測であり、実際の未来を保証するものではありません。
          人生は多くの予期せぬ要因によって変化するため、参考程度にご利用ください。
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;