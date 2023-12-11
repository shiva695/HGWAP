import { call, put } from "redux-saga/effects";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import actionTypes from "../actionTypes";

export const getCartSaga = function* (action) {
  // let { id: userId } = action.params;
  let params = {
    
  };

  const response = yield call(
    invokeApi,
    config.apiDomains.orderService + apiList.getCart,
    params,
    action.params.cookies
  );

  if (response.status >= 200 && response.status < 300) {
    if (response.data.responseCode === "200") {
      yield put({
        type: actionTypes.CART_GET_SUCCESS,
        data: JSON.parse(response.data.cartData),
      });
    } else {
      yield put({
        type: actionTypes.CART_GET_FAILURE,
        data: response.data,
      });
    }
  } else if (response.status === 401) {
    yield put({
      type: actionTypes.USER_LOGOUT,
    });
  } else {
    yield put({
      type: actionTypes.CART_GET_FAILURE,
    });
  }
};
