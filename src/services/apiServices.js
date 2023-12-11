import axios from "axios";
import { config } from "../config/config";

export const invokeApi = async (url, params, cookies) => {
  try {
    let headers = {
      "Content-Type": "application/json",
    };
    if (
      cookies &&
      cookies[config.cookieName] &&
      cookies[config.cookieName].token &&
      cookies[config.cookieName].loginUserId
    ) {
      headers.Authorization = "Bearer " + cookies[config.cookieName].token;
      headers.loginUserId = cookies[config.cookieName].loginUserId;
    }
    if (
      cookies &&
      cookies[config.sessionCookie] &&
      cookies[config.sessionCookie].sessionId
    ) {
      headers.sessionId = cookies[config.sessionCookie].sessionId;
    }
    return await axios.post(url, params, { headers: headers });
  } catch ({ response }) {
    return response;
  }
};

export const invokeFormDataApi = async (url, formData, cookies) => {
  try {
    let headers = {
      "Content-Type": "multipart/form-data",
    };
    if (
      cookies &&
      cookies[config.cookieName] &&
      cookies[config.cookieName].token &&
      cookies[config.cookieName].loginUserId
    ) {
      headers.Authorization = "Bearer " + cookies[config.cookieName].token;
      headers.loginUserId = cookies[config.cookieName].loginUserId;
    }
    if (
      cookies &&
      cookies[config.sessionCookie] &&
      cookies[config.sessionCookie].sessionId
    ) {
      headers.sessionId = cookies[config.sessionCookie].sessionId;
    }
    return await axios.post(url, formData, { headers: headers });
  } catch ({ response }) {
    return response;
  }
};

export const apiList = {
  // User service
  sendOtp: "/user/sendOtp",
  userLogin: "/user/login",
  getUser: "/user/getUser",
  updateUser: "/user/updateUser",
  addAddress: "/user/addAddress",
  setPrimary: "/user/markAddressAsPrimary",
  updateAddress: "/user/updateAddress",
  deleteAddress: "/user/deleteAddress",
  verifyMobile: "/user/verifyMobileNumber",
  changeMobile: "/user/changeMobileNumber",
  getNewToken: "/user/getNewToken",
  updateRoles: "/user/updateRoles",
  updateReferralCode: "/user/updateReferralCode",
  createCoupon: "/user/createCoupon",
  getCoupons: "/user/getCoupons",

  // Chef service
  registerHomeChef: "/chef/registerHomeChef",
  verifyHomeChefName: "/chef/verifyHomeChefName",
  getHomeChef: "/chef/getHomeChef",
  getHomeChefs: "/chef/getHomeChefs",
  reviewHomeChefProfile: "/chef/reviewHomeChefProfile",
  reviewHomeChefGST: "/chef/reviewHomeChefGST",
  reviewHomeChefFssai: "/chef/reviewHomeChefFssai",
  updateHomeChefGalleryImages: "/chef/updateHomeChefGalleryImages",
  updateHomeChefAddress: "/chef/updateHomeChefAddress",
  updateHomeChefGST: "/chef/updateHomeChefGST",
  updateHomeChefFSSAI: "/chef/updateHomeChefFSSAI",
  reviewHomeChefGallery: "/chef/reviewHomeChefGallery",
  inviteChefManager: "/chef/inviteChefManager",
  getChefManagers: "/chef/getChefManagers",
  updateChefManager: "/chef/updateChefManager",
  reviewChefManagerInvitation: "/chef/reviewChefManagerInvitation",
  getChefManagerInvitation: "/chef/getChefManagerInvitation",
  getChefOwnerByManager: "/chef/getChefOwnerByManager",
  registerCloudKitchen: "/chef/registerCloudKitchen",
  getCloudKitchenOutlets: "/chef/getCloudKitchenOutlets",
  getCloudKitchenOutlet: "/chef/getCloudKitchenOutlet",
  updateCloudKitchenAddress: "/chef/updateCloudKitchenAddress",
  updateCloudKitchenGST: "/chef/updateCloudKitchenGST",
  updateCloudKitchenFSSAI: "/chef/updateCloudKitchenFSSAI",
  updateCloudKitchenGalleryImages: "/chef/updateCloudKitchenGalleryImages",
  addCloudKitchenOutlet: "/chef/addCloudKitchenOutlet",
  getCloudKitchens: "/chef/getCloudKitchens",
  reviewCloudKitchenProfile: "/chef/reviewCloudKitchenProfile",
  reviewCloudKitchenGST: "/chef/reviewCloudKitchenGST",
  reviewCloudKitchenFssai: "/chef/reviewCloudKitchenFssai",
  reviewCloudKitchenGallery: "/chef/reviewCloudKitchenGallery",
  addFavorite: "/chef/addFavorite",
  removeFavorite: "/chef/removeFavorite",
  getFavorites: "/chef/getFavorites",
  updateWhatsAppPreference: "/chef/updateWhatsAppPreference",
  updateHomeChefConfig: "/chef/updateHomeChefConfig",
  updateOutletConfig: "/chef/updateOutletConfig",

  // Food Service
  getCuisines: "/food/getCuisines",
  addFoodItem: "/food/addFoodItem",
  getFoodItems: "/food/getFoodItems",
  getFoodItem: "/food/getFoodItem",
  updateFoodItem: "/food/updateFoodItem",
  updateFoodItemPrice: "/food/updateFoodItemPrice",
  deleteFoodItem: "/food/deleteFoodItem",
  updateFoodItemStatus: "/food/updateFoodItemStatus",
  reviewFoodItem: "/food/reviewFoodItem",
  updateAvailability: "/food/updateAvailability",
  updateAvailabilityForAll: "/food/updateAvailabilityForAll",
  updateImagesOrder: "/food/updateImagesOrder",
  updateRankOrder: "/food/updateRankOrder",
  getMaxCapacity: "/food/getMaxCapacity",
  updateMaxCapacity: "/food/updateMaxCapacity",
  updateCuisine: "/food/updateCuisine",
  addCuisine: "/food/addCuisine",
  getCuisine: "/food/getCuisine",
  updateFoodItemTiming: "/food/updateFoodItemTiming",
  updateFoodItemMaxCapacity: "/food/updateFoodItemMaxCapacity",
  getReviews: "/food/getReviews",

  // Order service
  getChefs: "/order/getChefs",
  orderGetHomeChef: "/order/getHomeChef",
  getOutlet: "/order/getOutlet",
  getSearchSuggestions: "/order/getSearchSuggestions",
  updateCart: "/order/updateCart",
  getCart: "/order/getCart",
  createOrder: "/order/createOrder",
  getDeliveryChargesEstimate: "/order/getDeliveryChargesEstimate",
  getDiscount: "/order/getDiscount",
  verifyStock: "/order/verifyStock",
  updateOrderPaymentSuccess: "/order/updateOrderPaymentSuccess",
  updateOrderPaymentFailure: "/order/updateOrderPaymentFailure",
  getOrdersByChef: "/order/getOrdersByChef",
  getOrder: "/order/getOrder",
  confirmOrder: "/order/confirmOrder",
  rejectOrder: "/order/rejectOrder",
  markAsPacked: "/order/markAsPacked",
  markAsDelivered: "/order/markAsDelivered",
  getActiveOrdersByUser: "/order/getActiveOrdersByUser",
  getPastOrdersByUser: "/order/getPastOrdersByUser",
  getDunzoLiveLocation: "/order/getDunzoLiveLocation",
  getOrdersCountByChef: "/order/getOrdersCountByChef",
  addOrderRating: "/order/addOrderRating",
  cancelOrder: "/order/cancelOrder",
  getSearchResults: "/order/getSearchResults",
  isFirstOrder: "/order/isFirstOrder",
  verifyCouponCode: "/order/verifyCouponCode",
  getRewardsCount: "/order/getRewardsCount",
  getRewards: "/order/getRewards",
  getTrendingChefs: "/order/getTrendingChefs",
  getOrderRatings: "/order/getOrderRatings",

  // Coupon service
  addChefCoupon: "/chefcoupon/addChefCoupon",
  getChefCoupon: "/chefcoupon/getChefCoupons",
  updateChefCoupon: "/chefcoupon/updateChefCoupon",

  // Common service
  uploadFile: "/common/uploadFile",
  getConfig: "/common/getConfig",
};
