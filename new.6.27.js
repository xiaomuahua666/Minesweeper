function $(r) {
    return document.getElementById(r)
}

function V(r, f, a) {
    var e = new XMLHttpRequest;
    e.open(f != null ? "POST" : "GET", r, true);
    e.onreadystatechange = function() {
        if (e.readyState == 4 && (e.status == 200 || e.status == 304)) {
            a(e.responseText)
        }
    };
    e.send(f)
}
var g = [];
var h, m, i;
var p = [-1, -1, -1, 0, 0, 1, 1, 1, 0];
var d = [-1, 0, 1, -1, 1, -1, 0, 1, 0];
var o;

function X(r, f) {
    G.drawImage(bgf[0], r * 25, f * 25);
    setTimeout(function() {
        if (g[f][r][0] == 0) G.drawImage(sgf[0], r * 25, f * 25)
    }, 120)
}

function n(r, f) {
    var a = 0,
        e = 0;
    var i, n;
    var t;
    var o, v;
    for (t = 0; t < 8; t++) {
        n = f + d[t];
        i = r + p[t];
        if (n >= 0 && n < m && i >= 0 && i < h) {
            o = g[n][i];
            v = o[0];
            if (v == 2) {
                a++
            } else if (v == 0) {
                if (o[1] == 1) e = 1
            }
        }
    }
    var u = g[f][r];
    var c = a >= u[2];
    for (t = 0; t < 8; t++) {
        n = f + d[t];
        i = r + p[t];
        if (n >= 0 && n < m && i >= 0 && i < h) {
            var o = g[n][i];
            if (o[0] == 0) {
                if (c) {
                    if (e) {
                        if (o[1] == 1) {
                            G.drawImage(sgf[2], i * 25, n * 25);
                            o[0] = 1
                        }
                    } else {
                        l(i, n)
                    }
                } else {
                    X(i, n)
                }
            }
        }
    }
    if (c && e) j()
}

function j() {
    or();
    $("face").src = fgf[2];
    o = 3;
    var r, f;
    var a;
    for (f = 0; f < m; f++) {
        for (r = 0; r < h; r++) {
            a = g[f][r];
            if (a[0] == 0) {
                if (a[1] == 1) {
                    G.drawImage(sgf[3], r * 25, f * 25)
                }
            } else if (a[0] == 2) {
                if (a[1] == 0) {
                    W[S++] = setInterval(function(r, f) {
                        var a = 0;
                        return function() {
                            G.drawImage(a == 0 ? bgf[g[f][r][2]] : sgf[1], r * 25, f * 25);
                            a = !a
                        }
                    }(r, f), 800)
                }
            }
        }
    }
}
var t;

function A() {
    t = [];
    var r, f, a;
    var e = 0,
        i = 0;
    for (f = 0; f < m; f++) {
        for (r = 0; r < h; r++) {
            a = g[f][r];
            if (a[0] == 2 && a[1] != 1) return 1;
            if (a[0] == 0 && a[3] == 0) {
                if (a[1] == 1) {
                    e++
                } else {
                    i++
                }
                t.push([r, f])
            }
        }
    }
    if (e != i) return 2;
    return 0
}

function C(r, f) {
    var a = 0;
    var e, i;
    for (var n = 0; n < 8; n++) {
        i = f + d[n];
        e = r + p[n];
        if (i >= 0 && i < m && e >= 0 && e < h) {
            if (g[i][e][1] == 1) {
                a++
            }
        }
    }
    return a
}

function F() {
    var r, f, a;
    for (f = 0; f < t.length; f++) {
        r = t[f];
        a = g[r[1]][r[0]];
        a[1] = a[1] == 0 ? 1 : 0
    }
}

function J() {
    if (A() != 0) return 1;
    F();
    var r, f, a;
    var e;
    for (f = 0; f < m; f++) {
        for (r = 0; r < h; r++) {
            a = g[f][r];
            e = a[2];
            if (a[0] == 1 && e != 0) {
                if (C(r, f) != e) {
                    F();
                    return 2
                }
            }
        }
    }
    for (f = 0; f < m; f++) {
        for (r = 0; r < h; r++) {
            a = g[f][r];
            if (a[0] != 1) {
                a[2] = C(r, f)
            }
        }
    }
    return 0
}

function K(r, f) {
    var a, e;
    var i, n;
    var t;
    var o, v;
    var u, c;
    var l, s;
    for (s = 0; s < 9; s++) {
        c = f + d[s];
        u = r + p[s];
        if (c >= 0 && c < m && u >= 0 && u < h) {
            a = g[c][u];
            v = a[2];
            if (a[0] == 1 && v > 0) {
                o = 0;
                for (l = 0; l < 8; l++) {
                    i = c + d[l];
                    n = u + p[l];
                    if (i >= 0 && i < m && n >= 0 && n < h) {
                        e = g[i][n];
                        t = e[0];
                        if (t == 0) {
                            o++
                        } else if (t == 2) {
                            if (e[1] == 1) v--;
                            else o++
                        }
                    }
                }
                if (o > 0 && v == o) {
                    for (l = 0; l < 8; l++) {
                        i = c + d[l];
                        n = u + p[l];
                        if (i >= 0 && i < m && n >= 0 && n < h) {
                            e = g[i][n];
                            t = e[0];
                            if (t != 1) e[3] = 1;
                            if (t == 0) {
                                if (x == 1) {
                                    q(n, i)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function l(r, f) {
    var a = g[f][r];
    if (a[1] == 1) {
        if (o == 1) J();
        if (a[1] == 1) {
            G.drawImage(sgf[2], r * 25, f * 25);
            a[0] = 1;
            j();
            return 1
        }
    }
    a[0] = 1;
    G.drawImage(bgf[a[2]], r * 25, f * 25);
    R--;
    if (R == 0) N();
    else if (a[2] == 0) {
        var e, i, n;
        for (e = 0; e < 8; e++) {
            i = f + d[e];
            n = r + p[e];
            if (i >= 0 && i < m && n >= 0 && n < h) {
                if (g[i][n][0] == 0) l(n, i)
            }
        }
    }
    K(r, f);
    return 0
}
var e;

function N() {
    if (!x && k) e = 2;
    else e = x;
    o = 2;
    or();
    var r, f, a;
    for (f = 0; f < m; f++) {
        for (r = 0; r < h; r++) {
            a = g[f][r];
            if (a[0] == 0) {
                if (a[1] != 1) {
                    hr(1, r, f)
                } else {
                    q(r, f)
                }
            }
        }
    }
    if (E != 0) hr(2, r, f);
    H(i);
    $("face").src = fgf[1];
    Q()
}
var v;

function Q() {
    if (v > 3 && a < 20) return;
    var f = lr();
    var r = "B" + f + "c3/" + v + "" + a + "" + e;
    if (v > 3) r += "" + h + "" + m + "" + i;
    V(app, r, function(r) {
        if (f == "" && r.length > 1) {
            $("uid").innerHTML = r;
            localStorage.setItem("uid", r)
        }
    })
}

function U(r) {
    var i = $(r);
    var n = i.getContext("2d");
    var t = 3;
    return function(r) {
        if (r < 10) r = "00" + r;
        else if (r < 100) r = "0" + r;
        else r = r.toString();
        var f = r.length;
        if (f != t) {
            i.width = f * 13;
            t = f
        }
        var a = 0;
        for (var e = 0; e < f; e++) {
            n.drawImage(dgf[parseInt(r.charAt(e))], a, 0);
            a += 13
        }
    }
}

function r(r) {
    var f = $("es");
    var a = f.getContext("2d");
    r = r.toString();
    var e = r.length;
    if (e == 1) {
        r = "0" + r;
        e = 2
    }
    f.width = (e + 1) * 13;
    var i = 0;
    for (var n = 0; n < e - 1; n++) {
        a.drawImage(dgf[parseInt(r.charAt(n))], i, 0);
        i += 13
    }
    a.drawImage(pgf, i, 0);
    i += 13;
    a.drawImage(dgf[parseInt(r.charAt(n))], i, 0)
}

function u(r, f) {
    var a;
    var e, i;
    var n = R;
    for (a = 8; a >= 0 && n > 0; a--) {
        e = f + d[a];
        i = r + p[a];
        if (e >= 0 && e < m && i >= 0 && i < h) {
            var t = s[e * h + i];
            if (g[e][i][1] == 1) {
                var o = Math.floor(Math.random() * n);
                M(t, -1);
                M(o, 1);
                n--;
                I(o, n)
            } else {
                n--;
                I(t, n)
            }
        }
    }
    ur()
}
var c = [];
var s = [];

function f() {
    var r, f;
    var a;
    var e;
    for (f = 0; f < m; f++) {
        g[f] = [];
        for (r = 0; r < h; r++) g[f][r] = [0, 0, 0, 0]
    }
    for (e = 0; e < O; e++) {
        c[e] = e;
        s[e] = e
    }
    R = O;
    for (a = 0; a < i; a++) {
        e = Math.floor(Math.random() * R);
        R--;
        I(e, R)
    }
    for (e = R; e < O; e++) {
        M(e, 1)
    }
    E = i;
    R = O - i
}

function I(r, f) {
    var a = c[r];
    var e = c[f];
    c[r] = e;
    c[f] = a;
    s[a] = f;
    s[e] = r
}

function M(r, f) {
    var a, e;
    var i = c[r];
    a = Math.floor(i / h);
    e = i % h;
    g[a][e][1] += f;
    for (z = 0; z < 8; z++) {
        cy = a + d[z];
        cx = e + p[z];
        if (cy >= 0 && cy < m && cx >= 0 && cx < h) {
            g[cy][cx][2] += f
        }
    }
}
var W = [];
var S = 0;

function _45() {
    if (y > 0) {
        clearInterval(y);
        y = 0
    }
    for (var r = 0; r < S; r++) {
        clearInterval(W[r])
    }
    S = 0;
    $("es").width = 39;
    f();
    tr();
    b = -1;
    T = -1;
    k = 1;
    o = 0
}
var k;
var Y, Z;
var b;
var T;

function _(r) {
    if (D || o > 1) return;
    var f = B.getBoundingClientRect();
    var a = Math.floor((r.clientX - f.left) / 25);
    var e = Math.floor((r.clientY - f.top) / 25);
    if (a < 0 || a == h || e < 0 || e == m) return;
    b = a;
    T = e;
    var i = g[e][a][0];
    if (r.button == 2) {
        if (Z != 1) {
            if (i == 1) {
                n(a, e)
            } else {
                q(a, e)
            }
        }
    } else {
        if (Y != 1) {
            if (i == 0) {
                if (o == 0) u(a, e);
                l(a, e)
            } else if (i == 1) {
                n(a, e)
            } else {
                q(a, e)
            }
        }
    }
}

function rr(r) {
    if (D || o > 1) return;
    var f = B.getBoundingClientRect();
    var a = Math.floor((r.clientX - f.left) / 25);
    var e = Math.floor((r.clientY - f.top) / 25);
    if (a < 0 || a == h || e < 0 || e == m) return;
    var i = g[e][a][0];
    if (r.button == 2) {
        if (Z != 0) {
            if (i == 1) {
                n(a, e)
            } else {
                q(a, e)
            }
        }
    } else {
        if (Y != 0) {
            if (i == 0) {
                if (o == 0) u(a, e);
                l(a, e)
            } else if (i == 1) {
                n(a, e)
            } else {
                q(a, e)
            }
        }
    }
}

function fr(r) {
    if (o > 1) return;
    D = 1;
    var f = B.getBoundingClientRect();
    var a = Math.floor((r.touches[0].clientX - f.left) / 25);
    var e = Math.floor((r.touches[0].clientY - f.top) / 25);
    if (a < 0 || a == h || e < 0 || e == m) return;
    if (g[e][a][0] == 1) {
        n(a, e)
    } else {
        ar = setTimeout(function() {
            return er(a, e)
        }, 320)
    }
}
var ar;

function er(r, f) {
    if (cr == 1 && w == 0) return;
    if (o == 0) {
        u(r, f);
        l(r, f);
        return
    }
    D = 3;
    if (w == 0) {
        if (g[f][r][0] == 2) {
            q(r, f)
        }
        if (g[f][r][0] == 0) l(r, f)
    } else {
        q(r, f)
    }
}
var ir = 0;

function nr(r) {
    if (D == 1) {
        var f = B.getBoundingClientRect();
        var a = Math.floor((r.changedTouches[0].clientX - f.left) / 25);
        var e = Math.floor((r.changedTouches[0].clientY - f.top) / 25);
        if (a < 0 || a == h || e < 0 || e == m) return;
        var i = g[e][a][0];
        if (o == 0) {
            u(a, e);
            l(a, e)
        } else {
            if (w == 0) {
                if (i != 1) {
                    var n = Date.now();
                    var t;
                    if (a == b && e == T) {
                        t = n - ir
                    } else {
                        b = a;
                        T = e;
                        ir = Date.now();
                        t = 1e3
                    }
                    if (cr == 1 && t < 400 && i == 0) {
                        l(a, e)
                    } else {
                        q(a, e)
                    }
                    ir = n
                }
            } else {
                if (i == 0) {
                    l(a, e)
                } else if (i == 2) {
                    q(a, e)
                }
            }
        }
        D = 4;
        clearTimeout(ar)
    }
    if (r.preventDefault) {
        r.preventDefault()
    } else {
        window.event.returnValue = false
    }
}
var x;

function tr() {
    or();
    y = 0;
    D = 0;
    x = parseInt($("af").checked ? 1 : 0);
    var r = h * 25;
    $("p42").style.width = r + 4 + "px";
    B.width = r;
    B.height = m * 25;
    $("face").src = fgf[0];
    for (var f = 0; f < h; f++) {
        for (var a = 0; a < m; a++) {
            G.drawImage(sgf[0], f * 25, a * 25)
        }
    }
    H(E);
    L(0)
}

function or() {
    if (y > 0) {
        clearInterval(y);
        y = 0;
        a = Date.now() - a;
        if (o == 2) {
            a = Math.ceil(a / 100);
            r(a)
        } else {
            L(parseInt(a / 1e3))
        }
    } else {
        a = 0
    }
}
var y = 0;
var a;
var vr;

function ur() {
    a = Date.now();
    vr = 0;
    o = 1;
    y = setInterval(function() {
        L(++vr)
    }, 1e3)
}
var w;
var cr;
var D;
var E;
var R;

function q(r, f) {
    k = 0;
    var a = g[f][r];
    if (a[0] == 0) {
        if (E > 0) {
            if (a[1] == 0) {
                J()
            }
            G.drawImage(sgf[1], r * 25, f * 25);
            a[0] = 2;
            H(--E)
        }
    } else if (a[0] == 2) {
        G.drawImage(sgf[0], r * 25, f * 25);
        a[0] = 0;
        H(++E)
    }
}
var B;
var G;
var H;
var L;

function start() {
    sr = $("ss").href + "#";
    pr("night", ny0, gr);
    gr();
    pr("af", af0, _45);
    P("mp1", 0, r => {
        Y = r
    });
    P("mp2", 0, r => {
        Z = r
    });
    P("tpn", 0, r => {
        w = r;
        dr(r)
    });
    P("opn", 0, r => {
        cr = r
    });
    var r = localStorage.getItem("df5");
    if (r == null) {
        $("hm").value = 15;
        $("vm").value = 15;
        $("mm").value = 20
    } else {
        var f = r.split(";");
        $("hm").value = f[0];
        $("vm").value = f[1];
        $("mm").value = f[2]
    }
    document.oncontextmenu = function() {
        return false
    };
    document.onselectstart = function() {
        return false
    };
    B = $("paf");
    G = B.getContext("2d");
    H = U("rm");
    L = U("es");
    B.onmousedown = _;
    B.onmouseup = rr;
    B.ontouchstart = fr;
    B.ontouchmove = function() {
        D = 2;
        clearTimeout(ar)
    };
    B.ontouchend = nr;
    _123(localStorage.getItem("ch7"));
    $("nick").value = localStorage.getItem("nick");
    $("uid").innerHTML = lr()
}

function lr() {
    var r = localStorage.getItem("nick");
    if (r == null || r == "") r = localStorage.getItem("uid");
    if (r == null) r = "";
    return r
}
var O;

function _123(r) {
    var f, a;
    o = 0;
    f = document.body.clientWidth;
    a = document.body.clientHeight;
    v = parseInt(r) || 2;
    $("custom").style.display = v == 5 ? "" : "none";
    if (v == 1) {
        h = 9;
        m = 9;
        i = 10;
        O = 81
    } else if (v == 2) {
        h = 16;
        m = 16;
        i = 40;
        O = 256
    } else if (v == 3) {
        i = 99;
        if (f > a) {
            h = 30;
            m = 16
        } else {
            h = 16;
            m = 30
        }
        O = 480
    } else if (v == 4) {
        h = parseInt((f - 18) / 25);
        m = parseInt((a - 54) / 25);
        O = h * m;
        if (O >= 480) i = O * .20625;
        else i = O * O / 5760 + O / 8;
        i = parseInt(i)
    } else if (v == 5) {
        h = parseInt($("hm").value);
        m = parseInt($("vm").value);
        O = h * m;
        i = parseInt($("mm").value);
        if (i > O) i = O
    } else {
        return
    }
    _45();
    localStorage.setItem("ch7", v);
    $("ss").href = sr + v;
    mr(v)
}
var sr;

function udf() {
    _123(5);
    localStorage.setItem("df5", $("hm").value + ";" + $("vm").value + ";" + $("mm").value);
    $("custom").style.display = "none"
}

function nick() {
    var nick = $("nick").value.trim();
    if (nick.charCodeAt(0) < 65) {
        alert(w1);
        return
    }
    localStorage.setItem("nick", nick);
    $("uid").innerHTML = lr();
    setr()
}

function gr() {
    var r = document.body.style;
    var f = document.getElementsByTagName("a");
    if ($("night").checked) {
        r.backgroundColor = "black";
        r.color = "silver";
        for (var a = 0; a < f.length; a++) {
            f[a].style.color = "silver"
        }
    } else {
        r.backgroundColor = "#f7f7f0";
        r.color = "";
        for (var a = 0; a < f.length; a++) {
            f[a].style.color = ""
        }
    }
}

function hr(r, f, a) {
    var e = VER + ":" + r;
    V("bug.php", e, function(r) {})
}

function mr(r) {
    for (var f = 1; f <= 5; f++) {
        var a = $("c" + f);
        if (f == r) {
            a.className = "choiced"
        } else {
            a.className = ""
        }
    }
}

function pr(r, f, a) {
    var e = $(r);
    e.checked = parseInt(localStorage.getItem(r) || f);
    e.addEventListener("change", function() {
        a();
        localStorage.setItem(r, this.checked ? 1 : 0)
    })
}

function P(f, r, a) {
    var e = parseInt(localStorage.getItem(f) || r);
    a(e);
    document.getElementsByName(f).forEach(r => {
        if (r.value == e) {
            r.checked = true
        }
        r.addEventListener("change", function() {
            a(parseInt(this.value));
            if (this.checked) localStorage.setItem(f, this.value)
        })
    })
}

function dr(r) {
    if (r == 0) {
        $("topen").style.display = "block";
        $("thint").style.display = "none"
    } else {
        $("thint").style.display = "block";
        $("topen").style.display = "none"
    }
}

function fold(r, f) {
    var a = 0;
    return function() {
        if (a == 0) {
            $(f).style.display = "block";
            $(r).innerText = shou;
            a = 1
        } else {
            $(f).style.display = "none";
            $(r).innerText = shez;
            a = 0
        }
    }
}