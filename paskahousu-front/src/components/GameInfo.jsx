import styled from "styled-components";
import OtherPlayers from "./OtherPlayers";
import { useSelector } from "react-redux";

const LatestImg = styled.img`
	height: 150px;
	width: auto;
	margin: 2px;
	margin-top: 15px;
	filter: ${(props) => props.theme.dropShadow};
	cursor: pointer;
	transition: all 200ms;
	&:hover {
		transform: ${(props) => (props.turn ? "scale(1.03)" : null)};
	}
`;

const GameInfo = ({ raiseCardStack }) => {
	const latest = useSelector((state) => state.game.latestCard);
	const remaining = useSelector((state) => state.game.remaining);
	const turn = useSelector((state) => state.player.turn);

	return (
		<div className="info-container">
			<h2 className="cards-remaining">Cards remaining: {remaining}</h2>
			<OtherPlayers />

			<LatestImg src={latest.image} turn={turn} alt="" onClick={() => (turn ? raiseCardStack() : null)} />
		</div>
	);
};

export default GameInfo;
