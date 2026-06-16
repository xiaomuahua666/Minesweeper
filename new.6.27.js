function getById(id) { return document.getElementById(id); }

function ajax(url, postData, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(postData != null ? "POST" : "GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
            callback(xhr.responseText);
        }
    };
    xhr.send(postData);
}

var gameBoard = [];
var boardWidth, boardHeight, totalMines;
var dx = [-1, -1, -1, 0, 0, 1, 1, 1, 0];
var dy = [-1, 0, 1, -1, 1, -1, 0, 1, 0];
var gameState;

function highlightCell(col, row) {
    ctx.drawImage(numBackgrounds[0], col * 25, row * 25);
    setTimeout(function() {
        if (gameBoard[row][col][0] == 0) ctx.drawImage(cellImages[0], col * 25, row * 25);
    }, 120);
}

function chordOpen(col, row) {
    var flaggedCount = 0, hasUnflaggedMine = 0;
    var nx, ny;
    for (var dir = 0; dir < 8; dir++) {
        ny = row + dy[dir];
        nx = col + dx[dir];
        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
            var cell = gameBoard[ny][nx];
            if (cell[0] == 2) {
                flaggedCount++;
            } else if (cell[0] == 0) {
                if (cell[1] == 1) hasUnflaggedMine = 1;
            }
        }
    }
    var currentCell = gameBoard[row][col];
    var canOpen = flaggedCount >= currentCell[2];
    for (dir = 0; dir < 8; dir++) {
        ny = row + dy[dir];
        nx = col + dx[dir];
        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
            var cell = gameBoard[ny][nx];
            if (cell[0] == 0) {
                if (canOpen) {
                    if (hasUnflaggedMine) {
                        if (cell[1] == 1) {
                            ctx.drawImage(cellImages[2], nx * 25, ny * 25);
                            cell[0] = 1;
                        }
                    } else {
                        openCell(nx, ny);
                    }
                } else {
                    highlightCell(nx, ny);
                }
            }
        }
    }
    if (canOpen && hasUnflaggedMine) gameOver();
}

function gameOver() {
    stopTimer();
    getById("face").src = faceImages[2];
    gameState = 3;
    var col, row;
    for (row = 0; row < boardHeight; row++) {
        for (col = 0; col < boardWidth; col++) {
            var cell = gameBoard[row][col];
            if (cell[0] == 0) {
                if (cell[1] == 1) {
                    ctx.drawImage(cellImages[3], col * 25, row * 25);
                }
            } else if (cell[0] == 2) {
                if (cell[1] == 0) {
                    blinkIntervals[blinkCount++] = setInterval(function(col, row) {
                        var toggle = 0;
                        return function() {
                            ctx.drawImage(toggle == 0 ? numBackgrounds[gameBoard[row][col][2]] : cellImages[1], col * 25, row * 25);
                            toggle = !toggle;
                        };
                    }(col, row), 800);
                }
            }
        }
    }
}

var remainingCells;

function checkWinCondition() {
    remainingCells = [];
    var col, row;
    var mineCount = 0, safeCount = 0;
    for (row = 0; row < boardHeight; row++) {
        for (col = 0; col < boardWidth; col++) {
            var cell = gameBoard[row][col];
            if (cell[0] == 2 && cell[1] != 1) return 1;
            if (cell[0] == 0 && cell[3] == 0) {
                if (cell[1] == 1) {
                    mineCount++;
                } else {
                    safeCount++;
                }
                remainingCells.push([col, row]);
            }
        }
    }
    if (mineCount != safeCount) return 2;
    return 0;
}

function countMinesAround(col, row) {
    var count = 0;
    for (var dir = 0; dir < 8; dir++) {
        var ny = row + dy[dir];
        var nx = col + dx[dir];
        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
            if (gameBoard[ny][nx][1] == 1) count++;
        }
    }
    return count;
}

function toggleRemainingMines() {
    for (var i = 0; i < remainingCells.length; i++) {
        var pos = remainingCells[i];
        var cell = gameBoard[pos[1]][pos[0]];
        cell[1] = cell[1] == 0 ? 1 : 0;
    }
}

function validateAndFix() {
    if (checkWinCondition() != 0) return 1;
    toggleRemainingMines();
    var col, row;
    for (row = 0; row < boardHeight; row++) {
        for (col = 0; col < boardWidth; col++) {
            var cell = gameBoard[row][col];
            var number = cell[2];
            if (cell[0] == 1 && number != 0) {
                if (countMinesAround(col, row) != number) {
                    toggleRemainingMines();
                    return 2;
                }
            }
        }
    }
    for (row = 0; row < boardHeight; row++) {
        for (col = 0; col < boardWidth; col++) {
            var cell = gameBoard[row][col];
            if (cell[0] != 1) {
                cell[2] = countMinesAround(col, row);
            }
        }
    }
    return 0;
}

function autoFlag(col, row) {
    for (var s = 0; s < 9; s++) {
        var cy = row + dy[s];
        var cx = col + dx[s];
        if (cy >= 0 && cy < boardHeight && cx >= 0 && cx < boardWidth) {
            var cell = gameBoard[cy][cx];
            var mines = cell[2];
            if (cell[0] == 1 && mines > 0) {
                var hiddenCount = 0;
                for (var dir = 0; dir < 8; dir++) {
                    var ny = cy + dy[dir];
                    var nx = cx + dx[dir];
                    if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
                        var neighbor = gameBoard[ny][nx];
                        if (neighbor[0] == 0) {
                            hiddenCount++;
                        } else if (neighbor[0] == 2) {
                            if (neighbor[1] == 1) mines--;
                            else hiddenCount++;
                        }
                    }
                }
                if (hiddenCount > 0 && mines == hiddenCount) {
                    for (var dir = 0; dir < 8; dir++) {
                        var ny = cy + dy[dir];
                        var nx = cx + dx[dir];
                        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
                            var neighbor = gameBoard[ny][nx];
                            if (neighbor[0] != 1) neighbor[3] = 1;
                            if (neighbor[0] == 0) {
                                if (autoFlagEnabled == 1) {
                                    toggleFlag(nx, ny);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function openCell(col, row) {
    var cell = gameBoard[row][col];
    if (cell[1] == 1) {
        if (gameState == 1) validateAndFix();
        if (cell[1] == 1) {
            ctx.drawImage(cellImages[2], col * 25, row * 25);
            cell[0] = 1;
            gameOver();
            return 1;
        }
    }
    cell[0] = 1;
    ctx.drawImage(numBackgrounds[cell[2]], col * 25, row * 25);
    remainingSafeCells--;
    if (remainingSafeCells == 0) winGame();
    else if (cell[2] == 0) {
        for (var dir = 0; dir < 8; dir++) {
            var ny = row + dy[dir];
            var nx = col + dx[dir];
            if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
                if (gameBoard[ny][nx][0] == 0) openCell(nx, ny);
            }
        }
    }
    autoFlag(col, row);
    return 0;
}

var gameResult;

function winGame() {
    if (!autoFlagEnabled && firstClickDone) gameResult = 2;
    else gameResult = autoFlagEnabled;
    gameState = 2;
    stopTimer();
    var col, row;
    for (row = 0; row < boardHeight; row++) {
        for (col = 0; col < boardWidth; col++) {
            var cell = gameBoard[row][col];
            if (cell[0] == 0) {
                if (cell[1] != 1) {
                    reportError(1, col, row);
                } else {
                    toggleFlag(col, row);
                }
            }
        }
    }
    if (remainingMines != 0) reportError(2, col, row);
    updateMineCounter(totalMines);
    getById("face").src = faceImages[1];
    sendStats();
}

var difficultyLevel;

function sendStats() {
    if (difficultyLevel > 3 && elapsedTime < 20) return;
    var uid = getUid();
    var data = "B" + uid + "c3/" + difficultyLevel + "" + elapsedTime + "" + gameResult;
    if (difficultyLevel > 3) data += "" + boardWidth + "" + boardHeight + "" + totalMines;
    ajax(apiEndpoint, data, function(response) {
        if (uid == "" && response.length > 1) {
            getById("uid").innerHTML = response;
            localStorage.setItem("uid", response);
        }
    });
}

function createDigitDrawer(elementId) {
    var canvas = getById(elementId);
    var ctx = canvas.getContext("2d");
    var digitCount = 3;
    return function(number) {
        if (number < 10) number = "00" + number;
        else if (number < 100) number = "0" + number;
        else number = number.toString();
        var len = number.length;
        if (len != digitCount) {
            canvas.width = len * 13;
            digitCount = len;
        }
        var x = 0;
        for (var i = 0; i < len; i++) {
            ctx.drawImage(digitImages[parseInt(number.charAt(i))], x, 0);
            x += 13;
        }
    };
}

function drawTime(time) {
    var canvas = getById("es");
    var ctx = canvas.getContext("2d");
    time = time.toString();
    var len = time.length;
    if (len == 1) {
        time = "0" + time;
        len = 2;
    }
    canvas.width = (len + 1) * 13;
    var x = 0;
    for (var i = 0; i < len - 1; i++) {
        ctx.drawImage(digitImages[parseInt(time.charAt(i))], x, 0);
        x += 13;
    }
    ctx.drawImage(slashImage, x, 0);
    x += 13;
    ctx.drawImage(digitImages[parseInt(time.charAt(i))], x, 0);
}

function firstClick(col, row) {
    var remaining = remainingSafeCells;
    for (var dir = 8; dir >= 0 && remaining > 0; dir--) {
        var ny = row + dy[dir];
        var nx = col + dx[dir];
        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
            var index = flatIndex[ny * boardWidth + nx];
            if (gameBoard[ny][nx][1] == 1) {
                var randomIndex = Math.floor(Math.random() * remaining);
                updateCellMine(index, -1);
                updateCellMine(randomIndex, 1);
                remaining--;
                swapMines(randomIndex, remaining);
            } else {
                remaining--;
                swapMines(index, remaining);
            }
        }
    }
    startTimer();
}

var flatMineArray = [];
var flatIndex = [];

function initBoard() {
    for (var row = 0; row < boardHeight; row++) {
        gameBoard[row] = [];
        for (var col = 0; col < boardWidth; col++) gameBoard[row][col] = [0, 0, 0, 0];
    }
    for (var i = 0; i < totalCells; i++) {
        flatMineArray[i] = i;
        flatIndex[i] = i;
    }
    remainingSafeCells = totalCells;
    for (var minesPlaced = 0; minesPlaced < totalMines; minesPlaced++) {
        var randomIndex = Math.floor(Math.random() * remainingSafeCells);
        remainingSafeCells--;
        swapMines(randomIndex, remainingSafeCells);
    }
    for (var i = remainingSafeCells; i < totalCells; i++) {
        updateCellMine(i, 1);
    }
    remainingMines = totalMines;
    remainingSafeCells = totalCells - totalMines;
}

function swapMines(a, b) {
    var tempA = flatMineArray[a];
    var tempB = flatMineArray[b];
    flatMineArray[a] = tempB;
    flatMineArray[b] = tempA;
    flatIndex[tempA] = b;
    flatIndex[tempB] = a;
}

function updateCellMine(index, delta) {
    var linear = flatMineArray[index];
    var row = Math.floor(linear / boardWidth);
    var col = linear % boardWidth;
    gameBoard[row][col][1] += delta;
    for (var dir = 0; dir < 8; dir++) {
        var ny = row + dy[dir];
        var nx = col + dx[dir];
        if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
            gameBoard[ny][nx][2] += delta;
        }
    }
}

var blinkIntervals = [];
var blinkCount = 0;

function resetGame() {
    if (timerInterval > 0) {
        clearInterval(timerInterval);
        timerInterval = 0;
    }
    for (var i = 0; i < blinkCount; i++) {
        clearInterval(blinkIntervals[i]);
    }
    blinkCount = 0;
    getById("es").width = 39;
    initBoard();
    drawBoard();
    lastMouseCol = -1;
    lastMouseRow = -1;
    firstClickDone = 1;
    gameState = 0;
}

var firstClickDone;
var mouseDownLeft, mouseDownRight;
var lastMouseCol, lastMouseRow;

function onMouseDown(event) {
    if (touchActive || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var col = Math.floor((event.clientX - rect.left) / 25);
    var row = Math.floor((event.clientY - rect.top) / 25);
    if (col < 0 || col == boardWidth || row < 0 || row == boardHeight) return;
    lastMouseCol = col;
    lastMouseRow = row;
    var cellState = gameBoard[row][col][0];
    if (event.button == 2) {
        if (mouseDownRight != 1) {
            if (cellState == 1) {
                chordOpen(col, row);
            } else {
                toggleFlag(col, row);
            }
        }
    } else {
        if (mouseDownLeft != 1) {
            if (cellState == 0) {
                if (gameState == 0) firstClick(col, row);
                openCell(col, row);
            } else if (cellState == 1) {
                chordOpen(col, row);
            } else {
                toggleFlag(col, row);
            }
        }
    }
}

function onMouseUp(event) {
    if (touchActive || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var col = Math.floor((event.clientX - rect.left) / 25);
    var row = Math.floor((event.clientY - rect.top) / 25);
    if (col < 0 || col == boardWidth || row < 0 || row == boardHeight) return;
    var cellState = gameBoard[row][col][0];
    if (event.button == 2) {
        if (mouseDownRight != 0) {
            if (cellState == 1) {
                chordOpen(col, row);
            } else {
                toggleFlag(col, row);
            }
        }
    } else {
        if (mouseDownLeft != 0) {
            if (cellState == 0) {
                if (gameState == 0) firstClick(col, row);
                openCell(col, row);
            } else if (cellState == 1) {
                chordOpen(col, row);
            } else {
                toggleFlag(col, row);
            }
        }
    }
}

function onTouchStart(event) {
    if (gameState > 1) return;
    touchActive = 1;
    var rect = gameCanvas.getBoundingClientRect();
    var col = Math.floor((event.touches[0].clientX - rect.left) / 25);
    var row = Math.floor((event.touches[0].clientY - rect.top) / 25);
    if (col < 0 || col == boardWidth || row < 0 || row == boardHeight) return;
    if (gameBoard[row][col][0] == 1) {
        chordOpen(col, row);
    } else {
        longPressTimer = setTimeout(function() {
            return handleLongPress(col, row);
        }, 320);
    }
}

var longPressTimer;

function handleLongPress(col, row) {
    if (tripleClickMode == 1 && touchMode == 0) return;
    if (gameState == 0) {
        firstClick(col, row);
        openCell(col, row);
        return;
    }
    touchActive = 3;
    if (touchMode == 0) {
        if (gameBoard[row][col][0] == 2) {
            toggleFlag(col, row);
        }
        if (gameBoard[row][col][0] == 0) openCell(col, row);
    } else {
        toggleFlag(col, row);
    }
}

var lastTapTime = 0;

function onTouchEnd(event) {
    if (touchActive == 1) {
        var rect = gameCanvas.getBoundingClientRect();
        var col = Math.floor((event.changedTouches[0].clientX - rect.left) / 25);
        var row = Math.floor((event.changedTouches[0].clientY - rect.top) / 25);
        if (col < 0 || col == boardWidth || row < 0 || row == boardHeight) return;
        var cellState = gameBoard[row][col][0];
        if (gameState == 0) {
            firstClick(col, row);
            openCell(col, row);
        } else {
            if (touchMode == 0) {
                if (cellState != 1) {
                    var now = Date.now();
                    var diff;
                    if (col == lastMouseCol && row == lastMouseRow) {
                        diff = now - lastTapTime;
                    } else {
                        lastMouseCol = col;
                        lastMouseRow = row;
                        lastTapTime = Date.now();
                        diff = 1000;
                    }
                    if (tripleClickMode == 1 && diff < 400 && cellState == 0) {
                        openCell(col, row);
                    } else {
                        toggleFlag(col, row);
                    }
                    lastTapTime = now;
                }
            } else {
                if (cellState == 0) {
                    openCell(col, row);
                } else if (cellState == 2) {
                    toggleFlag(col, row);
                }
            }
        }
        touchActive = 4;
        clearTimeout(longPressTimer);
    }
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        window.event.returnValue = false;
    }
}

var autoFlagEnabled;

function drawBoard() {
    stopTimer();
    timerInterval = 0;
    touchActive = 0;
    autoFlagEnabled = parseInt(getById("af").checked ? 1 : 0);
    var width = boardWidth * 25;
    getById("p42").style.width = width + 4 + "px";
    gameCanvas.width = width;
    gameCanvas.height = boardHeight * 25;
    getById("face").src = faceImages[0];
    for (var col = 0; col < boardWidth; col++) {
        for (var row = 0; row < boardHeight; row++) {
            ctx.drawImage(cellImages[0], col * 25, row * 25);
        }
    }
    updateMineCounter(remainingMines);
    updateTimer(0);
}

function stopTimer() {
    if (timerInterval > 0) {
        clearInterval(timerInterval);
        timerInterval = 0;
        elapsedTime = Date.now() - elapsedTime;
        if (gameState == 2) {
            elapsedTime = Math.ceil(elapsedTime / 100);
            drawTime(elapsedTime);
        } else {
            updateTimer(parseInt(elapsedTime / 1000));
        }
    } else {
        elapsedTime = 0;
    }
}

var timerInterval = 0;
var elapsedTime;
var startTime;

function startTimer() {
    elapsedTime = Date.now();
    startTime = 0;
    gameState = 1;
    timerInterval = setInterval(function() {
        updateTimer(++startTime);
    }, 1000);
}

var touchMode;
var tripleClickMode;
var touchActive;
var remainingMines;
var remainingSafeCells;

function toggleFlag(col, row) {
    firstClickDone = 0;
    var cell = gameBoard[row][col];
    if (cell[0] == 0) {
        if (remainingMines > 0) {
            if (cell[1] == 0) {
                validateAndFix();
            }
            ctx.drawImage(cellImages[1], col * 25, row * 25);
            cell[0] = 2;
            updateMineCounter(--remainingMines);
        }
    } else if (cell[0] == 2) {
        ctx.drawImage(cellImages[0], col * 25, row * 25);
        cell[0] = 0;
        updateMineCounter(++remainingMines);
    }
}

var gameCanvas;
var ctx;
var updateMineCounter;
var updateTimer;

function initGame() {
    currentHash = getById("ss").href + "#";
    initCheckbox("night", defaultNight, applyNightMode);
    applyNightMode();
    initCheckbox("af", defaultAf, resetGame);
    initRadioGroup("mp1", 0, function(val) { mouseDownLeft = val; });
    initRadioGroup("mp2", 0, function(val) { mouseDownRight = val; });
    initRadioGroup("tpn", 0, function(val) {
        touchMode = val;
        setTouchMode(val);
    });
    initRadioGroup("opn", 0, function(val) { tripleClickMode = val; });
    var savedCustom = localStorage.getItem("df5");
    if (savedCustom == null) {
        getById("hm").value = 15;
        getById("vm").value = 15;
        getById("mm").value = 20;
    } else {
        var parts = savedCustom.split(";");
        getById("hm").value = parts[0];
        getById("vm").value = parts[1];
        getById("mm").value = parts[2];
    }
    document.oncontextmenu = function() { return false; };
    document.onselectstart = function() { return false; };
    gameCanvas = getById("paf");
    ctx = gameCanvas.getContext("2d");
    updateMineCounter = createDigitDrawer("rm");
    updateTimer = createDigitDrawer("es");
    gameCanvas.onmousedown = onMouseDown;
    gameCanvas.onmouseup = onMouseUp;
    gameCanvas.ontouchstart = onTouchStart;
    gameCanvas.ontouchmove = function() {
        touchActive = 2;
        clearTimeout(longPressTimer);
    };
    gameCanvas.ontouchend = onTouchEnd;
    setDifficulty(localStorage.getItem("ch7"));
    getById("nick").value = localStorage.getItem("nick");
    getById("uid").innerHTML = getUid();
}

function getUid() {
    var uid = localStorage.getItem("nick");
    if (uid == null || uid == "") uid = localStorage.getItem("uid");
    if (uid == null) uid = "";
    return uid;
}

var totalCells;

function setDifficulty(level) {
    var clientWidth = document.body.clientWidth;
    var clientHeight = document.body.clientHeight;
    gameState = 0;
    difficultyLevel = parseInt(level) || 2;
    getById("custom").style.display = difficultyLevel == 5 ? "" : "none";
    if (difficultyLevel == 1) {
        boardWidth = 9;
        boardHeight = 9;
        totalMines = 10;
        totalCells = 81;
    } else if (difficultyLevel == 2) {
        boardWidth = 16;
        boardHeight = 16;
        totalMines = 40;
        totalCells = 256;
    } else if (difficultyLevel == 3) {
        totalMines = 99;
        if (clientWidth > clientHeight) {
            boardWidth = 30;
            boardHeight = 16;
        } else {
            boardWidth = 16;
            boardHeight = 30;
        }
        totalCells = 480;
    } else if (difficultyLevel == 4) {
        boardWidth = parseInt((clientWidth - 18) / 25);
        boardHeight = parseInt((clientHeight - 54) / 25);
        totalCells = boardWidth * boardHeight;
        if (totalCells >= 480) totalMines = totalCells * 0.20625;
        else totalMines = totalCells * totalCells / 5760 + totalCells / 8;
        totalMines = parseInt(totalMines);
    } else if (difficultyLevel == 5) {
        boardWidth = parseInt(getById("hm").value);
        boardHeight = parseInt(getById("vm").value);
        totalCells = boardWidth * boardHeight;
        totalMines = parseInt(getById("mm").value);
        if (totalMines > totalCells) totalMines = totalCells;
    } else {
        return;
    }
    resetGame();
    localStorage.setItem("ch7", difficultyLevel);
    getById("ss").href = currentHash + difficultyLevel;
    setDifficultyHighlight(difficultyLevel);
}

var currentHash;

function applyCustom() {
    setDifficulty(5);
    localStorage.setItem("df5", getById("hm").value + ";" + getById("vm").value + ";" + getById("mm").value);
    getById("custom").style.display = "none";
}

function nick() {
    var nickname = getById("nick").value.trim();
    if (nickname.charCodeAt(0) < 65) {
        alert(w1);
        return;
    }
    localStorage.setItem("nick", nickname);
    getById("uid").innerHTML = getUid();
    setr();
}

function applyNightMode() {
    var bodyStyle = document.body.style;
    var links = document.getElementsByTagName("a");
    if (getById("night").checked) {
        bodyStyle.backgroundColor = "black";
        bodyStyle.color = "silver";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = "silver";
        }
    } else {
        bodyStyle.backgroundColor = "#f7f7f0";
        bodyStyle.color = "";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = "";
        }
    }
}

function reportError(code, col, row) {
    var data = VER + ":" + code;
    ajax("bug.php", data, function() {});
}

function setDifficultyHighlight(level) {
    for (var i = 1; i <= 5; i++) {
        var link = getById("c" + i);
        if (i == level) {
            link.className = "choiced";
        } else {
            link.className = "";
        }
    }
}

function initCheckbox(id, defaultValue, onChange) {
    var checkbox = getById(id);
    checkbox.checked = parseInt(localStorage.getItem(id) || defaultValue);
    checkbox.addEventListener("change", function() {
        onChange();
        localStorage.setItem(id, this.checked ? 1 : 0);
    });
}

function initRadioGroup(name, defaultValue, callback) {
    var storedValue = parseInt(localStorage.getItem(name) || defaultValue);
    callback(storedValue);
    document.getElementsByName(name).forEach(function(radio) {
        if (radio.value == storedValue) {
            radio.checked = true;
        }
        radio.addEventListener("change", function() {
            callback(parseInt(this.value));
            if (this.checked) localStorage.setItem(name, this.value);
        });
    });
}

function setTouchMode(mode) {
    if (mode == 0) {
        getById("topen").style.display = "block";
        getById("thint").style.display = "none";
    } else {
        getById("thint").style.display = "block";
        getById("topen").style.display = "none";
    }
}

function createToggle(triggerId, panelId) {
    var collapsed = 0;
    return function() {
        if (collapsed == 0) {
            getById(panelId).style.display = "block";
            getById(triggerId).innerText = shou;
            collapsed = 1;
        } else {
            getById(panelId).style.display = "none";
            getById(triggerId).innerText = shez;
            collapsed = 0;
        }
    };
}