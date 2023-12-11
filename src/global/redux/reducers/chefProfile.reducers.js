import actionTypes from "../actionTypes";

const chefDataState = {
  isFetching: false,
  chefData: null,
  chefError: false,
  logout: false,
};

export const chefReducer = (state = chefDataState, action) => {
  switch (action.type) {
    case actionTypes.CHEF_GET_REQUEST:
      return { ...state, isFetching: true, chefError: false };
    case actionTypes.CHEF_GET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        chefData: action.data,
        chefError: false,
      };
    case actionTypes.CHEF_GET_FAILURE:
      return {
        ...state,
        isFetching: false,
        chefData: action.data,
        chefError: true,
      };
    case actionTypes.USER_LOGOUT:
      return { ...state, logout: true };
    case actionTypes.RESET:
      return chefDataState;
    default:
      return state;
  }
};
