import actionTypes from "./actionTypes";

export function getUser(params) {
  return {
    type: actionTypes.USER_GET_REQUEST,
    params,
  };
}

export function getChef(params) {
  return {
    type: actionTypes.CHEF_GET_REQUEST,
    params,
  };
}

export function getOutlet(params) {
  return {
    type: actionTypes.OUTLET_GET_REQUEST,
    params,
  };
}

export function getOutlets(params) {
  return {
    type: actionTypes.OUTLETS_GET_REQUEST,
    params,
  };
}

export function loginDrawer(params) {
  return {
    type: actionTypes.LOGIN_DRAWER_REQUEST,
    params,
  };
}

export function getCart(params) {
  return {
    type: actionTypes.CART_GET_REQUEST,
    params,
  };
}

export function userLogout() {
  return {
    type: actionTypes.USER_LOGOUT,
  };
}

export function reset() {
  return {
    type: actionTypes.RESET,
  };
}
