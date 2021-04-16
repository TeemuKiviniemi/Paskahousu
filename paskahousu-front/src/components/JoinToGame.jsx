import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRoom } from "../reducers/gameReducer";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const InputFrame = styled.div`
	background-color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 10px 0px;
	border-radius: 2px;
	padding: 40px 60px;
	margin-top: 25px;
`;

const JoinButton = styled(Link)`
	margin-top: 15px;
	padding: 6px 15px;
	border: 1px solid darkgray;
	border-radius: 10px;
	text-decoration: none;
	background-color: #fcfaf0;
	color: ${(props) => props.theme.color};
	transition: 0.2s ease;
	&:hover {
		color: #10b981;
		background-color: #fcf9e9;
	}
`;

const StyledP = styled.p`
	color: ${(props) => props.theme.color};
	border-bottom: 1px solid #b5b2b0;
	padding: 2px 4px;
	margin: 6px;
`;

function JoinToGame({ joinGame, setUsername }) {
	const dispatch = useDispatch();

	return (
		<Container>
			<h1 style={{ letterSpacing: "1p" }}>♦️♠️ Welcome to play Paskahousu ♥️♣️</h1>
			<InputFrame>
				<StyledP>Set username and room</StyledP>
				<input
					className="set-username"
					type="text"
					placeholder="Username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input type="text" placeholder="Room" onChange={(e) => dispatch(setRoom(e.target.value))} />
				<JoinButton to="/game" onClick={joinGame}>
					Join Game
				</JoinButton>
			</InputFrame>
		</Container>
	);
}

export default JoinToGame;
