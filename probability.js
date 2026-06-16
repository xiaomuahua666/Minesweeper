let showProbability = false;
let autoRefreshTimer = null;
let patternResults = {};

function getPatternKey(x, y) {
    return x + ',' + y;
}

function setPatternMine(x, y) {
    patternResults[getPatternKey(x, y)] = 1;
}

function setPatternSafe(x, y) {
    patternResults[getPatternKey(x, y)] = 0;
}

function getPatternResult(x, y) {
    return patternResults[getPatternKey(x, y)];
}

function getEffectiveNumber(x, y) {
    if(g[y][x][0] != 1) return -1;
    let flagged = 0;
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if(g[ny][nx][0] == 2) flagged++;
        }
    }
    return g[y][x][2] - flagged;
}

function allHiddenOnlyAbove(x, y) {
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if(g[ny][nx][0] == 0) {
                if(ny >= y) return false;
            }
        }
    }
    return true;
}

function allHiddenOnlyBelow(x, y) {
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if(g[ny][nx][0] == 0) {
                if(ny <= y) return false;
            }
        }
    }
    return true;
}

function allHiddenOnlyLeft(x, y) {
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if(g[ny][nx][0] == 0) {
                if(nx >= x) return false;
            }
        }
    }
    return true;
}

function allHiddenOnlyRight(x, y) {
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            if(g[ny][nx][0] == 0) {
                if(nx <= x) return false;
            }
        }
    }
    return true;
}

function scanPatterns() {
    patternResults = {};
    
    for(let y = 0; y < m; y++) {
        for(let x = 0; x < h - 2; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);
            
            if(n1 == 1 && n2 == 2 && n3 == 1) {
                let up = allHiddenOnlyAbove(x, y) && allHiddenOnlyAbove(x+1, y) && allHiddenOnlyAbove(x+2, y);
                let down = allHiddenOnlyBelow(x, y) && allHiddenOnlyBelow(x+1, y) && allHiddenOnlyBelow(x+2, y);
                
                if(up || down) {
                    if(up) {
                        setPatternMine(x, y-1);
                        setPatternSafe(x+1, y-1);
                        setPatternMine(x+2, y-1);
                    }
                    if(down) {
                        setPatternMine(x, y+1);
                        setPatternSafe(x+1, y+1);
                        setPatternMine(x+2, y+1);
                    }
                }
            }
            
            if(n1 == 2 && n2 == 1 && n3 == 2) {
                let up = allHiddenOnlyAbove(x, y) && allHiddenOnlyAbove(x+1, y) && allHiddenOnlyAbove(x+2, y);
                let down = allHiddenOnlyBelow(x, y) && allHiddenOnlyBelow(x+1, y) && allHiddenOnlyBelow(x+2, y);
                
                if(up || down) {
                    if(up) {
                        setPatternMine(x, y-1);
                        setPatternSafe(x+1, y-1);
                        setPatternMine(x+2, y-1);
                    }
                    if(down) {
                        setPatternMine(x, y+1);
                        setPatternSafe(x+1, y+1);
                        setPatternMine(x+2, y+1);
                    }
                }
            }
        }
    }
    
    for(let x = 0; x < h; x++) {
        for(let y = 0; y < m - 2; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);
            
            if(n1 == 1 && n2 == 2 && n3 == 1) {
                let left = allHiddenOnlyLeft(x, y) && allHiddenOnlyLeft(x, y+1) && allHiddenOnlyLeft(x, y+2);
                let right = allHiddenOnlyRight(x, y) && allHiddenOnlyRight(x, y+1) && allHiddenOnlyRight(x, y+2);
                
                if(left || right) {
                    if(left) {
                        setPatternMine(x-1, y);
                        setPatternSafe(x-1, y+1);
                        setPatternMine(x-1, y+2);
                    }
                    if(right) {
                        setPatternMine(x+1, y);
                        setPatternSafe(x+1, y+1);
                        setPatternMine(x+1, y+2);
                    }
                }
            }
            
            if(n1 == 2 && n2 == 1 && n3 == 2) {
                let left = allHiddenOnlyLeft(x, y) && allHiddenOnlyLeft(x, y+1) && allHiddenOnlyLeft(x, y+2);
                let right = allHiddenOnlyRight(x, y) && allHiddenOnlyRight(x, y+1) && allHiddenOnlyRight(x, y+2);
                
                if(left || right) {
                    if(left) {
                        setPatternMine(x-1, y);
                        setPatternSafe(x-1, y+1);
                        setPatternMine(x-1, y+2);
                    }
                    if(right) {
                        setPatternMine(x+1, y);
                        setPatternSafe(x+1, y+1);
                        setPatternMine(x+1, y+2);
                    }
                }
            }
        }
    }
    
    for(let y = 0; y < m; y++) {
        for(let x = 0; x < h - 3; x++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x+1, y);
            let n3 = getEffectiveNumber(x+2, y);
            let n4 = getEffectiveNumber(x+3, y);
            
            if(n1 == 1 && n2 == 2 && n3 == 2 && n4 == 1) {
                let up = allHiddenOnlyAbove(x+1, y) && allHiddenOnlyAbove(x+2, y);
                let down = allHiddenOnlyBelow(x+1, y) && allHiddenOnlyBelow(x+2, y);
                
                if(up || down) {
                    if(up) {
                        setPatternMine(x+1, y-1);
                        setPatternMine(x+2, y-1);
                    }
                    if(down) {
                        setPatternMine(x+1, y+1);
                        setPatternMine(x+2, y+1);
                    }
                }
            }
        }
    }
    
    for(let x = 0; x < h; x++) {
        for(let y = 0; y < m - 3; y++) {
            let n1 = getEffectiveNumber(x, y);
            let n2 = getEffectiveNumber(x, y+1);
            let n3 = getEffectiveNumber(x, y+2);
            let n4 = getEffectiveNumber(x, y+3);
            
            if(n1 == 1 && n2 == 2 && n3 == 2 && n4 == 1) {
                let left = allHiddenOnlyLeft(x, y+1) && allHiddenOnlyLeft(x, y+2);
                let right = allHiddenOnlyRight(x, y+1) && allHiddenOnlyRight(x, y+2);
                
                if(left || right) {
                    if(left) {
                        setPatternMine(x-1, y+1);
                        setPatternMine(x-1, y+2);
                    }
                    if(right) {
                        setPatternMine(x+1, y+1);
                        setPatternMine(x+1, y+2);
                    }
                }
            }
        }
    }
}

function getMineProbability(x, y) {
    if(g[y][x][0] != 0) return -1;
    
    let pat = getPatternResult(x, y);
    if(pat === 0) return 0;
    if(pat === 1) return 1;
    
    let maxProb = 0;
    let isBoundary = false;
    
    for(let t = 0; t < 8; t++) {
        let ny = y + d[t];
        let nx = x + p[t];
        
        if(ny >= 0 && ny < m && nx >= 0 && nx < h) {
            let neighbor = g[ny][nx];
            
            if(neighbor[0] == 1 && neighbor[2] > 0) {
                isBoundary = true;
                
                let flagged = 0;
                let hidden = 0;
                
                for(let t2 = 0; t2 < 8; t2++) {
                    let nny = ny + d[t2];
                    let nnx = nx + p[t2];
                    if(nny >= 0 && nny < m && nnx >= 0 && nnx < h) {
                        if(g[nny][nnx][0] == 2) flagged++;
                        else if(g[nny][nnx][0] == 0) hidden++;
                    }
                }
                
                if(hidden > 0) {
                    let prob = (neighbor[2] - flagged) / hidden;
                    
                    if(prob <= 0) return 0;
                    if(prob >= 1) return 1;
                    
                    if(prob > maxProb) maxProb = prob;
                }
            }
        }
    }
    
    if(!isBoundary) return -2;
    
    return Math.max(0, Math.min(1, maxProb));
}

function findBestClick() {
    scanPatterns();
    
    let minProb = 2;
    let best = [];
    
    for(let y = 0; y < m; y++) {
        for(let x = 0; x < h; x++) {
            let prob = getMineProbability(x, y);
            if(prob >= 0 && prob < minProb) {
                minProb = prob;
                best = [{x, y}];
            } else if(prob >= 0 && prob == minProb) {
                best.push({x, y});
            }
        }
    }
    
    return best;
}

function drawProbability(x, y, isBest) {
    let prob = getMineProbability(x, y);
    if(prob < 0) return;
    
    let percent = Math.round(prob * 100);
    
    G.save();
    
    if(isBest) {
        G.strokeStyle = '#00ff00';
        G.lineWidth = 2;
        G.strokeRect(x * 25 + 2, y * 25 + 2, 21, 21);
    }
    
    if(percent >= 100) {
        G.fillStyle = '#ff0000';
        G.font = 'bold 11px Arial';
    } else if(percent >= 75) {
        G.fillStyle = '#ff3333';
        G.font = 'bold 11px Arial';
    } else if(percent >= 50) {
        G.fillStyle = '#ff8800';
        G.font = 'bold 11px Arial';
    } else if(percent >= 25) {
        G.fillStyle = '#0099cc';
        G.font = 'bold 11px Arial';
    } else if(percent > 0) {
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

function redrawAllProbabilities() {
    if(!showProbability || o > 1) return;
    
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            for(let y = 0; y < m; y++) {
                for(let x = 0; x < h; x++) {
                    if(g[y][x][0] == 0) {
                        G.drawImage(sgf[0], x * 25, y * 25);
                    } else if(g[y][x][0] == 2) {
                        G.drawImage(sgf[1], x * 25, y * 25);
                    }
                }
            }
            
            let bestClicks = findBestClick();
            
            for(let y = 0; y < m; y++) {
                for(let x = 0; x < h; x++) {
                    let isBest = bestClicks.some(b => b.x == x && b.y == y);
                    drawProbability(x, y, isBest);
                }
            }
        });
    });
}

function clearAllProbabilities() {
    stopAutoRefresh();
    for(let y = 0; y < m; y++) {
        for(let x = 0; x < h; x++) {
            if(g[y][x][0] == 0) {
                G.drawImage(sgf[0], x * 25, y * 25);
            } else if(g[y][x][0] == 1) {
                G.drawImage(bgf[g[y][x][2]], x * 25, y * 25);
            } else if(g[y][x][0] == 2) {
                G.drawImage(sgf[1], x * 25, y * 25);
            }
        }
    }
}

function clearAllProbabilitiesSafe() {
    clearAllProbabilities();
    setTimeout(clearAllProbabilities, 100);
    setTimeout(clearAllProbabilities, 200);
}

function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(function() {
        if(showProbability && o == 1) {
            redrawAllProbabilities();
        }
    }, 50);
}

function stopAutoRefresh() {
    if(autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

function initProbabilitySwitch() {
    const cb = document.getElementById('showProb');
    if(!cb) return;
    
    showProbability = parseInt(localStorage.getItem('showProb') || 0) == 1;
    cb.checked = showProbability;
    
    if(showProbability) {
        startAutoRefresh();
    } else {
        setTimeout(clearAllProbabilitiesSafe, 500);
    }
    
    cb.addEventListener('change', function() {
        showProbability = this.checked;
        localStorage.setItem('showProb', showProbability ? 1 : 0);
        if(showProbability) {
            startAutoRefresh();
            redrawAllProbabilities();
        } else {
            clearAllProbabilitiesSafe();
        }
    });
}

function hookGameFunctions() {
    const original_l = window.l;
    window.l = function(x, y) {
        let result = original_l(x, y);
        if(showProbability) redrawAllProbabilities();
        return result;
    };
    
    const original_q = window.q;
    window.q = function(x, y) {
        original_q(x, y);
        if(showProbability) redrawAllProbabilities();
    };
    
    const original__45 = window._45;
    window._45 = function() {
        original__45();
        if(showProbability) setTimeout(redrawAllProbabilities, 100);
        else setTimeout(clearAllProbabilitiesSafe, 100);
    };
    
    const original_n = window.n;
    window.n = function(x, y) {
        original_n(x, y);
        if(showProbability) {
            redrawAllProbabilities();
            setTimeout(redrawAllProbabilities, 50);
            setTimeout(redrawAllProbabilities, 100);
            setTimeout(redrawAllProbabilities, 150);
            setTimeout(redrawAllProbabilities, 200);
        }
    };
    
    const original_u = window.u;
    window.u = function(x, y) {
        original_u(x, y);
        if(showProbability) setTimeout(redrawAllProbabilities, 80);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initProbabilitySwitch();
        hookGameFunctions();
    }, 100);
});
