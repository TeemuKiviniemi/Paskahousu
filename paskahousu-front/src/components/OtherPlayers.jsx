import { CgCardDiamonds } from "react-icons/cg";

function OtherPlayers({ gameInfo }) {

    return (
        <div className="other-players">
            <h3>PLAYERS: </h3>

            <ul>
                {gameInfo.map((player, id) => {
                        return <li key={id} className="list-player">{`${player.username}: ${player.cards}`}<CgCardDiamonds /></li>
                    })
                }
            </ul>
        </div>
    );
}

export default OtherPlayers;