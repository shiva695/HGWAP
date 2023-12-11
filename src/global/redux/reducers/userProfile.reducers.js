import actionTypes from "../actionTypes";

const userDataState = {
  isFetching: false,
  userData: null,
  userError: false,
  logout: false,
};

export const userReducer = (state = userDataState, action) => {
  switch (action.type) {
    case actionTypes.USER_GET_REQUEST:
      return { ...state, isFetching: true, userError: false };
    case actionTypes.USER_GET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        userData: action.data,
        userError: false,
      };
    case actionTypes.USER_GET_FAILURE:
      return {
        ...state,
        isFetching: false,
        userData: action.data,
        userError: true,
      };
    case actionTypes.USER_LOGOUT:
      return { ...state, logout: true };
    case actionTypes.RESET:
      return userDataState;
    default:
      return state;
  }
};
