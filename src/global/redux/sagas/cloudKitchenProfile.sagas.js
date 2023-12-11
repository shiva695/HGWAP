import { call, put } from "redux-saga/effects";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import actionTypes from "../actionTypes";

export const getOutletSaga = function* (action) {
  let { id } = action.params;
  let params = {
    id,
  };

  const response = yield call(
    invokeApi,
    config.apiDomains.chefService + apiList.getCloudKitchenOutlet,
    params,
    action.params.cookies
  );

  if (response.status >= 200 && response.status < 300) {
    if (response.data.responseCode === "200") {
      yield put({
        type: actionTypes.OUTLET_GET_SUCCESS,
        data: response.data,
      });
    } else {
      yield put({
        type: actionTypes.OUTLET_GET_FAILURE,
        data: response.data,
      });
    }
  } else if (response.status === 401) {
    yield put({
      type: actionTypes.USER_LOGOUT,
    });
  } else {
    yield put({
      type: actionTypes.OUTLET_GET_FAILURE,
    });
  }
};

export const getOutletsSaga = function* (action) {
  const response = yield call(
    invokeApi,
    config.apiDomains.chefService + apiList.getCloudKitchenOutlets,
    {},
    action.params.cookies
  );

  if (response.status >= 200 && response.status < 300) {
    if (response.data.responseCode === "200") {
      yield put({
        type: actionTypes.OUTLETS_GET_SUCCESS,
        data: response.data,
      });
    } else {
      yield put({
        type: actionTypes.OUTLETS_GET_FAILURE,
        data: response.data,
      });
    }
  } else if (response.status === 401) {
    yield put({
      type: actionTypes.USER_LOGOUT,
    });
  } else {
    yield put({
      type: actionTypes.OUTLETS_GET_FAILURE,
    });
  }
};
