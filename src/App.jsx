// src/App.jsx

import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import Game from './components/Game';
import EndScreen from './components/EndScreen';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); 
  const [finalScore, setFinalScore] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleStartGame = () => {
    setGameState('levelSelect');
  };

  const handleLevelSelect = (levelData) => {
    setSelectedLevel(levelData);
    setGameState('playing');
  };

  const handleGameEnd = (score) => {
    setFinalScore(score);
    setGameState('end');
  };

  const handleRestartGame = () => {
    setSelectedLevel(null);
    setGameState('menu');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'levelSelect':
        return <LevelSelect onLevelSelect={handleLevelSelect} />;
      case 'playing':
        // --- AQUÍ ESTÁ EL CAMBIO ---
        // Pasamos la función 'handleRestartGame' como una nueva prop llamada 'onReturnToMenu'
        return (
          <Game
            onGameEnd={handleGameEnd}
            levelData={selectedLevel}
            onReturnToMenu={handleRestartGame} 
          />
        );
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