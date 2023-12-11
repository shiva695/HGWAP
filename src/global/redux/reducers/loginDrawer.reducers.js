import actionTypes from "../actionTypes";

const loginDrawerState = {
  loginState: false,
};

export const loginDrawerReducer = (state = loginDrawerState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_DRAWER_REQUEST:
      return { ...state, loginState: action.params };
    default:
      return state;
  }
};
