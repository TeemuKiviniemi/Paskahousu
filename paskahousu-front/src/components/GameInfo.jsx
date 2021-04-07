import OtherPlayers from "./OtherPlayers";

const GameInfo = ({ remaining, gameInfo, latestCard, raiseCardStack }) => {
	return (
		<div className="info-container">
			<h2>Cards remaining: {remaining}</h2>
			<div className="container">
				<OtherPlayers gameInfo={gameInfo} />
				<img className="latest-img" src={latestCard.image} alt="" onClick={() => raiseCardStack()} />
			</div>
		</div>
	);
};

export default GameInfo;
