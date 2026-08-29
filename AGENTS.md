# Minesweeper 项目约定

纯静态网页扫雷（无构建、无依赖、无框架）。4 个 HTML + `static/mahua/` 下 3 个核心 JS。
部署：push 到 master 即上线（GitHub Pages 类静态托管）。

## 验证方式（改动后必须跑）

```
node --check static/mahua/new.6.27.js
node --check static/mahua/probability.js
node --check static/mahua/auto-play.js
node tests/solver.test.js
```

测试用 node vm 加载游戏脚本 + DOM 桩，覆盖求解器纯逻辑。改 `probability.js` / `new.6.27.js` 的逻辑必须先加红测试再修。

## 不读源码必踩的坑（已定设计，不是 bug，别"修"）

1. **棋盘变形机制**：`validateBoard()`（new.6.27.js）在玩家点到雷/插错旗时，若剩余未知格雷数=安全数且翻转后与已翻数字一致，会整盘翻转雷布局让玩家"没踩雷"。刻意的玩家友好机制。
2. **域名锁**：probability.js 顶部 IIFE 用字符码拼域名白名单（dmhpro.top / mahua.uk / 127.0.0.1 / localhost）。不在名单上时 `window._PROB_DISABLED = true`，`getMineProbability` 返回 `Math.random()`——概率功能静默变随机数。防盗版设计。本地测试用 localhost 或 node vm（测试桩里 hostname 已设为 localhost）。
3. **AI/概率偷看真实雷数据**：`findBestClick` 的死局兜底（probability.js）和自动游玩盲翻（auto-play.js `performAutoStep` 末段）通过 `grid[y][x][1] === 0` 只从真·安全格挑选，AI 盲猜永不踩雷。有意为之。
4. **死后端存根**：`apiPath="/bbb"`、`bug.php` 后端不存在（静态站全 404），`reportStats`/`reportError`/`#nick`/`#uid` 是历史遗留排行榜功能的存根，保留未删。

## 关键数据结构

- `grid[y][x] = [state, isMine, number, derivedFlag]`；state: 0 未翻 / 1 已翻 / 2 插旗。
- `gameState`: 0 未开始 / 1 进行中 / 2 胜 / 3 负。
- probability.js 的分析缓存按 `_boardVersion` 失效，实质变化（cellsLeft/minesLeft 变动、重开）经 `bumpBoardVersion()` 递增；`performFullAnalysis()` 同版本直接复用。新增会改棋盘的入口时必须挂进 `hookGameFunctions` 的 wrapper 或手动 bump。

## 代码风格

- 老式 var/全局函数风格（new.6.27.js、auto-play.js），probability.js 用 let/const；跟随所在文件风格。
- 源码里散布的花体 "Mahua" 注释是作者水印，不要清理。
- **游戏源码（static/mahua/*.js）不写功能性注释**：解释放 AGENTS.md 或 commit message；源码里如需占位一律用花体 Mahua 水印风格。tests/ 允许最低限度的用例说明。
- commit message 沿用仓库现有 diffstat 风格（如 ` 2 files changed, 38 insertions(+), 52 deletions(-)`）。
- 不 commit/push 除非用户明确要求；push 后此仓库直接影响线上页面。
