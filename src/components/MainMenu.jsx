import React, { useState } from 'react';
import Instructions from './Instructions'; // Assuming Instructions.jsx is in the same directory
import './MainMenu.css'; // Link to the new CSS file

function MainMenu({ onStartGame }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="main-menu-container">
      {/* Instructions Button */}
      <button
        data-testid="instructions-button"
        className="instructions-button"
        onClick={toggleInstructions}
        aria-label="Mostrar instrucciones"
      >
        <span className="question-mark">?</span>
      </button>

      {/* Main Content */}
      <div className="menu-content">
        <h1 className="game-title">Cacería en San Juan</h1>
        <p className="game-description">Haz clic en los objetivos para sumar puntos. ¡Demuestra tu puntería!</p>
        <button onClick={onStartGame} className="start-game-button">
          Comenzar Juego
        </button>
      </div>

      {/* Conditional rendering of Instructions component */}
      {showInstructions && <Instructions onClose={toggleInstructions} />}
    </div>
  );
}

export default MainMenu;