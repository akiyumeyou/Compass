import SelfSimulation from './components/SelfSimulation'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>自己実現シミュレーション</h1>
        <p>過去・現在・未来をつなげて、5年後の自分を予測する</p>
      </header>
      <main>
        <SelfSimulation />
      </main>
    </div>
  )
}

export default App