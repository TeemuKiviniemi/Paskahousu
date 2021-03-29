import { Link } from "react-router-dom";

function JoinToGame({ joinGame, handleUsernameChange }) {
	return (
		<div className="set-game-frame">
			<input className="set-username" type="text" onChange={handleUsernameChange} />
			<Link className="link-to-game" to="/game" onClick={joinGame}>
				Join Game
			</Link>
		</div>
	);
}

export default JoinToGame;
