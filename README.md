
# Tetris JS

El juego Tetris desarrollado integramente con JavaScript, sin bibliotecas externas. Codificado a partir del codigo [Tetris][link_tetris] del video de youtube de [MiduDev][link_midudev]

[link_tetris]: https://github.com/midudev/tetris-code-interview.git
[link_midudev]: https://www.youtube.com/watch?v=pNiyz0sl1no

## Demo
Este es el link del juego [Tetris JS][link_demo_tetris]

[link_demo_tetris]: https://tetris.walkeralfaro.com

## Screenshot

### Start Screen:
<img src="https://raw.githubusercontent.com/walkeralfaro/tetris_game_js/main/screenshots/start_screen.webp" alt="drawing" width="350"/>

### Play Screen:
<img src="https://raw.githubusercontent.com/walkeralfaro/tetris_game_js/main/screenshots/tetris_play.webp" alt="drawing" width="350"/>

### Game Over Screen:
<img src="https://raw.githubusercontent.com/walkeralfaro/tetris_game_js/main/screenshots/game_over_screen.webp" alt="drawing" width="350"/>

## Development

### Game Loop:
El juego corre en un bucle que renderiza un canvas de manera sincronizada con el refresco de la pantalla sobre la cual se ejecuta:

```javascript
function draw () {
  switch (gameState) {
    case GameState.START_SCREEN:
      // Dibujar la pantalla de inicio
      break
    case GameState.PLAYING:
      // La función update() actualiza el juego en tiempo real
      update()
      break
    case GameState.GAME_OVER:
      // Dibujar la pantalla de game over
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

// En este objeto se cargan el origen de los audios
const sounds = {
  audio_1: chargeAudio('./audio_1.ogg'),
  ...
}

// Crea una nueva instancia Audio. Retorna el objeto audio de sounds.audio_1
function chargeAudio (urlAudio) {
  const audio = new Audio()
  audio.src = urlAudio
  return audio
}

// Se crea otro nodo y se le puede modificar el volumen, si entra en loop
function playAudio (audio, loop = false, volume = 0.8) {
  const newAudioInstance = audio.cloneNode()
  newAudioInstance.volume = volume

  if (loop) {
    newAudioInstance.loop = true
  }

  newAudioInstance.play()
  const soundName = Object.keys(sounds).find(key => sounds[key] === audio)
  // se guarda el audio en una lista de instancias para luego modificarlas
  audioInstances[soundName] = newAudioInstance
}

// Detiene un audio específico listado en 'audioInstances'
function stopAudio (audio) {
  const soundName = Object.keys(sounds).find(key => sounds[key] === audio)
  if (audioInstances[soundName]) {
    audioInstances[soundName].pause()
    audioInstances[soundName].loop = false
    audioInstances[soundName].currentTime = 0
  }
}
```

La `Web Audio API` permite manejar el audio en nuestros documentos HTML con suma facilidad. En este juego se hizo un uso básico. Una posible mejora podría ser un `preload` del audio.

### Touch Controllers:

JavaScript permite el manejo sencillo de pantallas táctiles, proporcionando eventos que son disparados por el toque en pantalla:

```javascript
// touchstart: detecta si se presionó la pantalla y las coordenadas
window.addEventListener('touchstart', onTouchStart)
// touchmove: retorna las coordenadas por donde se desliza el toque
window.addEventListener('touchmove', onTouchMove)
// touchend: detecta cuando se terminó de tocar la pantalla
window.addEventListener('touchend', onTouchEnd)

let deltaX = 0
let deltaY = 0
let lastTouchX = 0
let lastTouchY = 0
const initialTouch = {
  x: 0,
  y: 0
}

// Este codigo compara si el toque final e inicial tienes las mismas coordenadas, si es así lanza la función de rotar la ficha
function onTouchEnd (eventTouch) {
  const endTouchX = eventTouch.changedTouches[0].clientX
  const endTouchY = eventTouch.changedTouches[0].clientY

  if (endTouchX === initialTouch.x && endTouchY === initialTouch.y) {
    rotatePiece()
  }
}

// Esta función almacena las coordenadas del primer toque en pantalla
function onTouchStart (eventTouch) {
  const touch = eventTouch.touches[0]
  // Se guardan las coordenadas del primer toque
  initialTouch.x = touch.clientX
  initialTouch.y = touch.clientY
  // El toque inicial es el último toque para la función onTouchMove()
  lastTouchX = initialTouch.x
  lastTouchY = initialTouch.y
}

// Esta función compara las coordenadas del último toque (lasTouchX, lastTouchY) con las coordenadas del toque actual, dependiendo de la diferencia (deltaX, deltaY) se muve la pieza a la derecha, izquierda, o abajo
function onTouchMove (eventTouch) {
  const touch = eventTouch.touches[0]
  const currentTouchX = touch.clientX
  const currentTouchY = touch.clientY

  deltaX = currentTouchX - lastTouchX
  deltaY = currentTouchY - lastTouchY

  if (deltaX >= touchSpeed) {
    lastTouchX = currentTouchX
    movePieceRight()
  }

  if (deltaX <= -touchSpeed) {
    lastTouchX = currentTouchX
    movePieceLeft()
  }

  if (deltaY >= touchSpeed) {
    lastTouchY = currentTouchY
    movePieceDown()
  }
}
```



## Tech Stack

**Game:** HTML, CSS, JavaScript

## Authors

- [@walkeralfaro](https://github.com/WalkerAlfaro)
- [@midudev](https://github.com/midudev)