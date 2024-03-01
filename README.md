
# Tetris JS

El juego Tetris desarrollado integramente con JavaScript, sin bibliotecas externas. Codificado a partir del codigo [Tetris][link_tetris] del video de youtube de [MiduDev][link_midudev]

[link_tetris]: https://github.com/midudev/tetris-code-interview.git
[link_midudev]: https://www.youtube.com/watch?v=pNiyz0sl1no

## Development

### Game Loop:
El juego corre en un bucle que renderiza un canvas de manera sincronizada con el refresco de la pantalla sobre la cual se ejecuta:

```javascript
function draw () {
  switch (gameState) {
    case GameState.START_SCREEN:
      // Functions that draw the start screen
      break
    case GameState.PLAYING:
      // Function that executes all gameplay functions
      update()
      break
    case GameState.GAME_OVER:
      // Functions that draw the game over screen
      break
  }
  window.requestAnimationFrame(draw)
}

function update (time) {
  // Drawing sprites of game
}

draw()
```

La función `requestAnimationFrame` es la encargada de renderizar a 60 cuadros por segundo el juego, en un bucle controlado.

### Sound Management:

El sonido es importante en todo videojuego, por eso se realizó la administración de los efectos de sonido y la música de fondo con la ayuda de la `Web Audio API`, una **API** por defecto en JS que permite manejar todo lo referente al audio:

```javascript
const audioInstances = {}
```


## Tech Stack

**Game:** HTML, CSS, JavaScript

## Authors

- [@walkeralfaro](https://github.com/WalkerAlfaro)
- [@midudev](https://github.com/midudev)