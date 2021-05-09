import styled from "styled-components";
import OtherPlayers from "./OtherPlayers";
import { useSelector } from "react-redux";

const LatestImg = styled.img`
	height: 150px;
	width: auto;
	margin: 2px;
	margin-top: 15px;
	filter: drop-shadow(0mm 2mm 4mm rgba(0, 0, 0, 0.3));
	cursor: pointer;
	transition: all 200ms;
	&:hover {
		transform: ${(props) => (props.turn ? "scale(1.03)" : null)};
	}
`;

const GameInfo = ({ raiseCardStack, turn }) => {
	const latest = useSelector((state) => state.latestCard);
	const remaining = useSelector((state) => state.remaining);

	return (
		<div className="info-container">
			<h2 className="cards-remaining">Cards remaining: {remaining}</h2>
			<OtherPlayers />
			<LatestImg
				// className="latest-img"
				src={latest.image}
				turn={turn}
				alt=""
				onClick={() => (turn ? raiseCardStack() : null)}
			/>
		</div>
	);
};

export default GameInfo;
