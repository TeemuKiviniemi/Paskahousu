const axios = require("axios");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let players = [];
let turn = [];

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
				state.remaining = 49;
				io.to(socket.id).emit("turn", true);
				io.to(socket.id).emit("onStart", { deckId: data.deck_id });
			} else {
				objIndex = turn.findIndex((i) => i.room === state.room);
				state.deckId = turn[objIndex].deckId;
				state.remaining = 46;
				io.to(socket.id).emit("turn", false);
				io.to(socket.id).emit("onStart", { deckId: turn[objIndex].deckId });
			}

			io.to(state.room).emit("players", players);
			io.to(state.room).emit("log", `${username} liittyi peliin`);

			io.to(state.room).emit("updateGame", state);
		}
	});

	socket.on("turn", (data) => {
		roomIndex = turn.findIndex((i) => i.room === data.room);
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
		// console.log(gameState.players);
		// console.log(gameState.remaining);
		io.to(gameState.room).emit("updateGame", gameState);

		gameState.players.forEach((player) => {
			if (player.cards === 0) {
				console.log("WINNER ", player.username);
				io.to(gameState.room).emit("winner", player.username);
			}
		});
	});

	socket.on("disconnect", () => {
		players = players.filter((u) => u.id !== socket.id);

		if (players.length === 0) {
			turn = [];
			log = [];
		}
	});
});

http.listen(4000, () => {
	console.log("listening on *:4000");
});
