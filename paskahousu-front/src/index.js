import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import playerReducer from "./reducers/playerReducer";
import gameReducer from "./reducers/gameReducer";

const reducers = combineReducers({
	player: playerReducer,
	game: gameReducer,
});

const store = createStore(reducers);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);
