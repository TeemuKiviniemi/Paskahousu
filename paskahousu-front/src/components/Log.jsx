import styled from "styled-components";

const LogContainer = styled.div`
	width: 250px;
	position: absolute;
	left: 0;
	padding-left: 15px;
	top: 10px;
	font-size: 14px;
	-webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
	mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
`;

const StyledH4 = styled.h4`
	margin-bottom: 4px;
	padding: 0;
`;

const List = styled.ul`
	height: 200px;
	overflow: scroll;
`;

function Log({ log, room }) {
	return (
		<LogContainer>
			<StyledH4>{room}</StyledH4>
			<List>
				{log.map((item, id) => {
					return <li key={id}>{item}</li>;
				})}
			</List>
		</LogContainer>
	);
}

export default Log;
