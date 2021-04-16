import styled from "styled-components";

const Img = styled.img`
	height: 150px;
	width: auto;
	margin: 2px;
	margin-top: 15px;
	filter: drop-shadow(0mm 2mm 4mm rgba(0, 0, 0, 0.3));
	cursor: pointer;
	transition: all 200ms;
	filter: ${(props) => (!props.turn ? "brightness(0.85)" : null)};
	transform: ${(props) => (props.scale ? "translateY(-6px)" : null)};
	&:hover {
		transform: translateY(-6px);
	}
`;

function Hand({ deck, selectCardsToPlay, turn, playCards }) {
	return (
		<div className="deck">
			{deck.map((card, id) => {
				return (
					<Img
						key={id}
						turn={turn}
						scale={playCards.indexOf(card) !== -1 ? "card-scale" : null}
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
