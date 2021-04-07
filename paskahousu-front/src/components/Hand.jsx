function Hand({ deck, selectCardsToPlay, turn, playCards }) {
	return (
		<div className="deck">
			{deck.map((card, id) => {
				return (
					<img
						key={id}
						className={`card-img ${!turn ? "dim-card" : null} ${playCards.indexOf(card) !== -1 ? "card-scale" : null}`}
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
