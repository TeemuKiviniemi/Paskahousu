const initialState = {
	deck: [],
	username: undefined,
	turn: false,
	selectedCards: [],
};

const playerReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_USERNAME": {
			return { ...state, username: action.username };
		}
		case "SET_TURN": {
			return { ...state, turn: action.turn };
		}
		case "SET_SELECTED_CARDS":
			const card = action.card;

			// unselect card
			if (state.selectedCards.indexOf(card) !== -1) {
				const cards = state.selectedCards.filter((item) => item !== card);
				return { ...state, selectedCards: cards };
			}
			// setSelectedCards empty
			else if (!action.card) {
				return { ...state, selectedCards: [] };
			}
			// add new card to selected cards
			else {
				return { ...state, selectedCards: [...state.selectedCards, card] };
			}
		case "SET_DECK":
			action.cards.sort((a, b) => {
				return a.value - b.value;
			});
			return { ...state, deck: action.cards };

		default:
			return state;
	}
};

export const setUsername = (username) => {
	return {
		type: "SET_USERNAME",
		username,
	};
};

export const setTurn = (turn) => {
	return {
		type: "SET_TURN",
		turn,
	};
};

export const setSelectedCards = (card) => {
	return {
		type: "SET_SELECTED_CARDS",
		card,
	};
};

export const setDeck = (cards) => {
	return {
		type: "SET_DECK",
		cards,
	};
};

export default playerReducer;
