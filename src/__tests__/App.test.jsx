import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// Mockear componentes y assets
jest.mock("../components/MainMenu", () => ({ onStartGame }) => (
  <div>
    <h1>Game Title</h1>
    <button onClick={onStartGame}>Start Game</button>
  </div>
));

jest.mock("../components/Game", () => ({ onGameEnd }) => (
  <div>
    <div>Game Screen</div>
    <button onClick={() => onGameEnd(100)}>End Game</button>
  </div>
));

jest.mock("../components/EndScreen", () => ({ score, onRestartGame }) => (
  <div>
    <div>Final Score: {score}</div>
    <button onClick={onRestartGame}>Restart</button>
  </div>
));

// Mockear assets
jest.mock("../assets/Objetivo.png", () => "test-target-image");
jest.mock("../assets/Objetivo2.png", () => "test-special-target-image");
jest.mock("../assets/gun.png", () => "test-gun-image");
jest.mock("../assets/Scenario.jpeg", () => "test-scenario-image");

describe("App Component Unit Tests", () => {
  test("should render MainMenu by default", () => {
    render(<App />);
    expect(screen.getByText("Game Title")).toBeInTheDocument();
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  test("should transition to Game state when start game is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Start Game"));
    expect(screen.getByText("Game Screen")).toBeInTheDocument();
  });

  test("should transition to EndScreen when game ends", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Start Game"));
    fireEvent.click(screen.getByText("End Game"));
    expect(screen.getByText(/Final Score: 100/)).toBeInTheDocument();
  });

  test("should return to MainMenu when restart is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Start Game"));
    fireEvent.click(screen.getByText("End Game"));
    fireEvent.click(screen.getByText("Restart"));
    expect(screen.getByText("Game Title")).toBeInTheDocument();
  });
});