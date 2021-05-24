import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import playerReducer from "./reducers/playerReducer";
import gameReducer from "./reducers/gameReducer";
import logReducer from "./reducers/logReducer";

const reducers = combineReducers({
	player: playerReducer,
	game: gameReducer,
	log: logReducer,
});

const store = createStore(reducers, composeWithDevTools());

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);
