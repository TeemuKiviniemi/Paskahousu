const { Deck } = require("./deck");
const axios = require("axios");
const { get } = require("http");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

let players = [];
let game = [];
let decks = {};

io.on("connection", (socket) => {
	socket.on("join_game", async (data) => {
		let username = data.username;
		let state = data.gameState;
		console.log("JOIN", data.username, data.gameState.room);

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

			if (user.turnNum === 0) {
				const newDeck = new Deck();
				decks[newDeck.deckId] = newDeck;
				console.log(decks);
				game.push({ room: state.room, turn: 0, deckId: newDeck.deckId });
				state.deckId = newDeck.deckId;
				state.remaining = 49;
				io.to(socket.id).emit("turn", true);
				io.to(socket.id).emit("onStart", newDeck.deckId);
			} else {
				gameIndex = game.findIndex((i) => i.room === state.room);
				state.deckId = game[gameIndex].deckId;
				state.remaining = 52 - (playersInRoom.length + 1) * 3;
				io.to(socket.id).emit("turn", false);
				io.to(socket.id).emit("onStart", game[gameIndex].deckId);
			}

			io.to(state.room).emit("log", `${username} liittyi peliin`);

			io.to(state.room).emit("updateGame", state);
		}
	});

	socket.on("turn", (data) => {
		roomIndex = game.findIndex((i) => i.room === data.room);
		game[roomIndex].turn === data.playerAmount - 1 ? (game[roomIndex].turn = 0) : (game[roomIndex].turn += 1);

		playersInRoom = players.filter((p) => p.room === data.room);
		playersInRoom.forEach((player) => {
			if (player.turnNum === game[roomIndex].turn) {
				io.to(player.id).emit("turn", true);
			} else {
				io.to(player.id).emit("turn", false);
			}
		});
	});

	socket.on("log", (data) => {
		io.to(data.room).emit("log", data.text);
	});

	socket.on("updateGame", async (gameState) => {
		io.to(gameState.room).emit("updateGame", gameState);

		// checks if someone won and send name to room
		gameState.players.forEach((player) => {
			if (player.cards === 0) {
				io.to(gameState.room).emit("winner", player.username);
				// axios.get(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/shuffle/`);
			}
		});
	});

	socket.on("start_game", (room) => {
		console.log("START GAME");
		io.to(room).emit("start_game", true);
	});

	socket.on("startNew", (oldState) => {
		const startPlayers = oldState.players.map((player) => {
			return { ...player, cards: 3 };
		});

		decks[oldState.deckId].loadNewCards();

		const startState = {
			room: oldState.room,
			deckId: oldState.deckId,
			players: startPlayers,
			remaining: 52 - oldState.players.length * 3,
			latestCard: {
				value: 0,
				code: "X2",
			},
			stack: [],
		};

		io.to(oldState.room).emit("startNew", startState);
	});

	socket.on("disconnect", () => {
		const user = players.find((u) => u.id === socket.id);
		if (user) {
			console.log(`DISCONNECT ${user.username}`);
			io.to(user.room).emit("log", `${user.username} disconnected from game`);
		}

		players = players.filter((u) => u.id !== socket.id);
		if (players.length === 0) {
			game = [];
		}
	});
});

app.get("/card/:deckId/:amount/", (req, res) => {
	const amount = Number(req.params.amount);
	const deckId = Number(req.params.deckId);
	res.json(decks[deckId].getAndPop(amount));
});

http.listen(4000, () => {
	console.log("listening on *:4000");
});
