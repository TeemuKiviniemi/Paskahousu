const initialState = {
	deck: [],
	username: undefined,
	turn: false,
	selectedCards: [],
};

const playerReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_USERNAME": {
			return { ...state, username: action.data };
		}
		case "SET_TURN": {
			return { ...state, turn: action.data };
		}
		case "SET_SELECTED_CARDS":
			const card = action.data;

			// unselect card
			if (state.selectedCards.indexOf(card) !== -1) {
				const cards = state.selectedCards.filter((item) => item !== card);
				return { ...state, selectedCards: cards };
			}
			// setSelectedCards empty
			else if (!action.data) {
				return { ...state, selectedCards: [] };
			}
			// add new card to selected cards
			else {
				return { ...state, selectedCards: [...state.selectedCards, card] };
			}

		default:
			return state;
	}
};

export const setUsername = (username) => {
	return {
		type: "SET_USERNAME",
		data: username,
	};
};

export const setTurn = (turn) => {
	return {
		type: "SET_TURN",
		data: turn,
	};
};

export const setSelectedCards = (card) => {
	return {
		type: "SET_SELECTED_CARDS",
		data: card,
	};
};

export default playerReducer;
