import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setRoom } from "../reducers/gameReducer";

function JoinToGame({ joinGame, setUsername, username }) {
	const players = useSelector((state) => state.players);
	const dispatch = useDispatch();

	return (
		<div className="set-game-frame">
			<div>{username}</div>
			<input
				className="set-username"
				type="text"
				placeholder="Username"
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input type="text" placeholder="Room" onChange={(e) => dispatch(setRoom(e.target.value))} />
			<Link className="link-to-game" to="/game" onClick={joinGame}>
				Join Game
			</Link>
		</div>
	);
}

export default JoinToGame;
