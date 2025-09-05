# 自己実現シミュレーション / Self-Realization Simulation Program

## Overview
過去・現在・未来をつなげて、5年後の自分を予測するWebアプリケーション

A web application that simulates your future self 5 years from now based on:
- Past thoughts about self-realization (過去の自己実現についての思考)
- Current thoughts and philosophy (現在の思想・哲学)
- Current activities and behaviors (現在の活動・行動)

## Features
- 段階的な入力フォーム (Multi-step input form)
- インテリジェントな分析アルゴリズム (Intelligent analysis algorithm)
- 5つの分野での詳細な未来予測 (Detailed future projections in 5 areas):
  - キャリア (Career)
  - 人間関係 (Relationships)
  - 個人的成長 (Personal Growth)
  - ライフスタイル (Lifestyle)
  - 達成・成果 (Achievements)
- 結果のエクスポート機能 (Export functionality)
- レスポンシブデザイン (Responsive design)

## Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build the application
- `npm run typecheck` - Run TypeScript type checking
- `npm run preview` - Preview the built application

## Project Structure
```
/
├── src/
│   ├── components/         # React components
│   │   ├── SelfSimulation.tsx    # Main simulation component
│   │   ├── DataInput.tsx         # Multi-step input form
│   │   ├── ResultDisplay.tsx     # Results visualization
│   │   └── *.css                 # Component styles
│   ├── services/          # Business logic
│   │   └── simulationEngine.ts   # Core simulation algorithm
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts              # All type definitions
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── dist/                  # Build output
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Technology Stack
- React 18 with TypeScript
- Vite for build tooling
- CSS3 with modern features (backdrop-filter, grid, flexbox)
- Responsive design for mobile and desktop

## Usage
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open http://localhost:5173 in your browser
4. Follow the 6-step input process:
   - 過去の思考 (Past Thoughts)
   - 現在の思考 (Current Thoughts)
   - 現在の活動 (Current Activities)
   - 性格特性 (Personality Traits)
   - 人生の背景 (Life Context)
   - 確認 (Confirmation)
5. Review your 5-year future simulation results
6. Export results as JSON if desired

## Development Notes
- Built with modern React patterns and hooks
- Comprehensive TypeScript typing for type safety
- Mobile-first responsive design
- Glassmorphism UI design with blur effects
- Japanese language support with fallback English
- Algorithm considers personality psychology principles