import { RiLightbulbFill, RiLightbulbLine } from "react-icons/ri";
import styled from "styled-components";

const LightButton = styled.button`
	position: fixed;
	right: 10px;
	top: 10px;
	width: 35px;
	height: 35px;
	background-color: transparent;
	border: transparent;
	border-radius: 3px;
	z-index: 11;
	&:hover {
		background-color: rgba(0, 0, 0, 0.15);
	}
`;

const LightbulbLine = styled(RiLightbulbLine)`
	color: lightgray;
`;

const LightSwitch = ({ theme, setTheme }) => {
	return <LightButton onClick={() => setTheme(!theme)}>{theme ? <RiLightbulbFill /> : <LightbulbLine />}</LightButton>;
};

export default LightSwitch;
