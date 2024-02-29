/* eslint-disable no-undef */
import './reset.css'
import './style.css'
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENTS, TETRAMINO_SIZE, PIECES } from './consts'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const $score = document.querySelector('.score')
const $lastScore = document.querySelector('.last_score')
const tetramino = document.querySelector('#tetraminos')
const playButton = document.querySelector('.play_button')
const startScreen = document.querySelector('.start_screen')
const gameOverScreen = document.querySelector('.gameover_screen')
const startButton = document.querySelector('.gameover_click')

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
const audioInstances = {}
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

let deltaX = 0
let deltaY = 0
let lastTouchX = 0
let lastTouchY = 0
let score = 0
let lastScore = 0
const GameState = {
  START_SCREEN: 0,
  PLAYING: 1,
  GAME_OVER: 2
}
let gameState = GameState.START_SCREEN

const touchSpeed = 24
let downSpeedPiece = 800
let level = 1
const scoreToChangeLevel = 50

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
startButton.addEventListener('click', startGame)

document.addEventListener('keydown', (event) => {
  if (event.key === EVENT_MOVEMENTS.LEFT) movePieceLeft()
  if (event.key === EVENT_MOVEMENTS.RIGHT) movePieceRight()
  if (event.key === EVENT_MOVEMENTS.DOWN) movePieceDown()
  if (event.key === EVENT_MOVEMENTS.UP) rotatePiece()
})

// 2. game loop
let dropCounter = 0
let lastTime = 0

function draw (time = 0) {
  switch (gameState) {
    case GameState.START_SCREEN:
      drawStartScreen()
      drawLevelOnCanvas()
      break
    case GameState.PLAYING:
      update(time)
      break
    case GameState.GAME_OVER:
      drawGameOverScreen()
      break
  }
  window.requestAnimationFrame(draw)
}

function update (time) {
  drawBoard()
  drawLevelOnCanvas()
  drawPiece()
  selfDownMovePiece(time)
  changeLevel()
  $score.innerHTML = score
}

// Handle state functions
function changedState (newState) {
  gameState = newState
}

function startGame () {
  changedState(GameState.START_SCREEN)
}

function drawStartScreen () {
  startScreen.style.display = 'grid'
  gameOverScreen.style.display = 'none'
}

function playGame () {
  $lastScore.innerHTML = lastScore
  changedState(GameState.PLAYING)
  getRandomPiece()
  playAudio(sounds.gamestart)
  playAudio(sounds.theme_1, true, 0.15)
  startScreen.style.display = 'none'
}

function gameOver () {
  changedState(GameState.GAME_OVER)
  lastScore = score
  $lastScore.innerHTML = lastScore
  stopAudio(sounds.theme_1)
  playAudio(sounds.gameover)
  resetValues()
}

function drawGameOverScreen () {
  gameOverScreen.style.display = 'grid'
}

// Audio functions
function chargeAudio (urlAudio) {
  const audio = new Audio()
  audio.src = urlAudio
  return audio
}

function playAudio (audio, loop = false, volume = 0.5) {
  if (gameState === GameState.START_SCREEN) return
  const newAudioInstance = audio.cloneNode()
  newAudioInstance.volume = volume

  if (loop) {
    newAudioInstance.addEventListener('ended', () => {
      newAudioInstance.currentTime = 0
      newAudioInstance.play()
    })
  }

  newAudioInstance.play()
  const soundName = Object.keys(sounds).find(key => sounds[key] === audio)
  audioInstances[soundName] = newAudioInstance
}

function stopAudio (audio) {
  const soundName = Object.keys(sounds).find(key => sounds[key] === audio)
  if (audioInstances[soundName]) {
    audioInstances[soundName].pause()
    audioInstances[soundName].currentTime = 0
  }
}

// Touche Handle Functions
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

// Move Piece Functions
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

  if (dropCounter > downSpeedPiece) {
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

// Draw functions
function drawPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block) {
        const clipX = (block - 1) * TETRAMINO_SIZE
        const clipY = 0
        const canvasX = x + piece.position.x
        const canvasY = y + piece.position.y
        paintImageBlock(tetramino, clipX, clipY, TETRAMINO_SIZE, canvasX, canvasY)
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
        paintImageBlock(tetramino, clipX, clipY, TETRAMINO_SIZE, x, y)
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

function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

function drawLevelOnCanvas () {
  ctx.fillStyle = 'rgba(255,255,255,.4)'
  if (level >= 10) {
    ctx.font = 'bold 8px Arial'
    ctx.fillText(level, 0.5, 10)
  } else {
    ctx.font = 'bold 8px Arial'
    ctx.fillText(level, 3, 10)
  }
}

// Collitions check
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

  if (checkCollition()) {
    gameOver()
  }
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

// Handle levels functions
function changeLevel () {
  if (score >= level * scoreToChangeLevel) {
    level++
    changeDownSpeedPiece()
  }
}

function changeDownSpeedPiece () {
  downSpeedPiece = 800 - level * 50
}

function resetValues () {
  score = 0
  level = 1
  downSpeedPiece = 800
  board.forEach((row) => row.fill(0))
}

draw()
