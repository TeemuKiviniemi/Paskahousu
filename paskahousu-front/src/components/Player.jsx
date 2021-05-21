import { useSelector } from "react-redux";
import Hand from "./Hand";
import styled from "styled-components";

const PlayerFrame = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
`;

const Button = styled.button`
	z-index: 3;
	padding: 6px 10px;
	margin: 1px;
	width: 100px;
	cursor: pointer;
`;

function Player({ gameLogic, drawRandomCard, selectCardsToPlay }) {
	const player = useSelector((state) => state.player);

	return (
		<PlayerFrame>
			<Hand selectCardsToPlay={selectCardsToPlay} />
			<Button onClick={() => drawRandomCard(1)} disabled={!player.turn}>
				Random
			</Button>
			<Button onClick={() => gameLogic()} disabled={!player.turn}>
				Play cards
			</Button>
		</PlayerFrame>
	);
}

export default Player;
