'use strict'

var MINE = '💣';
var NORMAL = '🙂';
var SAD = '😟';
var HAPPY = '😎';
var Flag = '🚩';
var WARNING = '⚠️';
var HINT = '💡';

var gBoard = '';
var gBeginner = { size: 4, mine: 2, level: 'Beginner' };
var gMedium = { size: 8, mine: 12, level: 'Medium' };
var gExpert = { size: 12, mine: 30, level: 'Expert' };
var gLevel = gMedium;

var gMine;
var cell = {};
var gCount = 0;
var safeBtnCount = 3;
var gNumsOfMines;
var gHintCount = 3;
var gLives = 3;

var manuallyIsSet;
var gFailOrWon;
var gIsFirstClick;
var gIsHintClickOn;
var gIsmanuallyGame = false;
var gIsManuallyCreate = false;

var gStartTime;
var gElGtime;
var gSeconds = 0,
    gMinutes = 0,
    elTime;
var gElgSmile;
var gNoContext;

function chooseLevel(level) {
    if (level === 'Beginner') gLevel = gBeginner;
    if (level === 'Medium') gLevel = gMedium;
    if (level === 'Expert') gLevel = gExpert;
    initGame();
}

function initGame() {
    safeBtnCount = 3;
    gHintCount = 3;
    gLives = 3;
    resetDom();
    stop();
    clear();
    manuallyIsSet = false;
    gIsHintClickOn = false;
    gFailOrWon = false;
    gIsFirstClick = true;
    gBoard = buildBoard();
    renderBoard(gBoard);
    console.table(gBoard);
}

function resetDom() {
    gElgSmile = document.querySelector('.smile');
    gElGtime = document.getElementById('Time');
    gNumsOfMines = gLevel.mine;
    document.querySelector('.mine').innerText = gNumsOfMines;
    gNoContext = document.getElementById('noContextMenu');
    gNoContext.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
    gElgSmile.innerText = NORMAL;
    document.querySelector('.remainedsafe').innerText = safeBtnCount;
    document.querySelector('.gameOver').innerText = '';
    document.querySelector('.lives').innerText = gLives;
    document.querySelector('.hint').innerText = '💡💡💡';
    document.querySelector('.hint').style.cursor = "pointer";
    if (localStorage.getItem(gLevel.level) != null) {
        document.querySelector('.bestTime').innerHTML = "The best time is " + localStorage.getItem(gLevel.level);
    }

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCells();
        }
    }
    return board;
}

function createCells() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    };
    return cell;
}

function renderBoard(gBoard) {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard[0].length; j++) {
            var cellClass = getClassName({ i: i, j: j }) // e.g. - cell-3-8
            strHTML += '\t<td class="cell ' + cellClass + '"  onmousedown="mouseClick(event, this,' + i + ',' + j + ')" ><span class="size"></span><div class="back size" >\n';
            strHTML += '\t</div></td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function mouseClick(event, elCell, rowI, colJ) {
    if (event.button === 0) {
        cellClicked(elCell, rowI, colJ);
    }
    if (event.button === 2) {
        cellMarked(elCell, rowI, colJ);
    }
}

function cellClicked(elCell, rowI, colJ) {
    if (gIsmanuallyGame) timer();
    gIsmanuallyGame = false;
    if (gIsHintClickOn) {
        hintShow(rowI, colJ);
        setTimeout(() => {
            hideShow(rowI, colJ);
        }, 1000);
        gIsHintClickOn = false;
    } else {
        if (gIsManuallyCreate) {
            manuallyCreate(rowI, colJ);

        } else {
            if (!elCell.querySelector('.back')) return;
            if (elCell.querySelector('span').innerText === Flag) return;
            if (gFailOrWon) return;
            if (gIsFirstClick) {
                firstClick(rowI, colJ, gBoard);
            }
        }
        if (gBoard[rowI][colJ].isMine) {
            if (gIsManuallyCreate) return;
            if (gLives > 0) {
                elCell.querySelector('span').innerText = WARNING;
                setTimeout(() => {
                    elCell.querySelector('span').innerText = null;
                }, 700);
                gLives--;
                document.querySelector('.lives').innerText = gLives;
            } else {
                gElgSmile.innerHTML = SAD;
                stop();
                gFailOrWon = true;
                for (var i = 0; i < gBoard.length; i++) {
                    for (var j = 0; j < gBoard.length; j++) {
                        if (gBoard[i][j].isMine) {
                            var cellClass = 'cell-' + i + '-' + j;
                            console.log(cellClass);
                            var td = document.getElementsByClassName(cellClass)[0];
                            var div = td.querySelector('div')
                            div.classList.remove('back');
                            td.style.backgroundColor = 'darkgray';
                            if (td.querySelector('span').innerText === Flag) {
                                td.querySelector('span').innerText = '';
                                td.style.backgroundColor = 'red';
                            }
                        }
                    }
                }
                document.querySelector('.gameOver').innerText = 'Game Over!'
            }
            return;
        }
        expandShown(elCell, rowI, colJ);
        checkGameOver();
    }
}

function cellMarked(elCell, rowI, colJ) {
    if (gFailOrWon) return;
    if (!elCell.querySelector('.back')) return;
    if (elCell.querySelector('span').innerText === Flag) {
        elCell.querySelector('span').innerText = '';
        gNumsOfMines++;
    } else {
        elCell.querySelector('span').innerText = Flag;
        gBoard[rowI][colJ].isMarked = true;
        checkGameOver();
        gNumsOfMines--;
    }
    gNumsOfMines = (gNumsOfMines >= 0) ? gNumsOfMines : 0;
    document.querySelector('.mine').innerText = gNumsOfMines;
}

function setMinesNegsCount(gBoard) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].mine) continue;
            gBoard[i][j].minesAroundCount = checkNegs(i, j, gBoard);
        }
    }
    console.table(gBoard);
}

function checkNegs(rowI, colJ, gBoard) {
    var negtsCount = 0;
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === rowI && j === colJ) continue;
            if (gBoard[i][j].isMine) negtsCount++;
        }
    }
    if (negtsCount !== 0) return negtsCount;
    return '';
}

function checkNegsAround(rowI, colJ, gBoard) {
    var negtsCount = 0;
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            negtsCount++;
        }
    }
    return negtsCount;
}

function firstClick(rowI, colJ, gBoard) {
    timer();
    var negtsCount = checkNegsAround(rowI, colJ, gBoard);
    console.log(negtsCount);
    resetMines(negtsCount);
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (i >= rowI - 1 && i <= rowI + 1 && j >= colJ - 1 && j <= colJ + 1) {
                gBoard[i][j].isMine = false;
                gCount++;
            } else {
                gBoard[i][j].isMine = drawMine();
            }
        }
    }
    gIsFirstClick = false;
    setMinesNegsCount(gBoard);
    var count = 0;
    var cells = document.querySelectorAll('.cell div');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                cells[count].innerText = MINE;
            } else {
                cells[count].innerText = gBoard[i][j].minesAroundCount;
            }
            count++;

        }
    }
    manuallyIsSet = true;
}

function expandShown(elCell, rowI, colJ) {
    if (gBoard[rowI][colJ].minesAroundCount > 0) {
        var elCells = elCell.querySelector('.back');
        if (elCells !== null) {
            elCells.classList.remove('back');
            gBoard[rowI][colJ].isShown = true;
            elCell.style.backgroundColor = 'darkgray';
        }
    } else {
        elCell.style.backgroundColor = 'darkgray';
        for (var i = rowI - 1; i <= rowI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = colJ - 1; j <= colJ + 1; j++) {
                if (j < 0 || j >= gBoard.length) continue;
                if (gBoard[i][j].isShown) continue;
                if (!gBoard[i][j].isMine) {
                    var cellClass = getClassName({ i: i, j: j })
                    var td = document.getElementsByClassName(cellClass)[0];
                    var elCells = td.querySelector('.back');
                    if (elCells !== null) {
                        console.log(elCells);
                        elCells.classList.remove('back');
                    }
                    td.style.backgroundColor = 'darkgray';
                    gBoard[i][j].isShown = true;
                }
            }
        }
    }
}

function manuallyCreateOnOff() {
    if (manuallyIsSet) return;
    if (gFailOrWon) return;
    if (!gIsManuallyCreate) {
        gIsManuallyCreate = true;
        document.querySelector('.manually').style.backgroundColor = 'darkgreen'
        gNumsOfMines = 0;
        document.querySelector('.mine').innerText = gNumsOfMines;
        document.querySelector('.manually').innerText = 'Click to start';
    } else {
        gIsManuallyCreate = false;
        setMinesNegsCount(gBoard);
        var count = 0;
        var cells = document.querySelectorAll('.cell div');
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].isMine) {
                    cells[count].innerText = MINE;
                } else {
                    cells[count].innerText = gBoard[i][j].minesAroundCount;
                }
                count++;
            }
        }
        manuallyIsSet = true;
        document.querySelector('.manually').innerText = 'Manually creat';
        document.querySelector('.manually').style.backgroundColor = ' rgb(139, 0, 0)';
        gIsmanuallyGame = true;
    }
    gIsFirstClick = false;

}

function manuallyCreate(rowI, colJ) {
    if (gBoard[rowI][colJ].isMine) return;
    gBoard[rowI][colJ].isMine = true;
    gNumsOfMines++;
    document.querySelector('.mine').innerText = gNumsOfMines;
}

function hintClick() {
    if (gIsFirstClick) return;
    gIsHintClickOn = true;
    if (gFailOrWon) return;
    if (gHintCount < 1) return;
    gHintCount--;
    if (gHintCount === 2) document.querySelector('.hint').innerText = '💡💡';
    if (gHintCount === 1) document.querySelector('.hint').innerText = '💡';
    if (gHintCount === 0) document.querySelector('.hint').innerText = '';
    var indexArray = randomEmpyIndex();
    if (indexArray.length === 0) return;
    var cellClass = getClassName({ i: indexArray[0], j: indexArray[1] });
    var td = document.getElementsByClassName(cellClass)[0];
    //td.classList.add('safeColor');
    td.style.cssText = "background-color: lightseagreen";
    gIsHintClickOn = true;
    setTimeout(() => {
        //td.classList.remove('safeColor');
        td.style.cssText = "background-color: rgba(220, 220, 220, 0.521)";
        gIsHintClickOn = false;
    }, 2000);
}

function hintShow(rowI, colJ) {
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (gBoard[i][j].isShown) continue;
            var cellClass = getClassName({ i: i, j: j })
            var td = document.getElementsByClassName(cellClass)[0];
            var elCells = td.querySelector('.back');
            td.style.backgroundColor = 'darkgray';
            if (elCells !== null) {
                elCells.classList.remove('back');
            }
        }
    }
}

function hideShow(rowI, colJ) {
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (gBoard[i][j].isShown) continue;
            var cellClass = getClassName({ i: i, j: j })
            var td = document.getElementsByClassName(cellClass)[0];
            var elCells = td.querySelector('div');
            td.style.backgroundColor = 'rgba(220, 220, 220, 0.521)';
            if (elCells !== null) {
                elCells.classList.add('back');
            }
        }
    }
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) return;
            if (gBoard[i][j].isMarked && !gBoard[i][j].isMine) return;
            if (!gBoard[i][j].isMarked && gBoard[i][j].isMine) return;
        }
    }
    document.querySelector('.gameOver').innerText = 'You won!';
    stop();
    gElgSmile.innerText = HAPPY;
    gFailOrWon = true;
    var bestTime = localStorage.getItem(gLevel.level);
    var tempTime = document.querySelector('#Time').innerText;
    if (bestTime === null || bestTime > tempTime) {
        localStorage.setItem(gLevel.level, tempTime);
        document.querySelector('.bestTime').innerHTML = "The best time is " + localStorage.getItem(gLevel.level);

    }
}

function safeClick() {
    if (gIsFirstClick) return;
    if (gFailOrWon) return;
    if (safeBtnCount === 0) return;
    safeBtnCount--;
    document.querySelector('.remainedsafe').innerText = safeBtnCount;
    var indexArray = randomEmpyIndex();
    if (indexArray.length === 0) return;
    var cellClass = getClassName({ i: indexArray[0], j: indexArray[1] });
    var td = document.getElementsByClassName(cellClass)[0];
    td.classList.add('safeColor');
    // td.style.cssText = "background-color: lightseagreen";
    setTimeout(() => {
        td.classList.remove('safeColor');
        // td.style.backgroundColor = ' rgba(220, 220, 220, 0.521);';
    }, 2000);

}

function randomEmpyIndex() {
    var indexArray = [];
    var boardI = [];
    var boardJ = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            boardI.push(i);
            boardJ.push(j);
        }
    }
    if (boardI.length === 0) return indexArray;
    var randomIndex = getRandomInt(0, boardI.length - 1);
    indexArray = [boardI[randomIndex], boardJ[randomIndex]];
    return indexArray;
}