import React, { useState } from 'react';
import Instructions from './Instructions';
import './MainMenu.css';

function MainMenu({ onStartGame }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="pantalla">
      <button className="instructions-button" onClick={toggleInstructions}>
        <span className="question-mark">?</span>
      </button>
      <h1 style={{color:"red"}}>Cacería en San Juan</h1>
      <p>Haz clic en los objetivos para sumar puntos.</p>
      <button onClick={onStartGame}>Comenzar Juego</button>

      {showInstructions && <Instructions onClose={toggleInstructions} />}
    </div>
  );
}

export default MainMenu;