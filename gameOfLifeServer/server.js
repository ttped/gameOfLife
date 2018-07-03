//npm install express --save
var express = require('express');
//npm install socket.io --save
var socket = require('socket.io');

//array that holds all the box structs
var boxes = [];

var objInterval;

var intervalTime = 1000000000;

var n_by_n_board = 50;
var numBlocks = n_by_n_board * n_by_n_board;

for (i = 0; i < numBlocks; i++) {
	boxes[i] = {
		boxID: i,
		color: 'rgba(0,0,0,0)'
	}
}

//App setup
var app = express();

var server = app.listen(4000, function(){
	console.log('listening to port 4000');
});

//Static files
//app.use(express.static('public'));
//make a public folder with index.html to load stuff^

//socket setup
//socket takes a server as input
var io = socket(server);

//listens for a connection event when that event occurs calls function
//the function takes in the socket variable we created above
//each client will have their own unique socket with the server
io.on('connection', function(socket){
	console.log('made socket connection: ', socket.id);
	
	//listens for the client message named "click"
	//takes in the data sent
	socket.on('click', function(data){
		//console.log('Server received data: ', data);
		
		boxes[data.boxID] = {
			boxID: data.boxID,
			color: data.color
		};
		
		//console.log('boxes id: %i, color: %s', boxes[data.boxID].boxID, boxes[data.boxID].color);
		//sends data back
		//io.sockets.emit('click', data);
	});
	
	socket.on('pauseStart', function(data){
		intervalTime = data.time;
		clearInterval(objInterval);
		objInterval = setInterval(function () {
			//iterates through every block to add up cell totals and then decides whether to kill or activate a block
			for (i = 0; i < numBlocks; i++) {
				cellTotal = checkLeft(i) + checkRight(i) + checkTop(i) + checkTopLeft(i) +
					checkTopRight(i) + checkBottom(i) + checkBottomLeft(i) + checkBottomRight(i);

				if (cellTotal < 2 || cellTotal > 3) {
					killCellLocation.push(i);

				}
				else if (cellTotal == 3) {
					activeCellLocation.push(i);

				}

			}
			//Loop through active cell locations
			//updates box color
			
			//console.log("active cells: " + activeCellLocation.length );
			while (activeCellLocation.length > 0) {
				var pos = activeCellLocation.pop();
				boxes[pos] = {
					boxID: pos,
					color: addColors(pos)
					//color: boxes[pos].color
				};

			}
			//Loop through kill cell location
			//updates box color
			//console.log("kill cells: " + activeCellLocation.length);
			while (killCellLocation.length > 0) {
				var pos = killCellLocation.pop();
				boxes[pos] = {
					boxID: pos,
					color: "rgba(0,0,0,0)"
					//color: "blue"
				};

			}
			//JSON.stringify(boxes)
			io.sockets.emit('click', {boxVar: boxes});

	}, intervalTime);
		
		
		if (intervalTime == 1000){
			io.sockets.emit('pauseStart', {tag: "Pause"});
		}
		else{
			io.sockets.emit('pauseStart', {tag: "Start"});
		}
	});
});




//returns 0 (inactive) or 1 (active)
function checkLeft(i) {
	//if far left side of board then no squares to left
	if (i % n_by_n_board == 0) {
		return 0;

	}
	//checks if square to left is off
	else if (boxes[i - 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above then cell is active
	else {
		return 1;

	}
	//somehow got outside of if statement
	return 0;

}


function checkRight(i) {
	//if at far right side of board then no squares to the right
	if (i % n_by_n_board == n_by_n_board - 1) {
		return 0;

	}
	//checks cell to the right to see if off
	else if (boxes[i + 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above the cell is active
	else {
		return 1;

	}
}


function checkTop(i) {
	//if at the top of board then no squares above
	if (Math.floor(i / n_by_n_board) == 0) {
		return 0;

	}
	//goes up a layer with -n_by_n_board
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above then cell is active
	else {
		return 1;

	}
	//somehow got outside of if statement
	return 0;
}


function checkBottom(i) {
	//if at the bottom of board then no squares below
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 0;

	}
	//go down a layer with n_by_n_board
	//check if cell is off
	else if (boxes[i + n_by_n_board].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above then the cell is active
	else {
		return 1;

	}
	//somehow got outside of the if satement
	return 0;
}

function checkBottomLeft(i) {
	//if at bottom of board then no squares below it
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 0;

	}
	//if at the far left side of board then no below to the left
	else if (i % n_by_n_board == 0) {
		return 0;

	}
	//goes down a layer with n_by_n_board then to the left with -1
	//checks to see if cell is off
	else if (boxes[i + n_by_n_board - 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above then the cell is on
	else {
		return 1;

	}
	//somehow got outside of if statement
	return 0;

}

function checkBottomRight(i) {
	//if at the bottom of board then no squares below it
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 0;

	}
	//if far right side of board then no squares to the right
	else if (i % n_by_n_board == n_by_n_board - 1) {
		return 0;

	}
	//goes down a layer with n_by_n_board then to the right with +1
	//checks if cell is off
	else if (boxes[i + n_by_n_board + 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above the cell is on
	else {
		return 1;

	}
	//somehow got out of if statement
	return 0;

}

function checkTopRight(i) {
	//if at the top of board then no squares above it
	if (Math.floor(i / n_by_n_board) == 0) {
		return 0;

	}
	//if the far right side of board then no squares to the right of it
	else if (i % n_by_n_board == n_by_n_board - 1) {
		return 0;

	}
	//goes up a layer with -ny_by_n_board then to the right with +1
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board + 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above the cell is on
	else {
		return 1;

	}
	//somehow out of if statement
	return 0;
}

function checkTopLeft(i) {
	//If at the top of board then no squares above it
	if (Math.floor(i / n_by_n_board) == 0) {
		return 0;

	}
	//if at left side of board then no squares to the left of it
	else if (i % n_by_n_board == 0) {
		return 0;

	}
	//goes up a layer with - n_by_n_board then to the left with -1
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board - 1].color == 'rgba(0,0,0,0)') {
		return 0;

	}
	//if none of the above the cell is on
	else {
		return 1;

	}
	//somehow got outside the if statement
	return 0;

}

//returns 0 (inactive) or 1 (active)
function getLeftColor(i) {
	//if far left side of board then no squares to left
	if (i % n_by_n_board == 0) {
		return 'rgba(0,0,0,0)';

	}
	//checks if square to left is off
	else if (boxes[i - 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above then cell is active
	else {
		return boxes[i - 1].color;

	}
	//somehow got outside of if statement
	return 'rgba(0,0,0,0)';

}


function getRightColor(i) {
	//if at far right side of board then no squares to the right
	if (i % n_by_n_board == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//checks cell to the right to see if off
	else if (boxes[i + 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above the cell is active
	else {
		return boxes[i + 1].color;

	}
}


function getTopColor(i) {
	//if at the top of board then no squares above
	if (Math.floor(i / n_by_n_board) == 0) {
		return 'rgba(0,0,0,0)';

	}
	//goes up a layer with -n_by_n_board
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above then cell is active
	else {
		return boxes[i - n_by_n_board].color;

	}
	//somehow got outside of if statement
	return 'rgba(0,0,0,0)';
}


function getBottomColor(i) {
	//if at the bottom of board then no squares below
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//go down a layer with n_by_n_board
	//check if cell is off
	else if (boxes[i + n_by_n_board].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above then the cell is active
	else {
		return boxes[i + n_by_n_board].color;

	}
	//somehow got outside of the if satement
	return 'rgba(0,0,0,0)';
}

function getBottomLeftColor(i) {
	//if at bottom of board then no squares below it
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//if at the far left side of board then no below to the left
	else if (i % n_by_n_board == 0) {
		return 'rgba(0,0,0,0)';

	}
	//goes down a layer with n_by_n_board then to the left with -1
	//checks to see if cell is off
	else if (boxes[i + n_by_n_board - 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above then the cell is on
	else {
		return boxes[i + n_by_n_board - 1].color;

	}
	//somehow got outside of if statement
	return 'rgba(0,0,0,0)';

}

function getBottomRightColor(i) {
	//if at the bottom of board then no squares below it
	if (Math.floor(i / n_by_n_board) == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//if far right side of board then no squares to the right
	else if (i % n_by_n_board == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//goes down a layer with n_by_n_board then to the right with +1
	//checks if cell is off
	else if (boxes[i + n_by_n_board + 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above the cell is on
	else {
		return boxes[i + n_by_n_board + 1].color;

	}
	//somehow got out of if statement
	return 'rgba(0,0,0,0)';

}

function getTopRightColor(i) {
	//if at the top of board then no squares above it
	if (Math.floor(i / n_by_n_board) == 0) {
		return 'rgba(0,0,0,0)';

	}
	//if the far right side of board then no squares to the right of it
	else if (i % n_by_n_board == n_by_n_board - 1) {
		return 'rgba(0,0,0,0)';

	}
	//goes up a layer with -ny_by_n_board then to the right with +1
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board + 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above the cell is on
	else {
		return boxes[i - n_by_n_board + 1].color;

	}
	//somehow out of if statement
	return 'rgba(0,0,0,0)';
}

function getTopLeftColor(i) {
	//If at the top of board then no squares above it
	if (Math.floor(i / n_by_n_board) == 0) {
		return 'rgba(0,0,0,0)';

	}
	//if at left side of board then no squares to the left of it
	else if (i % n_by_n_board == 0) {
		return 'rgba(0,0,0,0)';

	}
	//goes up a layer with - n_by_n_board then to the left with -1
	//checks to see if cell is off
	else if (boxes[i - n_by_n_board - 1].color == 'rgba(0,0,0,0)') {
		return 'rgba(0,0,0,0)';

	}
	//if none of the above the cell is on
	else {
		return boxes[i - n_by_n_board - 1].color;

	}
	//somehow got outside the if statement
	return 'rgba(0,0,0,0)';

}

function colorParse(val){
	var regEx = /\d+/g;
	var a = "" + regEx.exec(val);
	var b = "" + regEx.exec(val);
	var c = "" + regEx.exec(val);
	//console.log(regEx.exec(val).length);
	var arr = [parseInt(a), parseInt(b), parseInt(c) ] ;
	//arr[0] = regEx.exec(val);
	//arr[1] = regEx.exec(val);
	//arr[2] = regEx.exec(val);
	//console.log ("length " + regEx.exec(val).length );
	//console.log ("red " + regEx.exec(val) );
	//console.log ("green " + regEx.exec(val) );
	//console.log ("blue " + regEx.exec(val) );
	//console.log(arr);
	return arr;
	//return val.match(/\d+/g);
}


function addColors(i){
	var leftColor = colorParse(getLeftColor(i));
	var rightColor = colorParse(getRightColor(i));
	var topColor = colorParse(getTopColor(i));
	var bottomColor = colorParse(getBottomColor(i));
	var topLeftColor = colorParse(getTopLeftColor(i));
	var topRightColor = colorParse(getTopRightColor(i));
	var bottomLeftColor = colorParse(getBottomLeftColor(i));
	var bottomRightColor = colorParse(getBottomRightColor(i));
	
	var count = checkLeft(i) + checkRight(i) + checkTop(i) + checkTopLeft(i) +
			checkTopRight(i) + checkBottom(i) + checkBottomLeft(i) + checkBottomRight(i);
	
	//console.log("red " + leftColor[0]);
	//console.log("array " + leftColor);
	
	var red = leftColor[0] + rightColor[0] + topColor[0] + bottomColor[0] + topLeftColor[0] + topRightColor[0] + bottomLeftColor[0] + bottomRightColor[0];
	var green = leftColor[1] + rightColor[1] + topColor[1] + bottomColor[1] + topLeftColor[1] + topRightColor[1] + bottomLeftColor[1] + bottomRightColor[1];
	var blue = leftColor[2] + rightColor[2] + topColor[2] + bottomColor[2] + topLeftColor[2] + topRightColor[2] + bottomLeftColor[2] + bottomRightColor[2];
	
	//console.log("red " + red);
	//console.log("blue " + blue);
	//console.log("green " + green);
	return "rgba(" + Math.floor(red/count) + "," + Math.floor(green/count) + "," + Math.floor(blue/count) + ",1)";
}

//killcell holds a location integer
var killCellLocation = [];

//activecell holds a location integer
var activeCellLocation = [];

//variable to hold number of surrounding cells
var cellTotal;


objInterval = setInterval(function () {
	//iterates through every block to add up cell totals and then decides whether to kill or activate a block
	for (i = 0; i < numBlocks; i++) {
		cellTotal = checkLeft(i) + checkRight(i) + checkTop(i) + checkTopLeft(i) +
			checkTopRight(i) + checkBottom(i) + checkBottomLeft(i) + checkBottomRight(i);

		if (cellTotal < 2 || cellTotal > 3) {
			killCellLocation.push(i);

		}
		else if (cellTotal == 3) {
			activeCellLocation.push(i);

		}

	}
	//Loop through active cell locations
	//updates box color
	
	//console.log("active cells: " + activeCellLocation.length );
	while (activeCellLocation.length > 0) {
		var pos = activeCellLocation.pop();
		boxes[pos] = {
			boxID: pos,
			color: addColors(pos)
			//color: boxes[pos].color
		};

	}
	//Loop through kill cell location
	//updates box color
	//console.log("kill cells: " + activeCellLocation.length);
	while (killCellLocation.length > 0) {
		var pos = killCellLocation.pop();
		boxes[pos] = {
			boxID: pos,
			color: "rgba(0,0,0,0)"
			//color: "blue"
		};

	}
	//JSON.stringify(boxes)
	io.sockets.emit('click', {boxVar: boxes});

}, intervalTime);