// node tests/solver.test.js
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');

function makeCtx() {
    const noop = function () {};
    const ctx2d = {
        drawImage: noop, save: noop, restore: noop, fillText: noop,
        strokeRect: noop, fillRect: noop, beginPath: noop, arc: noop,
        fill: noop, setLineDash: noop, clearRect: noop
    };
    const sandbox = {
        console: console,
        setTimeout: setTimeout, clearTimeout: clearTimeout,
        setInterval: setInterval, clearInterval: clearInterval,
        requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
        cancelAnimationFrame: clearTimeout,
        document: {
            getElementById: function () { return null; },
            getElementsByName: function () { return []; },
            getElementsByTagName: function () { return []; },
            addEventListener: noop,
            body: { clientWidth: 800, clientHeight: 600, style: {} }
        },
        localStorage: {
            _s: {},
            getItem: function (k) { return this._s[k] == null ? null : this._s[k]; },
            setItem: function (k, v) { this._s[k] = String(v); }
        },
        XMLHttpRequest: function () { return { open: noop, send: noop }; },
        location: { hostname: 'localhost', search: '' },
        ctx: ctx2d,
        cellImgs: [0, 1, 2, 3],
        numBgImgs: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'static/mahua/new.6.27.js'), 'utf8'), sandbox, { filename: 'new.6.27.js' });
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'static/mahua/probability.js'), 'utf8'), sandbox, { filename: 'probability.js' });
    return sandbox;
}

// 5x5，单雷 (0,0)，只翻开 (2,2)（数字 0）→ 八邻 knownSafe，其余 16 格无约束
function setupBoard(S) {
    vm.runInContext(`
        cols = 5; rows = 5; totalCells = 25;
        grid = [];
        for (var y = 0; y < rows; y++) {
            grid[y] = [];
            for (var x = 0; x < cols; x++) grid[y][x] = [0, 0, 0, 0];
        }
        // 雷 (0,0)
        grid[0][0][1] = 1;
        for (var d = 0; d < 8; d++) {
            var ny = 0 + dy[d], nx = 0 + dx[d];
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) grid[ny][nx][2]++;
        }
        grid[2][2][0] = 1; // 翻开 (2,2)，数字 0
        totalMines = 1; minesLeft = 1;
        cellsLeft = 10; gameState = 1;
        autoFlagEnabled = 0;
        drawMineCounter = function () {};
        drawTimerCounter = function () {};
    `, S);
}

let failures = 0;
function check(name, fn) {
    try {
        fn();
        console.log('PASS ' + name);
    } catch (e) {
        failures++;
        console.log('FAIL ' + name + ' — ' + e.message);
    }
}

// ── #3 孤立格概率应回退到全局密度，而不是 0.5 ──
check('isolated cell gets density prob, not 0.5', function () {
    const S = makeCtx();
    setupBoard(S);
    const p = vm.runInContext('performFullAnalysis(); getMineProbability(0, 4);', S);
    // 隐藏未知格 = 25 - 1 已翻 - 8 knownSafe = 16，密度 = 1/16
    assert.ok(Math.abs(p - 1 / 16) < 1e-9, 'expected 1/16=0.0625, got ' + p);
});

// ── #4 同一棋盘版本内 doRedraw + performFullAnalysis 只做一次全量分析 ──
check('analysis cached within one board version, invalidated on change', function () {
    const S = makeCtx();
    setupBoard(S);
    vm.runInContext(`
        var __cepCount = 0;
        var __origCEP = computeExactProbabilities;
        computeExactProbabilities = function () { __cepCount++; return __origCEP(); };
        showProbability = true;
        doRedraw();            // 自动游玩每步：先重绘（内部 findBestClick→performFullAnalysis）
        performFullAnalysis(); // 再 performAutoStep 里的显式分析
    `, S);
    const afterStep = vm.runInContext('__cepCount', S);
    assert.strictEqual(afterStep, 1, 'expected 1 analysis per step, got ' + afterStep);

    // 棋盘变化后缓存必须失效
    vm.runInContext(`
        hookGameFunctions();     // 安装 wrapper（含失效逻辑）
        revealCell(1, 1);        // 翻开数字 1，cellsLeft 变化
        performFullAnalysis();
    `, S);
    const afterReveal = vm.runInContext('__cepCount', S);
    assert.strictEqual(afterReveal, 2, 'expected re-analysis after reveal, got ' + afterReveal);
});

// ── #2 自定义难度输入清洗 ──
check('custom difficulty inputs sanitized', function () {
    const S = makeCtx();
    assert.strictEqual(vm.runInContext('typeof sanitizeCustom', S), 'function', 'sanitizeCustom missing');
    const r1 = vm.runInContext('sanitizeCustom(NaN, -3, NaN)', S);
    assert.ok(r1.cols >= 1 && r1.rows >= 1 && r1.mines >= 0, 'NaN/negative not clamped: ' + JSON.stringify(r1));
    const r2 = vm.runInContext('sanitizeCustom(1000, 1000, 999999999)', S);
    assert.ok(r2.cols <= 100 && r2.rows <= 100, 'oversize board not clamped: ' + JSON.stringify(r2));
    assert.ok(r2.mines < r2.cols * r2.rows, 'mines not < cells: ' + JSON.stringify(r2));
    const r3 = vm.runInContext('sanitizeCustom(40, 24, 199)', S);
    assert.deepStrictEqual({ cols: r3.cols, rows: r3.rows, mines: r3.mines }, { cols: 40, rows: 24, mines: 199 }, 'valid input mangled');
});

process.exit(failures ? 1 : 0);
