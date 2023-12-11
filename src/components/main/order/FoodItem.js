import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Modal,
  Typography,
} from "@mui/material";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { getCart } from "../../../global/redux/actions";
import { useDispatch } from "react-redux";
import Carousel from "react-material-ui-carousel";
import Header from "../../general-components/ui-components/Header";
import { loginDrawer } from "../../../global/redux/actions";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";
import { format } from "date-fns";

const FoodItem = () => {
  const { id: foodItemId, chef: chefName, name: foodName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);

  const [foodItemData, setFoodItemData] = useState(null);
  const [isFoodItemFetching, setIsFoodItemFetching] = useState(true);
  const [invokeFoodItem, setInvokeFoodItem] = useState(true);
  const [foodImages, setFoodImages] = useState([]);

  const [cartData, setCartData] = useState([]);

  const [orderType, setOrderType] = useState("");
  const [deliveryType, setDeliveryType] = useState("doorDelivery");
  const [addressId, setAddressId] = useState(null);
  const [homeChefId, setHomeChefId] = useState(null);

  const [preOrderDate, setPreOrderDate] = useState(null);
  const [preOrderDay, setPreOrderDay] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState(null);

  const [firstLoad, setFirstLoad] = useState(true);

  const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
  const [showAddressConfirmModal, setShowAddressConfirmModal] = useState(false);
  const [preorderHours, setPreorderHours] = useState(null);

  const [invokeGetReviews, setInvokeGetReviews] = useState(true);
  const [isReviewFetching, setIsReviewFetching] = useState(true);
  const [reviewData, setReviewData] = useState([]);

  const [limit, setLimit] = useState(10);
  const [showLoadMore, setShowLoadMore] = useState(true);

  // Load More
  const loadMore = () => {
    setLimit((limit) => limit + 10);
    setInvokeGetReviews(true);
  };

  const isAddedToCart = (foodId) => {
    // check if cartData contains a matching record with same orderType, homeChefId, deliveryType and addressId
    // and if the foodItemId is available in foodItems
    //// if available, return quantity
    //// if not available, return 0

    let cartItems = JSON.parse(JSON.stringify(cartData));
    let cartMatch = cartItems?.filter(
      (el) =>
        el.orderType === orderType &&
        el.preOrderDate === preOrderDate &&
        el.deliverySlot === deliverySlot &&
        el.homeChefId === homeChefId &&
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
    //// if exists, check if cartItems contains a matching record with same orderType, homeChefId, deliveryType and addressId
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
                el.homeChefId === homeChefId &&
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
                      el.homeChefId === homeChefId &&
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
                      el.homeChefId === homeChefId &&
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
                // cloudKitchenOutletId: cloudKitchenOutletId,
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
                // cloudKitchenOutletId: cloudKitchenOutletId,
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
        el.homeChefId === homeChefId &&
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
            el.homeChefId === homeChefId &&
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
        el.homeChefId === homeChefId &&
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
            el.homeChefId === homeChefId &&
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
            el.homeChefId === homeChefId &&
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
            el.homeChefId === homeChefId &&
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
            el.homeChefId === homeChefId &&
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

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Food Item";
  }, []);

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

  // Get cart data on first time load
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

  // Get food item
  useEffect(() => {
    try {
      if (foodItemId) {
        const getFoodList = async () => {
          let params = { id: foodItemId };
          let response = await invokeApi(
            config.apiDomains.foodService + apiList.getFoodItem,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              if (
                chefName !==
                response.data.foodItem.homeChefName?.replace(/\s+/g, "-")
              ) {
                window.history.replaceState(
                  null,
                  "",
                  `/food/${response.data.foodItem.homeChefName?.replace(
                    /\s+/g,
                    "-"
                  )}/${foodName}/${foodItemId}`
                );
              }
              setHomeChefId(response.data.foodItem.homeChefId);
              setFoodItemData(response.data.foodItem);
              setFoodImages([
                response.data.foodItem.image1,
                response.data.foodItem.image2,
                response.data.foodItem.image3,
                response.data.foodItem.image4,
                response.data.foodItem.image5,
                response.data.foodItem.image6,
              ]);
              setIsFoodItemFetching(false);
            } else {
              alert(
                "Something went wrong while fetching food item. Please try again later!"
              );
              setIsFoodItemFetching(false);
            }
          } else if (response.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while fetching food item. Please try again later!!"
            );
            setIsFoodItemFetching(false);
          }
        };
        if (invokeFoodItem) {
          setInvokeFoodItem(false);
          getFoodList();
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      navigate("/");
    }
  }, [cookies, navigate, foodItemId, foodName, chefName, invokeFoodItem]);

  // Get food Reviews
  useEffect(() => {
    const getReviews = async () => {
      let params = { foodItemId: 14, limit, offset: 0 };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getReviews,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (response.data.reviews.length < limit) {
            setShowLoadMore(false);
          }
          setReviewData((prev) => [...prev, ...response.data.reviews]);
          setIsReviewFetching(false);
        } else {
          alert(
            "Something went wrong while getting reviews. Please try again later!"
          );
          setIsReviewFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while getting reviews. Please try again later!!"
        );
        setIsReviewFetching(false);
      }
    };
    if (invokeGetReviews) {
      setInvokeGetReviews(false);
      getReviews();
    }
  }, [cookies, navigate, invokeGetReviews, limit]);

  return (
    <>
      <Header />
      {isFoodItemFetching || isReviewFetching ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <Box>
          <Card
            variant="outlined"
            sx={{ width: { xs: 350, sm: 600 }, mx: "auto", my: 2 }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="header4" sx={{ textAlign: "center" }}>
                {foodItemData?.itemName}
              </Typography>
              {/* Gallery images */}

              <Carousel animation="slide" duration={800} sx={{ mt: "29px" }}>
                {foodImages
                  ?.filter((el) => el !== undefined)
                  .map((el, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      sx={{
                        height: "364px",
                        width: "100%",
                        objectFit: "contain",
                      }}
                      src={el}
                    />
                  ))}
              </Carousel>

              <Box
                sx={{
                  display: "flex",
                  flex: 1.5,
                  flexDirection: "row",
                  padding: "0px",
                  gap: "10px",
                }}
              >
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
                      {foodItemData?.homeChefName}
                    </Typography>
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
                    <Box
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
                        {foodItemData?.cuisineName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignSelf: "stretch",
                  cursor: "pointer",
                }}
              >
                {/* Food items list */}
                <Box
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: { xs: "16px 8px", sm: "20px" },
                    gap: "12px",
                    background: "#FCFCFC",
                    // borderBottom: "1px solid #DFE2E6",
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
                        src={foodItemData?.image1}
                      />
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
                            foodItemData?.vegNonVeg === "Veg"
                              ? "/media/svg/veg.svg"
                              : "/media/svg/non-veg.svg"
                          }
                        />
                        {/* Food item name */}
                        <Typography variant="bodybold">
                          {foodItemData?.itemName}
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
                          {foodItemData?.spiceLevel === "Mild" ? (
                            <Box
                              component="img"
                              sx={{
                                height: "24px",
                              }}
                              src="/media/svg/spice-mild.svg"
                            />
                          ) : foodItemData?.spiceLevel === "Medium" ? (
                            <Box
                              component="img"
                              sx={{
                                height: "24px",
                              }}
                              src="/media/svg/spice-medium.svg"
                            />
                          ) : foodItemData?.spiceLevel === "Hot" ? (
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
                  {foodItemData?.description !== "" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography
                        variant="bodyregular"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          color: "#4D4D4D",
                        }}
                      >
                        {foodItemData?.description}
                      </Typography>
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
                    {foodItemData?.mrp > foodItemData?.sellingPrice ? (
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
                          ₹ {foodItemData?.mrp}
                        </Typography>
                        <Typography variant="bodybold">
                          ₹ {foodItemData?.sellingPrice}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="bodybold">
                        ₹ {foodItemData?.sellingPrice}
                      </Typography>
                    )}

                    {/* increment decrement buttons if added to cart */}
                    {isAddedToCart(foodItemData?.id) > 0 ? (
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
                              foodItemData?.id,
                              foodItemData?.minOrderQuantity
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
                          {isAddedToCart(foodItemData.id) ===
                          foodItemData.minOrderQuantity ? (
                            <Box
                              component="img"
                              sx={{
                                width: "14px",
                                height: "14px",
                              }}
                              src={"/media/svg/delete-filled-orange.svg"}
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
                            {isAddedToCart(foodItemData.id)}
                          </Typography>
                        </Box>

                        {/* Increment button */}
                        <Box
                          onClick={() => {
                            if (
                              orderType === "instant" ||
                              (orderType === "preorder" &&
                                foodItemData.maxCapacity >
                                  isAddedToCart(foodItemData.id))
                            ) {
                              incrementQuantity(
                                foodItemData.id,
                                foodItemData.weight
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
                          foodItemData?.currentAvailability === "On") ||
                        (orderType === "preorder" &&
                          foodItemData?.maxCapacity >=
                            foodItemData?.minOrderQuantity &&
                          preorderHours >= foodItemData.hoursToPreOrder) ? (
                          <Button
                            onClick={() => {
                              addToCart(foodItemData);
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
                    {foodItemData?.minOrderQuantity > 1 &&
                      ((orderType === "instant" &&
                        foodItemData?.currentAvailability === "On") ||
                        (orderType === "preorder" &&
                          foodItemData?.maxCapacity >=
                            foodItemData?.minOrderQuantity &&
                          preorderHours >= foodItemData?.hoursToPreOrder)) && (
                        <Typography
                          variant="bodymetatag"
                          sx={{ color: "#FF774C" }}
                        >
                          Min quantity: {foodItemData?.minOrderQuantity}
                        </Typography>
                      )}
                  </Box>
                </Box>
              </Box>
              {/* Reviews */}
              <Typography variant="h6">Reviews</Typography>
              {reviewData?.map((el, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    py: "5px",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      {el.userFullName}
                    </Typography>
                    <Rating
                      customIcons={[
                        {
                          icon:
                            el.rating === 1 ? (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-1star-active.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ) : (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-1star-inactive.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ),
                        },
                        {
                          icon:
                            el.rating === 2 ? (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-2star-active.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ) : (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-2star-inactive.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ),
                        },
                        {
                          icon:
                            el.rating === 3 ? (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-3star-active.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ) : (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-3star-inactive.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ),
                        },
                        {
                          icon:
                            el.rating === 4 ? (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-4star-active.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ) : (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-4star-inactive.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ),
                        },
                        {
                          icon:
                            el.rating === 5 ? (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-5star-active.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ) : (
                              <Box
                                component={"img"}
                                src="/media/svg/rating-5star-inactive.svg"
                                sx={{ width: 27, m: 0.5, height: 27 }}
                              />
                            ),
                        },
                      ]}
                    />
                  </Box>
                  <Typography variant="bodymetatag">
                    {!!el.createdDate &&
                      format(new Date(el.createdDate), "dd-MMM-yyy")}
                  </Typography>
                  {!!el.review && (
                    <Typography variant="bodyparagraph">{el.review}</Typography>
                  )}
                </Box>
              ))}
              {showLoadMore && (
                <Button
                  variant="outlined"
                  sx={{ my: 2 }}
                  onClick={() => loadMore()}
                >
                  Load more
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

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
        setShowAddressConfirmModal
        onClose={() => false}
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
                    navigate("/add-address");
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
    </>
  );
};

export default FoodItem;
