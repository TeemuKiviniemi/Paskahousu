import { useSelector } from "react-redux";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	min-height: 180px;
`;

const Img = styled.img`
	height: 150px;
	width: auto;
	margin: 0px 3px 15px 3px;
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
		<Container>
			{player.deck.map((card, id) => {
				return (
					<Img
						key={id}
						turn={player.turn}
						scale={player.selectedCards.indexOf(card) !== -1 ? "card-scale" : null}
						src={`https://deckofcardsapi.com/static/img/${card.code}.png`}
						alt={card.code}
						onClick={() => selectCardsToPlay(id)}
					/>
				);
			})}
		</Container>
	);
}

export default Hand;
