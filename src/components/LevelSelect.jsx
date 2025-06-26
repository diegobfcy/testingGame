// src/components/LevelSelect.jsx

import React from 'react';

// Importa aquí los fondos de pantalla para cada nivel
import level1Bg from '../assets/backgrounds/level1.jpeg';
import level2Bg from '../assets/backgrounds/level2.jpeg';
import level3Bg from '../assets/backgrounds/level3.jpeg';
import level4Bg from '../assets/backgrounds/level4.jpeg';

import './LevelSelect.css'; // Crearemos este archivo para los estilos

// --- Estrategia de Assets y Configuración ---
// Centralizamos la configuración de cada nivel en un array de objetos.
// Esto hace que sea muy fácil añadir más niveles o modificar los existentes.
const levelConfig = [
  {
    id: 1,
    name: 'Principiante',
    description: 'Perfecto para calentar motores.',
    // La velocidad base es la duración de la animación en segundos. Menor es más rápido.
    baseSpeed: 5.0,
    specialSpeed: 2.5,
    background: level1Bg,
  },
  {
    id: 2,
    name: 'Aficionado',
    description: 'Los objetivos se mueven más rápido.',
    baseSpeed: 4.0,
    specialSpeed: 2.0,
    background: level2Bg,
  },
  {
    id: 3,
    name: 'Experto',
    description: 'Puntería y reflejos al límite.',
    baseSpeed: 3.0,
    specialSpeed: 1.5,
    background: level3Bg,
  },
  {
    id: 4,
    name: '¡Imposible!',
    description: '¿Podrás acertar a alguno?',
    baseSpeed: 2.0,
    specialSpeed: 1.0,
    background: level4Bg,
  },
];

function LevelSelect({ onLevelSelect }) {
  return (
    <div className="level-select-container">
      <h1 className="level-select-title">Selecciona la Dificultad</h1>
      <div className="levels-grid">
        {levelConfig.map((level) => (
          <div key={level.id} className="level-card">
            <img src={level.background} alt={`Fondo del ${level.name}`} className="level-preview-img" />
            <div className="level-card-body">
              <h2 className="level-name">{level.name}</h2>
              <p className="level-description">{level.description}</p>
              <button
                className="select-level-button"
                onClick={() => onLevelSelect(level)} // Pasamos toda la configuración del nivel
              >
                Elegir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LevelSelect;