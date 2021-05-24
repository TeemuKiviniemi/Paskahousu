import styled from "styled-components";

const Frame = styled.div`
	height: 100vh;
	width: 100vw;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: rgba(255, 255, 255, 0.15);
	backdrop-filter: blur(5px);
	z-index: 10;
`;
const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: white;
	box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 10px 0px;
	border-radius: 2px;
	padding: 40px 60px;
	color: #fcfaf0;
`;

const StyledH2 = styled.h2`
	color: rgb(60, 60, 60);
`;

const StartNewGame = ({ winner, startNew }) => {
	return (
		<Frame>
			<Container>
				<StyledH2>🥇 Winner is {winner}! 🎉</StyledH2>
				<button onClick={() => startNew()}>Start new Game</button>
			</Container>
		</Frame>
	);
};

export default StartNewGame;
