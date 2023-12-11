import { call, put } from "redux-saga/effects";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import actionTypes from "../actionTypes";

export const getUserSaga = function* (action) {
  let { id } = action.params;

  let params = {
    id,
  };

  const response = yield call(
    invokeApi,
    config.apiDomains.userService + apiList.getUser,
    params,
    action.params.cookies
  );

  if (response.status >= 200 && response.status < 300) {
    if (response.data.responseCode === "200") {
      yield put({
        type: actionTypes.USER_GET_SUCCESS,
        data: response.data,
      });
    } else {
      yield put({
        type: actionTypes.USER_GET_FAILURE,
        data: response.data,
      });
    }
  } else if (response.status === 401) {
    yield put({
      type: actionTypes.USER_LOGOUT,
    });
  } else {
    yield put({
      type: actionTypes.USER_GET_FAILURE,
    });
  }
};
