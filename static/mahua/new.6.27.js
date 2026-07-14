// ============================================================
// 扫雷游戏核心逻辑
// 变量名已从原始短名还原为可读名称
// ============================================================

// ---------- 工具函数 ----------

/** 通过 ID 获取 DOM 元素 */
function $id(id) {
    return document.getElementById(id)
}

/** AJAX 请求 */
function ajax(url, data, callback) {
    var req = new XMLHttpRequest;
    req.open(data != null ? "POST" : "GET", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && (req.status == 200 || req.status == 304)) {
            callback(req.responseText)
        }
    };
    req.send(data)
}

// ---------- 全局游戏状态 ----------

/** 游戏网格 grid[row][col] = [state, isMine, adjacentMines, reserved]
 *  state: 0=未翻开, 1=已翻开, 2=插旗
 *  isMine: 0=安全, 1=地雷
 *  adjacentMines: 周围雷数
 *  reserved: 自动标雷标记
 */
var grid = [];

/** 棋盘列数（宽度） */
var cols;

/** 棋盘行数（高度） */
var rows;

/** 总雷数 */
var totalMines;

/** 8 方向邻居 X 偏移量 */
var dx = [-1, -1, -1, 0, 0, 1, 1, 1, 0];

/** 8 方向邻居 Y 偏移量 */
var dy = [-1, 0, 1, -1, 1, -1, 0, 1, 0];

/** 游戏状态: 0=等待开始, 1=进行中, 2=胜利, 3=失败 */
var gameState;

/** 未翻开的格子列表（用于死局判定） */
var unrevealedCells;

/** 格子顺序数组（用于洗牌） */
var cellOrder;

/** 格子位置映射 */
var cellPos;

/** 动画定时器列表 */
var animTimers;

/** 动画定时器数量 */
var animTimerCount;

/** 是否首次点击 */
var isFirstClick;

/** 左键触发时机: 0=按下, 1=弹起 */
var leftBtnTiming;

/** 右键触发时机: 0=按下, 1=弹起 */
var rightBtnTiming;

/** 上次触摸 X 坐标 */
var lastTouchX;

/** 上次触摸 Y 坐标 */
var lastTouchY;

/** 长按定时器 ID */
var longPressTimerId;

/** 上次点击时间戳（用于三击检测） */
var lastTapMs;

/** 自动标雷开关 */
var autoFlagEnabled;

/** 计时器 interval ID */
var timerIntervalId;

/** 游戏开始时间戳 */
var gameStartTime;

/** 已流逝秒数 */
var elapsedSec;

/** 触屏模式: 0=标记模式, 1=直开模式 */
var touchMode;

/** 打开方式: 0=长按打开, 1=三击打开 */
var tripleTapMode;

/** 触摸状态机 */
var touchState;

/** 剩余雷数 */
var minesLeft;

/** 剩余待翻格子数 */
var cellsLeft;

/** 游戏画布元素 */
var gameCanvas;

/** 画布 2D 上下文 */
var ctx;

/** 雷数计数器绘制函数 */
var drawMineCounter;

/** 计时器绘制函数 */
var drawTimerCounter;

/** 总格子数 */
var totalCells;

/** 分享基础 URL */
var shareBaseUrl;

/** 游戏结果码 */
var gameResult;

/** 难度等级 */
var difficulty;

// ---------- 常量 ----------

var apiPath = "/bbb";
var TEXT_COLLAPSE = "收起";
var TEXT_SETTINGS = "设置";
var MSG_INVALID_NICK = "首字母不符合要求";
var DEFAULT_AUTOFLAG = 0;
var DEFAULT_NIGHT = 0;

// ---------- 核心游戏函数 ----------

/** 点击动画效果 */
function showClickEffect(x, y) {
    ctx.drawImage(numBgImgs[0], x * 25, y * 25);
    setTimeout(function() {
        if (grid[y][x][0] == 0) ctx.drawImage(cellImgs[0], x * 25, y * 25)
    }, 120)
}

/** 双击数字翻开周围（Chord 操作） */
function chordClick(x, y) {
    var flaggedCount = 0,
        hasUnflaggedMine = 0;
    var nx, ny;
    var dir;
    var cell, state;
    for (dir = 0; dir < 8; dir++) {
        ny = y + dy[dir];
        nx = x + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            cell = grid[ny][nx];
            state = cell[0];
            if (state == 2) {
                flaggedCount++
            } else if (state == 0) {
                if (cell[1] == 1) hasUnflaggedMine = 1
            }
        }
    }
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
                        if (cell[1] == 1) {
                            ctx.drawImage(cellImgs[2], nx * 25, ny * 25);
                            cell[0] = 1
                        }
                    } else {
                        revealCell(nx, ny)
                    }
                } else {
                    showClickEffect(nx, ny)
                }
            }
        }
    }
    if (matched && hasUnflaggedMine) gameOver()
}

/** 游戏失败 */
function gameOver() {
    stopTimer();
    $id("face").src = faceImgs[2];
    gameState = 3;
    var col, row;
    var cell;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            if (cell[0] == 0) {
                if (cell[1] == 1) {
                    ctx.drawImage(cellImgs[3], col * 25, row * 25)
                }
            } else if (cell[0] == 2) {
                if (cell[1] == 0) {
                    animTimers[animTimerCount++] = setInterval(function(col, row) {
                        var toggle = 0;
                        return function() {
                            ctx.drawImage(toggle == 0 ? numBgImgs[grid[row][col][2]] : cellImgs[1], col * 25, row * 25);
                            toggle = !toggle
                        }
                    }(col, row), 800)
                }
            }
        }
    }
}

/** 检查是否进入死局（所有未翻格都是雷或都不是雷） */
function checkEndgame() {
    unrevealedCells = [];
    var col, row, cell;
    var mineCount = 0,
        safeCount = 0;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            if (cell[0] == 2 && cell[1] != 1) return 1;
            if (cell[0] == 0 && cell[3] == 0) {
                if (cell[1] == 1) {
                    mineCount++
                } else {
                    safeCount++
                }
                unrevealedCells.push([col, row])
            }
        }
    }
    if (mineCount != safeCount) return 2;
    return 0
}

/** 统计某格周围已插旗数 */
function countFlags(x, y) {
    var count = 0;
    var nx, ny;
    for (var dir = 0; dir < 8; dir++) {
        ny = y + dy[dir];
        nx = x + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            if (grid[ny][nx][1] == 1) {
                count++
            }
        }
    }
    return count
}

/** 翻转死局中未翻格子的推测标记 */
function toggleFlags() {
    var i, cell;
    for (i = 0; i < unrevealedCells.length; i++) {
        cell = unrevealedCells[i];
        var data = grid[cell[1]][cell[0]];
        data[1] = data[1] == 0 ? 1 : 0
    }
}

/** 验证棋盘一致性（死局时使用） */
function validateBoard() {
    if (checkEndgame() != 0) return 1;
    toggleFlags();
    var col, row, cell;
    var num;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            num = cell[2];
            if (cell[0] == 1 && num != 0) {
                if (countFlags(col, row) != num) {
                    toggleFlags();
                    return 2
                }
            }
        }
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

/** 自动标雷逻辑 */
function autoFlag(x, y) {
    var cell, neighbor;
    var nx, ny;
    var dir;
    var cur, curNum;
    var unknownCount, remainingMines;
    var cx, cy;
    for (dir = 0; dir < 9; dir++) {
        cy = y + dy[dir];
        cx = x + dx[dir];
        if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) {
            cell = grid[cy][cx];
            curNum = cell[2];
            if (cell[0] == 1 && curNum > 0) {
                unknownCount = 0;
                for (var subDir = 0; subDir < 8; subDir++) {
                    ny = cy + dy[subDir];
                    nx = cx + dx[subDir];
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                        neighbor = grid[ny][nx];
                        var state = neighbor[0];
                        if (state == 0) {
                            unknownCount++
                        } else if (state == 2) {
                            if (neighbor[1] == 1) curNum--;
                            else unknownCount++
                        }
                    }
                }
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
                            }
                        }
                    }
                }
            }
        }
    }
}

/** 翻开格子（核心递归函数） */
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
    ctx.drawImage(numBgImgs[cell[2]], x * 25, y * 25);
    cellsLeft--;
    if (cellsLeft == 0) winGame();
    else if (cell[2] == 0) {
        var nx, ny, dir;
        for (dir = 0; dir < 8; dir++) {
            ny = y + dy[dir];
            nx = x + dx[dir];
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx][0] == 0) revealCell(nx, ny)
            }
        }
    }
    autoFlag(x, y);
    return 0
}

/** 胜利 */
function winGame() {
    if (!autoFlagEnabled && isFirstClick) gameResult = 2;
    else gameResult = autoFlagEnabled;
    gameState = 2;
    stopTimer();
    var col, row, cell;
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            cell = grid[row][col];
            if (cell[0] == 0) {
                if (cell[1] != 1) {
                    reportError(1, col, row)
                } else {
                    flagCell(col, row)
                }
            }
        }
    }
    if (minesLeft != 0) reportError(2, col, row);
    drawMineCounter(totalMines);
    $id("face").src = faceImgs[1];
    reportStats()
}

/** 上报统计数据 */
function reportStats() {
    if (difficulty > 3 && gameStartTime < 20) return;
    var playerId = getPlayerId();
    var data = "B" + playerId + "\u001ec3/" + difficulty + "\u001e" + gameStartTime + "\u001f" + gameResult;
    if (difficulty > 3) data += "\u001f" + cols + "\u001f" + rows + "\u001f" + totalMines;
    ajax(apiPath, data, function(res) {
        if (playerId == "" && res.length > 1) {
            $id("uid").innerHTML = res;
            localStorage.setItem("uid", res)
        }
    })
}

/** 创建计数器绘制函数 */
function createCounter(elementId) {
    var el = $id(elementId);
    var ctx2d = el.getContext("2d");
    var prevWidth = 3;
    return function(value) {
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
    }
}

/** 绘制时间显示 */
function drawTimeDisplay(time) {
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
        offset += 13
    }
    ctx2d.drawImage(slashImg, offset, 0);
    offset += 13;
    ctx2d.drawImage(digitImgs[parseInt(time.charAt(i))], offset, 0)
}

/** 确保首次点击安全（如果踩雷则重排） */
function ensureFirstSafe(x, y) {
    var dir;
    var nx, ny;
    var remaining = cellsLeft;
    for (dir = 8; dir >= 0 && remaining > 0; dir--) {
        ny = y + dy[dir];
        nx = x + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            var idx = cellPos[ny * cols + nx];
            if (grid[ny][nx][1] == 1) {
                var randIdx = Math.floor(Math.random() * remaining);
                placeMine(idx, -1);
                placeMine(randIdx, 1);
                remaining--;
                swapOrder(randIdx, remaining)
            } else {
                remaining--;
                swapOrder(idx, remaining)
            }
        }
    }
    startTimer()
}

/** 初始化游戏网格 */
function initGrid() {
    var col, row;
    var i;
    var idx;
    for (row = 0; row < rows; row++) {
        grid[row] = [];
        for (col = 0; col < cols; col++) grid[row][col] = [0, 0, 0, 0]
    }
    for (idx = 0; idx < totalCells; idx++) {
        cellOrder[idx] = idx;
        cellPos[idx] = idx
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

/** 交换两个格子在顺序数组中的位置 */
function swapOrder(a, b) {
    var tmpA = cellOrder[a];
    var tmpB = cellOrder[b];
    cellOrder[a] = tmpB;
    cellOrder[b] = tmpA;
    cellPos[tmpA] = b;
    cellPos[tmpB] = a
}

/** 放置/移除雷，并更新邻居数字 */
function placeMine(idx, delta) {
    var row, col;
    var cellIdx = cellOrder[idx];
    row = Math.floor(cellIdx / cols);
    col = cellIdx % cols;
    grid[row][col][1] += delta;
    for (var dir = 0; dir < 8; dir++) {
        var ny = row + dy[dir];
        var nx = col + dx[dir];
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            grid[ny][nx][2] += delta
        }
    }
}

/** 重新开始游戏 */
function restartGame() {
    if (timerIntervalId > 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = 0
    }
    for (var i = 0; i < animTimerCount; i++) {
        clearInterval(animTimers[i])
    }
    animTimerCount = 0;
    $id("es").width = 39;
    initGrid();
    renderBoard();
    lastTouchX = -1;
    lastTouchY = -1;
    isFirstClick = 1;
    gameState = 0
}

/** 鼠标按下事件 */
function handleMouseDown(e) {
    if (touchState || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) / 25);
    var y = Math.floor((e.clientY - rect.top) / 25);
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    lastTouchX = x;
    lastTouchY = y;
    var state = grid[y][x][0];
    if (e.button == 2) {
        if (rightBtnTiming != 1) {
            if (state == 1) {
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
    } else {
        if (leftBtnTiming != 1) {
            if (state == 0) {
                if (gameState == 0) ensureFirstSafe(x, y);
                revealCell(x, y)
            } else if (state == 1) {
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
    }
}

/** 鼠标弹起事件 */
function handleMouseUp(e) {
    if (touchState || gameState > 1) return;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) / 25);
    var y = Math.floor((e.clientY - rect.top) / 25);
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    var state = grid[y][x][0];
    if (e.button == 2) {
        if (rightBtnTiming != 0) {
            if (state == 1) {
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
    } else {
        if (leftBtnTiming != 0) {
            if (state == 0) {
                if (gameState == 0) ensureFirstSafe(x, y);
                revealCell(x, y)
            } else if (state == 1) {
                chordClick(x, y)
            } else {
                flagCell(x, y)
            }
        }
    }
}

/** 触摸开始事件 */
function handleTouchStart(e) {
    if (gameState > 1) return;
    touchState = 1;
    var rect = gameCanvas.getBoundingClientRect();
    var x = Math.floor((e.touches[0].clientX - rect.left) / 25);
    var y = Math.floor((e.touches[0].clientY - rect.top) / 25);
    if (x < 0 || x == cols || y < 0 || y == rows) return;
    if (grid[y][x][0] == 1) {
        chordClick(x, y)
    } else {
        longPressTimerId = setTimeout(function() {
            return handleLongPress(x, y)
        }, 320)
    }
}

/** 长按处理 */
function handleLongPress(x, y) {
    if (tripleTapMode == 1 && touchMode == 0) return;
    if (gameState == 0) {
        ensureFirstSafe(x, y);
        revealCell(x, y);
        return
    }
    touchState = 3;
    if (touchMode == 0) {
        if (grid[y][x][0] == 2) {
            flagCell(x, y)
        }
        if (grid[y][x][0] == 0) revealCell(x, y)
    } else {
        flagCell(x, y)
    }
}

/** 触摸结束事件 */
function handleTouchEnd(e) {
    if (touchState == 1) {
        var rect = gameCanvas.getBoundingClientRect();
        var x = Math.floor((e.changedTouches[0].clientX - rect.left) / 25);
        var y = Math.floor((e.changedTouches[0].clientY - rect.top) / 25);
        if (x < 0 || x == cols || y < 0 || y == rows) return;
        var state = grid[y][x][0];
        if (gameState == 0) {
            ensureFirstSafe(x, y);
            revealCell(x, y)
        } else {
            if (touchMode == 0) {
                if (state != 1) {
                    var now = Date.now();
                    var elapsed;
                    if (x == lastTouchX && y == lastTouchY) {
                        elapsed = now - lastTapMs
                    } else {
                        lastTouchX = x;
                        lastTouchY = y;
                        lastTapMs = Date.now();
                        elapsed = 1000
                    }
                    if (tripleTapMode == 1 && elapsed < 400 && state == 0) {
                        revealCell(x, y)
                    } else {
                        flagCell(x, y)
                    }
                    lastTapMs = now
                }
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
    }
    if (e.preventDefault) {
        e.preventDefault()
    } else {
        window.event.returnValue = false
    }
}

/** 渲染棋盘 */
function renderBoard() {
    stopTimer();
    timerIntervalId = 0;
    touchState = 0;
    autoFlagEnabled = parseInt($id("af").checked ? 1 : 0);
    var width = cols * 25;
    $id("p42").style.width = width + 4 + "px";
    gameCanvas.width = width;
    gameCanvas.height = rows * 25;
    $id("face").src = faceImgs[0];
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            ctx.drawImage(cellImgs[0], x * 25, y * 25)
        }
    }
    drawMineCounter(minesLeft);
    drawTimerCounter(0)
}

/** 停止计时器 */
function stopTimer() {
    if (timerIntervalId > 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = 0;
        gameStartTime = Date.now() - gameStartTime;
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

/** 启动计时器 */
function startTimer() {
    gameStartTime = Date.now();
    elapsedSec = 0;
    gameState = 1;
    timerIntervalId = setInterval(function() {
        drawTimerCounter(++elapsedSec)
    }, 1000)
}

/** 插旗/取消插旗 */
function flagCell(x, y) {
    isFirstClick = 0;
    var cell = grid[y][x];
    if (cell[0] == 0) {
        if (minesLeft > 0) {
            if (cell[1] == 0) {
                validateBoard()
            }
            ctx.drawImage(cellImgs[1], x * 25, y * 25);
            cell[0] = 2;
            drawMineCounter(--minesLeft)
        }
    } else if (cell[0] == 2) {
        ctx.drawImage(cellImgs[0], x * 25, y * 25);
        cell[0] = 0;
        drawMineCounter(++minesLeft)
    }
}

// ---------- 初始化入口 ----------

/** 主初始化函数 */
function initGame() {
    shareBaseUrl = $id("ss").href + "#";
    initCheckbox("night", DEFAULT_NIGHT, applyNightMode);
    applyNightMode();
    initCheckbox("af", DEFAULT_AUTOFLAG, restartGame);
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
        $id("vm").value = parts[1];
        $id("mm").value = parts[2]
    }
    document.oncontextmenu = function() {
        return false
    };
    document.onselectstart = function() {
        return false
    };
    gameCanvas = $id("paf");
    ctx = gameCanvas.getContext("2d");
    drawMineCounter = createCounter("rm");
    drawTimerCounter = createCounter("es");
    gameCanvas.onmousedown = handleMouseDown;
    gameCanvas.onmouseup = handleMouseUp;
    gameCanvas.ontouchstart = handleTouchStart;
    gameCanvas.ontouchmove = function() {
        touchState = 2;
        clearTimeout(longPressTimerId)
    };
    gameCanvas.ontouchend = handleTouchEnd;
    setDifficulty(localStorage.getItem("ch7"));
    $id("nick").value = localStorage.getItem("nick");
    $id("uid").innerHTML = getPlayerId()
}

/** 获取玩家标识 */
function getPlayerId() {
    var id = localStorage.getItem("nick");
    if (id == null || id == "") id = localStorage.getItem("uid");
    if (id == null) id = "";
    return id
}

/** 设置难度 */
function setDifficulty(level) {
    var screenW, screenH;
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
        cols = 16;
        rows = 16;
        totalMines = 40;
        totalCells = 256
    } else if (difficulty == 3) {
        totalMines = 99;
        if (screenW > screenH) {
            cols = 30;
            rows = 16
        } else {
            cols = 16;
            rows = 30
        }
        totalCells = 480
    } else if (difficulty == 4) {
        cols = parseInt((screenW - 18) / 25);
        rows = parseInt((screenH - 54) / 25);
        totalCells = cols * rows;
        if (totalCells >= 480) totalMines = totalCells * .20625;
        else totalMines = totalCells * totalCells / 5760 + totalCells / 8;
        totalMines = parseInt(totalMines)
    } else if (difficulty == 5) {
        cols = parseInt($id("hm").value);
        rows = parseInt($id("vm").value);
        totalCells = cols * rows;
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

/** 应用自定义尺寸 */
function applyCustom() {
    setDifficulty(5);
    localStorage.setItem("df5", $id("hm").value + ";" + $id("vm").value + ";" + $id("mm").value);
    $id("custom").style.display = "none"
}

/** 保存昵称 */
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

/** 应用夜间模式 */
function applyNightMode() {
    var bodyStyle = document.body.style;
    var links = document.getElementsByTagName("a");
    if ($id("night").checked) {
        bodyStyle.backgroundColor = "black";
        bodyStyle.color = "silver";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = "silver"
        }
    } else {
        bodyStyle.backgroundColor = "#f7f7f0";
        bodyStyle.color = "";
        for (var i = 0; i < links.length; i++) {
            links[i].style.color = ""
        }
    }
}

/** 上报错误 */
function reportError(code, x, y) {
    var msg = VER + ":" + code;
    ajax("bug.php", msg, function(res) {})
}

/** 高亮当前难度 */
function markDifficulty(level) {
    for (var i = 1; i <= 5; i++) {
        var link = $id("c" + i);
        if (i == level) {
            link.className = "choiced"
        } else {
            link.className = ""
        }
    }
}

/** 初始化复选框设置 */
function initCheckbox(id, defaultVal, callback) {
    var el = $id(id);
    el.checked = parseInt(localStorage.getItem(id) || defaultVal);
    el.addEventListener("change", function() {
        callback();
        localStorage.setItem(id, this.checked ? 1 : 0)
    })
}

/** 初始化单选按钮设置 */
function initRadio(name, defaultVal, callback) {
    var val = parseInt(localStorage.getItem(name) || defaultVal);
    callback(val);
    document.getElementsByName(name).forEach(function(radio) {
        if (radio.value == val) {
            radio.checked = true
        }
        radio.addEventListener("change", function() {
            callback(parseInt(this.value));
            if (this.checked) localStorage.setItem(name, this.value)
        })
    })
}

/** 切换触摸 UI 显示 */
function updateTouchUI(mode) {
    if (mode == 0) {
        $id("topen").style.display = "block";
        $id("thint").style.display = "none"
    } else {
        $id("thint").style.display = "block";
        $id("topen").style.display = "none"
    }
}

/** 创建折叠/展开切换函数 */
function createToggle(btnId, panelId) {
    var expanded = 0;
    return function() {
        if (expanded == 0) {
            $id(panelId).style.display = "block";
            $id(btnId).innerText = TEXT_COLLAPSE;
            expanded = 1
        } else {
            $id(panelId).style.display = "none";
            $id(btnId).innerText = TEXT_SETTINGS;
            expanded = 0
        }
    }
}

// 设置面板的折叠切换
var toggleMouseSettings = createToggle("setm", "_mouse");
var toggleTouchSettings = createToggle("sett", "_touch");