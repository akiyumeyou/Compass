import React, { useState } from 'react';
import { SimulationInput, SimulationResult } from '../types';
import { SelfSimulationEngine } from '../services/simulationEngine';
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';
import DataInput from './DataInput';
import ResultDisplay from './ResultDisplay';
// import SimulationHistory from './SimulationHistory';
import './SelfSimulation.css';

const SelfSimulation: React.FC = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'result' | 'history'>('input');
  
  // Convex hooks (temporarily disabled)
  // const createSimulation = useMutation(api.simulations.createSimulation);
  // const simulations = useQuery(api.simulations.getSimulations, { includePublic: true });
  const stats = { totalCount: 0, avgConfidence: 0.0 }; // Mock data

  const handleSimulate = async (input: SimulationInput) => {
    setIsLoading(true);
    try {
      const engine = new SelfSimulationEngine();
      const simulationResult = engine.simulate(input);
      setResult(simulationResult);
      setCurrentStep('result');
      
      // Save to Convex database (temporarily disabled)
      // await createSimulation({...})
      console.log('Simulation completed:', simulationResult.targetYear);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep('input');
  };

  if (isLoading) {
    return (
      <div className="simulation-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>未来の自分をシミュレーション中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simulation-container">
      <div className="navigation-tabs">
        <button
          className={`nav-tab ${currentStep === 'input' ? 'active' : ''}`}
          onClick={() => setCurrentStep('input')}
        >
          新規シミュレーション
        </button>
        <button
          className={`nav-tab ${currentStep === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentStep('history')}
        >
          履歴
        </button>
        {stats && (
          <div className="stats-display">
            <span>総数: {stats.totalCount}</span>
            <span>平均信頼度: {stats.avgConfidence.toFixed(1)}</span>
          </div>
        )}
      </div>

      {currentStep === 'input' && (
        <DataInput onSubmit={handleSimulate} />
      )}
      {currentStep === 'result' && result && (
        <ResultDisplay 
          result={result} 
          onReset={handleReset}
        />
      )}
      {currentStep === 'history' && (
        <div className="history-placeholder">
          <h2>履歴機能</h2>
          <p>Convex データベース統合後に利用可能になります</p>
        </div>
      )}
    </div>
  );
};

export default SelfSimulation;