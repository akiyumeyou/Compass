import React, { useState } from 'react';
import { SimulationInput, PastThought, CurrentThought, CurrentActivity, PersonalityTrait, LifeContext } from '../types';
import './DataInput.css';

interface Props {
  onSubmit: (data: SimulationInput) => void;
}

const DataInput: React.FC<Props> = ({ onSubmit }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [pastThoughts, setPastThoughts] = useState<PastThought[]>([]);
  const [currentThoughts, setCurrentThoughts] = useState<CurrentThought[]>([]);
  const [currentActivities, setCurrentActivities] = useState<CurrentActivity[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait>({
    openness: 3,
    conscientiousness: 3,
    extraversion: 3,
    agreeableness: 3,
    neuroticism: 3
  });
  const [lifeContext, setLifeContext] = useState<LifeContext>({
    age: 25,
    location: '',
    lifeStage: 'early_career',
    majorLifeEvents: [],
    socialSupport: 3,
    financialStability: 3
  });

  const sections = [
    '過去の思考',
    '現在の思考',
    '現在の活動',
    '性格特性',
    '人生の背景',
    '確認'
  ];

  const addPastThought = () => {
    const newThought: PastThought = {
      id: Date.now().toString(),
      category: 'goal',
      content: '',
      importance: 3,
      period: 'recent',
      createdAt: new Date()
    };
    setPastThoughts([...pastThoughts, newThought]);
  };

  const addCurrentThought = () => {
    const newThought: CurrentThought = {
      id: Date.now().toString(),
      category: 'philosophy',
      content: '',
      confidence: 3,
      stability: 3,
      createdAt: new Date()
    };
    setCurrentThoughts([...currentThoughts, newThought]);
  };

  const addActivity = () => {
    const newActivity: CurrentActivity = {
      id: Date.now().toString(),
      category: 'work',
      name: '',
      description: '',
      frequency: 'weekly',
      satisfaction: 3,
      growthPotential: 3,
      timeInvestment: 1,
      createdAt: new Date()
    };
    setCurrentActivities([...currentActivities, newActivity]);
  };

  const handleSubmit = () => {
    const data: SimulationInput = {
      pastThoughts,
      currentThoughts,
      currentActivities,
      personalityTraits,
      lifeContext
    };
    onSubmit(data);
  };

  const renderPastThoughtsSection = () => (
    <div className="section">
      <h2>過去の思考・価値観</h2>
      <p>自己実現について過去に考えていたことを入力してください</p>
      
      {pastThoughts.map((thought, index) => (
        <div key={thought.id} className="item-card">
          <select 
            value={thought.category}
            onChange={(e) => {
              const updated = [...pastThoughts];
              updated[index].category = e.target.value as any;
              setPastThoughts(updated);
            }}
          >
            <option value="goal">目標</option>
            <option value="value">価値観</option>
            <option value="dream">夢・憧れ</option>
            <option value="belief">信念</option>
          </select>
          
          <textarea
            placeholder="具体的な内容を入力してください"
            value={thought.content}
            onChange={(e) => {
              const updated = [...pastThoughts];
              updated[index].content = e.target.value;
              setPastThoughts(updated);
            }}
          />
          
          <div className="slider-group">
            <label>重要度: {thought.importance}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={thought.importance}
              onChange={(e) => {
                const updated = [...pastThoughts];
                updated[index].importance = parseInt(e.target.value);
                setPastThoughts(updated);
              }}
            />
          </div>
          
          <select
            value={thought.period}
            onChange={(e) => {
              const updated = [...pastThoughts];
              updated[index].period = e.target.value as any;
              setPastThoughts(updated);
            }}
          >
            <option value="childhood">幼少期</option>
            <option value="adolescence">青春期</option>
            <option value="early_adult">成人初期</option>
            <option value="recent">最近</option>
          </select>
        </div>
      ))}
      
      <button type="button" onClick={addPastThought}>+ 過去の思考を追加</button>
    </div>
  );

  const renderCurrentThoughtsSection = () => (
    <div className="section">
      <h2>現在の思想・哲学</h2>
      <p>現在の考え方や人生哲学を入力してください</p>
      
      {currentThoughts.map((thought, index) => (
        <div key={thought.id} className="item-card">
          <select 
            value={thought.category}
            onChange={(e) => {
              const updated = [...currentThoughts];
              updated[index].category = e.target.value as any;
              setCurrentThoughts(updated);
            }}
          >
            <option value="philosophy">人生哲学</option>
            <option value="priority">優先事項</option>
            <option value="concern">関心事</option>
            <option value="aspiration">願望</option>
          </select>
          
          <textarea
            placeholder="現在の考えを入力してください"
            value={thought.content}
            onChange={(e) => {
              const updated = [...currentThoughts];
              updated[index].content = e.target.value;
              setCurrentThoughts(updated);
            }}
          />
          
          <div className="slider-group">
            <label>確信度: {thought.confidence}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={thought.confidence}
              onChange={(e) => {
                const updated = [...currentThoughts];
                updated[index].confidence = parseInt(e.target.value);
                setCurrentThoughts(updated);
              }}
            />
          </div>
          
          <div className="slider-group">
            <label>安定性: {thought.stability}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={thought.stability}
              onChange={(e) => {
                const updated = [...currentThoughts];
                updated[index].stability = parseInt(e.target.value);
                setCurrentThoughts(updated);
              }}
            />
          </div>
        </div>
      ))}
      
      <button type="button" onClick={addCurrentThought}>+ 現在の思考を追加</button>
    </div>
  );

  const renderActivitiesSection = () => (
    <div className="section">
      <h2>現在の活動</h2>
      <p>現在取り組んでいることを入力してください</p>
      
      {currentActivities.map((activity, index) => (
        <div key={activity.id} className="item-card">
          <select 
            value={activity.category}
            onChange={(e) => {
              const updated = [...currentActivities];
              updated[index].category = e.target.value as any;
              setCurrentActivities(updated);
            }}
          >
            <option value="work">仕事</option>
            <option value="hobby">趣味</option>
            <option value="learning">学習</option>
            <option value="health">健康</option>
            <option value="relationship">人間関係</option>
            <option value="creative">創作活動</option>
          </select>
          
          <input
            type="text"
            placeholder="活動名"
            value={activity.name}
            onChange={(e) => {
              const updated = [...currentActivities];
              updated[index].name = e.target.value;
              setCurrentActivities(updated);
            }}
          />
          
          <textarea
            placeholder="詳細説明"
            value={activity.description}
            onChange={(e) => {
              const updated = [...currentActivities];
              updated[index].description = e.target.value;
              setCurrentActivities(updated);
            }}
          />
          
          <select
            value={activity.frequency}
            onChange={(e) => {
              const updated = [...currentActivities];
              updated[index].frequency = e.target.value as any;
              setCurrentActivities(updated);
            }}
          >
            <option value="daily">毎日</option>
            <option value="weekly">毎週</option>
            <option value="monthly">毎月</option>
            <option value="occasional">時々</option>
          </select>
          
          <div className="slider-group">
            <label>満足度: {activity.satisfaction}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={activity.satisfaction}
              onChange={(e) => {
                const updated = [...currentActivities];
                updated[index].satisfaction = parseInt(e.target.value);
                setCurrentActivities(updated);
              }}
            />
          </div>
          
          <div className="slider-group">
            <label>成長可能性: {activity.growthPotential}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={activity.growthPotential}
              onChange={(e) => {
                const updated = [...currentActivities];
                updated[index].growthPotential = parseInt(e.target.value);
                setCurrentActivities(updated);
              }}
            />
          </div>
          
          <div className="slider-group">
            <label>週あたり時間: {activity.timeInvestment}時間</label>
            <input
              type="range"
              min="1"
              max="40"
              value={activity.timeInvestment}
              onChange={(e) => {
                const updated = [...currentActivities];
                updated[index].timeInvestment = parseInt(e.target.value);
                setCurrentActivities(updated);
              }}
            />
          </div>
        </div>
      ))}
      
      <button type="button" onClick={addActivity}>+ 活動を追加</button>
    </div>
  );

  const renderPersonalitySection = () => (
    <div className="section">
      <h2>性格特性</h2>
      <p>あなたの性格について、1-5の範囲で評価してください</p>
      
      <div className="personality-traits">
        <div className="slider-group">
          <label>開放性 (新しい経験への開放度): {personalityTraits.openness}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={personalityTraits.openness}
            onChange={(e) => setPersonalityTraits({
              ...personalityTraits,
              openness: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>誠実性 (責任感・計画性): {personalityTraits.conscientiousness}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={personalityTraits.conscientiousness}
            onChange={(e) => setPersonalityTraits({
              ...personalityTraits,
              conscientiousness: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>外向性 (社交性・活動性): {personalityTraits.extraversion}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={personalityTraits.extraversion}
            onChange={(e) => setPersonalityTraits({
              ...personalityTraits,
              extraversion: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>協調性 (思いやり・協力性): {personalityTraits.agreeableness}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={personalityTraits.agreeableness}
            onChange={(e) => setPersonalityTraits({
              ...personalityTraits,
              agreeableness: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>情緒不安定性 (ストレス耐性の低さ): {personalityTraits.neuroticism}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={personalityTraits.neuroticism}
            onChange={(e) => setPersonalityTraits({
              ...personalityTraits,
              neuroticism: parseInt(e.target.value)
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderLifeContextSection = () => (
    <div className="section">
      <h2>人生の背景情報</h2>
      
      <div className="context-inputs">
        <div className="input-group">
          <label>年齢</label>
          <input
            type="number"
            value={lifeContext.age}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              age: parseInt(e.target.value) || 0
            })}
          />
        </div>
        
        <div className="input-group">
          <label>居住地域</label>
          <input
            type="text"
            value={lifeContext.location}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              location: e.target.value
            })}
          />
        </div>
        
        <div className="input-group">
          <label>人生ステージ</label>
          <select
            value={lifeContext.lifeStage}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              lifeStage: e.target.value as any
            })}
          >
            <option value="student">学生</option>
            <option value="early_career">キャリア初期</option>
            <option value="mid_career">キャリア中期</option>
            <option value="senior_career">キャリア後期</option>
            <option value="retirement">退職後</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>重要な人生経験（カンマ区切り）</label>
          <input
            type="text"
            value={lifeContext.majorLifeEvents.join(', ')}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              majorLifeEvents: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>社会的サポート: {lifeContext.socialSupport}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={lifeContext.socialSupport}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              socialSupport: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div className="slider-group">
          <label>経済的安定度: {lifeContext.financialStability}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={lifeContext.financialStability}
            onChange={(e) => setLifeContext({
              ...lifeContext,
              financialStability: parseInt(e.target.value)
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmationSection = () => (
    <div className="section">
      <h2>入力内容の確認</h2>
      
      <div className="summary">
        <div className="summary-item">
          <h3>過去の思考</h3>
          <p>{pastThoughts.length}項目入力済み</p>
        </div>
        
        <div className="summary-item">
          <h3>現在の思考</h3>
          <p>{currentThoughts.length}項目入力済み</p>
        </div>
        
        <div className="summary-item">
          <h3>現在の活動</h3>
          <p>{currentActivities.length}項目入力済み</p>
        </div>
        
        <div className="summary-item">
          <h3>基本情報</h3>
          <p>年齢: {lifeContext.age}歳, {lifeContext.location}</p>
        </div>
      </div>
      
      <button 
        type="button" 
        className="simulate-button"
        onClick={handleSubmit}
        disabled={pastThoughts.length === 0 || currentThoughts.length === 0 || currentActivities.length === 0}
      >
        5年後の自分をシミュレーション開始
      </button>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderPastThoughtsSection();
      case 1: return renderCurrentThoughtsSection();
      case 2: return renderActivitiesSection();
      case 3: return renderPersonalitySection();
      case 4: return renderLifeContextSection();
      case 5: return renderConfirmationSection();
      default: return renderPastThoughtsSection();
    }
  };

  return (
    <div className="data-input">
      <div className="progress-indicator">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
            onClick={() => setCurrentSection(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{section}</div>
          </div>
        ))}
      </div>

      <div className="section-content">
        {renderCurrentSection()}
      </div>

      <div className="navigation-buttons">
        {currentSection > 0 && (
          <button
            type="button"
            className="nav-button prev"
            onClick={() => setCurrentSection(currentSection - 1)}
          >
            前へ
          </button>
        )}
        
        {currentSection < sections.length - 1 && (
          <button
            type="button"
            className="nav-button next"
            onClick={() => setCurrentSection(currentSection + 1)}
          >
            次へ
          </button>
        )}
      </div>
    </div>
  );
};

export default DataInput;