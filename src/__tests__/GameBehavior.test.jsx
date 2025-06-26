import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../App";
import Game from "../components/Game";

// Mockear assets
jest.mock("../assets/Objetivo.png", () => "test-target-image");
jest.mock("../assets/Objetivo2.png", () => "test-special-target-image");
jest.mock("../assets/gun.png", () => "test-gun-image");
jest.mock("../assets/Scenario.jpeg", () => "test-scenario-image");

jest.mock("../components/Game", () => {
  const originalModule = jest.requireActual("../components/Game");
  
  return {
    __esModule: true,
    ...originalModule,
    default: (props) => {
      // Mockear spawnNewTarget para controlar la generación de objetivos
      const mockSpawnNewTarget = jest.fn().mockImplementation(() => {
        props.onTargetSpawned && props.onTargetSpawned();
        return [{
          id: Date.now(),
          y: Math.random() * 80,
          direction: Math.random() < 0.5 ? "ltr" : "rtl",
          image: Math.random() < 0.25 ? "test-special-target-image" : "test-target-image",
          points: Math.random() < 0.25 ? 2 : 1,
          duration: 5 - Math.floor(props.score / 5) * 0.25
        }];
      });
      
      return <originalModule.default {...props} spawnNewTarget={mockSpawnNewTarget} />;
    }
  };
});

beforeEach(() => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
});

describe("Escenarios de Comportamiento (BDD)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test("1. Flujo completo: menú → juego → fin → reinicio", () => {
    render(<App />);
    
    // Menú principal
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    // Juego
    expect(screen.getByText(/Puntuación:/i)).toBeInTheDocument();
    
    // Finalizar juego avanzando tiempo
    act(() => {
      jest.advanceTimersByTime(31000);
    });
    
    // Pantalla final
    expect(screen.getByText(/¡Juego Terminado!/i)).toBeInTheDocument();
    
    // Reiniciar
    fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  test("2. Inicio de juego: muestra elementos iniciales correctos", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiempo: 30/i)).toBeInTheDocument();
    expect(screen.getByText(/Pausa/i)).toBeInTheDocument();
  });

  test("3. Click en objetivo normal: incrementa puntuación en 1", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Forzar objetivo normal
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.9);
    fireEvent.click(screen.getByTestId('target-element'));
    
    expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test("4. Click en objetivo especial: incrementa puntuación en 2", () => {
    const { container } = render(<Game onGameEnd={jest.fn()} />);
    
    // Forzar objetivo especial
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
    
    // Simular que el objetivo es especial
    const target = container.querySelector('[style*="test-special-target-image"]');
    fireEvent.click(target);
    
    // Verificar puntuación
    expect(screen.getByText(/Puntuación: 2/i))
  });

  test("5. Objetivo no alcanzado: reduce puntuación en 1", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Primero hacer click para tener 1 punto
    jest.spyOn(global.Math, 'random').mockReturnValue(0.9);
    fireEvent.click(screen.getByTestId('target-element'));
    
    // Luego simular que el objetivo escapa
    fireEvent.animationEnd(screen.getByTestId('target-element'));
    
    // Verificar puntuación
    const scoreElement = screen.getByText(/Puntuación:/i);
    expect(scoreElement.textContent).toMatch(/0/);
  });

  test("6. Objetivo no alcanzado con puntuación 0: no baja de 0", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Establecer puntuación en 0
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.9);
    fireEvent.click(screen.getByTestId('target-element')); // +1 -> 1
    fireEvent.animationEnd(screen.getByTestId('target-element')); // -1 -> 0
    fireEvent.animationEnd(screen.getByTestId('target-element')); // Intento bajar a -1
    
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test("7. Flash de pantalla al fallar objetivo", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    fireEvent.animationEnd(screen.getByTestId('target-element'));
    
    const gameContainer = screen.getByTestId('game-container');
    expect(gameContainer).toHaveClass('screen-flash');
  });

  test("8. Pausa del juego: muestra overlay de pausa", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    fireEvent.click(screen.getByText(/Pausa/i));
    expect(screen.getByText(/Juego en espera/i)).toBeInTheDocument();
  });

  test("9. Reanudar juego: oculta overlay de pausa", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    fireEvent.click(screen.getByText(/Pausa/i));
    fireEvent.click(screen.getByText(/Reanudar/i));
    expect(screen.queryByText(/Juego en espera/i)).not.toBeInTheDocument();
  });

  test("10. Tiempo se reduce correctamente", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
  });

  test("11. Fin del juego cuando tiempo llega a 0", () => {
    const mockOnGameEnd = jest.fn();
    render(<Game onGameEnd={mockOnGameEnd} />);
    
    act(() => {
      jest.advanceTimersByTime(31000);
    });
    
    expect(mockOnGameEnd).toHaveBeenCalled();
  });

  test("12. Dificultad aumenta con puntuación: objetivos más rápidos", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Obtener duración inicial
    const initialDuration = parseFloat(screen.getByTestId('target-element').style.animationDuration);
    
    // Aumentar puntuación a 5
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.9);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('target-element'));
    }
    
    // Verificar nueva duración
    const newDuration = parseFloat(screen.getByTestId('target-element').style.animationDuration);
    expect(newDuration).toBeLessThan(initialDuration);
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test("13. Velocidad mínima: no baja de 1 segundo", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Aumentar puntuación a 30 (debería alcanzar velocidad mínima)
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.9);
    for (let i = 0; i < 30; i++) {
      fireEvent.click(screen.getByTestId('target-element'));
    }
    
    const duration = parseFloat(screen.getByTestId('target-element').style.animationDuration);
    expect(duration).toBeGreaterThanOrEqual(1.0);
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test("14. Objetivos especiales aparecen aproximadamente 25% del tiempo", () => {
    render(<Game onGameEnd={jest.fn()} />);
    let specialCount = 0;
    const totalTargets = 100;
    
    // Mock para forzar aproximadamente 25% de objetivos especiales
    jest.spyOn(global.Math, 'random')
      .mockReturnValueOnce(0.1)  // Especial
      .mockReturnValueOnce(0.8)  // Normal
      .mockReturnValueOnce(0.8)  // Normal
      .mockReturnValueOnce(0.2)  // Especial
      .mockReturnValue(0.8);     // Resto normales
    
    for (let i = 0; i < totalTargets; i++) {
      const target = screen.getByTestId('target-element');
      if (target.style.backgroundImage.includes('special')) {
        specialCount++;
      }
      fireEvent.click(target);
    }
    
    const percentage = (specialCount / totalTargets) * 100;
    expect(percentage).toBeGreaterThan(20);
    expect(percentage).toBeLessThan(30);
  });

  test("15. Movimiento del arma sigue al cursor", () => {
    render(<Game onGameEnd={jest.fn()} />);
    const gun = screen.getByTestId('gun-element');
    
    // Posición inicial
    const initialTransform = gun.style.transform || '';
    
    // Simular movimiento del ratón
    fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });
    
    // Verificar nueva posición
    const newTransform = gun.style.transform;
    expect(newTransform).not.toBe(initialTransform);
  });

  test("16. Pausa detiene el temporizador", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Avanzar 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
    
    // Pausar y avanzar otro segundo
    fireEvent.click(screen.getByText(/Pausa/i));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Tiempo no debería cambiar
    expect(screen.getByText(/Tiempo: 29/i)).toBeInTheDocument();
  });

  test("17. Click en objetivo durante pausa no tiene efecto", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    fireEvent.click(screen.getByText(/Pausa/i));
    fireEvent.click(screen.getByTestId('target-element'));
    
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
  });

  test("18. Objetivo que escapa durante pausa no penaliza", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    fireEvent.click(screen.getByText(/Pausa/i));
    fireEvent.animationEnd(screen.getByTestId('target-element'));
    
    expect(screen.getByText(/Puntuación: 0/i)).toBeInTheDocument();
  });

  test("19. Reinicio lleva a menú principal", () => {
    render(<App />);
    
    // Completar flujo completo
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    act(() => {
      jest.advanceTimersByTime(31000);
    });
    fireEvent.click(screen.getByText(/Jugar de Nuevo/i));
    
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  test("20. Instrucciones muestran información correcta", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('instructions-button'));
    
    expect(screen.getByText(/Instrucciones de Cacería en San Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 Punto/i)).toBeInTheDocument();
    expect(screen.getByText(/\+2 Puntos/i)).toBeInTheDocument();
  });

  test("21. Cierre de instrucciones vuelve al menú", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('instructions-button'));
    fireEvent.click(screen.getByText(/¡Entendido!/i));
    
    expect(screen.queryByText(/Instrucciones de Cacería en San Juan/i)).not.toBeInTheDocument();
  });

  test("22. Tiempo no avanza en pantalla final", () => {
    render(<App />);
    
    // Llegar a pantalla final
    fireEvent.click(screen.getByText(/Comenzar Juego/i));
    act(() => {
      jest.advanceTimersByTime(31000);
    });
    
    // Guardar tiempo mostrado
    const timeText = screen.getByText(/Tu puntuación final es:/i).textContent;
    
    // Avanzar tiempo extra
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Verificar que el tiempo no cambió
    expect(screen.getByText(/Tu puntuación final es:/i).textContent).toBe(timeText);
  });

  test("23. Generación de objetivos en diferentes posiciones verticales", () => {
    render(<Game onGameEnd={jest.fn()} />);
    const positions = new Set();
    
    // Mock para generar diferentes posiciones
    jest.spyOn(global.Math, 'random').mockImplementation(() => Math.random());
    
    for (let i = 0; i < 50; i++) {
      const target = screen.getByTestId('target-element');
      positions.add(target.style.top);
      fireEvent.click(target);
    }
    
    expect(positions.size).toBeGreaterThan(10);
  });

  test("24. Objetivos aparecen alternando direcciones", () => {
    render(<Game onGameEnd={jest.fn()} />);
    let leftCount = 0;
    let rightCount = 0;
    const totalTargets = 50;
    
    // Mock para alternar direcciones
    let alternate = true;
    jest.spyOn(global.Math, 'random').mockImplementation(() => {
      alternate = !alternate;
      return alternate ? 0.2 : 0.7;
    });
    
    for (let i = 0; i < totalTargets; i++) {
      const target = screen.getByTestId('target-element');
      if (target.classList.contains('ltr')) leftCount++;
      if (target.classList.contains('rtl')) rightCount++;
      fireEvent.click(target);
    }
    
    expect(leftCount).toBeGreaterThan(15);
    expect(rightCount).toBeGreaterThan(15);
  });

  test("25. Flash de pantalla desaparece después de 800ms", () => {
    render(<Game onGameEnd={jest.fn()} />);
    
    // Activar flash
    fireEvent.animationEnd(screen.getByTestId('target-element'));
    
    const gameContainer = screen.getByTestId('game-container');
    expect(gameContainer).toHaveClass('screen-flash');
    
    // Avanzar tiempo
    act(() => {
      jest.advanceTimersByTime(800);
    });
    
    expect(gameContainer).not.toHaveClass('screen-flash');
  });
});