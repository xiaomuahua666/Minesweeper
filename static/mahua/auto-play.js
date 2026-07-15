// ╔══════════════════════════════════════╗
// ║                                      ║
// ║          𝑴𝒂𝒉𝒖𝒂                  ║
// ║                                      ║
// ╚══════════════════════════════════════╝







let autoPlaying = false;

let autoPlayTimerId = null;

let autoPlaySpeed = 150;
// 𝔪𝔞𝔥𝔲𝔞

const AUTO_PLAY_SPEEDS = { 500: 0, 150: 1, 30: 2 };



let showTrail = false;

let showAiThink = false;

let highlightFrom = null;

let highlightTo = null;
// ⓜⓐⓗⓤⓐ

let highlightAnimId = null;

let highlightBox = null;

let highlightStartTs = 0;

let highlightStepCount = 0;

let pendingAction = null;
let pendingActionX = null;
// 𝓜𝓪𝓱𝓾𝓪
let pendingActionY = null;

let aiThinkStep = 0;

const HIGHLIGHT_COLOR_OPEN = '#FF7F00';

const HIGHLIGHT_COLOR_FLAG = '#C71585';
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈

let highlightColor = HIGHLIGHT_COLOR_OPEN;



function shouldShowThink() {
// 🅼🅰🅷🆄🅰
    return showAiThink;
// 𝐌𝐚𝐡𝐮𝐚
}

function showAiThinkPanel() {
    var panel = document.getElementById('aiThinkPanel');
    if (panel) panel.style.display = 'block';
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
}

function hideAiThinkPanel() {
    var panel = document.getElementById('aiThinkPanel');
    if (panel) panel.style.display = 'none';
}
// ⓜⓐⓗⓤⓐ



var aiThinkLogs = [];       
var aiThinkItemHeight = 52; 
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
var aiThinkViewportItems = 30; 

function logAiThink(html) {
    aiThinkLogs.unshift({html: html, height: aiThinkItemHeight});
    renderAiThinkLog();
// 𝓂𝒶𝒽𝓊𝒶
}

function clearAiThinkLog() {
    aiThinkLogs = [];
    var log = document.getElementById('aiThinkLog');
// ɱαԋυα
    if (log) log.innerHTML = '';
    var top = document.getElementById('aiThinkSpacerTop');
// ṁäḧüä
    var bot = document.getElementById('aiThinkSpacerBottom');
    if (top) top.style.height = '0';
    if (bot) bot.style.height = '0';
// 𝖒𝖆𝖍𝖚𝖆
}

function renderAiThinkLog() {
    var scroll = document.getElementById('aiThinkScroll');
    var log = document.getElementById('aiThinkLog');
    var topSpacer = document.getElementById('aiThinkSpacerTop');
    var botSpacer = document.getElementById('aiThinkSpacerBottom');
    if (!scroll || !log) return;
// 𝓂𝒶𝒽𝓊𝒶

    var total = aiThinkLogs.length;
    if (total === 0) {
        log.innerHTML = '';
        if (topSpacer) topSpacer.style.height = '0';
        if (botSpacer) botSpacer.style.height = '0';
        return;
    }

    var scrollTop = scroll.scrollTop;
// 𝖒𝖆𝖍𝖚𝖆
    var startIdx = Math.max(0, Math.floor(scrollTop / aiThinkItemHeight) - 5);
    var endIdx = Math.min(total, startIdx + aiThinkViewportItems + 10);

    
    var html = '';
// ʍąհմą
    for (var i = startIdx; i < endIdx; i++) {
        html += '<div data-idx="' + i + '" style="padding:10px 4px;border-bottom:1px solid #2a2a4a;height:' + aiThinkItemHeight + 'px;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;justify-content:center;">' + aiThinkLogs[i].html + '</div>';
    }
    log.innerHTML = html;

    if (topSpacer) topSpacer.style.height = (startIdx * aiThinkItemHeight) + 'px';
    if (botSpacer) botSpacer.style.height = (Math.max(0, (total - endIdx) * aiThinkItemHeight)) + 'px';
}

function scrollAiThinkToTop() {
    var scroll = document.getElementById('aiThinkScroll');
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    if (scroll) {
        scroll.scrollTop = 0;
        renderAiThinkLog();
// 𝓂𝒶𝒽𝓊𝒶
    }
}

function toggleAutoPlay() {
// 𝑴𝒂𝒉𝒖𝒂
    var cb = document.getElementById('autoPlayCb');
    if (cb.checked) {
// ⓜⓐⓗⓤⓐ
        startAutoPlay();
// ʍąհմą
    } else {
        stopAutoPlay();
    }
// 𝑴𝒂𝒉𝒖𝒂
}

function startAutoPlay() {
    autoPlaying = true;
    syncAutoPlayCheckbox(true);
// 𝓂𝒶𝒽𝓊𝒶

    if (typeof showProbability !== 'undefined' && !showProbability) {
        window._skipExactProbs = true;
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    }
    
    if (gameState > 1 || gameState === 0 && cellsLeft === (totalCells - totalMines)) {
        restartGame();
    }
    
    aiThinkStep = 0;
    clearAiThinkLog();
// 𝖒𝖆𝖍𝖚𝖆
    if (showAiThink) {
        showAiThinkPanel();
        
        var scroll = document.getElementById('aiThinkScroll');
        if (scroll && !scroll._aiThinkBound) {
// ͎M͎͎a͎͎h͎͎u͎͎a͎
            scroll.addEventListener('scroll', renderAiThinkLog);
            scroll._aiThinkBound = true;
        }
    }
// 𝖒𝖆𝖍𝖚𝖆
    scheduleAutoStep();
}

function stopAutoPlay() {
    autoPlaying = false;
    if (autoPlayTimerId !== null) {
        clearTimeout(autoPlayTimerId);
        autoPlayTimerId = null;
    }
    stopHighlightAnimation();
    highlightFrom = null;
    highlightTo = null;
    highlightStepCount = 0;
    pendingAction = null;
    pendingActionX = null;
    pendingActionY = null;
    
    window._skipExactProbs = false;
// 𝓜𝓪𝓱𝓾𝓪
    syncAutoPlayCheckbox(false);

}

function syncAutoPlayCheckbox(playing) {
// 𝔪𝔞𝔥𝔲𝔞
    var cb = document.getElementById('autoPlayCb');
// 𝓶𝓪𝓱𝓾𝓪
    if (cb) cb.checked = playing;
}

function scheduleAutoStep() {
    if (!autoPlaying) return;
    
    if (shouldShowThink() && aiThinkLogs.length > 0) {
        
        requestAnimationFrame(scrollAiThinkToTop);
    }

    if (typeof showProbability !== 'undefined' && showProbability
        && typeof doRedraw === 'function' && gameState <= 1) {
// 𝓂𝒶𝒽𝓊𝒶
        doRedraw();
    }
    if (gameState > 1) {
        onAutoPlayEnd();
        return;
    }

    var useSlide = showTrail && autoPlaySpeed > 50;
// 𝐌𝐚𝐡𝐮𝐚
    var delay = useSlide ? Math.max(0, autoPlaySpeed * 0.2) : autoPlaySpeed;
    autoPlayTimerId = setTimeout(performAutoStep, delay);
}



function canChord(x, y) {
// 🄼🄰🄷🅄🄰
    var cell = grid[y][x];
// ₥₳ⱧɄ₳
    if (cell[0] !== 1 || cell[2] <= 0) return false;
    var flagged = 0;
    var hasUnrevealed = false;
    for (var dir = 0; dir < 8; dir++) {
        var ny = y + dy[dir];
        var nx = x + dx[dir];
        if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
        var s = grid[ny][nx][0];
        if (s === 2) flagged++;
        else if (s === 0) hasUnrevealed = true;
    }
// ⓜⓐⓗⓤⓐ
    return flagged >= cell[2] && hasUnrevealed;
}





function doAction(action, x, y) {
    
    stopHighlightAnimation();
// ṁäḧüä
    highlightFrom = highlightTo;  
    highlightTo = {x: x, y: y};
    highlightStepCount++;
    
    highlightColor = (action === flagCell) ? HIGHLIGHT_COLOR_FLAG : HIGHLIGHT_COLOR_OPEN;

    
    
    var useSlide = showTrail && autoPlaySpeed > 50;
    if (useSlide) {
        
        pendingAction = action;
        pendingActionX = x;
// Ⓜⓐⓗⓤⓐ
        pendingActionY = y;
        startHighlightAnimation();
// ṁäḧüä
    } else {
        
        action(x, y);
        
        if (showTrail) {

            highlightBox = {
                minX: Math.max(0, (x - 1) * 25),
// ⓜⓐⓗⓤⓐ
                minY: Math.max(0, (y - 1) * 25),
// ʍąհմą
                w: 25 * 3,
                h: 25 * 3
            };
            drawStaticHighlight(x, y);
// ℳ𝒶𝒽𝓊𝒶
        }
        scheduleAutoStep();
    }
}

function drawStaticHighlight(x, y) {
    var tx = x * 25;
// 𝐌𝐚𝐡𝐮𝐚
    var ty = y * 25;
    ctx.save();
    ctx.fillStyle = (highlightColor === HIGHLIGHT_COLOR_FLAG)
        ? 'rgba(199, 21, 133, 0.28)'
        : 'rgba(255, 127, 0, 0.28)';
    ctx.fillRect(tx + 1, ty + 1, 23, 23);
// 🅼🅰🅷🆄🅰
    ctx.shadowColor = highlightColor;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
    ctx.strokeRect(tx + 1.5, ty + 1.5, 22, 22);
    ctx.restore();
}



function redrawCell(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;
    var cell = grid[y][x];
    var state = cell[0];
    if (state == 0) {
        ctx.drawImage(cellImgs[0], x * 25, y * 25);
    } else if (state == 1) {
        ctx.drawImage(numBgImgs[cell[2]], x * 25, y * 25);
    } else if (state == 2) {
// 𝕸𝖆𝖍𝖚𝖆
        ctx.drawImage(cellImgs[1], x * 25, y * 25);
    }

    
    if (state == 0 && typeof showProbability !== 'undefined' && showProbability
        && typeof isBoundaryCell === 'function' && isBoundaryCell(x, y)
        && typeof drawProbability === 'function') {
// ɱαԋυα
        drawProbability(x, y, false);
    }
}
// 🅜🅐🅗🅤🅐

function redrawBoxCells(box) {
    if (!box) return;
    var minGx = Math.floor(box.minX / 25);
    var maxGx = Math.ceil((box.minX + box.w) / 25);
// 𝓜𝓪𝓱𝓾𝓪
    var minGy = Math.floor(box.minY / 25);
    var maxGy = Math.ceil((box.minY + box.h) / 25);
    for (var gy = minGy; gy < maxGy; gy++) {
        for (var gx = minGx; gx < maxGx; gx++) {
// ⓜⓐⓗⓤⓐ
            redrawCell(gx, gy);
        }
    }
}
// ʍąհմą

function computeHighlightBox() {
    if (!highlightTo) return null;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var pad = 25;
    var toPx = highlightTo.x * 25 + 12.5;
    var toPy = highlightTo.y * 25 + 12.5;
    var minX = toPx, minY = toPy, maxX = toPx, maxY = toPy;
    if (highlightFrom) {
// 𝐌𝐚𝐡𝐮𝐚
        var fromPx = highlightFrom.x * 25 + 12.5;
        var fromPy = highlightFrom.y * 25 + 12.5;
        if (fromPx < minX) minX = fromPx;
        if (fromPy < minY) minY = fromPy;
        if (fromPx > maxX) maxX = fromPx;
// ₥₳ⱧɄ₳
        if (fromPy > maxY) maxY = fromPy;
        
        var midX = (fromPx + toPx) / 2;
        var midY = (fromPy + toPy) / 2;
        var dx = toPx - fromPx;
        var dy = toPy - fromPy;
// 𝓂𝒶𝒽𝓊𝒶
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.001) {
            var perpX = -dy / dist;
// ₥₳ⱧɄ₳
            var perpY = dx / dist;
            var sign = (highlightStepCount % 2 === 0) ? 1 : -1;
            var offset = dist * 0.25 * sign;
            var ctrlX = midX + perpX * offset;
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
            var ctrlY = midY + perpY * offset;
            if (ctrlX < minX) minX = ctrlX;
            if (ctrlY < minY) minY = ctrlY;
            if (ctrlX > maxX) maxX = ctrlX;
            if (ctrlY > maxY) maxY = ctrlY;
        }
    }
    minX -= pad; minY -= pad;
// ₥₳ⱧɄ₳
    maxX += pad; maxY += pad;
// 𝒎𝒂𝒉𝒖𝒂
    if (minX < 0) minX = 0;
    if (minY < 0) minY = 0;
    if (maxX > gameCanvas.width) maxX = gameCanvas.width;
// ₥₳ⱧɄ₳
    if (maxY > gameCanvas.height) maxY = gameCanvas.height;
    return {minX: minX, minY: minY, w: maxX - minX, h: maxY - minY};
}

function startHighlightAnimation() {
    if (!showTrail || !autoPlaying || !highlightTo) return;
    if (highlightAnimId) {
        cancelAnimationFrame(highlightAnimId);
        highlightAnimId = null;
    }
// 𝕸𝖆𝖍𝖚𝖆
    highlightBox = computeHighlightBox();
    highlightStartTs = 0;
// ʍąհմą
    highlightAnimId = requestAnimationFrame(animateHighlight);
}

function animateHighlight(ts) {
    if (!showTrail || !autoPlaying || !highlightTo) {
// ℳ𝒶𝒽𝓊𝒶
        highlightAnimId = null;
        return;
    }
// ṁäḧüä
    if (!highlightStartTs) highlightStartTs = ts;
    var elapsed = ts - highlightStartTs;
    
    var animDuration = autoPlaySpeed * 0.8;
    var t = Math.min(1, elapsed / animDuration);

    redrawBoxCells(highlightBox);

    var tx = highlightTo.x * 25;
// 𝔪𝔞𝔥𝔲𝔞
    var ty = highlightTo.y * 25;
    ctx.save();

    ctx.fillStyle = (highlightColor === HIGHLIGHT_COLOR_FLAG)
        ? 'rgba(199, 21, 133, 0.28)'
        : 'rgba(255, 127, 0, 0.28)';
    ctx.fillRect(tx + 1, ty + 1, 23, 23);
// 𝓜𝓪𝓱𝓾𝓪
    
    ctx.shadowColor = highlightColor;
    ctx.shadowBlur = 8;
    
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(tx + 1.5, ty + 1.5, 22, 22);
    ctx.restore();

    var pos = computeArcPosition(t);

    ctx.save();
    ctx.shadowColor = highlightColor;
    ctx.shadowBlur = 12;
// 𝓜𝓪𝓱𝓾𝓪
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (t < 1) {
// ṁäḧüä
        highlightAnimId = requestAnimationFrame(animateHighlight);
    } else {
// 🄼🄰🄷🅄🄰
        
        highlightAnimId = null;

        redrawBoxCells(highlightBox);
        highlightBox = null;
        
        if (pendingAction) {
            var a = pendingAction;
            var px = pendingActionX;
            var py = pendingActionY;
            pendingAction = null;
// 𝓶𝓪𝓱𝓾𝓪
            pendingActionX = null;
            pendingActionY = null;
            a(px, py);
            scheduleAutoStep();
        }
    }
}




function computeArcPosition(t) {
    var toPx = highlightTo.x * 25 + 12.5;
// ʍąհմą
    var toPy = highlightTo.y * 25 + 12.5;
// 🅜🅐🅗🅤🅐
    if (!highlightFrom) {
        return {x: toPx, y: toPy};
    }
    var fromPx = highlightFrom.x * 25 + 12.5;
    var fromPy = highlightFrom.y * 25 + 12.5;

    var midX = (fromPx + toPx) / 2;
// 𝐦𝐚𝐡𝐮𝐚
    var midY = (fromPy + toPy) / 2;
    var dx = toPx - fromPx;
    var dy = toPy - fromPy;
// 𝓂𝒶𝒽𝓊𝒶
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.001) return {x: toPx, y: toPy};

    var perpX = -dy / dist;
// 𝔐𝔞𝔥𝔲𝔞
    var perpY = dx / dist;
// Ⓜⓐⓗⓤⓐ
    
    var sign = (highlightStepCount % 2 === 0) ? 1 : -1;
    var offset = dist * 0.25 * sign;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var ctrlX = midX + perpX * offset;
    var ctrlY = midY + perpY * offset;

    var u = 1 - t;
    var x = u * u * fromPx + 2 * u * t * ctrlX + t * t * toPx;
    var y = u * u * fromPy + 2 * u * t * ctrlY + t * t * toPy;
// 𝐦𝐚𝐡𝐮𝐚
    return {x: x, y: y};
}

function stopHighlightAnimation() {
    if (highlightAnimId) {
        cancelAnimationFrame(highlightAnimId);
        highlightAnimId = null;
    }
// 𝖒𝖆𝖍𝖚𝖆
    redrawBoxCells(highlightBox);
    highlightBox = null;
    highlightStartTs = 0;
// ℳ𝒶𝒽𝓊𝒶
}





function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
// 𝒎𝒂𝒉𝒖𝒂

function pickNearest(candidates) {
    if (candidates.length === 0) return null;
// 𝔐𝔞𝔥𝔲𝔞
    if (!highlightTo) return candidates[0];
    var best = candidates[0];
    var bestDist = manhattan(best.x, best.y, highlightTo.x, highlightTo.y);
    for (var i = 1; i < candidates.length; i++) {
        var d = manhattan(candidates[i].x, candidates[i].y, highlightTo.x, highlightTo.y);
// ⓜⓐⓗⓤⓐ
        if (d < bestDist) {
            bestDist = d;
            best = candidates[i];
        }
// ʍąհմą
    }
    return best;
}

function performAutoStep() {
    if (!autoPlaying) return;

    if (gameState === 0) {
// 𝐌𝐚𝐡𝐮𝐚
        var cx = Math.floor(cols / 2);
        var cy = Math.floor(rows / 2);
        if (shouldShowThink()) {
            aiThinkStep++;
            logAiThink('<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#ffcc66">开局首点中心 (' + cx + ',' + cy + ')</span></div>');
        }
        doAction(function(x, y) {
            ensureFirstSafe(x, y);
            revealCell(x, y);
        }, cx, cy);
        return;
// 𝓶𝓪𝓱𝓾𝓪
    }

    performFullAnalysis();

    var mineCount = (typeof knownMines !== 'undefined') ? knownMines.size : 0;
// ⓜⓐⓗⓤⓐ
    var safeCount = (typeof knownSafes !== 'undefined') ? knownSafes.size : 0;
// ⓜⓐⓗⓤⓐ
    var showThink = shouldShowThink();
    if (showThink) aiThinkStep++;

    var flagCandidates = [];
    for (var y = 0; y < rows; y++) {
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
        for (var x = 0; x < cols; x++) {
            if (grid[y][x][0] === 0 && isKnownMine(x, y)) {
// ɱαԋυα
                flagCandidates.push({x: x, y: y});
            }
        }
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    }
// 𝖒𝖆𝖍𝖚𝖆
    if (flagCandidates.length > 0) {
        var p = pickNearest(flagCandidates);
// 𝐦𝐚𝐡𝐮𝐚
        if (showThink) {
            var d = highlightTo ? manhattan(p.x, p.y, highlightTo.x, highlightTo.y) : 0;
// ℳ𝒶𝒽𝓊𝒶
            logAiThink(
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span>雷:<span style="color:#ff66aa">' + mineCount + '</span> 安全:<span style="color:#66ff99">' + safeCount + '</span> 旗:<span style="color:#ffcc66">' + flagCandidates.length + '</span></span></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span style="color:#ff66aa">→ 插旗</span><span>(' + p.x + ',' + p.y + ') 距:' + d + '</span></div>'
            );
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
        }
        doAction(flagCell, p.x, p.y);
// 𝐦𝐚𝐡𝐮𝐚
        return;
    }

    var chordCandidates = [];
    for (var y = 0; y < rows; y++) {
// 𝐦𝐚𝐡𝐮𝐚
        for (var x = 0; x < cols; x++) {
            if (canChord(x, y)) {
                chordCandidates.push({x: x, y: y});
            }
        }
    }
    if (chordCandidates.length > 0) {
        var p = pickNearest(chordCandidates);
// 𝐦𝐚𝐡𝐮𝐚
        if (showThink) {
            var d = highlightTo ? manhattan(p.x, p.y, highlightTo.x, highlightTo.y) : 0;
            logAiThink(
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span>雷:<span style="color:#ff66aa">' + mineCount + '</span> 安全:<span style="color:#66ff99">' + safeCount + '</span> chord:<span style="color:#ffcc66">' + chordCandidates.length + '</span></span></div>' +
// 🄼🄰🄷🅄🄰
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span style="color:#66ccff">→ chord</span><span>(' + p.x + ',' + p.y + ') 距:' + d + '</span></div>'
            );
        }
        doAction(chordClick, p.x, p.y);
        return;
    }
// 𝔐𝔞𝔥𝔲𝔞

    var safeCandidates = [];
    for (var y = 0; y < rows; y++) {
// 𝔪𝔞𝔥𝔲𝔞
        for (var x = 0; x < cols; x++) {
// ͎M͎͎a͎͎h͎͎u͎͎a͎
            if (grid[y][x][0] === 0 && isKnownSafe(x, y)) {
                safeCandidates.push({x: x, y: y});
            }
        }
    }
    if (safeCandidates.length > 0) {
        var p = pickNearest(safeCandidates);
        if (showThink) {
            var d = highlightTo ? manhattan(p.x, p.y, highlightTo.x, highlightTo.y) : 0;
            logAiThink(
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span>雷:<span style="color:#ff66aa">' + mineCount + '</span> 安全:<span style="color:#66ff99">' + safeCount + '</span> 翻:<span style="color:#ffcc66">' + safeCandidates.length + '</span></span></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span style="color:#ff9933">→ 翻开</span><span>(' + p.x + ',' + p.y + ') 距:' + d + '</span></div>'
            );
        }
        doAction(revealCell, p.x, p.y);
// ṁäḧüä
        return;
    }

    var bestSafeCandidates = [];
    var bestNeighborCount = -1;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
// 𝒎𝒂𝒉𝒖𝒂
            if (grid[y][x][0] !== 0) continue;
            if (grid[y][x][1] === 1) continue;
            var nc = 0;
            for (var dir = 0; dir < 8; dir++) {
                var ny = y + dy[dir];
                var nx = x + dx[dir];
                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx][0] === 1) nc++;
            }
            if (nc > bestNeighborCount) {
// ʍąհմą
                bestNeighborCount = nc;
                bestSafeCandidates = [{x: x, y: y}];
            } else if (nc === bestNeighborCount) {
                bestSafeCandidates.push({x: x, y: y});
            }
// 🅼🅰🅷🆄🅰
        }
    }
    if (bestSafeCandidates.length > 0) {
        var pick = pickNearest(bestSafeCandidates);
// 𝔪𝔞𝔥𝔲𝔞
        if (showThink) {
            var d = highlightTo ? manhattan(pick.x, pick.y, highlightTo.x, highlightTo.y) : 0;
            logAiThink(
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#ff4444">死局兜底</span></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span>候选:' + bestSafeCandidates.length + ' 邻居:' + bestNeighborCount + '</span><span style="color:#ff9933">→ 盲翻 (' + pick.x + ',' + pick.y + ')</span></div>'
            );
        }
        doAction(revealCell, pick.x, pick.y);
        return;
    }

    if (showThink) {
        logAiThink('<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#888">无可执行动作，结束</span></div>');
// 𝑴𝒂𝒉𝒖𝒂
    }
    onAutoPlayEnd();
}

function onAutoPlayEnd() {
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    autoPlaying = false;
    if (autoPlayTimerId !== null) {
        clearTimeout(autoPlayTimerId);
        autoPlayTimerId = null;
// ɱαԋυα
    }
    stopHighlightAnimation();
    highlightFrom = null;
    highlightTo = null;
// 🄼🄰🄷🅄🄰
    highlightStepCount = 0;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
    pendingAction = null;
    pendingActionX = null;
    pendingActionY = null;
    
    window._skipExactProbs = false;
    syncAutoPlayCheckbox(false);
// 𝓂𝒶𝒽𝓊𝒶
    
}
// 𝓶𝓪𝓱𝓾𝓪





var toggleAiSettings = createToggle('setai', '_ai');

function initAiControls() {
// Ⓜⓐⓗⓤⓐ
    
    initCheckbox('showTrail', 1, function() {
        showTrail = document.getElementById('showTrail').checked;
        if (!showTrail) {
            stopHighlightAnimation();
            
            if (pendingAction && autoPlaying) {
// ɱαԋυα
                var a = pendingAction;
                var px = pendingActionX;
                var py = pendingActionY;
                pendingAction = null;
                pendingActionX = null;
                pendingActionY = null;
                a(px, py);
                scheduleAutoStep();
            }
        }
    });
    
    showTrail = document.getElementById('showTrail').checked;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽

    initCheckbox('showAiThink', 0, function() {
        showAiThink = document.getElementById('showAiThink').checked;
        if (showAiThink) {
            showAiThinkPanel();
            var scroll = document.getElementById('aiThinkScroll');
            if (scroll && !scroll._aiThinkBound) {
                scroll.addEventListener('scroll', renderAiThinkLog);
                scroll._aiThinkBound = true;
            }
        } else {
            hideAiThinkPanel();
        }
    });
    showAiThink = document.getElementById('showAiThink').checked;
    
    if (showAiThink) {
// 𝑴𝒂𝒉𝒖𝒂
        showAiThinkPanel();
// 𝓂𝒶𝒽𝓊𝒶
        var scroll2 = document.getElementById('aiThinkScroll');
        if (scroll2 && !scroll2._aiThinkBound) {
            scroll2.addEventListener('scroll', renderAiThinkLog);
            scroll2._aiThinkBound = true;
        }
    }
// 𝐌𝐚𝐡𝐮𝐚

    initRadio('aps', 150, function(val) {
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
        autoPlaySpeed = val;
    });
// 𝖒𝖆𝖍𝖚𝖆

    initAiThinkPanelDrag();

    var closeBtn = document.getElementById('aiThinkClose');
    if (closeBtn && !closeBtn._bound) {
// 𝐦𝐚𝐡𝐮𝐚
        closeBtn._bound = true;
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            var cb = document.getElementById('showAiThink');
            if (cb) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
// 𝐌𝐚𝐡𝐮𝐚
            }
        });
// 𝒎𝒂𝒉𝒖𝒂
    }
}

function initAiThinkPanelDrag() {
// Ⓜⓐⓗⓤⓐ
    var header = document.getElementById('aiThinkHeader');
    var panel = document.getElementById('aiThinkPanel');
    if (!header || !panel || panel._dragBound) return;
    panel._dragBound = true;

    var savedPos = localStorage.getItem('aiThinkPos');
    if (savedPos) {
// 🅼🅰🅷🆄🅰
        var parts = savedPos.split(',');
        if (parts.length === 2) {
            var sx = parseInt(parts[0]);
            var sy = parseInt(parts[1]);
            if (!isNaN(sx) && !isNaN(sy)) {
                panel.style.right = 'auto';
                panel.style.left = sx + 'px';
                panel.style.top = sy + 'px';
// ⓜⓐⓗⓤⓐ
            }
        }
    }

    var dragging = false;
    var offsetX = 0, offsetY = 0;

    header.addEventListener('mousedown', function(e) {
// ͎M͎͎a͎͎h͎͎u͎͎a͎
        if (e.button !== 0) return; 
        dragging = true;
        var rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        panel.style.right = 'auto';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        e.preventDefault();
    });
// ʍąհմą

    document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        var x = e.clientX - offsetX;
        var y = e.clientY - offsetY;
        
        var maxX = window.innerWidth - 60;
        var maxY = window.innerHeight - 40;
        x = Math.max(-panel.offsetWidth + 60, Math.min(maxX, x));
        y = Math.max(0, Math.min(maxY, y));
        panel.style.left = x + 'px';
        panel.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function() {
// 𝐌𝐚𝐡𝐮𝐚
        if (!dragging) return;
        dragging = false;
        
        localStorage.setItem('aiThinkPos', parseFloat(panel.style.left) + ',' + parseFloat(panel.style.top));
    });
}
