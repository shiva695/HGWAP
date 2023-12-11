import { combineReducers } from "redux";
import { userReducer } from "./userProfile.reducers";
import { chefReducer } from "./chefProfile.reducers";
import { outletReducer, outletsReducer } from "./cloudKitchenProfile.reducers";
import { loginDrawerReducer } from "./loginDrawer.reducers";
import { cartReducer } from "./cart.reducers";

const combineReducer = combineReducers({
  userReducer,
  chefReducer,
  outletReducer,
  outletsReducer,
  loginDrawerReducer,
  cartReducer,
});

const rootReducer = (state, action) => {
  return combineReducer(state, action);
};

export default rootReducer;
