const axios = require("axios");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let players = [];
let turn = [];
let log = [];

io.on("connection", (socket) => {
	socket.on("join_game", async (data) => {
		let username = data.username;
		let state = data.gameState;
		// console.log("STATE", state);

		if (username !== null && state.room !== null) {
			socket.join(state.room);

			const user = {
				id: socket.id,
				username,
				cards: 3,
				turnNum: undefined,
				room: state.room,
			};

			const playersInRoom = players.filter((player) => player.room === state.room);
			user.turnNum = playersInRoom.length;
			state.players = [...playersInRoom, user];
			players.push(user);

			io.emit("players", players);
			if (user.turnNum === 0) {
				const { data } = await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
				turn.push({ room: state.room, turn: 0, deckId: data.deck_id });
				state.deckId = data.deck_id;
				io.to(socket.id).emit("turn", true);
				io.to(socket.id).emit("onStart", { startGame: true, deckId: data.deck_id });
			} else {
				objIndex = turn.findIndex((i) => i.room === state.room);
				state.deckId = turn[objIndex].deckId;
				io.to(socket.id).emit("turn", false);
				io.to(socket.id).emit("onStart", { startGame: false, deckId: turn[objIndex].deckId });
			}

			io.to(state.room).emit("players", players);
			io.to(state.room).emit("log", `${username} liittyi peliin`);
			// console.log(user);

			io.to(state.room).emit("updateGame", state);
		}
	});

	socket.on("turn", (data) => {
		roomIndex = turn.findIndex((i) => i.room === data.room);
		console.log(data);
		turn[roomIndex].turn === data.playerAmount - 1 ? (turn[roomIndex].turn = 0) : (turn[roomIndex].turn += 1);

		playersInRoom = players.filter((p) => p.room === data.room);
		playersInRoom.forEach((player) => {
			if (player.turnNum === turn[roomIndex].turn) {
				io.to(player.id).emit("turn", true);
			} else {
				io.to(player.id).emit("turn", false);
			}
		});
	});

	socket.on("log", (data) => {
		io.to(data.room).emit("log", data.text);
	});

	socket.on("updateGame", (gameState) => {
		// console.log("UPDATE", gameState);
		io.to(gameState.room).emit("updateGame", gameState);
	});

	socket.on("disconnect", () => {
		players = players.filter((u) => u.id !== socket.id);
		// console.log(players);

		if (players.length === 0) {
			turn = [];
			log = [];
		}
	});
});

http.listen(4000, () => {
	console.log("listening on *:4000");
});
