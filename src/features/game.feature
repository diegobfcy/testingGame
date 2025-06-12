# src/features/game.feature
Feature: Sistema de puntuación del juego

  Scenario: Inicio y cierre del juego
    Given el jugador está en la pantalla de inicio
    When hace clic en "Iniciar Juego"
    And el juego termina con una puntuación
    Then se muestra la pantalla final con la puntuación

  Scenario: Reinicio del juego
    Given el jugador finalizó una partida
    When hace clic en "Reiniciar"
    Then vuelve a la pantalla de inicio
