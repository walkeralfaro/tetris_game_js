import './style.css'
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENTS, TETRAMINO_SIZE } from './consts'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const $score = document.querySelector('span')
const $tetramino = document.querySelector('#tetraminos')

let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

ctx.scale(BLOCK_SIZE, BLOCK_SIZE)

// 3. board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

// 4. pieza player
const piece = {
  position: {},
  shape: [],
  color: 0
}

// 9. random pieces
const PIECES = [
  [
    [7, 7, 7, 7]
  ],
  [
    [0, 2],
    [0, 2],
    [2, 2]
  ],
  [
    [4, 0],
    [4, 0],
    [4, 4]
  ],
  [
    [8, 8],
    [8, 8]
  ],
  [
    [0, 3, 3],
    [3, 3, 0]
  ],
  [
    [0, 5, 0],
    [5, 5, 5]
  ],
  [
    [6, 6, 0],
    [0, 6, 6]
  ]
]

// 2. game loop
let dropCounter = 0
let lastTime = 0

function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    dropCounter = 0
    piece.position.y++
    if (checkCollition()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

function draw () {
  drawBoard()

  drawPiece()

  $score.innerHTML = score
}

function paintImagePiece (image, clipX, clipY, cubeSize, canvasX, canvasY) {
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
        paintImagePiece($tetramino, clipX, clipY, TETRAMINO_SIZE, canvasX, canvasY)
      }
    })
  })
}

function drawBoard () {
  // console.log(board)
  board.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block !== 0) {
        const clipX = (block - 1) * TETRAMINO_SIZE
        const clipY = 0
        paintImagePiece($tetramino, clipX, clipY, TETRAMINO_SIZE, x, y)
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

document.addEventListener('keydown', (e) => {
  if (e.key === EVENT_MOVEMENTS.LEFT) {
    piece.position.x--
    if (checkCollition()) {
      piece.position.x++
    }
  }
  if (e.key === EVENT_MOVEMENTS.DOWN) {
    piece.position.y++
    if (checkCollition()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  if (e.key === EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++
    console.log(board)
    if (checkCollition()) {
      piece.position.x--
    }
  }
  if (e.key === EVENT_MOVEMENTS.UP) {
    const rotated = []

    // console.log(piece.shape.length)

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
})

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

getRandomPiece()
update()

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
