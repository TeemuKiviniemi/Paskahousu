import styled from "styled-components";
import { CgCardDiamonds } from "react-icons/cg";
import { useSelector } from "react-redux";

const StyledUl = styled.div`
	min-width: max-content;
`;
const StyledH3 = styled.h3`
	letter-spacing: 1px;
`;

function OtherPlayers() {
	const otherPlayers = useSelector((state) => state.game.players);

	return (
		<div className="other-players">
			<StyledH3>PLAYERS: </StyledH3>
			<StyledUl>
				{otherPlayers.map((player, id) => {
					return (
						<li key={id} className="list-player">
							{`${player.username}: ${player.cards}`}
							<CgCardDiamonds />
						</li>
					);
				})}
			</StyledUl>
		</div>
	);
}

export default OtherPlayers;
