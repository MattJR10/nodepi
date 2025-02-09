import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";

let db = new sqlite3.Database("sign.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to sign.db");
});

db.run(
	`CREATE TABLE IF NOT EXISTS signs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	x REAL NOT NULL,
	y REAL NOT NULL,
	z REAL NOT NULL,
	text TEXT NOT NULL,
	rotationx REAL NOT NULL,
	rotationy REAL NOT NULL,
	rotationz REAL NOT NULL,
	time TEXT,
	width REAL NOT NULL,
	height REAL NOT NULL,
	color TEXT NOT NULL,
	creator TEXT NOT NULL
)`,
	(err) => {
		if (err) {
			console.error(err.message);
		}
	},
);



const app = express();
const server = createServer(app);
const io = new Server(server, {
	connectionStateRecovery: {},
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));
app.use(express.static(__dirname + "/stylesheets"));
app.use(express.static(__dirname + "/javascripts"));

var players = [];

var gameChanged = false;

class Player {
	constructor(id, color, name) {
		this.id = id;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.health = 100;
		this.color = color
		this.name = name
	}
}

function addSignDB(
	x,
	y,
	z,
	text,
	rotationx,
	rotationy,
	rotationz,
	creator,
	time,
	width,
	height,
	color,
) {
	db.run(
		`INSERT INTO signs (x, y, z, text, rotationx, rotationy, rotationz, time, width, height, color, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			x,
			y,
			z,
			text,
			rotationx,
			rotationy,
			rotationz,
			time,
			width,
			height,
			color,
			creator
		],
		(err) => {
			if (err) {
				console.error(err.message);
			}
		},
	);
	console.log("Sign Added");
}

function readSignDB() {
	var signs = [];
	db.all(`SELECT * FROM signs`, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			signs.push(row);
		});
		console.log("signs sent");
		io.emit("signs", signs);
		//signs.push("hi");
		console.log(signs);
	});

}

var bullets = [];

class bullet{
	constructor(x, y, vx, vy, yi, r, g, b, id, creator) {
		this.x = x;
		this.y = y;
		this.yi = yi
		this.vx = vx
		this.vy = vy
		this.r = r;
		this.g = g;
		this.used = false;
		this.b = b;
		this.id = id;
		this.creator = creator;
		//console.log(this.id, "object")
		bullets.push(this);
	}
	destroy() {
		this.x = 0;
		this.y = 0;
	}
}

function calcBullets(){
	bullets.forEach(bulleted => {
		bulleted.x = bulleted.x + bulleted.vx
		bulleted.y = bulleted.y + bulleted.vy
	})
}

setInterval(calcBullets, 20)

function createBullet(x, y, vx, vy, speed, yi, id, creator) {
	var color = Math.random() * 255;
	var bulleted = new bullet(x, y, vx, vy, yi, color, color, color, id, creator);
	io.emit("bulletCreated", bulleted);
	setTimeout(function(){
		destroyBullet(id)
	}, 2000)
}

function destroyBullet(id) {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id) {
			io.emit("bulletDestroyed", id)
			bullets.splice(i, 1);
			console.log(i + 'bullert')

			break;
		}
	}
}

//addSignDB(0, 0, 0, "Hello World!", 0, 0, 0, "test", "test")

//readSignDB()

function sendPlayers() {
	io.emit("players", players);
}

function updateBullets() {
	io.emit("bulletsUpdate", bullets);
}

function debug(){
	console.log(bullets.length)
}

//setInterval(debug, 750)

setInterval(updateBullets, 20)

function sendBullets(){
		io.emit("bullets", bullets)
}



//setInterval(sendBullets, 500)

function bulletCollisions(){
	for (var i = 0; i < bullets.length; i++) {
		for (var j = 0; j < players.length; j++) {
			if(bullets[i] !== undefined && players[j] !== undefined){

				if(bullets[i].creator !== players[j].id && bullets[i].used == false){
					if (bullets[i].x > players[j].x - 25 && bullets[i].x < players[j].x + 25 && bullets[i].y > players[j].y - 25 && bullets[i].y < players[j].y + 25) {
						players[j].health -= 10;
							destroyBullet(bullets[i].id)
						console.log(players[j].health)
						if(players[j].health <= 0){
							players[j].health = 100
							players[j].x = 0
							players[j].y = 0
							io.emit("playerDied", players[j].id)
							sendPlayers()
						}
					}
				}
				
				
			}
			
			
		}
	}
}


//setInterval(bulletCollisions, 20)

//block format = [x, y, size]

function cyrb128(str) {
		let h1 = 1779033703, h2 = 3144134277,
				h3 = 1013904242, h4 = 2773480762;
		for (let i = 0, k; i < str.length; i++) {
				k = str.charCodeAt(i);
				h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
				h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
				h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
				h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
		}
		h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
		h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
		h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
		h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
		h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
		return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

var x = 560

var y = -190

function randomseed(x, y){
	var strin = ""+x+y
	var seed = cyrb128(strin)
	return seed[0]+seed[1]+seed[2]+seed[3]
}

function returnNumber(x, y){
	var seed = randomseed(x, y)
	var news = (seed/10000000000)
	if(news > 1){
		news = 1
	}


	news = news * 10
	news = Math.round(news)
	news = news/10
	return news
}

for(var i = 0; i < 100; i++){
	for(var j = 0; j < 100; j++){

		var x = returnNumber(i, j)

		if(x == 0.2){
			//console.log(returnNumber(i, j))
		}
		
		
	}
}

var num = (cyrb128("gigmb"))



var blocks = [];


var structures = [
	[[[1, 1, 1, 1, 1],
	 [1, 0, 0, 0, 1],
	 [1, 0, 0, 0, 0],
	 [1, 0, 0, 0, 1],
	 [1, 1, 1, 1, 1]], 0, 10],
	[[[1, 1, 1],
	 [1, 0, 0],
	 [1, 1, 1]], 11, 100]
];

function getStructureOnChance(x, y){
	var ret = null
	var chance = returnNumber(x, y)*100
	//console.log(returnNumber(x, y))
	//console.log(chance)
	for(var i = 0; i < structures.length; i++){
		if(chance >= structures[i][1] && chance <= structures[i][2]){
			return i
			
		}
	}
	
}

console.log(getStructureOnChance(9864.5, 1866567570))

var structureNum = 10000

function genStructures(){
	
}









io.on("connection", (socket) => {
	console.log("a user connected");

	socket.emit("connecteds", socket.id)
	
	socket.on("mouseDown", (data) => {
		//console.log(data);
		addSignDB(
			data.x,
			data.y,
			data.z,
			data.text,
			data.rotationx,
			data.rotationy,
			data.rotationz,
			data.creator,
			data.time,
			data.width,
			data.height,
			data.color,
		);
		readSignDB();
	});

	socket.on("shoot", (data) => {
		//console.log(data)
		//createBullet()
		createBullet(data.x, data.y, data.vx, data.vy, data.speed, data.yi, data.id, socket.id, data.creator);
		//console.log(data.id, data.creator)
	})

	socket.on("disconnect", () => {
		console.log("user disconnected");
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				players.splice(i, 1);
				sendPlayers();
				break;
			}
		}
	});

	function lerp(a, b, t) {
		return a + (b - a) * t;
	}

	socket.on("updateCoords", (data) => {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				io.emit("updatePlayer", { player: players[i], x: data.x, y: data.y });
				players[i].x = data.x;
				players[i].y = data.y;
				break;
			}
		}
	});

	socket.on("addPlayer", (data) => {
		console.log("player added");
		var newPlayer = new Player(
			socket.id,
			data[1],
			data[0]
		);
		console.log(data)
		players.push(newPlayer);
		gameChanged = true;
		sendPlayers();
		readSignDB();
	});
});


let db1 = new sqlite3.Database("account.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to account.db at " + Date.now());
});

console.log("Established connection to account.db at " + Date.now())

console.log("Attempting to create or load tables...")

db1.run(
	`CREATE TABLE IF NOT EXISTS accounts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user TEXT NOT NULL,
	pass TEXT NOT NULL,
	data TEXT NOT NULL
)`,
	(err) => {
		if (err) {
			console.error(err.message);
		}
	},
);

console.log("Done")

function createAccount(user, pass){
	db1.run(
		`INSERT INTO accounts (user, pass, data) VALUES (?, ?, ?)`,
		[user, pass, "null"],
		(err) => {
			if (err) {
				console.error(err.message);
			}
		},
	);
}

var allowedChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";

//console.log(allowedChar.includes(";"))

function verifyPass(string){
	for (let i = 0; i < string.length; i++){
		if (!allowedChar.includes(string[i])){
			return string[i]
		}
	}
	return true
}

app.post('/create-account', (req, res) => {



	const user = req.body.data.user;
	const pass = req.body.data.pass;
	//console.log(req.body)
	//console.log(user, pass)







	var test = []

	new Promise((resolve, reject) => {
		db1.all("SELECT * FROM accounts", (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})

	.then(rows => {
		console.log(rows);
		var userAvailablity = true
		var passAvailablity = true
		var userMessage = ""
		var passMessage = ""
		rows.forEach(row => {
			if(row.user == user){
				userAvailablity = false
				userMessage = "Username is already in use"
			}
		})
		if(user.length < 5){
			userAvailablity = false
			userMessage = "Username must be at least 5 characters long"
		}
		if(user.length > 18){
			userAvailablity = false
			userMessage = "Username must be less than 18 characters long"
		}
		if(pass.length < 8){
			passAvailablity = false
			passMessage = "Password must be at least 8 characters long"
		}
		if(pass.length > 25){
			passAvailablity = false
			passMessage = "Password must be less than 25 characters long"
		}
		if(verifyPass(user) !== true){
			userAvailablity = false
			passMessage = "Username contains invalid char: " + verifyPass(user)
			//console.log(verifyPass(user), "tests")
			//console.log("bad char", verifyPass(user))
		}
		if(passAvailablity == false || userAvailablity == false){
			console.log({success: false, userError: userMessage, passError: passMessage})
			res.send({success: false, userError: userMessage, passError: passMessage})
		}
		else if(passAvailablity == true && userAvailablity == true){
			console.log(JSON.stringify({success: true, UserName: user, PassWord: pass}))
			res.send(JSON.stringify({success: true, UserName: user, PassWord: pass}))
			createAccount(user, pass);
		}

	})
	.catch(err => {
		console.error("Error fetching data:", err); 
	});

	//console.log(test, "final")

});

app.post('/login-account', (req, res) => {
	var user = req.body.data.user;
	var pass = req.body.data.pass;



	new Promise((resolve, reject) => {
		db1.all("SELECT * FROM accounts WHERE user = ?", [user], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
	.then(rows => {
		if(rows.length < 1){
				res.send(JSON.stringify({success: false, UserName: user, PassWord: pass, message: "Username or password is incorrect"}))
		}

		for(let i = 0; i < rows.length; i++){
			var accountUser = rows[i].user
			var accountPass = rows[i].pass

			if(accountUser == user && accountPass == pass){
				res.send(JSON.stringify({success: true, UserName: user, PassWord: pass}))
			}
			else{
				res.send(JSON.stringify({success: false, UserName: user, PassWord: pass, message: "Username or password is incorrect"}))
			}

		}
	})
	.catch(err => {
		console.error("Error fetching data:", err); 
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});


