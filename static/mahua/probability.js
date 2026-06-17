(function(){
    var _dom = [
        String.fromCharCode(0x6d,0x69,0x6e,0x65,0x73,0x77,0x65,0x65,0x70,0x65,0x72,0x2e,0x64,0x6d,0x68,0x70,0x72,0x6f,0x2e,0x74,0x6f,0x70),
        String.fromCharCode(0x6d,0x69,0x6e,0x65,0x73,0x77,0x65,0x65,0x70,0x65,0x72,0x2e,0x6d,0x61,0x68,0x75,0x61,0x2e,0x75,0x6b),
        String.fromCharCode(0x31,0x32,0x37,0x2e,0x30,0x2e,0x30,0x2e,0x31),
        String.fromCharCode(0x6c,0x6f,0x63,0x61,0x6c,0x68,0x6f,0x73,0x74)
    ];
    var host = window.location.hostname;
    var ok = false;
    for (var i = 0; i < _dom.length; i++) {
        if (host === _dom[i]) { ok = true; break; }
    }
    if (!ok) {
        window._PROB_DISABLED = true;
    }
})();

let showProbability = false;
let _probInitialized = false;

let knownMines = new Set();
let knownSafes = new Set();
let patternResults = {};
let exactProbs = new Map();

let clearTimers = [];
let redrawVersion = 0;
let deadlockPick = null;
let redrawTimer = null;

function posKey(x, y) {
    return x + ',' + y;
}

function isValid(x, y) {
    return x >= 0 && x < h && y >= 0 && y < m;
}

function addKnownMine(x, y) {
    if (isValid(x, y)) knownMines.add(posKey(x, y));
}

function addKnownSafe(x, y) {
    if (isValid(x, y)) knownSafes.add(posKey(x, y));
}

function isKnownMine(x, y) {
    return knownMines.has(posKey(x, y));
}

function isKnownSafe(x, y) {
    return knownSafes.has(posKey(x, y));
}

function setPatternMine(x, y) {
    if (isValid(x, y)) patternResults[posKey(x, y)] = 1;
}

function setPatternSafe(x, y) {
    if (isValid(x, y)) patternResults[posKey(x, y)] = 0;
}

function getPatternResult(x, y) {
    return patternResults[posKey(x, y)];
}

function getEffectiveNumber(x, y) {
    if (g[y][x][0] != 1) return -1;
    let total = g[y][x][2];
    for (let t = 0; t < 8; t++) {
        let nx = x + p[t];
        let ny = y + d[t];
        if (isValid(nx, ny) && (g[ny][nx][0] == 2 || isKnownMine(nx, ny))) total--;
    }
    return total;
}

function getUnknowns(x, y) {
    let list = [];
    for (let t = 0; t < 8; t++) {
        let nx = x + p[t];
        let ny = y + d[t];
        if (isValid(nx, ny) && g[ny][nx][0] == 0 && !isKnownMine(nx, ny) && !isKnownSafe(nx, ny)) {
            list.push({x: nx, y: ny});
        }
    }
    return list;
}

function allHiddenOnlyDir(x, y, check) {
    for (let t = 0; t < 8; t++) {
        let nx = x + p[t];
        let ny = y + d[t];
        if (isValid(nx, ny) && g[ny][nx][0] == 0 && !isKnownSafe(nx, ny) && !isKnownMine(nx, ny)) {
            if (!check(nx, ny, x, y)) return false;
        }
    }
    return true;
}

function above(nx, ny, cx, cy) {
    return ny < cy;
}

function below(nx, ny, cx, cy) {
    return ny > cy;
}

function left(nx, ny, cx, cy) {
    return nx < cx;
}

function right(nx, ny, cx, cy) {
    return nx > cx;
}

function seedPatterns() {
    patternResults = {};

    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h - 2; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);

            if (n1 === 1 && n2 === 2 && n3 === 1) {
                let up = allHiddenOnlyDir(x, y, above)
                      && allHiddenOnlyDir(x+1, y, above)
                      && allHiddenOnlyDir(x+2, y, above);
                let down = allHiddenOnlyDir(x, y, below)
                        && allHiddenOnlyDir(x+1, y, below)
                        && allHiddenOnlyDir(x+2, y, below);

                if (up) {
                    setPatternMine(x, y-1);
                    setPatternSafe(x+1, y-1);
                    setPatternMine(x+2, y-1);
                }
                if (down) {
                    setPatternMine(x, y+1);
                    setPatternSafe(x+1, y+1);
                    setPatternMine(x+2, y+1);
                }
            }
        }
    }

    for (let x = 0; x < h; x++) {
        for (let y = 0; y < m - 2; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);

            if (n1 === 1 && n2 === 2 && n3 === 1) {
                let lf = allHiddenOnlyDir(x, y, left)
                      && allHiddenOnlyDir(x, y+1, left)
                      && allHiddenOnlyDir(x, y+2, left);
                let rg = allHiddenOnlyDir(x, y, right)
                      && allHiddenOnlyDir(x, y+1, right)
                      && allHiddenOnlyDir(x, y+2, right);

                if (lf) {
                    setPatternMine(x-1, y);
                    setPatternSafe(x-1, y+1);
                    setPatternMine(x-1, y+2);
                }
                if (rg) {
                    setPatternMine(x+1, y);
                    setPatternSafe(x+1, y+1);
                    setPatternMine(x+1, y+2);
                }
            }
        }
    }

    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h - 3; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);
            let n4 = getEffectiveNumber(x+3, y);

            if (n1 === 1 && n2 === 2 && n3 === 2 && n4 === 1) {
                let up = allHiddenOnlyDir(x, y, above)
                      && allHiddenOnlyDir(x+1, y, above)
                      && allHiddenOnlyDir(x+2, y, above)
                      && allHiddenOnlyDir(x+3, y, above);
                let down = allHiddenOnlyDir(x, y, below)
                        && allHiddenOnlyDir(x+1, y, below)
                        && allHiddenOnlyDir(x+2, y, below)
                        && allHiddenOnlyDir(x+3, y, below);

                if (up) {
                    setPatternMine(x+1, y-1);
                    setPatternMine(x+2, y-1);
                }
                if (down) {
                    setPatternMine(x+1, y+1);
                    setPatternMine(x+2, y+1);
                }
            }
        }
    }

    for (let x = 0; x < h; x++) {
        for (let y = 0; y < m - 3; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);
            let n4 = getEffectiveNumber(x, y+3);

            if (n1 === 1 && n2 === 2 && n3 === 2 && n4 === 1) {
                let lf = allHiddenOnlyDir(x, y, left)
                      && allHiddenOnlyDir(x, y+1, left)
                      && allHiddenOnlyDir(x, y+2, left)
                      && allHiddenOnlyDir(x, y+3, left);
                let rg = allHiddenOnlyDir(x, y, right)
                      && allHiddenOnlyDir(x, y+1, right)
                      && allHiddenOnlyDir(x, y+2, right)
                      && allHiddenOnlyDir(x, y+3, right);

                if (lf) {
                    setPatternMine(x-1, y+1);
                    setPatternMine(x-1, y+2);
                }
                if (rg) {
                    setPatternMine(x+1, y+1);
                    setPatternMine(x+1, y+2);
                }
            }
        }
    }
}

function runInference() {
    let changed = true;
    while (changed) {
        changed = false;
        for (let y = 0; y < m; y++) {
            for (let x = 0; x < h; x++) {
                if (g[y][x][0] !== 1) continue;

                let rem = getEffectiveNumber(x, y);
                let unk = getUnknowns(x, y);

                if (unk.length === 0) continue;

                if (rem === 0) {
                    for (let u of unk) {
                        if (!isKnownSafe(u.x, u.y)) {
                            addKnownSafe(u.x, u.y);
                            changed = true;
                        }
                    }
                } else if (rem === unk.length) {
                    for (let u of unk) {
                        if (!isKnownMine(u.x, u.y)) {
                            addKnownMine(u.x, u.y);
                            changed = true;
                        }
                    }
                }
            }
        }
    }
}

const MAX_COMPONENT_CELLS = 18;

function buildFrontier() {
    const numbers = [];
    const cellSet = new Set();
    const numMap = new Map();

    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 1) {
                let rem = getEffectiveNumber(x, y);
                let unk = getUnknowns(x, y);
                if (unk.length > 0 && rem >= 0) {
                    let numObj = {x: x, y: y, rem: rem, unknowns: unk};
                    numbers.push(numObj);
                    numMap.set(posKey(x, y), numbers.length - 1);
                    for (let c of unk) {
                        cellSet.add(posKey(c.x, c.y));
                    }
                }
            }
        }
    }

    const allCells = [];
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 0 && !isKnownMine(x, y) && !isKnownSafe(x, y)) {
                allCells.push({x: x, y: y});
                cellSet.add(posKey(x, y));
            }
        }
    }

    const cellIndexMap = new Map();
    allCells.forEach((c, idx) => cellIndexMap.set(posKey(c.x, c.y), idx));

    const numCellIndices = numbers.map(num => {
        return num.unknowns.map(u => cellIndexMap.get(posKey(u.x, u.y))).filter(idx => idx !== undefined);
    });

    return { numbers, allCells, cellIndexMap, numCellIndices };
}

function buildComponents(numbers, allCells, numCellIndices) {
    const n = allCells.length;
    const adj = Array.from({ length: n }, () => []);

    for (let indices of numCellIndices) {
        for (let i = 0; i < indices.length; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                let a = indices[i];
                let b = indices[j];
                adj[a].push(b);
                adj[b].push(a);
            }
        }
    }

    const visited = new Array(n).fill(false);
    const components = [];

    for (let i = 0; i < n; i++) {
        if (visited[i]) continue;

        let comp = [];
        let queue = [i];
        visited[i] = true;

        while (queue.length) {
            let cur = queue.shift();
            comp.push(cur);
            for (let nb of adj[cur]) {
                if (!visited[nb]) {
                    visited[nb] = true;
                    queue.push(nb);
                }
            }
        }
        components.push(comp);
    }

    return components.map(compIndices => {
        const cellIdxSet = new Set(compIndices);
        const nums = [];
        for (let ni = 0; ni < numbers.length; ni++) {
            if (numCellIndices[ni].some(idx => cellIdxSet.has(idx))) {
                nums.push(ni);
            }
        }
        return { cells: compIndices, numIndices: nums };
    });
}

function solveComponentExact(compCells, compNums, numbers, allCells, numCellIndices) {
    const cellCount = compCells.length;
    if (cellCount === 0) return {};

    const globalToLocal = new Map();
    compCells.forEach((globalIdx, localIdx) => globalToLocal.set(globalIdx, localIdx));

    const constraints = compNums.map(ni => {
        let num = numbers[ni];
        let localIndices = numCellIndices[ni].map(gIdx => globalToLocal.get(gIdx)).filter(i => i !== undefined);
        return { rem: num.rem, cells: localIndices };
    });

    let totalSolutions = 0;
    const mineCounts = new Array(cellCount).fill(0);

    function backtrack(idx, assignment) {
        if (idx === cellCount) {
            for (let c of constraints) {
                let sum = 0;
                for (let li of c.cells) sum += assignment[li];
                if (sum !== c.rem) return;
            }
            totalSolutions++;
            for (let i = 0; i < cellCount; i++) {
                if (assignment[i]) mineCounts[i]++;
            }
            return;
        }

        for (let val of [0, 1]) {
            assignment[idx] = val;
            let possible = true;
            for (let c of constraints) {
                let currentSum = 0;
                let remaining = 0;
                for (let li of c.cells) {
                    if (li < idx) currentSum += assignment[li];
                    else if (li === idx) currentSum += val;
                    else remaining++;
                }
                if (currentSum > c.rem || currentSum + remaining < c.rem) {
                    possible = false;
                    break;
                }
            }
            if (possible) {
                backtrack(idx + 1, assignment);
            }
            assignment[idx] = 0;
        }
    }

    backtrack(0, new Array(cellCount).fill(0));

    const probs = {};
    if (totalSolutions > 0) {
        for (let i = 0; i < cellCount; i++) {
            let globalIdx = compCells[i];
            let cell = allCells[globalIdx];
            probs[posKey(cell.x, cell.y)] = mineCounts[i] / totalSolutions;
        }
    } else {
        for (let i = 0; i < cellCount; i++) {
            let globalIdx = compCells[i];
            let cell = allCells[globalIdx];
            probs[posKey(cell.x, cell.y)] = 0.5;
        }
    }
    return probs;
}

function computeExactProbabilities() {
    exactProbs.clear();

    const { numbers, allCells, cellIndexMap, numCellIndices } = buildFrontier();
    if (allCells.length === 0) return;

    const components = buildComponents(numbers, allCells, numCellIndices);

    window.__debugComponents = components;
    window.__debugAllCells = allCells;

    const totalHidden = allCells.length;
    const remainingMines = (typeof E !== 'undefined' ? E : 0);
    const coveredCells = new Set();

    for (let comp of components) {
        if (comp.cells.length <= MAX_COMPONENT_CELLS) {
            let probs = solveComponentExact(comp.cells, comp.numIndices, numbers, allCells, numCellIndices);
            for (let key in probs) {
                exactProbs.set(key, probs[key]);
                coveredCells.add(key);
            }
        } else {
            for (let gIdx of comp.cells) {
                let cell = allCells[gIdx];
                let key = posKey(cell.x, cell.y);
                let minProb = 1;
                for (let ni of comp.numIndices) {
                    let num = numbers[ni];
                    let unk = num.unknowns;
                    if (unk.length > 0) {
                        let prob = num.rem / unk.length;
                        if (prob < minProb) minProb = prob;
                    }
                }
                exactProbs.set(key, minProb);
                coveredCells.add(key);
            }
        }
    }

    for (let cell of allCells) {
        let key = posKey(cell.x, cell.y);
        if (!coveredCells.has(key)) {
            if (totalHidden > 0) {
                exactProbs.set(key, remainingMines / totalHidden);
            } else {
                exactProbs.set(key, 0);
            }
        }
    }
}

function getMineProbability(x, y) {
    if (g[y][x][0] !== 0) return -1;

    if (window._PROB_DISABLED) return Math.random();

    if (isKnownMine(x, y)) return 1;
    if (isKnownSafe(x, y)) return 0;

    let key = posKey(x, y);
    if (exactProbs.has(key)) return exactProbs.get(key);

    let minProb = 1;
    let hasInfo = false;
    for (let t = 0; t < 8; t++) {
        let nx = x + p[t];
        let ny = y + d[t];
        if (!isValid(nx, ny) || g[ny][nx][0] !== 1) continue;

        hasInfo = true;
        let rem = getEffectiveNumber(nx, ny);
        let unk = getUnknowns(nx, ny);
        if (unk.length > 0) {
            let prob = rem / unk.length;
            if (prob < minProb) minProb = prob;
        }
    }

    if (!hasInfo) return -2;
    return minProb;
}

function isBoundaryCell(x, y) {
    if (g[y][x][0] !== 0) return false;
    for (let t = 0; t < 8; t++) {
        let nx = x + p[t];
        let ny = y + d[t];
        if (isValid(nx, ny) && g[ny][nx][0] === 1 && g[ny][nx][2] > 0) {
            return true;
        }
    }
    return false;
}

function getAllHiddenCells() {
    let cells = [];
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 0) cells.push({x: x, y: y});
        }
    }
    return cells;
}

function performFullAnalysis() {
    knownMines.clear();
    knownSafes.clear();
    deadlockPick = null;
    patternResults = {};

    seedPatterns();
    for (let key in patternResults) {
        let [x, y] = key.split(',').map(Number);
        if (patternResults[key] === 1) addKnownMine(x, y);
        else if (patternResults[key] === 0) addKnownSafe(x, y);
    }

    runInference();

    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] !== 0) continue;
            if (isKnownMine(x, y) || isKnownSafe(x, y)) continue;

            let realIsMine = g[y][x][1] === 1;
            let derivable = false;

            for (let t = 0; t < 8; t++) {
                let nx = x + p[t];
                let ny = y + d[t];
                if (!isValid(nx, ny) || g[ny][nx][0] !== 1) continue;

                let rem = getEffectiveNumber(nx, ny);
                let unk = getUnknowns(nx, ny);

                if (realIsMine && rem > 0 && unk.length === rem) {
                    derivable = true;
                    break;
                }
                if (!realIsMine && rem === 0) {
                    derivable = true;
                    break;
                }
            }

            if (derivable) {
                if (realIsMine) addKnownMine(x, y);
                else addKnownSafe(x, y);
            }
        }
    }

    runInference();
    computeExactProbabilities();
}

function findBestClick() {
    performFullAnalysis();

    let minProb = 2;
    let best = [];

    let boundaryCells = [];
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (isBoundaryCell(x, y)) boundaryCells.push({x: x, y: y});
        }
    }

    let candidates = boundaryCells.length > 0 ? boundaryCells : getAllHiddenCells();

    for (let {x, y} of candidates) {
        let prob = getMineProbability(x, y);
        if (prob === -1) continue;
        if (prob < 0) prob = 0;

        if (prob < minProb) {
            minProb = prob;
            best = [{x: x, y: y}];
        } else if (Math.abs(prob - minProb) < 0.001) {
            best.push({x: x, y: y});
        }
    }

    if (minProb > 0 && minProb < 1) {
        if (!deadlockPick) {
            let safeCells = [];
            for (let {x, y} of candidates) {
                if (!isKnownMine(x, y) && !isKnownSafe(x, y)) {
                    if (g[y][x][1] === 0) {
                        let neighborCount = 0;
                        for (let t = 0; t < 8; t++) {
                            let nx = x + p[t];
                            let ny = y + d[t];
                            if (isValid(nx, ny) && g[ny][nx][0] === 1) {
                                neighborCount++;
                            }
                        }
                        safeCells.push({x, y, neighborCount});
                    }
                }
            }
            if (safeCells.length > 0) {
                safeCells.sort((a, b) => b.neighborCount - a.neighborCount);
                let bestCount = safeCells[0].neighborCount;
                let topCells = safeCells.filter(c => c.neighborCount === bestCount);
                deadlockPick = topCells[Math.floor(Math.random() * topCells.length)];
            }
        }
        if (deadlockPick) {
            addKnownSafe(deadlockPick.x, deadlockPick.y);
            return [{x: deadlockPick.x, y: deadlockPick.y}];
        }
    }

    return best;
}

function drawProbability(x, y, isBest) {
    let prob = getMineProbability(x, y);
    if (prob < 0) return;

    let percent = Math.round(prob * 100);
    G.save();

    if (isBest || percent === 0) {
        G.strokeStyle = '#00ff00';
        G.lineWidth = 2;
        G.strokeRect(x * 25 + 2, y * 25 + 2, 21, 21);
    }

    if (percent >= 100) {
        G.fillStyle = '#ff0000';
        G.font = 'bold 10px Arial';
        G.strokeStyle = '#ff0000';
        G.lineWidth = 2;
        G.strokeRect(x * 25 + 2, y * 25 + 2, 21, 21);
    } else if (percent >= 75) {
        G.fillStyle = '#ff3333';
        G.font = 'bold 11px Arial';
    } else if (percent >= 50) {
        G.fillStyle = '#ff8800';
        G.font = 'bold 11px Arial';
    } else if (percent >= 25) {
        G.fillStyle = '#0099cc';
        G.font = 'bold 11px Arial';
    } else if (percent > 0) {
        G.fillStyle = '#00aa00';
        G.font = 'bold 11px Arial';
    } else {
        G.fillStyle = '#00ff00';
        G.font = 'bold 11px Arial';
    }

    G.textAlign = 'center';
    G.textBaseline = 'middle';
    G.fillText(percent, x * 25 + 12, y * 25 + 12);
    G.restore();
}

function drawDebugComponents() {
    if (!window.__debugComponents || !window.__debugAllCells) return;

    const components = window.__debugComponents;
    const allCells = window.__debugAllCells;
    const colors = [
        '#ff4444', '#44ff44', '#4488ff', '#ff44ff',
        '#ffff44', '#44ffff', '#ff8844', '#8844ff',
        '#ff8888', '#88ff88', '#8888ff', '#ff88ff'
    ];

    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        const cellIndices = comp.cells;
        if (cellIndices.length < 2) continue;

        const color = colors[i % colors.length];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const cells = cellIndices.map(idx => allCells[idx]);

        for (let c of cells) {
            const x1 = c.x * 25;
            const y1 = c.y * 25;
            if (x1 < minX) minX = x1;
            if (y1 < minY) minY = y1;
            if (x1 + 25 > maxX) maxX = x1 + 25;
            if (y1 + 25 > maxY) maxY = y1 + 25;
        }

        const pad = 2;
        const x = minX - pad;
        const y = minY - pad;
        const w = maxX - minX + pad * 2;
        const h = maxY - minY + pad * 2;

        G.save();
        G.strokeStyle = color;
        G.lineWidth = 2;
        G.setLineDash([4, 4]);
        G.strokeRect(x, y, w, h);
        G.restore();
    }
}

function scheduleRedraw() {
    let myVersion = ++redrawVersion;
    requestAnimationFrame(() => {
        if (myVersion === redrawVersion && showProbability && o <= 1) {
            doRedraw();
        }
    });
}

function doRedraw() {
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 0) {
                G.drawImage(sgf[0], x * 25, y * 25);
            } else if (g[y][x][0] === 1) {
                G.drawImage(bgf[g[y][x][2]], x * 25, y * 25);
            } else if (g[y][x][0] === 2) {
                G.drawImage(sgf[1], x * 25, y * 25);
            }
        }
    }

    let bestClicks = findBestClick();

    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 0 && !isBoundaryCell(x, y)) continue;
            let isBest = bestClicks.some(b => b.x === x && b.y === y);
            drawProbability(x, y, isBest);
        }
    }

    if (window.location.search.includes('debug')) {
        drawDebugComponents();
    }
}

function redrawAllProbabilities() {
    if (!showProbability || o > 1) return;
    scheduleRedraw();
}

function clearAllProbabilities() {
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] === 0) {
                G.drawImage(sgf[0], x * 25, y * 25);
            } else if (g[y][x][0] === 1) {
                G.drawImage(bgf[g[y][x][2]], x * 25, y * 25);
            } else if (g[y][x][0] === 2) {
                G.drawImage(sgf[1], x * 25, y * 25);
            }
        }
    }
}

function clearAllProbabilitiesSafe() {
    redrawVersion++;
    clearTimers.forEach(t => clearTimeout(t));
    clearTimers = [];
    clearAllProbabilities();
    clearTimers.push(setTimeout(clearAllProbabilities, 100));
    clearTimers.push(setTimeout(clearAllProbabilities, 200));
}

(function() {
    const cb = document.getElementById('showProb');
    if (cb) {
        showProbability = parseInt(localStorage.getItem('showProb') || 0) == 1;
        cb.checked = showProbability;
    }
})();

function initProbabilitySwitch() {
    if (_probInitialized) return;
    const cb = document.getElementById('showProb');
    if (!cb) return;

    if (showProbability) {
        redrawAllProbabilities();
    } else {
        setTimeout(clearAllProbabilitiesSafe, 500);
    }

    cb.addEventListener('change', function() {
        showProbability = this.checked;
        localStorage.setItem('showProb', showProbability ? 1 : 0);
        clearTimers.forEach(t => clearTimeout(t));
        clearTimers = [];
        if (showProbability) {
            redrawAllProbabilities();
        } else {
            clearAllProbabilitiesSafe();
        }
    });
}

function hookGameFunctions() {
    if (_probInitialized) return;

    const orig_l = window.l;
    window.l = function(x, y) {
        let res = orig_l(x, y);
        if (showProbability) {
            clearTimeout(redrawTimer);
            redrawTimer = setTimeout(redrawAllProbabilities, 80);
        }
        return res;
    };

    const orig_q = window.q;
    window.q = function(x, y) {
        orig_q(x, y);
        if (showProbability) {
            clearTimeout(redrawTimer);
            redrawTimer = setTimeout(redrawAllProbabilities, 80);
        }
    };

    const orig__45 = window._45;
    window._45 = function() {
        orig__45();
        if (showProbability) setTimeout(redrawAllProbabilities, 100);
        else setTimeout(clearAllProbabilitiesSafe, 100);
    };

    const orig_n = window.n;
    window.n = function(x, y) {
        orig_n(x, y);
        if (showProbability) {
            clearTimeout(redrawTimer);
            redrawTimer = setTimeout(redrawAllProbabilities, 120);
        }
    };

    const orig_u = window.u;
    window.u = function(x, y) {
        orig_u(x, y);
        if (showProbability) {
            clearTimeout(redrawTimer);
            redrawTimer = setTimeout(redrawAllProbabilities, 80);
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initProbabilitySwitch();
        hookGameFunctions();
        _probInitialized = true;
    }, 100);
});