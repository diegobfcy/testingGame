import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import EndScreen from './components/EndScreen';
import './App.css'; // Importaremos los estilos específicos aquí

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'end'
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleGameEnd = (score) => {
    setFinalScore(score);
    setGameState('end');
  };

  const handleRestartGame = () => {
    setGameState('menu');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'playing':
        return <Game onGameEnd={handleGameEnd} />;
      case 'end':
        return <EndScreen score={finalScore} onRestartGame={handleRestartGame} />;
      case 'menu':
      default:
        return <MainMenu onStartGame={handleStartGame} />;
    }
  };

  return <div className="App">{renderGameState()}</div>;
}

export default App;