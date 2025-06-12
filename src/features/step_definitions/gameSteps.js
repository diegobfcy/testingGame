const { Given, When, Then } = require("@cucumber/cucumber");
const { render, screen, fireEvent } = require("@testing-library/react");
const React = require("react");
const App = require("../../src/App").default;

let rendered;

Given("el jugador está en la pantalla de inicio", () => {
  rendered = render(<App />);
});

When("hace clic en {string}", (buttonText) => {
  fireEvent.click(screen.getByText(new RegExp(buttonText, "i")));
});

When("el juego termina con una puntuación", () => {
  fireEvent.click(screen.getByText(/finalizar juego/i));
});

Then("se muestra la pantalla final con la puntuación", () => {
  expect(screen.getByText(/Tu puntuación final:/i)).toBeInTheDocument();
});

Given("el jugador finalizó una partida", () => {
  rendered = render(<App />);
  fireEvent.click(screen.getByText(/iniciar juego/i));
  fireEvent.click(screen.getByText(/finalizar juego/i));
});

Then("vuelve a la pantalla de inicio", () => {
  expect(screen.getByText(/iniciar juego/i)).toBeInTheDocument();
});
