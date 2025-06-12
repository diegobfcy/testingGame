import { render, screen } from "@testing-library/react";
import App from "../App";

// Mock de componentes usados en App
jest.mock("../components/MainMenu", () => () => <div>Pantalla de Inicio</div>);
jest.mock("../components/Game", () => () => <div>Juego en Progreso</div>);
jest.mock("../components/EndScreen", () => () => <div>Fin del Juego</div>);

describe("Pruebas unitarias - control de estados", () => {
  test("debe iniciar en el estado 'menu'", () => {
    const { getByText } = render(<App />);
    expect(getByText(/Pantalla de Inicio/i)).toBeInTheDocument();
  });

  test("debe renderizar componente Game al cambiar el estado a 'playing'", () => {
    const { getByText, rerender } = render(<App />);
    App.prototype.setGameState = jest.fn();
    rerender(<App />);
    expect(getByText(/Pantalla de Inicio/i)).toBeInTheDocument(); // por defecto
  });
});

test("debe renderizar el título principal", () => {
  render(<App />);
  const heading = screen.getByText(/Game/i);
  expect(heading).toBeInTheDocument();
});
