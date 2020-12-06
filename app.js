document.addEventListener("DOMContentLoaded", () => {

    // TO DO:

    // allow for last-second adjustment of tetrominoes?? 
    // add "lock" to movement functions during pause
    // prevent movement after connection has been made in certain conditions when making last second adjustments   -- ADD "TAKEN" DETECTION ON THE SIDES TOO?

  //////  ^ Add same sort of function to rotate as the one in draw/undraw - taken detection          !!!!!!!!!!!!!!!!!!!!!!


    // look (again) into edge interactions...

    // TEST COMBO MULTIPLIER AGAIN to be sure
    // add High Score (5x)        [gameOver function]

    // DONE:
        // FIXED: pausing before game start and then starting causes a double timer...
        // FIXED: Enter to start --> solved by replacing it with space bar and adding extra functionality to space bar
        // FIXED: ending a game and then starting a new one still uses the old tetromino placement 
       

    const width = 10
    let nextRandom = 0;
    let timerId = null;
    let score = 0;
    
    const scoreValue = document.querySelector(".score-value")
    const startButton = document.querySelector(".start-game-button")
    const pauseButton = document.querySelector(".pause-button")
    const endButton = document.querySelector(".end-game-button")

    let squares = Array.from(document.querySelectorAll(".grid div"))
    let gridCells = Array.from(document.querySelectorAll(".grid-cell"))
    const grid = document.querySelector(".grid")

    let gameInProgress = false;
    let gamePaused = false;
    let gameEnded = false;
    let time = 0;
    let timeMultiplier = 1;
    let speedMultiplier = 1;
    let moveDownSpeed = 1000;

    const colors = [
      "#F7FF28",
      "#FF3BC1",
      "#00DC93",
      "#00FAFB",
      "#FF2525",
      "#2800F0"
    ]

    // colors = [      choose some of these for the first group 
    //   "#00D2FC",    TEAL BLUE
    //   "#FEFEDF",    
    //   "#ff5e3d",
    //   "#daabff",
    //   "#00C9A7",    Mint Green
    //   "#ffc75f"     orange-ish
    // ]
   
  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [0, width, width+1, width+2]
  ]

  const l2Tetromino = [
    [0, 1, width+1, width*2+1],
    [2, width, width+1, width+2],
    [1, width+1, width*2+1,width*2+2],
    [width, width+1, width+2, width*2]
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

  const theTetrominoes = [lTetromino, l2Tetromino, zTetromino, tTetromino, oTetromino, iTetromino]

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

    if (gamePaused || gameEnded) {
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
      if (!gameInProgress && !gameEnded) {
        startNewGame();
      } else if (gameEnded) {
        restartGame();    
      } else if (gamePaused) {
        resumeGame();
      } else if (gameInProgress && !gamePaused) {  // is gameInProgress needed here?
        pauseGame()
      }
    } else if (e.keyCode === 27) {
      endGame();
    }
  }

  document.addEventListener("keydown", control)

  function moveDown() {
    if (!gamePaused) {
      undraw()
      currentPosition += width
      draw()
      freeze()
    }
  }

  //freeze function
  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains("taken")) ) {
        current.forEach(index => squares[currentPosition + index].classList.add("taken"))

        // start a new tetromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
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
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],                   // l   (reverse)
    [0, 1, displayWidth + 1, displayWidth * 2 + 1],                   // l2  (normal L)
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

  function logStates() {
    console.log(`game in progress: ${gameInProgress}`)
    console.log(`game paused: ${gamePaused}`)
    console.log(`game ended: ${gameEnded}`)
    console.log("---------------------")
  }

  // Game State Functions:
  function resetStates() {
    gameInProgress = false;
    gamePaused = false;
    gameEnded = false;
  }

  function resetModifiers() {
    time = 0;
    timeMultiplier = 1;
    speedMultiplier = 1;
    moveDownSpeed = 1000;
    clearInterval(timerId)
    clearInterval(gameTimeID)
  }

  function resetScore() {
    scoreValue.innerText = "0"
    score = 0;
  }

  function initiateTetrominoes() {
    draw()
    nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    displayShape()
    timerId = setInterval(moveDown, moveDownSpeed)
    gameTimeID = setInterval(timer, 1000) // measures game time
    startButton.disabled = true;
  }

  // reset tetromino information:
  function resetTetromino() {
    nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    random = nextRandom
    currentPosition = 4;
    currentRotation = 0;
    current = theTetrominoes[random][currentRotation]
  }

  // start a new game after previous ended
  function restartGame() {
    resetScore()
    resetStates()
    // resetModifiers()
    clearGrid();
    resetTetromino();
    gameInProgress = true

    // nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    draw()
    nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    displayShape()
    timerId = setInterval(moveDown, moveDownSpeed)
    gameTimeID = setInterval(timer, 1000)
    startButton.disabled = true;
    console.log(`RESTARTED STATS - speedMultiplier: ${speedMultiplier} || moveDownSpeed: ${moveDownSpeed}`)
  }

  function startNewGame() {
    initiateTetrominoes()
    gameInProgress = true;
  }
  
  function pauseGame() {
    if (gameInProgress) {
      clearInterval(timerId)
      timerId = null;
      pauseButton.innerText = "Resume Game"
      gamePaused = true;      
    }
  }

  function resumeGame() {
    if (gamePaused) {
      gamePaused = false;
      draw()
      timerId = setInterval(moveDown, moveDownSpeed)
      pauseButton.innerText = "Pause Game"
    }
  }

  function endGame() {
    gameInProgress = false;
    gameEnded = true
    resetModifiers()
    undraw()
    startButton.disabled = false;
  }

  // BUTTON FUNCTIONS:
  startButton.addEventListener("click", () => {
    if (!gameInProgress && !gameEnded) {
      startNewGame();
    } else if (!gameInProgress && gameEnded) {
      restartGame();
    }
  })

  // pause/resume function:
  pauseButton.addEventListener("click", () => {
    if (timerId) {
      pauseGame();
    } else {
      resumeGame();
      console.log(`RESUMED STATS - speedMultiplier: ${speedMultiplier} || moveDownSpeed: ${moveDownSpeed}`)
    }
  })

  // end game button function:
  endButton.addEventListener("click", () => {
    if (gameInProgress) {
      endGame();
    }
  })

  // game time:     updates the diffilcuty and score multipliers
  function timer() {
    if (gameInProgress && !gamePaused) {
      time++
      updateTimeModifier();
      updateSpeedModifier();

      console.log(`speedMultiplier: ${speedMultiplier}`)
      console.log(`moveDownSpeed: ${moveDownSpeed}`)
      console.log(`timeMultiplier: ${timeMultiplier}`)
    }
  }

  // DIFFICULTY SETTINGS:
  // speed modifier:
  function updateSpeedModifier() {
    speedMultiplier = 1 + (time / 300)
    moveDownSpeed = 1000 / speedMultiplier;
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

    // add permanent increase of .001 - .003 based on the combo?
    
    score = Math.round(score + (10 * rowCounter * comboMultiplier * timeMultiplier));
    scoreValue.innerHTML = score;
    // console.log(`rowCounter of ${rowCounter} --> Combo Multiplier: ${comboMultiplier}`)
    // let scoreChange = (10 * rowCounter * comboMultiplier * timeMultiplier)
    // console.log(`Score Change: ${scoreChange}`)
    rowCounterResetID = setTimeout(counterReset, 100 )

    // console.log(`Speed Multiplier: ${speedMultiplier}`)
  }
  // clear board:
  function clearGrid() {
    gridCells.forEach(index => {
      index.classList.remove("taken");
      index.classList.remove("tetromino")
      index.style.backgroundColor = ""
    })
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      endGame()
      // updateHighScore
    }
  }
}) 