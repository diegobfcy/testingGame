// src/components/EndScreen.jsx

import React from 'react';
import './EndScreen.css'; // 1. Importa el nuevo archivo de estilos

function EndScreen({ score, onRestartGame }) {
  return (
    // 2. Usamos un contenedor principal para el fondo de pantalla completo
    <div className="endscreen-container">
      {/* 3. Y un contenedor interno para el contenido con efecto "glass" */}
      <div className="endscreen-content">
        <h1>¡Juego Terminado!</h1>
        <p>Tu puntuación final es:</p>
        <span className="puntuacion-final">{score}</span>
        {/* 4. Le damos una clase más específica al botón */}
        <button className="restart-button" onClick={onRestartGame}>
          Jugar de Nuevo
        </button>
      </div>
    </div>
  );
}

export default EndScreen;