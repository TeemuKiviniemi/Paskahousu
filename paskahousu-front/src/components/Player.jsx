import Hand from "./Hand";
import styled from "styled-components";

const PlayerFrame = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
`;

const Button = styled.button`
	padding: 6px 10px;
	margin: 1px;
	width: 100px;
`;

function Player({ deck, gameLogic, turn, drawRandomCard, selectCardsToPlay, playCards }) {
	return (
		<PlayerFrame>
			<Hand turn={turn} selectCardsToPlay={selectCardsToPlay} deck={deck} playCards={playCards} />
			<Button onClick={() => drawRandomCard(1)} disabled={!turn}>
				Random
			</Button>
			<Button onClick={() => gameLogic()} disabled={!turn}>
				Play cards
			</Button>
		</PlayerFrame>
	);
}

export default Player;
