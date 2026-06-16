// ========== 概率显示模块（修复版） ==========
let showProbability = false;
let patternResults = {};
let _probInitialized = false;

// 简单坐标键
function getPatternKey(x, y) {
    return x + ',' + y;
}
function setPatternMine(x, y) {
    // 边界保护
    if (x < 0 || x >= h || y < 0 || y >= m) return;
    patternResults[getPatternKey(x, y)] = 1;
}
function setPatternSafe(x, y) {
    if (x < 0 || x >= h || y < 0 || y >= m) return;
    patternResults[getPatternKey(x, y)] = 0;
}
function getPatternResult(x, y) {
    return patternResults[getPatternKey(x, y)];
}

// 有效数字：数字 - 周围旗子
function getEffectiveNumber(x, y) {
    if (g[y][x][0] != 1) return -1;
    let flagged = 0;
    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if (g[ny][nx][0] == 2) flagged++;
        }
    }
    return g[y][x][2] - flagged;
}

// 判断一个数字的所有隐藏格是否都在指定方向
function allHiddenOnlyAbove(x, y) {
    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if (g[ny][nx][0] == 0) {
                if (ny >= y) return false; // 有隐藏格不在上方
            }
        }
    }
    return true;
}
function allHiddenOnlyBelow(x, y) {
    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if (g[ny][nx][0] == 0) {
                if (ny <= y) return false;
            }
        }
    }
    return true;
}
function allHiddenOnlyLeft(x, y) {
    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if (g[ny][nx][0] == 0) {
                if (nx >= x) return false;
            }
        }
    }
    return true;
}
function allHiddenOnlyRight(x, y) {
    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if (g[ny][nx][0] == 0) {
                if (nx <= x) return false;
            }
        }
    }
    return true;
}

// 扫描已知模式
function scanPatterns() {
    patternResults = {};

    // 水平三连：1-2-1（删除了 2-1-2 的错误处理）
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h - 2; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);

            if (n1 == 1 && n2 == 2 && n3 == 1) {
                let allUp = allHiddenOnlyAbove(x, y) && allHiddenOnlyAbove(x+1, y) && allHiddenOnlyAbove(x+2, y);
                let allDown = allHiddenOnlyBelow(x, y) && allHiddenOnlyBelow(x+1, y) && allHiddenOnlyBelow(x+2, y);

                if (allUp) {
                    setPatternMine(x, y-1);
                    setPatternSafe(x+1, y-1);
                    setPatternMine(x+2, y-1);
                }
                if (allDown) {
                    setPatternMine(x, y+1);
                    setPatternSafe(x+1, y+1);
                    setPatternMine(x+2, y+1);
                }
            }
            // 2-1-2 已删除，因为在该条件下不可判定
        }
    }

    // 垂直三连：1-2-1
    for (let x = 0; x < h; x++) {
        for (let y = 0; y < m - 2; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);

            if (n1 == 1 && n2 == 2 && n3 == 1) {
                let allLeft = allHiddenOnlyLeft(x, y) && allHiddenOnlyLeft(x, y+1) && allHiddenOnlyLeft(x, y+2);
                let allRight = allHiddenOnlyRight(x, y) && allHiddenOnlyRight(x, y+1) && allHiddenOnlyRight(x, y+2);

                if (allLeft) {
                    setPatternMine(x-1, y);
                    setPatternSafe(x-1, y+1);
                    setPatternMine(x-1, y+2);
                }
                if (allRight) {
                    setPatternMine(x+1, y);
                    setPatternSafe(x+1, y+1);
                    setPatternMine(x+1, y+2);
                }
            }
        }
    }

    // 水平四连：1-2-2-1（补全条件）
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h - 3; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);
            let n4 = getEffectiveNumber(x+3, y);

            if (n1 == 1 && n2 == 2 && n3 == 2 && n4 == 1) {
                let allUp = allHiddenOnlyAbove(x, y) && allHiddenOnlyAbove(x+1, y)
                         && allHiddenOnlyAbove(x+2, y) && allHiddenOnlyAbove(x+3, y);
                let allDown = allHiddenOnlyBelow(x, y) && allHiddenOnlyBelow(x+1, y)
                           && allHiddenOnlyBelow(x+2, y) && allHiddenOnlyBelow(x+3, y);

                if (allUp) {
                    setPatternMine(x+1, y-1);
                    setPatternMine(x+2, y-1);
                }
                if (allDown) {
                    setPatternMine(x+1, y+1);
                    setPatternMine(x+2, y+1);
                }
            }
        }
    }

    // 垂直四连：1-2-2-1
    for (let x = 0; x < h; x++) {
        for (let y = 0; y < m - 3; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);
            let n4 = getEffectiveNumber(x, y+3);

            if (n1 == 1 && n2 == 2 && n3 == 2 && n4 == 1) {
                let allLeft = allHiddenOnlyLeft(x, y) && allHiddenOnlyLeft(x, y+1)
                           && allHiddenOnlyLeft(x, y+2) && allHiddenOnlyLeft(x, y+3);
                let allRight = allHiddenOnlyRight(x, y) && allHiddenOnlyRight(x, y+1)
                            && allHiddenOnlyRight(x, y+2) && allHiddenOnlyRight(x, y+3);

                if (allLeft) {
                    setPatternMine(x-1, y+1);
                    setPatternMine(x-1, y+2);
                }
                if (allRight) {
                    setPatternMine(x+1, y+1);
                    setPatternMine(x+1, y+2);
                }
            }
        }
    }
}

// 获取某格是雷的概率（-1：已开/旗，-2：无信息）
function getMineProbability(x, y) {
    if (g[y][x][0] != 0) return -1;

    // 优先使用模式库的确定结果
    let pat = getPatternResult(x, y);
    if (pat === 0) return 0;
    if (pat === 1) return 1;

    let minProb = 1;
    let hasInfo = false;

    for (let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if (ny < 0 || ny >= m || nx < 0 || nx >= h) continue;

        let neighbor = g[ny][nx];
        if (neighbor[0] == 1 && neighbor[2] > 0) {
            hasInfo = true;
            let flagged = 0;
            let hidden = 0;
            for (let t2 = 0; t2 < 8; t2++) {
                let nny = ny + d[t2];
                let nnx = nx + p[t2];
                if (nny < 0 || nny >= m || nnx < 0 || nnx >= h) continue;
                if (g[nny][nnx][0] == 2) flagged++;
                else if (g[nny][nnx][0] == 0) hidden++;
            }

            if (hidden > 0) {
                let need = neighbor[2] - flagged;
                // 确定雷
                if (need == hidden) return 1;
                // 确定安全
                if (need == 0) return 0;
                // 不确定时，取保守估计（最小概率）
                let prob = need / hidden;
                if (prob < minProb) minProb = prob;
            }
        }
    }

    if (!hasInfo) return -2;
    return minProb;
}

// 找到最佳点击（概率最小的未开非雷格）
function findBestClick() {
    scanPatterns();

    let minProb = 2;
    let best = [];
    let totalHidden = 0;

    // 第一遍：统计未开格子数量（用于无信息回退）
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] == 0) totalHidden++;
        }
    }

    // 第二遍：计算概率
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            let prob = getMineProbability(x, y);
            // 若无局部信息，使用全局概率
            if (prob == -2 && totalHidden > 0) {
                prob = (typeof E !== 'undefined' ? E : 0) / totalHidden;
            }
            if (prob >= 0 && prob < minProb) {
                minProb = prob;
                best = [{x, y}];
            } else if (prob >= 0 && prob === minProb) {
                best.push({x, y});
            }
        }
    }

    return best;
}

// 绘制概率数字和高亮
function drawProbability(x, y, isBest) {
    let prob = getMineProbability(x, y);
    if (prob < 0 && prob !== -2) return; // 已开/旗
    if (prob === -2) {
        // 无信息情况暂不绘制，或使用全局概率（已在 findBestClick 中使用，这里绘图也可以显示）
        // 这里为简洁，只绘制有局部信息的格子
        return;
    }

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

// 重绘所有概率（使用单次 requestAnimationFrame）
function redrawAllProbabilities() {
    if (!showProbability || o > 1) return;

    requestAnimationFrame(() => {
        // 先恢复未被打开的格子外观
        for (let y = 0; y < m; y++) {
            for (let x = 0; x < h; x++) {
                if (g[y][x][0] == 0) {
                    G.drawImage(sgf[0], x * 25, y * 25);
                } else if (g[y][x][0] == 2) {
                    G.drawImage(sgf[1], x * 25, y * 25);
                }
            }
        }

        let bestClicks = findBestClick();

        for (let y = 0; y < m; y++) {
            for (let x = 0; x < h; x++) {
                let isBest = bestClicks.some(b => b.x == x && b.y == y);
                drawProbability(x, y, isBest);
            }
        }
    });
}

// 清除所有概率绘制，恢复游戏原样
function clearAllProbabilities() {
    for (let y = 0; y < m; y++) {
        for (let x = 0; x < h; x++) {
            if (g[y][x][0] == 0) {
                G.drawImage(sgf[0], x * 25, y * 25);
            } else if (g[y][x][0] == 1) {
                G.drawImage(bgf[g[y][x][2]], x * 25, y * 25);
            } else if (g[y][x][0] == 2) {
                G.drawImage(sgf[1], x * 25, y * 25);
            }
        }
    }
}

// 安全清除（多次以防连锁反应）
function clearAllProbabilitiesSafe() {
    clearAllProbabilities();
    setTimeout(clearAllProbabilities, 100);
    setTimeout(clearAllProbabilities, 200);
}

// 初始化开关
function initProbabilitySwitch() {
    if (_probInitialized) return;
    const cb = document.getElementById('showProb');
    if (!cb) return;

    showProbability = parseInt(localStorage.getItem('showProb') || 0) == 1;
    cb.checked = showProbability;

    if (showProbability) {
        redrawAllProbabilities();
    } else {
        setTimeout(clearAllProbabilitiesSafe, 500);
    }

    cb.addEventListener('change', function() {
        showProbability = this.checked;
        localStorage.setItem('showProb', showProbability ? 1 : 0);
        if (showProbability) {
            redrawAllProbabilities();
        } else {
            clearAllProbabilitiesSafe();
        }
    });
}

// 劫持游戏函数，自动刷新概率
function hookGameFunctions() {
    if (_probInitialized) return;

    const original_l = window.l;
    window.l = function(x, y) {
        let result = original_l(x, y);
        if (showProbability) redrawAllProbabilities();
        return result;
    };

    const original_q = window.q;
    window.q = function(x, y) {
        original_q(x, y);
        if (showProbability) redrawAllProbabilities();
    };

    const original__45 = window._45;
    window._45 = function() {
        original__45();
        if (showProbability) {
            // 重置后需要稍微延迟，等主程序重绘完成
            setTimeout(redrawAllProbabilities, 100);
        } else {
            setTimeout(clearAllProbabilitiesSafe, 100);
        }
    };

    const original_n = window.n;
    window.n = function(x, y) {
        original_n(x, y);
        if (showProbability) {
            // 双击可能触发连锁，多次绘制确保最终结果正确
            redrawAllProbabilities();
            setTimeout(redrawAllProbabilities, 50);
            setTimeout(redrawAllProbabilities, 150);
            setTimeout(redrawAllProbabilities, 300);
        }
    };

    const original_u = window.u;
    window.u = function(x, y) {
        original_u(x, y);
        if (showProbability) setTimeout(redrawAllProbabilities, 80);
    };
}

// 启动：页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initProbabilitySwitch();
        hookGameFunctions();
        _probInitialized = true;
    }, 100);
});