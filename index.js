/*
 * TODO: queens
 */

var width, height, boardSize, boardX, boardY, cellSize, board
var turn = 0
var ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=" ]
var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"]
var num = [ 12, 12 ]
var hist = []
var historyDiv

function setup() {
	historyDiv = document.getElementById("history")
	updateHistory()

	width = Math.max(
    document.documentElement["clientWidth"],
    document.body["scrollWidth"],
    document.documentElement["scrollWidth"],
    document.body["offsetWidth"],
    document.documentElement["offsetWidth"]
	)

	height = Math.max(
    document.documentElement["clientHeight"],
    document.body["scrollHeight"],
    document.documentElement["scrollHeight"],
    document.body["offsetHeight"],
    document.documentElement["offsetHeight"]
	)

	boardSize = Math.min(width, height) - 16
	boardX = 0 //(width - boardSize) / 2
	boardY = 0 // (height - boardSize)
	cellSize = boardSize / 8
	board = []

	for (var x = 0; x < 8; x++) {
		board[x] = []

		for (var y = 0; y < 8; y++) {
			if ((x + y) % 2 == 0 && (y < 3 || y > 4)) {
				board[x][y] = y > 4 ? 1 : 2
			} else {
				board[x][y] = 0
			}
		}
	}

	createCanvas(boardSize, boardSize);
}

var lastId
var lastChoice

function keyPressed() {
	if (key >= "a" && key <= "z") {
		lastChoice = key
	} else {
		lastChoice = null
		lastId = key
	}
}

var important

function draw() {
	clear()
	noStroke()
	var id = 0
	var xx = -1
	var yy = -1

	important = false

	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 8; x++) {
			board[x][y] = Math.abs(board[x][y])

			if (board[x][y] == turn + 1) {
				var tr = []
				checkEats(tr, x, y)

				if (tr.length > 0) {
					important = true
					board[x][y] = -(board[x][y])
				}
			}
		}
	}

	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 8; x++) {
			if ((x + y) % 2 == 0) {
				fill(200)
			} else {
				fill(50)
			}

			rect(x * cellSize + boardX, y * cellSize + boardY, cellSize, cellSize)

			var rv = board[x][y]
			var v = Math.abs(board[x][y])

			if (v > 0) {
				var s = cellSize * 0.8

				if (v - 1 == turn && ids[id] == lastId) {
					fill(255, 10, 10)
					xx = x
					yy = y
				} else {
					if (rv < 0) {
						fill(150, 0, 0)
					} else {
						fill(v == 2 ? 0 : 255)
					}
				}

				stroke(v == 2 ? 255 : 0)
				strokeWeight(3)
				ellipse(x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5, s, s)
				noStroke()

				if (v - 1 == turn) {
					textSize(32)
					fill(turn == 0 ? 50 : 255)
					textAlign(CENTER)
					text(ids[id], x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5 + 12)
					id++
				}
			}
		}
	}

	if (xx > -1 && lastId) {
		var turns = getTurns(xx, yy, turn)

		for (var i = 0; i < turns.length; i++) {
			var [x, y, must, enx, eny] = turns[i]

			if (Array.isArray(x)) {
				var xxx, yyy
				for (var j = 0; j < x.length; j++) {
					xxx = x[j]
					yyy = y[j]
					var ex = enx[j]
					var ey = eny[j]

					var s = cellSize * 0.6
					fill(255, 0, 0)
					ellipse(ex * cellSize + boardX + cellSize * 0.5, ey * cellSize + boardY + cellSize * 0.5, s, s)

					s = cellSize * 0.5
					fill(140, 0, 0)
					ellipse(xxx * cellSize + boardX + cellSize * 0.5, yyy * cellSize + boardY + cellSize * 0.5, s, s)
				}

				textSize(32)
				fill(240)
				textAlign(CENTER)
				text(letters[i], xxx * cellSize + boardX + cellSize * 0.5, yyy * cellSize + boardY + cellSize * 0.5 + 12)
			} else {
				var s = cellSize * (must ? 0.8 : 0.5)

				if (must) {
					fill(140, 0, 0)
				} else {
					fill(0, 140, 0)
				}

				ellipse(x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5, s, s)

				textSize(32)
				fill(240)
				textAlign(CENTER)
				text(letters[i], x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5 + 12)
			}
		}

		if (lastChoice) {
			var i = letters.indexOf(lastChoice)

			if (i == -1 || !(turns[i])) {
				lastChoice = null
			} else {
				var move = turns[i]
				var enemy = (turn + 1) % 2

				if (move[2]) {
					num[enemy] -= move[3].length

					for (var m = 0; m < move[3].length; m++) {
						board[move[3][m]][move[4][m]] = 0
					}
				}

				board[xx][yy] = 0

				if (Array.isArray(move[0])) {
					var s = `${xx + 1}:${7 - yy + 1}`

					for (var i = 0; i < move[0].length; i++) {
						s += ` -> ${move[0][i] + 1}:${7 - move[1][i] + 1}`
					}

					hist.push(s)
					board[move[0][move[0].length - 1]][move[1][move[1].length - 1]] = turn + 1
				} else {
					board[move[0]][move[1]] = turn + 1
					hist.push(`${xx + 1}:${7 - yy + 1} -> ${move[0] + 1}:${7 - move[1] + 1}`)
				}

				lastChoice = null
				lastId = null
				turn = (turn + 1) % 2
				updateHistory()

				if (num[enemy] <= 0) {
					var s = "Player " + turn + " won!"
					hist.push(s)
					updateHistory()
					alert(s)
				}
			}
		}
	}
}

function updateHistory() {
	var str = ["<h3>History</h3>"]

	for (var i = 0; i < hist.length; i++) {
		str.push(hist[i])
		str.push(i % 2 == 0 ? " (w)<br/>" : " (b)<br/>")
	}

	historyDiv.innerHTML = str.join("")
}

function getTurns(x, y, tn) {
	var turns = []
	var dir = tn == 1 ? 1 : -1

	if (!important) {
		addMoves(turns, dir, x, y, -1)
		addMoves(turns, dir, x, y, 1)
	}

	checkEats(turns, x, y)

	return turns
}

function checkEat(turns, dir, x, y, j, nx, ny, ext) {
	if (-dir == ny && -j == nx) {
		return
	}

	var turn = [ x + 2 * j, y - 2 * dir ]
	var enemy = [ x + j, y - dir ]

	turn[2] = true
	turn[3] = [enemy[0]]
	turn[4] = [enemy[1]]

	if (isValidTurn(turn[0], turn[1]) && isBusyByEnemy(enemy[0], enemy[1]) && !isBusy(turn[0], turn[1])) {
		if (ext) {
			if (!Array.isArray(ext[0])) {
				ext[0] = [ext[0]]
				ext[1] = [ext[1]]
				ext[2] = true
				ext[3] = [ext[3]]
				ext[4] = [ext[4]]
			}

			ext[0].push(turn[0])
			ext[1].push(turn[1])
			ext[3].push(enemy[0])
			ext[4].push(enemy[1])

			checkEats(turns, turn[0], turn[1], j, dir, ext)
		} else {
			var t = [turn[0], turn[1], true, turn[3], turn[4]]
			turns.push(t)

			checkEats(turns, turn[0], turn[1], j, dir, t)
		}
	}
}

function checkEats(turns, x, y, nx, ny, ext) {
	checkEat(turns, 1, x, y, -1, nx, ny, ext)
	checkEat(turns, -1, x, y, -1, nx, ny, ext)
	checkEat(turns, 1, x, y, 1, nx, ny, ext)
	checkEat(turns, -1, x, y, 1, nx, ny, ext)
}

function addMoves(turns, dir, x, y, j) {
	var firstBrk = false

	for (var i = 1; i < 8; i++) {
		var turn = [ x + i * j, y + i * dir ]

		if (!isValidTurn(turn[0], turn[1]) || isBusy(turn[0], turn[1])) {
			break
		}

		turns.push(turn)
		break
	}
}

function isValidTurn(x, y) {
	if (x < 0 || y < 0 || x > 7 || y > 7) {
		return false
	}

	return true
}

function isBusy(x, y) {
	return board[x][y] != 0
}

function isBusyBySelf(x, y) {
	return board[x][y] == turn + 1
}

function isBusyByEnemy(x, y) {
	return board[x][y] == (turn == 0 ? 2 : 1)
}