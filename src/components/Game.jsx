import React, { useState, useEffect, useCallback } from "react";

// ... (las importaciones de imágenes no cambian)
import scenarioImg from "../assets/Scenario.jpeg";
import targetImg from "../assets/Objetivo.png";
import specialTargetImg from "../assets/Objetivo2.png";
import gunImg from "../assets/gun.png";

const GAME_DURATION = 30;

function Game({ onGameEnd }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState([]);
  const [gunStyle, setGunStyle] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [isScreenFlashing, setIsScreenFlashing] = useState(false);

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
    const baseDuration = isSpecial ? 2.5 : 5.0; // Duración base (rápido vs normal)

    // 1. CÁLCULO DE VELOCIDAD DINÁMICA
    // Por cada 5 puntos, reducimos la duración en 0.25s.
    // Usamos Math.max para que la duración nunca sea demasiado baja (imposible).
    const duration = Math.max(1.0, baseDuration - Math.floor(score / 5) * 0.25);

    if (isSpecial) {
      newTarget = {
        id: Date.now(), y: Math.random() * 80, direction, image: specialTargetImg, points: 2, duration, // Ya no usamos speedClass
      };
    } else {
      newTarget = {
        id: Date.now(), y: Math.random() * 80, direction, image: targetImg, points: 1, duration, // Ya no usamos speedClass
      };
    }
    setTargets([newTarget]);
  }, [score]); // <-- Añadimos 'score' como dependencia para que la velocidad se recalcule

  useEffect(() => {
    spawnNewTarget();
  }, [spawnNewTarget]);

  const handleTargetClick = (targetClicked) => {
    if (isPaused) return;
    setScore((prevScore) => prevScore + targetClicked.points);
    spawnNewTarget();
  };

  const handleTargetMiss = () => {
    if (isPaused) return; // No penalizar si el juego está en pausa
    setScore((prevScore) => Math.max(0, prevScore - 1));
    setIsScreenFlashing(true);
    setTimeout(() => setIsScreenFlashing(false), 800);
    spawnNewTarget();
  };

  const togglePause = () => {
    setIsPaused((prevPaused) => !prevPaused);
  };

  // --- RENDERIZADO ---
  return (
    <div
      className={`
        game-container has-custom-cursor
        ${isPaused ? "paused" : ""}
        ${isScreenFlashing ? "screen-flash" : ""}
      `}
    >
      {/* 2. NUEVO MENÚ DE PAUSA SUPERPUESTO */}
      {isPaused && (
        <div className="pause-overlay">
          <h1>Juego en espera</h1>
          <button onClick={togglePause} className="resume-button">
            Reanudar
          </button>
        </div>
      )}

      <div className="info-bar">
        <div>
          <span>Puntuación: {score}</span>
          <span> </span>
          <span>Tiempo: {timeLeft}</span>
        </div>
        {/* 3. AÑADIMOS UN BOTÓN DE PAUSA EN LA BARRA SUPERIOR PARA ACTIVAR EL MENÚ */}
        <button onClick={togglePause} className="pause-button">
          Pausa
        </button>
      </div>

      <div className="scenario" style={{ backgroundImage: `url(${scenarioImg})` }}>
        {targets.map((target) => (
          <div
            key={target.id}
            className={`target ${target.direction}`} // Quitamos la clase de velocidad
            style={{
              backgroundImage: `url(${target.image})`,
              top: `${target.y}%`,
              // 4. Aplicamos la duración calculada como un estilo en línea
              animationDuration: `${target.duration}s`,
            }}
            onClick={() => handleTargetClick(target)}
            onAnimationEnd={handleTargetMiss}
          />
        ))}

        <div className="player-gun" style={{ backgroundImage: `url(${gunImg})`, ...gunStyle }} />
      </div>
    </div>
  );
}

export default Game;