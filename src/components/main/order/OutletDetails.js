import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Modal,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { config } from "../../../config/config";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiList, invokeApi } from "../../../services/apiServices";
import {
  getDistanceFromLatLonInKm,
  ratingsGroup,
} from "../../../common/common";
import Header from "../../general-components/ui-components/Header";
import Carousel from "react-material-ui-carousel";
import { loginDrawer } from "../../../global/redux/actions";
import { getCart, getUser } from "../../../global/redux/actions";
import { differenceInHours } from "date-fns";

const OutletDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies();
  const { id: outletId, outletName } = useParams();
  const itemDescRefs = useRef([]);

  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [cloudKitchenData, setCloudKitchenData] = useState(null);
  const [outletsData, setOutletsData] = useState(null);
  const [groupedFoodItems, setGroupedFoodItems] = useState([]);
  const [totalFoodItem, setTotalFoodItem] = useState(0);
  const [cartData, setCartData] = useState([]);
  const [currentCart, setCurrentCart] = useState(null);

  const [orderType, setOrderType] = useState("");
  const [deliveryType, setDeliveryType] = useState("doorDelivery");
  const [deliveryTypeNA, setDeliveryTypeNA] = useState("doorDelivery");
  const [addressId, setAddressId] = useState(null);

  const [preOrderDate, setPreOrderDate] = useState(null);
  const [preOrderDay, setPreOrderDay] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState(null);

  const [firstLoad, setFirstLoad] = useState(true);
  const [distance, setDistance] = useState(null);

  const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
  const [showAddressPickerModal, setShowAddressPickerModal] = useState(false);
  const [showAddressConfirmModal, setShowAddressConfirmModal] = useState(false);
  const [showOutletsModal, setShowOutletsModal] = useState(false);

  // Address handler
  const [addressData, setAddressData] = useState(null);
  const [invokeCheckAddress, setInvokeCheckAddress] = useState(true);
  const [isCheckAddressFetching, setIsCheckAddressFetching] = useState(false);
  const [invokeUser, setInvokeUser] = useState(true);

  const homeChefId = null;
  const [pickupLocationServiceable, setPickupLocationServiceable] =
    useState(true);

  const [openDescDialog, setOpenDescDialog] = useState(false);
  const [itemDesc, setItemDesc] = useState("");
  const [preorderHours, setPreorderHours] = useState(null);

  const totalSellingAmount = () => {
    return (
      currentCart
        .map((el) => el.foodItems)
        .flat(1)
        .map((el) => el.sellingPrice * el.quantity)
        .reduce((sum, val) => sum + val, 0) ?? 0
    );
  };

  const totalItemsInCart = () => {
    return currentCart
      ?.map((el) => el.foodItems.map((el) => el.quantity))
      .flat(1)
      .reduce((sum, val) => sum + val, 0);
  };

  const totalItemsByAddress = (el) => {
    return el.foodItems
      .map((el) => el.quantity)
      .reduce((sum, val) => sum + val, 0);
  };

  const isAddedToCart = (foodId) => {
    // check if cartData contains a matching record with same orderType, outletId, deliveryType and addressId
    // and if the foodItemId is available in foodItems
    //// if available, return quantity
    //// if not available, return 0

    let cartItems = JSON.parse(JSON.stringify(cartData));
    let cartMatch = cartItems?.filter(
      (el) =>
        el.orderType === orderType &&
        el.preOrderDate === preOrderDate &&
        el.deliverySlot === deliverySlot &&
        el.cloudKitchenOutletId === outletId &&
        el.deliveryType === deliveryType &&
        el.userAddressId === addressId
    );

    if (
      cartMatch.length > 0 &&
      cartMatch[0]?.foodItems?.filter((el) => el.foodItemId === foodId)
        ?.length > 0
    ) {
      return cartMatch[0]?.foodItems.filter((el) => el.foodItemId === foodId)[0]
        .quantity;
    } else return 0;
  };

  const addToCart = async (item) => {
    // call getCart api and save it to cartItems
    // check if any data exists in the cart already
    //// if exists, check if cartItems contains a matching record with same orderType, outletId, deliveryType and addressId
    ////// if available, check if this food item already available
    //////// if available, update quantity as 1
    //////// if not, add the foodItem entry to matching record
    ////// if not available, add the cart entry (obj) for this foodItem
    //// if not exists, add this entry and assign to cart
    // call updateCart api with the updated cartItems

    if (!cookies[config.cookieName]?.loginUserId) {
      setShowLoginConfirmModal(true);
    } else if (
      !cookies[config.preferencesCookie]?.deliveryAddress?.streetAddress
    ) {
      setShowAddressConfirmModal(true);
    } else {
      let cartItems = [];
      let params = {};
      let getResponse = await invokeApi(
        config.apiDomains.orderService + apiList.getCart,
        params,
        cookies
      );
      if (getResponse.status >= 200 && getResponse.status < 300) {
        if (getResponse.data.responseCode === "200") {
          if (JSON.parse(getResponse.data.cartData)?.length > 0) {
            cartItems = JSON.parse(getResponse.data.cartData);
            let cartMatch = cartItems?.filter(
              (el) =>
                el.orderType === orderType &&
                el.preOrderDate === preOrderDate &&
                el.deliverySlot === deliverySlot &&
                el.cloudKitchenOutletId === outletId &&
                el.deliveryType === deliveryType &&
                el.userAddressId === addressId
            );

            // chech weight
            let cartWeight = cartMatch[0]?.foodItems
              .map((el) => el.weight * el.quantity)
              .flat(1)
              .reduce((sum, val) => sum + val, 0);

            if (cartMatch?.length > 0) {
              if (
                deliveryType === "selfPickup" ||
                cartWeight + item.weight * item.minOrderQuantity <=
                  config.dunzoMaxWeight
              ) {
                if (
                  cartMatch[0]?.foodItems?.filter(
                    (el) => el.foodItemId === item.id
                  )?.length > 0
                ) {
                  cartItems.map((el) => {
                    if (
                      el.orderType === orderType &&
                      el.preOrderDate === preOrderDate &&
                      el.deliverySlot === deliverySlot &&
                      el.cloudKitchenOutletId === outletId &&
                      el.deliveryType === deliveryType &&
                      el.userAddressId === addressId
                    ) {
                      el.foodItems.map((fi) => {
                        if (fi.foodItemId === item.id) {
                          fi.quantity = item.minOrderQuantity;
                        }
                        return fi;
                      });
                    }
                    return el;
                  });
                } else {
                  cartItems.map((el) => {
                    if (
                      el.orderType === orderType &&
                      el.preOrderDate === preOrderDate &&
                      el.deliverySlot === deliverySlot &&
                      el.cloudKitchenOutletId === outletId &&
                      el.deliveryType === deliveryType &&
                      el.userAddressId === addressId
                    ) {
                      el.foodItems.push({
                        foodItemId: item.id,
                        weight: item.weight,
                        foodItemName: item.itemName,
                        vegNonVeg: item.vegNonVeg,
                        mrp: item.mrp,
                        sellingPrice: item.sellingPrice,
                        quantity: item.minOrderQuantity,
                        preorderHours: item.hoursToPreOrder,
                      });
                    }
                    return el;
                  });
                }
              } else {
                toast.info(
                  "Your cart has reached max allowed weight. Please place this order and consider adding additional items to new order."
                );
              }
            } else {
              cartItems.push({
                orderType: orderType,
                cloudKitchenOutletId: outletId,
                preOrderDate: preOrderDate,
                preOrderDay: preOrderDay,
                deliverySlot: deliverySlot,
                homeChefId: homeChefId,
                deliveryType: deliveryType,
                userAddressId: addressId,
                foodItems: [
                  {
                    foodItemId: item.id,
                    foodItemName: item.itemName,
                    vegNonVeg: item.vegNonVeg,
                    weight: item.weight,
                    mrp: item.mrp,
                    sellingPrice: item.sellingPrice,
                    quantity: item.minOrderQuantity,
                    preorderHours: item.hoursToPreOrder,
                  },
                ],
              });
            }
          } else {
            cartItems = [
              {
                orderType: orderType,
                cloudKitchenOutletId: outletId,
                preOrderDate: preOrderDate,
                preOrderDay: preOrderDay,
                deliverySlot: deliverySlot,
                homeChefId: homeChefId,
                deliveryType: deliveryType,
                userAddressId: addressId,
                foodItems: [
                  {
                    foodItemId: item.id,
                    weight: item.weight,
                    foodItemName: item.itemName,
                    vegNonVeg: item.vegNonVeg,
                    mrp: item.mrp,
                    sellingPrice: item.sellingPrice,
                    quantity: item.minOrderQuantity,
                    preorderHours: item.hoursToPreOrder,
                  },
                ],
              },
            ];
          }
          setCartData(cartItems);
          // Calling update cart Data
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
          } else {
            alert(
              "Something went wrong while update cart. Please try again later!!"
            );
          }
        } else {
          alert(
            "Something went wrong while fetching cart details. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching cart details. Please try again later!"
        );
      }
    }
  };

  const incrementQuantity = async (foodId, weight) => {
    // increase matching foodItemId quantity by 1
    // call updateCart api with the updated cartData
    let cartItems = JSON.parse(JSON.stringify(cartData));

    let cartFilter = cartItems.filter(
      (el) =>
        el.orderType === orderType &&
        el.preOrderDate === preOrderDate &&
        el.deliverySlot === deliverySlot &&
        el.cloudKitchenOutletId === outletId &&
        el.deliveryType === deliveryType &&
        el.userAddressId === addressId
    );

    if (cartFilter.length > 0) {
      let cartWeight = cartFilter[0].foodItems
        .map((el) => el.weight * el.quantity)
        .flat(1)
        .reduce((sum, val) => sum + val, 0);

      if (
        deliveryType === "selfPickup" ||
        cartWeight + weight <= config.dunzoMaxWeight
      ) {
        cartItems.map((el) => {
          if (
            el.orderType === orderType &&
            el.preOrderDate === preOrderDate &&
            el.deliverySlot === deliverySlot &&
            el.cloudKitchenOutletId === outletId &&
            el.deliveryType === deliveryType &&
            el.userAddressId === addressId
          ) {
            el.foodItems.map((fi) => {
              if (fi.foodItemId === foodId) {
                fi.quantity++;
              }
              return fi;
            });
          }
          return el;
        });
        setCartData(cartItems);
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
        } else {
          alert(
            "Something went wrong while update cart. Please try again later!!"
          );
        }
      } else {
        toast.info(
          "Your cart has reached max allowed weight. Please place this order and consider adding additional items to new order."
        );
      }
    }
  };

  const decrementQuantity = async (foodId, minOrderQuantity) => {
    // check the count of foodItems for the matching record
    // if count is more than 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the foodItem entry
    // if count is equal to 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the matching record itself
    // call updateCart api with the updated cartData

    let cartItems = JSON.parse(JSON.stringify(cartData));
    let cartMatch = cartItems?.filter(
      (el) =>
        el.orderType === orderType &&
        el.preOrderDate === preOrderDate &&
        el.deliverySlot === deliverySlot &&
        el.cloudKitchenOutletId === outletId &&
        el.deliveryType === deliveryType &&
        el.userAddressId === addressId
    );
    if (cartMatch[0]?.foodItems?.length > 1) {
      if (
        cartMatch[0]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        cartItems.map((el) => {
          if (
            el.orderType === orderType &&
            el.preOrderDate === preOrderDate &&
            el.deliverySlot === deliverySlot &&
            el.cloudKitchenOutletId === outletId &&
            el.deliveryType === deliveryType &&
            el.userAddressId === addressId
          ) {
            el.foodItems.map((fi) => {
              if (fi.foodItemId === foodId) {
                fi.quantity--;
              }
              return fi;
            });
          }
          return el;
        });
      } else {
        cartItems.forEach((el) => {
          if (
            el.orderType === orderType &&
            el.preOrderDate === preOrderDate &&
            el.deliverySlot === deliverySlot &&
            el.cloudKitchenOutletId === outletId &&
            el.deliveryType === deliveryType &&
            el.userAddressId === addressId
          ) {
            el.foodItems = el.foodItems.filter(
              (fi) => fi.foodItemId !== foodId
            );
          }
        });
      }
    } else {
      if (
        cartMatch[0]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        cartItems.map((el) => {
          if (
            el.orderType === orderType &&
            el.preOrderDate === preOrderDate &&
            el.deliverySlot === deliverySlot &&
            el.cloudKitchenOutletId === outletId &&
            el.deliveryType === deliveryType &&
            el.userAddressId === addressId
          ) {
            el.foodItems.map((fi) => {
              if (fi.foodItemId === foodId) {
                fi.quantity--;
              }
              return fi;
            });
          }
          return el;
        });
      } else {
        cartItems = cartItems.filter((el) => {
          return !(
            el.orderType === orderType &&
            el.preOrderDate === preOrderDate &&
            el.deliverySlot === deliverySlot &&
            el.cloudKitchenOutletId === outletId &&
            el.deliveryType === deliveryType &&
            el.userAddressId === addressId
          );
        });
      }
    }

    setCartData(cartItems);
    // Calling update cart Data
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
    } else {
      alert("Something went wrong while update cart. Please try again later!!");
    }
  };

  const incrementQuantityCart = async (foodId, idx, weight) => {
    // increase matching foodItemId quantity by 1
    // call updateCart api with the updated cartData
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let currentItems = JSON.parse(JSON.stringify(currentCart));

    let cartWeight = currentCart[idx].foodItems
      .map((el) => el.weight * el.quantity)
      .flat(1)
      .reduce((sum, val) => sum + val, 0);
    if (
      currentItems[idx].deliveryType === "selfPickup" ||
      cartWeight + weight <= config.dunzoMaxWeight
    ) {
      cartItems.map((el) => {
        if (
          el.orderType === currentItems[idx].orderType &&
          el.preOrderDate === currentItems[idx].preOrderDate &&
          el.deliverySlot === currentItems[idx].deliverySlot &&
          el.homeChefId === currentItems[idx].homeChefId &&
          el.deliveryType === currentItems[idx].deliveryType &&
          el.userAddressId === currentItems[idx].userAddressId
        ) {
          el.foodItems.map((fi) => {
            if (fi.foodItemId === foodId) {
              fi.quantity++;
            }
            return fi;
          });
        }
        return el;
      });

      currentItems[idx].foodItems.map((fi) => {
        if (fi.foodItemId === foodId) {
          fi.quantity++;
        }
        return fi;
      });

      setCurrentCart(currentItems);
      setCartData(cartItems);
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
      } else {
        alert(
          "Something went wrong while update cart. Please try again later!!"
        );
      }
    } else {
      toast.info(
        "Your cart has reached max allowed weight. Please place this order and consider adding additional items to new order."
      );
    }
  };

  const decrementQuantityCart = async (foodId, idx, minOrderQuantity) => {
    // check the count of foodItems for the matching record
    // if count is more than 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the foodItem entry
    // if count is equal to 1, check the quantity for this food item
    //// if quantity is more than 1, decrease the quantity by 1
    //// if quantity is equal to 1, remove the matching record itself
    // call updateCart api with the updated cartData
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let currentItems = JSON.parse(JSON.stringify(currentCart));

    let cartMatch = cartItems?.filter(
      (el) =>
        el.orderType === currentItems[idx].orderType &&
        el.preOrderDate === currentItems[idx].preOrderDate &&
        el.deliverySlot === currentItems[idx].deliverySlot &&
        el.homeChefId === currentItems[idx].homeChefId &&
        el.deliveryType === currentItems[idx].deliveryType &&
        el.userAddressId === currentItems[idx].userAddressId
    );

    if (cartMatch[0]?.foodItems?.length > 1) {
      if (
        cartMatch[0]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        currentItems[idx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });

        cartItems.map((el) => {
          if (
            el.orderType === currentItems[idx].orderType &&
            el.preOrderDate === currentItems[idx].preOrderDate &&
            el.deliverySlot === currentItems[idx].deliverySlot &&
            el.homeChefId === currentItems[idx].homeChefId &&
            el.deliveryType === currentItems[idx].deliveryType &&
            el.userAddressId === currentItems[idx].userAddressId
          ) {
            el.foodItems.map((fi) => {
              if (fi.foodItemId === foodId) {
                fi.quantity--;
              }
              return fi;
            });
          }
          return el;
        });
      } else {
        // remove this food item entry
        currentItems[idx].foodItems = currentItems[idx]?.foodItems.filter(
          (fi) => fi.foodItemId !== foodId
        );

        cartItems.forEach((el) => {
          if (
            el.orderType === currentItems[idx].orderType &&
            el.preOrderDate === currentItems[idx].preOrderDate &&
            el.deliverySlot === currentItems[idx].deliverySlot &&
            el.homeChefId === currentItems[idx].homeChefId &&
            el.deliveryType === currentItems[idx].deliveryType &&
            el.userAddressId === currentItems[idx].userAddressId
          ) {
            el.foodItems = el.foodItems.filter(
              (fi) => fi.foodItemId !== foodId
            );
          }
        });
      }
    } else {
      if (
        cartMatch[0]?.foodItems?.filter((el) => el.foodItemId === foodId)[0]
          .quantity > minOrderQuantity
      ) {
        currentItems[idx]?.foodItems.map((fi) => {
          if (fi.foodItemId === foodId) {
            fi.quantity--;
          }
          return fi;
        });

        cartItems.map((el) => {
          if (
            el.orderType === currentItems[idx].orderType &&
            el.preOrderDate === currentItems[idx].preOrderDate &&
            el.deliverySlot === currentItems[idx].deliverySlot &&
            el.homeChefId === currentItems[idx].homeChefId &&
            el.deliveryType === currentItems[idx].deliveryType &&
            el.userAddressId === currentItems[idx].userAddressId
          ) {
            el.foodItems.map((fi) => {
              if (fi.foodItemId === foodId) {
                fi.quantity--;
              }
              return fi;
            });
          }
          return el;
        });
      } else {
        // remove this object itself
        cartItems = cartItems.filter((el) => {
          return !(
            el.orderType === currentItems[idx].orderType &&
            el.preOrderDate === currentItems[idx].preOrderDate &&
            el.deliverySlot === currentItems[idx].deliverySlot &&
            el.homeChefId === currentItems[idx].homeChefId &&
            el.deliveryType === currentItems[idx].deliveryType &&
            el.userAddressId === currentItems[idx].userAddressId
          );
        });
        currentItems.splice(idx, 1);
      }
    }
    setCartData(cartItems);
    setCurrentCart(currentItems);
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
    } else {
      alert("Something went wrong while update cart. Please try again later!!");
    }
  };

  // Add or remove Favorites
  const handleFavourite = async (id, favorite) => {
    if (favorite === "Active") {
      let params = {
        cloudKitchenOutletId: id,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.removeFavorite,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let copy = JSON.parse(JSON.stringify(cloudKitchenData));
          copy.isFavorite = "InActive";
          setCloudKitchenData(copy);
          toast.info("Removed from favourite list!!");
        } else {
          alert(
            "Something went wrong while removing from favourites list. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while removing from favourites list. Please try again later!!"
        );
      }
    } else {
      let params = {
        cloudKitchenOutletId: id,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.addFavorite,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let copy = JSON.parse(JSON.stringify(cloudKitchenData));
          copy.isFavorite = "Active";
          setCloudKitchenData(copy);
          toast.success("Added to favourites list!!");
        } else {
          alert(
            "Something went wrong while adding to favourites list. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while adding to favourites list. Please try again later!!"
        );
      }
    }
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

  // setting values from cookies to state variables on page load and when cookies changes
  useEffect(() => {
    setOrderType(cookies[config.preferencesCookie]?.orderType ?? "instant");
    if (deliveryType === "selfPickup") {
      setAddressId(null);
    } else {
      setAddressId(
        cookies[config.preferencesCookie]?.deliveryAddress?.id ?? null
      );
    }
    if (cookies[config.preferencesCookie]?.orderType === "instant") {
      setPreOrderDate(null);
      setDeliverySlot(null);
    } else {
      setPreOrderDate(
        cookies[config.preferencesCookie]?.preorderData?.preorderDayName?.split(
          ","
        )[3] ?? null
      );
      setPreOrderDay(
        cookies[config.preferencesCookie]?.preorderData?.preorderDayName?.split(
          ","
        )[0] ?? null
      );
      setDeliverySlot(
        cookies[config.preferencesCookie]?.preorderData?.preorderSlot ?? null
      );
    }
  }, [cookies, deliveryType]);

  // Get outlet data on first time load
  useEffect(() => {
    const getCart = async () => {
      if (cookies[config.cookieName]?.loginUserId) {
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
              setCartData(cartItems);
            }
          } else {
            alert(
              "Something went wrong while fetching cart details. Please try again later!"
            );
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while fetching cart details. Please try again later!"
          );
        }
      }
    };
    if (firstLoad) {
      setFirstLoad(false);
      getCart();
    }
  }, [firstLoad, cookies, navigate]);

  // Get outlet data first time and when any filters are applied (which in turn update cookies)
  useEffect(() => {
    const getOutlet = async () => {
      let params = {
        id: outletId,
        orderType: cookies[config.preferencesCookie]?.orderType ?? "instant",
        preOrderDay:
          cookies[
            config.preferencesCookie
          ]?.preorderData?.preorderDayName?.split(",")[0] ?? null,
        preOrderDate:
          cookies[
            config.preferencesCookie
          ]?.preorderData?.preorderDayName?.split(",")[3] ?? null,
        deliverySlot:
          cookies[config.preferencesCookie]?.preorderData?.preorderSlot ?? null,
        vegNonVeg:
          cookies[config.preferencesCookie]?.filterData?.vegNonVeg ?? null,
        nonVegTypes:
          cookies[config.preferencesCookie]?.filterData?.nonVegTypes ?? null,
        cuisineIds:
          cookies[config.preferencesCookie]?.filterData?.cuisinesData ?? null,
        spiceLevels:
          cookies[config.preferencesCookie]?.filterData?.spiceLevel ?? null,
        minPrice:
          cookies[config.preferencesCookie]?.filterData?.minimumPrice ?? null,
        maxPrice:
          cookies[config.preferencesCookie]?.filterData?.maximumPrice ?? null,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getOutlet,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (response.data.outlet === null) {
            navigate("404");
          }
          if (
            outletName !==
            response.data.outlet.cloudKitchenName?.replace(/\s+/g, "-")
          ) {
            window.history.replaceState(
              null,
              "",
              `/restaurant/${response.data.outlet.cloudKitchenName?.replace(
                /\s+/g,
                "-"
              )}/${outletId}`
            );
          }
          document.title =
            config.documentTitle +
            " | " +
            response.data.outlet.cloudKitchenName +
            " - " +
            response.data.outlet.outletName;
          setOutletsData(response.data.allOutlets);
          if (response.data.outlet.foodItems === null) {
            let copy = JSON.parse(JSON.stringify(response.data.outlet));
            copy.foodItems = [];
            setCloudKitchenData(copy);
            setGroupedFoodItems([]);
          } else {
            setCloudKitchenData(response.data.outlet);
            setGroupedFoodItems(
              response.data.outlet.foodItems?.reduce((group, product) => {
                const { category } = product;
                group[category] = group[category] ?? [];
                group[category].push(product);
                return group;
              }, {})
            );
          }
          setTotalFoodItem(response.data.outlet?.foodItems?.length ?? 0);
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
    };
    getOutlet();
  }, [outletName, cookies, outletId, navigate]);

  // calculating the distance
  useEffect(() => {
    let dist = getDistanceFromLatLonInKm(
      cookies[config.preferencesCookie]?.deliveryAddress?.latitude ??
        cookies[config.preferencesCookie]?.deliveryAddress?.lat,
      cookies[config.preferencesCookie]?.deliveryAddress?.longitude ??
        cookies[config.preferencesCookie]?.deliveryAddress?.lng,
      cloudKitchenData?.latitude,
      cloudKitchenData?.longitude
    );
    if (!!dist) {
      setDistance(dist);
    }
  }, [cloudKitchenData, cookies]);

  // estimated delivery
  useEffect(() => {
    const getDeliveryChargesEstimate = async () => {
      let params = {
        cloudKitchenOutletId: outletId,
        userAddressId: cookies[config.preferencesCookie]?.deliveryAddress?.id,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getDeliveryChargesEstimate,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          // delivery is feasible. no need to do anything.
        } else if (
          response.data.responseCode === "HE011-1" ||
          response.data.responseCode === "HE011-2"
        ) {
          // delivery is not feasible. change to selfPickup and open the address selection modal.
          if (response.data.responseCode === "HE011-1") {
            setPickupLocationServiceable(false);
          }
          setDeliveryTypeNA("selfPickup");
          setDeliveryType("selfPickup");
          setShowAddressPickerModal(true);
        } else {
          alert(
            "Something went wrong while checking delivery feasibility. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while checking delivery feasibility. Please try again later!!"
        );
      }
    };
    if (
      userData?.user.addresses.length > 0 &&
      !!cloudKitchenData &&
      cookies[config.preferencesCookie]?.deliveryAddress?.id &&
      deliveryType === "doorDelivery"
    ) {
      getDeliveryChargesEstimate();
    }
  }, [cookies, outletId, userData, deliveryType, cloudKitchenData]);

  // check the address where delivery is available or not
  useEffect(() => {
    const CheckAddressForDunzo = async () => {
      setIsCheckAddressFetching(true);
      let copy = JSON.parse(JSON.stringify(addressData));
      for (let index = 0; index < userData?.user.addresses.length; index++) {
        const element = userData?.user.addresses[index];
        let params = {
          cloudKitchenOutletId: outletId,
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
      setAddressData(copy);
      setIsCheckAddressFetching(false);
    };
    if (invokeCheckAddress && addressData !== null && !!cloudKitchenData) {
      setInvokeCheckAddress(false);
      CheckAddressForDunzo();
    }
  }, [
    cloudKitchenData,
    homeChefId,
    userData,
    invokeCheckAddress,
    addressData,
    cookies,
    outletId,
  ]);

  // setting current cart (to show in right div grouped by Address Tag)
  useEffect(() => {
    let cartItems = JSON.parse(JSON.stringify(cartData));
    let cartMatch = cartItems?.filter(
      (el) =>
        el.orderType === orderType &&
        el.preOrderDate === preOrderDate &&
        el.deliverySlot === deliverySlot &&
        el.cloudKitchenOutletId === outletId
    );
    let filterDoorDel = cartMatch.filter(
      (el) => el.deliveryType === "doorDelivery"
    );
    if (filterDoorDel.length > 0 && userData?.user?.addresses) {
      for (let i = 0; i < filterDoorDel.length; i++) {
        const items = filterDoorDel[i];
        let filterByAddresId = userData?.user?.addresses.filter(
          (el) => el.id === +items.userAddressId
        );
        if (filterByAddresId.length > 0) {
          cartMatch[i].addressTag = filterByAddresId[0].addressTag;
        } else {
          let filterByPrimary = userData?.user?.addresses.filter(
            (el) => el.isPrimary === "Yes"
          );
          cartMatch[i].addressTag = filterByPrimary[0].addressTag;
        }
      }
    }
    setCurrentCart(cartMatch ?? []);
  }, [userData, cartData, orderType, deliverySlot, preOrderDate, outletId]);

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

    let yearCookie = cookies[
      config.preferencesCookie
    ]?.preorderData?.preorderDayName
      .split(",")[3]
      .split("-")[0];
    let monthCookie = cookies[
      config.preferencesCookie
    ]?.preorderData?.preorderDayName
      .split(",")[3]
      .split("-")[1];
    let dateCookie = cookies[
      config.preferencesCookie
    ]?.preorderData?.preorderDayName
      .split(",")[3]
      .split("-")[2];

    let slotCookie = convertTo24HRS(
      cookies[config.preferencesCookie]?.preorderData?.preorderSlot.split(
        " "
      )[0] ?? "12am - 1am"
    );

    setPreorderHours(
      differenceInHours(
        new Date(yearCookie, monthCookie - 1, dateCookie, slotCookie),
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          new Date().getHours() + 1
        )
      )
    );
  }, [cookies]);
  return (
    <Box>
      <Header showAddress={true} showPreferences={true} showCuisines={false} />
      {!cloudKitchenData ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <>
          {/* Gallery images */}
          {cloudKitchenData?.galleryImages && (
            <Carousel animation="slide" duration={800} sx={{ mt: "29px" }}>
              {cloudKitchenData?.galleryImages?.map((el, idx) => (
                <Box
                  key={idx}
                  component="img"
                  sx={{ height: "364px", width: "100%", objectFit: "contain" }}
                  src={el}
                />
              ))}
            </Carousel>
          )}

          {/* Chef details and delivery pick up drop div */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "0px",
              mx: "27px",
              mt: "29px",
              flexWrap: "wrap",
              gap: "30px",
            }}
          >
            {/* Left side chef details div */}
            <Box
              sx={{
                display: "flex",
                flex: 1.5,
                flexDirection: "row",
                padding: "0px",
                gap: "10px",
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
                  objectFit: "cover",
                  border: "1px solid #d3d3d3",
                }}
                src={cloudKitchenData?.profileImage}
              />

              {/* Ribbon tag */}
              <Box
                component="img"
                sx={{
                  position: "absolute",
                  top: "64px",
                  left: "-7px",
                }}
                src="/media/svg/restaurant-ribbon.svg"
              />

              {/* Chef details */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                }}
              >
                {/* chefName and favourite button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "0px",
                    gap: "10px",
                  }}
                >
                  {/* Chef name text */}
                  <Typography
                    variant="header4"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: { xs: "125px", md: "300px", lg: "450px" },
                    }}
                  >
                    {cloudKitchenData?.cloudKitchenName}
                    {" - "}
                    {cloudKitchenData?.outletName}
                  </Typography>
                  {/* Favourite icon button */}
                  <Box
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (userData?.user) {
                        handleFavourite(
                          cloudKitchenData.id,
                          cloudKitchenData.isFavorite
                        );
                      } else {
                        setShowLoginConfirmModal(true);
                      }
                    }}
                    component="img"
                    sx={{
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                    }}
                    src={
                      cloudKitchenData.isFavorite === "Active"
                        ? "/media/svg/favorite-selected.svg"
                        : "/media/svg/favorite.svg"
                    }
                  />
                </Box>

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
                  {cloudKitchenData?.noOfRatings >= 10 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "0px",
                        gap: "5px",
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
                        {cloudKitchenData.averageRating.toFixed(1)} (
                        {ratingsGroup(cloudKitchenData.noOfRatings)})
                      </Typography>
                    </Box>
                  )}

                  {/* Marker icon and kilometers  */}
                  {deliveryType !== "selfPickup" && (
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
                        {!!distance ? distance : 0}km
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Cuisines list */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "0px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {cloudKitchenData?.cuisines?.map((cuis, idx2) => (
                    <Box
                      key={idx2}
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "5px 9px",
                        gap: "10px",
                        // width: "59px",
                        // height: "30px",
                        background: "#FCFCFC",
                        border: "1px solid #535455",
                        borderRadius: "80px",
                      }}
                    >
                      <Typography
                        variant="bodyregular"
                        sx={{ fontSize: "13px", color: "#535455" }}
                      >
                        {cuis}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Right side  location pickup drop div*/}
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px 10px 10px",
                gap: "8px",
              }}
            >
              {/* pickup */}
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
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                    gap: "10px",
                    width: "30px",
                    height: "30px",
                    background: "#FFFFFF",
                    border: "1px solid #2A3037",
                    boxShadow: "0px 2px 30px rgba(248, 237, 227, 0.15)",
                    borderRadius: "58px",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "14px", height: "14px " }}
                    src="/media/svg/chef-cap.svg"
                  />
                </Box>
                {outletsData?.length > 1 ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      // height: "30px",
                      boxShadow: "inset 0px -2px 0px #FE8F08",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowOutletsModal(true)}
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
                      {cloudKitchenData?.locality}, {cloudKitchenData?.city}
                    </Typography>
                    <Box
                      component={"img"}
                      sx={{
                        width: "20px",
                        height: "20px",
                      }}
                      src="/media/svg/dropdown-orange.svg"
                    />
                  </Box>
                ) : (
                  <Typography variant="bodyparagraph">
                    {cloudKitchenData?.locality}, {cloudKitchenData?.city}
                  </Typography>
                )}
              </Box>
              {/* Dotted Line */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: "10px 0px",
                  gap: "10px",
                  width: "30px",
                  // height: "37px",
                }}
              >
                <Box
                  sx={{
                    width: "17px",
                    height: "0px",
                    border: "1px dashed #2A3037",
                    transform: "rotate(-90deg)",
                    alignSelf: "stretch",
                    flexGrow: "1",
                  }}
                />
              </Box>

              {/* Drop */}
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
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                    gap: "10px",
                    width: "30px",
                    height: "30px",
                    background: "#FFFFFF",
                    border: "1px solid #2A3037",
                    boxShadow: "0px 2px 30px rgba(248, 237, 227, 0.15)",
                    borderRadius: "58px",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "14px", height: "14px " }}
                    src="/media/svg/marker.svg"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    // height: "30px",
                    boxShadow: "inset 0px -2px 0px #FE8F08",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setDeliveryTypeNA(deliveryType);
                    setShowAddressPickerModal(true);
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
                      maxWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {deliveryType === "selfPickup"
                      ? "Self Pickup"
                      : cookies[config.preferencesCookie]?.deliveryAddress
                          ?.addressTag ??
                        cookies[config.preferencesCookie]?.deliveryAddress
                          ?.locality}
                  </Typography>
                  <Box
                    component={"img"}
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                    src="/media/svg/dropdown-orange.svg"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Main content div */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              gap: "8px",
              mx: "27px",
              mt: "24px",
            }}
          >
            {/* Header menu items */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "11px",
                height: "30px",
                position: "sticky",
                top: { xs: "156px", sm: "78px" }, // revisit this - check iPhone SE also
                width: "100%",
                background: "#FCFCFC",
                zIndex: "100",
              }}
            >
              <Typography variant="header4">Menu</Typography>
              <Typography variant="bodyparagraph" sx={{ color: "#4D4D4D" }}>
                (
                {totalFoodItem === 1
                  ? totalFoodItem + " Item"
                  : totalFoodItem + " Items"}
                )
              </Typography>
            </Box>

            {/* Categories, Food Items and Cart */}
            <Box sx={{ width: "100%" }}>
              <Grid container spacing={2}>
                {/* Categories box */}
                <Grid item xs={12} sm={3} md={2} lg={2}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      background: "#FCFCFC",
                      boxShadow: "1px 0px 0px rgba(0, 0, 0, 0.1)",
                      maxHeight: "calc(70vh)",
                      overflowY: "scroll",
                      mt: 2,
                    }}
                  >
                    {Object.values(groupedFoodItems)?.map((el, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "0px 0px 30px",
                          background: "#FCFCFC",
                        }}
                      >
                        <a
                          href={`#${el[0].category}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Typography
                            variant="bodyparagraph"
                            sx={{ color: "#2A3037" }}
                          >
                            {el[0].category} ({el.length})
                          </Typography>
                        </a>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                {/* Food items box */}
                <Grid item xs={12} sm={9} md={6} lg={7}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "0px 8px 20px 0px",
                      gap: "16px",
                      maxHeight: "calc(70vh)",
                      overflowY: "scroll",
                    }}
                  >
                    {cloudKitchenData.foodItems?.length > 0 ? (
                      <>
                        {Object.values(groupedFoodItems)?.map((el, idx) => (
                          <Box
                            key={idx}
                            id={`${el[0].category}`}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignSelf: "stretch",
                            }}
                          >
                            <Typography variant="header4" sx={{ my: "16px" }}>
                              {el[0].category}
                            </Typography>
                            {/* Food items list */}
                            {el.map((item, indx) => (
                              <Box
                                key={indx}
                                sx={{
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  padding: { xs: "16px 8px", sm: "20px" },
                                  gap: "12px",
                                  background: "#FCFCFC",
                                  borderBottom: "1px solid #DFE2E6",
                                  my: "10px",
                                  alignSelf: "stretch",
                                }}
                              >
                                {/* Food item details */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    alignSelf: "stretch",
                                  }}
                                >
                                  {/* Food item image */}
                                  <Box
                                    sx={{
                                      position: "relative",
                                      // width: "60px",
                                      pr: "80px",
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      sx={{
                                        position: "absolute",
                                        width: "60px",
                                        height: "60px",
                                        top: "-31px",
                                        left: "3px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                      src={item.image1}
                                    />
                                    {/* <Box
                                      component="img"
                                      sx={{
                                        position: "absolute",
                                        width: "60px",
                                        height: "60px",
                                        top: "-29px",
                                        left: "3px",
                                        borderRadius: "50%",
                                        opacity: "0.52",
                                        filter: `blur(8.5px)`,
                                      }}
                                      src={item.image1}
                                    /> */}
                                  </Box>

                                  {/* Food item name and metadata */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      padding: "0px",
                                      gap: "9px",
                                    }}
                                  >
                                    {/* food type icon and name */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        padding: "0px",
                                        gap: "10px",
                                      }}
                                    >
                                      {/* veg / non-veg icon */}
                                      <Box
                                        component="img"
                                        sx={{
                                          width: "20px",
                                          height: "20px",
                                          pt: "2px",
                                        }}
                                        src={
                                          item.vegNonVeg === "Veg"
                                            ? "/media/svg/veg.svg"
                                            : "/media/svg/non-veg.svg"
                                        }
                                      />
                                      {/* Food item name */}
                                      <Typography variant="bodybold">
                                        {item.itemName}
                                      </Typography>
                                    </Box>

                                    {/* rating and spice level */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: "16px",
                                      }}
                                    >
                                      {/* rating */}
                                      {item.noOfRatings >= 10 && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "7px",
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
                                            {item.averageRating.toFixed(1)} (
                                            {ratingsGroup(item.noOfRatings)})
                                          </Typography>
                                        </Box>
                                      )}

                                      {/* Spice level */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "flex-start",
                                          padding: "0px",
                                          // ml: "auto",
                                        }}
                                      >
                                        {item.spiceLevel === "Mild" ? (
                                          <Box
                                            component="img"
                                            sx={{
                                              height: "24px",
                                            }}
                                            src="/media/svg/spice-mild.svg"
                                          />
                                        ) : item.spiceLevel === "Medium" ? (
                                          <Box
                                            component="img"
                                            sx={{
                                              height: "24px",
                                            }}
                                            src="/media/svg/spice-medium.svg"
                                          />
                                        ) : item.spiceLevel === "Hot" ? (
                                          <Box
                                            component="img"
                                            sx={{
                                              height: "24px",
                                            }}
                                            src="/media/svg/spice-hot.svg"
                                          />
                                        ) : (
                                          <></>
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Description */}
                                {!!item.description && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "flex-start",
                                    }}
                                  >
                                    <Typography
                                      variant="bodyregular"
                                      ref={(el) =>
                                        (itemDescRefs.current[
                                          idx + "-" + indx
                                        ] = el)
                                      }
                                      sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        color: "#4D4D4D",
                                      }}
                                    >
                                      {item.description}
                                    </Typography>
                                    {!!itemDescRefs.current[idx + "-" + indx] &&
                                      itemDescRefs.current[idx + "-" + indx]
                                        ?.clientHeight !==
                                        itemDescRefs.current[idx + "-" + indx]
                                          ?.scrollHeight && (
                                        <Typography
                                          variant="bodyregular"
                                          sx={{
                                            backgroundColor: "primary.light",
                                            color: "#FFF",
                                            px: "4px",
                                            borderRadius: "4px",
                                            alignSelf: "flex-start",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            setItemDesc(item.description);
                                            setOpenDescDialog(true);
                                          }}
                                        >
                                          Read more
                                        </Typography>
                                      )}
                                  </Box>
                                )}

                                {/* MRP & Add/increment-decrement buttons  */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  {/* mrp */}
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
                                          textDecorationLine: "line-through",
                                        }}
                                      >
                                        ₹ {item.mrp}
                                      </Typography>
                                      <Typography variant="bodybold">
                                        ₹ {item.sellingPrice}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography variant="bodybold">
                                      ₹ {item.sellingPrice}
                                    </Typography>
                                  )}

                                  {/* increment decrement buttons if added to cart */}
                                  {isAddedToCart(item.id) > 0 ? (
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
                                        onClick={() =>
                                          decrementQuantity(
                                            item.id,
                                            item.minOrderQuantity
                                          )
                                        }
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
                                        {isAddedToCart(item.id) ===
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
                                          padding: "10px",
                                          boxSizing: "border-box",
                                        }}
                                      >
                                        <Typography
                                          variant="bodybold"
                                          sx={{
                                            background:
                                              "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            textFillColor: "transparent",
                                          }}
                                        >
                                          {isAddedToCart(item.id)}
                                        </Typography>
                                      </Box>

                                      {/* Increment button */}
                                      <Box
                                        onClick={() => {
                                          if (
                                            orderType === "instant" ||
                                            (orderType === "preorder" &&
                                              item.maxCapacity >
                                                isAddedToCart(item.id))
                                          ) {
                                            incrementQuantity(
                                              item.id,
                                              item.weight
                                            );
                                          } else {
                                            toast.info(
                                              "Max allowed quantity for this item, at the moment, has reached!"
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
                                  ) : (
                                    <>
                                      {/* Add button */}
                                      {(orderType === "instant" &&
                                        item.currentAvailability === "On") ||
                                      (orderType === "preorder" &&
                                        item.maxCapacity >=
                                          item.minOrderQuantity &&
                                        preorderHours >=
                                          item.hoursToPreOrder) ? (
                                        <Button
                                          onClick={() => {
                                            addToCart(item);
                                          }}
                                          variant="contained"
                                          sx={{
                                            width: "120px",
                                            height: "40px",
                                          }}
                                        >
                                          Add
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          sx={{
                                            width: "120px",
                                            height: "40px",
                                            fontWeight: "400",
                                            padding: "0px",
                                          }}
                                          disabled
                                        >
                                          Out of Stock
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "end",
                                  }}
                                >
                                  {item.minOrderQuantity > 1 &&
                                    ((orderType === "instant" &&
                                      item.currentAvailability === "On") ||
                                      (orderType === "preorder" &&
                                        item.maxCapacity >=
                                          item.minOrderQuantity &&
                                        preorderHours >=
                                          item.hoursToPreOrder)) && (
                                      <Typography
                                        variant="bodymetatag"
                                        sx={{ color: "#FF774C" }}
                                      >
                                        Min quantity: {item.minOrderQuantity}
                                      </Typography>
                                    )}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Typography variant="bodybold" sx={{ margin: "auto" }}>
                        No food items found for the applied filters. You may
                        want to change your filters to retry!
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Cart */}
                <Grid item xs={12} sm={12} md={4} lg={3}>
                  {currentCart.length > 0 ? (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "11px",
                          width: "100%",
                        }}
                      >
                        <Typography variant="header4">Added to cart</Typography>
                        <Typography
                          variant="bodyparagraph"
                          sx={{ color: "#4D4D4D" }}
                        >
                          (
                          {totalItemsInCart() === 1
                            ? totalItemsInCart() + " Item"
                            : totalItemsInCart() + " Items"}
                          )
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          background: "#FCFCFC",
                          boxShadow: "-1px 0px 0px rgba(0, 0, 0, 0.1)",
                          maxHeight: "calc(70vh)",
                          overflowY: "scroll",
                          mt: 3,
                          width: "100%",
                        }}
                      >
                        {currentCart?.map((el, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "0px 0px 30px 18px",
                              boxShadow: "-1px 0px 0px 0px rgba(0, 0, 0, 0.1)",
                              width: "calc(100% - 18px)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                width: "100%",
                                gap: "11px",
                                borderStyle: "none none dashed none",
                                borderColor: "#DFE2E6",
                                pb: "12px",
                              }}
                            >
                              <Typography variant="header4">
                                {el.addressTag ?? "Self Pickup"}
                              </Typography>
                              <Typography variant="bodyparagraph">
                                (
                                {totalItemsByAddress(el) === 1
                                  ? totalItemsByAddress(el) + " Item"
                                  : totalItemsByAddress(el) + " Items"}
                                )
                              </Typography>
                            </Box>

                            {/* food */}
                            {el.foodItems.map((item, indx) => (
                              <Box
                                key={indx}
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                  padding: "20px 10px",
                                  gap: "6px",
                                  background: "#FFFFFF",
                                  // width: "100%",
                                  width: "calc(100% - 20px)",
                                  boxShadow:
                                    "inset 0px -1px 0px rgba(0, 0, 0, 0.25)",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    width: "100%",
                                  }}
                                >
                                  {/* veg icon and food item name */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      gap: "10px",
                                      width: "100%",
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
                                    <Typography
                                      variant="bodyparagraph"
                                      sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        width: "calc(100% - 21px - 10px)",
                                      }}
                                    >
                                      {item.foodItemName}
                                    </Typography>
                                  </Box>

                                  {/* increment decrement and price */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      width: "100%",
                                    }}
                                  >
                                    {/* increment decrement */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        width: "171px",
                                        // height: "50px",
                                      }}
                                    >
                                      {/* Decrement button */}
                                      <Box
                                        onClick={() => {
                                          let filterMinQuantity =
                                            cloudKitchenData?.foodItems.filter(
                                              (el) => el.id === item.foodItemId
                                            );
                                          decrementQuantityCart(
                                            item.foodItemId,
                                            idx,
                                            filterMinQuantity[0]
                                              .minOrderQuantity
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
                                          alignSelf: "stretch",
                                          border: "1px solid #F28705",
                                          cursor: "pointer",
                                        }}
                                      >
                                        {item.quantity ===
                                        cloudKitchenData?.foodItems.filter(
                                          (el) => el.id === item.foodItemId
                                        )[0].minOrderQuantity ? (
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
                                          gap: "10px",
                                          width: "50px",
                                          height: "40px",
                                          borderTop: "1px solid #F28705",
                                          borderBottom: "1px solid #F28705",
                                          padding: "10px",
                                          boxSizing: "border-box",
                                        }}
                                      >
                                        <Typography
                                          variant="bodybold"
                                          sx={{
                                            background:
                                              "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
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
                                          let filterFood =
                                            cloudKitchenData?.foodItems.filter(
                                              (food) =>
                                                food.id === item.foodItemId
                                            );
                                          if (
                                            orderType === "instant" ||
                                            (orderType === "preorder" &&
                                              filterFood[0].maxCapacity >
                                                isAddedToCart(item.foodItemId))
                                          ) {
                                            incrementQuantityCart(
                                              item.foodItemId,
                                              idx,
                                              item.weight
                                            );
                                          } else {
                                            toast.info(
                                              "Max allowed quantity for this item, at the moment, has reached!"
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
                                          alignSelf: "stretch",
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
                                    {/* Price */}
                                    <Typography variant="bodybold">
                                      ₹{item.sellingPrice * item.quantity}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ))}

                        {/* Total price */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            pl: "20px",
                            pr: "10px",
                            // pb: { lg: "108px" },
                            width: "calc(100% - 30px)",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="bodyparagraph" sx={{ mt: 1 }}>
                            Total Amount
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "0px",
                              gap: "2px",
                            }}
                          >
                            <Typography variant="header3">
                              ₹ {totalSellingAmount()}
                            </Typography>
                            <Typography
                              variant="bodymetatag"
                              sx={{ color: "#AAACAE" }}
                            >
                              Plus charges
                            </Typography>
                          </Box>
                        </Box>

                        {/* Order more and Checkout */}
                        <Box
                          sx={{
                            // position: "fixed",
                            // bottom: { lg: "108px" },
                            // background: "#FFFFFF",
                            // zIndex: "1000",
                            // gap: "50px",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            padding: "30px 10px 20px 20px",
                            width: "calc(100% - 30px)",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            variant="text"
                            sx={{ textTransform: "none" }}
                            onClick={() => navigate("/")}
                          >
                            Order more
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => navigate("/cart")}
                          >
                            Checkout
                          </Button>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* Empty cart */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "0px 10px 20px 0px",
                          gap: "11px",
                        }}
                      >
                        <Typography variant="header4">Cart</Typography>
                        <Typography
                          variant="bodyparagraph"
                          sx={{ color: "#4D4D4D" }}
                        >
                          (0 Items)
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "25px",
                          boxShadow: "-1px 0px 0px 0px rgba(0, 0, 0, 0.1)",
                          pb: 3,
                          pl: 1,
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
                              width: "175px",
                            }}
                            src="/media/svg/empty-cart.svg"
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "7px",
                            }}
                          >
                            <Typography variant="header4">
                              Empty Cart
                            </Typography>
                            <Typography
                              variant="bodyparagraph"
                              sx={{ textAlign: "center" }}
                            >
                              Your cart is empty please go ahead and start
                              ordering
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* FSSAI */}
          {!!cloudKitchenData?.fssaiLicenseNo && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                gap: "16px",
              }}
            >
              <Box component={"img"} src="/media/png/fssai.png" />
              <Typography variant="bodybold">
                License No: {cloudKitchenData?.fssaiLicenseNo}
              </Typography>
            </Box>
          )}
        </>
      )}

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
              onClick={() => {
                setShowAddressPickerModal(false);
              }}
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
                  pickupLocationServiceable &&
                    setDeliveryTypeNA("doorDelivery");
                }}
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "15px",
                  border:
                    deliveryTypeNA === "doorDelivery"
                      ? "1px solid #FF784D"
                      : !pickupLocationServiceable
                      ? "1px solid #F44336"
                      : "1px solid #DFE2E6",
                  background:
                    deliveryTypeNA === "doorDelivery"
                      ? "#FFF8F5"
                      : !pickupLocationServiceable
                      ? "#FEECEB"
                      : "#FFFFFF",
                  borderRadius: "15px",
                  width: { xs: "100%", md: "calc(50% - 10px)" },
                  cursor: !pickupLocationServiceable
                    ? "unset !important"
                    : "pointer",
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
                    {deliveryTypeNA === "doorDelivery" && (
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
                {/* Error */}
                {!pickupLocationServiceable && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "3px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{
                        height: "12px",
                        width: "12px",
                      }}
                      src="/media/svg/error-exclaim.svg"
                    />
                    <Typography variant="bodymetatag" color="#F44336">
                      Delivery Service Unavailable at Pickup Location
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Self pickup div */}
              <Box
                onClick={() => {
                  setShowAddressPickerModal(false);
                  setDeliveryType("selfPickup");
                  setAddressId(null);
                }}
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "15px",
                  border:
                    deliveryTypeNA === "selfPickup"
                      ? "1px solid #FF784D"
                      : "1px solid #DFE2E6",
                  background:
                    deliveryTypeNA === "selfPickup" ? "#FFF8F5" : "#FFFFFF",
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
                    {deliveryTypeNA === "selfPickup" && (
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
            {pickupLocationServiceable && (
              <>
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
                        <Typography variant="header4">
                          Current location
                        </Typography>
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
              </>
            )}

            {/* Saved address section */}
            {pickupLocationServiceable && (
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
                        <Typography variant="header4">
                          Saved Addresses
                        </Typography>
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
                    <CircularProgress
                      sx={{ display: "flex", margin: "auto" }}
                    />
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
                                border:
                                  cookies[config.preferencesCookie]
                                    ?.deliveryAddress?.id === el.id &&
                                  deliveryType !== "selfPickup"
                                    ? "1px solid #FF784D"
                                    : el.deliveryStatus === false
                                    ? "1px solid #F44336"
                                    : "1px solid #DFE2E6",
                                background:
                                  cookies[config.preferencesCookie]
                                    ?.deliveryAddress?.id === el.id &&
                                  deliveryType !== "selfPickup"
                                    ? "#FFF8F5"
                                    : el.deliveryStatus === false
                                    ? "#FEECEB"
                                    : "#FCFCFC",
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
                                  if (el.deliveryStatus !== false) {
                                    setDeliveryType("doorDelivery");
                                    setCookie(
                                      config.preferencesCookie,
                                      JSON.stringify({
                                        ...cookies[config.preferencesCookie],
                                        deliveryAddress: el,
                                      }),
                                      {
                                        path: "/",
                                        maxAge: 3000000,
                                        sameSite: "strict",
                                      }
                                    );
                                    setShowAddressPickerModal(false);
                                  }
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
                                  // borderRadius: "15px",
                                  flex: "none",
                                  order: 0,
                                  flexGrow: 0,
                                  // cursor: "pointer"
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
            )}
          </Box>
        </Box>
      </Modal>

      {/* User not logged-in  */}
      <Modal open={showLoginConfirmModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
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
                sx={{ textAlign: "center", my: 1, py: 1 }}
              >
                You must login to perform this action!
              </Typography>

              <CardActions
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                }}
              >
                <Button
                  variant="outlined"
                  // size="small"
                  onClick={() => {
                    setShowLoginConfirmModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  // size="small"
                  onClick={() => {
                    dispatch(loginDrawer(true));
                    setShowLoginConfirmModal(false);
                  }}
                >
                  Login
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* User logged-in but not having one address */}
      <Modal
        open={showAddressConfirmModal}
        onClose={() => setShowAddressConfirmModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
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
              <Typography variant="h6" sx={{ textAlign: "center", marginY: 1 }}>
                You must save your address before adding items to your cart
              </Typography>

              <CardActions
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddressConfirmModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate("/add-address", {
                      state: { redirectTo: location.pathname },
                    });
                    setShowAddressConfirmModal(false);
                  }}
                >
                  Add Address
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* Outlet details modal */}
      <Modal
        open={showOutletsModal}
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
              background: "#FCFCFC",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: `calc(100% - 40px)`,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="header3">
              Choose the Restaurant Outlet
            </Typography>
            <Box
              component="img"
              sx={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
              src="/media/svg/cross-circled.svg"
              onClick={() => setShowOutletsModal(false)}
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
              <Grid container>
                {outletsData?.map((el, idx) => (
                  <Grid
                    item
                    key={idx}
                    sm={11}
                    md={5.5}
                    sx={{
                      background: "#FCFCFC",
                      border: "1px solid #AAACAE",
                      borderRadius: "15px",
                      m: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(
                        `/restaurant/${cloudKitchenData.cloudKitchenName.replace(
                          /\s+/g,
                          "-"
                        )}/${el.id}`
                      );
                      setShowOutletsModal(false);
                    }}
                  >
                    {/* Line 1 - address */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "10px",
                        gap: "10px",
                      }}
                    >
                      <Box
                        component="img"
                        sx={{
                          width: "24px",
                          height: "24px",
                        }}
                        src="/media/svg/marker-filled.svg"
                      />
                      <Typography variant="bodyparagraph">
                        {el.streetAddress}
                        {", "}
                        {el.locality}
                        {", "}
                        {el.city}
                      </Typography>
                    </Box>
                    {/* Line 2 - Outlet name */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "10px 10px 10px 39px",
                        gap: "10px",
                      }}
                    >
                      <Typography variant="bodybold">
                        {el.outletName}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Modal for read more food item description */}
      <Modal
        open={openDescDialog}
        onClose={() => setOpenDescDialog(false)}
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
            alignItems: "cetner",
            p: 2,
            gap: "12px",
            background: "#FCFCFC",
            border: "1px solid #DFE2E6",
            borderRadius: "16px",
          }}
        >
          <Typography variant="bodyparagraph" sx={{ textAlign: "justify" }}>
            &emsp;{itemDesc}
          </Typography>
          <Button onClick={() => setOpenDescDialog(false)}>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default OutletDetails;
