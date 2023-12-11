import { call, put } from "redux-saga/effects";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import actionTypes from "../actionTypes";

export const getChefSaga = function* (action) {
  let { id: userId } = action.params;

  let params = {
    userId,
  };

  const response = yield call(
    invokeApi,
    config.apiDomains.chefService + apiList.getHomeChef,
    params,
    action.params.cookies
  );

  if (response.status >= 200 && response.status < 300) {
    if (response.data.responseCode === "200") {
      yield put({
        type: actionTypes.CHEF_GET_SUCCESS,
        data: response.data,
      });
    } else {
      yield put({
        type: actionTypes.CHEF_GET_FAILURE,
        data: response.data,
      });
    }
  } else if (response.status === 401) {
    yield put({
      type: actionTypes.USER_LOGOUT,
    });
  } else {
    yield put({
      type: actionTypes.CHEF_GET_FAILURE,
    });
  }
};
