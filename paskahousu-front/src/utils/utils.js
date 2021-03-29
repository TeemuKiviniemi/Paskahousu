// Change card value from text to int
export const returnInt = (text) => {
	if (text === "QUEEN") {
		return 11;
	} else if (text === "KING") {
		return 12;
	} else if (text === "JACK") {
		return 11;
	} else if (text === "ACE") {
		return 1;
	} else {
		return parseInt(text);
	}
};

// Checks if players card can be played
export const checkValidMove = (nextCard, latestCard) => {
	latestCard = returnInt(latestCard);
	nextCard = returnInt(nextCard);

	if (nextCard === 2) {
		return "jatka";
	} else if (latestCard === 2) {
		if (nextCard === 1 || nextCard === 10) {
			return "kaatuu";
		} else {
			return "ok";
		}
	} else if (nextCard === 1 && latestCard >= 10) {
		return "kaatuu";
	} else if (nextCard === 10 && latestCard <= 9) {
		return "kaatuu";
	} else if (nextCard >= 11 && latestCard >= 7) {
		return "ok";
	} else if (nextCard >= latestCard) {
		return "ok";
	} else {
		return "not ok";
	}
};
