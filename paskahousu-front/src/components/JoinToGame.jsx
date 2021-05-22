import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRoom } from "../reducers/gameReducer";
import { setUsername } from "../reducers/playerReducer";
import { CgPushChevronUpR } from "react-icons/cg";

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: grid;
	grid-template-rows: 30% 40% 30%;
	justify-items: center;
	align-items: center;
`;

const InputFrame = styled.div`
	grid-row-start: 2;
	background-color: white;
	height: min-content;
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
	grid-row-start: 1;
	align-self: flex-end;
	letter-spacing: 1px;
`;

function JoinToGame({ joinGame }) {
	const dispatch = useDispatch();

	return (
		<Container>
			<StyledH1>♦️♠️ Welcome to play Paskahousu ♥️♣️</StyledH1>
			<InputFrame>
				<StyledP>Set username and room</StyledP>
				<input
					className="set-username"
					type="text"
					placeholder="Username"
					onChange={(e) => dispatch(setUsername(e.target.value))}
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
