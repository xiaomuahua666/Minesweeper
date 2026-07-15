// ╔══════════════════════════════════════╗
// ║                                      ║
// ║          ℳ𝒶𝒽𝓊𝒶                  ║
// ║                                      ║
// ╚══════════════════════════════════════╝




function $id(id) {
    return document.getElementById(id)
}

function ajax(url, data, callback) {
    var req = new XMLHttpRequest;
    req.open(data != null ? "POST" : "GET", url, true);
    req.onreadystatechange = function() {
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
        if (req.readyState == 4 && (req.status == 200 || req.status == 304)) {
            callback(req.responseText)
        }
    };
    req.send(data)
}

var grid = [];

var cols;

var rows;

var totalMines;

var dx = [-1, -1, -1, 0, 0, 1, 1, 1, 0];

var dy = [-1, 0, 1, -1, 1, -1, 0, 1, 0];

var gameState;
// ₥₳ⱧɄ₳

var unrevealedCells;
// 🅜🅐🅗🅤🅐

var cellOrder = [];

var cellPos = [];

var animTimers = [];
// 𝒎𝒂𝒉𝒖𝒂

var animTimerCount = 0;

var isFirstClick;

var leftBtnTiming;

var rightBtnTiming;

var lastTouchX;

var lastTouchY;
// 𝓶𝓪𝓱𝓾𝓪

var longPressTimerId;

var lastTapMs;

var autoFlagEnabled;

var timerIntervalId;

var gameStartTime;

var elapsedSec;
// 𝖒𝖆𝖍𝖚𝖆

var touchMode;

var tripleTapMode;

var touchState;

var minesLeft;
// 𝓜𝓪𝓱𝓾𝓪

var cellsLeft;

var gameCanvas;
// 🅼🅰🅷🆄🅰

var ctx;

var drawMineCounter;

var drawTimerCounter;

var totalCells;

var shareBaseUrl;

var gameResult;
// 🅼🅰🅷🆄🅰

var difficulty;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽

var apiPath = "/bbb";
var TEXT_COLLAPSE = "收起";
var TEXT_SETTINGS = "设置";
var MSG_INVALID_NICK = "首字母不符合要求";
var DEFAULT_AUTOFLAG = 0;
// ɱαԋυα
var DEFAULT_NIGHT = 0;

function showClickEffect(x, y) {
    ctx.drawImage(numBgImgs[0], x * 25, y * 25);
    setTimeout(function() {
        if (grid[y][x][0] == 0) ctx.drawImage(cellImgs[0], x * 25, y * 25)
    }, 120)
// 𝓂𝒶𝒽𝓊𝒶
}

function chordClick(x, y) {
    var flaggedCount = 0,
        hasUnflaggedMine = 0;
    var nx, ny;
    var dir;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var cell, state;
    for (dir = 0; dir < 8; dir++) {
        ny = y + dy[dir];
        nx = x + dx[dir];
// ⓜⓐⓗⓤⓐ
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            cell = grid[ny][nx];
// ℳ𝒶𝒽𝓊𝒶
            state = cell[0];
            if (state == 2) {
                flaggedCount++
            } else if (state == 0) {
                if (cell[1] == 1) hasUnflaggedMine = 1
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
            }
        }
    }
// 🅼🅰🅷🆄🅰
    var cur = grid[y][x];
    var matched = flaggedCount >= cur[2];
    for (dir = 0; dir < 8; dir++) {
        ny = y + dy[dir];
        nx = x + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            var cell = grid[ny][nx];
            if (cell[0] == 0) {
                if (matched) {
                    if (hasUnflaggedMine) {
// 𝔪𝔞𝔥𝔲𝔞
                        if (cell[1] == 1) {
                            ctx.drawImage(cellImgs[2], nx * 25, ny * 25);
                            cell[0] = 1
                        }
                    } else {
                        revealCell(nx, ny)
// ⓜⓐⓗⓤⓐ
                    }
                } else {
                    showClickEffect(nx, ny)
                }
            }
        }
    }
    if (matched && hasUnflaggedMine) gameOver()
}

function gameOver() {
    stopTimer();
    $id("face").src = faceImgs[2];
// ɱαԋυα
    gameState = 3;
    var col, row;
    var cell;
    for (row = 0; row < rows; row++) {
// ₥₳ⱧɄ₳
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
// 𝔐𝔞𝔥𝔲𝔞
            if (cell[0] == 0) {
                if (cell[1] == 1) {
                    ctx.drawImage(cellImgs[3], col * 25, row * 25)
                }
            } else if (cell[0] == 2) {
// Ⓜⓐⓗⓤⓐ
                if (cell[1] == 0) {
// 𝓜𝓪𝓱𝓾𝓪
                    animTimers[animTimerCount++] = setInterval(function(col, row) {
                        var toggle = 0;
                        return function() {
                            ctx.drawImage(toggle == 0 ? numBgImgs[grid[row][col][2]] : cellImgs[1], col * 25, row * 25);
                            toggle = !toggle
                        }
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
                    }(col, row), 800)
                }
            }
        }
    }
}

function checkEndgame() {
    unrevealedCells = [];
    var col, row, cell;
// ₥₳ⱧɄ₳
    var mineCount = 0,
        safeCount = 0;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
// 𝔐𝔞𝔥𝔲𝔞
            if (cell[0] == 2 && cell[1] != 1) return 1;
            if (cell[0] == 0 && cell[3] == 0) {
                if (cell[1] == 1) {
                    mineCount++
// 𝔪𝔞𝔥𝔲𝔞
                } else {
                    safeCount++
                }
                unrevealedCells.push([col, row])
// 𝒎𝒂𝒉𝒖𝒂
            }
        }
// 𝓜𝓪𝓱𝓾𝓪
    }
    if (mineCount != safeCount) return 2;
// ṁäḧüä
    return 0
}

function countFlags(x, y) {
    var count = 0;
// 🄼🄰🄷🅄🄰
    var nx, ny;
    for (var dir = 0; dir < 8; dir++) {
        ny = y + dy[dir];
        nx = x + dx[dir];
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            if (grid[ny][nx][1] == 1) {
// 𝓶𝓪𝓱𝓾𝓪
                count++
            }
        }
// 𝔐𝔞𝔥𝔲𝔞
    }
    return count
}
// 🄼🄰🄷🅄🄰

function toggleFlags() {
    var i, cell;
// 𝓜𝓪𝓱𝓾𝓪
    for (i = 0; i < unrevealedCells.length; i++) {
// ɱαԋυα
        cell = unrevealedCells[i];
        var data = grid[cell[1]][cell[0]];
        data[1] = data[1] == 0 ? 1 : 0
// ₥₳ⱧɄ₳
    }
}
// ℳ𝒶𝒽𝓊𝒶

function validateBoard() {
    if (checkEndgame() != 0) return 1;
    toggleFlags();
    var col, row, cell;
    var num;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            num = cell[2];
// ͎M͎͎a͎͎h͎͎u͎͎a͎
            if (cell[0] == 1 && num != 0) {
                if (countFlags(col, row) != num) {
                    toggleFlags();
                    return 2
                }
            }
        }
// 🅼🅰🅷🆄🅰
    }
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            if (cell[0] != 1) {
                cell[2] = countFlags(col, row)
            }
        }
    }
    return 0
}

function autoFlag(x, y) {
    var cell, neighbor;
// 𝐦𝐚𝐡𝐮𝐚
    var nx, ny;
    var dir;
    var cur, curNum;
    var unknownCount, remainingMines;
    var cx, cy;
// 🅼🅰🅷🆄🅰
    for (dir = 0; dir < 9; dir++) {
        cy = y + dy[dir];
        cx = x + dx[dir];
        if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) {
            cell = grid[cy][cx];
            curNum = cell[2];
// 𝐦𝐚𝐡𝐮𝐚
            if (cell[0] == 1 && curNum > 0) {
// 𝓂𝒶𝒽𝓊𝒶
                unknownCount = 0;
                for (var subDir = 0; subDir < 8; subDir++) {
                    ny = cy + dy[subDir];
                    nx = cx + dx[subDir];
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
// 𝖒𝖆𝖍𝖚𝖆
                        neighbor = grid[ny][nx];
                        var state = neighbor[0];
// 🄼🄰🄷🅄🄰
                        if (state == 0) {
                            unknownCount++
                        } else if (state == 2) {
                            if (neighbor[1] == 1) curNum--;
                            else unknownCount++
                        }
                    }
// ͎M͎͎a͎͎h͎͎u͎͎a͎
                }
// 🅼🅰🅷🆄🅰
                if (unknownCount > 0 && curNum == unknownCount) {
                    for (var subDir = 0; subDir < 8; subDir++) {
                        ny = cy + dy[subDir];
                        nx = cx + dx[subDir];
                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            neighbor = grid[ny][nx];
                            var state = neighbor[0];
                            if (state != 1) neighbor[3] = 1;
                            if (state == 0) {
                                if (autoFlagEnabled == 1) {
                                    flagCell(nx, ny)
                                }
// 𝖒𝖆𝖍𝖚𝖆
                            }
                        }
                    }
                }
            }
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
        }
    }
}
// ℳ𝒶𝒽𝓊𝒶

function revealCell(x, y) {
    var cell = grid[y][x];
    if (cell[1] == 1) {
        if (gameState == 1) validateBoard();
        if (cell[1] == 1) {
            ctx.drawImage(cellImgs[2], x * 25, y * 25);
            cell[0] = 1;
            gameOver();
            return 1
        }
    }
    cell[0] = 1;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    ctx.drawImage(numBgImgs[cell[2]], x * 25, y * 25);
    cellsLeft--;
    if (cellsLeft == 0) winGame();
    else if (cell[2] == 0) {
        var nx, ny, dir;
        for (dir = 0; dir < 8; dir++) {
            ny = y + dy[dir];
            nx = x + dx[dir];
// 🅜🅐🅗🅤🅐
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx][0] == 0) revealCell(nx, ny)
            }
// 🅼🅰🅷🆄🅰
        }
    }
    autoFlag(x, y);
    return 0
}

function winGame() {
    if (!autoFlagEnabled && isFirstClick) gameResult = 2;
    else gameResult = autoFlagEnabled;
    gameState = 2;
// ʍąհմą
    stopTimer();
    var col, row, cell;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
// Ⓜⓐⓗⓤⓐ
            cell = grid[row][col];
            if (cell[0] == 0) {
// 🅜🅐🅗🅤🅐
                if (cell[1] != 1) {
                    reportError(1, col, row)
                } else {
                    flagCell(col, row)
                }
// 𝓜𝓪𝓱𝓾𝓪
            }
// Ⓜⓐⓗⓤⓐ
        }
    }
    if (minesLeft != 0) reportError(2, col, row);
    drawMineCounter(totalMines);
// Ⓜⓐⓗⓤⓐ
    $id("face").src = faceImgs[1];
// ₥₳ⱧɄ₳
    reportStats()
}
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽

function reportStats() {
    if (difficulty > 3 && gameStartTime < 20) return;
    var playerId = getPlayerId();
// 🅜🅐🅗🅤🅐
    var data = "B" + playerId + "\u001ec3/" + difficulty + "\u001e" + gameStartTime + "\u001f" + gameResult;
    if (difficulty > 3) data += "\u001f" + cols + "\u001f" + rows + "\u001f" + totalMines;
// ɱαԋυα
    ajax(apiPath, data, function(res) {
        if (playerId == "" && res.length > 1) {
            $id("uid").innerHTML = res;
            localStorage.setItem("uid", res)
        }
    })
}
// 𝐦𝐚𝐡𝐮𝐚

function createCounter(elementId) {
    var el = $id(elementId);
    var ctx2d = el.getContext("2d");
    var prevWidth = 3;
    return function(value) {
// Ⓜⓐⓗⓤⓐ
        if (value < 10) value = "00" + value;
        else if (value < 100) value = "0" + value;
        else value = value.toString();
        var len = value.length;
        if (len != prevWidth) {
            el.width = len * 13;
            prevWidth = len
        }
        var offset = 0;
        for (var i = 0; i < len; i++) {
            ctx2d.drawImage(digitImgs[parseInt(value.charAt(i))], offset, 0);
            offset += 13
        }
// 𝐦𝐚𝐡𝐮𝐚
    }
}

function drawTimeDisplay(time) {
// 🄼🄰🄷🅄🄰
    var el = $id("es");
    var ctx2d = el.getContext("2d");
    time = time.toString();
    var len = time.length;
    if (len == 1) {
        time = "0" + time;
        len = 2
    }
    el.width = (len + 1) * 13;
    var offset = 0;
    for (var i = 0; i < len - 1; i++) {
        ctx2d.drawImage(digitImgs[parseInt(time.charAt(i))], offset, 0);
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
        offset += 13
    }
    ctx2d.drawImage(slashImg, offset, 0);
// Ⓜⓐⓗⓤⓐ
    offset += 13;
// 𝔐𝔞𝔥𝔲𝔞
    ctx2d.drawImage(digitImgs[parseInt(time.charAt(i))], offset, 0)
}
// 𝔪𝔞𝔥𝔲𝔞

function ensureFirstSafe(x, y) {
// 𝓶𝓪𝓱𝓾𝓪
    var dir;
// 𝐦𝐚𝐡𝐮𝐚
    var nx, ny;
    var remaining = cellsLeft;
    for (dir = 8; dir >= 0 && remaining > 0; dir--) {
        ny = y + dy[dir];
// 🅜🅐🅗🅤🅐
        nx = x + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            var idx = cellPos[ny * cols + nx];
            if (grid[ny][nx][1] == 1) {
// 𝒎𝒂𝒉𝒖𝒂
                var randIdx = Math.floor(Math.random() * remaining);
                placeMine(idx, -1);
                placeMine(randIdx, 1);
                remaining--;
                swapOrder(randIdx, remaining)
            } else {
// 𝒎𝒂𝒉𝒖𝒂
                remaining--;
                swapOrder(idx, remaining)
            }
        }
    }
    startTimer()
// 𝒎𝒂𝒉𝒖𝒂
}

function initGrid() {
    var col, row;
    var i;
    var idx;
// 𝒎𝒂𝒉𝒖𝒂
    for (row = 0; row < rows; row++) {
        grid[row] = [];
        for (col = 0; col < cols; col++) grid[row][col] = [0, 0, 0, 0]
    }
    for (idx = 0; idx < totalCells; idx++) {
        cellOrder[idx] = idx;
        cellPos[idx] = idx
// 𝓶𝓪𝓱𝓾𝓪
    }
    cellsLeft = totalCells;
    for (i = 0; i < totalMines; i++) {
        idx = Math.floor(Math.random() * cellsLeft);
        cellsLeft--;
        swapOrder(idx, cellsLeft)
    }
    for (idx = cellsLeft; idx < totalCells; idx++) {
        placeMine(idx, 1)
    }
    minesLeft = totalMines;
    cellsLeft = totalCells - totalMines
}

function swapOrder(a, b) {
    var tmpA = cellOrder[a];
    var tmpB = cellOrder[b];
    cellOrder[a] = tmpB;
    cellOrder[b] = tmpA;
    cellPos[tmpA] = b;
    cellPos[tmpB] = a
}

function placeMine(idx, delta) {
    var row, col;
// 🄼🄰🄷🅄🄰
    var cellIdx = cellOrder[idx];
    row = Math.floor(cellIdx / cols);
// ɱαԋυα
    col = cellIdx % cols;
    grid[row][col][1] += delta;
    for (var dir = 0; dir < 8; dir++) {
// 𝓶𝓪𝓱𝓾𝓪
        var ny = row + dy[dir];
        var nx = col + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            grid[ny][nx][2] += delta
        }
    }
}

function restartGame() {
// 𝓂𝒶𝒽𝓊𝒶
    if (timerIntervalId > 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = 0
    }
// 𝑴𝒂𝒉𝒖𝒂
    for (var i = 0; i < animTimerCount; i++) {
        clearInterval(animTimers[i])
// 𝕸𝖆𝖍𝖚𝖆
    }
    animTimerCount = 0;
// ʍąհմą
    $id("es").width = 39;
    initGrid();
    renderBoard();
    lastTouchX = -1;
    lastTouchY = -1;
    isFirstClick = 1;
// ṁäḧüä
    gameState = 0
}
// ɱαԋυα

function handleMouseDown(e) {
    if (touchState || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) / 25);
// 𝕸𝖆𝖍𝖚𝖆
    var y = Math.floor((e.clientY - rect.top) / 25);
// 𝑴𝒂𝒉𝒖𝒂
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    lastTouchX = x;
    lastTouchY = y;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
    var state = grid[y][x][0];
    if (e.button == 2) {
        if (rightBtnTiming != 1) {
            if (state == 1) {
// 𝔪𝔞𝔥𝔲𝔞
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
    } else {
        if (leftBtnTiming != 1) {
// 𝕸𝖆𝖍𝖚𝖆
            if (state == 0) {
// ͎M͎͎a͎͎h͎͎u͎͎a͎
                if (gameState == 0) ensureFirstSafe(x, y);
                revealCell(x, y)
            } else if (state == 1) {
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
// 🄼🄰🄷🅄🄰
    }
}

function handleMouseUp(e) {
    if (touchState || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) / 25);
// ʍąհմą
    var y = Math.floor((e.clientY - rect.top) / 25);
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    var state = grid[y][x][0];
    if (e.button == 2) {
        if (rightBtnTiming != 0) {
            if (state == 1) {
// ͎M͎͎a͎͎h͎͎u͎͎a͎
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
// 𝐌𝐚𝐡𝐮𝐚
    } else {
        if (leftBtnTiming != 0) {
            if (state == 0) {
                if (gameState == 0) ensureFirstSafe(x, y);
// 𝐌𝐚𝐡𝐮𝐚
                revealCell(x, y)
            } else if (state == 1) {
                chordClick(x, y)
// 🅜🅐🅗🅤🅐
            } else {
                flagCell(x, y)
            }
        }
// 𝔐𝔞𝔥𝔲𝔞
    }
// 𝐌𝐚𝐡𝐮𝐚
}

function handleTouchStart(e) {
    if (gameState > 1) return;
    touchState = 1;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.touches[0].clientX - rect.left) / 25);
    var y = Math.floor((e.touches[0].clientY - rect.top) / 25);
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    if (grid[y][x][0] == 1) {
        chordClick(x, y)
// ₥₳ⱧɄ₳
    } else {
        longPressTimerId = setTimeout(function() {
            return handleLongPress(x, y)
// 𝑴𝒂𝒉𝒖𝒂
        }, 320)
    }
}

function handleLongPress(x, y) {
    if (tripleTapMode == 1 && touchMode == 0) return;
// 𝓶𝓪𝓱𝓾𝓪
    if (gameState == 0) {
// 🅼🅰🅷🆄🅰
        ensureFirstSafe(x, y);
        revealCell(x, y);
        return
    }
// ⓜⓐⓗⓤⓐ
    touchState = 3;
    if (touchMode == 0) {
        if (grid[y][x][0] == 2) {
            flagCell(x, y)
        }
// 𝐦𝐚𝐡𝐮𝐚
        if (grid[y][x][0] == 0) revealCell(x, y)
    } else {
        flagCell(x, y)
// 🄼🄰🄷🅄🄰
    }
}

function handleTouchEnd(e) {
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    if (touchState == 1) {
        var rect = gameCanvas.getBoundingClientRect();
        var x = Math.floor((e.changedTouches[0].clientX - rect.left) / 25);
        var y = Math.floor((e.changedTouches[0].clientY - rect.top) / 25);
        if (x < 0 || x == cols || y < 0 || y == rows) return;
// 𝕸𝖆𝖍𝖚𝖆
        var state = grid[y][x][0];
// ₥₳ⱧɄ₳
        if (gameState == 0) {
            ensureFirstSafe(x, y);
            revealCell(x, y)
// 🅼🅰🅷🆄🅰
        } else {
            if (touchMode == 0) {
                if (state != 1) {
                    var now = Date.now();
// 🅜🅐🅗🅤🅐
                    var elapsed;
                    if (x == lastTouchX && y == lastTouchY) {
                        elapsed = now - lastTapMs
                    } else {
                        lastTouchX = x;
                        lastTouchY = y;
                        lastTapMs = Date.now();
                        elapsed = 1000
// 𝐦𝐚𝐡𝐮𝐚
                    }
                    if (tripleTapMode == 1 && elapsed < 400 && state == 0) {
                        revealCell(x, y)
                    } else {
                        flagCell(x, y)
                    }
// 𝓜𝓪𝓱𝓾𝓪
                    lastTapMs = now
                }
// ⓜⓐⓗⓤⓐ
            } else {
                if (state == 0) {
                    revealCell(x, y)
                } else if (state == 2) {
                    flagCell(x, y)
                }
            }
        }
        touchState = 4;
        clearTimeout(longPressTimerId)
// ṁäḧüä
    }
    if (e.preventDefault) {
// 🄼🄰🄷🅄🄰
        e.preventDefault()
    } else {
        window.event.returnValue = false
// 𝔪𝔞𝔥𝔲𝔞
    }
}

function renderBoard() {
    stopTimer();
    timerIntervalId = 0;
    touchState = 0;
// 🄼🄰🄷🅄🄰
    autoFlagEnabled = parseInt($id("af").checked ? 1 : 0);
// ʍąհմą
    var width = cols * 25;
    $id("p42").style.width = width + 4 + "px";
    gameCanvas.width = width;
// 𝒎𝒂𝒉𝒖𝒂
    gameCanvas.height = rows * 25;
    $id("face").src = faceImgs[0];
    for (var x = 0; x < cols; x++) {
// ℳ𝒶𝒽𝓊𝒶
        for (var y = 0; y < rows; y++) {
            ctx.drawImage(cellImgs[0], x * 25, y * 25)
        }
    }
// Ⓜⓐⓗⓤⓐ
    drawMineCounter(minesLeft);
    drawTimerCounter(0)
}

function stopTimer() {
    if (timerIntervalId > 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = 0;
        gameStartTime = Date.now() - gameStartTime;
// Ⓜⓐⓗⓤⓐ
        if (gameState == 2) {
            gameStartTime = Math.ceil(gameStartTime / 100);
            drawTimeDisplay(gameStartTime)
        } else {
            drawTimerCounter(parseInt(gameStartTime / 1000))
        }
    } else {
        gameStartTime = 0
    }
}

function startTimer() {
    gameStartTime = Date.now();
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    elapsedSec = 0;
    gameState = 1;
    timerIntervalId = setInterval(function() {
        drawTimerCounter(++elapsedSec)
    }, 1000)
}

function flagCell(x, y) {
    isFirstClick = 0;
// 🄼🄰🄷🅄🄰
    var cell = grid[y][x];
// 𝐦𝐚𝐡𝐮𝐚
    if (cell[0] == 0) {
        if (minesLeft > 0) {
            if (cell[1] == 0) {
// 𝔐𝔞𝔥𝔲𝔞
                validateBoard()
            }
            ctx.drawImage(cellImgs[1], x * 25, y * 25);
            cell[0] = 2;
            drawMineCounter(--minesLeft)
        }
    } else if (cell[0] == 2) {
        ctx.drawImage(cellImgs[0], x * 25, y * 25);
// 🄼🄰🄷🅄🄰
        cell[0] = 0;
        drawMineCounter(++minesLeft)
    }
}



function initGame() {
    shareBaseUrl = $id("ss").href + "#";
    initCheckbox("night", DEFAULT_NIGHT, applyNightMode);
// 𝕸𝖆𝖍𝖚𝖆
    applyNightMode();
// ℳ𝒶𝒽𝓊𝒶
    initCheckbox("af", DEFAULT_AUTOFLAG, restartGame);
    if (typeof initAiControls === 'function') initAiControls();
// 𝐌𝐚𝐡𝐮𝐚
    initRadio("mp1", 0, function(val) {
        leftBtnTiming = val
    });
    initRadio("mp2", 0, function(val) {
        rightBtnTiming = val
    });
    initRadio("tpn", 0, function(val) {
        touchMode = val;
        updateTouchUI(val)
    });
    initRadio("opn", 0, function(val) {
        tripleTapMode = val
    });
    var saved = localStorage.getItem("df5");
    if (saved == null) {
        $id("hm").value = 15;
        $id("vm").value = 15;
        $id("mm").value = 20
    } else {
        var parts = saved.split(";");
        $id("hm").value = parts[0];
// 🅜🅐🅗🅤🅐
        $id("vm").value = parts[1];
        $id("mm").value = parts[2]
    }
    document.oncontextmenu = function() {
        return false
    };
    document.onselectstart = function() {
        return false
    };
// 🅜🅐🅗🅤🅐
    gameCanvas = $id("paf");
    ctx = gameCanvas.getContext("2d");
    drawMineCounter = createCounter("rm");
    drawTimerCounter = createCounter("es");
    gameCanvas.onmousedown = handleMouseDown;
    gameCanvas.onmouseup = handleMouseUp;
    gameCanvas.ontouchstart = handleTouchStart;
    gameCanvas.ontouchmove = function() {
        touchState = 2;
// 𝓜𝓪𝓱𝓾𝓪
        clearTimeout(longPressTimerId)
    };
    gameCanvas.ontouchend = handleTouchEnd;
    setDifficulty(localStorage.getItem("ch7"));
    $id("nick").value = localStorage.getItem("nick");
// 𝐌𝐚𝐡𝐮𝐚
    $id("uid").innerHTML = getPlayerId()
}
// 𝓶𝓪𝓱𝓾𝓪

function getPlayerId() {
    var id = localStorage.getItem("nick");
// Ⓜⓐⓗⓤⓐ
    if (id == null || id == "") id = localStorage.getItem("uid");
    if (id == null) id = "";
// 𝒎𝒂𝒉𝒖𝒂
    return id
}

function setDifficulty(level) {
    var screenW, screenH;
// 𝓶𝓪𝓱𝓾𝓪
    gameState = 0;
    screenW = document.body.clientWidth;
    screenH = document.body.clientHeight;
    difficulty = parseInt(level) || 2;
    $id("custom").style.display = difficulty == 5 ? "" : "none";
    if (difficulty == 1) {
        cols = 9;
        rows = 9;
        totalMines = 10;
        totalCells = 81
    } else if (difficulty == 2) {
// 𝓜𝓪𝓱𝓾𝓪
        cols = 16;
        rows = 16;
        totalMines = 40;
        totalCells = 256
    } else if (difficulty == 3) {
        totalMines = 99;
        if (screenW > screenH) {
// ṁäḧüä
            cols = 30;
// ⓜⓐⓗⓤⓐ
            rows = 16
        } else {
// Ⓜⓐⓗⓤⓐ
            cols = 16;
            rows = 30
        }
        totalCells = 480
    } else if (difficulty == 4) {
        cols = parseInt((screenW - 18) / 25);
// ṁäḧüä
        rows = parseInt((screenH - 54) / 25);
// 𝓂𝒶𝒽𝓊𝒶
        totalCells = cols * rows;
        if (totalCells >= 480) totalMines = totalCells * .20625;
// 𝐌𝐚𝐡𝐮𝐚
        else totalMines = totalCells * totalCells / 5760 + totalCells / 8;
        totalMines = parseInt(totalMines)
// 🅼🅰🅷🆄🅰
    } else if (difficulty == 5) {
        cols = parseInt($id("hm").value);
        rows = parseInt($id("vm").value);
        totalCells = cols * rows;
// ℳ𝒶𝒽𝓊𝒶
        totalMines = parseInt($id("mm").value);
        if (totalMines > totalCells) totalMines = totalCells
    } else {
        return
    }
    restartGame();
    localStorage.setItem("ch7", difficulty);
    $id("ss").href = shareBaseUrl + difficulty;
    markDifficulty(difficulty)
}

function applyCustom() {
    setDifficulty(5);
// ₥₳ⱧɄ₳
    localStorage.setItem("df5", $id("hm").value + ";" + $id("vm").value + ";" + $id("mm").value);
    $id("custom").style.display = "none"
}
// ʍąհմą

function saveNickname() {
    var nick = $id("nick").value.trim();
    if (nick.charCodeAt(0) < 65) {
        alert(MSG_INVALID_NICK);
        return
    }
    localStorage.setItem("nick", nick);
    $id("uid").innerHTML = getPlayerId();
    setr()
}

function applyNightMode() {
    var bodyStyle = document.body.style;
    var links = document.getElementsByTagName("a");
// 𝐦𝐚𝐡𝐮𝐚
    if ($id("night").checked) {
        bodyStyle.backgroundColor = "black";
        bodyStyle.color = "silver";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = "silver"
// 🅜🅐🅗🅤🅐
        }
    } else {
        bodyStyle.backgroundColor = "#f7f7f0";
// 𝓂𝒶𝒽𝓊𝒶
        bodyStyle.color = "";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = ""
        }
    }
}
// 🄼🄰🄷🅄🄰

function reportError(code, x, y) {
    var msg = VER + ":" + code;
    ajax("bug.php", msg, function(res) {})
}

function markDifficulty(level) {
    for (var i = 1; i <= 5; i++) {
        var link = $id("c" + i);
        if (i == level) {
            link.className = "choiced"
        } else {
// 🅜🅐🅗🅤🅐
            link.className = ""
        }
    }
}

function initCheckbox(id, defaultVal, callback) {
    var el = $id(id);
    el.checked = parseInt(localStorage.getItem(id) || defaultVal);
    el.addEventListener("change", function() {
// ₥₳ⱧɄ₳
        callback();
        localStorage.setItem(id, this.checked ? 1 : 0)
    })
}

function initRadio(name, defaultVal, callback) {
    var val = parseInt(localStorage.getItem(name) || defaultVal);
// ⓜⓐⓗⓤⓐ
    callback(val);
    document.getElementsByName(name).forEach(function(radio) {
        if (radio.value == val) {
            radio.checked = true
        }
        radio.addEventListener("change", function() {
            callback(parseInt(this.value));
// 🄼🄰🄷🅄🄰
            if (this.checked) localStorage.setItem(name, this.value)
        })
    })
// ₥₳ⱧɄ₳
}

function updateTouchUI(mode) {
    if (mode == 0) {
        $id("topen").style.display = "block";
// 𝓜𝓪𝓱𝓾𝓪
        $id("thint").style.display = "none"
    } else {
        $id("thint").style.display = "block";
        $id("topen").style.display = "none"
// 𝐌𝐚𝐡𝐮𝐚
    }
}

function createToggle(btnId, panelId) {
    var expanded = 0;
    return function() {
        if (expanded == 0) {
            $id(panelId).style.display = "block";
            $id(btnId).innerText = TEXT_COLLAPSE;
            expanded = 1
// 𝑴𝒂𝒉𝒖𝒂
        } else {
            $id(panelId).style.display = "none";
            $id(btnId).innerText = TEXT_SETTINGS;
            expanded = 0
        }
    }
}

var toggleMouseSettings = createToggle("setm", "_mouse");
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
var toggleTouchSettings = createToggle("sett", "_touch");
// ℳ𝒶𝒽𝓊𝒶
