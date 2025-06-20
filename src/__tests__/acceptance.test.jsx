import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../App";

// Mockear solo los assets (los componentes se prueban de forma integrada)
jest.mock("../assets/Objetivo.png", () => "test-target-image");
jest.mock("../assets/Objetivo2.png", () => "test-special-target-image");
jest.mock("../assets/gun.png", () => "test-gun-image");
jest.mock("../assets/Scenario.jpeg", () => "test-scenario-image");

describe("Acceptance Tests - User Flows", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("As a user, I want to start a new game from the main menu", () => {
    render(<App />);
    
    // Verificar menú principal
    expect(screen.getByText(/Cacería en San Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
    
    // Iniciar juego
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    // Verificar que el juego inició
    expect(screen.getByText(/Puntuación:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
    expect(screen.getByText(/Pausa/i)).toBeInTheDocument();
  });

  test("As a user, I want to see my final score when the game ends", async () => {
    render(<App />);
    
    // Iniciar juego
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    // Avanzar el tiempo más allá de la duración del juego
    act(() => {
      jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
    });
    
    // Verificar pantalla de fin de juego
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu puntuación final es:/i)).toBeInTheDocument();
    expect(screen.getByText(/Jugar de Nuevo/i)).toBeInTheDocument();
  });

  test("As a user, I want to restart the game after it ends", async () => {
    render(<App />);
    
    // Iniciar juego
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    // Avanzar tiempo para terminar el juego
    act(() => {
      jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
    });
    
    // Verificar que estamos en la pantalla final
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();
    
    // Reiniciar juego
    fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
    
    // Verificar que volvimos al menú principal
    expect(screen.getByText(/Cacería en San Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  test("As a user, I want to pause and resume the game", () => {
    render(<App />);
    
    // Iniciar juego
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    // Pausar juego
    fireEvent.click(screen.getByText(/Pausa/i));
    expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();
    expect(screen.getByText(/Reanudar/i)).toBeInTheDocument();
    
    // Reanudar juego
    fireEvent.click(screen.getByText(/Reanudar/i));
    expect(screen.queryByText(/Juego en espera/i)).not.toBeInTheDocument();
  });
});

// Definir constante GAME_DURATION para los tests
const GAME_DURATION = 30;