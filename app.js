document.addEventListener("DOMContentLoaded", () => {

    const width = 10  // represents the value of all cells in that row -> by adding one more value of width to another value, we allow for the blocks to jump down a row
    document.querySelector(".grid")
    
    let squares = Array.from(document.querySelectorAll(".game-box div"))
    const scoreValue = document.querySelector(".score-value")
    const startButton = document.querySelector(".start-button")
    
    console.log(squares)

//The Tetrominoes
const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  // Select Shape
  let random = Math.floor(Math.random() * theTetrominoes.length)
  console.log(random)

  let currentPosition = 4;
  let currentRotation = 0;


  let current = theTetrominoes[random][currentRotation]

  // Select Variant

  // Draw a tetromino

  function draw() {
      current.forEach(index => {
          squares[currentPosition + index].classList.add("tetromino")
      })
  } 

  function undraw() {
      current.forEach(index => {
          squares[currentPosition + index].classList.remove("tetromino")
      }) 
  }

  draw()

  // make the tetromino move 

  timerId = setInterval(moveDown, 1000)

  // assign keycodes
  function control (e) {
      if (e.keyCode === 37) {
          moveLeft()
      } else if (e.keyCode === 39) {
          moveRight()
      } else if (e.keyCode === 38) {
          rotate()
      } else if (e.keyCode === 40) {
          moveDown()
      }
     
  }

    document.addEventListener("keydown", control)

  function moveDown() {
      undraw()
      currentPosition += width
      draw()
      freeze()
  }

  //freeze function

  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains("taken")) ) {
        current.forEach(index => squares[currentPosition + index].classList.add("taken"))

        // start new tetromino falling
        random = Math.floor(Math.random() * theTetrominoes.length)            // we can turn this into a function later
        current = theTetrominoes[random][currentRotation]
        currentPosition = 4
        draw()
    }
  }

  // move left/right unless blockage or edge
  function moveLeft() {
    undraw()
    const isNextLeftEdge = current.some(index => (currentPosition + index) % width === 0);
  
    if (!isNextLeftEdge) currentPosition -= 1; // ...

    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
        currentPosition += 1;
    }
    draw() 
  }

  function moveRight() {
    undraw()
    const isNextRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
  
    if (!isNextRightEdge) currentPosition += 1; // ...

    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
        currentPosition -= 1;
    }
    
    draw() 
  }

  function rotate() {
    undraw()
    currentRotation++
    if (currentRotation === current.length) {
        currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    draw()
  }



})