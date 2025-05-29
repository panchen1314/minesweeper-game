// 游戏配置
const ROWS = 10;
const COLS = 10;
const MINES = 10;

// 游戏状态
let board = [];
let mineCount = MINES;
let gameOver = false;
let timer = 0;
let timerInterval;

// DOM元素
const boardElement = document.getElementById('board');
const minesLeftElement = document.getElementById('mines-left');
const timeElement = document.getElementById('time');
const resetButton = document.getElementById('reset-btn');

// 初始化游戏
function initGame() {
    // 清除之前的游戏状态
    clearInterval(timerInterval);
    timer = 0;
    gameOver = false;
    mineCount = MINES;
    updateMinesLeft();
    updateTimer();
    
    // 创建游戏板
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 40px)`;
    
    // 放置地雷
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        
        if (board[row][col] !== 'mine') {
            board[row][col] = 'mine';
            minesPlaced++;
        }
    }
    
    // 计算每个格子周围的地雷数
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === 'mine') continue;
            
            let count = 0;
            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (board[r][c] === 'mine') count++;
                }
            }
            board[row][col] = count;
        }
    }
    
    // 创建格子元素
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', () => handleCellClick(row, col));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(row, col);
            });
            
            boardElement.appendChild(cell);
        }
    }
    
    // 开始计时器
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// 处理左键点击
function handleCellClick(row, col) {
    if (gameOver) return;
    
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;
    
    if (board[row][col] === 'mine') {
        // 踩到地雷
        cell.classList.add('mine');
        gameOver = true;
        clearInterval(timerInterval);
        revealAllMines();
        alert('游戏结束！你踩到了地雷！');
    } else {
        // 安全区域
        revealCell(row, col);
        checkWin();
    }
}

// 处理右键点击
function handleRightClick(row, col) {
    if (gameOver) return;
    
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('revealed')) return;
    
    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        mineCount++;
    } else {
        cell.classList.add('flagged');
        mineCount--;
    }
    
    updateMinesLeft();
}

// 揭示格子
function revealCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;
    
    cell.classList.add('revealed');
    cell.textContent = board[row][col] || '';
    
    // 如果是空白格子，递归揭示周围的格子
    if (board[row][col] === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    revealCell(r, c);
                }
            }
        }
    }
}

// 揭示所有地雷
function revealAllMines() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === 'mine') {
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('mine');
            }
        }
    }
}

// 检查是否获胜
function checkWin() {
    let unrevealedSafeCells = 0;
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (board[row][col] !== 'mine' && !cell.classList.contains('revealed')) {
                unrevealedSafeCells++;
            }
        }
    }
    
    if (unrevealedSafeCells === 0) {
        gameOver = true;
        clearInterval(timerInterval);
        alert(`恭喜你赢了！用时: ${timer}秒`);
    }
}

// 更新剩余地雷数显示
function updateMinesLeft() {
    minesLeftElement.textContent = mineCount;
}

// 更新计时器显示
function updateTimer() {
    timeElement.textContent = timer;
}

// 重置游戏
resetButton.addEventListener('click', initGame);

// 初始化游戏
initGame();