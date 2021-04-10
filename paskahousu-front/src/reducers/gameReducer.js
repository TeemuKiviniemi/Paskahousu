const initialState = {
	room: undefined,
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
			console.log("Stack", newState);
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
	console.log(amount);
	return {
		type: "UPDATE_AMOUNT",
		data: amount,
		user: username,
	};
};

export default gameReducer;
