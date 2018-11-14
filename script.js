var mazeBg, moveX = 0, moveY = 0, moveLoop;

var state = {
    EMPTY: "EMPTY",
    TRACK: "TRACK",
    START: "START",
    END: "END"
};

var stack = [];

var map = {
    mapData: [],
    cellSize: 0,
    xSize: 0,
    ySize: 0,
    startCell: null,
    endCell: null,
    mazeGenerationStart: null
};

var player = {
    cellX: 0,
    cellY: 0,
    internalX: 0,
    internalY: 0,
    div: null,
    left: 0,
    top: 0
};

function setup(custom) {

    document.getElementById("menu").style.display = "none";
    document.getElementById("mazeBg").style.display = "block";
    mazeBg = document.getElementById("mazeBg");
    var div = document.createElement("div");
    div.className = "mapCell";
    div.id = "player";
    mazeBg.appendChild(div);
    player.div = document.getElementById("player");

    map.xSize = (custom && document.getElementById("xSize").value) ? document.getElementById("xSize").value : 20;
    map.ySize = (custom && document.getElementById("ySize").value) ? document.getElementById("ySize").value : 20;
    map.startCell = {};
    map.startCell.X = (custom && document.getElementById("startX").value) ? document.getElementById("startX").value : 0;
    map.startCell.Y = (custom && document.getElementById("startY").value) ? document.getElementById("startY").value : 0;
    map.endCell = {};
    map.endCell.X = (custom && document.getElementById("endX").value) ? document.getElementById("endX").value : map.xSize - 1;
    map.endCell.Y = (custom && document.getElementById("endY").value) ? document.getElementById("endY").value : map.ySize - 1;
    map.mazeGenerationStart = {};
    map.mazeGenerationStart.X = (custom && document.getElementById("genStartX").value) ? document.getElementById("genStartX").value : null;
    map.mazeGenerationStart.Y = (custom && document.getElementById("genStartY").value) ? document.getElementById("genStartY").value : null;
    map.cellSize = 20;

    mazeBg.style.marginTop = "-" + map.ySize * 20 + "px";
    mazeBg.style.marginLeft = "-" + map.xSize * 20 + "px";
    mazeBg.style.height = ((map.ySize - 0.5) * 40) + 2 + "px";
    mazeBg.style.width = ((map.xSize - 0.5) * 40) + 2 + "px";
    setUpKeys();

    // instantiateMapData
    instantiateMapData();

    //set up player cell
    player.div.style.top = map.startCell.Y * 40 + "px";
    player.div.style.left = map.startCell.X * 40 + "px";

    // genMaze
    genMazeDivs();
    genMaze();
    moveLoop = setInterval(doMove, 10);
}

function instantiateMapData() {
    for (var i = 0; i < map.ySize; i++) {
        //makes the array 2 dimensional
        map.mapData[i] = [];
        for (var j = 0; j < map.xSize; j++) {
            //makes every value in the map array an object with the following properties
            map.mapData[i][j] = {
                X: j,
                Y: i,
                //this is used as a reference as a reference for checking if cells are taken up or not
                state: state.EMPTY,
                //reference for the coordinates of its adjacent cells
                adjacentCells: [
                    {X: j, Y: i + 1},
                    {X: j + 1, Y: i},
                    {X: j, Y: i - 1},
                    {X: j - 1, Y: i}
                ],
                //returns the amount of adjacent cells that can moved into
                getNumberOfFreeCells: function () {
                    var count = 0, cell;
                    for (var x = 0; x < this.adjacentCells.length; x++) {
                        if (!map.mapData[this.adjacentCells[x].Y]) {
                            continue;
                        } else if (!map.mapData[this.adjacentCells[x].Y][this.adjacentCells[x].X]) {
                            continue
                        }
                        cell = map.mapData[this.adjacentCells[x].Y][this.adjacentCells[x].X];
                        if (cell.state == state.EMPTY) {
                            count++;
                        }
                    }
                    return count;
                },
                //stores the directions that can be moved into, used for movement engine
                connections: []
            }
        }
    }
}

function genMazeDivs() {
    //creates the visual representations of the map
    var div;
    for (var i = 0; i < map.xSize; i++) {
        for (var j = 0; j < map.ySize; j++) {
            div = document.createElement("div");
            div.className = "mapCell";
            div.id = i + "," + j;
            div.style.left = i * 40 + "px";
            div.style.top = j * 40 + "px";
            mazeBg.appendChild(div);
        }
    }
}

function genMaze() {
    var startCellSelector;
    //if the starting cell wasn't chosen by the player
    //randomly chooses the starting cell, makes the maze seem more random
    startCellSelector = Math.floor(Math.random() * map.xSize * map.ySize);
    if (!map.mazeGenerationStart || !map.mazeGenerationStart.X) {
        map.mazeGenerationStart = {};
        map.mazeGenerationStart.X = startCellSelector % map.xSize;
    }
    if (!map.mazeGenerationStart.Y) {
        map.mazeGenerationStart.Y = Math.floor(startCellSelector / map.xSize);
    }

    map.mazeGenerationStart = map.mapData[map.mazeGenerationStart.Y][map.mazeGenerationStart.X];
    map.startCell = map.mapData[map.startCell.Y][map.startCell.X];
    var currentCell = map.mazeGenerationStart, cellsFree, direction, nextCell;
    //loop for each cell in the map
    for (var i = 0; i < (map.xSize * map.ySize) - 1;) {
        if (cellsFree = currentCell.getNumberOfFreeCells()) {
            //if the current cell has has a cell it can move too
            var count = 0;
            //make sure movement is randomised sufficiently
            direction = Math.floor(Math.random() * cellsFree) + 1;
            //decide which direction to move in
            for (var j = 0; j < currentCell.adjacentCells.length;) {
                //if its one of the available options, increase count by one
                if (map.mapData[currentCell.adjacentCells[j].Y]
                        && map.mapData[currentCell.adjacentCells[j].Y][currentCell.adjacentCells[j].X]
                        && map.mapData[currentCell.adjacentCells[j].Y][currentCell.adjacentCells[j].X].state == state.EMPTY) {
                    count++;
                }
                j++;
                //when the correct option has been reached, select it as the next cell to move to
                if (count == direction) {
                    nextCell = currentCell.adjacentCells[j - 1];
                    break;
                }
            }
            //push the cell just processed onto the stack
            currentCell.state = state.TRACK;
            stack.push(currentCell);
            //sets current cell to next cell being moved to
            currentCell = map.mapData[nextCell.Y][nextCell.X];
            addConnection(currentCell);
            i++;
        } else {
            //backtrack - set current cell to top of the stack (previous cell)
            currentCell.state = state.TRACK;
            currentCell = stack.pop();
        }
    }

    var endCell = map.mapData[map.endCell.Y][map.endCell.X];
    map.mazeGenerationStart = map.mapData[map.startCell.Y][map.startCell.X];
    map.mazeGenerationStart.state = state.START;
    endCell.state = state.END;
    document.getElementById(endCell.X + "," + endCell.Y).style.backgroundColor = "yellow";
    document.getElementById(map.startCell.X + "," + map.startCell.Y).style.backgroundColor = "blue";

    player.cellX = map.startCell.X;
    player.cellY = map.startCell.Y;
    player.left = player.cellX * 40;
    player.top = player.cellY * 40;


}

function addConnection(currentCell) {
    //creates the divs that connect cells to each other

    var deltaX = currentCell.X - stack[stack.length - 1].X,
            deltaY = currentCell.Y - stack[stack.length - 1].Y,
            //gets which direction the connection needs to be
            div = document.createElement("div");

    if (deltaX) {
        //creates a connection for both cells which are being connected
        stack[stack.length - 1].connections.push("X" + deltaX);
        currentCell.connections.push("X" + -deltaX)
    } else if (deltaY) {
        //creates a connection for both cells which are being connected
        stack[stack.length - 1].connections.push("Y" + -deltaY);
        currentCell.connections.push("Y" + deltaY)
    }

    //creates and appends div
    div.className = "mapCell";
    div.style.top = currentCell.Y * 40 - deltaY * 20 + "px";
    div.style.left = currentCell.X * 40 - deltaX * 20 + "px";
    mazeBg.appendChild(div);
}

function setUpKeys() {
    //creates event listeners for pressing and releasing a key
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
}

function keyDownHandler(e) {
    var kc = e.keyCode;
    //sets the global movement variable to its respective value, depending on direction pressed
    if (kc == 37) {
        moveX = -1
    } else if (kc == 38) {
        moveY = -1
    } else if (kc == 39) {
        moveX = 1
    } else if (kc == 40) {
        moveY = 1
    }
}

function keyUpHandler(e) {
    var kc = e.keyCode;
    //sets key released value to 0, stops movement in that direction
    if (kc == 37) {
        moveX = 0
    } else if (kc == 38) {
        moveY = 0
    } else if (kc == 39) {
        moveX = 0
    } else if (kc == 40) {
        moveY = 0
    }
}

function doMove() {
    //movement is very grid-based
    //you can't move on the horizontal axis unless you are vertically in the middle of the cell you are in
    if (moveX != 0 && player.internalY == 0) {
        //the 'moveX != 0' means that if the left or right arrow key is pressed (key handler changes the value of moveX respectively)
        //the 'player.internalY == 0' makes it so you have to be in the vertical middle of a cell
        //or else you can't move sideways, if the internalY wasn't 0, you would overlap the maze walls, which you aren't allowed to do

        //checks direction of movement and then sees if there is a connection between that cell and the current cell you're in
        if (moveX == 1 && map.mapData[player.cellY][player.cellX].connections.indexOf("X1") == -1 && player.internalX == 0) {
            return;
        }
        if (moveX == -1 && map.mapData[player.cellY][player.cellX].connections.indexOf("X-1") == -1 && player.internalX == 0) {
            return;
        }
        player.internalX += moveX;
        player.left += moveX;

        //if the cell has been changes
        if (player.internalX < -map.cellSize) {
            player.cellX -= 1;
            player.internalX += map.cellSize * 2;
        } else if (player.internalX > map.cellSize) {
            player.cellX += 1;
            player.internalX -= map.cellSize * 2;
        }
        checkIfPlayerHasWon();
    }
    if (moveY != 0 && player.internalX == 0) {
        if (moveY == 1 && map.mapData[player.cellY][player.cellX].connections.indexOf("Y-1") == -1 && player.internalY == 0) {
            return;
        }
        if (moveY == -1 && map.mapData[player.cellY][player.cellX].connections.indexOf("Y1") == -1 && player.internalY == 0) {
            return;
        }
        player.internalY += moveY;
        player.top += moveY;
        if (player.internalY < -map.cellSize) {
            player.cellY -= 1;
            player.internalY += map.cellSize * 2;
        } else if (player.internalY > map.cellSize) {
            player.cellY += 1;
            player.internalY -= map.cellSize * 2;
        }
        checkIfPlayerHasWon();
    }
    //moves div representing player
    player.div.style.top = player.top + "px";
    player.div.style.left = player.left + "px";
}

function checkIfPlayerHasWon() {
    //if the player is in the center of the winning cell
    if (player.cellX == map.endCell.X && player.cellY == map.endCell.Y
            && player.internalX == 0 && player.internalY == 0) {
        win();
    }
}

function win() {
    console.log("You won")
}

function showCustomOptions() {
    document.getElementById("customiseMaze").style.display = "block";
    document.addEventListener("keyup", function(e) {
        if (e.keyCode == 13) setup(true);
    })
}

function genNewMaze() {
    mazeBg.innerHTML = "";

    var div = document.createElement("div");
    div.className = "mapCell";
    div.id = "player";
    mazeBg.appendChild(div);
    player.div = document.getElementById("player");

    map.xSize = (document.getElementById("xSize").value) ? document.getElementById("xSize").value : 20;
    map.ySize = (document.getElementById("ySize").value) ? document.getElementById("ySize").value : 20;
    map.startCell = {};
    map.startCell.X = (document.getElementById("startX").value) ? document.getElementById("startX").value : 0;
    map.startCell.Y = (document.getElementById("startY").value) ? document.getElementById("startY").value : 0;
    map.endCell = {};
    map.endCell.X = (document.getElementById("endX").value) ? document.getElementById("endX").value : map.xSize - 1;
    map.endCell.Y = (document.getElementById("endY").value) ? document.getElementById("endY").value : map.ySize - 1;
    map.mazeGenerationStart = {};
    map.mazeGenerationStart.X = (document.getElementById("genStartX").value) ? document.getElementById("genStartX").value : null;
    map.mazeGenerationStart.Y = (document.getElementById("genStartY").value) ? document.getElementById("genStartY").value : null;
    map.cellSize = 20;

    mazeBg.style.marginTop = "-" + map.ySize * 20 + "px";
    mazeBg.style.marginLeft = "-" + map.xSize * 20 + "px";
    mazeBg.style.height = ((map.ySize - 0.5) * 40) + 2 + "px";
    mazeBg.style.width = ((map.xSize - 0.5) * 40) + 2 + "px";

    player.div.style.top = map.startCell.Y * 40 + "px";
    player.div.style.left = map.startCell.X * 40 + "px";

    instantiateMapData();
    genMazeDivs();
    genMaze();
}