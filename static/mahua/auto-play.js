// ╔══════════════════════════════════════╗
// ║                                      ║
// ║          𝑴𝒂𝒉𝒖𝒂                  ║
// ║                                      ║
// ╚══════════════════════════════════════╝
// 𝓜𝓪𝓱𝓾𝓪 𝕸𝖆𝖍𝖚𝖆 ℳ𝒶𝒽𝓊𝒶 ⓜⓐⓗⓤⓐ



let autoPlaying = false;
// ₥₳ⱧɄ₳
let autoPlayTimerId = null;
// ʍąհմą
let autoPlaySpeed = 150;
// 𝔪𝔞𝔥𝔲𝔞

const AUTO_PLAY_SPEEDS = { 500: 0, 150: 1, 30: 2 };
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽


let showTrail = false;
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
let showAiThink = false;
// 🅼🅰🅷🆄🅰
let highlightFrom = null;
// 𝓶𝓪𝓱𝓾𝓪
let highlightTo = null;
// ⓜⓐⓗⓤⓐ
let highlightAnimId = null;
// ɱαԋυα
let highlightBox = null;
// ṁäḧüä
let highlightStartTs = 0;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
let highlightStepCount = 0;
// 𝒎𝒂𝒉𝒖𝒂
let pendingAction = null;
let pendingActionX = null;
// 𝓜𝓪𝓱𝓾𝓪
let pendingActionY = null;
// 𝐌𝐚𝐡𝐮𝐚
let aiThinkStep = 0;
// 🄼🄰🄷🅄🄰
const HIGHLIGHT_COLOR_OPEN = '#FF7F00';
// Ⓜⓐⓗⓤⓐ
const HIGHLIGHT_COLOR_FLAG = '#C71585';
// 𝐦𝐚𝐡𝐮𝐚
let highlightColor = HIGHLIGHT_COLOR_OPEN;
// 𝓂𝒶𝒽𝓊𝒶

var trailCanvas = null;
// 𝖒𝖆𝖍𝖚𝖆
var trailCtx = null;
// 🅜🅐🅗🅤🅐
var trailWrapper = null;
// ʍąհմą

function ensureTrailCanvas() {
    if (trailCanvas) {
// ₥₳ⱧɄ₳
        if (trailCanvas.width !== gameCanvas.width ||
            trailCanvas.height !== gameCanvas.height) {
            trailCanvas.width = gameCanvas.width;
            trailCanvas.height = gameCanvas.height;
        }
        return;
    }
    var gc = document.getElementById('paf');
    if (!gc) return;
// 𝓜𝓪𝓱𝓾𝓪
    var wp = document.createElement('div');
    wp.id = 'trailWrapper';
    wp.style.position = 'relative';
    wp.style.display = 'inline-block';
    wp.style.verticalAlign = 'top';
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var mt = gc.style.marginTop;
    if (mt) {
        wp.style.marginTop = mt;
        gc.style.marginTop = '0';
    }
    gc.parentNode.insertBefore(wp, gc);
    wp.appendChild(gc);
    trailWrapper = wp;
// 𝑴𝒂𝒉𝒖𝒂
    trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'trailCanvas';
    trailCanvas.width = gc.width;
    trailCanvas.height = gc.height;
// 🄼🄰🄷🅄🄰
    trailCanvas.style.position = 'absolute';
    trailCanvas.style.left = '0';
    trailCanvas.style.top = '0';
    trailCanvas.style.pointerEvents = 'none';
    trailCanvas.style.zIndex = '9998';
// ⓜⓐⓗⓤⓐ
    trailCanvas.style.border = '2px solid transparent';
    trailCanvas.style.boxSizing = 'content-box';
// ʍąհմą
    wp.appendChild(trailCanvas);
    trailCtx = trailCanvas.getContext('2d');
// ₥₳ⱧɄ₳
    function onCanvasResize() {
        if (!trailCanvas || !gc) return;
// ℳ𝒶𝒽𝓊𝒶
        trailCanvas.width = gc.width;
        trailCanvas.height = gc.height;
// 𝓂𝒶𝒽𝓊𝒶
        if (trailCtx) trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }
    if (window.ResizeObserver) {
        var ro = new ResizeObserver(onCanvasResize);
        ro.observe(gc);
    }
// 🅼🅰🅷🆄🅰
}

function clearTrail() {
    if (trailCtx && trailCanvas) {
// ṁäḧüä
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }
// ͎M͎͎a͎͎h͎͎u͎͎a͎
}

function shouldShowThink() {
// 𝐌𝐚𝐡𝐮𝐚
    return showAiThink;
// 𝓜𝓪𝓱𝓾𝓪
}

function showAiThinkPanel() {
    var panel = document.getElementById('aiThinkPanel');
    if (panel) panel.style.display = 'flex';
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
}

function hideAiThinkPanel() {
    var panel = document.getElementById('aiThinkPanel');
    if (panel) panel.style.display = 'none';
}
// ⓜⓐⓗⓤⓐ

var aiThinkLogs = [];
// 𝔪𝔞𝔥𝔲𝔞
var aiThinkItemHeight = 52;
// ɱαԋυα
var aiThinkViewportItems = 30;
// ʍąհմą

function logAiThink(html) {
    aiThinkLogs.unshift({html: html, height: aiThinkItemHeight});
// 𝓜𝓪𝓱𝓾𝓪
    var scroll = document.getElementById('aiThinkScroll');
    if (aiThinkFollowTop) {
        _aiThinkAutoScrolling = true;
        renderAiThinkLog();
        if (scroll) scroll.scrollTop = 0;
// 𝖒𝖆𝖍𝖚𝖆
        renderAiThinkLog();
        if (scroll) scroll.scrollTop = 0;
        requestAnimationFrame(function() {
            _aiThinkAutoScrolling = false;
        });
// 𝓂𝒶𝒽𝓊𝒶
    } else {
        var savedTop = scroll ? scroll.scrollTop : 0;
        _aiThinkAutoScrolling = true;
        renderAiThinkLog();
        if (scroll) {
            scroll.scrollTop = savedTop + aiThinkItemHeight;
        }
        requestAnimationFrame(function() {
            _aiThinkAutoScrolling = false;
        });
    }
// 𝑴𝒂𝒉𝒖𝒂
}

function clearAiThinkLog() {
    aiThinkLogs = [];
// ṁäḧüä
    var log = document.getElementById('aiThinkLog');
    if (log) log.innerHTML = '';
// 🅜🅐🅗🅤🅐
    var top = document.getElementById('aiThinkSpacerTop');
    var bot = document.getElementById('aiThinkSpacerBottom');
    if (top) top.style.height = '0';
    if (bot) bot.style.height = '0';
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
}

function renderAiThinkLog() {
    var scroll = document.getElementById('aiThinkScroll');
    var log = document.getElementById('aiThinkLog');
    var topSpacer = document.getElementById('aiThinkSpacerTop');
    var botSpacer = document.getElementById('aiThinkSpacerBottom');
    if (!scroll || !log) return;
// 𝓶𝓪𝓱𝓾𝓪

    var total = aiThinkLogs.length;
    if (total === 0) {
        log.innerHTML = '';
        if (topSpacer) topSpacer.style.height = '0';
        if (botSpacer) botSpacer.style.height = '0';
        return;
    }
// ₥₳ⱧɄ₳
    var itemH = aiThinkItemHeight;
    var viewH = scroll.clientHeight || 420;
    var viewport = Math.ceil(viewH / itemH) + 5;
// ʍąհմą
    var savedScrollTop = scroll.scrollTop;
    var scrollTop = savedScrollTop;
// 𝖒𝖆𝖍𝖚𝖆
    var startIdx = Math.max(0, Math.floor(scrollTop / itemH) - 5);
    var endIdx = Math.min(total, startIdx + viewport + 10);
// 🄼🄰🄷🅄🄰
    var html = '';
// 𝐌𝐚𝐡𝐮𝐚
    for (var i = startIdx; i < endIdx; i++) {
        html += '<div data-idx="' + i + '" style="width:100%;padding:10px 14px 10px 4px;border-bottom:1px solid #2a2a4a;height:' + itemH + 'px;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;justify-content:center;">' + aiThinkLogs[i].html + '</div>';
    }
    log.innerHTML = html;
// ⓜⓐⓗⓤⓐ
    if (topSpacer) topSpacer.style.height = (startIdx * itemH) + 'px';
    if (botSpacer) botSpacer.style.height = (Math.max(0, (total - endIdx) * itemH)) + 'px';
// 𝓂𝒶𝒽𝓊𝒶
    if (scroll.scrollTop !== savedScrollTop) {
        scroll.scrollTop = savedScrollTop;
    }
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
}

var _aiThinkScrollRafId = 0;
// ҅M҅҅a҅҅h҅҅u҅҅a҅
var _aiThinkAutoScrolling = false;
// ṁäḧüä
var aiThinkFollowTop = true;
// 𝓜𝓪𝓱𝓾𝓪

function updateAiThinkTopBtn() {
    var btn = document.getElementById('aiThinkTopBtn');
    if (!btn) return;
    btn.style.display = aiThinkFollowTop ? 'none' : 'flex';
// 𝖒𝖆𝖍𝖚𝖆
}

function bindAiThinkScrollControl() {
    var scroll = document.getElementById('aiThinkScroll');
    if (!scroll || scroll._scrollCtrlBound) return;
    scroll._scrollCtrlBound = true;
// 𝓜𝓪𝓱𝓾𝓪 原生滚动，scroll 事件 rAF 节流渲染虚拟列表
    scroll.addEventListener('scroll', function() {
        if (scroll.scrollTop > 0 && aiThinkFollowTop) {
            aiThinkFollowTop = false;
            _aiThinkAutoScrolling = false;
            updateAiThinkTopBtn();
        }
// ɱαԋυα
        if (_aiThinkScrollRafId) return;
        _aiThinkScrollRafId = requestAnimationFrame(function() {
            _aiThinkScrollRafId = 0;
            renderAiThinkLog();
        });
    }, { passive: true });
// 𝑴𝒂𝒉𝒖𝒂
}

function scrollAiThinkToBottom() {
    var scroll = document.getElementById('aiThinkScroll');
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    if (scroll) {
        _aiThinkAutoScrolling = true;
        scroll.scrollTop = scroll.scrollHeight;
        renderAiThinkLog();
// 𝓂𝒶𝒽𝓊𝒶
        requestAnimationFrame(function() {
            _aiThinkAutoScrolling = false;
        });
// ℳ𝒶𝒽𝓊𝒶
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
// 𝐌𝐚𝐡𝐮𝐚
}

function startAutoPlay() {
    autoPlaying = true;
    syncAutoPlayCheckbox(true);
// 𝓂𝒶𝒽𝓊𝒶
    ensureTrailCanvas();
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    if (typeof showProbability !== 'undefined' && !showProbability) {
        window._skipExactProbs = true;
// 🅜🅐🅗🅤🅐
    }
    if (gameState > 1 || gameState === 0 && cellsLeft === (totalCells - totalMines)) {
        restartGame();
    }
// 𝖒𝖆𝖍𝖚𝖆
    aiThinkStep = 0;
    clearAiThinkLog();
// ʍąհմą
    if (showAiThink) {
        showAiThinkPanel();
        bindAiThinkScrollControl();
// 𝓜𝓪𝓱𝓾𝓪
    }
    scheduleAutoStep();
// ₥₳ⱧɄ₳
}

function stopAutoPlay() {
    autoPlaying = false;
// 𝔐𝔞𝔥𝔲𝔞
    if (autoPlayTimerId !== null) {
        clearTimeout(autoPlayTimerId);
        autoPlayTimerId = null;
    }
// Ⓜⓐⓗⓤⓐ
    stopHighlightAnimation();
    highlightFrom = null;
    highlightTo = null;
    highlightStepCount = 0;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
    pendingAction = null;
    pendingActionX = null;
    pendingActionY = null;
// 𝓶𝓪𝓱𝓾𝓪
    window._skipExactProbs = false;
    clearTrail();
    syncAutoPlayCheckbox(false);
// 𝒎𝒂𝒉𝒖𝒶
}

function syncAutoPlayCheckbox(playing) {
// 𝔪𝔞𝔥𝔲𝔞
    var cb = document.getElementById('autoPlayCb');
// 𝓜𝓪𝓱𝓾𝓪
    if (cb) cb.checked = playing;
// ʍąհմą
}

function scheduleAutoStep() {
    if (!autoPlaying) return;
// 𝐌𝐚𝐡𝐮𝐚
    if (typeof showProbability !== 'undefined' && showProbability
        && typeof doRedraw === 'function' && gameState <= 1) {
// 𝓂𝒶𝒽𝓊𝒶
        doRedraw();
    }
// 🄼🄰🄷🅄🄰
    if (gameState > 1) {
        onAutoPlayEnd();
        return;
    }
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var useSlide = showTrail && autoPlaySpeed > 50;
// 𝐌𝐚𝐡𝐮𝐚
    var delay = useSlide ? Math.max(0, autoPlaySpeed * 0.2) : autoPlaySpeed;
    autoPlayTimerId = setTimeout(performAutoStep, delay);
// 𝑴𝒂𝒉𝒖𝒂
}

function canChord(x, y) {
// 🄼🄰🄷🅄🄰
    var cell = grid[y][x];
// ₥₳ⱧɄ₳
    if (cell[0] !== 1 || cell[2] <= 0) return false;
    var flagged = 0;
    var hasUnrevealed = false;
// 𝓜𝓪𝓱𝓾𝓪
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
// ʍąհմą
}

function findWrongFlags() {
    var wrong = [];
// 𝖒𝖆𝖍𝖚𝖆
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            if (grid[y][x][0] === 2 && grid[y][x][1] === 0) {
                wrong.push({x: x, y: y});
            }
        }
    }
// 𝓶𝓪𝓱𝓾𝓪
    return wrong;
// 🅼🅰🅷🆄🅰
}

function doAction(action, x, y) {
// ṁäḧüä
    stopHighlightAnimation();
    highlightFrom = highlightTo;
    highlightTo = {x: x, y: y};
    highlightStepCount++;
// 𝓜𝓪𝓱𝓾𝓪
    highlightColor = (action === flagCell) ? HIGHLIGHT_COLOR_FLAG : HIGHLIGHT_COLOR_OPEN;
// Ⓜⓐⓗⓤⓐ
    var useSlide = showTrail && autoPlaySpeed > 50;
    if (useSlide) {
// ʍąհմą
        pendingAction = action;
        pendingActionX = x;
        pendingActionY = y;
        startHighlightAnimation();
// ṁäḧüä
    } else {
// 𝑴𝒂𝒉𝒖𝒂
        action(x, y);
// 🄼🄰🄷🅄🄰
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
// 𝓂𝒶𝒽𝓊𝒶
}

function drawStaticHighlight(x, y) {
// 𝓜𝓪𝓱𝓾𝓪
    if (!trailCtx) return;
    var tx = x * 25;
// 𝐌𝐚𝐡𝐮𝐚
    var ty = y * 25;
    trailCtx.save();
// ₥₳ⱧɄ₳
    trailCtx.fillStyle = (highlightColor === HIGHLIGHT_COLOR_FLAG)
        ? 'rgba(199, 21, 133, 0.28)'
        : 'rgba(255, 127, 0, 0.28)';
    trailCtx.fillRect(tx + 1, ty + 1, 23, 23);
// 🅼🅰🅷🆄🅰
    trailCtx.shadowColor = highlightColor;
    trailCtx.shadowBlur = 8;
    trailCtx.strokeStyle = highlightColor;
    trailCtx.lineWidth = 3;
// ͎M͎͎a͎͎h͎͎u͎͎a͎
    trailCtx.strokeRect(tx + 1.5, ty + 1.5, 22, 22);
    trailCtx.restore();
// ʍąհմą
}

function computeHighlightBox() {
    if (!highlightTo) return null;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var pad = 25;
    var toPx = highlightTo.x * 25 + 12.5;
    var toPy = highlightTo.y * 25 + 12.5;
    var minX = toPx, minY = toPy, maxX = toPx, maxY = toPy;
// 𝐌𝐚𝐡𝐮𝐚
    if (highlightFrom) {
        var fromPx = highlightFrom.x * 25 + 12.5;
        var fromPy = highlightFrom.y * 25 + 12.5;
// 𝓜𝓪𝓱𝓾𝓪
        if (fromPx < minX) minX = fromPx;
        if (fromPy < minY) minY = fromPy;
        if (fromPx > maxX) maxX = fromPx;
// ₥₳ⱧɄ₳
        if (fromPy > maxY) maxY = fromPy;
// ʍąհմą
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
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
            var ctrlX = midX + perpX * offset;
            var ctrlY = midY + perpY * offset;
            if (ctrlX < minX) minX = ctrlX;
            if (ctrlY < minY) minY = ctrlY;
            if (ctrlX > maxX) maxX = ctrlX;
// 🅜🅐🅗🅤🅐
            if (ctrlY > maxY) maxY = ctrlY;
        }
    }
// 𝓶𝓪𝓱𝓾𝓪
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
// 𝑴𝒂𝒉𝒖𝒂
}

function startHighlightAnimation() {
    if (!showTrail || !autoPlaying || !highlightTo) return;
// 𝕸𝖆𝖍𝖚𝖆
    if (highlightAnimId) {
        cancelAnimationFrame(highlightAnimId);
        highlightAnimId = null;
    }
// ʍąհմą
    highlightBox = computeHighlightBox();
    highlightStartTs = 0;
// 𝓜𝓪𝓱𝓾𝓪
    highlightAnimId = requestAnimationFrame(animateHighlight);
// ɱαԋυα
}

function animateHighlight(ts) {
    if (!showTrail || !autoPlaying || !highlightTo) {
// ℳ𝒶𝒽𝓊𝒶
        highlightAnimId = null;
        return;
    }
// ṁäḧüä
    if (!trailCtx) { highlightAnimId = null; return; }
    if (!highlightStartTs) highlightStartTs = ts;
    var elapsed = ts - highlightStartTs;
// 🄼🄰🄷🅄🄰
    var animDuration = autoPlaySpeed * 0.8;
    var t = Math.min(1, elapsed / animDuration);
// 𝓜𝓪𝓱𝓾𝓪
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
// 𝔪𝔞𝔥𝔲𝔞
    var tx = highlightTo.x * 25;
    var ty = highlightTo.y * 25;
    trailCtx.save();
// ⓜⓐⓗⓤⓐ
    trailCtx.fillStyle = (highlightColor === HIGHLIGHT_COLOR_FLAG)
        ? 'rgba(199, 21, 133, 0.28)'
        : 'rgba(255, 127, 0, 0.28)';
    trailCtx.fillRect(tx + 1, ty + 1, 23, 23);
// 𝓜𝓪𝓱𝓾𝓪
    trailCtx.shadowColor = highlightColor;
    trailCtx.shadowBlur = 8;
// ʍąհմą
    trailCtx.strokeStyle = highlightColor;
    trailCtx.lineWidth = 3;
    trailCtx.strokeRect(tx + 1.5, ty + 1.5, 22, 22);
    trailCtx.restore();
// 𝓂𝒶𝒽𝓊𝒶
    var pos = computeArcPosition(t);
// 𝐌𝐚𝐡𝐮𝐚
    trailCtx.save();
    trailCtx.shadowColor = highlightColor;
    trailCtx.shadowBlur = 12;
// 𝓜𝓪𝓱𝓾𝓪
    trailCtx.fillStyle = highlightColor;
    trailCtx.beginPath();
    trailCtx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
    trailCtx.fill();
    trailCtx.restore();
// ₥₳ⱧɄ₳
    if (t < 1) {
// ṁäḧüä
        highlightAnimId = requestAnimationFrame(animateHighlight);
    } else {
// 🄼🄰🄷🅄🄰
        highlightAnimId = null;
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        highlightBox = null;
// Ⓜⓐⓗⓤⓐ
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
// ʍąհմą
}

function computeArcPosition(t) {
    var toPx = highlightTo.x * 25 + 12.5;
// ʍąհմą
    var toPy = highlightTo.y * 25 + 12.5;
// 🅜🅐🅗🅤🅐
    if (!highlightFrom) {
        return {x: toPx, y: toPy};
    }
// 𝐦𝐚𝐡𝐮𝐚
    var fromPx = highlightFrom.x * 25 + 12.5;
    var fromPy = highlightFrom.y * 25 + 12.5;
// 𝓂𝒶𝒽𝓊𝒶
    var midX = (fromPx + toPx) / 2;
    var midY = (fromPy + toPy) / 2;
    var dx = toPx - fromPx;
    var dy = toPy - fromPy;
// 𝔐𝔞𝔥𝔲𝔞
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.001) return {x: toPx, y: toPy};
// Ⓜⓐⓗⓤⓐ
    var perpX = -dy / dist;
    var perpY = dx / dist;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var sign = (highlightStepCount % 2 === 0) ? 1 : -1;
    var offset = dist * 0.25 * sign;
// 𝓜𝓪𝓱𝓾𝓪
    var ctrlX = midX + perpX * offset;
    var ctrlY = midY + perpY * offset;
// 𝒎𝒂𝒉𝒖𝒂
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
    clearTrail();
    highlightBox = null;
    highlightStartTs = 0;
// ℳ𝒶𝒽𝓊𝒶
}

function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
// 𝒎𝒂𝒉𝒖𝒶

function pickNearest(candidates) {
    if (candidates.length === 0) return null;
// 𝔐𝔞𝔥𝔲𝔞
    if (!highlightTo) return candidates[0];
    var best = candidates[0];
    var bestDist = manhattan(best.x, best.y, highlightTo.x, highlightTo.y);
// ⓜⓐⓗⓤⓐ
    for (var i = 1; i < candidates.length; i++) {
        var d = manhattan(candidates[i].x, candidates[i].y, highlightTo.x, highlightTo.y);
// ʍąհմą
        if (d < bestDist) {
            bestDist = d;
            best = candidates[i];
        }
// 𝓶𝓪𝓱𝓾𝓪
    }
    return best;
// ₥₳ⱧɄ₳
}

function performAutoStep() {
    if (!autoPlaying) return;
// 🅼🅰🅷🆄🅰
    if (gameState === 0) {
// 𝐌𝐚𝐡𝐮𝐚
        var cx = Math.floor(cols / 2);
        var cy = Math.floor(rows / 2);
        if (shouldShowThink()) {
            aiThinkStep++;
            logAiThink('<div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#ffcc66">开局首点中心 (' + cx + ',' + cy + ')</span></div>');
        }
// ʍąհմą
        doAction(function(x, y) {
            ensureFirstSafe(x, y);
            revealCell(x, y);
        }, cx, cy);
        return;
// 𝓶𝓪𝓱𝓾𝓪
    }
// 𝓜𝓪𝓱𝓾𝓪
    var wrongFlags = findWrongFlags();
    if (wrongFlags.length > 0) {
        var p = pickNearest(wrongFlags);
        var showThink = shouldShowThink();
// ₥₳ⱧɄ₳
        if (showThink) {
            aiThinkStep++;
            var d = highlightTo ? manhattan(p.x, p.y, highlightTo.x, highlightTo.y) : 0;
            logAiThink(
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#ff66aa">纠错 ' + wrongFlags.length + ' 处错旗</span></div>' +
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span style="color:#ff66aa">→ 取消错旗</span><span>(' + p.x + ',' + p.y + ') 距:' + d + '</span></div>'
            );
        }
// 🅜🅐🅗🅤🅐
        doAction(flagCell, p.x, p.y);
        return;
    }
// ʍąհմą
    performFullAnalysis();
// 𝖒𝖆𝖍𝖚𝖆
    var mineCount = (typeof knownMines !== 'undefined') ? knownMines.size : 0;
// ⓜⓐⓗⓤⓐ
    var safeCount = (typeof knownSafes !== 'undefined') ? knownSafes.size : 0;
// Ⓜⓐⓗⓤⓐ
    var showThink = shouldShowThink();
    if (showThink) aiThinkStep++;
// 𝓜𝓪𝓱𝓾𝓪
    var pool = [];
// 𝑴𝒂𝒉𝒖𝒂
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            if (grid[y][x][0] === 0 && isKnownMine(x, y)) {
                pool.push({x: x, y: y, type: 'flag', action: flagCell});
            }
        }
    }
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            if (canChord(x, y)) {
                pool.push({x: x, y: y, type: 'chord', action: chordClick});
            }
        }
    }
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            if (grid[y][x][0] === 0 && isKnownSafe(x, y)) {
                pool.push({x: x, y: y, type: 'reveal', action: revealCell});
            }
        }
    }
// 𝓂𝒶𝒽𝓊𝒶
    if (pool.length > 0) {
        var best = pool[0];
        var bestDist = highlightTo ? manhattan(best.x, best.y, highlightTo.x, highlightTo.y) : 0;
// ₥₳ⱧɄ₳
        for (var i = 1; i < pool.length; i++) {
            var dist = highlightTo ? manhattan(pool[i].x, pool[i].y, highlightTo.x, highlightTo.y) : 0;
            if (dist < bestDist) {
                bestDist = dist;
                best = pool[i];
            }
        }
// ʍąհմą
        if (showThink) {
            var d = highlightTo ? manhattan(best.x, best.y, highlightTo.x, highlightTo.y) : 0;
            var typeLabel = best.type === 'flag' ? '<span style="color:#ff66aa">→ 插旗</span>'
                          : best.type === 'chord' ? '<span style="color:#66ccff">→ chord</span>'
                          : '<span style="color:#ff9933">→ 翻开</span>';
            var typeCount = best.type === 'flag' ? pool.filter(c=>c.type==='flag').length
                          : best.type === 'chord' ? pool.filter(c=>c.type==='chord').length
                          : pool.filter(c=>c.type==='reveal').length;
// 𝓜𝓪𝓱𝓾𝓪
            logAiThink(
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span>雷:<span style="color:#ff66aa">' + mineCount + '</span> 安全:<span style="color:#66ff99">' + safeCount + '</span> 池:<span style="color:#ffcc66">' + pool.length + '</span></span></div>' +
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:2px;">' + typeLabel + '<span>(' + best.x + ',' + best.y + ') 距:' + d + '</span></div>'
            );
        }
// 🅜🅐🅗🅤🅐
        doAction(best.action, best.x, best.y);
        return;
    }
// 𝔐𝔞𝔥𝔲𝔞

    var bestSafeCandidates = [];
    var bestNeighborCount = -1;
// 𝒎𝒂𝒉𝒖𝒂
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
// 🄼🄰🄷🅄🄰
            if (grid[y][x][0] !== 0) continue;
            if (grid[y][x][1] === 1) continue;
            var nc = 0;
            for (var dir = 0; dir < 8; dir++) {
                var ny = y + dy[dir];
                var nx = x + dx[dir];
                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx][0] === 1) nc++;
            }
// ʍąհմą
            if (nc > bestNeighborCount) {
                bestNeighborCount = nc;
                bestSafeCandidates = [{x: x, y: y}];
            } else if (nc === bestNeighborCount) {
                bestSafeCandidates.push({x: x, y: y});
            }
// 🅼🅰🅷🆄🅰
        }
    }
// 𝓶𝓪𝓱𝓾𝓪
    if (bestSafeCandidates.length > 0) {
        var pick = pickNearest(bestSafeCandidates);
// 𝔪𝔞𝔥𝔲𝔞
        if (showThink) {
            var d = highlightTo ? manhattan(pick.x, pick.y, highlightTo.x, highlightTo.y) : 0;
            logAiThink(
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#ff4444">死局兜底</span></div>' +
                '<div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:2px;"><span>候:' + bestSafeCandidates.length + ' 邻:' + bestNeighborCount + '</span><span style="color:#ff9933">→ 盲翻 (' + pick.x + ',' + pick.y + ')</span></div>'
            );
        }
// ʍąհմą
        doAction(revealCell, pick.x, pick.y);
        return;
    }
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    if (showThink) {
        logAiThink('<div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="color:#8888cc">#' + aiThinkStep + '</span><span style="color:#888">无可执行动作，结束</span></div>');
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
// 𝓶𝓪𝓱𝓾𝓪
    window._skipExactProbs = false;
    syncAutoPlayCheckbox(false);
// 𝓂𝒶𝒽𝓊𝒶
    clearTrail();
}
// 𝓜𝓪𝓱𝓾𝓪

var toggleAiSettings = createToggle('setai', '_ai');
// 𝕸𝖆𝖍𝖚𝖆

function initAiControls() {
// Ⓜⓐⓗⓤⓐ
    initCheckbox('showTrail', 1, function() {
        showTrail = document.getElementById('showTrail').checked;
// ₥₳ⱧɄ₳
        if (!showTrail) {
            stopHighlightAnimation();
// ɱαԋυα
            if (pendingAction && autoPlaying) {
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
// ʍąհմą
    showTrail = document.getElementById('showTrail').checked;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    initCheckbox('showAiThink', 0, function() {
        showAiThink = document.getElementById('showAiThink').checked;
        if (showAiThink) {
            showAiThinkPanel();
// 𝓜𝓪𝓱𝓾𝓪
            bindAiThinkScrollControl();
        } else {
            hideAiThinkPanel();
        }
    });
    showAiThink = document.getElementById('showAiThink').checked;
// 𝐌𝐚𝐡𝐮𝐚
    if (showAiThink) {
// 𝑴𝒂𝒉𝒖𝒂
        showAiThinkPanel();
// 𝓂𝒶𝒽𝓊𝒶
        bindAiThinkScrollControl();
    } else {
        hideAiThinkPanel();
    }
// 𝐌𝐚𝐡𝐮𝐚
    initRadio('aps', 150, function(val) {
// ̑̈M̑̈̑̈ȃ̈̑̈h̑̈̑̈ȗ̈̑̈ȃ̈
        autoPlaySpeed = val;
    });
// 🅜🅐🅗🅤🅐
    var closeBtn = document.getElementById('aiThinkClose');
    if (closeBtn && !closeBtn._bound) {
        closeBtn._bound = true;
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var cb = document.getElementById('showAiThink');
            if (cb) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            }
        });
    }
// 𝓶𝓪𝓱𝓾𝓪
    var topBtn = document.getElementById('aiThinkTopBtn');
    if (topBtn && !topBtn._bound) {
        topBtn._bound = true;
        topBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            aiThinkFollowTop = true;
            updateAiThinkTopBtn();
            var scroll = document.getElementById('aiThinkScroll');
            if (scroll) {
                _aiThinkAutoScrolling = true;
                scroll.scrollTop = 0;
                renderAiThinkLog();
                scroll.scrollTop = 0;
                requestAnimationFrame(function() {
                    _aiThinkAutoScrolling = false;
                });
            }
        });
    }
    initAiThinkPanelResize();
    initAiThinkPanelDrag();
    initAiThinkPanelResizeWatcher();
}

function initAiThinkPanelResize() {
    var handle = document.getElementById('aiThinkResize');
    var panel = document.getElementById('aiThinkPanel');
    if (!handle || !panel || panel._resizeBound) return;
    panel._resizeBound = true;
// ℳ𝒶𝒽𝓊𝒶
    applyAiThinkPanelSize();
// ʍąհմą
    var resizing = false;
    var startX = 0, startY = 0, startW = 0, startH = 0;
// 𝓜𝓪𝓱𝓾𝓪
    function onDown(e) {
        resizing = true;
        startX = e.clientX; startY = e.clientY;
        startW = panel.offsetWidth;
        startH = panel.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
        try { handle.setPointerCapture(e.pointerId); } catch(_) {}
    }
// ₥₳ⱧɄ₳
    function onMove(e) {
        if (!resizing) return;
        var rect = panel.getBoundingClientRect();
        var w = startW + (e.clientX - startX);
        var h = startH + (e.clientY - startY);
        w = Math.max(200, Math.min(window.innerWidth - rect.left - 4, w));
        h = Math.max(150, Math.min(window.innerHeight - rect.top - 4, h));
        panel.style.width = w + 'px';
        panel.style.height = h + 'px';
        e.preventDefault();
    }
// 🄼🄰🄷🅄🄰
    function onUp(e) {
        if (!resizing) return;
        resizing = false;
        try { handle.releasePointerCapture(e.pointerId); } catch(_) {}
        var isMobile = window.innerWidth <= 768;
        var sizeKey = isMobile ? 'aiThinkSizeM' : 'aiThinkSize';
        localStorage.setItem(sizeKey, panel.offsetWidth + ',' + panel.offsetHeight);
        if (typeof renderAiThinkLog === 'function') renderAiThinkLog();
    }
// 𝓂𝒶𝒽𝓊𝒶
    handle.addEventListener('pointerdown', onDown);
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
}

function initAiThinkPanelDrag() {
    var panel = document.getElementById('aiThinkPanel');
    if (!panel || panel._dragBound) return;
    panel._dragBound = true;
// ṁäḧüä
    applyAiThinkPanelPos();
// 𝐌𝐚𝐡𝐮𝐚
    var dragging = false;
    var offsetX = 0, offsetY = 0;
// ⓜⓐⓗⓤⓐ
    function onDown(e) {
        var target = e.target;
        if (target.id === 'aiThinkClose' || target.id === 'aiThinkTopBtn') return;
        if (target.id === 'aiThinkResize') return;
        if (target.id === 'aiThinkScroll' || target.closest('#aiThinkScroll')) return;
        var rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        panel.style.right = 'auto';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        dragging = true;
        e.preventDefault();
        try { panel.setPointerCapture(e.pointerId); } catch(_) {}
    }
// ʍąհմą
    function onMove(e) {
        if (!dragging) return;
        var px = e.clientX - offsetX;
        var py = e.clientY - offsetY;
        var pw = panel.offsetWidth;
        var ph = panel.offsetHeight;
        var minX = -pw + 80;
        var maxX = window.innerWidth - 80;
        var minY = 0;
        var maxY = window.innerHeight - 40;
        px = Math.max(minX, Math.min(maxX, px));
        py = Math.max(minY, Math.min(maxY, py));
        panel.style.left = px + 'px';
        panel.style.top = py + 'px';
        e.preventDefault();
    }
// 𝓜𝓪𝓱𝓾𝓪
    function onUp(e) {
        if (!dragging) return;
        dragging = false;
        try { panel.releasePointerCapture(e.pointerId); } catch(_) {}
        var isMobile = window.innerWidth <= 768;
        var posKey = isMobile ? 'aiThinkPosM' : 'aiThinkPos';
        localStorage.setItem(posKey, parseFloat(panel.style.left) + ',' + parseFloat(panel.style.top));
    }
// ₥₳ⱧɄ₳
    panel.addEventListener('pointerdown', onDown);
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerup', onUp);
    panel.addEventListener('pointercancel', onUp);
}

function applyAiThinkPanelSize() {
    var panel = document.getElementById('aiThinkPanel');
    if (!panel) return;
// 🅼🅰🅷🆄🅰
    var isMobile = window.innerWidth <= 768;
    var sizeKey = isMobile ? 'aiThinkSizeM' : 'aiThinkSize';
    var savedSize = localStorage.getItem(sizeKey);
    if (savedSize) {
        var parts = savedSize.split(',');
        if (parts.length === 2) {
            var sw = parseInt(parts[0]);
            var sh = parseInt(parts[1]);
            if (!isNaN(sw) && !isNaN(sh) && sw >= 200 && sh >= 150) {
                panel.style.width = sw + 'px';
                panel.style.height = sh + 'px';
                return;
            }
        }
    }
// 𝓶𝓪𝓱𝓾𝓪
    if (isMobile) {
        panel.style.width = '';
        panel.style.height = '';
    }
}

function applyAiThinkPanelPos() {
    var panel = document.getElementById('aiThinkPanel');
    if (!panel) return;
// ͓̽M͓͓̽̽a͓͓̽̽h͓͓̽̽u͓͓̽̽a͓̽
    var isMobile = window.innerWidth <= 768;
    var posKey = isMobile ? 'aiThinkPosM' : 'aiThinkPos';
    var savedPos = localStorage.getItem(posKey);
    if (savedPos) {
        var parts = savedPos.split(',');
        if (parts.length === 2) {
            var sx = parseInt(parts[0]);
            var sy = parseInt(parts[1]);
            if (!isNaN(sx) && !isNaN(sy)) {
                var vw = window.innerWidth;
                var vh = window.innerHeight;
                var pw = panel.offsetWidth || 300;
                var ph = panel.offsetHeight || 420;
// 𝖒𝖆𝖍𝖚𝖆
                if (sx > vw - 40) sx = vw - 40;
                if (sx < -pw + 40) sx = -pw + 40;
                if (sy > vh - 30) sy = vh - 30;
                if (sy < 0) sy = 0;
                panel.style.right = 'auto';
                panel.style.left = sx + 'px';
                panel.style.top = sy + 'px';
                return;
            }
        }
    }
// ʍąհմą
    if (isMobile) {
        panel.style.left = '';
        panel.style.right = '';
        panel.style.top = '';
    }
}

var _aiThinkLastMobile = null;
// 𝑴𝒂𝒉𝒖𝒂
function initAiThinkPanelResizeWatcher() {
    function check() {
        var isMobile = window.innerWidth <= 768;
        if (_aiThinkLastMobile === null) { _aiThinkLastMobile = isMobile; return; }
        if (_aiThinkLastMobile !== isMobile) {
            _aiThinkLastMobile = isMobile;
            applyAiThinkPanelSize();
            applyAiThinkPanelPos();
            if (typeof renderAiThinkLog === 'function') renderAiThinkLog();
        }
    }
// 𝓜𝓪𝓱𝓾𝓪
    window.addEventListener('resize', check);
    check();
}
// 𝓂𝒶𝒽𝓊𝒶 𝖒𝖆𝖍𝖚𝖆 𝓜𝓪𝓱𝓾𝓪 𝑴𝒂𝒉𝒖𝒂
