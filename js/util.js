function resetMines(negtsCount) {
    gMine = new Array(gLevel.size ** 2 - negtsCount);
    for (var i = 0; i < gLevel.mine; i++) {
        gMine[i] = true;
    }
    console.log(gMine);
    for (var i = gLevel.mine; i < gMine.length; i++) {
        gMine[i] = false;
    }
    gMine = shuffle(gMine);
}
function drawMine() {
    return gMine.pop();
}

function shuffle(items) {
    var randIdx, keep;
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);
        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function add() {
    gSeconds++;
    if (gSeconds >= 60) {
        gSeconds = 0;
        gMinutes++;
        if (gMinutes >= 60) {
            gMinutes = 0;
        }
    }
    gElGtime.textContent = (gMinutes ? (gMinutes > 9 ? gMinutes : "0" + gMinutes) : "00") + ":" + (gSeconds > 9 ? gSeconds : "0" + gSeconds);
    timer();
}
function timer() {
    elTime = setTimeout(add, 1000);
}

function stop() {
    clearTimeout(elTime);
}

function clear() {
    gElGtime.textContent = "00:00";
    gSeconds = 0; gMinutes = 0; 
}
