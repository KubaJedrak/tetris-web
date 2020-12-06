if (current.some(index => squares[currentPosition + index + width].classList.contains("taken")) ) {
    current.forEach(index => squares[currentPosition + index].classList.add("taken"))

    // start a new tetromino falling
    // .....
}


// last minute adjustment: 

// in "freeze" or "moveDown" ????   setTimeout

// ------------------------------------------------

//    const isNextLeftEdge = current.some(index => (currentPosition + index) % width === 0);
  
// if (!isNextLeftEdge) currentPosition -= 1; // ...

// if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
//     currentPosition += 1;
// }