const logReducer = (state = [], action) => {
	switch (action.type) {
		case "ADD_EVENT":
			return [action.data, ...state];
		default:
			return state;
	}
};

export const addEvent = (event) => {
	return {
		type: "ADD_EVENT",
		data: event,
	};
};

export default logReducer;
