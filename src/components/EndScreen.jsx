import React from 'react';

function EndScreen({ score, onRestartGame }) {
  return (
    <div className="pantalla">
      <h1>¡Juego Terminado!</h1>
      <p>Tu puntuación final es:</p>
      <span className="puntuacion-final">{score}</span>
      <button onClick={onRestartGame}>Jugar de Nuevo</button>
    </div>
  );
}

export default EndScreen;