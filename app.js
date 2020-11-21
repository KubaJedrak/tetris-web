document.addEventListener("DOMContentLoaded", () => {

    // TO DO:
    // allow for last-second adjustment of tetrominoes??

    const width = 10  // represents the value of all cells in that row -> by adding one more value of width to another value, we allow for the blocks to jump down a row   
    let nextRandom = 0;
    let timerId = null;
    let score = 0;
    
    const scoreValue = document.querySelector(".score-value")
    const startButton = document.querySelector(".start-game-button")
    const pauseButton = document.querySelector(".pause-button")

    let squares = Array.from(document.querySelectorAll(".grid div"))
    let gridCells = Array.from(document.querySelectorAll(".grid-cell"))
    const grid = document.querySelector(".grid")

    let gameInProgress = false;
    let gamePaused = false;
    let time = 0;
    let timeMultiplier = 1;
    let speedMultiplier = 1;
    let moveDownSpeed = 1000;
    // let diffMultiplier = null;

    const colors = [
      "#F7FF28",
      "#FF3BC1",
      "#00DC93",
      "#00FAFB",
      "#FF2525",
      "#2800F0"
    ]
   
  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const rLTetromino = [
    [],
    [],
    [],
    [],
    [],
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

  let currentPosition = 4;
  let currentRotation = 0;


  let current = theTetrominoes[random][currentRotation]

  // Draw a tetromino

  function draw() {
    current.forEach(index => {
        squares[currentPosition + index].classList.add("tetromino")
        squares[currentPosition + index].style.backgroundColor = colors[random]
    })

    if (!gameInProgress) {
      undraw()
    }
  } 

  function undraw() {
      current.forEach(index => {
          squares[currentPosition + index].classList.remove("tetromino")
          squares[currentPosition + index].style.backgroundColor = ""
      }) 
  }

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
    } else if (e.keyCode === 32) {
      if (!gamePaused) {
        pauseGame()          
      } else if (gamePaused) {
        resumeGame();
      }
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

        // start a new tetromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)            // we can turn this into a function later
        current = theTetrominoes[random][currentRotation]
        currentPosition = 4
        drawTimeOut = setTimeout(draw, 100);
        displayShape();
        addScore();
        gameOver();
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

  ///FIX ROTATION OF TETROMINOS A THE EDGE 
  function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
  }
    
  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }
    
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }

  // rotate function
  function rotate() {
    undraw()
    currentRotation++
    if (currentRotation === current.length) {
        currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition();
    draw()
  }

  // show the next tetromino to drop:

  const displaySquares = document.querySelectorAll(".mini-grid div")
  const displayWidth = 4;
  let displayIndex = 0;

  const upcomingTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],                   // l
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],        // z
    [1, displayWidth, displayWidth + 1, displayWidth + 2],            // t
    [0, 1, displayWidth, displayWidth + 1],                           // o
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // i
  ]

  function displayShape() {
    displaySquares.forEach(square => {
      square.classList.remove("tetromino")
      square.style.backgroundColor = ""
    })
    upcomingTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add("tetromino")
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  // start function:
  startButton.addEventListener("click", () => {
    if (!gameInProgress) {
      gameInProgress = true;
      pauseButton.innerText = "Pause Game"
      score = 0;
      scoreValue.innerText = "0"
      draw()
      timerId = setInterval(moveDown, moveDownSpeed)
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      displayShape()
      gameTimeID = setInterval(timer, 1000) // measures game time
    }
  })

  function pauseGame() {
    clearInterval(timerId)
    timerId = null;
    pauseButton.innerText = "Resume Game"
    gamePaused = true;
  }

  function resumeGame() {
    if (gameInProgress) {
      draw()
      timerId = setInterval(moveDown, 1000)
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      pauseButton.innerText = "Pause Game"
      gamePaused = false;
    }
  }

  // pause/resume function:
  pauseButton.addEventListener("click", () => {
    if (timerId) {                     // this way value is NOT null
      pauseGame();
    } else {
      resumeGame();
    }
  })

  // game time:
  function timer() {
    if (gameInProgress && !gamePaused) {
      time++
      updateTimeModifier();
      updateSpeedModifier()     // !!!!!!
    }
  }
  // speed modifier:
  function updateSpeedModifier() {
    speedMultiplier = 1 + (time / 300)
    moveDownSpeed = 1000 * speedMultiplier;
    console.log(moveDownSpeed)
    return moveDownSpeed
  }
  // time multiplier
  function updateTimeModifier() {
    timeMultiplier = 1 + (time / 60) * 0.15
  }
  
  // add score
  function addScore() {
    let rowCounter = 0;
    for (let i = 0; i < 199; i += width) {
      const row  = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6,  i + 7, i + 8, i + 9]
      if (row.every(index => squares[index].classList.contains("taken"))) {
        rowCounter++
        row.forEach(index => {
          squares[index].classList.remove("taken")
          squares[index].classList.remove("tetromino")
          squares[index].style.backgroundColor = ""
        })
        const squaresRemoved = squares.splice(i, width)
        console.log(squaresRemoved)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }

    function counterReset() {
      rowCounter = 0;
      // console.log(`PING: Counter now at ${rowCounter}`)
    }
    
    let comboMultiplier = null;
    if (rowCounter === 1) {
      comboMultiplier = 1;
    } else if (rowCounter === 2) {
      comboMultiplier = 1.25;
    } else if (rowCounter === 3) {
      comboMultiplier = 1.5;
    } else if (rowCounter === 4) {
      comboMultiplier = 2;
    }
    
    score = Math.round(score + (10 * rowCounter * comboMultiplier * timeMultiplier));
    scoreValue.innerHTML = score;
    // console.log(`rowCounter of ${rowCounter} --> Combo Multiplier: ${comboMultiplier}`)
    // let scoreChange = (10 * rowCounter * comboMultiplier * timeMultiplier)
    // console.log(`Score Change: ${scoreChange}`)
    rowCounterResetID = setTimeout(counterReset, 100 )

    console.log(`Speed Multiplier: ${speedMultiplier}`)
  }

  // clear board:
  function clearGrid() {
    gridCells.forEach(index => {
      index.classList.remove("taken");
      index.classList.remove("tetromino")
    })
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      // scoreDisplay.innerHTML = 'end'
      gameInProgress = false;
      clearInterval(timerId)
      clearGrid();
      clearInterval(gameTimeID)
      // updateHighScore                      !!!!!!!!!!!!
    }
  }
}) 