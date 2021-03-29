import { useState } from 'react'
import { Link } from "react-router-dom";

function SetGame({ joinGame, handleChange }) {

    return (
        <div className="set-game-frame">
            
            
            <input className="set-username" type="text" onChange={handleChange}/>
            <Link className="link-to-game" to="/game" onClick={joinGame}>Join Game</Link>
        </div>
    );
}

export default SetGame;
