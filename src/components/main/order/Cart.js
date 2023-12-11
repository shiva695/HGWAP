import React, { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tooltip,
  Modal,
  Card,
  CardContent,
  Link,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Header from "../../general-components/ui-components/Header";
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import { useCookies } from "react-cookie";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getDistanceFromLatLonInKm,
  ratingsGroup,
  roundTo2Decimals,
} from "../../../common/common";
import { getCart, getUser, loginDrawer } from "../../../global/redux/actions";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, differenceInHours } from "date-fns";

// todo :: check performance stats
const Cart = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies();
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state);
  const { isFetching: isUserDataFetching, userData } = globalState.userReducer;

  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState([]);
  const [metaData, setMetaData] = useState([]);
  const [orderType, setOrderType] = useState("instant");
  const [gstPercent, setGstPercent] = useState(null);
  const [preordersRemovalModal, setPreordersRemovalModal] = useState(false);
  const [inactiveChefsRemovalModal, setInactiveChefsRemovalModal] =
    useState(false);
  // todo::quantity greater than maxCapacity case on load and on final submit
  const [stockStatus, setStockStatus] = useState(true);
  // const [discountType, setDiscountType] = useState("None");
  // const [discountValue, setDiscountValue] = useState(0);
  // const [preorderSlots, setPreorderSlots] = useState([]);

  const [invokeGetConfig, setInvokeGetConfig] = useState(true);
  // const [invokeGetDiscount, setInvokeGetDiscount] = useState(false);
  const [invokeGetCart, setInvokeGetCart] = useState(true);
  // const [invokePreorderSlots, setInvokePreorderSlots] = useState(false);
  const [invokeVerifyStock, setInvokeVerifyStock] = useState(false);
  const [invokeCreateOrder, setInvokeCreateOrder] = useState(false);

  const [showAddressPickerModal, setShowAddressPickerModal] = useState(false);

  const [deliveryType, setDeliveryType] = useState("doorDelivery");
  const [element, setElement] = useState(null);
  const [showToolTip, setShowToolTip] = useState(false);

  // Address handler
  const [addressData, setAddressData] = useState(null);
  const [isCheckAddressFetching, setIsCheckAddressFetching] = useState(false);
  const [invokeUser, setInvokeUser] = useState(true);
  const [invokeFirstOrder, setInvokeFirstOrder] = useState(false);
  const [invokeRewardsCount, setInvokeRewardsCount] = useState(false);
  const [rewardsCount, setRewardsCount] = useState(null);
  const [platformFee, setPlatformFee] = useState(null);
  const [proceedToPayStep, setProceedToPayStep] = useState(0);
  // 0 : modal close
  // 1 : Please wait while we check for the stock
  // 2 : One or more item(s) in your cart has insufficient stock
  // 3 : Please wait while we are creating your order(s)
  // 0 : after create order api is responded
  // 4 : after payment success
  // 5 : after payment failure

  // toggle accordion
  const toggleExpandButton = (metaItem) => {
    let metaItems = JSON.parse(JSON.stringify(metaData));
    let findElement = metaItems?.findIndex(
      (el) =>
        el.orderType === metaItem.orderType &&
        el.preOrderDate === metaItem.preOrderDate &&
        el.deliverySlot === metaItem.deliverySlot &&
        el.homeChefId === metaItem.homeChefId &&
        el.cloudKitchenOutletId === metaItem.cloudKitchenOutletId &&
        el.deliveryType === metaItem.deliveryType &&
        el.userAddressId === metaItem.userAddressId
    );

    metaItems[findElement].openStatus = !metaItems[findElement].openStatus;
    setMetaData(metaItems);
  };

  // remove removeCouponCode
  const removeCouponCode = (metaData, idx) => {
    let metaItems = JSON.parse(JSON.stringify(metaData));
    delete metaItems[idx].referralDiscount;
    delete metaItems[idx].referralDiscountEligible;
    delete metaItems[idx].couponDiscount;
    delete metaItems[idx].couponDiscountEligible;
    delete metaItems[idx].couponCode;
    delete metaItems[idx].referrerUserId;
    updateGrandTotals(metaItems);
    setMetaData(metaItems);
  };

  // verifying stock on decrement cart
  const verifyStockDecrement = async (cartItems) => {
    let params = {
      cartData: cartItems,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.verifyStock,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setStockStatus(true);
      } else if (response.data.responseCode === "HE010") {
        if (stockStatus) {
          setProceedToPayStep(2); // 2 : One or more item(s) in your cart has insufficient stock
        }
        setStockStatus(false);
      } else {
        alert(
          "Something went wrong while verifying stock. Please try again later!"
        );
      }
    } else {
      alert(
        "Something went wrong while verifying stock. Please try again later!!"
      );
    }
  };

  const decrementQuantity = async (foodId, metaItem, minOrderQuantity) => {
    // check the count of foodItems for the matching record
    // if count is more than 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the foodItem entry
    // if count is equal to 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the matching record itself
    // call updateCart api with the updated cartData
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let metaItems = JSON.parse(JSON.stringify(metaData));

    let indx = metaItems.findIndex(
      (el) =>
        el.orderType === metaItem.orderType &&
        el.preOrderDate === metaItem.preOrderDate &&
        el.deliverySlot === metaItem.deliverySlot &&
        el.homeChefId === metaItem.homeChefId &&
        el.cloudKitchenOutletId === metaItem.cloudKitchenOutletId &&
        el.deliveryType === metaItem.deliveryType &&
        el.userAddressId === metaItem.userAddressId
    );

    if (cartItems[indx]?.foodItems?.length > 1) {
      if (
        cartItems[indx]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        metaItems[indx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });

        cartItems[indx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });
      } else {
        // remove this food item entry
        metaItems[indx].foodItems = metaItems[indx]?.foodItems.filter(
          (fi) => fi.foodItemId !== foodId
        );

        cartItems[indx].foodItems = cartItems[indx]?.foodItems.filter(
          (fi) => fi.foodItemId !== foodId
        );
      }
    } else {
      if (
        cartItems[indx]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        metaItems[indx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });

        cartItems[indx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });
      } else {
        // remove this object itself
        metaItems.splice(indx, 1);
        cartItems.splice(indx, 1);
        setInvokeFirstOrder(true);
      }
    }

    updateGrandTotals(metaItems);

    setCartData(cartItems);
    verifyStockDecrement(cartItems);
    updateCart(cartItems);
  };

  const totalWeightInCart = (idx) => {
    // return cartData
    //   ?.map((el) => el.foodItems.map((el) => el.weight * el.quantity))
    //   ?.flat(1)
    //   .reduce((sum, val) => sum + val, 0);
    return cartData[idx].foodItems
      .map((el) => el.weight * el.quantity)
      ?.flat(1)
      .reduce((sum, val) => sum + val, 0);
  };

  const incrementQuantity = async (foodId, metaItem) => {
    // increase matching foodItemId quantity by 1
    // call updateCart api with the updated cartData
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let metaItems = JSON.parse(JSON.stringify(metaData));

    let indx = metaItems.findIndex(
      (el) =>
        el.orderType === metaItem.orderType &&
        el.preOrderDate === metaItem.preOrderDate &&
        el.deliverySlot === metaItem.deliverySlot &&
        el.homeChefId === metaItem.homeChefId &&
        el.cloudKitchenOutletId === metaItem.cloudKitchenOutletId &&
        el.deliveryType === metaItem.deliveryType &&
        el.userAddressId === metaItem.userAddressId
    );

    metaItems[indx].foodItems.map((fi) => {
      if (fi.foodItemId === foodId) {
        fi.quantity++;
      }
      return fi;
    });
    cartItems[indx].foodItems.map((fi) => {
      if (fi.foodItemId === foodId) {
        fi.quantity++;
      }
      return fi;
    });

    updateGrandTotals(metaItems);

    setCartData(cartItems);
    updateCart(cartItems);
  };

  // remove the given food item (indx) under the cart element
  const removeUnavailableFoodItem = async (element, indx) => {
    let copyMeta = JSON.parse(JSON.stringify(metaData));
    let copyCart = JSON.parse(JSON.stringify(cartData));

    let findCartIndex = copyCart.findIndex(
      (el) =>
        el.orderType === element.orderType &&
        el.preOrderDate === element.preOrderDate &&
        el.deliverySlot === element.deliverySlot &&
        el.homeChefId === element.homeChefId &&
        el.cloudKitchenOutletId === element.cloudKitchenOutletId &&
        el.deliveryType === element.deliveryType &&
        el.userAddressId === element.userAddressId
    );

    // remove the object itself, if there is only one food item
    if (
      copyMeta[findCartIndex].foodItems.length === 1 &&
      copyCart[findCartIndex].foodItems.length === 1
    ) {
      copyMeta.splice(findCartIndex, 1);
      copyCart.splice(findCartIndex, 1);
    }
    // else, remove the food item
    else {
      copyMeta[findCartIndex].foodItems.splice(indx, 1);
      copyCart[findCartIndex].foodItems.splice(indx, 1);
    }

    updateGrandTotals(copyMeta);

    setCartData(copyCart);
    verifyStockDecrement(copyCart);
    updateCart(copyCart);
  };

  // verifying stock on proceed to pay
  const verifyStockProceed = async () => {
    setProceedToPayStep(1); // 1 : Please wait while we check for the stock
    let params = {
      cartData: cartData,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.verifyStock,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setStockStatus(true);
        setInvokeCreateOrder(true);
      } else if (response.data.responseCode === "HE010") {
        setProceedToPayStep(2); // 2 : One or more item(s) in your cart has insufficient stock
        setStockStatus(false);
        setInvokeGetCart(true);
      } else {
        alert(
          "Something went wrong while verifying stock. Please try again later!"
        );
      }
    } else {
      alert(
        "Something went wrong while verifying stock. Please try again later!!"
      );
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // update cart to db
  const updateCart = useCallback(
    async (cartItems) => {
      let params = {
        cartData: JSON.stringify(cartItems),
      };

      let response = await invokeApi(
        config.apiDomains.orderService + apiList.updateCart,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          dispatch(getCart({ cookies }));
        } else {
          alert(
            "Something went wrong while update cart. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while update cart. Please try again later!!"
        );
      }
    },
    [cookies, dispatch, navigate]
  );

  // Calculate grand total for each order and update metadata. Apply discount to first applicable order.
  const updateGrandTotals = useCallback(
    async (metaItems) => {
      if (userData?.user) {
        // let discountAvailable = true;
        for (let i = 0; i < metaItems.length; i++) {
          let orderTotal = metaItems[i].foodItems
            .map((item) => item.quantity * item.sellingPrice)
            .flat(1)
            .reduce((sum, val) => sum + val, 0);
          let itemsTotal = orderTotal;
          let itemsTotal10Percent = parseInt(orderTotal / 10);
          let userPlatformFee = platformFee;

          if (itemsTotal10Percent < userPlatformFee) {
            userPlatformFee = itemsTotal10Percent;
          }
          let totalPlatformFee = userPlatformFee;
          let coPlatformFee = metaItems[i].chefPlatformFee;
          userPlatformFee -= coPlatformFee;

          if (userPlatformFee < 0) {
            userPlatformFee = 0;
          }
          coPlatformFee = totalPlatformFee - userPlatformFee;

          metaItems[i].platformFee = +userPlatformFee;
          metaItems[i].coPlatformFee = +coPlatformFee;

          // if (discountAvailable && discountType === "Lifetime_1st_Order") {
          //   itemsDiscount = discountValue;
          //   if (itemsDiscount > orderTotal) {
          //     itemsDiscount = orderTotal;
          //   }
          //   orderTotal -= itemsDiscount;
          //   discountAvailable = false;
          // }
          //  TODO:: remove this line after api fixes done
          metaItems[i].itemsDiscount = 0;
          metaItems[i].deliveryDiscount = 0;

          let totalPackingCharges = metaItems[i].foodItems
            .map((item) => item.quantity * item.packingCharges)
            .flat(1)
            .reduce((sum, val) => sum + val, 0);
          metaItems[i].totalPackingCharges = totalPackingCharges;

          // Referral discount
          let referralDiscount = 0;
          if (!!metaItems[i].isFirstOrder && !!metaItems[i].referralDiscount) {
            if (
              orderTotal + totalPackingCharges >
              metaItems[i].referralDiscountEligible
            ) {
              referralDiscount = metaItems[i].referralDiscountEligible;
              itemsTotal =
                orderTotal +
                totalPackingCharges -
                metaItems[i].referralDiscountEligible;
            } else if (
              orderTotal + totalPackingCharges <=
              metaItems[i].referralDiscountEligible
            ) {
              referralDiscount = orderTotal + totalPackingCharges - 1;
              itemsTotal = 1;
            }
          } else {
            itemsTotal = orderTotal + totalPackingCharges;
          }

          // coupon discount
          let couponDiscount = 0;
          if (!!metaItems[i].couponDiscount) {
            if (
              orderTotal + totalPackingCharges >
              metaItems[i].couponDiscountEligible
            ) {
              couponDiscount = metaItems[i].couponDiscountEligible;
              itemsTotal =
                orderTotal +
                totalPackingCharges -
                metaItems[i].couponDiscountEligible;
            } else if (
              orderTotal + totalPackingCharges <=
              metaItems[i].couponDiscountEligible
            ) {
              couponDiscount = orderTotal + totalPackingCharges - 1;
              itemsTotal = 1;
            }
          }

          // Rewards discount
          let rewardsDiscount = 0;
          let totalClaimedRewards =
            metaItems
              ?.map((el) => el.rewardsDiscount)
              .reduce((sum, val) => sum + val, 0) -
            metaItems[i].rewardsDiscount;
          if (itemsTotal > 1 && !!metaItems[i].isRewardsClaimed) {
            if (rewardsCount - totalClaimedRewards > 0) {
              if (itemsTotal > rewardsCount - totalClaimedRewards) {
                rewardsDiscount = rewardsCount - totalClaimedRewards;
                itemsTotal = itemsTotal - rewardsDiscount;
              } else if (itemsTotal <= rewardsCount - totalClaimedRewards) {
                rewardsDiscount = itemsTotal - 1;
                itemsTotal = 1;
              }
            } else {
              rewardsDiscount = metaItems[i].rewardsDiscount;
            }
          } else {
            rewardsDiscount = metaItems[i].rewardsDiscount;
          }

          metaItems[i].referralDiscount = referralDiscount;
          metaItems[i].couponDiscount = couponDiscount;
          metaItems[i].rewardsDiscount = rewardsDiscount;
          metaItems[i].itemsTotal = itemsTotal;

          let cgstValue, sgstValue, igstValue;

          if (metaItems[i].deliveryType === "doorDelivery") {
            let filterUserId;
            filterUserId = userData?.user?.addresses.filter(
              (el) => el.id === metaItems[i].userAddressId
            );
            if (config.gstRegisteredStates.includes(filterUserId[0].state)) {
              metaItems[i].cgstPercentage = gstPercent / 2;
              metaItems[i].sgstPercentage = gstPercent / 2;
              metaItems[i].igstPercentage = 0;
              cgstValue = sgstValue = roundTo2Decimals(
                (itemsTotal * gstPercent) / 2 / 100
              );
              igstValue = 0.0;
            } else {
              metaItems[i].cgstPercentage = 0;
              metaItems[i].sgstPercentage = 0;
              metaItems[i].igstPercentage = gstPercent;
              cgstValue = sgstValue = 0.0;
              igstValue = roundTo2Decimals((itemsTotal * gstPercent) / 100);
            }
          } else {
            if (config.gstRegisteredStates.includes(metaItems[i].chefState)) {
              metaItems[i].cgstPercentage = gstPercent / 2;
              metaItems[i].sgstPercentage = gstPercent / 2;
              metaItems[i].igstPercentage = 0;
              cgstValue = sgstValue = roundTo2Decimals(
                (itemsTotal * gstPercent) / 2 / 100
              );
              igstValue = 0.0;
            } else {
              metaItems[i].cgstPercentage = 0;
              metaItems[i].sgstPercentage = 0;
              metaItems[i].igstPercentage = gstPercent;
              cgstValue = sgstValue = 0.0;
              igstValue = roundTo2Decimals((itemsTotal * gstPercent) / 100);
            }
          }

          metaItems[i].cgstValue = cgstValue;
          metaItems[i].sgstValue = sgstValue;
          metaItems[i].igstValue = igstValue;

          let deliveryFee = metaItems[i].deliveryFee;

          let deliveryRebate = 0;
          for (let j = 0; j < metaItems[i].foodItems.length; j++) {
            deliveryRebate +=
              metaItems[i].foodItems[j].rebate *
              metaItems[i].foodItems[j].quantity;
          }
          if (deliveryRebate > deliveryFee) {
            deliveryRebate = deliveryFee;
          }
          metaItems[i].deliveryRebate = deliveryRebate;

          // let deliveryDiscount = 0;
          // if (
          //   discountAvailable &&
          //   discountType === "Monthly_1st_Delivery" &&
          //   deliveryFee - deliveryRebate > 0
          // ) {
          //   deliveryDiscount = discountValue;
          //   if (deliveryDiscount > deliveryFee - deliveryRebate) {
          //     deliveryDiscount = deliveryFee - deliveryRebate;
          //   }
          //   discountAvailable = false;
          // }
          // metaItems[i].deliveryDiscount = deliveryDiscount;

          // weight check
          let checkWeight = metaItems[i].foodItems
            .map((el) => el.weight * el.quantity)
            .flat(1)
            .reduce((sum, val) => sum + val, 0);
          if (checkWeight > config.dunzoMaxWeight) {
            metaItems[i].weightExceeded = true;
          } else {
            metaItems[i].weightExceeded = false;
          }

          metaItems[i].grandTotal = (
            itemsTotal +
            +cgstValue +
            +sgstValue +
            +igstValue +
            +userPlatformFee +
            deliveryFee -
            deliveryRebate
          ).toFixed(2);
        }
      }
      setMetaData(metaItems);
    },
    [userData, gstPercent, rewardsCount, platformFee]
  );

  // handle procced pay button with weight
  const handleWeightStatus = () => {
    return metaData.some(
      (el) => el.deliveryType === "doorDelivery" && el.weightExceeded === true
    );
  };

  // handle procced pay button delivery status
  const handleDeliveryStatus = () => {
    return metaData.some((el) => el.deliveryFeasibility === false);
  };

  const findElementInAddress = (metaItem) => {
    let metaItems = JSON.parse(JSON.stringify(metaData));
    let findElement = metaItems?.findIndex(
      (el) =>
        el.orderType === metaItem.orderType &&
        el.preOrderDate === metaItem.preOrderDate &&
        el.deliverySlot === metaItem.deliverySlot &&
        el.homeChefId === metaItem.homeChefId &&
        el.cloudKitchenOutletId === metaItem.cloudKitchenOutletId &&
        el.deliveryType === metaItem.deliveryType &&
        el.userAddressId === metaItem.userAddressId
    );
    setElement(findElement);
  };

  // Address change handler in cart
  const addressHandlerInCart = async (address) => {
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let metaItems = JSON.parse(JSON.stringify(metaData));

    if (address) {
      metaItems[element].addressTag = address.addressTag;
      metaItems[element].deliveryType = "doorDelivery";
      metaItems[element].userAddressId = address.id;
      cartItems[element].userAddressId = address.id;
      cartItems[element].deliveryType = "doorDelivery";
    } else {
      metaItems[element].deliveryType = "selfPickup";
      metaItems[element].addressTag = "Self Pickup";
      metaItems[element].userAddressId = null;
      cartItems[element].deliveryType = "selfPickup";
      cartItems[element].userAddressId = null;
    }

    // check for duplicate
    let fi2 = -1;

    for (let i = 0; i < metaItems.length; i++) {
      if (i === element) {
        continue;
      }
      if (
        metaItems[element].orderType === metaItems[i].orderType &&
        metaItems[element].preOrderDate === metaItems[i].preOrderDate &&
        metaItems[element].deliverySlot === metaItems[i].deliverySlot &&
        metaItems[element].homeChefId === metaItems[i].homeChefId &&
        metaItems[element].cloudKitchenOutletId ===
          metaItems[i].cloudKitchenOutletId &&
        metaItems[element].deliveryType === metaItems[i].deliveryType &&
        metaItems[element].userAddressId === metaItems[i].userAddressId
      ) {
        fi2 = i;
        break;
      }
    }

    // get kms after changing addresses
    if (metaItems[element].deliveryType === "doorDelivery") {
      metaItems[element].kms = getDistanceFromLatLonInKm(
        address.latitude,
        address.longitude,
        metaItems[element].chefLatitude,
        metaItems[element].chefLongitude
      );
    }

    // if duplicate exists
    if (fi2 > -1) {
      // ask user, if he wants to merge
      if (
        window.confirm(
          "Another order exists from same Chef and same delivery options. Do you want to merge these?"
        )
      ) {
        for (let j = 0; j < metaItems[fi2].foodItems.length; j++) {
          let fi = metaItems[element].foodItems.findIndex(
            (el) => el.foodItemId === metaItems[fi2].foodItems[j].foodItemId
          );
          if (fi > -1) {
            metaItems[element].foodItems[fi].quantity +=
              metaItems[fi2].foodItems[j].quantity;
            cartItems[element].foodItems[fi].quantity +=
              cartItems[fi2].foodItems[j].quantity;
          } else {
            metaItems[element].foodItems.push(metaItems[fi2].foodItems[j]);
            cartItems[element].foodItems.push(cartItems[fi2].foodItems[j]);
          }
        }
        let deliveryRebate = 0;
        metaItems[element].weightExceeded = false;
        if (address) {
          for (let j = 0; j < metaItems[element].foodItems.length; j++) {
            deliveryRebate +=
              metaItems[element].foodItems[j].rebate *
              metaItems[element].foodItems[j].quantity;
          }
        }

        metaItems[element].deliveryRebate = deliveryRebate;
      } else {
        setShowAddressPickerModal(false);
        return 0;
      }
    }

    // get estimated delivery charges
    if (
      metaItems[element].deliveryType === "doorDelivery" &&
      metaItems[element].userAddressId !== null
    ) {
      let params = {
        homeChefId: metaItems[element].homeChefId,
        cloudKitchenOutletId: metaItems[element].cloudKitchenOutletId,
        userAddressId: metaItems[element].userAddressId,
      };
      let deliveryFeeResponse = await invokeApi(
        config.apiDomains.orderService + apiList.getDeliveryChargesEstimate,
        params,
        cookies
      );
      if (
        deliveryFeeResponse.status >= 200 &&
        deliveryFeeResponse.status < 300
      ) {
        if (deliveryFeeResponse.data.responseCode === "200") {
          metaItems[element].deliveryFeasibility = true;
          // Delivery fee
          let estimatedPrice = parseFloat(
            deliveryFeeResponse.data.estimatedPrice
          );
          metaItems[element].deliveryFee = estimatedPrice;

          // Adjust delivery rebate
          if (metaItems[element].deliveryRebate > estimatedPrice) {
            metaItems[element].deliveryRebate = estimatedPrice;
          }
        } else if (
          deliveryFeeResponse.data.responseCode === "HE011-1" ||
          deliveryFeeResponse.data.responseCode === "HE011-2"
        ) {
          metaItems[element].deliveryFeasibility = false;
          metaItems[element].deliveryFee = 0;
          metaItems[element].deliveryRebate = 0;
        } else {
          alert(
            "Something went wrong while fetching estimated delivery. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching estimated delivery. Please try again later!!"
        );
      }
    } else {
      metaItems[element].deliveryFeasibility = true;
      metaItems[element].deliveryFee = 0;
      metaItems[element].deliveryRebate = 0;
    }

    if (fi2 > -1) {
      metaItems.splice(fi2, 1);
      cartItems.splice(fi2, 1);
    }
    updateGrandTotals(metaItems);
    setCartData(cartItems);
    verifyStockDecrement(cartItems);
    updateCart(cartItems);
    setMetaData(metaItems);
    setShowAddressPickerModal(false);
  };

  // check the address where delivery is available or not
  const CheckAddressForDunzo = async (el) => {
    setIsCheckAddressFetching(true);
    let copy = JSON.parse(JSON.stringify(addressData));
    for (let index = 0; index < userData?.user.addresses.length; index++) {
      const element = userData?.user.addresses[index];
      let params = {
        homeChefId: el.homeChefId,
        cloudKitchenOutletId: el.cloudKitchenOutletId,
        userAddressId: element.id,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getDeliveryChargesEstimate,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          copy[index].deliveryStatus = true;
        } else if (
          response.data.responseCode === "HE011-1" ||
          response.data.responseCode === "HE011-2"
        ) {
          copy[index].deliveryStatus = false;
        } else {
          alert(
            "Something went wrong while checking delivery feasibility.. Please try again later!"
          );
          setIsCheckAddressFetching(false);
        }
      } else {
        alert(
          "Something went wrong while checking delivery feasibility.. Please try again later!!"
        );
        setIsCheckAddressFetching(false);
      }
    }
    setIsCheckAddressFetching(false);
    setAddressData(copy);
    // setIsCheckAddressFetching(false);
  };

  // verifyCoupon
  const verifyingCoupon = async (ev, idx) => {
    ev.preventDefault();
    let metaItems = JSON.parse(JSON.stringify(metaData));
    if (userData?.user.referralCode !== metaData[idx].couponCode) {
      let filterCoupon = metaItems.filter(
        (el) => el.couponCode === metaData[idx].couponCode
      );
      if (filterCoupon.length <= 1) {
        let params = {
          couponCode: metaData[idx].couponCode,
          checkReferralCode: metaData[idx].isFirstOrder ? "Yes" : null,
        };
        let response = await invokeApi(
          config.apiDomains.orderService + apiList.verifyCouponCode,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            if (response.data?.referralDiscount > 0) {
              toast.success("Referral code applied successfully");
              metaItems[idx].referralDiscount = response.data.referralDiscount;
              metaItems[idx].referralDiscountEligible =
                response.data.referralDiscount;
              metaItems[idx].referrerUserId = response.data.referrerUserId;
              updateGrandTotals(metaItems);
            } else if (response.data?.couponAmount > 0) {
              toast.success("Coupon code applied successfully");
              metaItems[idx].couponDiscount = response.data.couponAmount;
              metaItems[idx].couponDiscountEligible =
                response.data.couponAmount;
              updateGrandTotals(metaItems);
            } else {
              metaItems[idx].couponError = true;
              metaItems[idx].couponHelperText =
                "Sorry, no coupon discounts available at the moment. Please check later!";
            }
          } else if (response.data.responseCode === "HE014-1") {
            metaItems[idx].couponError = true;
            metaItems[idx].couponHelperText = "Invalid coupon code";
          } else if (response.data.responseCode === "HE014-2") {
            metaItems[idx].couponError = true;
            metaItems[idx].couponHelperText = "Coupon code expired!";
          } else if (response.data.responseCode === "HE014-3") {
            metaItems[idx].couponError = true;
            metaItems[idx].couponHelperText =
              "Sorry, maximum usage of this coupon code has reached.";
          } else if (response.data.responseCode === "HE014-4") {
            metaItems[idx].couponError = true;
            metaItems[idx].couponHelperText =
              "You have already used this coupon";
          } else {
            alert(
              "Something went wrong while verifying coupon. Please try again later!"
            );
          }
        } else {
          alert(
            "Something went wrong while verifying coupon. Please try again later!!"
          );
        }
      } else {
        metaItems[idx].couponError = true;
        metaItems[idx].couponHelperText =
          "Coupon code already used for other order";
      }
    } else {
      metaItems[idx].couponError = true;
      metaItems[idx].couponHelperText = "You cannot use your own referral code";
    }
    setMetaData(metaItems);
  };

  // total claimed rewards
  const rewardsClaimedTotal = () => {
    return metaData
      ?.map((el) => el.rewardsDiscount)
      .reduce((sum, val) => sum + val, 0);
  };

  // set address data when userData is available
  useEffect(() => {
    const getUserData = () => {
      if (!userData) {
        dispatch(
          getUser({ id: cookies[config.cookieName].loginUserId, cookies })
        );
      } else {
        setAddressData(userData?.user.addresses ?? null);
      }
    };
    if (invokeUser && userData?.user) {
      setInvokeUser(false);
      getUserData();
    }
  }, [userData, invokeUser, cookies, dispatch]);

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Cart";
  }, []);

  // get gst config
  useEffect(() => {
    const configKey = ["Platform_Fee", "GST_Percentage"];
    const getConfig = async () => {
      for (let i = 0; i < configKey.length; i++) {
        let params = { configKey: configKey[i] };
        let response = await invokeApi(
          config.apiDomains.commonService + apiList.getConfig,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            configKey[i] === "Platform_Fee" &&
              setPlatformFee(response.data.config.configValue);
            configKey[i] === "GST_Percentage" &&
              setGstPercent(response.data.config.configValue);
            // setInvokeGetDiscount(true);
            setInvokeRewardsCount(true);
          } else {
            alert(
              "Something went wrong while fetching GST config. Please try again later!"
            );
          }
        } else {
          alert(
            "Something went wrong while fetching GST config. Please try again later!!"
          );
        }
      }
    };
    if (invokeGetConfig) {
      setInvokeGetConfig(false);
      getConfig();
    }
  }, [invokeGetConfig, cookies]);

  // Get discount
  // useEffect(() => {
  //   const getDiscount = async () => {
  //     let params = {};
  //     let discountResponse = await invokeApi(
  //       config.apiDomains.orderService + apiList.getDiscount,
  //       params,
  //       cookies
  //     );
  //     if (discountResponse.status >= 200 && discountResponse.status < 300) {
  //       if (discountResponse.data.responseCode === "200") {
  //         if (
  //           discountResponse.data.discountType === "Lifetime_1st_Order" ||
  //           discountResponse.data.discountType === "Monthly_1st_Delivery"
  //         ) {
  //           setDiscountType(discountResponse.data.discountType);
  //           setDiscountValue(parseInt(discountResponse.data.discountValue));
  //         }
  //         dispatch(getCart({ cookies }));
  //         // setInvokePreorderSlots(true);
  //       } else {
  //         alert(
  //           "Something went wrong while fetching discount details. Please try again later!"
  //         );
  //       }
  //     } else {
  //       alert(
  //         "Something went wrong while fetching discount details. Please try again later!!"
  //       );
  //     }
  //   };
  //   if (invokeGetDiscount) {
  //     setInvokeGetDiscount(false);
  //     getDiscount();
  //   }
  // }, [invokeGetDiscount, cookies, dispatch]);

  // getRewardsCount
  useEffect(() => {
    const getRewardsCount = async () => {
      // let metaItems = JSON.parse(JSON.stringify(metaData));
      let params = {};
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getRewardsCount,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setRewardsCount(response.data.totalRewardCount);
          setInvokeFirstOrder(true);
        } else {
          alert(
            "Something went wrong while getting rewards. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while getting rewards. Please try again later!!"
        );
      }
    };
    if (invokeRewardsCount) {
      setInvokeRewardsCount(false);
      getRewardsCount();
    }
  }, [cookies, invokeRewardsCount]);

  // Checking is first order or not
  useEffect(() => {
    const isFirstOrder = async () => {
      let copyMeta = JSON.parse(JSON.stringify(metaData));
      let params = {};
      let responseIsFirstOrder = await invokeApi(
        config.apiDomains.orderService + apiList.isFirstOrder,
        params,
        cookies
      );
      if (
        responseIsFirstOrder.status >= 200 &&
        responseIsFirstOrder.status < 300
      ) {
        if (responseIsFirstOrder.data.responseCode === "200") {
          if (responseIsFirstOrder.data.isFirstOrder) {
            copyMeta[0].isFirstOrder = true;
            setMetaData(copyMeta);
          }
        } else {
          alert(
            "Something went wrong while fetching your order history. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching your order history. Please try again later!!"
        );
      }
    };
    if (invokeFirstOrder && metaData.length > 0) {
      setInvokeFirstOrder(false);
      isFirstOrder();
    }
  }, [invokeFirstOrder, cookies, metaData]);

  // get cart data
  useEffect(() => {
    const convertTo24HRS = (time12h) => {
      let modifier = time12h.slice(-2);
      let hours = time12h.replace(/\D/g, "");
      if (hours === "12") {
        hours = "00";
      }
      if (modifier === "pm") {
        hours = parseInt(hours, 10) + 12;
      }
      return hours;
    };

    const getCart = async () => {
      setIsLoading(true);
      let params = {};
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getCart,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (JSON.parse(response.data.cartData).length > 0) {
            let cartItems = JSON.parse(response.data.cartData);

            // setting default ordertype depends on cart data
            let instantOrdersCount = cartItems?.filter(
              (item) => item.orderType === "instant"
            ).length;
            let preordersCount = cartItems?.filter(
              (item) => item.orderType === "preorder"
            ).length;

            if (instantOrdersCount === 0 && preordersCount > 0) {
              setOrderType("preorder");
            } else {
              setOrderType("instant");
            }

            // Remove from cart if less than preorder minhours
            let alertMsg = false;
            for (let i = 0; i < cartItems?.length; i++) {
              if (cartItems[i].orderType === "preorder") {
                let yearCookie = cartItems[i]?.preOrderDate.split("-")[0];
                let monthCookie = cartItems[i]?.preOrderDate.split("-")[1];
                let dateCookie = cartItems[i]?.preOrderDate.split("-")[2];

                let slotCookie = convertTo24HRS(
                  cartItems[i].deliverySlot.split(" ")[0]
                );
                for (let j = 0; j < cartItems[i]?.foodItems.length; j++) {
                  if (
                    differenceInHours(
                      new Date(
                        yearCookie,
                        monthCookie - 1,
                        dateCookie,
                        slotCookie
                      ),
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate(),
                        new Date().getHours() + 1
                      ) < cartItems[i].foodItems[j]?.preorderHours
                    )
                  ) {
                    alertMsg = true;
                    if (cartItems[i].foodItems.length > 1) {
                      cartItems[i].foodItems.splice(j, 1);
                    } else {
                      cartItems.splice(i, 1);
                    }
                  }
                }
              }
              if (alertMsg) {
                setPreordersRemovalModal(true);
              }
              updateCart(cartItems);
              setCartData(cartItems);
            }

            let copyMeta = JSON.parse(JSON.stringify(cartItems));
            // Get chef data, food items data, delivery charges, food items rebate and update details to metaData
            for (let i = 0; i < cartItems.length; i++) {
              copyMeta[i].rewardsDiscount = 0;
              copyMeta[i].isRewardsClaimed = false;

              let cartObj = cartItems[i];
              // Based on home chef or cloud kitchen
              if (cartObj.homeChefId !== null) {
                let params = {
                  id: cartObj.homeChefId,
                  orderType: cartObj.orderType,
                  preOrderDate: cartObj.preOrderDate,
                  preOrderDay: cartObj.preOrderDay,
                  deliverySlot: cartObj.deliverySlot,
                };
                let chefResponse = await invokeApi(
                  config.apiDomains.orderService + apiList.orderGetHomeChef,
                  params,
                  cookies
                );
                if (chefResponse.status >= 200 && chefResponse.status < 300) {
                  if (chefResponse.data.responseCode === "200") {
                    if (chefResponse.data.homeChef !== null) {
                      // Update metaData with chef details
                      copyMeta[i].chefName =
                        chefResponse.data.homeChef.chefName;
                      copyMeta[i].profileImage =
                        chefResponse.data.homeChef.profileImage;
                      copyMeta[i].chefState = chefResponse.data.homeChef.state;
                      copyMeta[i].chefCity = chefResponse.data.homeChef.city;
                      copyMeta[i].chefLocality =
                        chefResponse.data.homeChef.locality;
                      copyMeta[i].chefLatitude =
                        chefResponse.data.homeChef.latitude;
                      copyMeta[i].chefLongitude =
                        chefResponse.data.homeChef.longitude;
                      copyMeta[i].averageRating =
                        chefResponse.data.homeChef.averageRating;
                      copyMeta[i].noOfRatings =
                        chefResponse.data.homeChef.noOfRatings;
                      copyMeta[i].chefPlatformFee =
                        chefResponse.data.homeChef.coPlatformFee;
                      copyMeta[i].openStatus = true;

                      if (!!copyMeta[i].userAddressId && !!userData?.user) {
                        let userAddress = userData?.user?.addresses?.filter(
                          (el) => el.id === copyMeta[i].userAddressId
                        );
                        if (!!userAddress && userAddress.length > 0) {
                          copyMeta[i].userLatitude = userAddress[0].latitude;
                          copyMeta[i].userLongitude = userAddress[0].longitude;
                          copyMeta[i].addressTag = userAddress[0].addressTag;
                        } else {
                          let userAddressPrimary =
                            userData?.user?.addresses?.filter(
                              (el) => el.isPrimary === "Yes"
                            );
                          copyMeta[i].userLatitude =
                            userAddressPrimary[0].latitude;
                          copyMeta[i].userLongitude =
                            userAddressPrimary[0].longitude;
                          copyMeta[i].addressTag =
                            userAddressPrimary[0].addressTag;
                        }
                      } else {
                        copyMeta[i].addressTag = "Self Pickup";
                      }
                      // Update rebate and maxCapacity from chef details to metaData
                      let deliveryRebate = 0;
                      for (let j = 0; j < cartObj?.foodItems.length; j++) {
                        let filterFood =
                          chefResponse.data.homeChef.foodItems.filter(
                            (el) => el.id === cartObj.foodItems[j].foodItemId
                          );
                        if (filterFood.length > 0) {
                          copyMeta[i].foodItems[j].status = "Active";
                          copyMeta[i].foodItems[j].prevSellingPrice =
                            cartItems[i].foodItems[j].sellingPrice;
                          copyMeta[i].foodItems[j].sellingPrice =
                            filterFood[0].sellingPrice;
                          copyMeta[i].foodItems[j].rebate =
                            filterFood[0].rebate;
                          copyMeta[i].foodItems[j].maxCapacity =
                            filterFood[0].maxCapacity;
                          copyMeta[i].foodItems[j].currentAvailability =
                            filterFood[0].currentAvailability;
                          copyMeta[i].foodItems[j].packingCharges =
                            filterFood[0].packingCharges;
                          copyMeta[i].foodItems[j].minOrderQuantity =
                            filterFood[0].minOrderQuantity;
                        } else {
                          copyMeta[i].foodItems[j].status = "InActive";
                          copyMeta[i].foodItems[j].prevSellingPrice =
                            cartItems[i].foodItems[j].sellingPrice;
                          // copyMeta[i].foodItems[j].sellingPrice = filterFood[0].sellingPrice;
                          copyMeta[i].foodItems[j].rebate = 0;
                          copyMeta[i].foodItems[j].maxCapacity = 0;
                          copyMeta[i].foodItems[j].currentAvailability = "Off";
                        }
                        deliveryRebate +=
                          copyMeta[i].foodItems[j].rebate *
                          copyMeta[i].foodItems[j].quantity;
                      }
                      copyMeta[i].deliveryRebate = deliveryRebate;

                      // get estimated delivery charges
                      if (
                        copyMeta[i].deliveryType === "doorDelivery" &&
                        cartObj.userAddressId !== null
                      ) {
                        let params = {
                          homeChefId: chefResponse.data.homeChef.id,
                          userAddressId: cartObj.userAddressId,
                        };
                        let deliveryFeeResponse = await invokeApi(
                          config.apiDomains.orderService +
                            apiList.getDeliveryChargesEstimate,
                          params,
                          cookies
                        );
                        if (
                          deliveryFeeResponse.status >= 200 &&
                          deliveryFeeResponse.status < 300
                        ) {
                          if (deliveryFeeResponse.data.responseCode === "200") {
                            copyMeta[i].deliveryFeasibility = true;
                            // Delivery fee
                            let estimatedPrice = parseFloat(
                              deliveryFeeResponse.data.estimatedPrice
                            );
                            copyMeta[i].deliveryFee = estimatedPrice;

                            // Adjust delivery rebate
                            if (copyMeta[i].deliveryRebate > estimatedPrice) {
                              copyMeta[i].deliveryRebate = estimatedPrice;
                            }
                          } else if (
                            deliveryFeeResponse.data.responseCode ===
                              "HE011-1" ||
                            deliveryFeeResponse.data.responseCode === "HE011-2"
                          ) {
                            copyMeta[i].deliveryFeasibility = false;
                            copyMeta[i].deliveryFee = 0;
                            copyMeta[i].deliveryRebate = 0;
                          } else {
                            alert(
                              "Something went wrong while fetching estimated delivery. Please try again later!"
                            );
                          }
                        } else {
                          alert(
                            "Something went wrong while fetching estimated delivery. Please try again later!!"
                          );
                        }
                      } else {
                        copyMeta[i].deliveryFeasibility = true;
                        copyMeta[i].deliveryFee = 0;
                        copyMeta[i].deliveryRebate = 0;
                      }
                    } else {
                      // remove this object itself
                      setInactiveChefsRemovalModal(true);
                      copyMeta.splice([i], 1);
                      cartItems.splice([i], 1);
                      updateCart(cartItems);
                      setMetaData(copyMeta);
                    }
                  } else {
                    alert(
                      "Something went wrong while fetching home chef details. Please try again later!"
                    );
                  }
                } else {
                  alert(
                    "Something went wrong while fetching home chef details. Please try again later!!"
                  );
                }
              } else if (cartObj.cloudKitchenId !== null) {
                let params = {
                  id: cartObj.cloudKitchenOutletId,
                  orderType: cartObj.orderType,
                  preOrderDate: cartObj.preOrderDate,
                  preOrderDay: cartObj.preOrderDay,
                  deliverySlot: cartObj.deliverySlot,
                };
                let outletResponse = await invokeApi(
                  config.apiDomains.orderService + apiList.getOutlet,
                  params,
                  cookies
                );
                if (
                  outletResponse.status >= 200 &&
                  outletResponse.status < 300
                ) {
                  if (outletResponse.data.responseCode === "200") {
                    if (outletResponse.data.outlet !== null) {
                      // Update metaData with outlet details
                      copyMeta[i].chefName =
                        outletResponse.data.outlet.cloudKitchenName;
                      copyMeta[i].outletName =
                        outletResponse.data.outlet.outletName;
                      copyMeta[i].profileImage =
                        outletResponse.data.outlet.profileImage;
                      copyMeta[i].chefState = outletResponse.data.outlet.state;
                      copyMeta[i].chefCity = outletResponse.data.outlet.city;
                      copyMeta[i].chefLocality =
                        outletResponse.data.outlet.locality;
                      copyMeta[i].chefLatitude =
                        outletResponse.data.outlet.latitude;
                      copyMeta[i].chefLongitude =
                        outletResponse.data.outlet.longitude;
                      copyMeta[i].averageRating =
                        outletResponse.data.outlet.averageRating;
                      copyMeta[i].noOfRatings =
                        outletResponse.data.outlet.noOfRatings;
                      copyMeta[i].chefPlatformFee =
                        outletResponse.data.outlet.coPlatformFee;
                      copyMeta[i].openStatus = true;
                      if (!!copyMeta[i].userAddressId && !!userData?.user) {
                        let userAddress = userData?.user?.addresses?.filter(
                          (el) => el.id === copyMeta[i].userAddressId
                        );
                        if (!!userAddress && userAddress.length > 0) {
                          copyMeta[i].userLatitude = userAddress[0].latitude;
                          copyMeta[i].userLongitude = userAddress[0].longitude;
                          copyMeta[i].addressTag = userAddress[0].addressTag;
                        }
                      } else {
                        copyMeta[i].addressTag = "Self Pickup";
                      }
                      // Update rebate and maxCapacity from outlet details to metaData
                      let deliveryRebate = 0;
                      for (let j = 0; j < cartObj?.foodItems.length; j++) {
                        let filterFood =
                          outletResponse.data.outlet.foodItems.filter(
                            (el) => el.id === cartObj.foodItems[j].foodItemId
                          );
                        if (filterFood.length > 0) {
                          copyMeta[i].foodItems[j].status = "Active";
                          copyMeta[i].foodItems[j].prevSellingPrice =
                            cartItems[i].foodItems[j].sellingPrice;
                          copyMeta[i].foodItems[j].sellingPrice =
                            filterFood[0].sellingPrice;
                          copyMeta[i].foodItems[j].rebate =
                            filterFood[0].rebate;
                          copyMeta[i].foodItems[j].maxCapacity =
                            filterFood[0].maxCapacity;
                          copyMeta[i].foodItems[j].currentAvailability =
                            filterFood[0].currentAvailability;
                          copyMeta[i].foodItems[j].packingCharges =
                            filterFood[0].packingCharges;
                          copyMeta[i].foodItems[j].minOrderQuantity =
                            filterFood[0].minOrderQuantity;
                        } else {
                          copyMeta[i].foodItems[j].status = "InActive";
                          copyMeta[i].foodItems[j].prevSellingPrice =
                            cartItems[i].foodItems[j].sellingPrice;
                          // copyMeta[i].foodItems[j].sellingPrice = filterFood[0].sellingPrice;
                          copyMeta[i].foodItems[j].rebate = 0;
                          copyMeta[i].foodItems[j].maxCapacity = 0;
                          copyMeta[i].foodItems[j].currentAvailability = "Off";
                        }
                        deliveryRebate +=
                          copyMeta[i].foodItems[j].rebate *
                          copyMeta[i].foodItems[j].quantity;
                      }
                      copyMeta[i].deliveryRebate = deliveryRebate;

                      // get estimated delivery charges

                      if (
                        copyMeta[i].deliveryType === "doorDelivery" &&
                        cartObj.userAddressId !== null
                      ) {
                        let params = {
                          cloudKitchenOutletId: outletResponse.data.outlet.id,
                          userAddressId: cartObj.userAddressId,
                        };
                        let deliveryFeeResponse = await invokeApi(
                          config.apiDomains.orderService +
                            apiList.getDeliveryChargesEstimate,
                          params,
                          cookies
                        );
                        if (
                          deliveryFeeResponse.status >= 200 &&
                          deliveryFeeResponse.status < 300
                        ) {
                          if (deliveryFeeResponse.data.responseCode === "200") {
                            copyMeta[i].deliveryFeasibility = true;
                            // Delivery fee
                            let estimatedPrice = parseFloat(
                              deliveryFeeResponse.data.estimatedPrice
                            );
                            copyMeta[i].deliveryFee = estimatedPrice;

                            // Adjust delivery rebate
                            if (copyMeta[i].deliveryRebate > estimatedPrice) {
                              copyMeta[i].deliveryRebate = estimatedPrice;
                            }
                          } else if (
                            deliveryFeeResponse.data.responseCode ===
                              "HE011-1" ||
                            deliveryFeeResponse.data.responseCode === "HE011-2"
                          ) {
                            copyMeta[i].deliveryFeasibility = false;
                            copyMeta[i].deliveryFee = 0;
                            copyMeta[i].deliveryRebate = 0;
                          } else {
                            alert(
                              "Something went wrong while fetching estimated delivery. Please try again later!"
                            );
                          }
                        } else {
                          alert(
                            "Something went wrong while fetching estimated delivery. Please try again later!!"
                          );
                        }
                      } else {
                        copyMeta[i].deliveryFeasibility = true;
                        copyMeta[i].deliveryFee = 0;
                        copyMeta[i].deliveryRebate = 0;
                      }
                    } else {
                      // remove this object itself
                      setInactiveChefsRemovalModal(true);
                      copyMeta.splice([i], 1);
                      cartItems.splice([i], 1);
                      updateCart(cartItems);
                      setMetaData(copyMeta);
                    }
                  } else {
                    alert(
                      "Something went wrong while fetching outlet details. Please try again later!"
                    );
                  }
                } else {
                  alert(
                    "Something went wrong while fetching outlet details. Please try again later!!"
                  );
                }
              }
            }
            // // Invoke first order
            // setInvokeFirstOrder(true);
            updateGrandTotals(copyMeta);
            setInvokeVerifyStock(true);
            setProceedToPayStep(0);
          }
          setIsLoading(false);
        } else {
          alert(
            "Something went wrong while fetching cart details. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching cart details. Please try again later!!"
        );
      }
    };

    if (
      invokeGetCart &&
      !isUserDataFetching &&
      !!userData?.user &&
      !!gstPercent
    ) {
      setInvokeGetCart(false);
      getCart();
    }
  }, [
    cookies,
    gstPercent,
    isUserDataFetching,
    invokeGetCart,
    navigate,
    updateCart,
    updateGrandTotals,
    userData,
  ]);

  // verifying stock on page load
  useEffect(() => {
    const verifyStockFirstLoad = async () => {
      let params = {
        cartData: cartData,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.verifyStock,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setStockStatus(true);
        } else if (response.data.responseCode === "HE010") {
          setProceedToPayStep(2); // 2 : One or more item(s) in your cart has insufficient stock
          setStockStatus(false);
        } else {
          alert(
            "Something went wrong while verifying stock. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while verifying stock. Please try again later!!"
        );
      }
    };
    if (invokeVerifyStock) {
      setInvokeVerifyStock(false);
      verifyStockFirstLoad();
    }
  }, [invokeVerifyStock, cartData, cookies]);

  // create order
  useEffect(() => {
    // razorpay payment success
    const razorPaymentSuccess = async (orderId, responseSuccess) => {
      let params = {
        razorpayOrderId: orderId,
        razorpayPaymentId: responseSuccess.razorpay_payment_id,
        razorpaySignature: responseSuccess.razorpay_signature,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.updateOrderPaymentSuccess,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          updateCart([]);
          setMetaData([]);
          setProceedToPayStep(4); // 4 : after payment success
        } else {
          alert(
            "Something went wrong while updating payment status as Success. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while updating payment status as Success. Please try again later!!"
        );
      }
    };

    // razorpay payment failure
    const razorPaymentFailure = async (orderId, responseFailure) => {
      let params = {
        razorpayOrderId: orderId,
        razorpayPaymentId: responseFailure.error.metadata.payment_id,
        errorCode: responseFailure.error.code,
        errorDescription: responseFailure.error.description,
        errorSource: responseFailure.error.source,
        errorStep: responseFailure.error.step,
        errorReason: responseFailure.error.reason,
        errorMetadataOrderId: responseFailure.error.metadata.order_id,
        errorMetadataPaymentId: responseFailure.error.metadata.payment_id,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.updateOrderPaymentFailure,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setProceedToPayStep(5); // 5 : after payment failure
        } else {
          alert(
            "Something went wrong while updating payment status as Failure. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while updating payment status as Failure. Please try again later!!"
        );
      }
    };

    const createOrder = async () => {
      setProceedToPayStep(3); // 3 : Please wait while we are creating your order(s)
      let totalAmount = metaData
        ?.map((el) => +el.grandTotal)
        .reduce((sum, val) => sum + val, 0)
        .toFixed(2);

      let params = {
        totalAmount,
        orders: metaData,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.createOrder,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setProceedToPayStep(0);
          if (totalAmount > 0) {
            const ldScrpt = await loadScript(
              "https://checkout.razorpay.com/v1/checkout.js"
            );
            if (!ldScrpt) {
              alert("Razorpay SDK failed to load. Are you online?");
              return;
            }
            let options = {
              key: config.razorpayKey,
              name: "CheffyHub",
              image: config.images.logo,
              order_id: response.data.razorpayOrderId,
              prefill: {
                name: userData?.user.fullName,
                email: userData?.user.email ?? "",
                contact: userData?.user.mobileNumber,
              },
              theme: {
                color: config.primaryColor,
              },
              handler: async (responseSuccess) => {
                razorPaymentSuccess(
                  response.data.razorpayOrderId,
                  responseSuccess
                );
              },
            };

            let razorpayWindow = new window.Razorpay(options);
            razorpayWindow.on("payment.failed", async (responseFailure) => {
              razorPaymentFailure(
                response.data.razorpayOrderId,
                responseFailure
              );
            });
            razorpayWindow.open();
          } else {
            updateCart([]);
            setMetaData([]);
            setProceedToPayStep(4); // 4 : after payment success
          }
        } else {
          alert(
            "Something went wrong while creating order. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while creating order. Please try again later!!"
        );
      }
    };

    if (invokeCreateOrder) {
      setInvokeCreateOrder(false);
      createOrder();
    }
  }, [invokeCreateOrder, cookies, metaData, userData, dispatch, updateCart]);

  return (
    <div>
      <Header />
      {isLoading ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", mx: "27px" }}>
          {/* cart data */}
          {metaData?.length > 0 ? (
            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "70%",
                  lg: "60%",
                  xl: "50%",
                },
              }}
            >
              {/* Order type tabs */}
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: "342px",
                  // height: "64px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "20px",
                  my: "24px",
                }}
              >
                {/* Instant Order */}
                <Box
                  onClick={() => {
                    setOrderType("instant");
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    // padding: "20px 25px",
                    gap: "10px",
                    width: "171px",
                    height: "64px",
                    background:
                      orderType === "instant"
                        ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                        : "",
                    boxShadow:
                      orderType === "instant"
                        ? "0px 10px 30px rgba(255, 120, 77, 0.33)"
                        : "",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  {/* Instant Order text */}
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontStyle: "normal",
                      fontWeight: orderType === "instant" ? 700 : 400,
                      fontSize: "16px",
                      lineHeight: "150%",
                      color: orderType === "instant" ? "#FCFCFC" : "#2A3037",
                    }}
                  >
                    Instant Order
                  </Typography>
                  {/* Orders count */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      // padding: "10px",
                      gap: "10px",
                      width: "22px",
                      height: "22px",
                      background:
                        orderType === "instant" ? "#FCFCFC" : "#FF774C",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography
                      variant="bodybold"
                      sx={{
                        fontSize: "9px",
                        background:
                          orderType === "instant"
                            ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                            : "#FF774C",
                        WebkitBackgroundClip: "text",
                        // WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        // textFillColor: "transparent",
                        color: orderType === "instant" ? "#FF774C" : "#FCFCFC",
                      }}
                    >
                      {
                        cartData?.filter((el) => el.orderType === "instant")
                          .length
                      }
                    </Typography>
                  </Box>
                </Box>
                {/* Preorder */}
                <Box
                  onClick={() => {
                    setOrderType("preorder");
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    // padding: "20px 25px",
                    gap: "10px",
                    width: "171px",
                    height: "64px",
                    background:
                      orderType === "preorder"
                        ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                        : "",
                    boxShadow:
                      orderType === "preorder"
                        ? "0px 10px 30px rgba(255, 120, 77, 0.33)"
                        : "",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  {/* Preorder text */}
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      fontStyle: "normal",
                      fontWeight: orderType === "preorder" ? 700 : 400,
                      fontSize: "16px",
                      lineHeight: "150%",
                      color: orderType === "preorder" ? "#FCFCFC" : "#2A3037",
                    }}
                  >
                    Preorder
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      // padding: "10px",
                      gap: "10px",
                      width: "22px",
                      height: "22px",
                      background:
                        orderType === "preorder" ? "#FCFCFC" : "#FF774C",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography
                      variant="bodybold"
                      sx={{
                        fontSize: "9px",
                        background:
                          orderType === "preorder"
                            ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                            : "#FF774C",
                        WebkitBackgroundClip: "text",
                        // WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        // textFillColor: "transparent",
                        color: orderType === "preorder" ? "#FF774C" : "#FCFCFC",
                      }}
                    >
                      {
                        cartData?.filter((el) => el.orderType === "preorder")
                          .length
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {metaData?.filter((el) => el.orderType === orderType).length >
              0 ? (
                <>
                  {metaData
                    .filter((elem) => elem.orderType === orderType)
                    .map((el, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          boxSizing: "border-box",
                          display: "flex",
                          // flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "8px",
                          // gap: "20px",
                          // width: "820px",
                          // height: "954px",
                          background: "#FFFFFF",
                          border: "1px solid #DFE2E6",
                          borderRadius: "24px",
                          my: 3,
                          width: "100%",
                        }}
                      >
                        <Accordion
                          expanded={el.openStatus ? true : false}
                          sx={{ width: "100%", boxShadow: "none" }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMoreIcon
                                sx={{
                                  border: "1px solid",
                                  borderRadius: "50%",
                                }}
                                onClick={() => toggleExpandButton(el)}
                              />
                            }
                            aria-controls={orderType + idx + "content"}
                            id={orderType + idx}
                          >
                            {/* Chef details */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "flex-start",
                                gap: "13px",
                                alignSelf: "stretch",
                                // padding: "16px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(
                                  !!el.homeChefId
                                    ? "/chef/" +
                                        el.chefName.replace(/\s+/g, "-") +
                                        "/" +
                                        el.homeChefId
                                    : "/restaurant/" +
                                        el.chefName.replace(/\s+/g, "-") +
                                        "/" +
                                        el.cloudKitchenOutletId
                                )
                              }
                            >
                              {/* Inner box image name and chef details */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  // alignItems: "center",
                                  padding: "0px",
                                  gap: "10px",
                                  alignSelf: "stretch",
                                  position: "relative",
                                }}
                              >
                                {/* Image */}
                                <Box
                                  component="img"
                                  sx={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "15px",
                                  }}
                                  src={el.profileImage}
                                />

                                {/* Ribbon tag */}
                                <Box
                                  component="img"
                                  sx={{
                                    position: "absolute",
                                    top: "64px",
                                    left: "-7px",
                                  }}
                                  src={
                                    !!el.homeChefId
                                      ? "/media/svg/home-chef-ribbon.svg"
                                      : "/media/svg/restaurant-ribbon.svg"
                                  }
                                />

                                {/* right div chef details */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    padding: "0px",
                                    gap: "15px",
                                    // flexGrow: 1,
                                    width: `calc(100% - 100px - 10px)`, // image 100px; gap 10px;
                                  }}
                                >
                                  {/* Chef name text */}
                                  <Typography
                                    variant="header4"
                                    // sx={{
                                    //   whiteSpace: "nowrap",
                                    //   overflow: "hidden",
                                    //   textOverflow: "ellipsis",
                                    //   width: "100%",
                                    // }}
                                  >
                                    {!!el.homeChefId
                                      ? el.chefName
                                      : `${el.chefName} - ${el.outletName}`}
                                  </Typography>
                                  {/* Rating and kilometers */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      padding: "0px",
                                      gap: "20px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {/* Rating and star icon div */}
                                    {el.noOfRatings >= 10 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "5px",
                                          // width: "97.82px",
                                          // height: "24px",
                                          flex: "none",
                                          order: "0",
                                          flexGrow: "0",
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          sx={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                          src="/media/svg/rating.svg"
                                        />
                                        <Typography
                                          variant="bodyparagraph"
                                          sx={{ color: "#4D4D4D" }}
                                        >
                                          {el.averageRating.toFixed(1)} (
                                          {ratingsGroup(el.noOfRatings)})
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* Marker icon and kilometers  */}
                                    {el.deliveryType === "doorDelivery" && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "5px",
                                        }}
                                      >
                                        {/* Marker icon */}
                                        <Box
                                          component="img"
                                          sx={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                          src="/media/svg/marker-filled.svg"
                                        />
                                        {/* Kilometer text */}
                                        <Typography
                                          variant="bodyparagraph"
                                          sx={{ color: "#4D4D4D" }}
                                        >
                                          {el.kms ??
                                            getDistanceFromLatLonInKm(
                                              el.userLatitude,
                                              el.userLongitude,
                                              el.chefLatitude,
                                              el.chefLongitude
                                            )}
                                          km
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>

                                  {/* City and locality */}
                                  <Typography
                                    variant="bodyparagraph"
                                    sx={{
                                      color: "#4D4D4D",
                                      // width: "100%",
                                      // whiteSpace: "nowrap",
                                      // overflow: "hidden",
                                      // textOverflow: "ellipsis",
                                    }}
                                  >
                                    {el.chefLocality + ", " + el.chefCity}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails sx={{ width: "calc(100% - 32px)" }}>
                            {/* Deliver to */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                // padding: "0px 10px",
                                gap: "10px",
                                mb: "20px",
                                flexWrap: "wrap",
                              }}
                            >
                              {el.deliveryType === "doorDelivery" && (
                                <Typography variant="bodyparagraph">
                                  Deliver to
                                </Typography>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  padding: "0px",
                                  gap: "10px",
                                }}
                              >
                                <Box
                                  component="img"
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                  }}
                                  src={
                                    el.addressTag === "Home"
                                      ? "/media/svg/home-filled-orange.svg"
                                      : el.addressTag === "Work"
                                      ? "/media/svg/work-filled-orange.svg"
                                      : "/media/svg/marker-filled-orange.svg"
                                  }
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "1px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setShowAddressPickerModal(true);
                                    findElementInAddress(el);
                                    CheckAddressForDunzo(el);
                                    setDeliveryType(el.deliveryType);
                                  }}
                                >
                                  <Typography
                                    variant="bodybold"
                                    sx={{
                                      background:
                                        "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                      backgroundClip: "text",
                                      textFillColor: "transparent",
                                    }}
                                  >
                                    {el.addressTag}
                                  </Typography>
                                  <Box
                                    sx={{
                                      width: "15px",
                                      height: "15px",
                                    }}
                                    component={"img"}
                                    src="/media/svg/dropdown-orange.svg"
                                  />
                                </Box>
                              </Box>
                              {el.orderType === "preorder" && (
                                <Typography variant="bodyparagraph">
                                  on{" "}
                                  {format(
                                    new Date(el.preOrderDate),
                                    "LLL dd, EEE"
                                  )}{" "}
                                  (
                                  {/* {
                                    preorderSlots.filter(
                                      (sl) => sl.id === el.preorderSlotId
                                    )[0].slot
                                  } */}
                                  {el.deliverySlot})
                                </Typography>
                              )}
                            </Box>

                            {/* Check delivery service unavailable */}
                            {!el.deliveryFeasibility && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Box
                                  component={"img"}
                                  sx={{
                                    width: "24px",
                                    height: "24px",
                                  }}
                                  src="/media/svg/error-exclaim-filled.svg"
                                />
                                <Typography
                                  variant="bodyregular"
                                  sx={{
                                    color: "#F44336",
                                    ml: 1,
                                  }}
                                >
                                  Delivery service unavailable. Please change
                                  location or self pickup your order.
                                </Typography>
                              </Box>
                            )}

                            {/* Food Items */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                padding: "0px",
                                gap: "7px",
                                width: "100%",
                              }}
                            >
                              {el.foodItems.map((item, indx) => (
                                <Box
                                  key={indx}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    py: "20px",
                                    px: "8px",
                                    gap: "10px",
                                    width: "calc(100% - 16px)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      // gap: "34px",
                                      width: "100%",
                                      alignSelf: "stretch",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "calc(100% - 70px)", // 70px for price x quantity on the right
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                          padding: "0px",
                                          gap: "10px",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "10px",
                                          }}
                                        >
                                          <Box
                                            component="img"
                                            sx={{
                                              width: "21px",
                                              height: "21px",
                                            }}
                                            src={
                                              item.vegNonVeg === "Veg"
                                                ? "/media/svg/veg.svg"
                                                : "/media/svg/non-veg.svg"
                                            }
                                          />
                                          <Typography variant="bodybold">
                                            {item.foodItemName}
                                          </Typography>
                                        </Box>
                                        {item.mrp > item.sellingPrice ? (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              alignItems: "center",
                                              padding: "0px",
                                              gap: "6px",
                                              // width: "53.77px",
                                              // height: "41px",
                                            }}
                                          >
                                            <Typography
                                              variant="bodyregular"
                                              sx={{
                                                textDecorationLine:
                                                  "line-through",
                                              }}
                                            >
                                              ₹ {item.mrp}
                                            </Typography>
                                            <Typography variant="bodyparagraph">
                                              ₹ {item.sellingPrice}
                                            </Typography>
                                          </Box>
                                        ) : (
                                          <Typography variant="bodyparagraph">
                                            ₹ {item.sellingPrice}
                                          </Typography>
                                        )}
                                      </Box>

                                      {/* Increment and Decrement options */}
                                      <Box
                                        sx={{
                                          boxSizing: "border-box",
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          width: "129px",
                                          height: "40px",
                                          borderRadius: "10px",
                                        }}
                                      >
                                        {/* Decrement button */}
                                        <Box
                                          onClick={() => {
                                            decrementQuantity(
                                              item.foodItemId,
                                              el,
                                              item.minOrderQuantity
                                            );
                                          }}
                                          sx={{
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "10px",
                                            gap: "10px",
                                            width: "38px",
                                            height: "40px",
                                            borderRadius: "10px 0px 0px 10px",
                                            flex: "none",
                                            order: "0",
                                            alignSelf: "stretch",
                                            flexGrow: "0",
                                            border: "1px solid #F28705",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {item.quantity ===
                                          item.minOrderQuantity ? (
                                            <Box
                                              component="img"
                                              sx={{
                                                width: "14px",
                                                height: "14px",
                                              }}
                                              src={
                                                "/media/svg/delete-filled-orange.svg"
                                              }
                                            />
                                          ) : (
                                            <Box
                                              component="img"
                                              sx={{
                                                width: "14px",
                                                height: "2.33px",
                                              }}
                                              src={"/media/svg/minus.svg"}
                                            />
                                          )}
                                        </Box>

                                        {/* Quantity */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            // padding: "10px 15px",
                                            gap: "10px",
                                            width: "50px",
                                            height: "40px",
                                            flex: "none",
                                            order: "1",
                                            flexGrow: "0",
                                            borderTop: "1px solid #F28705",
                                            borderBottom: "1px solid #F28705",
                                            boxSizing: "border-box",
                                            padding: "10px",
                                          }}
                                        >
                                          <Typography
                                            variant="bodybold"
                                            sx={{
                                              background:
                                                "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                              WebkitBackgroundClip: "text",
                                              WebkitTextFillColor:
                                                "transparent",
                                              backgroundClip: "text",
                                              textFillColor: "transparent",
                                            }}
                                          >
                                            {item.quantity}
                                          </Typography>
                                        </Box>

                                        {/* Increment button */}
                                        <Box
                                          onClick={() => {
                                            if (
                                              el.deliveryType ===
                                                "selfPickup" ||
                                              totalWeightInCart(idx) <
                                                config.dunzoMaxWeight
                                            ) {
                                              if (
                                                orderType === "instant" ||
                                                (orderType === "preorder" &&
                                                  el.foodItems[indx]
                                                    .maxCapacity >
                                                    item.quantity)
                                              ) {
                                                incrementQuantity(
                                                  item.foodItemId,
                                                  el
                                                );
                                              } else {
                                                toast.info(
                                                  "Max allowed quantity for this item, at the moment, has reached!"
                                                );
                                              }
                                            } else {
                                              toast.info(
                                                "Your cart has reached max allowed weight. Please place this order and consider adding additional items to new order."
                                              );
                                            }
                                          }}
                                          sx={{
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "10px",
                                            gap: "10px",
                                            width: "38px",
                                            height: "40px",
                                            borderRadius: "0px 10px 10px 0px",
                                            flex: "none",
                                            order: "2",
                                            alignSelf: "stretch",
                                            flexGrow: "0",
                                            border: "1px solid #F28705",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <Box
                                            component="img"
                                            sx={{
                                              width: "14px",
                                              height: "14px",
                                            }}
                                            src="/media/svg/plus.svg"
                                          />
                                        </Box>
                                      </Box>
                                    </Box>

                                    {/* Price x quantity */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                        width: "70px",
                                      }}
                                    >
                                      <Typography
                                        variant="bodybold"
                                        sx={{
                                          textAlign: "right",
                                        }}
                                      >
                                        ₹ {item.sellingPrice * item.quantity}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* No Stock */}
                                  {(item.status !== "Active" ||
                                    (orderType === "instant" &&
                                      item.currentAvailability === "Off") ||
                                    (orderType === "preorder" &&
                                      item.maxCapacity === 0)) && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "15px",
                                        width: "100%",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "10px",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          sx={{
                                            width: "24px",
                                            height: "24px",
                                          }}
                                          src="/media/svg/error-exclaim-filled.svg"
                                        />
                                        <Typography
                                          variant="bodyregular"
                                          sx={{
                                            color: "#F44336",
                                          }}
                                        >
                                          Item Unavailable
                                        </Typography>
                                      </Box>
                                      <Box
                                        onClick={() =>
                                          removeUnavailableFoodItem(el, indx)
                                        }
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "9px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          sx={{
                                            width: "24px",
                                            height: "24px",
                                          }}
                                          src="/media/svg/delete-filled-red.svg"
                                        />
                                        <Typography
                                          variant="bodyregular"
                                          sx={{
                                            color: "#F44336",
                                          }}
                                        >
                                          Remove Item
                                        </Typography>
                                      </Box>
                                    </Box>
                                  )}

                                  {/* Less stock for preorder */}
                                  {orderType === "preorder" &&
                                    item.maxCapacity > 0 &&
                                    item.maxCapacity < item.quantity && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          gap: "15px",
                                          width: "100%",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "10px",
                                          }}
                                        >
                                          <Box
                                            component={"img"}
                                            sx={{
                                              width: "24px",
                                              height: "24px",
                                            }}
                                            src="/media/svg/error-exclaim-filled.svg"
                                          />
                                          <Typography
                                            variant="bodyregular"
                                            sx={{
                                              color: "#F44336",
                                            }}
                                          >
                                            Available quantity is{" "}
                                            {item.maxCapacity}. Please reduce.
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )}

                                  {/* Price check */}
                                  {item.sellingPrice !==
                                    item.prevSellingPrice && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: "10px",
                                      }}
                                    >
                                      <Box
                                        component={"img"}
                                        sx={{
                                          width: "24px",
                                          height: "24px",
                                        }}
                                        src="/media/svg/info-filled-blue.svg"
                                      />
                                      <Typography
                                        variant="bodyregular"
                                        sx={{ color: "#2196F3" }}
                                      >
                                        Price has been changed from ₹
                                        {item.prevSellingPrice} to ₹
                                        {item.sellingPrice}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>

                            {el.deliveryType === "doorDelivery" &&
                              el.weightExceeded && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    mt: 2,
                                    gap: "10px",
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      width: "24px",
                                      height: "24px",
                                    }}
                                    src="/media/svg/error-exclaim-filled.svg"
                                  />
                                  <Typography
                                    variant="bodyregular"
                                    sx={{
                                      color: "#F44336",
                                    }}
                                  >
                                    Max delivery weight for an order has
                                    exceeded. Please reduce the quantity or
                                    change to self-pickup.
                                  </Typography>
                                </Box>
                              )}
                            {/* Textfiled for instructions */}
                            <TextField
                              multiline
                              value={el.instructions ?? ""}
                              onChange={(ev) => {
                                let copy = JSON.parse(JSON.stringify(metaData));
                                let findElement = copy?.findIndex(
                                  (ele) =>
                                    ele.orderType === el.orderType &&
                                    ele.preOrderDate === el.preOrderDate &&
                                    ele.deliverySlot === el.deliverySlot &&
                                    ele.homeChefId === el.homeChefId &&
                                    ele.cloudKitchenOutletId ===
                                      el.cloudKitchenOutletId &&
                                    ele.deliveryType === el.deliveryType &&
                                    ele.userAddressId === el.userAddressId
                                );
                                copy[findElement].instructions =
                                  ev.target.value ?? "";
                                setMetaData(copy);
                              }}
                              inputProps={{ maxLength: 300 }}
                              rows={3}
                              placeholder="Write instructions to chef"
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                alignSelf: "stretch",
                                "& fieldset": {
                                  border: "1px solid #DFE2E6",
                                  borderRadius: "20px",
                                },
                                "& .MuiInputBase-root": {
                                  width: "100%",
                                },
                                "& .MuiOutlinedInput-root": {
                                  padding: "12px",
                                },
                              }}
                            />
                            {/* Price summary */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "10px",
                                mt: 3,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  // alignItems: "center",
                                  gap: "10px",
                                  width: "100%",
                                }}
                              >
                                {/* first time discount */}
                                {/* {!!el.itemsDiscount && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      alignSelf: "stretch",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      First Order Discount
                                    </Typography>
                                    <Typography variant="bodyparagraph">
                                      - ₹ {el.itemsDiscount.toFixed(2)}
                                    </Typography>
                                  </Box>
                                )} */}

                                {/* totalPackingCharges */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    alignSelf: "stretch",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    Packing Charges
                                  </Typography>
                                  <Typography variant="bodyparagraph">
                                    ₹ {el.totalPackingCharges.toFixed(2)}
                                  </Typography>
                                </Box>

                                {/* Referral  Code */}
                                {!!el.isFirstOrder &&
                                  !(
                                    !!el.referralDiscount || !!el.couponDiscount
                                  ) && (
                                    <form
                                      onSubmit={(ev) =>
                                        verifyingCoupon(ev, el.cartIdx)
                                      }
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          // gap: "5px",
                                        }}
                                      >
                                        <Typography variant="bodymetatag">
                                          Do you have any referral / coupon
                                          code?
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "20px",
                                          }}
                                        >
                                          <TextField
                                            id="couponCode"
                                            label="Referral / Coupon Code"
                                            value={el.couponCode ?? ""}
                                            size="small"
                                            onChange={(ev) => {
                                              let copy = JSON.parse(
                                                JSON.stringify(metaData)
                                              );
                                              let findElement = copy?.findIndex(
                                                (ele) =>
                                                  ele.orderType ===
                                                    el.orderType &&
                                                  ele.preOrderDate ===
                                                    el.preOrderDate &&
                                                  ele.deliverySlot ===
                                                    el.deliverySlot &&
                                                  ele.homeChefId ===
                                                    el.homeChefId &&
                                                  ele.cloudKitchenOutletId ===
                                                    el.cloudKitchenOutletId &&
                                                  ele.deliveryType ===
                                                    el.deliveryType &&
                                                  ele.userAddressId ===
                                                    el.userAddressId
                                              );
                                              copy[findElement].couponCode =
                                                ev.target.value
                                                  .toUpperCase()
                                                  .replace(/[^A-Z0-9]/g, "");
                                              copy[
                                                findElement
                                              ].couponError = false;
                                              copy[
                                                findElement
                                              ].couponHelperText = "";
                                              copy[findElement].cartIdx =
                                                findElement;
                                              setMetaData(copy);
                                            }}
                                            error={el.couponError}
                                            helperText={el.couponHelperText}
                                            sx={{
                                              mt: 1,
                                              width: "216px",
                                              "& fieldset": {
                                                border: "1px solid #AAACAE",
                                                borderRadius: "15px",
                                              },
                                            }}
                                            inputProps={{
                                              maxLength: 15,
                                            }}
                                          />
                                          {el.couponCode?.length >= 6 && (
                                            <Button
                                              variant="text"
                                              type="submit"
                                              sx={{ textTransform: "none" }}
                                            >
                                              <Typography
                                                variant="bodybold"
                                                sx={{ fontSize: "14px" }}
                                              >
                                                Verify
                                              </Typography>
                                            </Button>
                                          )}
                                        </Box>
                                      </Box>
                                    </form>
                                  )}

                                {!el.isFirstOrder && !el.couponDiscount && (
                                  <form
                                    onSubmit={(ev) =>
                                      verifyingCoupon(ev, el.cartIdx)
                                    }
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <Typography variant="bodymetatag">
                                        Do you have any coupon code?
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "20px",
                                        }}
                                      >
                                        <TextField
                                          id="couponCode"
                                          label="Coupon Code"
                                          value={el.couponCode ?? ""}
                                          size="small"
                                          onChange={(ev) => {
                                            let copy = JSON.parse(
                                              JSON.stringify(metaData)
                                            );
                                            let findElement = copy?.findIndex(
                                              (ele) =>
                                                ele.orderType ===
                                                  el.orderType &&
                                                ele.preOrderDate ===
                                                  el.preOrderDate &&
                                                ele.deliverySlot ===
                                                  el.deliverySlot &&
                                                ele.homeChefId ===
                                                  el.homeChefId &&
                                                ele.cloudKitchenOutletId ===
                                                  el.cloudKitchenOutletId &&
                                                ele.deliveryType ===
                                                  el.deliveryType &&
                                                ele.userAddressId ===
                                                  el.userAddressId
                                            );
                                            copy[findElement].couponCode =
                                              ev.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, "");
                                            copy[findElement].cartIdx =
                                              findElement;
                                            copy[
                                              findElement
                                            ].couponError = false;
                                            copy[findElement].couponHelperText =
                                              "";
                                            setMetaData(copy);
                                          }}
                                          error={el.couponError}
                                          helperText={el.couponHelperText}
                                          sx={{
                                            mt: 1,
                                            width: "216px",
                                            "& fieldset": {
                                              border: "1px solid #AAACAE",
                                              borderRadius: "15px",
                                            },
                                          }}
                                          inputProps={{
                                            maxLength: 15,
                                          }}
                                        />
                                        {el.couponCode?.length >= 6 && (
                                          <Button
                                            variant="text"
                                            type="submit"
                                            sx={{ textTransform: "none" }}
                                          >
                                            <Typography
                                              variant="bodybold"
                                              sx={{ fontSize: "14px" }}
                                            >
                                              Verify
                                            </Typography>
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                  </form>
                                )}

                                {!!el.isFirstOrder && !!el.referralDiscount && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: "20px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography variant="bodyparagraph">
                                        Referral Code Applied:{" "}
                                        <Typography variant="bodybold">
                                          {el.couponCode}
                                        </Typography>
                                      </Typography>
                                      <Button
                                        sx={{
                                          textTransform: "none",
                                          p: 0,
                                          lineHeight: 0,
                                        }}
                                        onClick={() => {
                                          let copy = JSON.parse(
                                            JSON.stringify(metaData)
                                          );
                                          let findElement = copy?.findIndex(
                                            (ele) =>
                                              ele.orderType === el.orderType &&
                                              ele.preOrderDate ===
                                                el.preOrderDate &&
                                              ele.deliverySlot ===
                                                el.deliverySlot &&
                                              ele.homeChefId ===
                                                el.homeChefId &&
                                              ele.cloudKitchenOutletId ===
                                                el.cloudKitchenOutletId &&
                                              ele.deliveryType ===
                                                el.deliveryType &&
                                              ele.userAddressId ===
                                                el.userAddressId
                                          );
                                          removeCouponCode(
                                            metaData,
                                            findElement
                                          );
                                        }}
                                        variant="text"
                                      >
                                        Remove
                                      </Button>
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Typography variant="bodyparagraph">
                                        Referral Discount
                                      </Typography>
                                      <Typography variant="bodyparagraph">
                                        - ₹{" "}
                                        {parseInt(el.referralDiscount).toFixed(
                                          2
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}

                                {!!el.couponDiscount && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: "20px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography variant="bodyparagraph">
                                        Coupon Code Applied:{" "}
                                        <Typography variant="bodybold">
                                          {el.couponCode}
                                        </Typography>
                                      </Typography>
                                      <Button
                                        sx={{
                                          textTransform: "none",
                                          p: 0,
                                          lineHeight: 0,
                                        }}
                                        onClick={() => {
                                          let copy = JSON.parse(
                                            JSON.stringify(metaData)
                                          );
                                          let findElement = copy?.findIndex(
                                            (ele) =>
                                              ele.orderType === el.orderType &&
                                              ele.preOrderDate ===
                                                el.preOrderDate &&
                                              ele.deliverySlot ===
                                                el.deliverySlot &&
                                              ele.homeChefId ===
                                                el.homeChefId &&
                                              ele.cloudKitchenOutletId ===
                                                el.cloudKitchenOutletId &&
                                              ele.deliveryType ===
                                                el.deliveryType &&
                                              ele.userAddressId ===
                                                el.userAddressId
                                          );
                                          removeCouponCode(
                                            metaData,
                                            findElement
                                          );
                                        }}
                                        variant="text"
                                      >
                                        Remove
                                      </Button>
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Typography variant="bodyparagraph">
                                        Coupon Discount
                                      </Typography>
                                      <Typography variant="bodyparagraph">
                                        - ₹{" "}
                                        {parseInt(el.couponDiscount).toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}

                                {/* Checkbox for rewards discount */}
                                {!!rewardsCount &&
                                  (!!el.isRewardsClaimed ||
                                    (!el.isRewardsClaimed &&
                                      rewardsCount - rewardsClaimedTotal() >
                                        0)) && (
                                    <>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={
                                              el.isRewardsClaimed ? true : false
                                            }
                                            onChange={() => {
                                              let copy = JSON.parse(
                                                JSON.stringify(metaData)
                                              );
                                              let findElement = copy?.findIndex(
                                                (ele) =>
                                                  ele.orderType ===
                                                    el.orderType &&
                                                  ele.preOrderDate ===
                                                    el.preOrderDate &&
                                                  ele.deliverySlot ===
                                                    el.deliverySlot &&
                                                  ele.homeChefId ===
                                                    el.homeChefId &&
                                                  ele.cloudKitchenOutletId ===
                                                    el.cloudKitchenOutletId &&
                                                  ele.deliveryType ===
                                                    el.deliveryType &&
                                                  ele.userAddressId ===
                                                    el.userAddressId
                                              );

                                              copy[
                                                findElement
                                              ].isRewardsClaimed =
                                                !copy[findElement]
                                                  .isRewardsClaimed;
                                              copy[
                                                findElement
                                              ].rewardsDiscount = 0;
                                              updateGrandTotals(copy);
                                            }}
                                          />
                                        }
                                        label="Claim My Rewards"
                                      />
                                      {!!el.rewardsDiscount && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <Typography variant="bodyparagraph">
                                            Rewards Discount
                                          </Typography>
                                          <Typography variant="bodyparagraph">
                                            - ₹{" "}
                                            {parseFloat(
                                              el.rewardsDiscount
                                            ).toFixed(2)}
                                          </Typography>
                                        </Box>
                                      )}
                                    </>
                                  )}

                                {/* item total */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    alignSelf: "stretch",
                                    paddingTop: "10px",
                                    borderTop: "1px dashed #d3d3d3",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    Item Total
                                  </Typography>
                                  <Typography variant="bodyparagraph">
                                    ₹ {el.itemsTotal.toFixed(2)}
                                  </Typography>
                                </Box>

                                {/* GST */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    height: "24px",
                                    alignSelf: "stretch",
                                  }}
                                >
                                  <Tooltip
                                    open={showToolTip}
                                    onOpen={() => setShowToolTip(true)}
                                    onClose={() => setShowToolTip(false)}
                                    arrow
                                    placement="right"
                                    title={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-end",
                                          padding: "0px",
                                          background:
                                            "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                        }}
                                      >
                                        {el.igstPercentage > 0 ? (
                                          <Typography>
                                            IGST {el.igstValue}
                                          </Typography>
                                        ) : (
                                          <>
                                            <Typography>
                                              SGST {el.sgstValue}
                                            </Typography>
                                            <Typography>
                                              CGST {el.cgstValue}
                                            </Typography>
                                          </>
                                        )}
                                      </Box>
                                    }
                                  >
                                    <Typography
                                      variant="bodyparagraph"
                                      sx={{ color: "#F28705" }}
                                      onClick={() =>
                                        setShowToolTip(!showToolTip)
                                      }
                                    >
                                      GST
                                    </Typography>
                                  </Tooltip>
                                  <Typography variant="bodyparagraph">
                                    ₹{" "}
                                    {(
                                      +el.cgstValue +
                                      +el.sgstValue +
                                      +el.igstValue
                                    ).toFixed(2)}
                                  </Typography>
                                </Box>

                                {/* Delivery fees */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    height: "24px",
                                    alignSelf: "stretch",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    Delivery Fee
                                  </Typography>
                                  <Typography variant="bodyparagraph">
                                    ₹ {el.deliveryFee?.toFixed(2)}
                                  </Typography>
                                </Box>

                                {/* platform fee fees */}
                                {!!el.platformFee > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      height: "24px",
                                      alignSelf: "stretch",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Platform Fee
                                    </Typography>
                                    <Typography variant="bodyparagraph">
                                      ₹ {el.platformFee?.toFixed(2)}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Delivery discount */}
                                {!!el.deliveryRebate && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      height: "24px",
                                      alignSelf: "stretch",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Delivery Fee Discount
                                    </Typography>
                                    <Typography variant="bodyparagraph">
                                      - ₹{el.deliveryRebate.toFixed(2)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>

                              {/* Total  */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  height: "24px",
                                  alignSelf: "stretch",
                                  paddingTop: "10px",
                                  borderTop: "1px dashed #AAACAE",
                                }}
                              >
                                <Typography variant="bodybold">
                                  Total
                                </Typography>
                                <Typography variant="bodybold">
                                  ₹ {el.grandTotal}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    ))}
                </>
              ) : (
                <Box sx={{ m: 3 }}>
                  <Typography variant="bodyparagraph">
                    No{" "}
                    {orderType === "instant" ? "instant orders" : "preorders"}{" "}
                    available in your cart!
                  </Typography>
                </Box>
              )}

              {/* Total Amount and proceed to pay */}
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "25px 20px",
                  gap: "15px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "24px",
                  alignSelf: "stretch",
                  mb: 2,
                }}
              >
                <Typography variant="header4">
                  Total Amount to be paid
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                    alignSelf: "stretch",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      gap: "2px",
                    }}
                  >
                    <Typography variant="header3">
                      ₹{" "}
                      {metaData
                        ?.map((el) => +el.grandTotal)
                        .reduce((sum, val) => sum + val, 0)
                        .toFixed(2)}
                    </Typography>
                    <Typography variant="bodyregular">
                      (
                      {metaData
                        ?.map((el) => el.foodItems)
                        .flat(1)
                        ?.map((el) => el.quantity)
                        .reduce((sum, val) => sum + val, 0)}{" "}
                      items)
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => verifyStockProceed()}
                    disabled={
                      !stockStatus ||
                      handleDeliveryStatus() ||
                      handleWeightStatus()
                    }
                    variant="contained"
                  >
                    Proceed to pay
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            // Empty cart
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                justifyContent: "center",
                padding: "0px",
                mt: "45px",
                gap: "25px",
                // position: "absolute",
                // width: "380px",
                // height: "483px",
                // left: "895px",
                // top: "54px",
                // boxShadow: "-1px 0px 0px 0px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "40px",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    width: "200px",
                  }}
                  src="/media/svg/empty-cart.svg"
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0px",
                    gap: "6px",
                    // width: "355px",
                    // height: "85px",
                    flex: "none",
                    order: "1",
                    flexGrow: "0",
                  }}
                >
                  <Typography variant="header1">Empty Cart</Typography>
                  <Typography
                    variant="bodyparagraph"
                    sx={{ px: "8px", textAlign: "center" }}
                  >
                    Your cart is empty. Please go ahead and{" "}
                    <Link
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate("/")}
                      component={"span"}
                    >
                      start ordering
                    </Link>
                    .
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* pre order having past or todays date alert modal */}
      <Modal open={preordersRemovalModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: 400,
          }}
        >
          <Card
            variant="outlined"
            sx={{ width: { xs: 300, sm: 400 }, margin: "auto" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodyparagraph"
                sx={{ textAlign: "center", marginY: 1 }}
              >
                One or more of your preorders is having either today's or past
                date. They are being removed from your cart.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setPreordersRemovalModal(false);
                  }}
                >
                  Ok
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* one or more orders with chef inactive alert modal */}
      <Modal open={inactiveChefsRemovalModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: 400,
          }}
        >
          <Card
            variant="outlined"
            sx={{ width: { xs: 300, sm: 400 }, margin: "auto" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodyparagraph"
                sx={{ textAlign: "center", marginY: 1 }}
              >
                One or more chefs have become inactive. Orders from those chefs
                are being removed from your cart.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setInactiveChefsRemovalModal(false);
                  }}
                >
                  Ok
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* Modal for address drop down */}
      {/* Also used in header.js */}
      <Modal
        open={showAddressPickerModal}
        sx={{
          backgroundColor: `rgba(0,0,0, 0.6)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "11px 10px",
            gap: "10px",
            background: "#FCFCFC",
            border: "1px solid #DFE2E6",
            borderRadius: "20px",
          }}
        >
          {/* Modal header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "20px",
              // gap: "222px",
              // width: "848px",
              // height: "71px",
              background: "#FCFCFC",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: `calc(100% - 40px)`,
              justifyContent: "space-between",
            }}
          >
            {/* Modal heading text */}
            <Typography variant="header3">
              Choose the Delivery Address
            </Typography>
            {/* Modal close button */}
            <Box
              component="img"
              onClick={() => setShowAddressPickerModal(false)}
              sx={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>
          {/* Modal Body */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              // alignItems: "center",
              padding: "10px 10px 0px",
              gap: "10px",
              // width: "848px",
              // height: "313.94px",
              background: "#FCFCFC",
              flex: "none",
              order: 1,
              alignSelf: "stretch",
              flexGrow: 0,
              maxHeight: "60vh",
              overflowY: "scroll",
            }}
          >
            {/* Door delivery and self pickup div */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: "10px",
                gap: "20px",
                width: "calc(100% - 40px)",
                flexWrap: "wrap",
              }}
            >
              {/* Door delivery div */}
              <Box
                onClick={() => {
                  setDeliveryType("doorDelivery");
                }}
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "15px",
                  border:
                    deliveryType === "doorDelivery"
                      ? "1px solid #FF784D"
                      : "1px solid #DFE2E6",
                  background:
                    deliveryType === "doorDelivery" ? "#FFF8F5" : "#FFFFFF",
                  borderRadius: "15px",
                  width: { xs: "100%", md: "calc(50% - 10px)" },
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "5px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "0px",
                      gap: "5px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="header4">Door Delivery</Typography>
                    {deliveryType === "doorDelivery" && (
                      <Box
                        component={"img"}
                        sx={{
                          width: "24px",
                          height: "24px",
                        }}
                        src="/media/selected-tick.png"
                      />
                    )}
                  </Box>
                  <Typography variant="bodyparagraph">
                    I would want the order to be delivered
                  </Typography>
                </Box>
              </Box>

              {/* Self pickup div */}
              <Box
                onClick={() => {
                  setShowAddressPickerModal(false);
                  addressHandlerInCart(null);
                }}
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "15px",
                  border:
                    deliveryType === "selfPickup"
                      ? "1px solid #FF784D"
                      : "1px solid #DFE2E6",
                  background:
                    deliveryType === "selfPickup" ? "#FFF8F5" : "#FFFFFF",
                  borderRadius: "15px",
                  width: { xs: "100%", md: "calc(50% - 10px)" },
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "5px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "0px",
                      gap: "5px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="header4">Self pickup</Typography>
                    {deliveryType === "selfPickup" && (
                      <Box
                        component={"img"}
                        sx={{
                          width: "24px",
                          height: "24px",
                        }}
                        src="/media/selected-tick.png"
                      />
                    )}
                  </Box>
                  <Typography variant="bodyparagraph">
                    I would want to pickup the order by myself
                  </Typography>
                </Box>
              </Box>
            </Box>
            {/* Current location section */}
            {!userData?.user.addresses.length > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "21px",
                    // width: "828px",
                    // height: "76px",
                    flex: "none",
                    order: 0,
                    alignSelf: "stretch",
                    flexGrow: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "5px",
                      // width: "356px",
                      // height: "55px",
                      flex: "none",
                      order: 0,
                      flexGrow: 0,
                    }}
                  >
                    {/* Current location text */}
                    <Typography variant="header4">Current location</Typography>
                    <Typography variant="bodyparagraph">
                      Deliver to the current location based on GPS
                    </Typography>
                    {/* {permissionDenied ? (
                          <>
                            <Typography variant="bodyparagraph">
                              Deliver to the current location based on
                              GPS
                            </Typography>
                            <Typography variant="bodyparagraph">
                              Please allow location permission and
                              reload
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="bodyparagraph">
                            Deliver to the current location based on
                            GPS
                          </Typography>
                        )} */}
                  </Box>
                  {/* Dashed line */}
                  <Box
                    sx={{
                      // width: "828px",
                      height: "0px",
                      border: "1px dashed #AAACAE",
                      flex: "none",
                      order: 1,
                      alignSelf: "stretch",
                      flexGrow: 0,
                    }}
                  />
                </Box>
              </>
            )}

            {/* Saved address section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px",
                // width: "828px",
                // height: "217.94px",
                flex: "none",
                order: 1,
                flexGrow: 0,
              }}
            >
              {/* saved address header */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  padding: "0px 0px 10px",
                  gap: "21px",
                  // width: "828px",
                  // height: "64px",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                  // margin: "-10px 0px",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "5px",
                    // width: "828px",
                    // height: "54px",
                    flex: "none",
                    order: 0,
                    alignSelf: "stretch",
                    flexGrow: 0,
                  }}
                >
                  {/* Box for save address header and button */}
                  {userData?.user ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "0px",
                        gap: "10px",
                        // width: "828px",
                        // height: "54px",
                        flex: "none",
                        order: 0,
                        alignSelf: "stretch",
                        flexGrow: 0,
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Saved addresses text */}
                      <Typography variant="header4">Saved Addresses</Typography>
                      {/* Add address button */}
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/add-address")}
                      >
                        Add a new Address
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "0px",
                          gap: "10px",
                          // width: "828px",
                          // height: "54px",
                          // flex: "none",
                          order: 0,
                          alignSelf: "stretch",
                          // flexGrow: 0,
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="header4">
                          Saved Addresses
                        </Typography>
                        {/* Login button */}

                        <Button
                          variant="outlined"
                          onClick={() => {
                            setShowAddressPickerModal(false);
                            dispatch(loginDrawer(true));
                          }}
                          sx={{ minWidth: "120px" }}
                        >
                          Login
                        </Button>
                      </Box>
                      <Typography variant="bodyparagraph">
                        Please login to save your address
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              {/* Addresses group */}
              {isCheckAddressFetching ? (
                <Box sx={{ display: "flex", width: "100%" }}>
                  <CircularProgress sx={{ display: "flex", margin: "auto" }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    // width: "828px",
                    // height: "163.94px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "20px",
                      // position: "absolute",
                      // width: "828px",
                      // height: "143px",
                      // left: "0px",
                      // top: "74.94px",
                      flexWrap: "wrap",
                      mb: "10px",
                    }}
                  >
                    {/* UserData addresses */}
                    {addressData?.length > 0 ? (
                      <Grid container>
                        {addressData?.map((el, idx) => (
                          <Grid
                            item
                            key={idx}
                            sm={11}
                            md={5.5}
                            sx={{
                              background:
                                el.deliveryStatus === false
                                  ? "#FEECEB"
                                  : "#FCFCFC",
                              border:
                                el.deliveryStatus === false
                                  ? "1px solid #F44336"
                                  : "1px solid #DFE2E6",
                              borderRadius: "15px",
                              m: 1,
                              position: "relative",
                            }}
                          >
                            {el.isPrimary === "Yes" && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  overflow: "hidden",
                                  width: "92px",
                                  height: "92px",
                                  top: "-1px",
                                  right: "-1px",
                                  "&:before": {
                                    position: "absolute",
                                    zIndex: "-1",
                                    borderTopColor: "transparent",
                                    bordeRightColor: "transparent",
                                    top: "0px",
                                    left: "0px",
                                  },
                                  "&:after": {
                                    position: "absolute",
                                    zIndex: "-1",
                                    borderTopColor: "transparent",
                                    bordeRightColor: "transparent",
                                    bottom: "0px",
                                    right: "0px",
                                  },
                                }}
                              >
                                {/* Primary text */}
                                <Box
                                  component={"span"}
                                  sx={{
                                    position: "absolute",
                                    display: "block",
                                    width: "228px",
                                    padding: "8px 0px",
                                    backgroundColor: "#FFE3D9",
                                    color: "#FE554A",
                                    fontWeight: 400,
                                    fontSize: "15px",
                                    fontFamily: "Montserrat",
                                    textAlign: "center",
                                    left: "-48px",
                                    top: "12px",
                                    transform: `rotate(45deg)`,
                                  }}
                                >
                                  Primary
                                </Box>
                              </Box>
                            )}

                            <Box
                              key={idx}
                              onClick={() => {
                                el.deliveryStatus !== false &&
                                  addressHandlerInCart(el);
                              }}
                              sx={{
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-start",
                                padding: "15px 20px",
                                gap: "15px",
                                // width: "300px",
                                // height: "143px",
                                // background: "#FCFCFC",
                                // border: "1px solid #DFE2E6",
                                // borderRadius: "15px",
                                flex: "none",
                                order: 0,
                                flexGrow: 0,
                                cursor:
                                  el.deliveryStatus === false
                                    ? "unset !important"
                                    : "pointer",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "0px",
                                  gap: "15px",
                                  // width: "364px",
                                  // height: "113px",
                                  // flex: "none",
                                  order: 0,
                                  flexGrow: 1,
                                }}
                              >
                                {/* Icon and address tag */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "10px",
                                    // width: "90px",
                                    // height: "26px",
                                    flex: "none",
                                    order: 0,
                                    flexGrow: 0,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                    }}
                                    src={
                                      el.addressTag === "Home"
                                        ? "/media/svg/home.svg"
                                        : el.addressTag === "Work"
                                        ? "/media/svg/work.svg"
                                        : "/media/svg/marker.svg"
                                    }
                                  />
                                  <Typography variant="header4">
                                    {el.addressTag}
                                  </Typography>
                                </Box>
                                <Typography variant="bodyparagraph">
                                  {el.streetAddress +
                                    ", " +
                                    el.locality +
                                    ", " +
                                    el.city +
                                    ", " +
                                    el.state +
                                    ", " +
                                    el.pincode}
                                </Typography>
                                {el.deliveryStatus === false && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: "3px",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      sx={{
                                        height: "12px",
                                        width: "12px",
                                        pt: "3px",
                                      }}
                                      src="/media/svg/error-exclaim.svg"
                                    />
                                    <Typography
                                      variant="bodymetatag"
                                      color="#F44336"
                                    >
                                      Delivery service unavialable for this
                                      address
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <>
                        {userData?.user && (
                          <Typography variant="bodyparagraph">
                            No addresses saved yet
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* proceed to pay modal */}
      <Modal open={proceedToPayStep > 0 ? true : false}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
          }}
        >
          <Card
            variant="outlined"
            sx={{ width: { xs: 300, sm: 500 }, margin: "auto" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {proceedToPayStep === 1 ? (
                <Typography
                  variant="bodyparagraph"
                  sx={{ textAlign: "center", marginY: 1 }}
                >
                  {/* 1 : Please wait while we check for the stock */}
                  Please wait while we check for the stock
                </Typography>
              ) : proceedToPayStep === 2 ? (
                <>
                  {/* 2 : One or more item(s) in your cart has insufficient stock */}
                  <Typography
                    variant="bodyparagraph"
                    sx={{ textAlign: "center", marginY: 1 }}
                  >
                    One or more item(s) in your cart has insufficient stock.
                    Please check.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        setProceedToPayStep(0);
                      }}
                    >
                      Ok
                    </Button>
                  </Box>
                </>
              ) : proceedToPayStep === 3 ? (
                <Typography
                  variant="bodyparagraph"
                  sx={{ textAlign: "center", marginY: 1 }}
                >
                  {/* 3 : Please wait while we are creating your order(s) */}
                  Please wait while we are creating your order(s)
                </Typography>
              ) : proceedToPayStep === 4 ? (
                <>
                  {/* 4 : after payment success */}
                  <Box
                    component="img"
                    sx={{
                      width: "34px",
                      height: "34px",
                      color: "#535455",
                      flex: "none",
                      order: "0",
                      flexGrow: "0",
                    }}
                    src="/media/tick-icon.png"
                  />
                  <Typography
                    variant="bodyparagraph"
                    sx={{ textAlign: "center", marginY: 1 }}
                  >
                    Payment successful
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setProceedToPayStep(0);
                      navigate("/my-orders");
                    }}
                  >
                    Track Order
                  </Button>
                </>
              ) : proceedToPayStep === 5 ? (
                <>
                  {/* 5 : after payment failure */}
                  <Box
                    component="img"
                    sx={{
                      width: "34px",
                      height: "34px",
                      color: "#535455",
                      flex: "none",
                      order: "0",
                      flexGrow: "0",
                    }}
                    src="/media/tick-icon.png"
                  />
                  <Typography
                    variant="bodyparagraph"
                    sx={{ textAlign: "center", marginY: 1 }}
                  >
                    Payment Failed!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setProceedToPayStep(0);
                    }}
                  >
                    Retry
                  </Button>
                </>
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </div>
  );
};

export default Cart;
