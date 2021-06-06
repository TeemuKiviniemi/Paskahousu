import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setRoom } from "../reducers/gameReducer";
import { setUsername } from "../reducers/playerReducer";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-items: center;
	align-items: center;
`;

const Frame = styled.div`
	background-color: white;
	height: min-content;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 10px 0px;
	border-radius: 2px;
	padding: 40px 10px;
	min-width: 315px;
	margin-top: 25px;
`;

const Button = styled.button`
	margin-top: 15px;
	padding: 6px 15px;
	border: 1px solid darkgray;
	border-radius: 4px;
	text-decoration: none;
	background-color: #fcfaf0;
	color: rgb(60, 60, 60);
	transition: 0.2s ease;
	&:hover {
		background-color: #d3d3d3;
	}
`;

const StyledP = styled.p`
	color: rgb(60, 60, 60);
	border-bottom: 1px solid #b5b2b0;
	padding: 2px 4px;
	margin: 6px;
`;

const StyledH1 = styled.h1`
	letter-spacing: 1px;
`;

const FooterText = styled.p`
	position: absolute;
	bottom: 10px;
	left: 10px;
	font-size: 14px;
`;

const Span = styled.span`
	font-weight: 600;
`;

const Li = styled.li`
	color: rgb(60, 60, 60);
`;

function JoinToGame({ joinGame, startGame }) {
	const dispatch = useDispatch();
	const game = useSelector((state) => state.game);
	const turn = useSelector((state) => state.player.turn);

	console.log(game);
	return (
		<Container>
			<StyledH1>♦️♠️ Paskahousu ♥️♣️</StyledH1>

			{game.players.length === 0 ? (
				<Frame>
					<StyledP>Set username and room</StyledP>
					<input
						className="set-username"
						type="text"
						placeholder="Username"
						onChange={(e) => dispatch(setUsername(e.target.value))}
					/>
					<input type="text" placeholder="Room" onChange={(e) => dispatch(setRoom(e.target.value))} />
					<Button onClick={() => joinGame()}>Join Game</Button>
				</Frame>
			) : (
				<Frame>
					<StyledP>
						Players in <Span>{game.room}</Span>
					</StyledP>
					<ul>
						{game.players.map((player) => {
							return <Li key={player.username}>{player.username}</Li>;
						})}
					</ul>
					<br />
					{turn ? <Button onClick={() => startGame()}>Start</Button> : <p>Waiting for host to start game</p>}
				</Frame>
			)}
		</Container>
	);
}

export default JoinToGame;
