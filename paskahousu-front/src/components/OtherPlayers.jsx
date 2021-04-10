import { CgCardDiamonds } from "react-icons/cg";
import { useSelector } from "react-redux";

function OtherPlayers() {
	const otherPlayers = useSelector((state) => state.players);

	return (
		<div className="other-players">
			<h3>PLAYERS: </h3>
			<ul>
				{otherPlayers.map((player, id) => {
					return (
						<li key={id} className="list-player">
							{`${player.username}: ${player.cards}`}
							<CgCardDiamonds />
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default OtherPlayers;
