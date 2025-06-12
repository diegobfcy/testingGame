import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

jest.mock("../components/MainMenu", () => (props) => (
  <button onClick={props.onStartGame}>Iniciar Juego</button>
));
jest.mock("../components/Game", () => (props) => (
  <button onClick={() => props.onGameEnd(10)}>Finalizar Juego</button>
));
jest.mock("../components/EndScreen", () => (props) => (
  <div>
    <span>Tu puntuación final: {props.score}</span>
    <button onClick={props.onRestartGame}>Reiniciar</button>
  </div>
));

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

describe("Comportamiento del juego", () => {
  test("el jugador gana puntos al hacer clic en el botón de inicio", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /iniciar/i });
    fireEvent.click(button);
    const score = screen.getByText(/Puntuación:/i);
    expect(score).toHaveTextContent("Puntuación: 1");
  });
});
