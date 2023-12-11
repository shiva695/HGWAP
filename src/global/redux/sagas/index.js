import { all, takeEvery } from "redux-saga/effects";
import actionTypes from "../actionTypes";
import { getUserSaga } from "./userProfile.sagas";
import { getChefSaga } from "./chefProfile.sagas";
import { getOutletSaga, getOutletsSaga } from "./cloudKitchenProfile.sagas";
import { getCartSaga } from "./cart.sagas";

export default function* rootSaga() {
  yield all([takeEvery(actionTypes.USER_GET_REQUEST, getUserSaga)]);
  yield all([takeEvery(actionTypes.CHEF_GET_REQUEST, getChefSaga)]);
  yield all([takeEvery(actionTypes.OUTLET_GET_REQUEST, getOutletSaga)]);
  yield all([takeEvery(actionTypes.OUTLETS_GET_REQUEST, getOutletsSaga)]);
  yield all([takeEvery(actionTypes.CART_GET_REQUEST, getCartSaga)]);
}

// import { all, fork } from "redux-saga/effects";
// import * as authSagas from "./auth/sagas";
// import * as mainSagas from "./main/sagas";

// export default function* rootSaga() {
//   yield all(
//     [...Object.values(authSagas), ...Object.values(mainSagas)].map(fork)
//   );
// }
