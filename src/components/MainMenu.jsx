import React from 'react';

function MainMenu({ onStartGame }) {
  return (
    <div className="pantalla">
      <h1 style={{color:"red"}}>Cacería en San Juan</h1>
      <p>Haz clic en los objetivos para sumar puntos.</p>
      <button onClick={onStartGame}>Comenzar Juego</button>
    </div>
  );
}

export default MainMenu;