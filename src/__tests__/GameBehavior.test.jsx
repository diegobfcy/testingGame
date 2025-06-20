import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// Mockear componentes y assets
jest.mock("../components/MainMenu", () => ({ onStartGame }) => (
  <button onClick={onStartGame}>Iniciar Juego</button>
));

jest.mock("../components/Game", () => ({ onGameEnd }) => (
  <button onClick={() => onGameEnd(10)}>Finalizar Juego</button>
));

jest.mock("../components/EndScreen", () => ({ score, onRestartGame }) => (
  <div>
    <span>Tu puntuación final: {score}</span>
    <button onClick={onRestartGame}>Reiniciar</button>
  </div>
));

// Mockear assets
jest.mock("../assets/Objetivo.png", () => "test-target-image");
jest.mock("../assets/Objetivo2.png", () => "test-special-target-image");
jest.mock("../assets/gun.png", () => "test-gun-image");
jest.mock("../assets/Scenario.jpeg", () => "test-scenario-image");

describe("Escenarios de comportamiento", () => {
  test("flujo completo de juego: inicio → juego → fin → reinicio", () => {
    render(<App />);

    // Pantalla de inicio
    fireEvent.click(screen.getByText(/iniciar juego/i));

    // Simular finalización del juego
    fireEvent.click(screen.getByText(/finalizar juego/i));

    // Validar puntuación final
    expect(screen.getByText(/Tu puntuación final: 10/)).toBeInTheDocument();

    // Reiniciar juego
    fireEvent.click(screen.getByText(/Reiniciar/i));
    expect(screen.getByText(/iniciar juego/i)).toBeInTheDocument();
  });
});