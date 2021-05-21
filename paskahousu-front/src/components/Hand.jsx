import { useSelector } from "react-redux";
import styled from "styled-components";

const Img = styled.img`
	height: 150px;
	width: auto;
	margin: 2px;
	margin-top: 15px;
	filter: ${(props) => props.theme.dropShadow};
	cursor: pointer;
	transition: all 200ms;
	filter: ${(props) => (!props.turn ? "brightness(0.85)" : null)};
	transform: ${(props) => (props.scale && props.turn ? "translateY(-6px)" : null)};
	&:hover {
		transform: ${(props) => (props.turn ? "translateY(-6px)" : null)};
	}
`;

function Hand({ selectCardsToPlay }) {
	const player = useSelector((state) => state.player);

	return (
		<div className="deck">
			{player.deck.map((card, id) => {
				return (
					<Img
						key={id}
						turn={player.turn}
						scale={player.selectedCards.indexOf(card) !== -1 ? "card-scale" : null}
						src={card.image}
						alt=""
						onClick={() => selectCardsToPlay(id)}
					/>
				);
			})}
		</div>
	);
}

export default Hand;
