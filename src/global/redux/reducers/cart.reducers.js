import actionTypes from "../actionTypes";

const cartState = {
  isFetching: false,
  cartData: null,
  cartError: false,
  logout: false,
};

export const cartReducer = (state = cartState, action) => {
  switch (action.type) {
    case actionTypes.CART_GET_REQUEST:
      return { ...state, isFetching: true, cartError: false };
    case actionTypes.CART_GET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        cartData: action.data,
        cartError: false,
      };
    case actionTypes.CART_GET_FAILURE:
      return {
        ...state,
        isFetching: false,
        cartData: action.data,
        cartError: true,
      };
    case actionTypes.USER_LOGOUT:
      return { ...state, logout: true };
    case actionTypes.RESET:
      return cartState;
    default:
      return state;
  }
};
