import React from 'react';
import './Instructions.css';

// Puedes importar las imágenes de los objetivos si quieres mostrarlas en las instrucciones
import targetImg from '../assets/Objetivo.png';
import specialTargetImg from '../assets/Objetivo2.png';

function Instructions({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Instrucciones de Cacería en San Juan</h2>
        
        <p>
          ¡Bienvenido! El objetivo es simple: usa tu mira para cazar la mayor cantidad de objetivos y acumular el máximo de puntos en <strong>30 segundos</strong>.
        </p>

        <h4>Mecánicas del Juego:</h4>
        <ul>
          <li><strong>Apunta y Dispara:</strong> Mueve el ratón para controlar la mira del arma. Haz clic sobre un objetivo para sumar puntos.</li>
          <li><strong>¡No los dejes escapar!:</strong> Si un objetivo cruza la pantalla sin que le dispares, <strong>perderás 1 punto</strong> y la pantalla parpadeará.</li>
          <li><strong>Dificultad Progresiva:</strong> ¡Mantente alerta! A medida que tu puntuación aumente, los objetivos se moverán cada vez más rápido.</li>
        </ul>

        <h4>Tipos de Objetivos:</h4>
        <div className="instructions-targets">
          <div className="target-info">
            <img src={targetImg} alt="Objetivo Común" style={{width: '50px'}}/>
            <p><strong>Objetivo Común:</strong> +1 Punto</p>
          </div>
          <div className="target-info">
            <img src={specialTargetImg} alt="Objetivo Especial" style={{width: '50px'}}/>
            <p><strong>Objetivo Especial:</strong> +2 Puntos</p>
          </div>
        </div>

        <h4>Controles:</h4>
        <p>Puedes pausar y reanudar el juego en cualquier momento con el botón de <strong>"Pausa"</strong> en la esquina superior derecha.</p>
        
        <button onClick={onClose} className="close-button">¡Entendido!</button>
      </div>
    </div>
  );
}

export default Instructions;