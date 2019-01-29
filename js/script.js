var humanScore = 0;
var compScore = 0;
var huPlayer = '';
var aiPlayer = '';
var boardStatus = [];
// var turns = 0;
var instructions = '';
var selected = false;
var gameActive = true;

var turnActive = false;

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2]
]

// Updates the game instructions when called.
function setInstructions(instructions) {
  // console.log("Instr:" + instructions);
  document.getElementById('game-status').innerHTML = instructions;
}


const spaces = document.querySelectorAll('.space');
initializeGame();

// Creates an array of the spaces on the board, sets plauyers pieces to blank,
// resets styles for game, sets all spaces to blank
function initializeGame() {
  boardStatus = Array.from(Array(9).keys());
  huPlayer = "";
  aiPlayer = "";
  selected = false;
  gameActive = true;
  document.getElementById('pieceX').style.backgroundColor="blue";
  document.getElementById('pieceO').style.backgroundColor="blue";

  for (var i=0; i<spaces.length; i++) {
    spaces[i].getElementsByTagName("P")[0].innerHTML ='';
    spaces[i].style.removeProperty('background-color');
    spaces[i].addEventListener('click', turnClick, false);
  }
}


// Listens for player to select their piece
document.getElementById('pieceX').addEventListener('click', function() {
  if (huPlayer == '') {
    huPlayer = "X";
    aiPlayer = "O";

    selectPiece(huPlayer);
  }
})

document.getElementById('pieceO').addEventListener('click', function() {
  if (huPlayer == '') {
    huPlayer = "O";
    aiPlayer = "X";

    selectPiece(huPlayer);
  }
})

// Runs when player selects their piece, updates style to reflect choice
function selectPiece(huPlayer) {
  if (huPlayer == 'X') {
    document.getElementById('pieceX').style.backgroundColor="red";
  } else if (huPlayer == 'O') {
    document.getElementById('pieceO').style.backgroundColor="red";
  }

  document.getElementById('header').innerHTML = 'Player is using:';

  selected = true;
  pickStarter();
}

// Randomly selects which player will go first, triggered after user chooses piece
function pickStarter() {
  var starter =  Math.floor(Math.random() * 2);

  if (starter == 0) {
    starter = "player";
  } else if (starter == 1) {
    starter = "computer";
  }

  if (starter == "player") {
    instructions = 'You make the first move! Good Luck!';
    setInstructions(instructions);
  } else if (starter == "computer") {
    turnActive = true;
    instructions = 'The computer goes first..';
    setInstructions(instructions);
    var compSpace = Math.floor(Math.random() * 9);
    setTimeout(function() {
      turn(compSpace, aiPlayer);
      instructions = "Your turn!";
      setInstructions(instructions);
    }, 500);
  }
}

// Checks that selected space is empty, and it is human player's turn,
// immediately follows up with computers turn as long as game not over
function turnClick(space) {
  if (selected) {
    if (typeof boardStatus [space.target.id] == 'number') {
      if (!turnActive) {

        turn(space.target.id, huPlayer);
        if (!checkTie()) {
          turnActive = true;

          instructions = "Computer is going. Please hold..";
          setInstructions(instructions);

          setTimeout(function() {
            turn(bestSpot(), aiPlayer);
            if (gameActive) {
              // console.log(instructions);
              instructions = "Your turn!";
              setInstructions(instructions);
            }
          }, 500);
        }
      }
    }
  }
}

// Handles turn for each player, sets board to player's piece and checks for win
function turn(spaceNum, player) {
  boardStatus[spaceNum] = player;
  document.getElementById(spaceNum).getElementsByTagName("P")[0].innerHTML = player;
  // console.log(spaceNum + " " + boardStatus);
  let gameWon = checkWin(boardStatus, player);
  if (gameWon) gameOver(gameWon);
  checkTie();
  turnActive = false;
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) =>
    (e === player) ? a.concat(i) : a, []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = {index: index, player: player};
      break;
    }
  }
  // console.log(gameWon);
  return gameWon;
}

// Updates game board to indicate winner
function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player == huPlayer ? "green" : "red";
  }
  for (var i=0; i< spaces.length; i++) {
    spaces[i].removeEventListener('click', turnClick, false);
  }
  declareWinner(gameWon.player);
}

// When game is over increment score appropriately
function updateScore(player) {
  if (player == huPlayer) {
    humanScore++;
    document.getElementById("player-score").innerHTML = humanScore;
  } else if (player == aiPlayer) {
    compScore++;
    document.getElementById("comp-score").innerHTML = compScore;
  }
}

// Runs minimax function to find best spot for computer piece
function bestSpot() {
  return minimax(boardStatus, aiPlayer).index;
}

// Returns an array of the remaining empty squares (!= to X or O)
function emptySquares() {
  return boardStatus.filter(s => typeof s == 'number')
}

// Check for a tie
function checkTie() {
  if (emptySquares().length == 0) {
    for (var i =0; i<spaces.length; i++) {
      spaces[i].style.backgroundColor = 'orange';
      spaces[i].removeEventListener('click', turnClick, false);
    }

    declareWinner("Tie Game!");
    return true;
  }
  return false;
}

// Declare winner when game is over
function declareWinner(who) {
  gameActive = false;

  if (who !== "Tie Game!") {
    updateScore(who);
    setInstructions(who == huPlayer ? "You win!" : "You Lose");
  } else {
    setInstructions(who);
  }
}

// Main AI function for computer player
function minimax(newBoard, player) {
  var availSpots = emptySquares(newBoard); // Find the empty spaces of the current game state

  // Check each board for terminal states (if there is a winner) and return a score for each possibility.
  if (checkWin(newBoard, player)) {
    return {score: -10};
  } else if (checkWin(newBoard, aiPlayer)) {
    return {score: 10};
  } else if (availSpots.length === 0) {
    return {score: 0};
  }
  // Collest the scores from each of the available spots
  var moves = [];
  // Loop through availSpots and collect each squares index and score.
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    // Set the index # of the empty spot (stored as a number in boardStatus) as the index property of the move object
    move.index = newBoard[availSpots[i]];
    // Set the empty spot of the newBoard to the current player
    newBoard[availSpots[i]] = player;
    // Call the minimax function with the other player and updated newBoard
    if (player == aiPlayer) {
      // call minimax for opponent with new board
      var result = minimax(newBoard, huPlayer);
      // Store the result of the minimax call to the score property of the move object
      move.score = result.score;
    } else {
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    // Resets newBoard to what it was before
    newBoard[availSpots[i]] = move.index;

    // Push move object to the moves array
    moves.push(move);
  }

  // Evaluate the best move in the moves array
  var bestMove;
  // Should choose the highest score when the ai is playing, and the lowest score when human is playing
  if(player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}


// Resets the game for another play, does not reset score
document.getElementById('game-reset').addEventListener('click', function() {
  var reset = confirm('This action will reset the game board. Your game will be lost. Do you want to continue?');
  if (reset) {
    setInstructions("Game was reset, choose your piece.");
    initializeGame();
  }
});

// Resets the ongoing game score.
document.getElementById('score-reset').addEventListener('click', function() {
  humanScore = 0;
  compScore = 0;

  document.getElementById("player-score").innerHTML = humanScore;
  document.getElementById("comp-score").innerHTML = compScore;

});
