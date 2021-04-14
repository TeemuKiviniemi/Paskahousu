import OtherPlayers from "./OtherPlayers";
import { useSelector } from "react-redux";

const GameInfo = ({ gameInfo, raiseCardStack }) => {
	const latest = useSelector((state) => state.latestCard);
	const remaining = useSelector((state) => state.remaining);

	return (
		<div className="info-container">
			<h2 className="cards-remaining">Cards remaining: {remaining}</h2>
			<OtherPlayers gameInfo={gameInfo} />
			<img className="latest-img" src={latest.image} alt="" onClick={() => raiseCardStack()} />
		</div>
	);
};

export default GameInfo;
