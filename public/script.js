//declare important stuff //

//import { setInterval } from "timers";


var loggedIn = false;
var userName = "";

function enabled(colorsed){

	if(userName == ""){
		return
	}
	
var signs = [];



const canvas = document.getElementById("playerCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();

var playerID = null;

const offSet = {
	x: 0,
	y: 0,
};

var translationOrigin = {
	x: canvas.width / 2,
	y: canvas.height / 2,
};

ctx.translate(translationOrigin.x, translationOrigin.y);

socket.on("connecteds", (data) => {
	playerID = data;
	console.log("connection created, id: " + playerID);
});

var coolsTime = 500;
var cools = 0;

var num = 100;
var freq = 1500;
var amp = 1;
var res = 1.1;

var colorOffset = 500;

var secondPerlinOff = 3000;
var secondColorOffset = 900;

var colorInt = 1;

var backGround = [];

var players = {};

var mouse = { x: 0, y: 0 };

var moveInter = 1;

var oldOffsets = {
	x: 0,
	y: 0,
};

var hasChanged = false;

var coolDown = false;

//end of important stuff

/////////////////////////////
//start of useful functions//
/////////////////////////////

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function getID() {
	const array = [];
	for (var i = 0; i < 36; i++) {
		array.push(i.toString(36));
	}
	var arr = [];
	for (var i = 0; i < 24; i++) {
		var rand = Math.floor(Math.random() * array.length);
		arr.push(array[rand]);
	}
	var id = arr.join("");
	return id;
}

function roundNumtoNum(num, roundTo) {
	return Math.round(num / roundTo) * roundTo;
}

///////////////////////////
//end of useful functions//
///////////////////////////

//event listeners //

window.addEventListener("mousemove", function (event) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = event.clientX - rect.left;
	mouse.y = event.clientY - rect.top;
});

//end of event listeners

//////////////////////////////////
//start of background processing//
//////////////////////////////////

PerlinNoise = new (function () {
	this.noise = function (x, y, z) {
		var p = new Array(512);
		var permutation = [
			151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
			140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
			120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
			33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
			71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
			133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
			63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
			135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
			226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
			59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
			152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
			39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
			246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
			81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
			184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
			222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
		];
		for (var i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

		var X = Math.floor(x) & 255, // FIND UNIT CUBE THAT
			Y = Math.floor(y) & 255, // CONTAINS POINT.
			Z = Math.floor(z) & 255;
		x -= Math.floor(x); // FIND RELATIVE X,Y,Z
		y -= Math.floor(y); // OF POINT IN CUBE.
		z -= Math.floor(z);
		var u = fade(x), // COMPUTE FADE CURVES
			v = fade(y), // FOR EACH OF X,Y,Z.
			w = fade(z);
		var A = p[X] + Y,
			AA = p[A] + Z,
			AB = p[A + 1] + Z, // HASH COORDINATES OF
			B = p[X + 1] + Y,
			BA = p[B] + Z,
			BB = p[B + 1] + Z; // THE 8 CUBE CORNERS,

		return scale(
			lerp(
				w,
				lerp(
					v,
					lerp(
						u,
						grad(p[AA], x, y, z), // AND ADD
						grad(p[BA], x - 1, y, z),
					), // BLENDED
					lerp(
						u,
						grad(p[AB], x, y - 1, z), // RESULTS
						grad(p[BB], x - 1, y - 1, z),
					),
				), // FROM  8
				lerp(
					v,
					lerp(
						u,
						grad(p[AA + 1], x, y, z - 1), // CORNERS
						grad(p[BA + 1], x - 1, y, z - 1),
					), // OF CUBE
					lerp(
						u,
						grad(p[AB + 1], x, y - 1, z - 1),
						grad(p[BB + 1], x - 1, y - 1, z - 1),
					),
				),
			),
		);
	};
	function fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	function lerp(t, a, b) {
		return a + t * (b - a);
	}
	function grad(hash, x, y, z) {
		var h = hash & 15; // CONVERT LO 4 BITS OF HASH CODE
		var u = h < 8 ? x : y, // INTO 12 GRADIENT DIRECTIONS.
			v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
	}
	function scale(n) {
		return (1 + n) / 2;
	}
})();
function perlinNoise(x, y) {
	return PerlinNoise.noise(x / freq / res, 0, y / freq / res);
}

function updateColorOffSet() {
	colorOffset = colorOffset + 2.5;
	secondColorOffset = secondColorOffset + 2.5;
}

setInterval(updateColorOffSet, 0);

function getColor(x, y) {
	var r = perlinNoise(x + colorOffset, y + colorOffset) * 255;
	var g = r;
	var b = r;
	var color = `rgba(${r}, ${g}, ${b}, 1)`;
	return color;
}

function genBackground() {
	for (
		var x = roundNumtoNum(offSet.x - 500, num);
		x < canvas.width + offSet.x + 500;
		x += num
	) {
		for (
			var y = roundNumtoNum(offSet.y - 500, num);
			y < canvas.height + offSet.y + 500;
			y += num
		) {
				backGround.push([x, y, getColor(x, y)]);
		}
	}
}

genBackground();

function drawBackground() {
	backGround.forEach((atom) => {
		ctx.fillStyle = atom[2];
		ctx.fillRect(
			atom[0] - translationOrigin.x,
			atom[1] - translationOrigin.y,
			num,
			num,
		);
	});
}

drawBackground();

function updateb() {
	backGround = [];
	genBackground();
	hasChanged = true;
}

setInterval(updateb, 20);

////////////////////////////////
//end of background processing//
////////////////////////////////

//////////////////////////
//start of sign handling//
//////////////////////////

function createSign(
	x,
	y,
	z,
	text,
	rotationx,
	rotationy,
	rotationz,
	time,
	creator
) {
	var signsWidth = 40;
	var signsheight = 40;
	let wrappedText = wrapText(ctx, text, x + 2, y + 8, signsWidth - 5, 10);

	while (
		wrappedText[wrappedText.length - 1][2] >
		canvas.height / 2 + y + signsheight
	) {
		signsWidth = signsWidth + 1;
		signsheight = signsheight + 1;
		wrappedText = wrapText(ctx, text, x + 2, y + 8, signsWidth, 10);
	}

	var strin = [];
	for (var i = 0; i < wrappedText.length; i++) {
		strin.push(wrappedText[i].join("combine_Inner"));
	}
	var totality = strin.join("combine_Outer");
	var obj = {
		x: x,
		y: y,
		z: z,
		text: totality,
		rotationx: rotationx,
		rotationy: rotationy,
		rotationz: rotationz,
		creator: creator,
		time: time,
		width: signsWidth,
		height: signsheight,
		color: "rgba(42,58, 74, 0.675)",
	};
	console.log(obj);
	return obj;
}

const wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
	let words = "";
	let combChar = "";
	if (text.includes(" ")) {
		words = text.split(" ");
		combChar = " ";
	} else {
		words = text.split("");
		combChar = "";
	}
	let line = "";
	let testLine = "";
	let lineArray = [];

	for (var n = 0; n < words.length; n++) {
		testLine += `${words[n]}${combChar}`;
		let metrics = ctx.measureText(testLine);
		let testWidth = metrics.width;

		if (testWidth > maxWidth && n > 0) {
			lineArray.push([line, x, y]);

			y += lineHeight;

			line = `${words[n]}${combChar}`;
			testLine = `${words[n]}${combChar}`;
		} else {
			line += `${words[n]}${combChar}`;
		}

		if (n === words.length - 1) {
			lineArray.push([line, x, y]);
		}
	}
	return lineArray;
};



function drawSign(sign) {
	ctx.fillStyle = sign.color;
	ctx.fillRect(sign.x, sign.y, sign.width, sign.height);
	ctx.fillStyle = "rgba(250, 250, 250, 0.925)";
	var dividedText = sign.text.split("combine_Outer");
	var evenmoredivided = [];
	dividedText.forEach(function (item) {
		evenmoredivided.push(item.split("combine_Inner"));
	});
	evenmoredivided.forEach(function (item) {
		ctx.font = `10px Arial`;
		ctx.fillText(item[0], Number(item[1]), item[2]);

		//console.log(item[0], Number(item[1])+(canvas.width/2)+sign.x, item[2]-(canvas.height/2)+sign.y);
	});
	ctx.font = `6px Arial`;
	var length = ctx.measureText(sign.creator).width;
	ctx.fillText(sign.creator, sign.x+20-(length/2), sign.y+40);

}

function renderSigns() {
	for (var i = 0; i < signs.length; i++) {
		if (signs[i].text) {
			drawSign(signs[i]);
		}
	}
}

socket.on("signs", (data) => {
	signs = data;

	renderSigns();
});

////////////////////////
//end of sign handling//
////////////////////////

///////////////////
//player handling//
///////////////////

socket.on("updatePlayer", (data) => {
	var player = 0;
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == data.player.id) {
			player = i;
			break;
		}
	}
	var interval = setInterval(function () {
		players[player].x = lerp(players[player].x, data.x, 0.01);
		players[player].y = lerp(players[player].y, data.y, 0.01);
	}, 0);
	setTimeout(function () {
		clearInterval(interval);
	}, 500);
});

function updateCoord() {
	var cooltext = "";
	var coordy = offSet.y - translationOrigin.y + canvas.height / 8;
	var coordx = offSet.x - translationOrigin.x + canvas.width - canvas.width / 8;

	var text = "x: " + offSet.x + ", y: " + offSet.y;
	var cords = coordx + ", " + coordy;
	ctx.fillStyle = "navy";
	drawText(coordx, coordy, text, 20);
}

socket.on("players", (data) => {
	players = [];
	players = data;
});

function draw(player) {
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x - 25, player.y - 25, 50, 50);
	ctx.font = "10px Arial";
	var textLength = ctx.measureText(player.name).width;
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillText(player.name, player.x - textLength / 2, player.y - 30);
}

socket.emit("addPlayer", [userName, colorsed]);
console.log(userName)
function drawText(x, y, text, size) {
	ctx.font = `${size}px Arial`;
	ctx.fillText(text, x, y);
}

var colors = [];

var oldOffset = {
	x: 0,
	y: 0,
};

function updateCoords() {
	socket.emit("updateCoords", offSet);
}

var up = false;
var left = false;
var down = false;
var right = false;

window.addEventListener("keydown", (event) => {
	if (event.key == "ArrowUp") {
		up = true;
	}
	if (event.key == "ArrowDown") {
		down = true;
	}
	if (event.key == "ArrowLeft") {
		left = true;
	}
	if (event.key == "ArrowRight") {
		right = true;
	}
});

window.addEventListener("keyup", (event) => {
	if (event.key == "ArrowUp") {
		up = false;
	}
	if (event.key == "ArrowDown") {
		down = false;
	}
	if (event.key == "ArrowLeft") {
		left = false;
	}
	if (event.key == "ArrowRight") {
		right = false;
	}
	if (event.key == "f") {
		if (coolDown == false) {
			var x = mouse.x + (offSet.x - translationOrigin.x);
			var y = mouse.y + (offSet.y - translationOrigin.y);
			var z = 0;

			var times = Date.now();
			var text = prompt("Enter Text For Sign");
			if (text !== null && text !== "" && text.length < 250) {
				socket.emit("mouseDown", createSign(x, y, z, text, 0, 0, 0, times, userName));
			}
		}
		coolDown = true;
		setTimeout(function () {
			coolDown = false;
		}, 5000);
	}
});

setInterval(() => {
	if (up) {
		offSet.y -= moveInter;
		hasChanged = true;
		ctx.translate(0, moveInter);
	}
	if (down) {
		offSet.y += moveInter;
		hasChanged = true;
		ctx.translate(0, 0 - moveInter);
	}
	if (left) {
		offSet.x -= moveInter;
		hasChanged = true;
		ctx.translate(moveInter, 0);
	}
	if (right) {
		offSet.x += moveInter;
		hasChanged = true;
		ctx.translate(0 - moveInter, 0);
	}
}, 0);

setInterval(updateCoords, 20);

//////////////////////////
//end of player handling//
//////////////////////////

/////////////////////
//bullet processing//
/////////////////////

var bullets = [];

socket.on("bullets", (data) => {
	bullets = data;
});



socket.on("bulletDestroyed", (data) => {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data) {
			bullets.splice(i, 1);
			break;
		}
	}
});

socket.on("bulletCreated", (data) => {
	bullets.push(data);
	console.log("test");
});

socket.on("bulletDestroyed", (data) => {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			bullets.splice(i, 1);
		}
	}
});

socket.on("bulletsUpdate", (data) => {
	data.forEach((item) => {
		for (var i = 0; i < bullets.length; i++) {
			if (bullets[i].id == item.id) {
				var test = item;
				bullets[i].x = lerp(bullets[i].x, test.x, 0.1);
				bullets[i].y = lerp(bullets[i].y, test.y, 0.1);
			}
		}
	});
});

function drawaBullets() {
	for (var i = 0; i < bullets.length; i++) {
		ctx.fillStyle = "red";
		ctx.fillRect(bullets[i].x, bullets[i].y, 5, 5);
	}
}

function bulletCollision() {
	for (var i = 0; i < bullets.length; i++) {
		for (var j = 0; j < players.length; j++) {}
	}
}

addEventListener("none", function (event) {
	if (coolDown == false) {
		coolDown = true;
		setTimeout(function () {
			coolDown = false;
		}, coolsTime);

		var dy = mouse.y + offSet.y - (canvas.height / 2 + offSet.y);
		var dx = mouse.x + offSet.x - (canvas.width / 2 + offSet.x);
		var angle = Math.atan2(dy, dx);

		var magnitude = 5.0;
		var BVX = Math.cos(angle) * magnitude;
		var BVY = Math.sin(angle) * magnitude;
		console.log(BVX, BVY);

		var bulletSpeed = 1;
		var bulletYi = 0;
		var bulletId = getID();
		socket.emit("shoot", {
			x: offSet.x,
			y: offSet.y,
			vx: BVX,
			vy: BVY,
			speed: bulletSpeed,
			yi: bulletYi,
			id: bulletId,
			creator: playerID,
		});
	}
});

////////////////////////////
//end of bullet processing//
////////////////////////////

socket.on("playerDied", (data) => {
	console.log(data, playerID)
	if(data == playerID){
		offSet.x = 0
		offSet.y = 0
		//alert("died")
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.translate(translationOrigin.x, translationOrigin.y);
	}
})

function runGame() {
	ctx.clearRect(
		offSet.x - translationOrigin.x,
		offSet.y - translationOrigin.y,
		canvas.width,
		canvas.height,
	);
	drawBackground();
	
	updateCoord();
	for (var i = 0; i < players.length; i++) {
		draw(players[i]);
	}
	renderSigns();
	requestAnimationFrame(runGame);
}

runGame();

}

//enabled()





function submit(){
	var user = document.getElementById("user").value;
	var pass = document.getElementById("pass").value;
	var data = {user: user, pass: pass}

	fetch("/create-account", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: data }),
	})
		.then((res) => res.text())
		.then((text) => {
			text = JSON.parse(text)
			console.log(text)
			if(text.success == true){
				div1.style.display = 'none';
				div2.style.display = 'none';
				loggedIn = true
				userName = text.UserName
				console.log("hmm,", text)
				console.log("accounted,", text.username)

				document.getElementById("colorPicker").style.display = "flex";
				document.getElementById("submitColors").addEventListener("click", function(){
					document.getElementById("colorPicker").style.display = "none";
						var color = document.getElementById("color").value;
						enabled(color)
				})
				//enabled()
			}
			else{
	document.getElementById("signUpError").innerHTML = text.userError + "<br>" + text.passError
			}
		})
		.catch((err) => console.error(err));
}

var div1 = document.getElementById("signUp");
var div2 = document.getElementById("logUp");

var none = "flex"

function switchPage(numb){


	//div1.style.display = "none";
	if (numb == 1){
		div1.style.display = 'none';
		div2.style.display = none;
		console.log(numb)
	}
	if (numb == 2){
		div1.style.display = none;
		div2.style.display = 'none';
	}
}

function submitLog(){
	var user = document.getElementById("userLog").value;
	var pass = document.getElementById("passLog").value;
	var data = {user: user, pass: pass}
	console.log(data)

	fetch("/login-account", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: data }),
	})
		.then((res) => res.text())
		.then((text) => {
			text = JSON.parse(text)
			console.log(text)
			if(text.success == true){
				div1.style.display = 'none';
				div2.style.display = 'none';
				loggedIn = true
				userName = text.UserName
				console.log("hmm,", text)
				console.log("accounted,", text.username)

				document.getElementById("colorPicker").style.display = "flex";
				document.getElementById("submitColors").addEventListener("click", function(){
					var color = document.getElementById("color").value;
					document.getElementById("colorPicker").style.display = "none";

					enabled(color)
				})
			}
			else{
document.getElementById("logUpError").innerHTML = text.message
			}
		})
		.catch((err) => console.error(err));

}

