// src/components/Game.jsx

import React, { useState, useEffect, useCallback } from "react";

import targetImg from "../assets/Objetivo.png";
import specialTargetImg from "../assets/Objetivo2.png";
import gunImg from "../assets/gun.png";
import './Game.css';

const GAME_DURATION = 30;

// 1. Recibimos la nueva prop 'onReturnToMenu'
function Game({ onGameEnd, levelData, onReturnToMenu }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState([]);
  const [gunStyle, setGunStyle] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [isScreenFlashing, setIsScreenFlashing] = useState(false);

  // --- El resto del código de lógica (hooks y handlers) no necesita cambios ---
  // ... (useEffect, handleMouseMove, spawnNewTarget, etc. se mantienen igual) ...

  // --- TEMPORIZADOR Y PAUSA ---
  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0) onGameEnd(score);
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onGameEnd, score, isPaused]);

  // --- CONTROL DEL RATÓN ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setGunStyle({ transform: `translateX(${moveX}px) translateY(${moveY}px)` });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- LÓGICA DE OBJETIVOS Y DIFICULTAD ---
  const spawnNewTarget = useCallback(() => {
    const direction = Math.random() < 0.5 ? "ltr" : "rtl";
    let newTarget;
    const isSpecial = Math.random() < 0.25;
    const baseDuration = isSpecial ? levelData.specialSpeed : levelData.baseSpeed;
    const duration = baseDuration;

    if (isSpecial) {
      newTarget = { id: Date.now(), y: Math.random() * 80, direction, image: specialTargetImg, points: 2, duration };
    } else {
      newTarget = { id: Date.now(), y: Math.random() * 80, direction, image: targetImg, points: 1, duration };
    }
    setTargets([newTarget]);
  }, [score, levelData]);

  useEffect(() => {
    if (levelData) {
      spawnNewTarget();
    }
  }, [spawnNewTarget, levelData]);

  const handleTargetClick = (targetClicked) => {
    if (isPaused) return;
    setScore((prevScore) => prevScore + targetClicked.points);
    spawnNewTarget();
  };

  const handleTargetMiss = () => {
    if (isPaused) return;
    setScore((prevScore) => Math.max(0, prevScore - 1));
    setIsScreenFlashing(true);
    setTimeout(() => setIsScreenFlashing(false), 800);
    spawnNewTarget();
  };

  const togglePause = () => {
    setIsPaused((prevPaused) => !prevPaused);
  };


  // --- RENDERIZADO (MODIFICADO) ---
  return (
    <div
      data-testid="game-container"
      className={`
        game-container has-custom-cursor
        ${isPaused ? "paused" : ""}
        ${isScreenFlashing ? "screen-flash" : ""}
      `}
    >
      {/* 2. Añadimos el nuevo botón en el menú de pausa */}
      {isPaused && (
        <div className="pause-overlay">
          <h1>Juego en Pausa</h1>
          <div className="pause-buttons-container">
            <button onClick={togglePause} className="resume-button">
              Reanudar
            </button>
            <button onClick={onReturnToMenu} className="return-menu-button">
              Volver al Menú
            </button>
          </div>
        </div>
      )}

      <div className="info-bar">
        <div>
          <span>Puntuación: {score}</span>
          <span> </span>
          <span>Tiempo: {timeLeft}</span>
        </div>
        <button onClick={togglePause} className="pause-button">
          Pausa
        </button>
      </div>
      
      <div className="scenario" style={{ backgroundImage: `url(${levelData?.background})` }}>
        {targets.map((target) => (
          <div
            key={target.id}
            data-testid="target-element"
            className={`target ${target.direction}`}
            style={{
              backgroundImage: `url(${target.image})`,
              top: `${target.y}%`,
              animationDuration: `${target.duration}s`,
            }}
            onClick={() => handleTargetClick(target)}
            onAnimationEnd={handleTargetMiss}
          />
        ))}

        <div 
          data-testid="gun-element"
          className="player-gun" 
          style={{ backgroundImage: `url(${gunImg})`, ...gunStyle }} 
        />
      </div>
    </div>
  );
}

export default Game;