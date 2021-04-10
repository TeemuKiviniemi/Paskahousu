const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let players = [];
let cardsInStack = [];
let turn = 0;
let log = [];

io.on("connection", (socket) => {
	socket.on("join_game", (data) => {
		let username = data.username;
		let state = data.gameState;
		console.log("STATE", state);

		if (username !== null) {
			const user = {
				id: socket.id,
				username,
				cards: 3,
				turnNum: undefined,
			};
			user.turnNum = players.length;

			io.emit("players", players);
			if (user.turnNum === 0) {
				io.to(socket.id).emit("turn", true);
				io.to(socket.id).emit("onStart", true);
			} else {
				io.to(socket.id).emit("turn", false);
				io.to(socket.id).emit("onStart", false);
			}
			log.unshift(`${username} liittyi peliin`);
			players.push(user);
			io.emit("players", players);
			io.emit("log", log);
			console.log(user);

			state.players = players;
			io.emit("updateGame", state);
		}
	});

	socket.on("turn", (next) => {
		turn === players.length - 1 ? (turn = 0) : (turn += 1);
		players.map((player) => {
			if (player.turnNum === turn) {
				io.to(player.id).emit("turn", true);
			} else {
				io.to(player.id).emit("turn", false);
			}
		});
	});

	socket.on("log", (item) => {
		log.unshift(item);
		io.emit("log", log);
	});

	socket.on("updateGame", (gameState) => {
		console.log("UPDATE", gameState);
		io.emit("updateGame", gameState);
	});

	socket.on("disconnect", () => {
		players = players.filter((u) => u.id !== socket.id);
		socket.emit("players", players);
		console.log(players);

		if (players.length === 0) {
			cardsInStack = [];
			turn = 0;
			log = [];
		}
	});
});

http.listen(4000, () => {
	console.log("listening on *:4000");
});
