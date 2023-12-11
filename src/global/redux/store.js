import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();
let middleware;

if (process.env.NODE_ENV === "development") {
  middleware = [createLogger({ collapsed: true }), sagaMiddleware];
} else {
  middleware = [sagaMiddleware];
}
const store = createStore(rootReducer, applyMiddleware(...middleware));
sagaMiddleware.run(rootSaga);

export default store;
