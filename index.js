var width, height, boardSize, boardX, boardY, cellSize, board
var turn = 0
var ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=" ]
var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"]
var num = [ 12, 12 ]
var hist = []
var historyDiv
var peer, conn
var serve = false
var won = -1
var g

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


	var gt = {},
	args = location.search.substr(1).split(/&/);
	
	for (var i = 0; i < args.length; i++) {
		var tmp = args[i].split(/=/);
		
		if (tmp[0] != "") {
			gt[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp.slice(1).join("").replace("+", " "));
		}
	}

	g = gt

  peer = new Peer(gt.i || "null", {host: 'localhost', port: 9000, path: '/'});

	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
	});

	if (gt.c) {
		serve = true
		conn = peer.connect(gt.c);
		setupCon(gt)
	}

	peer.on('connection', function(c) {
		conn = c
		console.log('Connected to ' + c.id)
		setupCon(gt)
		resetBoard()
	});

	createCanvas(boardSize, boardSize);
}

var selfType = -1

function resetBoard() {
	selfType = -1
	won = -1
	lastId = null
	lastChoice = null

	for (var x = 0; x < 8; x++) {
		board[x] = []

		for (var y = 0; y < 8; y++) {
			if ((x + y) % 2 == 0 && (y < 3 || y > 4)) {
				board[x][y] = y > 4 ? 3 : 2 // fixme 1 : 2
			} else {
				board[x][y] = 0
			}
		}
	}

	hist = []
	updateHistory()

	if (conn != null) {
		selectTurn()
	}
}

function setupCon() {
	resetBoard()

	conn.on('data', function(data) {
		if (data.charAt(0) == "k") {
			key = data.substr(1, data.length)
			keyPressed(false, true)
		} else if (data.charAt(0) == "s") {
			selfType = data.indexOf("w") != -1 ? 0 : 1
			console.log("You play as " + (selfType == 0 ? "white" : "black"))
			updateHistory()
		} else if (data == "r") {
			resetBoard()
		} else {
			console.error("Unknown message " + data)
		}
	});

	conn.on("open", function(data) {
		if (serve) {
			selectTurn()

			console.log('Connected to ' + g.c)
			resetBoard()
		}
	})
}

var lastId
var lastChoice

function selectTurn() {
	selfType = Math.random() > 0.5 ? 0 : 1	

	if (g.w) {
		selfType = 0
	} else if (g.b) {
		sefType = 1
	} 

	console.log("You play as " + (selfType == 0 ? "white" : "black"))
	conn.send("s" + (selfType == 0 ? "b" : "w"))
	updateHistory()
}

function keyPressed(k, t) {	
	if (won != -1 && key == "r") {
		conn.send("r")
		resetBoard()
		return
	}

	if (turn != selfType && !t) {
		return
	}

	if (key >= "a" && key <= "z") {
		lastChoice = key

		if (conn && !t) {
			conn.send("k" + key)
		}
	} else if (key >= "0" && key <= "9" || key == "=" || key == "-") {
		lastChoice = null
		lastId = key

		if (conn && !t) {
			conn.send("k" + key)
		}
	}
}

var important

function draw() {
	clear()

	if (!conn) {
		return
	}

	noStroke()
	var id = 0
	var xx = -1
	var yy = -1

	important = false

	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 8; x++) {
			board[x][y] = Math.abs(board[x][y])

			if ((board[x][y] - 1) % 2 == turn) {
				var tr = []
				checkEats(tr, x, y)
				var cnt = tr.length

				if (cnt == 0) {
					tr = getTurns(x, y, turn)

					for (var j = 0; j < tr.length; j++) {
						if (tr[j][2]) {
							cnt = 1
							break
						}
					}
				}

				if (cnt > 0) {
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
			var v = Math.abs(board[x][y] - 1) % 2 + 1
			var dm = Math.abs(board[x][y]) > 2

			if (board[x][y] != 0) {
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

				if (dm) {
					stroke(255, 150, 0)
				} else {
					stroke(v == 2 ? 255 : 0)
				}

				strokeWeight(dm ? 6 : 3)
				ellipse(x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5, s, s)
				noStroke()

				if (v - 1 == turn) {
					textSize(32)
					textAlign(CENTER)
					fill(turn == 0 ? 50 : 255)
					
					if (selfType == turn) {
						text(ids[id], x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5 + 12)
					}
					
					id++
				}
			}
		}
	}

	if (xx > -1 && lastId) {
		var turns = getTurns(xx, yy, turn)

		for (var i = 0; i < turns.length; i++) {
			var [x, y, must, enx, eny] = turns[i]

			if (!must && important) {
				continue
			}

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

				if (selfType == turn) {
					textSize(32)
					fill(240)
					textAlign(CENTER)
					text(letters[i], xxx * cellSize + boardX + cellSize * 0.5, yyy * cellSize + boardY + cellSize * 0.5 + 12)
				}
			} else {
				var s = cellSize * (must ? 0.8 : 0.5)

				if (must) {
					fill(140, 0, 0)
				} else {
					fill(0, 140, 0)
				}

				ellipse(x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5, s, s)

				if (selfType == turn) {
					textSize(32)
					fill(240)
					textAlign(CENTER)
					text(letters[i], x * cellSize + boardX + cellSize * 0.5, y * cellSize + boardY + cellSize * 0.5 + 12)
				}
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

				var dm = Math.abs(board[xx][yy]) > 2
				board[xx][yy] = 0

				if (Array.isArray(move[0])) {
					var s = `${xx + 1}:${7 - yy + 1}`
					var l = move[0].length

					for (var i = 0; i < l; i++) {
						s += ` -> ${move[0][i] + 1}:${7 - move[1][i] + 1}`
					}

					if (move[1][l - 1] == (turn == 0 ? 0 : 7)) {
						dm = true
					}

					hist.push(s)
					board[move[0][l - 1]][move[1][l - 1]] = turn + 1 + (dm ? 2 : 0)
				} else {
					if (move[1] == (turn == 0 ? 0 : 7)) {
						dm = true
					}

					board[move[0]][move[1]] = turn + 1 + (dm ? 2 : 0)
					hist.push(`${xx + 1}:${7 - yy + 1} -> ${move[0] + 1}:${7 - move[1] + 1}`)
				}

				lastChoice = null
				lastId = null
				turn = (turn + 1) % 2
				updateHistory()

				if (num[enemy] <= 0) {
					won = turn
					var s = "Player " + turn + " won!"
					hist.push(s)
					updateHistory()
				}
			}
		}
	}
}

function updateHistory() {
	var str = ["<h3>History</h3>", conn ? ("You play as " + (selfType == 0 ? "white<br/>" : "black<br/>")) : "Awaiting connection<br/>"]

	if (won != -1) {
		str.push("Press R to restart<br/>")
	} else 	if (conn) {
		str.push(turn == selfType ? "It's your turn<br/><br/>" : "It's your opponent's turn<br/><br/>")
	}

	for (var i = 0; i < hist.length; i++) {
		str.push(hist[i])
		str.push(i % 2 == 0 ? " (w)<br/>" : " (b)<br/>")
	}

	historyDiv.innerHTML = str.join("")
}

function getTurns(x, y, tn) {
	var turns = []
	var dir = tn == 1 ? 1 : -1
	var dm = Math.abs(board[x][y]) > 2

	if (!important || dm) {
		addMoves(turns, dir, x, y, -1, dm)
		addMoves(turns, dir, x, y, 1, dm)

		if (dm) {
			addMoves(turns, -dir, x, y, -1, dm)
			addMoves(turns, -dir, x, y, 1, dm)
		}
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

function addMoves(turns, dir, x, y, j, dm) {
	var firstBrk = false

	for (var i = 1; i < 8; i++) {
		var turn = [ x + i * j, y + i * dir ]

		if (!isValidTurn(turn[0], turn[1])) {
			break
		}

		if (isBusy(turn[0], turn[1])) {
			if (dm) {
				if (isBusyBySelf(turn[0], turn[1])) {
					break
				}

				if (firstBrk) {
					break
				}

				firstBrk = true
				continue
			}
			
			break
		}
	
		if (firstBrk) {
			turn[2] = true
			turn[3] = x + (i - 1) * j
			turn[4] = y + (i - 1) * dir
		}

		if (!important || turn[2]) {
			turns.push(turn)
		}
		
		if (firstBrk) {
			// console.log("Check " + j + " " + -dir)
			// checkEats(turns, turn[0], turn[1], j, -dir)
		}

		if (!dm || firstBrk) {
			break
		}
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
	return Math.abs(board[x][y]) == turn + 1 || Math.abs(board[x][y]) == turn + 3
}

function isBusyByEnemy(x, y) {
	return Math.abs(board[x][y]) == (turn == 0 ? 2 : 1) || Math.abs(board[x][y]) == (turn == 0 ? 4 : 3)
}