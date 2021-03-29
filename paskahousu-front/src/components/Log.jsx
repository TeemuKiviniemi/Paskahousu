
function Log( {log} ) {

    return (
        <div className="log-frame">
            <ul>
                {log.map((item, id) => {
                    return <li key={id} className="li-log">{item}</li>
                })
                }
            </ul>
        </div>
    );
}

export default Log;