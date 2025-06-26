import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import App from "../App";

// Mockear assets para que no haya problemas de carga de imágenes en el entorno de prueba
// Esto es importante porque App renderiza Game, que usa estas imágenes.
jest.mock("../assets/Objetivo.png", () => "test-target-image");
jest.mock("../assets/Objetivo2.png", () => "test-special-target-image");
jest.mock("../assets/gun.png", () => "test-gun-image");
jest.mock("../assets/Scenario.jpeg", () => "test-scenario-image");

// La duración del juego se define aquí para ser usada en los tests
const GAME_DURATION = 30;

// Configuración global para todos los tests en este archivo
beforeEach(() => {
  jest.useFakeTimers(); // Habilita los temporizadores falsos de Jest
  jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // Mockea Math.random por defecto
});

afterEach(() => {
  jest.useRealTimers(); // Restaura los temporizadores reales de Jest
  jest.spyOn(global.Math, 'random').mockRestore(); // Restaura Math.random
});

describe("App Component - Acceptance Tests (ATDD)", () => {

  // Asumo que aquí podrían haber existido pruebas iniciales para App.jsx
  // Por ejemplo:
  test("App renders the main menu initially", () => {
    render(<App />);
    expect(screen.getByText(/Cacería en San Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  // --- 20 Nuevas Pruebas de Aceptación (ATDD) ---

  // 1. El usuario puede iniciar un nuevo juego desde el menú principal.
  test("1. User can start a new game from the main menu", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });
    // Verificar que los elementos del juego están presentes
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
  });

  // 2. El juego comienza con la puntuación y el tiempo iniciales mostrados correctamente.
  test("2. Game starts with initial score and time displayed correctly", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
  });


  // 5. Fallar un objetivo disminuye la puntuación en 1 y causa un flasheo de pantalla.
  test("5. Missing a target decreases score by 1 and causes a screen flash", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    // Primero, golpear un objetivo para tener puntuación (ej. 1)
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9);
    act(() => {
      fireEvent.click(screen.getByTestId('target-element'));
    });
    expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();

    // Simular que un objetivo escapa
    act(() => {
      fireEvent.animationEnd(screen.getByTestId('target-element'));
    });

    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    const gameContainer = screen.getByTestId('game-container');
    expect(gameContainer).toHaveClass('screen-flash');
  });

  // 6. La puntuación nunca baja de cero.
  test("6. Score never goes below zero", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();

    act(() => {
      fireEvent.animationEnd(screen.getByTestId('target-element')); // Primer fallo
    });
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();

    act(() => {
      fireEvent.animationEnd(screen.getByTestId('target-element')); // Segundo fallo
    });
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
  });

  // 7. El usuario puede pausar el juego.
  test("7. User can pause the game", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/Pausa/i));
    });
    expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();
  });

  // 8. Durante la pausa, los elementos del juego (tiempo, objetivos) dejan de moverse/actualizarse.
  test("8. During pause, game elements (time, targets) stop moving/updating", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    // Avanzar 1 segundo para ver el tiempo decrementar
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText(/Pausa/i));
    });

    // Intentar avanzar tiempo mientras está pausado
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    // El tiempo no debería cambiar
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();

    // También podríamos verificar que el objetivo no se mueve, aunque esto es más complejo en ATDD
    // El hecho de que el tiempo no avanza es un buen indicador.
  });

  // 9. El usuario puede reanudar el juego desde la pausa.
  test("9. User can resume the game from pause", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/Pausa/i));
    });
    expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText(/Reanudar/i));
    });
    expect(screen.queryByText(/Juego en espera/i)).not.toBeInTheDocument();
    // El tiempo debería volver a avanzar
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument(); // O 28 si ya había pasado un segundo antes de pausar
  });

  // 10. El juego termina automáticamente cuando el tiempo se agota.
  test("10. Game automatically ends when time runs out", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    act(() => {
      jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000); // Avanzar un poco más de la duración
    });
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu puntuación final es:/i)).toBeInTheDocument();
  });

  // 12. El usuario puede reiniciar el juego desde la pantalla final, volviendo al menú principal.
  test("12. User can restart the game from the end screen, returning to main menu", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    // Terminar el juego
    act(() => {
      jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
    });
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
    });
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument(); // Regresar al menú
  });

  // 13. El estado del juego (puntuación, tiempo) se restablece al iniciar un nuevo juego (después de reiniciar).
  test("13. Game state (score, time) resets when a new game starts (after restart)", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    // Simular alguna puntuación
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9);
    act(() => {
      fireEvent.click(screen.getByTestId('target-element'));
    });
    expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();

    // Terminar el juego
    act(() => {
      jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
    });
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();

    // Reiniciar el juego
    act(() => {
      fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i)); // Iniciar de nuevo
    });

    // Verificar que la puntuación y el tiempo se han restablecido
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
  });

  // 14. El usuario puede acceder y ver las instrucciones del juego.
  test("14. User can access and view game instructions", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByTestId('instructions-button'));
    });
    expect(screen.getByText(/Instrucciones de Cacería en San Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 Punto/i)).toBeInTheDocument();
  });

  // 15. El usuario puede cerrar las instrucciones y regresar al menú principal.
  test("15. User can close instructions and return to the main menu", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByTestId('instructions-button'));
    });
    expect(screen.getByText(/Instrucciones de Cacería en San Juan/i)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText(/¡Entendido!/i));
    });
    expect(screen.queryByText(/Instrucciones de Cacería en San Juan/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  // 16. El cursor de la pistola sigue el movimiento del ratón dentro del área de juego.
  test("16. Gun cursor follows mouse movement within the game area", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    const gun = screen.getByTestId('gun-element');
    const initialTransform = gun.style.transform || '';

    act(() => {
      fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });
    });

    const newTransform = gun.style.transform;
    expect(newTransform).not.toBe(initialTransform);
    expect(newTransform).toMatch(/translateX\(-?\d+(\.\d+)?px\)/);
    expect(newTransform).toMatch(/translateY\(-?\d+(\.\d+)?px\)/);
  });

  // 17. El escenario de fondo del juego es visible durante la partida.
  test("17. Game background scenario is visible during gameplay", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });
    const gameContainer = screen.getByTestId('game-container');
    const scenarioElement = gameContainer.querySelector('.scenario');
    expect(scenarioElement).toHaveStyle('background-image: url(test-scenario-image)');
  });

  // 18. La visualización del tiempo disminuye cada segundo durante el juego activo.
  test("18. Time display decrements every second during active gameplay", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Tiempo: 28/i)).toBeInTheDocument();
  });

  // 19. Ninguna interacción (clic, fallo) afecta la puntuación cuando el juego está en pausa.
  test("19. No interaction (click, miss) affects score when the game is paused", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    // Poner puntuación en 1
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9);
    act(() => {
      fireEvent.click(screen.getByTestId('target-element'));
    });
    expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText(/Pausa/i));
    });
    expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

    // Intentar clickear objetivo y simular fallo mientras está pausado
    act(() => {
      fireEvent.click(screen.getByTestId('target-element'));
      fireEvent.animationEnd(screen.getByTestId('target-element'));
    });

    expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument(); // Score no debe haber cambiado
  });

  // 20. Golpear objetivos influye en la velocidad de los objetivos subsiguientes (progresión de dificultad).
  test("20. Hitting targets influences the speed of subsequent targets (difficulty progression)", async () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Comenzar Juego/i));
    });

    const initialTarget = screen.getByTestId('target-element');
    const initialDuration = parseFloat(initialTarget.style.animationDuration);

    // Simular muchos clics para aumentar drásticamente el score
    jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Asegurar objetivos normales
    for (let i = 0; i < 15; i++) { // Aumentar score a 15
      act(() => {
        fireEvent.click(screen.getByTestId('target-element'));
      });
    }

    const currentTarget = screen.getByTestId('target-element');
    const newDuration = parseFloat(currentTarget.style.animationDuration);

    expect(newDuration).toBeLessThan(initialDuration);
    // Verificar que la duración se acerca a la mínima de 1.0s o se ha reducido significativamente
    expect(newDuration).toBeCloseTo(5.0 - (15 / 5) * 0.25); // 5.0 - 3 * 0.25 = 4.25
  });
});