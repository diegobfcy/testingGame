import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../App"; // Se importa App para los tests de flujo completo
import Game from "../components/Game"; // Se importa Game para los tests unitarios específicos

// Mockear assets para que no haya problemas de carga de imágenes en el entorno de prueba
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

describe("Game Component - Behavioral and Unit Tests", () => {

  // PRUEBAS DE COMPORTAMIENTO (BDD) - Flujos de usuario
  describe("Behavioral Scenarios (BDD)", () => {

    test("1. Flujo completo: menú → juego → fin → reinicio", async () => {
      render(<App />);

      // Menú principal
      expect(screen.getByText(/Cacería en San Juan/i)).toBeInTheDocument();
      expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();

      // Iniciar juego
      act(() => {
        fireEvent.click(screen.getByText(/Comenzar Juego/i));
      });

      // Juego
      expect(screen.getByText(/Puntuación:/i)).toBeInTheDocument();
      expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
      expect(screen.getByText(/Pausa/i)).toBeInTheDocument();

      // Finalizar juego avanzando tiempo
      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000); // Avanzar más allá de la duración del juego
      });

      // Pantalla final
      expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();
      expect(screen.getByText(/Tu puntuación final es:/i)).toBeInTheDocument();
      expect(screen.getByText(/Jugar de Nuevo/i)).toBeInTheDocument();

      // Reiniciar
      act(() => {
        fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
      });
      expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
    });

    test("2. Inicio de juego: muestra elementos iniciales correctos", async () => {
      render(<App />);
      act(() => {
        fireEvent.click(screen.getByText(/Comenzar Juego/i));
      });

      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
      expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
      expect(screen.getByText(/Pausa/i)).toBeInTheDocument();
    });

    test("3. Click en objetivo normal: incrementa puntuación en 1", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Forzar que el objetivo inicial sea normal (random > 0.25 para isSpecial = false)
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9);

      const targetElement = screen.getByTestId('target-element');
      act(() => {
        fireEvent.click(targetElement);
      });

      expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();
    });

    test("5. Objetivo no alcanzado: reduce puntuación en 1", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Primero hacer click en un objetivo normal para tener 1 punto
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9); // Para el primer objetivo
      act(() => {
        fireEvent.click(screen.getByTestId('target-element'));
      });
      expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();

      // Luego simular que el objetivo escapa
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });

      // Verificar puntuación
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    });

    test("6. Objetivo no alcanzado con puntuación 0: no baja de 0", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Asegurarse de que la puntuación inicial es 0
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();

      // Simular que el objetivo escapa (puntuación es 0)
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });
      // La puntuación debería seguir siendo 0
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();

      // Simular que otro objetivo escapa
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });
      // La puntuación debería seguir siendo 0
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    });

    test("7. Flash de pantalla al fallar objetivo", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });

      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('screen-flash');
    });

    test("8. Pausa del juego: muestra overlay de pausa", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i));
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();
      expect(screen.getByText(/Reanudar/i)).toBeInTheDocument();
    });

    test("9. Reanudar juego: oculta overlay de pausa", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i));
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument(); // Asegurarse de que está pausado

      act(() => {
        fireEvent.click(screen.getByText(/Reanudar/i));
      });
      expect(screen.queryByText(/Juego en espera/i)).not.toBeInTheDocument();
    });

    test("10. Tiempo se reduce correctamente", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        jest.advanceTimersByTime(1000); // Avanzar 1 segundo
      });

      expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
    });

    test("11. Fin del juego cuando tiempo llega a 0", async () => {
      const mockOnGameEnd = jest.fn();
      render(<Game onGameEnd={mockOnGameEnd} />);

      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000); // Avanzar más allá del tiempo de juego
      });

      expect(mockOnGameEnd).toHaveBeenCalledTimes(1); // onGameEnd debería ser llamado
    });

    test("12. Dificultad aumenta con puntuación: objetivos más rápidos", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Obtener duración inicial del objetivo (score 0)
      const initialTarget = screen.getByTestId('target-element');
      const initialDuration = parseFloat(initialTarget.style.animationDuration);

      // Aumentar puntuación a 5 clicando 5 veces un objetivo normal
      jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Asegurar objetivos normales
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(screen.getByTestId('target-element'));
        });
      }

      // Después de 5 clics, la puntuación es 5. Se debe haber generado un nuevo objetivo.
      const targetAtScore5 = screen.getByTestId('target-element');
      const newDuration = parseFloat(targetAtScore5.style.animationDuration);

      expect(screen.getByText(/Puntuación: 5/i)).toBeInTheDocument();
      expect(newDuration).toBeLessThan(initialDuration);
      // La duración para un objetivo normal a score 5 debería ser 5.0 - (5/5)*0.25 = 4.75
      expect(newDuration).toBeCloseTo(4.75);
    });

    test("13. Velocidad mínima: no baja de 1 segundo", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Aumentar puntuación a un valor alto (ej. 30) para alcanzar la velocidad mínima
      jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Asegurar objetivos normales
      for (let i = 0; i < 30; i++) { // 30 clics para un score de 30
        act(() => {
          fireEvent.click(screen.getByTestId('target-element'));
        });
      }

      const currentTarget = screen.getByTestId('target-element');
      const duration = parseFloat(currentTarget.style.animationDuration);

      expect(screen.getByText(/Puntuación: 30/i)).toBeInTheDocument();
      expect(duration).toBeGreaterThanOrEqual(1.0); // La duración mínima es 1.0s
    });

    test("15. Movimiento del arma sigue al cursor", async () => {
      render(<Game onGameEnd={jest.fn()} />);
      const gun = screen.getByTestId('gun-element');

      // Posición inicial del transform
      const initialTransform = gun.style.transform || '';

      // Simular movimiento del ratón
      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });
      });

      // Verificar que el estilo de transformación ha cambiado
      const newTransform = gun.style.transform;
      expect(newTransform).not.toBe(initialTransform);
      expect(newTransform).toMatch(/translateX/);
      expect(newTransform).toMatch(/translateY/);
    });

    test("16. Pausa detiene el temporizador", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        jest.advanceTimersByTime(1000); // Avanzar 1 segundo
      });
      expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i)); // Pausar juego
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(5000); // Intentar avanzar 5 segundos mientras está pausado
      });

      // El tiempo no debería haber cambiado
      expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
    });

    test("17. Click en objetivo durante pausa no tiene efecto", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i)); // Pausar juego
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

      // Intentar clickar en el objetivo mientras está pausado
      act(() => {
        fireEvent.click(screen.getByTestId('target-element'));
      });

      // La puntuación debería seguir siendo 0
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    });

    test("18. Objetivo que escapa durante pausa no penaliza", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i)); // Pausar juego
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

      // Simular que un objetivo escapa mientras está pausado
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });

      // La puntuación debería seguir siendo 0
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    });

    test("19. Reinicio lleva a menú principal (desde App)", async () => {
      render(<App />);

      // Iniciar juego y avanzar tiempo para terminarlo
      act(() => {
        fireEvent.click(screen.getByText(/Comenzar Juego/i));
      });
      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
      });
      expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();

      // Clicar en "Jugar de Nuevo"
      act(() => {
        fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
      });

      // Verificar que se regresó al menú principal
      expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
    });

    test("20. Instrucciones muestran información correcta", async () => {
      render(<App />);
      act(() => {
        fireEvent.click(screen.getByTestId('instructions-button'));
      });

      expect(screen.getByText(/Instrucciones de Cacería en San Juan/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1 Punto/i)).toBeInTheDocument();
      expect(screen.getByText(/\+2 Puntos/i)).toBeInTheDocument();
    });

    test("21. Cierre de instrucciones vuelve al menú", async () => {
      render(<App />);
      act(() => {
        fireEvent.click(screen.getByTestId('instructions-button'));
      });
      expect(screen.getByText(/Instrucciones de Cacería en San Juan/i)).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByText(/¡Entendido!/i));
      });

      // Verificar que las instrucciones ya no están en el documento
      expect(screen.queryByText(/Instrucciones de Cacería en San Juan/i)).not.toBeInTheDocument();
      // Y que el menú principal sigue visible
      expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
    });

    test("22. Tiempo no avanza en pantalla final", async () => {
      render(<App />);

      // Llegar a pantalla final
      act(() => {
        fireEvent.click(screen.getByText(/Comenzar Juego/i));
      });
      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
      });
      expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();

      // Guardar el texto de la puntuación final (no del tiempo de juego)
      const finalScoreText = screen.getByText(/Tu puntuación final es:/i).textContent;

      // Avanzar tiempo extra en la pantalla final
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Verificar que el texto de la puntuación final no cambió (ya que el temporizador del juego ya terminó)
      expect(screen.getByText(/Tu puntuación final es:/i).textContent).toBe(finalScoreText);
    });

    test("25. Flash de pantalla desaparece después de 800ms", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Activar flash
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });

      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('screen-flash');

      // Avanzar el tiempo por 800ms
      act(() => {
        jest.advanceTimersByTime(800);
      });

      // Verificar que la clase 'screen-flash' ha desaparecido
      expect(gameContainer).not.toHaveClass('screen-flash');
    });
  });

  // NUEVAS PRUEBAS UNITARIAS - Funciones específicas del componente Game
  describe("Game Component - Specific Unit Tests", () => {

    // 1. Verificar que el score inicial sea 0 (ya cubierto por BDD 2, pero como unitario)
    test("Score starts at 0", () => {
      render(<Game onGameEnd={jest.fn()} />);
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    });

    // 2. Verificar que el tiempo inicial sea 30 (ya cubierto por BDD 2, pero como unitario)
    test("Time left starts at 30", () => {
      render(<Game onGameEnd={jest.fn()} />);
      expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
    });

    // 4. Verificar que el cursor personalizado está presente en el contenedor del juego
    test("Game container has custom cursor class", () => {
      render(<Game onGameEnd={jest.fn()} />);
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('has-custom-cursor');
    });

    // 5. Verificar que el arma del jugador se renderiza
    test("Player gun element is rendered", () => {
      render(<Game onGameEnd={jest.fn()} />);
      expect(screen.getByTestId('gun-element')).toBeInTheDocument();
    });

    // 6. Verificar que la imagen de fondo del escenario se aplica correctamente
    test("Scenario background image is applied", () => {
      render(<Game onGameEnd={jest.fn()} />);
      const gameContainer = screen.getByTestId('game-container');
      // Buscar el div con la clase 'scenario' dentro del contenedor del juego
      const scenarioElement = gameContainer.querySelector('.scenario');
      expect(scenarioElement).toHaveStyle('background-image: url(test-scenario-image)');
    });

    // 7. Verificar que el botón de pausa se renderiza
    test("Pause button is rendered", () => {
      render(<Game onGameEnd={jest.fn()} />);
      expect(screen.getByText(/Pausa/i)).toBeInTheDocument();
    });

    // 8. Asegurarse de que el score no puede ser negativo cuando se pierde un objetivo desde 0 puntos
    test("Score does not go below 0 when missing target", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Asegurarse de que la puntuación es 0 inicialmente
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();

      // Simular una pérdida de objetivo
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument(); // Debe seguir siendo 0

      // Simular otra pérdida
      act(() => {
        fireEvent.animationEnd(screen.getByTestId('target-element'));
      });
      expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument(); // Debe seguir siendo 0
    });

    // 9. Verificar que el overlay de pausa no esté visible al inicio
    test("Pause overlay is not visible initially", () => {
      render(<Game onGameEnd={jest.fn()} />);
      expect(screen.queryByText(/Juego en espera/i)).not.toBeInTheDocument();
    });

    // 10. Verificar que el arma se mueve ligeramente con el cursor (al menos la transformación existe)
    test("Player gun transform style changes on mouse move", async () => {
      render(<Game onGameEnd={jest.fn()} />);
      const gun = screen.getByTestId('gun-element');
      const initialTransform = gun.style.transform || '';

      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });
      });

      const newTransform = gun.style.transform;
      expect(newTransform).not.toBe(initialTransform);
      expect(newTransform).toMatch(/translateX/);
      expect(newTransform).toMatch(/translateY/);
    });

    // 11. Verificar que el flasheo de pantalla no está activo al inicio
    test("Screen flash is not active initially", () => {
      render(<Game onGameEnd={jest.fn()} />);
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).not.toHaveClass('screen-flash');
    });

    // 12. Verificar que al reanudar el juego, la clase 'paused' se elimina del contenedor
    test("Game container loses 'paused' class when resumed", async () => {
      render(<Game onGameEnd={jest.fn()} />);
      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i));
      });
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('paused');

      act(() => {
        fireEvent.click(screen.getByText(/Reanudar/i));
      });
      expect(gameContainer).not.toHaveClass('paused');
    });

    // 13. Verificar que al pausar el juego, la clase 'paused' se añade al contenedor
    test("Game container gains 'paused' class when paused", async () => {
      render(<Game onGameEnd={jest.fn()} />);
      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i));
      });
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('paused');
    });

    // 14. Score remains unchanged when game is paused (revisado)
    test("Score remains unchanged when game is paused", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      // Primero, click en un objetivo para que el score sea 1
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.9); // Normal target
      act(() => {
        fireEvent.click(screen.getByTestId('target-element'));
      });
      expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();

      // Pausar el juego
      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i));
      });
      expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();

      // Intentar clickar el objetivo mientras está pausado (no debería cambiar score)
      act(() => {
        fireEvent.click(screen.getByTestId('target-element'));
      });

      expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument(); // Score debe seguir siendo 1
    });

    // 15. Timer does not advance when game is paused (ya cubierto por BDD 16, pero como unitario)
    test("Timer does not advance when game is paused", async () => {
      render(<Game onGameEnd={jest.fn()} />);

      act(() => {
        jest.advanceTimersByTime(1000); // Avanzar 1 segundo
      });
      expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByText(/Pausa/i)); // Pausar juego
      });
      act(() => {
        jest.advanceTimersByTime(1000); // Intentar avanzar otro segundo
      });

      expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument(); // Tiempo no debe cambiar
    });

    // 17. onGameEnd is called with correct score when time runs out (revisado)
    test("onGameEnd is called with correct score when time runs out", async () => {
      const mockOnGameEnd = jest.fn();
      render(<Game onGameEnd={mockOnGameEnd} />);

      // Simular algunos clics para tener un score
      jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Asegurar objetivos normales
      act(() => {
        fireEvent.click(screen.getByTestId('target-element')); // Score 1
      });
      act(() => {
        fireEvent.click(screen.getByTestId('target-element')); // Score 2
      });

      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000); // Avanzar el tiempo para que el juego termine
      });

      expect(mockOnGameEnd).toHaveBeenCalledTimes(1);
      expect(mockOnGameEnd).toHaveBeenCalledWith(2); // Debería llamarse con el score acumulado
    });

    // 18. spawnNewTarget adjusts normal target duration based on score (revisado)
    test("spawnNewTarget adjusts normal target duration based on score", async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // Forzar objetivo normal en todas las generaciones

      render(<Game onGameEnd={jest.fn()} />); // Score inicial 0
      const initialTarget = screen.getByTestId('target-element');
      const durationAtScore0 = parseFloat(initialTarget.style.animationDuration);

      // Aumentar score a 5 clicando 5 veces
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(screen.getByTestId('target-element'));
        });
      }

      // El score debe ser 5. Un nuevo objetivo se habrá generado con la nueva duración.
      const targetAtScore5 = screen.getByTestId('target-element');
      const durationAtScore5 = parseFloat(targetAtScore5.style.animationDuration);

      expect(screen.getByText(/Puntuación: 5/i)).toBeInTheDocument();
      expect(durationAtScore5).toBeLessThan(durationAtScore0);
      expect(durationAtScore5).toBeCloseTo(4.75); // 5.0 - (5/5)*0.25 = 4.75
    });

    // 19. spawnNewTarget adjusts special target duration based on score (revisado)
    test("spawnNewTarget adjusts special target duration based on score", async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // Forzar objetivo especial en todas las generaciones

      render(<Game onGameEnd={jest.fn()} />); // Score inicial 0
      const initialTarget = screen.getByTestId('target-element');
      const durationAtScore0 = parseFloat(initialTarget.style.animationDuration); // Debería ser 2.5s

      // Aumentar score a 10 clicando 5 veces (2 puntos por objetivo especial)
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(screen.getByTestId('target-element'));
        });
      }

      // El score debe ser 10. Un nuevo objetivo se habrá generado.
      const targetAtScore10 = screen.getByTestId('target-element');
      const durationAtScore10 = parseFloat(targetAtScore10.style.animationDuration);

      expect(screen.getByText(/Puntuación: 10/i)).toBeInTheDocument();
      expect(durationAtScore10).toBeLessThan(durationAtScore0);
      expect(durationAtScore10).toBeCloseTo(2.0); // 2.5 - (10/5)*0.25 = 2.0
    });

    // 20. Verificar que el efecto de temporizador se limpia al desmontar el componente (o al terminar el juego)
    test("Timer interval is cleared when game ends (component unmounts or finishes)", async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      render(<Game onGameEnd={jest.fn()} />);

      // Avanzar el tiempo para que el juego termine
      act(() => {
        jest.advanceTimersByTime(GAME_DURATION * 1000 + 1000);
      });

      // Se espera que clearInterval haya sido llamado, indicando que el temporizador se limpió
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
