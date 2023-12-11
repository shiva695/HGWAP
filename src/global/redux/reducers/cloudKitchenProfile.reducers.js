import actionTypes from "../actionTypes";

const outletDataState = {
  isFetching: false,
  outletData: null,
  outletError: false,
  logout: false,
};

const outletsDataState = {
  isFetching: false,
  outletsData: null,
  outletsError: false,
  logout: false,
};

export const outletReducer = (state = outletDataState, action) => {
  switch (action.type) {
    case actionTypes.OUTLET_GET_REQUEST:
      return { ...state, isFetching: true, outletError: false };
    case actionTypes.OUTLET_GET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        outletData: action.data,
        outletError: false,
      };
    case actionTypes.OUTLET_GET_FAILURE:
      return {
        ...state,
        isFetching: false,
        outletData: action.data,
        outletError: true,
      };
    case actionTypes.USER_LOGOUT:
      return { ...state, logout: true };
    case actionTypes.RESET:
      return outletDataState;
    default:
      return state;
  }
};

export const outletsReducer = (state = outletsDataState, action) => {
  switch (action.type) {
    case actionTypes.OUTLETS_GET_REQUEST:
      return { ...state, isFetching: true, outletsError: false };
    case actionTypes.OUTLETS_GET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        outletsData: action.data,
        outletsError: false,
      };
    case actionTypes.OUTLETS_GET_FAILURE:
      return {
        ...state,
        isFetching: false,
        outletsData: action.data,
        outletsError: true,
      };
    case actionTypes.USER_LOGOUT:
      return { ...state, logout: true };
    case actionTypes.RESET:
      return outletsDataState;
    default:
      return state;
  }
};
