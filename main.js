/* eslint-disable no-undef */
import './reset.css'
import './style.css'
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENTS, TETRAMINO_SIZE, PIECES } from './consts'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const $score = document.querySelector('span')
const $tetramino = document.querySelector('#tetraminos')
const playButton = document.querySelector('.play_button')
const startScreen = document.querySelector('.start_screen')

const sounds = {
  piece_move: chargeAudio('./sounds/piece_move.ogg'),
  piece_landing: chargeAudio('./sounds/piece_landing.ogg'),
  piece_rotate: chargeAudio('./sounds/piece_rotate.ogg'),
  piece_down: chargeAudio('./sounds/piece_down.ogg'),
  clear_lines: chargeAudio('./sounds/clear_lines.ogg'),
  gamestart: chargeAudio('./sounds/gamestart.ogg'),
  gameover: chargeAudio('./sounds/gameover.ogg'),
  theme_1: chargeAudio('./sounds/theme_1.ogg'),
  theme_2: chargeAudio('./sounds/theme_2.ogg')
}
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

let deltaX = 0
let deltaY = 0
let lastTouchX = 0
let lastTouchY = 0
let score = 0
const GameState = {
  START_SCREEN: 0,
  PLAYING: 1,
  GAME_OVER: 2
}
let gameState = GameState.START_SCREEN
const touchSpeed = 24

const initialTouch = {
  x: 0,
  y: 0
}

const piece = {
  position: {},
  shape: []
}

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

ctx.scale(BLOCK_SIZE, BLOCK_SIZE)

// Event Listeners
window.addEventListener('touchstart', onTouchStart)
window.addEventListener('touchmove', onTouchMove)
window.addEventListener('touchend', onTouchEnd)
playButton.addEventListener('click', playGame)

document.addEventListener('keydown', (event) => {
  if (event.key === EVENT_MOVEMENTS.LEFT) movePieceLeft()
  if (event.key === EVENT_MOVEMENTS.RIGHT) movePieceRight()
  if (event.key === EVENT_MOVEMENTS.DOWN) movePieceDown()
  if (event.key === EVENT_MOVEMENTS.UP) rotatePiece()
})

// 2. game loop
let dropCounter = 0
let lastTime = 0

function update (time) {
  drawBoard()
  drawPiece()
  selfDownMovePiece(time)
  $score.innerHTML = score
}

function changedState (newState) {
  gameState = newState
}

function drawStartScreen () {
  startScreen.style.display = 'grid'
}

function playGame () {
  changedState(GameState.PLAYING)
  getRandomPiece()
  playAudio(sounds.gamestart)
  playAudio(sounds.theme_1, true, 0.15)
  startScreen.style.display = 'none'
}

function drawGame () {
  // Dibujar el juego en curso
}

function draw (time = 0) {
  console.log(gameState)
  switch (gameState) {
    case GameState.START_SCREEN:
      drawStartScreen()
      break
    case GameState.PLAYING:
      update(time)
      // getRandomPiece()
      break
    case GameState.GAME_OVER:
      drawGameOverScreen()
      break
  }
  window.requestAnimationFrame(draw)
}

function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

function chargeAudio (urlAudio) {
  const audio = new Audio()
  audio.src = urlAudio
  return audio
}

function playAudio (audio, loop = false, volume = 0.5, stop = false) {
  if (gameState !== GameState.PLAYING) return
  const newAudioInstance = audio.cloneNode()
  newAudioInstance.volume = volume
  if (stop) {
    newAudioInstance.pause()
    newAudioInstance.currentTime = 0
    return
  }
  if (loop) {
    newAudioInstance.addEventListener('ended', () => {
      newAudioInstance.currentTime = 0
      newAudioInstance.play()
    })
  }
  newAudioInstance.play()
}

function onTouchEnd (eventTouch) {
  const endTouchX = eventTouch.changedTouches[0].clientX
  const endTouchY = eventTouch.changedTouches[0].clientY

  if (endTouchX === initialTouch.x && endTouchY === initialTouch.y) {
    rotatePiece()
  }
}

function onTouchStart (eventTouch) {
  const touch = eventTouch.touches[0]
  initialTouch.x = touch.clientX
  initialTouch.y = touch.clientY

  lastTouchX = initialTouch.x
  lastTouchY = initialTouch.y
}

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

function movePieceLeft () {
  playAudio(sounds.piece_move)
  piece.position.x--
  if (checkCollition()) {
    piece.position.x++
  }
}

function movePieceRight () {
  piece.position.x++
  playAudio(sounds.piece_move)
  if (checkCollition()) {
    piece.position.x--
  }
}

function movePieceDown () {
  playAudio(sounds.piece_down)
  piece.position.y++
  if (checkCollition()) {
    playAudio(sounds.piece_landing)
    piece.position.y--
    solidifyPiece()
    removeRows()
  }
}

function selfDownMovePiece (time) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    dropCounter = 0
    movePieceDown()
  }
}

function rotatePiece () {
  if (gameState !== GameState.PLAYING) return
  playAudio(sounds.piece_rotate)
  const rotated = []

  for (let i = 0; i < piece.shape[0].length; i++) {
    const row = []

    for (let j = piece.shape.length - 1; j >= 0; j--) {
      row.push(piece.shape[j][i])
    }

    rotated.push(row)
  }

  const previousShape = piece.shape
  piece.shape = rotated
  if (checkCollition()) {
    piece.shape = previousShape
  }
}

function paintImageBlock (image, clipX, clipY, cubeSize, canvasX, canvasY) {
  ctx.drawImage(
    image,
    clipX,
    clipY,
    cubeSize,
    cubeSize,
    canvasX,
    canvasY,
    1,
    1
  )
}

function drawPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block) {
        const clipX = (block - 1) * TETRAMINO_SIZE
        const clipY = 0
        const canvasX = x + piece.position.x
        const canvasY = y + piece.position.y
        paintImageBlock($tetramino, clipX, clipY, TETRAMINO_SIZE, canvasX, canvasY)
      }
    })
  })
}

function drawBoard () {
  board.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block !== 0) {
        const clipX = (block - 1) * TETRAMINO_SIZE
        const clipY = 1 * TETRAMINO_SIZE
        paintImageBlock($tetramino, clipX, clipY, TETRAMINO_SIZE, x, y)
      } else if (block === 0) {
        ctx.fillStyle = 'black'
        ctx.fillRect(x, y, 1, 1)
        ctx.strokeStyle = 'gray'
        ctx.lineWidth = 0.02
        ctx.strokeRect(x, y, 1, 1)
      }
    })
  })
}

function checkCollition () {
  return piece.shape.some((row, y) => {
    return row.some((block, x) => {
      return (
        block !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block !== 0) {
        board[y + piece.position.y][x + piece.position.x] = block
      }
    })
  })

  getRandomPiece()
  gameOver()
}

function removeRows () {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(block => block !== 0)) {
      rowsToRemove.push(y)
      playAudio(sounds.clear_lines)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    console.log(board)
    const voidRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(voidRow)
    console.log(board)
    score += 10
  })
}

function getRandomPiece () {
  // reset piece position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 1)
  piece.position.y = 0
  // get random piece
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
}

function gameOver () {
  if (checkCollition()) {
    window.alert('GAME OVER')
    board.forEach((row) => row.fill(0))
  }
}

// getRandomPiece()
draw()

// let gameState = 'start'; // Estado inicial del juego

// function draw() {
//   cleanCanvas();

//   // Dibujar en función del estado del juego
//   switch (gameState) {
//     case 'start':
//       drawStartScreen();
//       break;
//     case 'playing':
//       updateGame();
//       drawGame();
//       break;
//     case 'gameOver':
//       drawGameOverScreen();
//       break;
//     // Otros estados del juego pueden agregarse según sea necesario
//   }

//   window.requestAnimationFrame(draw);
// }

// // Funciones para gestionar diferentes estados del juego
// function startGame() {
//   gameState = 'playing';
//   // Inicializar cualquier estado del juego necesario
// }

// function endGame() {
//   gameState = 'gameOver';
//   // Realizar cualquier limpieza o acción necesaria al finalizar el juego
// }

// // Lógica para la actualización del juego
// function updateGame() {
//   // Actualizar el estado del juego
// }

// // Funciones para dibujar en el lienzo
// function drawStartScreen() {
//   // Dibujar la pantalla de inicio
// }

// function drawGame() {
//   // Dibujar el juego en curso
// }

// function drawGameOverScreen() {
//   // Dibujar la pantalla de fin de juego
// }

// // Limpia el lienzo
// function cleanCanvas() {
//   // Código para limpiar el lienzo
// }

// // Iniciar el juego
// startGame();
// // Comienza el bucle de animación
// draw();
