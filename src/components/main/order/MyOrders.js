import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  StepLabel,
  Step,
  Stepper,
  CircularProgress,
  Drawer,
  TextField,
  Tooltip,
  Typography,
  Modal,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import { useCookies } from "react-cookie";
import Header from "../../general-components/ui-components/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";
import { orderNoFormat } from "../../../common/common";
import {
  format,
  differenceInCalendarDays,
  differenceInHours,
  parseISO,
} from "date-fns";

const libraries = ["places"];

const steps = ["Created", "Confirmed", "Packed", "Dispatched", "Delivered"];

const MyOrders = () => {
  const mapRef = useRef(null);
  const [cookies] = useCookies();

  const [isLoading, setIsLoading] = useState(true);

  const [invokeActiveOrders, setInvokeActiveOrders] = useState(true);
  const [isActiveOrdersFetching, setIsActiveOrdersFetching] = useState(true);
  const [activeOrdersData, setActiveOrdersData] = useState([]);

  const [invokePastOrders, setInvokePastOrders] = useState(true);
  const [isPastOrdersFetching, setIsPastOrdersFetching] = useState(true);
  const [pastOrdersData, setPastOrdersData] = useState([]);

  const [limit, setLimit] = useState(10);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [isLoadMoreFetching, setIsLoadMoreFetching] = useState(false);

  const [trackOrderDrawer, setTrackOrderDrawer] = useState(false);

  const [directionsData, setDirectionsData] = useState(null);
  const [isRatingDrawerOpen, setIsRatingDrawerOpen] = useState(false);
  const [ratingOrderElement, setRatingOrderElement] = useState(null);
  const [invokeDunzoLocation, setInvokeDunzoLocation] = useState(false);
  const [isDunzoLocationFetching, setIsDunzoLocationFetching] = useState(false);

  const [ratingFoodDelivery, setRatingFoodDelivery] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [reviewFoodDelivery, setReviewFoodDelivery] = useState("");

  const [orderElement, setOrderElement] = useState(null);
  // preorder slots
  // const [preorderSlots, setPreorderSlots] = useState([]);
  // const [invokePreorderSlots, setInvokePreorderSlots] = useState(true);
  const [showToolTip, setShowToolTip] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelOrderFetching, setIsCancelOrderFetching] = useState(false);
  const [cancelElementId, setCancelElementId] = useState(null);

  const [ratingFood, setRatingFood] = useState(0);

  const cancelOrderCheck = (el) => {
    let takeHours = el.foodItems.map((el) => el.hoursToPreOrder);
    let sortHours = takeHours.sort((a, b) => b - a);
    let sortHoursAdd24 = sortHours[0] + 24;
    let sortHoursMulti2 = sortHours[0] * 2;
    let sortValue = [sortHoursAdd24, sortHoursMulti2].sort((a, b) => a - b);
    let yearCookie = el.preOrderDate.split("-")[0];
    let monthCookie = el.preOrderDate.split("-")[1];
    let dateCookie = el.preOrderDate.split("-")[2];
    let modifier = el.deliverySlot.split(" ")[0].slice(-2);
    let hours = el.deliverySlot.split(" ")[0].replace(/\D/g, "");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "pm") {
      hours = parseInt(hours, 10) + 12;
    }
    if (
      differenceInHours(
        new Date(yearCookie, monthCookie - 1, dateCookie, hours),
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          new Date().getHours() + 1
        )
      ) > sortValue[0]
    ) {
      return true;
    } else {
      return false;
    }
  };

  const ColorlibStepIcon = ({ completed, active, icon }) => {
    const icons = {
      1:
        completed || active ? (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-created-done.svg"
          />
        ) : (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-created-pending.svg"
          />
        ),
      2:
        completed || active ? (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-confirmed-done.svg"
          />
        ) : (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-confirmed-pending.svg"
          />
        ),
      3:
        completed || active ? (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-packed-done.svg"
          />
        ) : (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-packed-pending.svg"
          />
        ),
      4:
        completed || active ? (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-dispatched-done.svg"
          />
        ) : (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-dispatched-pending.svg"
          />
        ),
      5:
        completed || active ? (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-delivered-done.svg"
          />
        ) : (
          <Box
            component={"img"}
            sx={{
              height: "46px",
              width: "46px",
            }}
            src="/media/svg/order-delivered-pending.svg"
          />
        ),
    };
    return icons[String(icon)];
  };

  const stepperTheme = createTheme({
    components: {
      MuiStep: {
        styleOverrides: {
          root: { marginBottom: "8px" },
        },
      },
      MuiStepConnector: {
        styleOverrides: {
          line: {
            borderBottomStyle: "dashed",
            borderTop: "none",
            borderBottomWidth: "1px",
            height: "5px",
            margin: "none",
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          iconContainer: {
            paddingRight: "0px",
          },
        },
      },
    },
  });

  const loadMore = () => {
    setIsLoadMoreFetching(true);
    setLimit((limit) => limit + 10);
    setInvokePastOrders(true);
  };

  // add delivery address
  const addOrderRating = async () => {
    let filterRatingFood = ratingOrderElement?.foodItems.filter(
      (el) => el.rating !== undefined
    );
    if (filterRatingFood.length > 0 || ratingFoodDelivery > 0) {
      let params = {
        orderId: orderId,
        ratings: filterRatingFood.map((item) => ({
          ratingFor: item.ratingFor,
          foodItemId: item.foodItemId,
          rating: item.rating,
          review: item.reviewText ?? null,
        })),
      };

      if (ratingFoodDelivery > 0) {
        params.ratings.push({
          ratingFor: "dunzoDelivery",
          rating: ratingFoodDelivery,
          review: reviewFoodDelivery ? reviewFoodDelivery : null,
        });
      }

      let response = await invokeApi(
        config.apiDomains.orderService + apiList.addOrderRating,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsRatingDrawerOpen(false);
          window.location.reload();
        } else {
          alert(
            "Something went wrong while submitting your rating. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while submitting your rating. Please try again later!!"
        );
      }
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    setIsCancelOrderFetching(true);
    let params = { id: cancelElementId };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.cancelOrder,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success(
          "Order cancelled Successfully. Your refund will be issued within 3-5 bussiness days."
        );
        setInvokeActiveOrders(true);
        setInvokePastOrders(true);
        setIsCancelOrderFetching(false);
        setIsCancelModalOpen(false);
      } else {
        alert(
          "Something went wrong while cancelling your order. Please try again later!"
        );
        setIsCancelOrderFetching(false);
        setIsCancelModalOpen(false);
      }
    } else {
      alert(
        "Something went wrong while cancelling your order. Please try again later!!"
      );
      setIsCancelOrderFetching(false);
      setIsCancelModalOpen(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | My Orders";
  }, []);

  // fetching dunzo runner latitude and longitude
  useEffect(() => {
    const getDunzoLiveLocation = async () => {
      setIsDunzoLocationFetching(true);
      let copy = JSON.parse(JSON.stringify(orderElement));
      let params = {
        id: orderElement?.id,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getDunzoLiveLocation,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (response.data.runner.location && trackOrderDrawer) {
            copy.dunzoPickup = response.data.eta.dropoff;
            copy.dunzoRunner = response.data.runner;
            setOrderElement(copy);
            setIsDunzoLocationFetching(false);

            const directionsService =
              new window.google.maps.DirectionsService();
            directionsService.route(
              {
                origin: new window.google.maps.LatLng(
                  response.data.runner.location.lat,
                  response.data.runner.location.lng
                ),
                destination: new window.google.maps.LatLng(
                  orderElement?.userLatitude,
                  orderElement?.userLongitude
                ),
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  setDirectionsData({
                    directions: result,
                  });
                } else {
                  console.error("error fetching directions", result, status);
                }
              }
            );
          }
        } else {
          alert(
            "Something went wrong while fetching delivery agent location. Please try again later!"
          );
          setIsDunzoLocationFetching(false);
        }
      } else {
        alert(
          "Something went wrong while fetching delivery agent location. Please try again later!!"
        );
        setIsDunzoLocationFetching(false);
      }
    };
    if (
      invokeDunzoLocation &&
      trackOrderDrawer &&
      orderElement?.status === "Dispatched" &&
      orderElement?.deliveryType !== "selfPickup"
    ) {
      setInvokeDunzoLocation(false);
      getDunzoLiveLocation();
    }
    const interval = setInterval(() => {
      if (
        trackOrderDrawer &&
        !isDunzoLocationFetching &&
        orderElement?.status === "Dispatched" &&
        orderElement?.deliveryType !== "selfPickup"
      ) {
        getDunzoLiveLocation();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [
    invokeDunzoLocation,
    isDunzoLocationFetching,
    trackOrderDrawer,
    orderElement,
    cookies,
  ]);

  // Get active orders by user
  useEffect(() => {
    const getActiveOrdersByUser = async () => {
      setIsActiveOrdersFetching(true);
      let copy = JSON.parse(JSON.stringify(orderElement));
      let params = {};
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getActiveOrdersByUser,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          // if track order drawer is open for an active order
          if (
            trackOrderDrawer &&
            !!orderElement &&
            (orderElement.status === "Created" ||
              orderElement.status === "Confirmed" ||
              orderElement.status === "Packed" ||
              orderElement.status === "Dispatched")
          ) {
            let filterOrder = response.data.orders.filter(
              (el) => el.id === orderElement?.id
            );
            if (filterOrder.length > 0) {
              copy.status = filterOrder[0].status;
              setOrderElement(copy);
            } else {
              // status of previously active order is changed now; close the drawer
              setTrackOrderDrawer(false);
            }
          }
          setActiveOrdersData(response.data.orders);
          setIsLoading(false);
          setIsActiveOrdersFetching(false);
        } else {
          alert(
            "Something went wrong while fetching Active Orders data. Please try again later!"
          );
          setIsActiveOrdersFetching(false);
        }
      } else {
        alert(
          "Something went wrong while fetching Active Orders data. Please try again later!!"
        );
        setIsActiveOrdersFetching(false);
      }
    };
    if (invokeActiveOrders) {
      setInvokeActiveOrders(false);
      getActiveOrdersByUser();
    }

    const interval = setInterval(() => {
      if (!isActiveOrdersFetching) {
        getActiveOrdersByUser();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [
    invokeActiveOrders,
    cookies,
    isActiveOrdersFetching,
    trackOrderDrawer,
    orderElement,
  ]);

  // Get past orders by user
  useEffect(() => {
    const getPastOrdersByUser = async () => {
      setIsPastOrdersFetching(true);
      let params = {
        limit,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getPastOrdersByUser,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setPastOrdersData(response.data.orders);

          if (response.data.orders?.length < limit) {
            setShowLoadMore(false);
          }
          setIsPastOrdersFetching(false);
          setIsLoadMoreFetching(false);
        } else {
          alert(
            "Something went wrong while fetching Previous Orders By User. Please try again later!"
          );
          setIsPastOrdersFetching(false);
          setIsLoadMoreFetching(false);
        }
      } else {
        alert(
          "Something went wrong while fetching Previous Orders By User. Please try again later!!"
        );
        setIsPastOrdersFetching(false);
        setIsLoadMoreFetching(false);
      }
    };
    if (invokePastOrders) {
      setInvokePastOrders(false);
      getPastOrdersByUser();
    }

    const interval = setInterval(() => {
      if (!isPastOrdersFetching) {
        getPastOrdersByUser();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [invokePastOrders, cookies, isPastOrdersFetching, limit]);

  return (
    <>
      <Header
        showAddress={false}
        showPreferences={false}
        showCuisines={false}
      />
      {isLoading ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <Box sx={{ marginLeft: "27px", marginTop: "29px" }}>
          {/* Active orders */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            <Typography variant="header3">Active Orders</Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* Render Active orders */}
              {activeOrdersData.length > 0 ? (
                <>
                  {activeOrdersData?.map((el, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: "20px",
                        gap: "10px",
                        background: "#FCFCFC",
                        border: "1px solid #DFE2E6",
                        borderRadius: "15px",
                      }}
                    >
                      {/* Food details, date, price */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                          width: { xs: "283px", sm: "383px" },
                        }}
                      >
                        {/* Food details */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "15px",
                            width: "100%",
                          }}
                        >
                          {/* chef info */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "11px",
                              width: "100%",
                            }}
                          >
                            {/* chef profile image */}
                            <Box
                              component={"img"}
                              sx={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "15px",
                                filter:
                                  "drop-shadow(0px 5px 25px rgba(42, 48, 55, 0.12))",
                              }}
                              src={el.chefProfileImage}
                            />
                            {/* chef name, order id and chef location */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "calc(100% - 60px - 11px)",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                {/* chef name */}
                                <Typography
                                  variant="header4"
                                  sx={{
                                    maxWidth: "100%",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {el.chefName ??
                                    `${el.cloudKitchenName} - ${el.outletName}`}
                                </Typography>

                                {el.deliveryType === "selfPickup" && (
                                  <Typography variant="bodymetatag">
                                    Delivery Passcode: {el.deliveryPasscode}
                                  </Typography>
                                )}
                              </Box>

                              {/* order id and delivery type */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                {/* order id */}
                                <Typography variant="bodyparagraph">
                                  #{orderNoFormat(el.id.toString())}
                                </Typography>
                                {/* delivery type */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "10px 15px",
                                    gap: "10px",
                                    background:
                                      el.deliveryType === "selfPickup"
                                        ? "#DDDCEC"
                                        : "#FDF6EB",
                                    borderRadius: "20px",
                                  }}
                                >
                                  <Typography
                                    variant="bodymetatag"
                                    sx={{
                                      maxWidth: "175px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      color:
                                        el.deliveryType === "selfPickup"
                                          ? "#1C1853"
                                          : "#FF9800",
                                    }}
                                  >
                                    {el.deliveryType === "selfPickup"
                                      ? "Self Pickup"
                                      : el.userAddressTag}
                                  </Typography>
                                  <Box
                                    sx={{ width: "16px", height: "16px" }}
                                    component={"img"}
                                    src={
                                      el.deliveryType === "selfPickup"
                                        ? "/media/svg/self-pickup.svg"
                                        : el.userAddressTag === "Home"
                                        ? "/media/svg/home-filled-orange.svg"
                                        : el.userAddressTag === "Work"
                                        ? "/media/svg/work-filled-orange.svg"
                                        : "/media/svg/marker-filled-orange.svg"
                                    }
                                  />
                                </Box>
                              </Box>

                              {/* chef location */}
                              <Typography
                                variant="bodyparagraph"
                                sx={{
                                  maxWidth: "100%",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {el.locality}, {el.city}
                              </Typography>
                            </Box>
                          </Box>

                          {/* order status and chef number */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "10px 15px",
                                gap: "10px",
                                background:
                                  el.status === "Created"
                                    ? "#DDDCEC"
                                    : el.status === "Confirmed"
                                    ? "#FDF6EB"
                                    : el.status === "Packed"
                                    ? "#DEEFFD"
                                    : el.status === "Dispatched"
                                    ? "#E5EFED"
                                    : "#FCFCFC",
                                borderRadius: "20px",
                              }}
                            >
                              <Typography
                                variant="bodymetatag"
                                sx={{
                                  color:
                                    el.status === "Created"
                                      ? "#1C1853"
                                      : el.status === "Confirmed"
                                      ? "#FF9800"
                                      : el.status === "Packed"
                                      ? "#2196F3"
                                      : el.status === "Dispatched"
                                      ? "#0B735F"
                                      : "#FCFCFC",
                                }}
                              >
                                {el.status}
                              </Typography>
                              <Box
                                sx={{ width: "16px", height: "16px" }}
                                component={"img"}
                                src={
                                  el.status === "Created"
                                    ? "/media/svg/order-created-purple.svg"
                                    : el.status === "Confirmed"
                                    ? "/media/svg/order-confirmed-orange.svg"
                                    : el.status === "Packed"
                                    ? "/media/svg/order-packed-blue.svg"
                                    : el.status === "Dispatched"
                                    ? "/media/svg/order-dispatched-green.svg"
                                    : ""
                                }
                              />
                            </Box>
                            {/* todo:: api chnages done remove the hard code number */}
                            {el.deliveryType === "selfPickup" &&
                              !!el.chefPhoneNumber && (
                                <Typography variant="bodyparagraph">
                                  <Link
                                    href={"tel:" + el.chefPhoneNumber}
                                    sx={{ textDecoration: "none" }}
                                  >
                                    +91 {el.chefPhoneNumber}
                                  </Link>{" "}
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      cursor: "pointer",
                                    }}
                                    src="/media/svg/copy-to-clipboard.svg"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        el.chefPhoneNumber
                                      );
                                      toast("Copied to clipboard", {
                                        position: toast.POSITION.BOTTOM_CENTER,
                                        autoClose: 1000,
                                        hideProgressBar: true,
                                      });
                                    }}
                                  />
                                </Typography>
                              )}
                          </Box>

                          {/* Order type */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Box
                              sx={{
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "0px 9px 0px 0px",
                                gap: "8px",
                                background: "#FFF8F5",
                                borderRadius: "28px",
                                border: "1px solid #FA8820",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "10px",
                                  gap: "10px",
                                  background:
                                    "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                                  borderRadius: "36px",
                                }}
                              >
                                <Box
                                  component={"img"}
                                  sx={{ width: "16px" }}
                                  src={
                                    el.orderType === "instant"
                                      ? "/media/svg/instant-order-white.svg"
                                      : "/media/svg/preorder-white.svg"
                                  }
                                />
                              </Box>
                              <Typography
                                variant="bodymetatag"
                                sx={{
                                  background:
                                    "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                  textFillColor: "transparent",
                                }}
                              >
                                {el.orderType === "instant"
                                  ? "Instant Order"
                                  : "Preorder"}
                              </Typography>
                            </Box>

                            {/* preorder date and slot */}
                            {el.orderType === "preorder" && (
                              <Typography variant="bodyregular">
                                {format(
                                  new Date(el.preOrderDate),
                                  "LLL dd, EEE"
                                )}
                                {" ("}
                                {
                                  // preorderSlots.filter(
                                  //   (sl) => sl.id === el.preorderSlotId
                                  // )[0]?.slot
                                  el.deliverySlot
                                }
                                {")"}
                              </Typography>
                            )}
                          </Box>

                          {/* food items */}
                          <Typography
                            sx={{
                              maxWidth: "100%",
                              // whiteSpace: "nowrap",
                              // overflow: "hidden",
                              // textOverflow: "ellipsis",
                            }}
                          >
                            {el.foodItems
                              .map(
                                (item) =>
                                  item.quantity + " x " + item.foodItemName
                              )
                              .join(", ")}
                          </Typography>
                        </Box>

                        {/* line */}
                        <Box
                          component={"span"}
                          sx={{
                            width: "100%",
                            height: "0px",
                            border: "1px dashed #DFE2E6",
                            alignSelf: "stretch",
                          }}
                        />

                        {/* date time and price details */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "6px",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          {/* date time */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "7px",
                            }}
                          >
                            <Box
                              component={"img"}
                              sx={{
                                width: "16px",
                                height: "16px",
                              }}
                              src="/media/svg/time.svg"
                            />
                            <Typography variant="bodyregular">
                              {format(
                                new Date(el.createdDate.split(" ")[0]),
                                "LLL dd, EEE"
                              )}{" "}
                              {format(parseISO(el.createdDate), "hh:mm a")}
                            </Typography>
                          </Box>

                          {/* price */}
                          <Typography variant="bodybold">
                            ₹ {el.grandTotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "20px",
                        }}
                      >
                        {el.deliveryType === "selfPickup" ? (
                          <Button variant="contained">
                            <Link
                              href={`http://www.google.com/maps/place/${el.chefLatitude},${el.chefLongitude}`}
                              target="_blank"
                              sx={{ color: "#FCFCFC", textDecoration: "none" }}
                            >
                              View Location
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => {
                              setTrackOrderDrawer(true);
                              setOrderElement(el);
                              if (el.status === "Dispatched") {
                                setInvokeDunzoLocation(true);
                              }
                            }}
                          >
                            Track Order
                          </Button>
                        )}
                        {/* todo::ask for confirmation from user before cancelling the order */}
                        {el.status === "Created" &&
                          el.orderType === "instant" && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setCancelElementId(el.id);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              Cancel Order
                            </Button>
                          )}

                        {el.orderType === "preorder" &&
                          cancelOrderCheck(el) && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setCancelElementId(el.id);
                                setIsCancelModalOpen(true);
                              }}
                              disabled={el.isFetching}
                            >
                              {el.isFetching ? (
                                <CircularProgress size={24} sx={{ mr: 2 }} />
                              ) : (
                                <></>
                              )}
                              Cancel Order
                            </Button>
                          )}
                      </Box>
                    </Box>
                  ))}
                </>
              ) : (
                <Typography variant="bodyparagraph">
                  No active orders available!
                </Typography>
              )}
            </Box>
          </Box>

          {/* Previous orders */}
          <Box sx={{ marginTop: "29px" }}>
            <Typography variant="header3">Previous Orders</Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                mt: 2,
              }}
            >
              {pastOrdersData.length > 0 ? (
                <>
                  {pastOrdersData?.map((el, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: "15px",
                        width: "calc(100% - 30px)",
                      }}
                    >
                      {/* left side timeline */}
                      <Box
                        sx={{
                          width: "15px",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            boxSizing: "border-box",
                            width: "15px",
                            height: "15px",
                            border: "1px solid #F9881F",
                            borderRadius: "50%",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            width: "11px",
                            height: "11px",
                            left: "2px",
                            top: "2px",
                            background:
                              "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                            borderRadius: "50%",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            width: "0px",
                            height:
                              el.status === "Delivered" ? "395px" : "349px",
                            left: "6px",
                            top: "16px",
                            border: "1px dashed #AAACAE",
                          }}
                        />
                      </Box>

                      {/* order details */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "22px",
                          width: "100%",
                        }}
                      >
                        {/* order id, created date and order status */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          {/* order id and created date */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "5px",
                            }}
                          >
                            <Typography variant="bodyparagraph">
                              #{orderNoFormat(el.id.toString())}
                            </Typography>
                            {/* created date */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "7px",
                              }}
                            >
                              <Box
                                component={"img"}
                                sx={{
                                  width: "16px",
                                  height: "16px",
                                }}
                                src="/media/svg/time.svg"
                              />
                              <Typography variant="bodyparagraph">
                                {format(
                                  new Date(el.createdDate.split(" ")[0]),
                                  "EEE dd LLL, yyyy"
                                )}{" "}
                                {format(parseISO(el.createdDate), "hh:mm a")}
                              </Typography>
                            </Box>
                          </Box>
                          {/* order status */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "10px 15px",
                              gap: "10px",
                              background:
                                el.status === "Delivered" ||
                                el.status === "Refund Issued"
                                  ? "#E5EFED"
                                  : "#FEECEB",
                              borderRadius: "20px",
                            }}
                          >
                            <Typography
                              variant="bodymetatag"
                              sx={{
                                color:
                                  el.status === "Delivered" ||
                                  el.status === "Refund Issued"
                                    ? "#0B735F"
                                    : "#F44336",
                              }}
                            >
                              {el.status}
                            </Typography>
                            <Box
                              sx={{ width: "16px", height: "16px" }}
                              component={"img"}
                              src={
                                el.status === "Delivered" ||
                                el.status === "Refund Issued"
                                  ? "/media/svg/tick-circled-green.svg"
                                  : "/media/svg/error-exclaim-filled.svg"
                              }
                            />
                          </Box>
                        </Box>

                        {/* Chef data, order data and food items */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "15px",
                          }}
                        >
                          {/* chef data and price */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              gap: "11px",
                            }}
                          >
                            {/* chef image */}
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
                                src={el.chefProfileImage}
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
                                  !!el.chefName
                                    ? "/media/svg/home-chef-ribbon.svg"
                                    : "/media/svg/restaurant-ribbon.svg"
                                }
                              />
                            </Box>

                            {/* chef name, locality, price */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                height: "100px",
                                justifyContent: "space-around",
                              }}
                            >
                              <Typography variant="header4">
                                {el.chefName ??
                                  `${el.cloudKitchenName} - ${el.outletName}`}
                              </Typography>
                              <Typography variant="bodyparagraph">
                                {el.locality}, {el.city}
                              </Typography>
                              <Typography variant="bodyparagraph">
                                ₹ {el.grandTotal.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Order type */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "0px 9px 0px 0px",
                              gap: "8px",
                              background: "#FFF8F5",
                              borderRadius: "28px",
                              border: "1px solid #FA8820",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "10px",
                                gap: "10px",
                                background:
                                  "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                                borderRadius: "36px",
                              }}
                            >
                              <Box
                                component={"img"}
                                sx={{ width: "16px" }}
                                src={
                                  el.orderType === "instant"
                                    ? "/media/svg/instant-order-white.svg"
                                    : "/media/svg/preorder-white.svg"
                                }
                              />
                            </Box>
                            <Typography
                              variant="bodymetatag"
                              sx={{
                                background:
                                  "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                textFillColor: "transparent",
                              }}
                            >
                              {el.orderType === "instant"
                                ? "Instant Order"
                                : "Preorder"}
                            </Typography>
                          </Box>

                          {/* preorder date and slot */}
                          {el.orderType === "preorder" && (
                            <Typography variant="bodyregular">
                              {format(new Date(el.preOrderDate), "LLL dd, EEE")}
                              {" ("}
                              {
                                // preorderSlots.filter(
                                //   (sl) => sl.id === el.preorderSlotId
                                // )[0]?.slot
                                el.deliverySlot
                              }
                              {")"}
                            </Typography>
                          )}
                        </Box>

                        {/* Delivered date */}
                        {/* todo:: get deliveredDate from API */}
                        {el.status === "Delivered" && (
                          <Typography>
                            {el.deliveryType === "doorDelivery"
                              ? "Delivered to " + el.userAddressTag
                              : "Self Pickup"}
                            {" on "}
                            {format(
                              new Date(
                                el.deliveredDate.split(" ")[0] ??
                                  el.updatedDate.split(" ")[0]
                              ),
                              "LLL dd, yyyy"
                            )}{" "}
                            {format(
                              parseISO(el.deliveredDate ?? el.updatedDate),
                              "hh:mm a"
                            )}
                          </Typography>
                        )}

                        {/* food items */}
                        <Typography
                          variant="bodyparagraph"
                          sx={{
                            maxWidth: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {el.foodItems
                            .map(
                              (item) =>
                                item.quantity + " x " + item.foodItemName
                            )
                            .join(", ")}
                        </Typography>

                        {/* buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: "20px",
                            mb: 3,
                          }}
                        >
                          {el.status === "Delivered" &&
                            differenceInCalendarDays(
                              new Date(),
                              new Date(el.deliveredDate.split(" ")[0])
                            ) < 10 &&
                            !el.ratingFlag && (
                              <Button
                                variant="contained"
                                onClick={() => {
                                  setRatingOrderElement(el);
                                  setOrderId(el.id);
                                  setIsRatingDrawerOpen(true);
                                }}
                              >
                                Rate
                              </Button>
                            )}
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setTrackOrderDrawer(true);
                              setOrderElement(el);
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </>
              ) : (
                <Typography variant="bodyparagraph">
                  No previous orders available!
                </Typography>
              )}
            </Box>
            {showLoadMore && (
              <Button
                variant="outlined"
                sx={{ my: 2 }}
                onClick={() => loadMore()}
                disabled={isLoadMoreFetching}
              >
                {isLoadMoreFetching ? (
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                ) : (
                  <></>
                )}
                Load more
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Drawer for track order */}
      <Drawer
        anchor="right"
        open={trackOrderDrawer}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: {
            width: "50%",
            minWidth: "325px",
            maxWidth: "600px",
            background: "#FCFCFC",
          },
        }}
      >
        {/* drawer header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px",
              alignSelf: "flex-start",
              width: "100%",
            }}
          >
            {/* header text */}
            <Typography variant="header4">
              {orderElement?.status === "Created" ||
              orderElement?.status === "Confirmed" ||
              orderElement?.status === "Packed" ||
              orderElement?.status === "Dispatched"
                ? "Track Order"
                : "Order Details"}
            </Typography>
            {/* Cancel icon */}
            <Box
              onClick={() => {
                setTrackOrderDrawer(false);
              }}
              component={"img"}
              sx={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
                mt: "5px",
                mr: "5px",
              }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>
          {/* Line */}
          <Box
            sx={{
              // width: "519px",
              height: "0px",
              border: "1px solid #2A3037",
              alignSelf: "stretch",
            }}
          />
        </Box>

        {/* Body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
            px: "25px",
            pb: "25px",
            width: "calc(100% - 50px)",
          }}
        >
          {/* Maps */}
          {trackOrderDrawer &&
            orderElement?.status === "Dispatched" &&
            orderElement?.deliveryType !== "selfPickup" && (
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <LoadScript
                  googleMapsApiKey={config.googleMapsApiKey}
                  libraries={libraries}
                >
                  <GoogleMap
                    ref={mapRef}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                    mapContainerStyle={{ height: "400px" }}
                    zoom={17}
                  >
                    {/* origin Lat, Lng */}
                    <Marker
                      icon={"/media/svg/chef-cap-circled-orange.svg"}
                      position={{
                        lat: parseFloat(orderElement?.chefLatitude),
                        lng: parseFloat(orderElement?.chefLongitude),
                      }}
                    />

                    {/* Runner Lat, Lng */}
                    <Marker
                      icon={"/media/svg/delivery-bike.svg"}
                      position={{
                        lat: parseFloat(
                          orderElement?.dunzoRunner?.location?.lat
                        ),
                        lng: parseFloat(
                          orderElement?.dunzoRunner?.location?.lng
                        ),
                      }}
                    />

                    {/* Destination Lat, Lng */}
                    <Marker
                      icon={"/media/svg/home-circled-orange.svg"}
                      position={{
                        lat: parseFloat(orderElement?.userLatitude),
                        lng: parseFloat(orderElement?.userLongitude),
                      }}
                    />
                    {directionsData?.directions && (
                      <DirectionsRenderer
                        directions={directionsData?.directions}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: "#F9881F",
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              </Box>
            )}

          {/* Order Details */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "15px",
              width: "100%",
            }}
          >
            {/* chef info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "11px",
                width: "100%",
              }}
            >
              {/* chef profile image */}
              <Box
                component={"img"}
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "15px",
                  filter: "drop-shadow(0px 5px 25px rgba(42, 48, 55, 0.12))",
                }}
                src={orderElement?.chefProfileImage}
              />
              {/* chef name, order id and chef location */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "calc(100% - 60px - 11px)",
                }}
              >
                {/* chef name */}
                <Typography
                  variant="header4"
                  sx={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {orderElement?.chefName ??
                    `${orderElement?.cloudKitchenName} - ${orderElement?.outletName}`}
                </Typography>

                {/* order id and delivery type */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {/* order id */}
                  <Typography variant="bodyparagraph">
                    #{orderNoFormat(orderElement?.id.toString())}
                  </Typography>
                  {/* delivery type */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: "10px 15px",
                      gap: "10px",
                      background:
                        orderElement?.deliveryType === "selfPickup"
                          ? "#DDDCEC"
                          : "#FDF6EB",
                      borderRadius: "20px",
                    }}
                  >
                    <Typography
                      variant="bodymetatag"
                      sx={{
                        maxWidth: "175px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color:
                          orderElement?.deliveryType === "selfPickup"
                            ? "#1C1853"
                            : "#FF9800",
                      }}
                    >
                      {orderElement?.deliveryType === "selfPickup"
                        ? "Self Pickup"
                        : orderElement?.userAddressTag}
                    </Typography>
                    <Box
                      sx={{ width: "16px", height: "16px" }}
                      component={"img"}
                      src={
                        orderElement?.deliveryType === "selfPickup"
                          ? "/media/svg/self-pickup.svg"
                          : orderElement?.userAddressTag === "Home"
                          ? "/media/svg/home-filled-orange.svg"
                          : orderElement?.userAddressTag === "Work"
                          ? "/media/svg/work-filled-orange.svg"
                          : "/media/svg/marker-filled-orange.svg"
                      }
                    />
                  </Box>
                </Box>

                {/* chef location */}
                <Typography
                  variant="bodyparagraph"
                  sx={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {orderElement?.locality}, {orderElement?.city}
                </Typography>
              </Box>
            </Box>

            {/* Order type */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px 9px 0px 0px",
                  gap: "8px",
                  background: "#FFF8F5",
                  borderRadius: "28px",
                  border: "1px solid #FA8820",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "10px",
                    gap: "10px",
                    background:
                      "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                    borderRadius: "36px",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "16px" }}
                    src={
                      orderElement?.orderType === "instant"
                        ? "/media/svg/instant-order-white.svg"
                        : "/media/svg/preorder-white.svg"
                    }
                  />
                </Box>
                <Typography
                  variant="bodymetatag"
                  sx={{
                    background:
                      "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                  }}
                >
                  {orderElement?.orderType === "instant"
                    ? "Instant Order"
                    : "Preorder"}
                </Typography>
              </Box>

              {/* preorder date and slot */}
              {orderElement?.orderType === "preorder" && (
                <Typography variant="bodyregular">
                  {format(new Date(orderElement?.preOrderDate), "LLL dd, EEE")}
                  {" ("}
                  {
                    // preorderSlots.filter(
                    //   (sl) => sl.id === orderElement?.preorderSlotId
                    // )[0]?.slot
                    orderElement?.deliverySlot
                  }
                  {")"}
                </Typography>
              )}
            </Box>

            {/* food items */}
            <Box
              sx={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "20px",
                gap: "6px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "10px",
                width: "100%",
              }}
            >
              {/* render each food item */}
              {orderElement?.foodItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0px",
                    width: "100%",
                    gap: "5px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{
                        width: "19px",
                        height: "19px",
                      }}
                      src={
                        item.vegNonVeg === "Veg"
                          ? "/media/svg/veg.svg"
                          : "/media/svg/non-veg.svg"
                      }
                    />
                    <Typography variant="bodyparagraph">
                      {item.quantity} X {item.foodItemName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="bodybold">
                      ₹&nbsp;{item.quantity * item.sellingPrice}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* Price summary */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                {/* line */}
                <Box
                  sx={{
                    width: "100%",
                    height: "0px",
                    border: "1px dashed #DFE2E6",
                  }}
                />

                {/* ITEM DISCOUNT */}
                {orderElement?.itemsDiscount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Item Discount
                    </Typography>
                    <Typography variant="bodybold">
                      - ₹ {orderElement?.itemsDiscount.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {/* Packing Charges */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0px",
                    gap: "15px",
                    width: "100%",
                  }}
                >
                  <Typography variant="bodyparagraph">
                    Packing Charges
                  </Typography>
                  <Typography variant="bodybold">
                    ₹&nbsp;
                    {orderElement?.totalPackingCharges}
                  </Typography>
                </Box>

                {/* Rewards discount */}
                {!!orderElement?.rewardsDiscount && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Rewards Discount
                    </Typography>
                    <Typography variant="bodybold">
                      - ₹&nbsp;
                      {orderElement?.rewardsDiscount}
                    </Typography>
                  </Box>
                )}

                {/* Coupon discount */}
                {!!orderElement?.couponDiscount && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Coupon Discount
                    </Typography>
                    <Typography variant="bodybold">
                      - ₹&nbsp;
                      {orderElement?.couponDiscount}
                    </Typography>
                  </Box>
                )}

                {/* Referral Discount */}
                {!!orderElement?.referralDiscount && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Referral Discount
                    </Typography>
                    <Typography variant="bodybold">
                      - ₹&nbsp;
                      {orderElement?.referralDiscount}
                    </Typography>
                  </Box>
                )}

                {/* item total */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0px",
                    gap: "15px",
                    width: "100%",
                  }}
                >
                  <Typography variant="bodyparagraph">Item Total</Typography>
                  <Typography variant="bodybold">
                    ₹ {orderElement?.itemsTotal.toFixed(2)}
                  </Typography>
                </Box>

                {/* Tax and charges */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0px",
                    gap: "15px",
                    width: "100%",
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
                        <Typography>SGST {orderElement?.sgstValue}</Typography>
                        <Typography>CGST {orderElement?.cgstValue}</Typography>
                      </Box>
                    }
                  >
                    <Typography
                      variant="bodyparagraph"
                      sx={{ color: "#F28705" }}
                      onClick={() => setShowToolTip(!showToolTip)}
                    >
                      GST
                    </Typography>
                  </Tooltip>
                  <Typography variant="bodybold">
                    ₹{" "}
                    {(
                      +orderElement?.cgstValue + +orderElement?.sgstValue
                    ).toFixed(2)}
                  </Typography>
                </Box>

                {/* Delivery Fees */}
                {orderElement?.deliveryFee > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Delivery Fee
                    </Typography>
                    <Typography variant="bodybold">
                      ₹ {orderElement?.deliveryFee.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {/* platform Fees */}
                {orderElement?.platformFee > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Platform Fee
                    </Typography>
                    <Typography variant="bodybold">
                      ₹ {orderElement?.platformFee.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {/* Delivery Discount */}
                {(!!orderElement?.deliveryRebate ||
                  !!orderElement?.deliveryDiscount) > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0px",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      Delivery Discount
                    </Typography>
                    <Typography variant="bodybold">
                      -&nbsp;₹&nbsp;
                      {(
                        orderElement?.deliveryRebate +
                        orderElement?.deliveryDiscount
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {/* Total Amount */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0px",
                    gap: "15px",
                    width: "100%",
                  }}
                >
                  <Typography variant="header4">Total Amount</Typography>
                  <Typography variant="header4">
                    ₹&nbsp;{orderElement?.grandTotal.toFixed(2)}
                  </Typography>
                </Box>

                {!!orderElement?.instructions && (
                  <Typography variant="bodymetatag" sx={{ mt: 1 }}>
                    Instructions: {orderElement?.instructions}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Order status */}
          {(orderElement?.status === "Created" ||
            orderElement?.status === "Confirmed" ||
            orderElement?.status === "Packed" ||
            orderElement?.status === "Dispatched" ||
            orderElement?.status === "Delivered") && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "15px",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography variant="header4">Order Status</Typography>

                {/* order status */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10px 15px",
                    gap: "10px",
                    background:
                      orderElement?.status === "Created"
                        ? "#DDDCEC"
                        : orderElement?.status === "Confirmed"
                        ? "#FDF6EB"
                        : orderElement?.status === "Packed"
                        ? "#DEEFFD"
                        : orderElement?.status === "Dispatched"
                        ? "#E5EFED"
                        : orderElement?.status === "Delivered"
                        ? "#E5EFED"
                        : "#FEECEB",
                    borderRadius: "20px",
                  }}
                >
                  <Typography
                    variant="bodymetatag"
                    sx={{
                      color:
                        orderElement?.status === "Created"
                          ? "#1C1853"
                          : orderElement?.status === "Confirmed"
                          ? "#FF9800"
                          : orderElement?.status === "Packed"
                          ? "#2196F3"
                          : orderElement?.status === "Dispatched"
                          ? "#0B735F"
                          : orderElement?.status === "Delivered"
                          ? "#0B735F"
                          : "#F44336",
                    }}
                  >
                    {orderElement?.status}
                  </Typography>
                  <Box
                    sx={{ width: "16px", height: "16px" }}
                    component={"img"}
                    src={
                      orderElement?.status === "Created"
                        ? "/media/svg/order-created-purple.svg"
                        : orderElement?.status === "Confirmed"
                        ? "/media/svg/order-confirmed-orange.svg"
                        : orderElement?.status === "Packed"
                        ? "/media/svg/order-packed-blue.svg"
                        : orderElement?.status === "Dispatched"
                        ? "/media/svg/order-dispatched-green.svg"
                        : orderElement?.status === "Delivered"
                        ? "/media/svg/tick-circled-green.svg"
                        : "/media/svg/error-exclaim-filled.svg"
                    }
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  // width: "calc(100% - 40px)",
                  width: "100%",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "10px",
                }}
              >
                <ThemeProvider theme={stepperTheme}>
                  <Stepper
                    activeStep={steps.indexOf(orderElement?.status)}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      width: "100%",
                    }}
                  >
                    {steps.map((stp) => (
                      <Step key={stp}>
                        <StepLabel StepIconComponent={ColorlibStepIcon} />
                      </Step>
                    ))}
                  </Stepper>
                </ThemeProvider>

                {orderElement?.status === "Dispatched" &&
                  orderElement?.deliveryType !== "selfPickup" &&
                  orderElement?.dunzoRunner !== undefined && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "16px",
                      }}
                    >
                      <Typography variant="header4">
                        {orderElement?.dunzoPickup > 1
                          ? `Your order is approximately ${orderElement?.dunzoPickup.toFixed(
                              0
                            )} mins away`
                          : "Delivery agent is arriving near your location"}
                      </Typography>
                    </Box>
                  )}
              </Box>
            </Box>
          )}

          {/* Delivery details */}
          {orderElement?.status === "Dispatched" &&
            orderElement?.deliveryType !== "selfPickup" &&
            orderElement?.dunzoRunner !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "15px",
                  width: "100%",
                }}
              >
                <Typography variant="header4">
                  Delivery Agent Details
                </Typography>
                <Box
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "20px",
                    gap: "5px",
                    background: "#FCFCFC",
                    border: "1px solid #DFE2E6",
                    borderRadius: "10px",
                    width: "100%",
                  }}
                >
                  <Typography variant="bodybold">
                    {orderElement?.dunzoRunner?.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{
                        width: "20px",
                        height: "20px",
                      }}
                      src="/media/svg/phone-circled-filled.svg"
                    />
                    <Typography variant="bodyparagraph">
                      +91{" "}
                      <a
                        href={"tel:" + orderElement?.dunzoRunner?.phone_number}
                      >
                        {orderElement?.dunzoRunner?.phone_number}
                      </a>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
        </Box>
      </Drawer>

      {/* Drawer for rating */}
      <Drawer
        anchor="right"
        open={isRatingDrawerOpen}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: {
            width: "50%",
            minWidth: "325px",
            maxWidth: "600px",
            background: "#FCFCFC",
          },
        }}
      >
        {/* drawer header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px",
              alignSelf: "flex-start",
              width: "100%",
            }}
          >
            {/* header text */}
            <Typography variant="header4">Rate the Order</Typography>
            {/* Cancel icon */}
            <Box
              onClick={() => {
                setIsRatingDrawerOpen(false);
                setReviewFoodDelivery("");
                setRatingFoodDelivery(0);
                setRatingFood(0);
              }}
              component="img"
              sx={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
                mt: "5px",
                mr: "5px",
              }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>
          {/* Line */}
          <Box
            sx={{
              // width: "519px",
              height: "0px",
              border: "1px solid #2A3037",
              alignSelf: "stretch",
            }}
          />
        </Box>

        {/* body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
            px: "16px",
            pb: "25px",
            width: "calc(100% - 32px)",
          }}
        >
          {/* Order Details */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "15px",
              width: "100%",
            }}
          >
            {/* chef info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "11px",
                width: "100%",
              }}
            >
              {/* chef profile image */}
              <Box
                component={"img"}
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "15px",
                  filter: "drop-shadow(0px 5px 25px rgba(42, 48, 55, 0.12))",
                }}
                src={ratingOrderElement?.chefProfileImage}
              />
              {/* chef name, order id and chef location */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "calc(100% - 60px - 11px)",
                }}
              >
                {/* chef name */}
                <Typography
                  variant="header4"
                  sx={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ratingOrderElement?.chefName ??
                    `${ratingOrderElement?.cloudKitchenName} - ${ratingOrderElement?.outletName}`}
                </Typography>

                {/* order id and delivery type */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {/* order id */}
                  <Typography variant="bodyparagraph">
                    #{orderNoFormat(ratingOrderElement?.id.toString())}
                  </Typography>
                  {/* delivery type */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: "10px 15px",
                      gap: "10px",
                      background:
                        ratingOrderElement?.deliveryType === "selfPickup"
                          ? "#DDDCEC"
                          : "#FDF6EB",
                      borderRadius: "20px",
                    }}
                  >
                    <Typography
                      variant="bodymetatag"
                      sx={{
                        maxWidth: "175px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color:
                          ratingOrderElement?.deliveryType === "selfPickup"
                            ? "#1C1853"
                            : "#FF9800",
                      }}
                    >
                      {ratingOrderElement?.deliveryType === "selfPickup"
                        ? "Self Pickup"
                        : ratingOrderElement?.userAddressTag}
                    </Typography>
                    <Box
                      sx={{ width: "16px", height: "16px" }}
                      component={"img"}
                      src={
                        ratingOrderElement?.deliveryType === "selfPickup"
                          ? "/media/svg/self-pickup.svg"
                          : ratingOrderElement?.userAddressTag === "Home"
                          ? "/media/svg/home-filled-orange.svg"
                          : ratingOrderElement?.userAddressTag === "Work"
                          ? "/media/svg/work-filled-orange.svg"
                          : "/media/svg/marker-filled-orange.svg"
                      }
                    />
                  </Box>
                </Box>

                {/* chef location */}
                <Typography
                  variant="bodyparagraph"
                  sx={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ratingOrderElement?.locality}, {ratingOrderElement?.city}
                </Typography>
              </Box>
            </Box>

            {/* Order type */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px 9px 0px 0px",
                  gap: "8px",
                  background: "#FFF8F5",
                  borderRadius: "28px",
                  border: "1px solid #FA8820",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "10px",
                    gap: "10px",
                    background:
                      "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                    borderRadius: "36px",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "16px" }}
                    src={
                      ratingOrderElement?.orderType === "instant"
                        ? "/media/svg/instant-order-white.svg"
                        : "/media/svg/preorder-white.svg"
                    }
                  />
                </Box>
                <Typography
                  variant="bodymetatag"
                  sx={{
                    background:
                      "linear-gradient(270.56deg, #FA8820 19.08%, #FF784D 99.28%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                  }}
                >
                  {ratingOrderElement?.orderType === "instant"
                    ? "Instant Order"
                    : "Preorder"}
                </Typography>
              </Box>

              {/* preorder date and slot */}
              {ratingOrderElement?.orderType === "preorder" && (
                <Typography variant="bodyregular">
                  {format(
                    new Date(ratingOrderElement?.preOrderDate),
                    "LLL dd, EEE"
                  )}
                  {" ("}
                  {
                    // preorderSlots.filter(
                    //   (sl) => sl.id === ratingOrderElement?.preorderSlotId
                    // )[0]?.slot
                    ratingOrderElement?.deliverySlot
                  }
                  {")"}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Accordion for rating food */}
          {ratingOrderElement?.foodItems.map((el, idx) => (
            <Box
              key={idx}
              sx={{
                boxSizing: "border-box",
                display: "flex",
                alignItems: "flex-start",
                padding: "8px",
                background: "#FFFFFF",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: "100%",
              }}
            >
              <Accordion sx={{ width: "100%", boxShadow: "none" }}>
                <AccordionSummary
                  sx={{
                    cursor: "unset !important",
                    justifyContent: "flex-start",
                  }}
                  expandIcon={
                    el.rating > 0 ? (
                      <ExpandMoreIcon
                        sx={{
                          border: "1px solid",
                          borderRadius: "50%",
                          pointerEvents: "auto",
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    ) : (
                      <></>
                    )
                  }
                  aria-controls={"rating-food" + idx}
                  id={"rating-food" + idx}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: { xs: "0px", md: "16px" },
                    }}
                  >
                    {/* food item image. hidden for xs and sm. */}
                    <Box
                      sx={{
                        width: { xs: "0px", md: "88px" },
                        height: { xs: "0px", md: "72px" },
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        sx={{
                          position: "absolute",
                          width: { xs: "0px", md: "64px" },
                          height: { xs: "0px", md: "64px" },
                          borderRadius: "50%",
                          objectFit: "cover",
                          // top: "0px",
                        }}
                        src={el.foodItemImage}
                      />
                      <Box
                        component="img"
                        sx={{
                          position: "absolute",
                          width: { xs: "0px", md: "64px" },
                          height: { xs: "0px", md: "64px" },
                          borderRadius: "50%",
                          objectFit: "cover",
                          top: "8px",
                          opacity: "0.3",
                          filter: `blur(8.5px)`,
                        }}
                        src={el.foodItemImage}
                      />
                    </Box>

                    {/* Food details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "10px",
                        width: "100%",
                      }}
                    >
                      {/* Veg non veg icon and food name */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {/* veg icon */}
                        <Box
                          component="img"
                          sx={{
                            width: "19px",
                            height: "19px",
                          }}
                          src={
                            el.vegNonVeg === "Veg"
                              ? "/media/svg/veg.svg"
                              : "/media/svg/non-veg.svg"
                          }
                        />

                        <Typography variant="bodybold">
                          {el.foodItemName}
                        </Typography>
                      </Box>
                      {/* Ratings star for food */}
                      <Rating
                        customIcons={[
                          {
                            icon:
                              el.rating === 1 ? (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-1star-active.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ) : (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-1star-inactive.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ),
                          },
                          {
                            icon:
                              el.rating === 2 ? (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-2star-active.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ) : (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-2star-inactive.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ),
                          },
                          {
                            icon:
                              el.rating === 3 ? (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-3star-active.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ) : (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-3star-inactive.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ),
                          },
                          {
                            icon:
                              el.rating === 4 ? (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-4star-active.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ) : (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-4star-inactive.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ),
                          },
                          {
                            icon:
                              el.rating === 5 ? (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-5star-active.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ) : (
                                <Box
                                  component={"img"}
                                  src="/media/svg/rating-5star-inactive.svg"
                                  sx={{ width: 37, m: 0.5, height: 37 }}
                                />
                              ),
                          },
                        ]}
                        onClick={(rate) => {
                          setRatingFood(rate);
                          let copy = JSON.parse(
                            JSON.stringify(ratingOrderElement)
                          );
                          copy.foodItems[idx].rating = rate;
                          copy.foodItems[idx].ratingFor = "food";
                          setRatingOrderElement(copy);
                        }}
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                {/* text area for food review */}
                {el.rating > 0 && (
                  <AccordionDetails>
                    <TextField
                      multiline
                      value={el.reviewText}
                      onChange={(ev) => {
                        let copy = JSON.parse(
                          JSON.stringify(ratingOrderElement)
                        );
                        copy.foodItems[idx].reviewText =
                          ev.target.value ?? null;
                        setRatingOrderElement(copy);
                      }}
                      inputProps={{ maxLength: 300 }}
                      rows={4}
                      placeholder="Write a review"
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
                  </AccordionDetails>
                )}
              </Accordion>
            </Box>
          ))}

          {/* Rate Delivery Experience */}
          {ratingOrderElement?.deliveryType !== "selfPickup" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "5px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="bodyparagraph">
                  Rate&nbsp;Delivery&nbsp;Experience
                </Typography>
                {/* Ratings star for Deliver */}
                <Rating
                  customIcons={[
                    {
                      icon:
                        ratingFoodDelivery === 1 ? (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-1star-active.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ) : (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-1star-inactive.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ),
                    },
                    {
                      icon:
                        ratingFoodDelivery === 2 ? (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-2star-active.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ) : (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-2star-inactive.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ),
                    },
                    {
                      icon:
                        ratingFoodDelivery === 3 ? (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-3star-active.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ) : (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-3star-inactive.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ),
                    },
                    {
                      icon:
                        ratingFoodDelivery === 4 ? (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-4star-active.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ) : (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-4star-inactive.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ),
                    },
                    {
                      icon:
                        ratingFoodDelivery === 5 ? (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-5star-active.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ) : (
                          <Box
                            component={"img"}
                            src="/media/svg/rating-5star-inactive.svg"
                            sx={{ width: 37, m: 0.5, height: 37 }}
                          />
                        ),
                    },
                  ]}
                  onClick={(rate) => {
                    setRatingFoodDelivery(rate);
                  }}
                />
              </Box>
              {ratingFoodDelivery > 0 && (
                <TextField
                  multiline
                  value={reviewFoodDelivery}
                  onChange={(ev) => {
                    setReviewFoodDelivery(ev.target.value);
                    // setRejectTextError(false);
                    // setRejectTextHelper("");
                  }}
                  inputProps={{ maxLength: 300 }}
                  // error={rejectTextError}
                  // helperText={rejectTextHelper}
                  rows={4}
                  placeholder="Write a review"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "10px",
                    flex: "none",
                    order: "0",
                    alignSelf: "stretch",
                    flexGrow: "0",
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
              )}
              {/* text area for Delivery */}
            </Box>
          )}

          {/* Button for submitting review */}
          <Button
            variant="contained"
            onClick={() => addOrderRating()}
            sx={{ width: "100%", my: 1 }}
            disabled={ratingFood === 0 && ratingFoodDelivery === 0}
          >
            Submit Review
          </Button>
        </Box>
      </Drawer>

      {/* Cancel order confirmation modal*/}
      <Modal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      >
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
            sx={{ width: { xs: 300, sm: 400, md: 500 }, margin: "auto" }}
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
                Are you sure to cancel this order?
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
                    cancelOrder();
                  }}
                  disabled={isCancelOrderFetching}
                >
                  {isCancelOrderFetching ? (
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                  ) : (
                    <></>
                  )}
                  Yes, Cancel Order
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancelElementId(null);
                  }}
                >
                  No
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default MyOrders;
