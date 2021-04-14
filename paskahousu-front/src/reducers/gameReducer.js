const initialState = {
	room: null,
	deckId: null,
	players: [],
	remaining: 52,
	latestCard: {
		image: "https://deckofcardsapi.com/static/img/X2.png",
		value: 0,
		code: 0,
	},
	stack: [],
};

const gameReducer = (state = initialState, action) => {
	console.log("ACTION", action.type, action.data);
	switch (action.type) {
		case "UPDATE_STATE":
			return action.data;
		case "UPDATE_STACK": {
			let newState = state;
			action.data.length > 0 ? (newState.stack = [...action.data, ...state.stack]) : (newState.stack = []);
			return newState;
		}
		case "UPDATE_LATEST": {
			let newState = state;
			newState.latestCard = action.data;
			return newState;
		}
		case "UPDATE_AMOUNT": {
			let newState = state;
			newState.players.map((player) => {
				if (player.username === action.user) {
					player.cards = action.data;
				}
			});
			return newState;
		}
		case "SET_ROOM": {
			let newState = state;
			newState.room = action.data;
			return newState;
		}
		case "SET_DECKID": {
			let newState = state;
			newState.deckId = action.data;
			return newState;
		}
		case "UPDATE_REMAINIG": {
			let newState = state;
			newState.remaining = action.data;
			return newState;
		}
		default:
			return state;
	}
};

export const updateState = (newState) => {
	return {
		type: "UPDATE_STATE",
		data: newState,
	};
};

export const updateStack = (cards) => {
	return {
		type: "UPDATE_STACK",
		data: cards,
	};
};

export const updateLatest = (card) => {
	return {
		type: "UPDATE_LATEST",
		data: card,
	};
};

export const updateCardAmount = (amount, username) => {
	return {
		type: "UPDATE_AMOUNT",
		data: amount,
		user: username,
	};
};

export const setRoom = (roomName) => {
	return {
		type: "SET_ROOM",
		data: roomName,
	};
};

export const setDeckId = (deckId) => {
	return {
		type: "SET_DECKID",
		data: deckId,
	};
};

export const updateRemaining = (amount) => {
	return {
		type: "UPDATE_REMAINIG",
		data: amount,
	};
};

export default gameReducer;
