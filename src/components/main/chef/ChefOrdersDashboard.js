import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  CircularProgress,
  Grid,
  Modal,
  TextField,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@mui/material";
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import { useCookies } from "react-cookie";
import Header from "../../general-components/ui-components/Header";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { orderNoFormat } from "../../../common/common";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInHours } from "date-fns";

const ChefOrdersDashboard = () => {
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { outletsData, outletsError, logout } = globalState.outletsReducer;
  const { userData } = globalState.userReducer;

  const [orderType, setOrderType] = useState("instant");
  const [ordersByChefInstant, setOrdersByChefInstant] = useState([]);
  const [ordersByChefPreOrder, setOrdersByChefPreOrder] = useState([]);
  const [invokeGetOrders, setInvokeGetOrders] = useState(false);
  const [isOrderByChefFetching, setIsOrderByChefFetching] = useState(false);
  const [isConfirmOrderFetching, setIsConfirmOrderFetching] = useState(false);
  const [isRejectOrderFetching, setIsRejectOrderFetching] = useState(false);
  const [foodRejectModal, setFoodRejectModal] = useState(false);
  const [rejectText, setRejectText] = useState("");
  const [rejectTextError, setRejectTextError] = useState(false);
  const [rejectTextHelper, setRejectTextHelper] = useState("");
  const [rejectElement, setRejectElement] = useState(null);
  const [customerDetailModal, setCustomerDetailModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const [acceptOrReject, setAcceptOrReject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterConfirmDrawer, setFilterConfirmDrawer] = useState(false);
  const [filterPackedDrawer, setFilterPackedDrawer] = useState(false);
  const [planNextDayDrawer, setPlanNextDayDrawer] = useState(false);
  const [preOrderWeek, setPreOrderWeek] = useState(null);

  // For confirmed filters
  const [preorderDayNameNA, setPreorderDayNameNA] = useState(null);
  const [preorderDayName, setPreorderDayName] = useState(null);
  const [slotNA, setSlotNA] = useState(null);
  const [slot, setSlot] = useState(null);
  const [applyFilterStatus, setApplyFilterStatus] = useState(false);

  // For packed filters
  const [preorderDayNameNA2, setPreorderDayNameNA2] = useState(null);
  const [preorderDayName2, setPreorderDayName2] = useState(null);
  const [slotNA2, setSlotNA2] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [applyFilterStatus2, setApplyFilterStatus2] = useState(false);

  // Order count
  const [instantCount, setInstantCount] = useState(null);
  const [preorderCount, setPreorderCount] = useState(null);

  // multiple select for plan next day
  const [selectDay, setSelectDay] = useState(null);
  const [selectSlot, setSelectSlot] = useState(null);

  const [invokeDunzoLiveLocInstant, setInvokeDunzoLiveLocInstant] =
    useState(false);
  const [invokeDunzoLiveLocPreOrder, setInvokeDunzoLiveLocPreOrder] =
    useState(false);

  const [isLoadingDunzoInstant, setIsLoadingDunzoInstant] = useState(false);
  const [isLoadingDunzoPreOrder, setIsLoadingDunzoPreOrder] = useState(false);

  const [isCloudKitchenOwner, setIsCloudKitchenOwner] = useState(false);

  const [dunzoAgentData, setDunzoAgentData] = useState([]);

  // deliverd button handling states
  const [isDeliveryFetching, setIsDeliveryFetching] = useState(false);
  const [deliveryId, setDeliveryId] = useState(null);

  // packed button handling states
  const [isPackedFetching, setIsPackedFetching] = useState(false);
  const [packedId, setPackedId] = useState(null);

  // if cloudkitchenowner set this variable to avoid react warning
  // [React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked]

  let outletCookieData;

  const deliverySlots = [
    "12am - 1am",
    "1am - 2am",
    "2am - 3am",
    "3am - 4am",
    "4am - 5am",
    "5am - 6am",
    "6am - 7am",
    "7am - 8am",
    "8am - 9am",
    "9am - 10am",
    "10am - 11am",
    "11am - 12pm",
    "12pm - 1pm",
    "1pm - 2pm",
    "2pm - 3pm",
    "3pm - 4pm",
    "4pm - 5pm",
    "5pm - 6pm",
    "6pm - 7pm",
    "7pm - 8pm",
    "8pm - 9pm",
    "9pm - 10pm",
    "10pm - 11pm",
    "11pm - 12am",
  ];

  // converting to 24 hours format
  const foodPackedHoursCheck = (el) => {
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
    return differenceInHours(
      new Date(yearCookie, monthCookie - 1, dateCookie, hours),
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        new Date().getHours()
      )
    );
  };

  // dunzodetails
  const dunzoAgentDetailsFunc = (taskId) => {
    let filterData = dunzoAgentData?.filter((el) => el.dunzoTaskId === taskId);
    return (
      <Typography variant="bodyparagraph">
        Delivery agent {filterData[0].runner.name},{" ("}
        <Link
          href={"tel:" + filterData[0].runner.phone_number}
          sx={{ textDecoration: "none" }}
        >
          {filterData[0].runner.phone_number}
        </Link>{" "}
        <Box
          component={"img"}
          sx={{ height: "12px", width: "12px", cursor: "pointer" }}
          src="/media/svg/copy-to-clipboard.svg"
          onClick={() => {
            navigator.clipboard.writeText(rejectElement?.userMobileNumber);
            toast("Copied to clipboard", {
              position: toast.POSITION.BOTTOM_CENTER,
              autoClose: 1000,
              hideProgressBar: true,
            });
          }}
        />
        {") "}
        will arrive in{" "}
        <Typography variant="bodybold">
          {filterData[0].etaPickup} mins
        </Typography>
      </Typography>
    );
  };

  // food plan drawer function for calc quantity
  const foodDayPlan = () => {
    const group = {};
    let filterFood;

    filterFood = ordersByChefPreOrder?.Confirmed?.filter(
      (el) =>
        el.preOrderDate === selectDay?.split(",")[3] &&
        el.deliverySlot === selectSlot
    )
      .map((el) => el.foodItems)
      .flat(1);

    filterFood?.forEach((ele) => {
      const dup = (group[ele.foodItemId] = group[ele.foodItemId] || {
        ...ele,
        quantity: 0,
      });
      dup.quantity += ele.quantity;
    });

    return (
      <Box>
        {Object.values(group).length > 0 ? (
          <>
            {Object.values(group)?.map((ele, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  // alignItems: "flex-start",
                  // padding: "10px",
                  // gap: "10px",
                  // width: "148px",
                  // height: "24px",
                  flex: "none",
                  order: "0",
                  flexGrow: "0",
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="bodyparagraph">
                    {ele.quantity} X {ele.foodItemName}
                  </Typography>
                </Box>
              </Box>
            ))}
            ;
          </>
        ) : (
          <Typography varaint="bodyparagraph" sx={{ px: 2 }}>
            No items available
          </Typography>
        )}
      </Box>
    );
  };

  // grouped food by preorderDate & preorderSlotName only Confirmed
  const groupedFoodConfirmed = () => {
    let groupedOrders = [];
    let indx;

    ordersByChefPreOrder?.Confirmed?.forEach((el) => {
      indx = groupedOrders.findIndex(
        (ele) =>
          el.preOrderDate === ele.preOrderDate &&
          el.deliverySlot === ele.deliverySlot
      );

      if (indx >= 0) {
        let group = groupedOrders[indx].orders;
        group.push(el);
        groupedOrders[indx].orders = group;
      } else {
        let orders = [];
        orders.push(el);
        groupedOrders.push({
          preOrderDate: el.preOrderDate,
          deliverySlot: el.deliverySlot,
          preorderSlotRankOrder: el.preorderSlotRankOrder,
          orders: orders,
        });
      }
    });
    return groupedOrders
      .sort((a, b) => a.preorderSlotRankOrder - b.preorderSlotRankOrder)
      .sort((a, b) => new Date(a.preOrderDate) - new Date(b.preOrderDate));
  };

  // grouped food by preorderDate & preorderSlotName only Packed
  const groupedFoodPacked = () => {
    let groupedOrders = [];
    let indx;
    ordersByChefPreOrder?.Packed?.forEach((el) => {
      // change to find index
      indx = groupedOrders.findIndex(
        (ele) =>
          el.preOrderDate === ele.preOrderDate &&
          el.deliverySlot === ele.deliverySlot
      );

      if (indx >= 0) {
        let group = groupedOrders[indx].orders;
        group.push(el);
        groupedOrders[indx].orders = group;
      } else {
        let orders = [];
        orders.push(el);
        groupedOrders.push({
          preOrderDate: el.preOrderDate,
          deliverySlot: el.deliverySlot,
          preorderSlotRankOrder: el.preorderSlotRankOrder,
          orders: orders,
        });
      }
    });
    return groupedOrders
      .sort((a, b) => a.preorderSlotRankOrder - b.preorderSlotRankOrder)
      .sort((a, b) => new Date(a.preOrderDate) - new Date(b.preOrderDate));
  };

  // confirm order
  const confirmOrder = async (id) => {
    setIsConfirmOrderFetching(true);
    let params = {
      id: rejectElement?.id,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.confirmOrder,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Order accepted successfully");
        setFoodRejectModal(false);
        setAcceptOrReject(null);
        setInvokeGetOrders(true);
        setIsConfirmOrderFetching(false);
      } else {
        alert(
          "Something went wrong while confirming order. Please try again later!"
        );
        setIsConfirmOrderFetching(false);
        setFoodRejectModal(false);
      }
    } else {
      alert(
        "Something went wrong while confirming order. Please try again later!!"
      );
      setIsConfirmOrderFetching(false);
      setFoodRejectModal(false);
    }
  };

  // reject order
  const rejectOrder = async () => {
    if (rejectText !== "") {
      setIsRejectOrderFetching(true);
      let params = {
        id: rejectElement?.id,

        chefCancelledRemarks: rejectText,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.rejectOrder,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setFoodRejectModal(false);
          toast.success("Order rejected successfully");
          setInvokeGetOrders(true);
          setRejectText("");
          setRejectElement(null);
          setAcceptOrReject(null);
          setIsRejectOrderFetching(false);
        } else {
          alert(
            "Something went wrong while rejecting order. Please try again later!"
          );
          setIsRejectOrderFetching(false);
        }
      } else {
        alert(
          "Something went wrong while rejecting order. Please try again later!!"
        );
        setIsRejectOrderFetching(false);
      }
    } else {
      setRejectTextError(true);
      setRejectTextHelper("Please enter the rejection remarks");
      setIsRejectOrderFetching(false);
    }
  };

  // Mark as packed
  const markAsPacked = async (id) => {
    setPackedId(id);
    setIsPackedFetching(true);
    let params = {
      id,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.markAsPacked,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Order marked as Packed successfully");
        setInvokeGetOrders(true);
        setPackedId(null);
        setIsPackedFetching(false);
      } else {
        alert(
          "Something went wrong while marking order as Packed. Please try again later!"
        );
        setIsPackedFetching(false);
      }
    } else {
      alert(
        "Something went wrong while marking order as Packed. Please try again later!!"
      );
      setIsPackedFetching(false);
    }
  };

  // Order Delivered
  const markAsDelivered = async (id) => {
    setDeliveryId(id);
    setIsDeliveryFetching(true);
    let params = {
      id,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.markAsDelivered,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Order marked as Delivered successfully");
        setInvokeGetOrders(true);
        setDeliveryId(null);
        setIsDeliveryFetching(false);
      } else {
        alert(
          "Something went wrong while marking order as Delivered. Please try again later!"
        );
        setIsDeliveryFetching(false);
      }
    } else {
      alert(
        "Something went wrong while marking order as Delivered. Please try again later!!"
      );
      setIsDeliveryFetching(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Orders Dashboard";
  }, []);

  // get outlets if roles is cloud kitchen owner and trigger get order by chef
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        let outletCookieData = cookies[config.preferencesCookie]?.outletData;
        if (outletsData?.cloudKitchenOutlets && outletCookieData !== null) {
          setIsCloudKitchenOwner(true);
          setInvokeGetOrders(true);
        }
      } else if (
        userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
        userData?.user.roles.indexOf("Chef Manager") >= 0 ||
        userData?.user.roles.indexOf("Outlet Manager") >= 0
      ) {
        setIsCloudKitchenOwner(false);
        setInvokeGetOrders(true);
      } else {
        navigate("/");
      }
    }
  }, [userData, outletsData, outletCookieData, navigate, cookies]);

  // get outletData Failed;
  useEffect(() => {
    if (outletsError) {
      alert(
        "Something went wrong while fetching outlets. Please try again later!!"
      );
    }
  }, [outletsError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

  // get orders on page load
  useEffect(() => {
    const getOrderByChef = async () => {
      setIsOrderByChefFetching(true);
      let params = {
        orderType: orderType,
        cloudKitchenOutletId:
          cookies[config.preferencesCookie]?.outletData?.id ?? null,
        limit: 999999,
        offset: 0,
        statusList: ["Created", "Confirmed", "Packed"],
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getOrdersByChef,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (orderType === "instant" && response.data.orders.length > 0) {
            setOrdersByChefInstant(
              response.data.orders
                ?.filter((el) => el.orderType === "instant")
                .reduce((group, order) => {
                  const { status } = order;
                  group[status] = group[status] ?? [];
                  group[status].push(order);
                  return group;
                }, {})
            );
            setInvokeDunzoLiveLocInstant(true);
          } else {
            setOrdersByChefInstant([]);
          }
          if (orderType === "preorder" && response.data.orders.length > 0) {
            setOrdersByChefPreOrder(
              response.data.orders
                ?.filter((el) => el.orderType === "preorder")
                .reduce((group, order) => {
                  const { status } = order;
                  group[status] = group[status] ?? [];
                  group[status].push(order);
                  return group;
                }, {})
            );
            setInvokeDunzoLiveLocPreOrder(true);
          } else {
            setOrdersByChefPreOrder([]);
          }

          // get orders count
          let params = {
            cloudKitchenOutletId:
              cookies[config.preferencesCookie]?.outletData?.id,
          };
          let responseCount = await invokeApi(
            config.apiDomains.orderService + apiList.getOrdersCountByChef,
            params,
            cookies
          );
          if (responseCount.status >= 200 && responseCount.status < 300) {
            if (responseCount.data.responseCode === "200") {
              setInstantCount(responseCount.data.instant);
              setPreorderCount(responseCount.data.preorder);
              setIsOrderByChefFetching(false);
              setIsLoading(false);
            } else {
              alert(
                "Something went wrong while fetching orders count. Please try again later!"
              );
            }
          } else {
            alert(
              "Something went wrong while fetching orders count. Please try again later!!"
            );
          }
        } else {
          alert(
            "Something went wrong while fetching orders data. Please try again later!"
          );
          setIsOrderByChefFetching(false);
        }
      } else {
        alert(
          "Something went wrong while fetching orders data. Please try again later!!"
        );
        setIsOrderByChefFetching(false);
      }
    };

    if (invokeGetOrders) {
      setInvokeGetOrders(false);
      getOrderByChef();
    }

    const interval = setInterval(() => {
      if (
        !isOrderByChefFetching &&
        !isLoadingDunzoInstant &&
        !isLoadingDunzoPreOrder
      ) {
        getOrderByChef();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [
    invokeGetOrders,
    cookies,
    orderType,
    isLoadingDunzoInstant,
    isLoadingDunzoPreOrder,
    isOrderByChefFetching,
  ]);

  // setPreOrderWeek: today to next six days, dayname
  useEffect(() => {
    const enumerateDaysBetweenDates = function (startDate, endDate) {
      const now = startDate,
        dates = [];
      while (now <= endDate) {
        dates.push({
          date: `${format(new Date(now), "dd")}`,
          dayName: `${format(new Date(now), "EEEE")},${format(
            new Date(now),
            "MMMM"
          )},${format(new Date(now), "dd")},${format(
            new Date(now),
            "yyyy-MM-dd"
          )}`,
        });
        now.setDate(now.getDate() + 1);
      }
      return dates;
    };

    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 6);

    const results = enumerateDaysBetweenDates(from, to);
    setPreOrderWeek(results);
    setPreorderDayNameNA(results[0]?.dayName);
  }, []);

  // dunzo live location for instant
  useEffect(() => {
    const getDunzoLiveLocation = async () => {
      setIsLoadingDunzoInstant(true);

      let copyDunzoInstant = JSON.parse(JSON.stringify(dunzoAgentData));
      if (ordersByChefInstant?.Confirmed?.length > 0) {
        for (let i = 0; i < ordersByChefInstant?.Confirmed?.length; i++) {
          if (
            ordersByChefInstant?.Confirmed[i].deliveryType === "doorDelivery" &&
            !!ordersByChefInstant?.Confirmed[i].dunzoTaskId
          ) {
            let params = {
              id: ordersByChefInstant?.Confirmed[i].id,
            };
            let response = await invokeApi(
              config.apiDomains.orderService + apiList.getDunzoLiveLocation,
              params,
              cookies
            );
            if (response.status >= 200 && response.status < 300) {
              if (response.data.responseCode === "200") {
                if (!!response.data.eta.pickup && !!response.data.runner) {
                  let findIndex = copyDunzoInstant?.findIndex(
                    (el) =>
                      el.dunzoTaskId ===
                      ordersByChefInstant?.Confirmed[i].dunzoTaskId
                  );
                  if (findIndex >= 0) {
                    copyDunzoInstant[findIndex].etaPickup =
                      response.data.eta.pickup;
                    copyDunzoInstant[findIndex].runner = response.data.runner;
                  } else {
                    copyDunzoInstant.push({
                      dunzoTaskId:
                        ordersByChefInstant?.Confirmed[i].dunzoTaskId,
                      etaPickup: response.data.eta.pickup,
                      runner: response.data.runner,
                    });
                  }
                }
              } else {
                // alert(
                //   "Something went wrong while fetching delivery agent live location. Please try again later!"
                // );
                console.error(
                  "Something went wrong while fetching delivery agent live location. Please try again later!"
                );
              }
            } else {
              //   alert(
              //     "Something went wrong while fetching delivery agent live location. Please try again later!!"
              //   );
              console.error(
                "Something went wrong while fetching delivery agent live location. Please try again later!!"
              );
            }
          }
        }
      }
      // let copyPacked = JSON.parse(JSON.stringify(ordersByChefInstant));

      if (ordersByChefInstant?.Packed?.length > 0) {
        for (let i = 0; i < ordersByChefInstant?.Packed?.length; i++) {
          if (
            ordersByChefInstant?.Packed[i].deliveryType === "doorDelivery" &&
            !!ordersByChefInstant?.Packed[i].dunzoTaskId
          ) {
            let params = {
              id: ordersByChefInstant?.Packed[i].id,
            };
            let response = await invokeApi(
              config.apiDomains.orderService + apiList.getDunzoLiveLocation,
              params,
              cookies
            );
            if (response.status >= 200 && response.status < 300) {
              if (response.data.responseCode === "200") {
                if (!!response.data.eta.pickup && !!response.data.runner) {
                  let findIndex = copyDunzoInstant?.findIndex(
                    (el) =>
                      el.dunzoTaskId ===
                      ordersByChefInstant?.Packed[i].dunzoTaskId
                  );

                  if (findIndex >= 0) {
                    copyDunzoInstant[findIndex].etaPickup =
                      response.data.eta.pickup;
                    copyDunzoInstant[findIndex].runner = response.data.runner;
                  } else {
                    copyDunzoInstant.push({
                      dunzoTaskId: ordersByChefInstant?.Packed[i].dunzoTaskId,
                      etaPickup: response.data.eta.pickup,
                      runner: response.data.runner,
                    });
                  }
                }
              } else {
                // alert(
                //   "Something went wrong while fetching delivery agent live location. Please try again later!"
                // );
                console.error(
                  "Something went wrong while fetching delivery agent live location. Please try again later!"
                );
              }
            } else {
              // alert(
              //   "Something went wrong while fetching delivery agent live location. Please try again later!!"
              // );
              console.error(
                "Something went wrong while fetching delivery agent live location. Please try again later!!"
              );
            }
          }
        }
      }
      setIsLoadingDunzoInstant(false);
      setDunzoAgentData(copyDunzoInstant);
    };

    if (invokeDunzoLiveLocInstant) {
      setInvokeDunzoLiveLocInstant(false);
      getDunzoLiveLocation();
    }
  }, [invokeDunzoLiveLocInstant, cookies, ordersByChefInstant, dunzoAgentData]);

  // dunzo live location for preorder
  useEffect(() => {
    const getDunzoLiveLocation = async () => {
      setIsLoadingDunzoPreOrder(true);

      let copyDunzoPreorder = JSON.parse(JSON.stringify(dunzoAgentData));

      // if (copyConfirmed.Confirmed?.length > 0) {
      for (let i = 0; i < ordersByChefPreOrder?.Confirmed?.length; i++) {
        if (
          ordersByChefPreOrder?.Confirmed[i].deliveryType === "doorDelivery" &&
          !!ordersByChefPreOrder?.Confirmed[i].dunzoTaskId
        ) {
          let params = {
            id: ordersByChefPreOrder?.Confirmed[i].id,
          };
          let response = await invokeApi(
            config.apiDomains.orderService + apiList.getDunzoLiveLocation,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              if (!!response.data.eta.pickup && !!response.data.runner) {
                let findIndex = copyDunzoPreorder?.findIndex(
                  (el) =>
                    el.dunzoTaskId ===
                    ordersByChefPreOrder?.Confirmed[i].dunzoTaskId
                );
                if (findIndex >= 0) {
                  copyDunzoPreorder[findIndex].etaPickup =
                    response.data.eta.pickup;
                  copyDunzoPreorder[findIndex].runner = response.data.runner;
                } else {
                  copyDunzoPreorder.push({
                    dunzoTaskId: ordersByChefPreOrder?.Confirmed[i].dunzoTaskId,
                    etaPickup: response.data.eta.pickup,
                    runner: response.data.runner,
                  });
                }
              }
            } else {
              // alert(
              //   "Something went wrong while fetching delivery agent live location. Please try again later!"
              // );
              console.error(
                "Something went wrong while fetching delivery agent live location. Please try again later!"
              );
            }
          } else {
            //   alert(
            //     "Something went wrong while fetching delivery agent live location. Please try again later!!"
            //   );
            console.error(
              "Something went wrong while fetching delivery agent live location. Please try again later!!"
            );
          }
        }
      }
      // }

      // if (copyPacked.Packed?.length > 0) {
      for (let i = 0; i < ordersByChefPreOrder?.Packed?.length; i++) {
        if (
          ordersByChefPreOrder?.Packed[i].deliveryType === "doorDelivery" &&
          !!ordersByChefPreOrder?.Packed[i].dunzoTaskId
        ) {
          let params = {
            id: ordersByChefPreOrder?.Packed[i].id,
          };
          let response = await invokeApi(
            config.apiDomains.orderService + apiList.getDunzoLiveLocation,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              if (!!response.data.eta.pickup && !!response.data.runner) {
                let findIndex = copyDunzoPreorder?.findIndex(
                  (el) =>
                    el.dunzoTaskId ===
                    ordersByChefPreOrder?.Packed[i].dunzoTaskId
                );
                if (findIndex >= 0) {
                  copyDunzoPreorder[findIndex].etaPickup =
                    response.data.eta.pickup;
                  copyDunzoPreorder[findIndex].runner = response.data.runner;
                } else {
                  copyDunzoPreorder.push({
                    dunzoTaskId: ordersByChefPreOrder?.Packed[i].dunzoTaskId,
                    etaPickup: response.data.eta.pickup,
                    runner: response.data.runner,
                  });
                }
              }
            } else {
              // alert(
              //   "Something went wrong while fetching delivery agent live location. Please try again later!"
              // );
              console.error(
                "Something went wrong while fetching delivery agent live location. Please try again later!"
              );
            }
          } else {
            // alert(
            //   "Something went wrong while fetching delivery agent live location. Please try again later!!"
            // );
            console.error(
              "Something went wrong while fetching delivery agent live location. Please try again later!!"
            );
          }
        }
      }
      // }
      setDunzoAgentData(copyDunzoPreorder);
      setIsLoadingDunzoPreOrder(false);
    };

    if (invokeDunzoLiveLocPreOrder) {
      setInvokeDunzoLiveLocPreOrder(false);
      getDunzoLiveLocation();
    }
  }, [
    invokeDunzoLiveLocPreOrder,
    cookies,
    ordersByChefPreOrder,
    dunzoAgentData,
  ]);

  return (
    <>
      <Header showOutlets={isCloudKitchenOwner} />
      <Box
        sx={{
          my: "24px",
          mx: "27px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Order type tabs and right side buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {/* Order type tabs */}
          <Box
            sx={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              // width: "342px",
              // height: "64px",
              background: "#FCFCFC",
              border: "1px solid #DFE2E6",
              borderRadius: "20px",
            }}
          >
            {/* Instant Order */}
            <Box
              onClick={() => {
                setIsLoading(true);
                setOrderType("instant");
                setInvokeGetOrders(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                // padding: "20px 25px",
                px: "16px",
                gap: "10px",
                // width: "171px",
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
              {/* Instant Orders count */}
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
                  background: orderType === "instant" ? "#FCFCFC" : "#FF774C",
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
                  {ordersByChefInstant?.Created?.length > 0
                    ? ordersByChefInstant?.Created?.length
                    : instantCount ?? 0}
                </Typography>
              </Box>
            </Box>
            {/* Preorder */}
            <Box
              onClick={() => {
                setIsLoading(true);
                setOrderType("preorder");
                setInvokeGetOrders(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                // padding: "20px 25px",
                px: "16px",
                gap: "10px",
                // width: "171px",
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
                  background: orderType === "preorder" ? "#FCFCFC" : "#FF774C",
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
                  {ordersByChefPreOrder?.Created?.length > 0
                    ? ordersByChefPreOrder?.Created?.length
                    : preorderCount ?? 0}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right side div */}
          <Box sx={{ display: "flex", pt: 2, gap: "10px" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/previous-orders")}
            >
              Orders History
            </Button>
            {orderType === "preorder" && (
              <Button
                variant="outlined"
                onClick={() => setPlanNextDayDrawer(true)}
              >
                Order Items Count
              </Button>
            )}
          </Box>
        </Box>

        {/* Instant Orders grid */}
        {orderType === "instant" && (
          <>
            {isLoading ? (
              <Box sx={{ display: "flex", width: "100%", height: "50vh" }}>
                <CircularProgress sx={{ display: "flex", margin: "auto" }} />
              </Box>
            ) : (
              <>
                {Object.values(ordersByChefInstant).length !== 0 ? (
                  <Grid container spacing={2}>
                    {/* Created Grid */}
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <Typography
                          variant="header4"
                          sx={{ textAlign: "left" }}
                        >
                          Orders Awaiting (
                          {ordersByChefInstant?.Created?.length ?? 0})
                        </Typography>
                        {ordersByChefInstant?.Created?.length > 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "0px",
                              gap: "25px",
                            }}
                          >
                            {/* Render */}
                            {ordersByChefInstant?.Created?.sort(
                              (a, b) => a.id - b.id
                            ).map((el, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "20px",
                                  gap: "10px",
                                  background: "#FCFCFC",
                                  border: "1px solid #DFE2E6",
                                  borderRadius: "20px",
                                  width: "100%",
                                }}
                              >
                                {/* order id, created date, and Customer profile */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "20px",
                                    flexWrap: "wrap",
                                    width: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {/* left div */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: "13px",
                                    }}
                                  >
                                    <Typography variant="bodybold">
                                      #{orderNoFormat(el.id.toString())}
                                    </Typography>

                                    {/*created date and  time */}
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
                                          new Date(
                                            el.createdDate.split(" ")[0]
                                          ),
                                          "dd LLL yyyy"
                                        )}{" "}
                                        {format(
                                          parseISO(el.createdDate),
                                          "hh:mm a"
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* right div */}
                                  <Box
                                    onClick={() => {
                                      setCustomerDetailModal(true);
                                      setCustomerDetails(el);
                                    }}
                                    sx={{
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: "10px",
                                      width: "60px",
                                      height: "60px",
                                      background: "#FCFCFC",
                                      border: "1px solid #DFE2E6",
                                      boxShadow:
                                        "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                      borderRadius: "82px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Typography variant="header4">
                                      {el.userName[0]?.toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Box>
                                {/* food and quantity */}
                                {el.foodItems.map((item, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      {item.quantity +
                                        " x " +
                                        item.foodItemName}
                                    </Typography>
                                    <Typography variant="bodyparagraph">
                                      ₹&nbsp;
                                      {item.quantity *
                                        (item.sellingPrice - item.rebate)}
                                    </Typography>
                                  </Box>
                                ))}
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
                                {/* items nos and rate */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    {el.foodItems
                                      .map((el) => el.quantity)
                                      .reduce((sum, val) => sum + val, 0)}{" "}
                                    Items
                                  </Typography>
                                  <Typography variant="bodybold">
                                    ₹&nbsp;
                                    {el.foodItems
                                      .map(
                                        (el) =>
                                          el.quantity *
                                          (el.sellingPrice - el.rebate)
                                      )
                                      .reduce((sum, val) => sum + val, 0)}
                                  </Typography>
                                </Box>
                                {/* Packing Charges */}
                                {el.totalPackingCharges > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Packing Charges
                                    </Typography>
                                    <Typography variant="bodybold">
                                      ₹&nbsp;
                                      {el.totalPackingCharges}
                                    </Typography>
                                  </Box>
                                )}
                                {/* Buttons reject and accept */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0px",
                                    width: "100%",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setFoodRejectModal(true);
                                      setRejectElement(el);
                                      setAcceptOrReject("Reject");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setFoodRejectModal(true);
                                      setRejectElement(el);
                                      setAcceptOrReject("Accept");
                                    }}
                                  >
                                    Accept
                                  </Button>
                                </Box>
                                {/* Referral text */}
                                {/* {el.referrerUserId === userData?.user.id && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src="/media/svg/gift-box.svg"
                                      sx={{ height: "20px", width: "20px" }}
                                    />
                                    <Typography variant="bodybold">
                                      You will earn ₹50 for this order
                                    </Typography>
                                  </Box>
                                )} */}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="bodyparagraph">
                            No orders awaiting
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Confirmed Grid */}
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <Typography
                          variant="header4"
                          sx={{ textAlign: "left" }}
                        >
                          Confirmed orders (
                          {ordersByChefInstant?.Confirmed?.length ?? 0})
                        </Typography>
                        {ordersByChefInstant?.Confirmed?.length > 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "0px",
                              gap: "25px",
                            }}
                          >
                            {/* Render */}
                            {ordersByChefInstant?.Confirmed?.sort(
                              (a, b) => a.id - b.id
                            ).map((el, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "20px",
                                  gap: "10px",
                                  background: "#FCFCFC",
                                  border: "1px solid #DFE2E6",
                                  borderRadius: "20px",
                                  width: "100%",
                                }}
                              >
                                {/* order id, created date, and Customer profile */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "20px",
                                    flexWrap: "wrap",
                                    width: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {/* left div */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: "13px",
                                    }}
                                  >
                                    <Typography variant="bodybold">
                                      #{orderNoFormat(el.id.toString())}
                                    </Typography>

                                    {/*created date and  time */}
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
                                          new Date(
                                            el.createdDate.split(" ")[0]
                                          ),
                                          "dd LLL yyyy"
                                        )}{" "}
                                        {format(
                                          parseISO(el.createdDate),
                                          "hh:mm a"
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Right div */}
                                  <Box
                                    onClick={() => {
                                      setCustomerDetailModal(true);
                                      setCustomerDetails(el);
                                    }}
                                    sx={{
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      padding: "0px",
                                      gap: "10px",
                                      width: "60px",
                                      height: "60px",
                                      background: "#FCFCFC",
                                      border: "1px solid #DFE2E6",
                                      boxShadow:
                                        "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                      borderRadius: "82px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Typography variant="header4">
                                      {el.userName[0].toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* food items */}
                                <Typography variant="bodyparagraph">
                                  {el.foodItems
                                    .map(
                                      (item) =>
                                        item.quantity +
                                        " x " +
                                        item.foodItemName
                                    )
                                    .join(", ")}
                                </Typography>

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

                                {/* items nos and rate */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    {el.foodItems
                                      .map((el) => el.quantity)
                                      .reduce((sum, val) => sum + val, 0)}{" "}
                                    Items
                                  </Typography>
                                  <Typography variant="bodybold">
                                    ₹&nbsp;
                                    {el.foodItems
                                      .map(
                                        (el) =>
                                          el.quantity *
                                          (el.sellingPrice - el.rebate)
                                      )
                                      .reduce((sum, val) => sum + val, 0)}
                                  </Typography>
                                </Box>

                                {/* Packing Charges */}
                                {el.totalPackingCharges > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Packing Charges
                                    </Typography>
                                    <Typography variant="bodybold">
                                      ₹&nbsp;
                                      {el.totalPackingCharges}
                                    </Typography>
                                  </Box>
                                )}

                                {/* delivery mins */}
                                {!!el.dunzoTaskId &&
                                  dunzoAgentData.filter(
                                    (ord) => ord.dunzoTaskId === el.dunzoTaskId
                                  ).length > 0 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: "0px",
                                        width: "100%",
                                      }}
                                    >
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
                                          component={"img"}
                                          sx={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                          src="/media/svg/delivery-motorbike.svg"
                                        />
                                        {dunzoAgentDetailsFunc(el.dunzoTaskId)}
                                      </Box>
                                    </Box>
                                  )}

                                {/* Delivery type and foodpacked button*/}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    flexWrap: "wrap",
                                    gap: "5px",
                                  }}
                                >
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
                                        : "Door Delivery"}
                                    </Typography>
                                    <Box
                                      sx={{ width: "16px", height: "16px" }}
                                      component={"img"}
                                      src={
                                        el.deliveryType === "selfPickup"
                                          ? "/media/svg/self-pickup.svg"
                                          : "/media/svg/delivery-motorbike-orange.svg"
                                      }
                                    />
                                  </Box>
                                  <Box>
                                    {format(new Date(), "yyyy-MM-dd") ===
                                      el.createdDate.split(" ")[0] && (
                                      <Button
                                        variant="outlined"
                                        disabled={
                                          isPackedFetching && packedId === el.id
                                        }
                                        onClick={() => markAsPacked(el.id)}
                                      >
                                        Food Packed
                                        {isPackedFetching &&
                                          packedId === el.id && (
                                            <CircularProgress
                                              size={24}
                                              sx={{ ml: 2 }}
                                            />
                                          )}
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                                {/* {el.referrerUserId === userData?.user.id && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src="/media/svg/gift-box.svg"
                                      sx={{ height: "20px", width: "20px" }}
                                    />
                                    <Typography variant="bodybold">
                                      You will earn ₹50 for this order
                                    </Typography>
                                  </Box>
                                )} */}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="bodyparagraph">
                            No confirmed orders
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Packed Grid */}
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <Typography
                          variant="header4"
                          sx={{ textAlign: "left" }}
                        >
                          Packed Orders (
                          {ordersByChefInstant?.Packed?.length ?? 0})
                        </Typography>
                        {ordersByChefInstant?.Packed?.length > 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "0px",
                              gap: "25px",
                            }}
                          >
                            {/* render */}
                            {ordersByChefInstant?.Packed?.sort(
                              (a, b) => a.id - b.id
                            ).map((el, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "20px",
                                  gap: "10px",
                                  background: "#FCFCFC",
                                  border: "1px solid #DFE2E6",
                                  borderRadius: "20px",
                                  width: "100%",
                                }}
                              >
                                {/* order id, created date, and Customer profile */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "20px",
                                    flexWrap: "wrap",
                                    width: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {/* left div */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: "13px",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography variant="bodybold">
                                        #{orderNoFormat(el.id.toString())}
                                      </Typography>

                                      <Typography variant="bodyregular">
                                        (Delivery Passcode:{" "}
                                        {el.deliveryPasscode})
                                      </Typography>
                                    </Box>

                                    {/*created date and  time */}
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
                                          new Date(
                                            el.createdDate.split(" ")[0]
                                          ),
                                          "dd LLL yyyy"
                                        )}{" "}
                                        {format(
                                          parseISO(el.createdDate),
                                          "hh:mm a"
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Right div */}
                                  <Box
                                    onClick={() => {
                                      setCustomerDetailModal(true);
                                      setCustomerDetails(el);
                                    }}
                                    sx={{
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      padding: "0px",
                                      gap: "10px",
                                      width: "60px",
                                      height: "60px",
                                      background: "#FCFCFC",
                                      border: "1px solid #DFE2E6",
                                      boxShadow:
                                        "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                      borderRadius: "82px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Typography variant="header4">
                                      {el.userName[0].toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* food items */}
                                <Typography variant="bodyparagraph">
                                  {el.foodItems
                                    .map(
                                      (item) =>
                                        item.quantity +
                                        " x " +
                                        item.foodItemName
                                    )
                                    .join(", ")}
                                </Typography>

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

                                {/* items nos and rate */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    {el.foodItems
                                      .map((el) => el.quantity)
                                      .reduce((sum, val) => sum + val, 0)}{" "}
                                    Items
                                  </Typography>
                                  <Typography variant="bodybold">
                                    ₹
                                    {el.foodItems
                                      .map(
                                        (el) =>
                                          el.quantity *
                                          (el.sellingPrice - el.rebate)
                                      )
                                      .reduce((sum, val) => sum + val, 0)}
                                  </Typography>
                                </Box>

                                {/* Packing Charges */}
                                {el.totalPackingCharges > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Packing Charges
                                    </Typography>
                                    <Typography variant="bodybold">
                                      ₹&nbsp;
                                      {el.totalPackingCharges}
                                    </Typography>
                                  </Box>
                                )}

                                {/* delivery mins */}
                                {!!el.dunzoTaskId &&
                                  dunzoAgentData.filter(
                                    (ord) => ord.dunzoTaskId === el.dunzoTaskId
                                  ).length > 0 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: "0px",
                                        width: "100%",
                                      }}
                                    >
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
                                          component={"img"}
                                          sx={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                          src="/media/svg/delivery-motorbike.svg"
                                        />
                                        {dunzoAgentDetailsFunc(el.dunzoTaskId)}
                                      </Box>
                                    </Box>
                                  )}

                                {/* Delivery type and Delivered button */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    flexWrap: "wrap",
                                    gap: "5px",
                                  }}
                                >
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
                                        : "Door Delivery"}
                                    </Typography>
                                    <Box
                                      sx={{ width: "16px", height: "16px" }}
                                      component={"img"}
                                      src={
                                        el.deliveryType === "selfPickup"
                                          ? "/media/svg/self-pickup.svg"
                                          : "/media/svg/delivery-motorbike-orange.svg"
                                      }
                                    />
                                  </Box>
                                  <Box>
                                    {el.deliveryType === "selfPickup" && (
                                      <Button
                                        variant="outlined"
                                        disabled={
                                          isDeliveryFetching &&
                                          deliveryId === el.id
                                        }
                                        onClick={() => markAsDelivered(el.id)}
                                      >
                                        Delivered
                                        {isDeliveryFetching &&
                                        deliveryId === el.id ? (
                                          <CircularProgress
                                            size={24}
                                            sx={{ ml: 2 }}
                                          />
                                        ) : (
                                          <></>
                                        )}
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                                {/* {el.referrerUserId === userData?.user.id && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src="/media/svg/gift-box.svg"
                                      sx={{ height: "20px", width: "20px" }}
                                    />
                                    <Typography variant="bodybold">
                                      You will earn ₹50 for this order
                                    </Typography>
                                  </Box>
                                )} */}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="bodyparagraph">
                            No packed orders
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography sx={{ mt: 2 }} variant="bodyparagraph">
                    No instant orders available
                  </Typography>
                )}
              </>
            )}
          </>
        )}

        {/* Preorders grid */}
        {orderType === "preorder" && (
          <>
            {isLoading ? (
              <Box sx={{ display: "flex", width: "100%", height: "50vh" }}>
                <CircularProgress sx={{ display: "flex", margin: "auto" }} />
              </Box>
            ) : (
              <>
                {Object.values(ordersByChefPreOrder).length !== 0 ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <Typography
                          variant="header4"
                          sx={{ textAlign: "left" }}
                        >
                          Orders Awaiting (
                          {ordersByChefPreOrder?.Created?.length ?? 0})
                        </Typography>
                        {ordersByChefPreOrder?.Created?.length > 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "0px",
                              gap: "25px",
                            }}
                          >
                            {/* Render */}
                            {ordersByChefPreOrder?.Created?.sort(
                              (a, b) => a.id - b.id
                            ).map((el, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "20px",
                                  gap: "10px",
                                  background: "#FCFCFC",
                                  border: "1px solid #DFE2E6",
                                  borderRadius: "20px",
                                  width: "100%",
                                }}
                              >
                                {/* order id, created date, and Customer profile */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "20px",
                                    flexWrap: "wrap",
                                    width: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {/* left div */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: "13px",
                                    }}
                                  >
                                    <Typography variant="bodybold">
                                      #{orderNoFormat(el.id.toString())}
                                    </Typography>

                                    {/*created date and  time */}
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
                                          new Date(
                                            el.createdDate.split(" ")[0]
                                          ),
                                          "dd LLL yyyy"
                                        )}{" "}
                                        {format(
                                          parseISO(el.createdDate),
                                          "hh:mm a"
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {/* right div */}
                                  <Box
                                    onClick={() => {
                                      setCustomerDetailModal(true);
                                      setCustomerDetails(el);
                                    }}
                                    sx={{
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      padding: "0px",
                                      gap: "10px",
                                      width: "60px",
                                      height: "60px",
                                      background: "#FCFCFC",
                                      border: "1px solid #DFE2E6",
                                      boxShadow:
                                        "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                      borderRadius: "82px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Typography variant="header4">
                                      {el?.userName[0]?.toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* food and quantity */}
                                {el.foodItems.map((item, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      {item.quantity +
                                        " x " +
                                        item.foodItemName}
                                    </Typography>
                                    <Typography variant="bodyparagraph">
                                      ₹&nbsp;
                                      {item.quantity *
                                        (item.sellingPrice - item.rebate)}
                                    </Typography>
                                  </Box>
                                ))}

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

                                {/* items nos and rate */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Typography variant="bodyparagraph">
                                    {el.foodItems
                                      .map((el) => el.quantity)
                                      .reduce((sum, val) => sum + val, 0)}{" "}
                                    Items
                                  </Typography>
                                  <Typography variant="bodybold">
                                    ₹&nbsp;
                                    {el.foodItems
                                      .map(
                                        (el) =>
                                          el.quantity *
                                          (el.sellingPrice - el.rebate)
                                      )
                                      .reduce((sum, val) => sum + val, 0)}
                                  </Typography>
                                </Box>

                                {/* Packing Charges */}
                                {el.totalPackingCharges > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "100%",
                                    }}
                                  >
                                    <Typography variant="bodyparagraph">
                                      Packing Charges
                                    </Typography>
                                    <Typography variant="bodybold">
                                      ₹&nbsp;
                                      {el.totalPackingCharges}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Order type */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "12px",
                                    width: "100%",
                                    // justifyContent: "space-between",
                                    flexWrap: "wrap",
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
                                        src="/media/svg/preorder-white.svg"
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
                                      Preorder
                                    </Typography>
                                  </Box>
                                  {/* preorder date and slot */}
                                  <Typography variant="bodyregular">
                                    {format(
                                      new Date(el.preOrderDate),
                                      "EEE dd MMM"
                                    )}
                                    , {el.deliverySlot}
                                  </Typography>
                                </Box>

                                {/* Buttons reject and accept */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0px",
                                    width: "100%",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setFoodRejectModal(true);
                                      setRejectElement(el);
                                      setAcceptOrReject("Reject");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setFoodRejectModal(true);
                                      setRejectElement(el);
                                      setAcceptOrReject("Accept");
                                    }}
                                  >
                                    Accept
                                  </Button>
                                </Box>
                                {/* {el.referrerUserId === userData?.user.id && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src="/media/svg/gift-box.svg"
                                      sx={{ height: "20px", width: "20px" }}
                                    />
                                    <Typography variant="bodybold">
                                      You will earn ₹50 for this order
                                    </Typography>
                                  </Box>
                                )} */}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="bodyparagraph">
                            No awaiting orders
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    {/* Preorder confirmed filter status */}
                    {applyFilterStatus ? (
                      <>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="header4">
                              Confirmed orders (
                              {
                                ordersByChefPreOrder?.Confirmed.filter(
                                  (el) =>
                                    el.preOrderDate ===
                                      preorderDayName?.split(",")[3] &&
                                    el.deliverySlot === slot
                                ).length
                              }
                              )
                            </Typography>
                            <Button
                              onClick={() => setFilterConfirmDrawer(true)}
                              variant="text"
                              endIcon={
                                <Box
                                  component={"img"}
                                  src="/media/svg/filter-orange.svg"
                                  sx={{ width: "20px", height: "20px" }}
                                />
                              }
                            >
                              Filter
                            </Button>
                          </Box>

                          {ordersByChefPreOrder?.Confirmed.filter(
                            (el) =>
                              el.preOrderDate ===
                                preorderDayName?.split(",")[3] &&
                              el.deliverySlot === slot
                          ).length > 0 ? (
                            <>
                              {/* date and day */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="bodybold">
                                  {format(
                                    new Date(preorderDayName?.split(",")[3]),
                                    "MMMM dd, yyyy"
                                  )}{" "}
                                  {slot}
                                </Typography>
                              </Box>
                              {/* line */}
                              <Box
                                sx={{
                                  height: "0px",
                                  border: "1px dashed #DFE2E6",
                                  flex: "none",
                                  order: "1",
                                  flexGrow: "0",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  padding: "0px",
                                  gap: "20px",
                                  // width: "436.33px",
                                  // height: "999px",
                                  flex: "none",
                                  order: "1",
                                  alignSelf: "stretch",
                                  flexGrow: "0",
                                  mt: 2,
                                }}
                              >
                                {ordersByChefPreOrder?.Confirmed.filter(
                                  (el) =>
                                    el.preOrderDate ===
                                      preorderDayName?.split(",")[3] &&
                                    el.deliverySlot === slot
                                )
                                  .sort((a, b) => a.id - b.id)
                                  .map((ele, index) => (
                                    <Box
                                      key={index}
                                      sx={{
                                        boxSizing: "border-box",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        padding: "20px",
                                        gap: "10px",
                                        background: "#FCFCFC",
                                        border: "1px solid #DFE2E6",
                                        borderRadius: "20px",
                                        width: "100%",
                                      }}
                                    >
                                      {/* order id, created date, and Customer profile */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "20px",
                                          flexWrap: "wrap",
                                          width: "100%",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        {/* left div */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            gap: "13px",
                                          }}
                                        >
                                          <Typography variant="bodybold">
                                            #{orderNoFormat(ele.id.toString())}
                                          </Typography>

                                          {/*created date and  time */}
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
                                                new Date(
                                                  ele.createdDate.split(" ")[0]
                                                ),
                                                "dd LLL yyyy"
                                              )}{" "}
                                              {format(
                                                parseISO(ele.createdDate),
                                                "hh:mm a"
                                              )}
                                            </Typography>
                                          </Box>
                                        </Box>

                                        {/* Right div */}
                                        <Box
                                          onClick={() => {
                                            setCustomerDetailModal(true);
                                            setCustomerDetails(ele);
                                          }}
                                          sx={{
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "10px",
                                            width: "60px",
                                            height: "60px",
                                            background: "#FCFCFC",
                                            border: "1px solid #DFE2E6",
                                            boxShadow:
                                              "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                            borderRadius: "82px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <Typography variant="header4">
                                            {ele.userName[0].toUpperCase()}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      {/* food items */}
                                      <Typography variant="bodyparagraph">
                                        {ele.foodItems
                                          .map(
                                            (item) =>
                                              item.quantity +
                                              " x " +
                                              item.foodItemName
                                          )
                                          .join(", ")}
                                      </Typography>

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

                                      {/* items nos and rate */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          width: "100%",
                                        }}
                                      >
                                        <Typography variant="bodyparagraph">
                                          {ele.foodItems
                                            .map((el) => el.quantity)
                                            .reduce(
                                              (sum, val) => sum + val,
                                              0
                                            )}{" "}
                                          Items
                                        </Typography>
                                        <Typography variant="bodybold">
                                          ₹&nbsp;
                                          {ele.foodItems
                                            .map(
                                              (el) =>
                                                el.quantity *
                                                (el.sellingPrice - el.rebate)
                                            )
                                            .reduce((sum, val) => sum + val, 0)}
                                        </Typography>
                                      </Box>

                                      {/* Packing Charges */}
                                      {ele.totalPackingCharges > 0 && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                          }}
                                        >
                                          <Typography variant="bodyparagraph">
                                            Packing Charges
                                          </Typography>
                                          <Typography variant="bodybold">
                                            ₹&nbsp;
                                            {ele.totalPackingCharges}
                                          </Typography>
                                        </Box>
                                      )}

                                      {/* delivery mins */}
                                      {!!ele.dunzoTaskId &&
                                        dunzoAgentData.filter(
                                          (ord) =>
                                            ord.dunzoTaskId === ele.dunzoTaskId
                                        ).length > 0 && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              alignItems: "center",
                                              padding: "0px",
                                              width: "100%",
                                            }}
                                          >
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
                                                component={"img"}
                                                sx={{
                                                  width: "16px",
                                                  height: "16px",
                                                }}
                                                src="/media/svg/delivery-motorbike.svg"
                                              />
                                              {dunzoAgentDetailsFunc(
                                                ele.dunzoTaskId
                                              )}
                                            </Box>
                                          </Box>
                                        )}

                                      {/* Delivery type and foodpacked button*/}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          width: "100%",
                                          flexWrap: "wrap",
                                          gap: "5px",
                                        }}
                                      >
                                        {/* delivery type */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "10px 15px",
                                            gap: "10px",
                                            background:
                                              ele.deliveryType === "selfPickup"
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
                                                ele.deliveryType ===
                                                "selfPickup"
                                                  ? "#1C1853"
                                                  : "#FF9800",
                                            }}
                                          >
                                            {ele.deliveryType === "selfPickup"
                                              ? "Self Pickup"
                                              : "Door Delivery"}
                                          </Typography>
                                          <Box
                                            sx={{
                                              width: "16px",
                                              height: "16px",
                                            }}
                                            component={"img"}
                                            src={
                                              ele.deliveryType === "selfPickup"
                                                ? "/media/svg/self-pickup.svg"
                                                : "/media/svg/delivery-motorbike-orange.svg"
                                            }
                                          />
                                        </Box>
                                        <Box>
                                          {foodPackedHoursCheck(ele) <= 2 && (
                                            <Button
                                              variant="outlined"
                                              disabled={
                                                isPackedFetching &&
                                                packedId === ele.id
                                              }
                                              onClick={() =>
                                                markAsPacked(ele.id)
                                              }
                                            >
                                              Food Packed
                                              {isPackedFetching &&
                                                packedId === ele.id && (
                                                  <CircularProgress
                                                    size={24}
                                                    sx={{ ml: 2 }}
                                                  />
                                                )}
                                            </Button>
                                          )}
                                        </Box>
                                      </Box>
                                      {/* Cancel order */}
                                      <Button
                                        sx={{
                                          width: "100%",
                                          textTransform: "none",
                                        }}
                                        variant="text"
                                        onClick={() => {
                                          setFoodRejectModal(true);
                                          setRejectElement(ele);
                                          setAcceptOrReject("Reject");
                                        }}
                                      >
                                        Cancel Order
                                      </Button>
                                      {/* {ele.referrerUserId ===
                                        userData?.user.id && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "10px",
                                          }}
                                        >
                                          <Box
                                            component={"img"}
                                            src="/media/svg/gift-box.svg"
                                            sx={{
                                              height: "20px",
                                              width: "20px",
                                            }}
                                          />
                                          <Typography variant="bodybold">
                                            You will earn ₹50 for this order
                                          </Typography>
                                        </Box>
                                      )} */}
                                    </Box>
                                  ))}
                              </Box>
                            </>
                          ) : (
                            <Typography variant="bodyparagraph">
                              No orders available for this filter
                            </Typography>
                          )}
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="header4">
                              Confirmed orders (
                              {ordersByChefPreOrder?.Confirmed?.length ?? 0})
                            </Typography>
                            {ordersByChefPreOrder?.Confirmed?.length > 0 && (
                              <Button
                                onClick={() => setFilterConfirmDrawer(true)}
                                variant="text"
                                endIcon={
                                  <Box
                                    component={"img"}
                                    src="/media/svg/filter-orange.svg"
                                    sx={{ width: "20px", height: "20px" }}
                                  />
                                }
                              >
                                Filter
                              </Button>
                            )}
                          </Box>
                          {ordersByChefPreOrder?.Confirmed?.length > 0 ? (
                            <>
                              {groupedFoodConfirmed()?.map((element, indx) => (
                                <Box
                                  key={indx}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    mb: 3,
                                    gap: "20px",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      padding: "0px",
                                      gap: "10px",
                                    }}
                                  >
                                    <Typography variant="bodybold">
                                      {format(
                                        new Date(element.preOrderDate),
                                        "MMMM dd, yyyy"
                                      )}
                                    </Typography>
                                    <Typography variant="bodybold">
                                      {element.deliverySlot}
                                    </Typography>
                                  </Box>

                                  {element.orders
                                    .sort((a, b) => a.id - b.id)
                                    .map((e, index) => (
                                      <Box
                                        key={index}
                                        sx={{
                                          boxSizing: "border-box",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                          padding: "20px",
                                          gap: "10px",
                                          background: "#FCFCFC",
                                          border: "1px solid #DFE2E6",
                                          borderRadius: "20px",
                                          width: "100%",
                                        }}
                                      >
                                        {/* order id, created date, and Customer profile */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "20px",
                                            flexWrap: "wrap",
                                            width: "100%",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          {/* left div */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              alignItems: "flex-start",
                                              gap: "13px",
                                            }}
                                          >
                                            <Typography variant="bodybold">
                                              #{orderNoFormat(e.id.toString())}
                                            </Typography>

                                            {/*created date and  time */}
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
                                                  new Date(
                                                    e.createdDate.split(" ")[0]
                                                  ),
                                                  "dd LLL yyyy"
                                                )}{" "}
                                                {format(
                                                  parseISO(e.createdDate),
                                                  "hh:mm a"
                                                )}
                                              </Typography>
                                            </Box>
                                          </Box>

                                          {/* Right div */}
                                          <Box
                                            onClick={() => {
                                              setCustomerDetailModal(true);
                                              setCustomerDetails(e);
                                            }}
                                            sx={{
                                              boxSizing: "border-box",
                                              display: "flex",
                                              flexDirection: "column",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              padding: "0px",
                                              gap: "10px",
                                              width: "60px",
                                              height: "60px",
                                              background: "#FCFCFC",
                                              border: "1px solid #DFE2E6",
                                              boxShadow:
                                                "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                              borderRadius: "82px",
                                              cursor: "pointer",
                                            }}
                                          >
                                            <Typography variant="header4">
                                              {e.userName[0].toUpperCase()}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        {/* food items */}
                                        <Typography variant="bodyparagraph">
                                          {e.foodItems
                                            .map(
                                              (item) =>
                                                item.quantity +
                                                " x " +
                                                item.foodItemName
                                            )
                                            .join(", ")}
                                        </Typography>
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

                                        {/* price  */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                          }}
                                        >
                                          <Typography variant="bodyparagraph">
                                            {e.foodItems
                                              .map((el) => el.quantity)
                                              .reduce(
                                                (sum, val) => sum + val,
                                                0
                                              )}{" "}
                                            Items
                                          </Typography>
                                          <Typography variant="bodybold">
                                            ₹&nbsp;
                                            {e.foodItems
                                              .map(
                                                (el) =>
                                                  el.quantity *
                                                  (el.sellingPrice - el.rebate)
                                              )
                                              .reduce(
                                                (sum, val) => sum + val,
                                                0
                                              )}
                                          </Typography>
                                        </Box>

                                        {/* Packing Charges */}
                                        {e.totalPackingCharges > 0 && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                              width: "100%",
                                            }}
                                          >
                                            <Typography variant="bodyparagraph">
                                              Packing Charges
                                            </Typography>
                                            <Typography variant="bodybold">
                                              ₹&nbsp;
                                              {e.totalPackingCharges}
                                            </Typography>
                                          </Box>
                                        )}
                                        {/* delivery mins */}
                                        {!!e.dunzoTaskId &&
                                          dunzoAgentData.filter(
                                            (ord) =>
                                              ord.dunzoTaskId === e.dunzoTaskId
                                          ).length > 0 && (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                padding: "0px",
                                                width: "100%",
                                              }}
                                            >
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
                                                  component={"img"}
                                                  sx={{
                                                    width: "16px",
                                                    height: "16px",
                                                  }}
                                                  src="/media/svg/delivery-motorbike.svg"
                                                />
                                                {dunzoAgentDetailsFunc(
                                                  e.dunzoTaskId
                                                )}
                                              </Box>
                                            </Box>
                                          )}

                                        {/* Delivery type and foodpacked button*/}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                            flexWrap: "wrap",
                                            gap: "5px",
                                          }}
                                        >
                                          {/* delivery type */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              alignItems: "center",
                                              padding: "10px 15px",
                                              gap: "10px",
                                              background:
                                                e.deliveryType === "selfPickup"
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
                                                  e.deliveryType ===
                                                  "selfPickup"
                                                    ? "#1C1853"
                                                    : "#FF9800",
                                              }}
                                            >
                                              {e.deliveryType === "selfPickup"
                                                ? "Self Pickup"
                                                : "Door Delivery"}
                                            </Typography>
                                            <Box
                                              sx={{
                                                width: "16px",
                                                height: "16px",
                                              }}
                                              component={"img"}
                                              src={
                                                e.deliveryType === "selfPickup"
                                                  ? "/media/svg/self-pickup.svg"
                                                  : "/media/svg/delivery-motorbike-orange.svg"
                                              }
                                            />
                                          </Box>
                                          <Box>
                                            {/* Food packed button */}
                                            {foodPackedHoursCheck(e) <= 2 && (
                                              <Button
                                                variant="outlined"
                                                disabled={
                                                  isPackedFetching &&
                                                  packedId === e.id
                                                }
                                                onClick={() =>
                                                  markAsPacked(e.id)
                                                }
                                              >
                                                Food Packed
                                                {isPackedFetching &&
                                                  packedId === e.id && (
                                                    <CircularProgress
                                                      size={24}
                                                      sx={{ ml: 2 }}
                                                    />
                                                  )}
                                              </Button>
                                            )}
                                          </Box>
                                        </Box>

                                        {/* Cancel order */}
                                        <Button
                                          sx={{
                                            width: "100%",
                                            textTransform: "none",
                                          }}
                                          variant="text"
                                          onClick={() => {
                                            setFoodRejectModal(true);
                                            setRejectElement(e);
                                            setAcceptOrReject("Reject");
                                          }}
                                        >
                                          Cancel Order
                                        </Button>
                                        {/* {e.referrerUserId ===
                                          userData?.user.id && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              gap: "10px",
                                            }}
                                          >
                                            <Box
                                              component={"img"}
                                              src="/media/svg/gift-box.svg"
                                              sx={{
                                                height: "20px",
                                                width: "20px",
                                              }}
                                            />
                                            <Typography variant="bodybold">
                                              You will earn ₹50 for this order
                                            </Typography>
                                          </Box>
                                        )} */}
                                      </Box>
                                    ))}
                                </Box>
                              ))}
                            </>
                          ) : (
                            <Typography variant="bodyparagraph">
                              No confirmed orders
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}

                    {/* Preorder Packed filter status */}
                    {applyFilterStatus2 ? (
                      <>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="header4">
                              Packed orders (
                              {
                                ordersByChefPreOrder?.Packed.filter(
                                  (el) =>
                                    el.preOrderDate ===
                                      preorderDayName2?.split(",")[3] &&
                                    el.deliverySlot === slot2
                                ).length
                              }
                              )
                            </Typography>
                            <Button
                              onClick={() => setFilterPackedDrawer(true)}
                              variant="text"
                              endIcon={
                                <Box
                                  component={"img"}
                                  src="/media/svg/filter-orange.svg"
                                  sx={{ width: "20px", height: "20px" }}
                                />
                              }
                            >
                              Filter
                            </Button>
                          </Box>

                          {ordersByChefPreOrder?.Packed.filter(
                            (el) =>
                              el.preOrderDate ===
                                preorderDayName2?.split(",")[3] &&
                              el.deliverySlot === slot2
                          ).length > 0 ? (
                            <>
                              {/* date and day */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  padding: "0px",
                                  gap: "10px",
                                  alignSelf: "stretch",
                                }}
                              >
                                <Typography variant="bodybold">
                                  {format(
                                    new Date(preorderDayName?.split(",")[3]),
                                    "MMMM dd, yyyy"
                                  )}
                                  , {slot2}
                                </Typography>
                              </Box>
                              {/* line */}
                              <Box
                                sx={{
                                  height: "0px",
                                  border: "1px dashed #DFE2E6",
                                  flex: "none",
                                  order: "1",
                                  flexGrow: "0",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  padding: "0px",
                                  gap: "20px",
                                  // width: "436.33px",
                                  // height: "999px",
                                  flex: "none",
                                  order: "1",
                                  alignSelf: "stretch",
                                  flexGrow: "0",
                                  mt: 2,
                                }}
                              >
                                {ordersByChefPreOrder?.Packed.filter(
                                  (el) =>
                                    el.preOrderDate ===
                                      preorderDayName2?.split(",")[3] &&
                                    el.deliverySlot === slot2
                                ).map((ele, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      padding: "20px",
                                      gap: "10px",
                                      background: "#FCFCFC",
                                      border: "1px solid #DFE2E6",
                                      borderRadius: "20px",
                                      width: "100%",
                                    }}
                                  >
                                    {/* order id, created date, and Customer profile */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: "0px",
                                        gap: "20px",
                                        flexWrap: "wrap",
                                        width: "100%",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      {/* left div */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                          gap: "13px",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography variant="bodybold">
                                            #{orderNoFormat(ele.id.toString())}
                                          </Typography>

                                          <Typography variant="bodyregular">
                                            (Delivery Passcode:{" "}
                                            {ele.deliveryPasscode})
                                          </Typography>
                                        </Box>

                                        {/*created date and  time */}
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
                                              new Date(
                                                ele.createdDate.split(" ")[0]
                                              ),
                                              "dd LLL yyyy"
                                            )}{" "}
                                            {format(
                                              parseISO(ele.createdDate),
                                              "hh:mm a"
                                            )}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      {/* Right div */}
                                      <Box
                                        onClick={() => {
                                          setCustomerDetailModal(true);
                                          setCustomerDetails(ele);
                                        }}
                                        sx={{
                                          boxSizing: "border-box",
                                          display: "flex",
                                          flexDirection: "column",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          padding: "0px",
                                          gap: "10px",
                                          width: "60px",
                                          height: "60px",
                                          background: "#FCFCFC",
                                          border: "1px solid #DFE2E6",
                                          boxShadow:
                                            "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                          borderRadius: "82px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Typography variant="header4">
                                          {ele.userName[0].toUpperCase()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    {/* food items */}
                                    <Typography variant="bodyparagraph">
                                      {ele.foodItems
                                        .map(
                                          (item) =>
                                            item.quantity +
                                            " x " +
                                            item.foodItemName
                                        )
                                        .join(", ")}
                                    </Typography>

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

                                    {/* items nos and rate */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                      }}
                                    >
                                      <Typography variant="bodyparagraph">
                                        {ele.foodItems
                                          .map((el) => el.quantity)
                                          .reduce(
                                            (sum, val) => sum + val,
                                            0
                                          )}{" "}
                                        Items
                                      </Typography>
                                      <Typography variant="bodybold">
                                        ₹&nbsp;
                                        {ele.foodItems
                                          .map(
                                            (el) =>
                                              el.quantity *
                                              (el.sellingPrice - el.rebate)
                                          )
                                          .reduce((sum, val) => sum + val, 0)}
                                      </Typography>
                                    </Box>

                                    {/* Packing Charges */}
                                    {ele.totalPackingCharges > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          width: "100%",
                                        }}
                                      >
                                        <Typography variant="bodyparagraph">
                                          Packing Charges
                                        </Typography>
                                        <Typography variant="bodybold">
                                          ₹&nbsp;
                                          {ele.totalPackingCharges}
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* delivery mins */}
                                    {!!ele.dunzoTaskId &&
                                      dunzoAgentData.filter(
                                        (ord) =>
                                          ord.dunzoTaskId === ele.dunzoTaskId
                                      ).length > 0 && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            width: "100%",
                                          }}
                                        >
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
                                              component={"img"}
                                              sx={{
                                                width: "16px",
                                                height: "16px",
                                              }}
                                              src="/media/svg/delivery-motorbike.svg"
                                            />
                                            {dunzoAgentDetailsFunc(
                                              ele.dunzoTaskId
                                            )}
                                          </Box>
                                        </Box>
                                      )}
                                    {/* Food packed button */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                      }}
                                    >
                                      {/* delivery type */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          padding: "10px 15px",
                                          gap: "10px",
                                          background:
                                            ele.deliveryType === "selfPickup"
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
                                              ele.deliveryType === "selfPickup"
                                                ? "#1C1853"
                                                : "#FF9800",
                                          }}
                                        >
                                          {ele.deliveryType === "selfPickup"
                                            ? "Self Pickup"
                                            : "Door Delivery"}
                                        </Typography>
                                        <Box
                                          sx={{ width: "16px", height: "16px" }}
                                          component={"img"}
                                          src={
                                            ele.deliveryType === "selfPickup"
                                              ? "/media/svg/self-pickup.svg"
                                              : "/media/svg/delivery-motorbike-orange.svg"
                                          }
                                        />
                                      </Box>

                                      <Box>
                                        {ele.deliveryType === "selfPickup" && (
                                          <Button
                                            variant="outlined"
                                            disabled={
                                              isDeliveryFetching &&
                                              deliveryId === ele.id
                                            }
                                            onClick={() =>
                                              markAsDelivered(ele.id)
                                            }
                                          >
                                            Delivered
                                            {isDeliveryFetching &&
                                            deliveryId === ele.id ? (
                                              <CircularProgress
                                                size={24}
                                                sx={{ ml: 2 }}
                                              />
                                            ) : (
                                              <></>
                                            )}
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                    {/* {ele.referrerUserId ===
                                      userData?.user.id && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                          gap: "10px",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          src="/media/svg/gift-box.svg"
                                          sx={{ height: "20px", width: "20px" }}
                                        />
                                        <Typography variant="bodybold">
                                          You will earn ₹50 for this order
                                        </Typography>
                                      </Box>
                                    )} */}
                                  </Box>
                                ))}
                              </Box>
                            </>
                          ) : (
                            <Typography variant="bodyparagraph">
                              No items available for this filter
                            </Typography>
                          )}
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="header4">
                              Packed orders (
                              {ordersByChefPreOrder?.Packed?.length ?? 0})
                            </Typography>
                            {ordersByChefPreOrder?.Packed?.length > 0 && (
                              <Button
                                disableRipple
                                onClick={() => setFilterPackedDrawer(true)}
                                variant="text"
                                endIcon={
                                  <Box
                                    component={"img"}
                                    src="/media/svg/filter-orange.svg"
                                    sx={{ width: "20px", height: "20px" }}
                                  />
                                }
                              >
                                Filter
                              </Button>
                            )}
                          </Box>
                          {ordersByChefPreOrder?.Packed?.length > 0 ? (
                            <>
                              {groupedFoodPacked()?.map((element, indx) => (
                                <Box
                                  key={indx}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    mb: 3,
                                    gap: "20px",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      padding: "0px",
                                      gap: "10px",
                                    }}
                                  >
                                    <Typography variant="bodybold">
                                      {format(
                                        new Date(element.preOrderDate),
                                        "MMMM dd, yyyy"
                                      )}
                                    </Typography>
                                    <Typography variant="bodybold">
                                      {element.deliverySlot}
                                    </Typography>
                                  </Box>
                                  {element.orders
                                    .sort((a, b) => a.id - b.id)
                                    .map((e, index) => (
                                      <Box
                                        key={index}
                                        sx={{
                                          boxSizing: "border-box",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                          padding: "20px",
                                          gap: "10px",
                                          background: "#FCFCFC",
                                          border: "1px solid #DFE2E6",
                                          borderRadius: "20px",
                                          width: "100%",
                                        }}
                                      >
                                        {/* order id, created date, and Customer profile */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: "0px",
                                            gap: "20px",
                                            flexWrap: "wrap",
                                            width: "100%",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          {/* left div */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              alignItems: "flex-start",
                                              gap: "13px",
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                display: "flex",
                                                gap: "10px",
                                                alignItems: "center",
                                              }}
                                            >
                                              <Typography variant="bodybold">
                                                #
                                                {orderNoFormat(e.id.toString())}
                                              </Typography>

                                              <Typography variant="bodyregular">
                                                (Delivery Passcode:{" "}
                                                {e.deliveryPasscode})
                                              </Typography>
                                            </Box>
                                            {/*created date and  time */}
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
                                                  new Date(
                                                    e.createdDate.split(" ")[0]
                                                  ),
                                                  "dd LLL yyyy"
                                                )}{" "}
                                                {format(
                                                  parseISO(e.createdDate),
                                                  "hh:mm a"
                                                )}
                                              </Typography>
                                            </Box>
                                          </Box>

                                          {/* Right div */}
                                          <Box
                                            onClick={() => {
                                              setCustomerDetailModal(true);
                                              setCustomerDetails(e);
                                            }}
                                            sx={{
                                              boxSizing: "border-box",
                                              display: "flex",
                                              flexDirection: "column",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              padding: "0px",
                                              gap: "10px",
                                              width: "60px",
                                              height: "60px",
                                              background: "#FCFCFC",
                                              border: "1px solid #DFE2E6",
                                              boxShadow:
                                                "0px 10px 30px rgba(0, 0, 0, 0.1)",
                                              borderRadius: "82px",
                                              cursor: "pointer",
                                            }}
                                          >
                                            <Typography variant="header4">
                                              {e.userName[0].toUpperCase()}
                                            </Typography>
                                          </Box>
                                        </Box>

                                        {/* food items */}
                                        <Typography variant="bodyparagraph">
                                          {e.foodItems
                                            .map(
                                              (item) =>
                                                item.quantity +
                                                " x " +
                                                item.foodItemName
                                            )
                                            .join(", ")}
                                        </Typography>
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

                                        {/* price  */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                          }}
                                        >
                                          <Typography variant="bodyparagraph">
                                            {e.foodItems
                                              .map((el) => el.quantity)
                                              .reduce(
                                                (sum, val) => sum + val,
                                                0
                                              )}{" "}
                                            Items
                                          </Typography>
                                          <Typography variant="bodybold">
                                            ₹&nbsp;
                                            {e.foodItems
                                              .map(
                                                (el) =>
                                                  el.quantity *
                                                  (el.sellingPrice - el.rebate)
                                              )
                                              .reduce(
                                                (sum, val) => sum + val,
                                                0
                                              )}
                                          </Typography>
                                        </Box>

                                        {/* Packing Charges */}
                                        {e.totalPackingCharges > 0 && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "row",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                              width: "100%",
                                            }}
                                          >
                                            <Typography variant="bodyparagraph">
                                              Packing Charges
                                            </Typography>
                                            <Typography variant="bodybold">
                                              ₹&nbsp;
                                              {e.totalPackingCharges}
                                            </Typography>
                                          </Box>
                                        )}

                                        {/* delivery mins */}
                                        {!!e.dunzoTaskId &&
                                          dunzoAgentData.filter(
                                            (ord) =>
                                              ord.dunzoTaskId === e.dunzoTaskId
                                          ).length > 0 && (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                padding: "0px",
                                                width: "100%",
                                              }}
                                            >
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
                                                  component={"img"}
                                                  sx={{
                                                    width: "16px",
                                                    height: "16px",
                                                  }}
                                                  src="/media/svg/delivery-motorbike.svg"
                                                />
                                                {dunzoAgentDetailsFunc(
                                                  e.dunzoTaskId
                                                )}
                                              </Box>
                                            </Box>
                                          )}

                                        {/* Mark as deliverd button */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
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
                                                e.deliveryType === "selfPickup"
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
                                                  e.deliveryType ===
                                                  "selfPickup"
                                                    ? "#1C1853"
                                                    : "#FF9800",
                                              }}
                                            >
                                              {e.deliveryType === "selfPickup"
                                                ? "Self Pickup"
                                                : "Door Delivery"}
                                            </Typography>
                                            <Box
                                              sx={{
                                                width: "16px",
                                                height: "16px",
                                              }}
                                              component={"img"}
                                              src={
                                                e.deliveryType === "selfPickup"
                                                  ? "/media/svg/self-pickup.svg"
                                                  : "/media/svg/delivery-motorbike-orange.svg"
                                              }
                                            />
                                          </Box>

                                          <Box>
                                            {e.deliveryType ===
                                              "selfPickup" && (
                                              <Button
                                                variant="outlined"
                                                disabled={
                                                  isDeliveryFetching &&
                                                  deliveryId === e.id
                                                }
                                                onClick={() =>
                                                  markAsDelivered(e.id)
                                                }
                                              >
                                                Delivered
                                                {isDeliveryFetching &&
                                                deliveryId === e.id ? (
                                                  <CircularProgress
                                                    size={24}
                                                    sx={{ ml: 2 }}
                                                  />
                                                ) : (
                                                  <></>
                                                )}
                                              </Button>
                                            )}
                                          </Box>
                                        </Box>
                                        {/* {e.referrerUserId ===
                                          userData?.user.id && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              gap: "10px",
                                            }}
                                          >
                                            <Box
                                              component={"img"}
                                              src="/media/svg/gift-box.svg"
                                              sx={{
                                                height: "20px",
                                                width: "20px",
                                              }}
                                            />
                                            <Typography variant="bodybold">
                                              You will earn ₹50 for this order
                                            </Typography>
                                          </Box>
                                        )} */}
                                      </Box>
                                    ))}
                                </Box>
                              ))}
                            </>
                          ) : (
                            <Typography variant="bodyparagraph">
                              No Packed orders
                            </Typography>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                ) : (
                  <Typography sx={{ mt: 2 }} variant="bodyparagraph">
                    No preorders available
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Food item accept and reject modal */}
      <Modal open={foodRejectModal}>
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
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "20px",
              background: "#FCFCFC",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: `calc(100% - 40px)`,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="header4">
              #{orderNoFormat(rejectElement?.id.toString())}
            </Typography>
            <Box
              onClick={() => {
                setFoodRejectModal(false);
                setRejectText("");
                setRejectElement(null);
              }}
              component={"img"}
              sx={{
                height: "12.59px",
                width: "12.59px",
                cursor: "pointer",
              }}
              src="/media/modal-close.png"
            />
          </Box>
          {/* Modal Body */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px",
              gap: "10px",
              background: "#FFFFFF",
              borderRadius: "0px 0px 20px 20px",
              alignSelf: "stretch",
            }}
          >
            {/* PROFILE AND DETAILS */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0px",
                gap: "20px",
                alignSelf: "stretch",
              }}
            >
              {/* profile */}
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0px",
                  gap: "10px",
                  width: "60px",
                  height: "60px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "82px",
                }}
              >
                <Typography variant="header4">
                  {rejectElement?.userName[0].toUpperCase()}
                </Typography>
              </Box>

              {/* DETAILS */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "13px",
                }}
              >
                {/* username and phone number */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="bodybold">
                    {rejectElement?.userName}
                  </Typography>
                </Box>

                {/* mobile number */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Typography variant="bodybold" color="primary">
                    {rejectElement?.userCountryCode}-
                    <Link
                      href={"tel:" + rejectElement?.userMobileNumber}
                      sx={{ textDecoration: "none" }}
                    >
                      {rejectElement?.userMobileNumber}
                    </Link>{" "}
                  </Typography>
                  <Box
                    component={"img"}
                    sx={{ height: "19px", width: "19px", cursor: "pointer" }}
                    src="/media/svg/copy-to-clipboard.svg"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        rejectElement?.userMobileNumber
                      );
                      toast("Copied to clipboard", {
                        position: toast.POSITION.BOTTOM_CENTER,
                        autoClose: 1000,
                        hideProgressBar: true,
                      });
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Food and price details */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                // alignItems: "center",
                padding: "0px",
                gap: "9px",
                alignSelf: "stretch",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px",
                  gap: "10px",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="bodyparagraph">
                  {rejectElement?.foodItems
                    .map((item) => item.quantity + " x " + item.foodItemName)
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

              {/* created date and price */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px",
                  gap: "24px",
                  justifyContent: "space-between",
                  alignSelf: "stretch",
                  // flexGrow: "0",
                }}
              >
                {rejectElement?.orderType === "instant" ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: "10px 0px",
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
                    {!!rejectElement?.createdDate && (
                      <Typography variant="bodyregular">
                        {format(
                          new Date(rejectElement?.createdDate.split(" ")[0]),
                          "dd LLL yyyy"
                        )}{" "}
                        {format(
                          parseISO(rejectElement?.createdDate),
                          "hh:mm a"
                        )}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      flexWrap: "wrap",
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
                          src="/media/svg/preorder-white.svg"
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
                        Preorder
                      </Typography>
                    </Box>
                    {/* preorder date and slot */}
                    <Typography variant="bodyregular">
                      {!!rejectElement &&
                        format(
                          new Date(rejectElement?.preOrderDate),
                          "EEE dd MMM"
                        )}
                      , {rejectElement?.deliverySlot}
                    </Typography>
                  </Box>
                )}

                <Typography variant="bodybold">
                  ₹
                  {rejectElement?.foodItems
                    .map((el) => el.quantity * (el.sellingPrice - el.rebate))
                    .reduce((sum, val) => sum + val, 0)}
                </Typography>
              </Box>

              {!!rejectElement?.instructions && (
                <Typography variant="bodymetatag">
                  Instructions: {rejectElement?.instructions}
                </Typography>
              )}

              {/* text area */}
              {acceptOrReject === "Reject" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "10px",
                    width: "100%",
                  }}
                >
                  {/* text area */}
                  <TextField
                    multiline
                    value={rejectText}
                    onChange={(ev) => {
                      setRejectText(ev.target.value);
                      setRejectTextError(false);
                      setRejectTextHelper("");
                    }}
                    inputProps={{ maxLength: 300 }}
                    error={rejectTextError}
                    helperText={rejectTextHelper}
                    rows={4}
                    placeholder="Reason for rejection *"
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
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              padding: "10px 25px",
              gap: "25px",
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setFoodRejectModal(false);
                setRejectText("");
                setRejectElement(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (acceptOrReject === "Accept") {
                  confirmOrder();
                } else {
                  rejectOrder();
                }
              }}
              disabled={isConfirmOrderFetching || isRejectOrderFetching}
            >
              {isConfirmOrderFetching || isRejectOrderFetching ? (
                <CircularProgress size={24} sx={{ mr: 2 }} />
              ) : (
                <></>
              )}
              {acceptOrReject === "Accept" ? "Confirm" : "Reject"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Customer details Modal */}
      <Modal
        open={customerDetailModal}
        onClose={() => setCustomerDetailModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "20px 25px",
              gap: "10px",
              background: "#FFFFFF",
              boxShadow: "inset 0px -1px 0px rgba(0, 0, 0, 0.25)",
              borderRadius: "20px 20px 0px 0px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px",
                width: "100%",
              }}
            >
              <Typography variant="header4">
                #{orderNoFormat(customerDetails?.id.toString())}
              </Typography>
              <Box
                onClick={() => setCustomerDetailModal(false)}
                component={"img"}
                sx={{
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                }}
                src="/media/svg/cross-circled.svg"
              />
            </Box>
          </Box>

          {/* Modal Body */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "20px 25px",
              gap: "10px",
              background: "#FFFFFF",
              borderRadius: "0px 0px 20px 20px",
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
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0px",
                  gap: "10px",
                  width: "60px",
                  height: "60px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                  borderRadius: "82px",
                }}
              >
                <Typography variant="header4">
                  {customerDetails?.userName[0].toUpperCase()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "10px",
                }}
              >
                <Typography variant="bodybold">
                  {customerDetails?.userName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <Typography variant="bodyparagraph" color="primary">
                    +91{" "}
                    <Link
                      href={"tel:" + customerDetails?.userMobileNumber}
                      sx={{ textDecoration: "none" }}
                    >
                      {customerDetails?.userMobileNumber}
                    </Link>
                  </Typography>
                  <Box
                    onClick={() => {
                      navigator.clipboard.writeText(
                        customerDetails?.userMobileNumber
                      );
                      toast("Copied to clipboard", {
                        position: toast.POSITION.BOTTOM_CENTER,
                        autoClose: 1000,
                        hideProgressBar: true,
                      });
                    }}
                    component={"img"}
                    sx={{ width: "16px", height: "16px", cursor: "pointer" }}
                    src="/media/svg/copy-to-clipboard.svg"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Drawer Filter for confirmed orders */}
      <Drawer
        anchor="right"
        open={filterConfirmDrawer}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: { width: "40%", minWidth: "300px", maxWidth: "600px" },
        }}
      >
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
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0px",
              flex: "none",
              order: "0",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            <Typography variant="header3">Filter confirmed orders</Typography>
            <Box
              onClick={() => {
                setFilterConfirmDrawer(false);
                setSlotNA(slot);
                setPreorderDayNameNA(preorderDayName);
              }}
              component={"img"}
              sx={{ width: "24px", height: "24px" }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>

          {/* line */}
          <Box
            sx={{
              // width: "519px",
              height: "0px",
              border: "1px solid #2A3037",
              flex: "none",
              order: "1",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          />
        </Box>

        {/* Drawer Body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "0px",
            gap: "29px",
            // position: "absolute",
            // width: "519px",
            // height: "761px",
            // left: "20px",
            // top: "95px",
          }}
        >
          {/* Choose delivery date box */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px 20px",
              gap: "15px",
              // width: "655px",
              // height: "116px",
              background: "#FCFCFC",
              flex: "none",
              order: "0",
              flexGrow: "0",
            }}
          >
            <Typography variant="bodybold">Select the Day</Typography>
            {/* Calender box */}
            <Tabs
              value={preorderDayNameNA}
              onChange={(ev, newValue) => {
                setPreorderDayNameNA(newValue);
              }}
              TabIndicatorProps={{
                style: {
                  display: "none",
                },
              }}
              sx={{
                "& .MuiTab-root": {
                  minWidth: "0px",
                },
                "& .MuiTabs-flexContainer": {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "615px",
                  // height: "75px",
                  flex: "none",
                  order: "1",
                  flexGrow: "0",
                  flexWrap: "wrap",
                },
                "& button.Mui-selected": {
                  background: "#FFEFE9",
                  boxShadow: "0px -10px 20px rgba(249, 136, 31, 0.1)",
                  color: `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)`,
                  border: "1px solid #F28C0E",
                },
              }}
            >
              {preOrderWeek?.map((el, idx) => (
                <Tab
                  disableRipple
                  key={idx}
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "4px 5px",
                    gap: "6px",
                    width: "75px",
                    height: "75px",
                    border: "1px solid #AAACAE",
                    borderRadius: "5px",
                    flex: "none",
                    order: "1",
                    flexGrow: "0",
                  }}
                  label={
                    <Box
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "4px 5px",
                        gap: "6px",
                        position: "absolute",
                        width: "75px",
                        height: "75px",
                        left: "0px",
                        top: "0px",
                        color:
                          preorderDayNameNA === el.dayName
                            ? "#FF774C"
                            : "#2A3037",
                        boxShadow: "0px -10px 20px rgba(249, 136, 31, 0.1)",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography variant="bodybold">
                        {el.dayName.slice(0, 3)}
                      </Typography>

                      <Typography variant="bodyparagraph">{el.date}</Typography>
                    </Box>
                  }
                  value={el.dayName}
                ></Tab>
              ))}
            </Tabs>
          </Box>

          {/* Delivery Slot */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px 20px",
              gap: "15px",
              // width: "655px",
              // height: "159px",
              // background: "#FCFCFC",
              flex: "none",
              order: "1",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            <Typography variant="bodybold">Select the Delivery Slot</Typography>
            <FormControl sx={{ width: "180px" }}>
              <InputLabel id="deliverySlots">Delivery Slot</InputLabel>
              <Select
                labelId="deliverySlots"
                id="deliverySlots"
                value={slotNA}
                label="Delivery Slots"
                onChange={(ev) => {
                  setSlotNA(ev.target.value);
                }}
              >
                {deliverySlots?.map((el, idx) => (
                  <MenuItem key={idx} value={el}>
                    {el}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "25px",
            gap: "24px",
            order: "3",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setSlotNA(null);
              setPreorderDayNameNA(null);
              setApplyFilterStatus(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreorderDayName(preorderDayNameNA);
              setSlot(slotNA);
              setFilterConfirmDrawer(false);
              if (slotNA !== null && preorderDayNameNA !== null) {
                setApplyFilterStatus(true);
              }
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>

      {/* Drawer Filter for Packed orders */}
      <Drawer
        anchor="right"
        open={filterPackedDrawer}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: { width: "40%", minWidth: "300px", maxWidth: "600px" },
        }}
      >
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
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0px",
              flex: "none",
              order: "0",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            <Typography variant="header3">Filter packed orders</Typography>
            <Box
              onClick={() => {
                setFilterPackedDrawer(false);
                setSlotNA2(slot2);
                setPreorderDayNameNA2(preorderDayName2);
              }}
              component={"img"}
              sx={{ width: "24px", height: "24px" }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>

          {/* line */}
          <Box
            sx={{
              // width: "519px",
              height: "0px",
              border: "1px solid #2A3037",
              flex: "none",
              order: "1",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          />
        </Box>

        {/* Drawer Body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "0px",
            gap: "29px",
            // position: "absolute",
            // width: "519px",
            // height: "761px",
            // left: "20px",
            // top: "95px",
          }}
        >
          {/* Choose delivery date box */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px 20px",
              gap: "15px",
              // width: "655px",
              // height: "116px",
              background: "#FCFCFC",
              flex: "none",
              order: "0",
              flexGrow: "0",
            }}
          >
            <Typography variant="bodybold">Select the Day</Typography>
            {/* Calender box */}
            <Tabs
              value={preorderDayNameNA2}
              onChange={(ev, newValue) => {
                setPreorderDayNameNA2(newValue);
              }}
              TabIndicatorProps={{
                style: {
                  display: "none",
                },
              }}
              sx={{
                "& .MuiTab-root": {
                  minWidth: "0px",
                },
                "& .MuiTabs-flexContainer": {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "615px",
                  // height: "75px",
                  flex: "none",
                  order: "1",
                  flexGrow: "0",
                  flexWrap: "wrap",
                },
                "& button.Mui-selected": {
                  background: "#FFEFE9",
                  boxShadow: "0px -10px 20px rgba(249, 136, 31, 0.1)",
                  color: `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)`,
                  border: "1px solid #F28C0E",
                },
              }}
            >
              {preOrderWeek?.map((el, idx) => (
                <Tab
                  disableRipple
                  key={idx}
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "4px 5px",
                    gap: "6px",
                    width: "75px",
                    height: "75px",
                    border: "1px solid #AAACAE",
                    borderRadius: "5px",
                    flex: "none",
                    order: "1",
                    flexGrow: "0",
                  }}
                  label={
                    <Box
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "4px 5px",
                        gap: "6px",
                        position: "absolute",
                        width: "75px",
                        height: "75px",
                        left: "0px",
                        top: "0px",
                        color:
                          preorderDayNameNA2 === el.dayName
                            ? "#FF774C"
                            : "#2A3037",
                        boxShadow: "0px -10px 20px rgba(249, 136, 31, 0.1)",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography variant="bodybold">
                        {el.dayName.slice(0, 3)}
                      </Typography>

                      <Typography variant="bodyparagraph">{el.date}</Typography>
                    </Box>
                  }
                  value={el.dayName}
                ></Tab>
              ))}
            </Tabs>
          </Box>

          {/* Delivery Slot */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px 20px",
              gap: "15px",
              // width: "655px",
              // height: "159px",
              // background: "#FCFCFC",
              flex: "none",
              order: "1",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            <Typography variant="bodybold">Select the Delivery Slot</Typography>
            {/* <Tabs
              value={slotNA2}
              onChange={(ev, newValue) => {
                setSlotNA2(newValue);
              }}
              TabIndicatorProps={{
                style: {
                  display: "none",
                },
              }}
              sx={{
                "& .MuiTabs-flexContainer": {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "13px",
                  // width: "615px",
                  // height: "118px",
                  flex: "none",
                  order: "1",
                  alignSelf: "stretch",
                  flexGrow: "0",
                  flexWrap: "wrap",
                },
                "& button.Mui-selected": {
                  background: "#FFEFE9",
                  boxShadow: "0px -10px 20px rgba(249, 136, 31, 0.1)",
                  color: `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)`,
                  border: "1px solid #F28C0E",
                },
              }}
            >
              {preorderSlots?.map((el) => (
                <Tab
                  disableRipple
                  key={el.id}
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "10px",
                    gap: "10px",
                    width: "128px",
                    height: "48px",
                    border: "1px solid #AAACAE",
                    borderRadius: "10px",
                    flex: "none",
                    order: "1",
                    alignSelf: "stretch",
                    flexGrow: "0",
                    textTransform: "none",
                    color: slotNA2 === el.slot ? "#FF774C" : "#2A3037",
                  }}
                  label={
                    <Typography variant="bodyparagraph">{el.slot}</Typography>
                  }
                  value={el.slot}
                />
              ))}
            </Tabs> */}
            <FormControl sx={{ width: "180px" }}>
              <InputLabel id="deliverySlots">Delivery Slot</InputLabel>
              <Select
                labelId="deliverySlots"
                id="deliverySlots"
                value={slotNA2}
                label="Delivery Slots"
                onChange={(ev) => {
                  setSlotNA2(ev.target.value);
                }}
              >
                {deliverySlots?.map((el, idx) => (
                  <MenuItem key={idx} value={el}>
                    {el}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "25px",
            gap: "24px",
            order: "3",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setSlotNA2(null);
              setPreorderDayNameNA2(null);
              setApplyFilterStatus2(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreorderDayName2(preorderDayNameNA2);
              setSlot2(slotNA2);
              setFilterPackedDrawer(false);
              if (slotNA2 !== null && preorderDayNameNA2 !== null) {
                setApplyFilterStatus2(true);
              }
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>

      {/* Drawer for plan for next day */}
      <Drawer
        anchor="right"
        open={planNextDayDrawer}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: { width: "40%", minWidth: "300px", maxWidth: "600px" },
        }}
      >
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
              alignItems: "center",
              justifyContent: "space-between",
              alignSelf: "stretch",
            }}
          >
            <Typography variant="header3">Order Items Count</Typography>
            <Box
              onClick={() => {
                setPlanNextDayDrawer(false);
                setSelectDay(null);
                setSelectSlot(null);
              }}
              component={"img"}
              sx={{ width: "24px", height: "24px" }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>

          {/* line */}
          <Box
            sx={{
              height: "0px",
              border: "1px solid #2A3037",
              flex: "none",
              order: "1",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          />
        </Box>

        {/* Drawer body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "16px",
            m: "16px",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <FormControl sx={{ width: "150px" }} variant="standard">
            <InputLabel id="date-select-label">Select Date</InputLabel>
            <Select
              labelId="date-select-label"
              id="date-select"
              value={selectDay}
              label="Age"
              onChange={(ev) => setSelectDay(ev.target.value)}
            >
              {preOrderWeek?.map((el) => (
                <MenuItem key={el.id} value={el.dayName}>
                  {el.dayName.split(",")[2]}, {el.dayName.slice(0, 3)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: "150px" }} variant="standard">
            <InputLabel id="slot-select-label">Select Delivery Slot</InputLabel>
            <Select
              labelId="slot-select-label"
              id="slot-select"
              value={selectSlot}
              label="Age"
              onChange={(ev) => setSelectSlot(ev.target.value)}
            >
              {deliverySlots?.map((el) => (
                <MenuItem key={el.id} value={el}>
                  {el}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {selectSlot && selectDay ? foodDayPlan() : ""}
      </Drawer>
    </>
  );
};

export default ChefOrdersDashboard;
