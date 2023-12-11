import React, { useState, useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CircularProgress,
  Drawer,
  FormControlLabel,
  Link,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { config } from "../../../config/config";
import { useCookies } from "react-cookie";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { orderNoFormat } from "../../../common/common";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../general-components/ui-components/Header";
import { format, parseISO } from "date-fns";
import { Rating } from "react-simple-star-rating";
import moment from "moment";

const PreviousOrders = () => {
  const [cookies] = useCookies();
  const location = useLocation();
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const {
    isFetching: isOutletsDataFetching,
    outletsData,
    outletsError,
    logout,
  } = globalState.outletsReducer;

  const { userData } = globalState.userReducer;
  const [ordersByChef, setOrdersByChef] = useState([]);
  const [invokeGetOrders, setInvokeGetOrders] = useState(false);
  const [isOrderByChefFetching, setIsOrderByChefFetching] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [previousStatus, setPreviousStatus] = useState([
    { status: "Cancelled", checked: false },
    { status: "Cancelled by Chef", checked: false },
    { status: "Returned", checked: false },
    { status: "Dispatched", checked: false },
    { status: "Delivered", checked: false },
    { status: "Cancelled By The System", checked: false },
  ]);
  const [previousStatusNA, setPreviousStatusNA] = useState([]);

  const [showLoadMore, setShowLoadMore] = useState(true);
  const [limit, setLimit] = useState(10);
  const [fromDateNA, setFromDateNA] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDateNA, setToDateNA] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDateError, setFromDateError] = useState(false);
  const [fromDateHelperText, setFromDateHelperText] = useState("");
  const [toDateError, setToDateError] = useState(false);
  const [toDateHelperText, setToDateHelperText] = useState("");

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState("");
  const [isOrderRatingFetching, setIsOrderRatingFetching] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const [isCloudKitchenOwner, setIsCloudKitchenOwner] = useState(false);
  // if cloudkitchenowner set this variable to avoid react warning
  // [React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked]

  let outletCookieData;

  // Load More
  const loadMore = () => {
    setLimit((limit) => limit + 10);
    setInvokeGetOrders(true);
  };

  // handle change previous order status
  const handleChangeOrderStatus = (idx) => {
    let copy = JSON.parse(JSON.stringify(previousStatusNA));
    copy[idx].checked = !copy[idx].checked;
    setPreviousStatusNA(copy);
  };

  // valiadates fro to dates whilw filtering;
  const validateFromToDates = () => {
    let validationErrors = false;
    if (fromDateNA && toDateNA === null) {
      setToDateError(true);
      setToDateHelperText("Please enter to date");
      validationErrors = true;
    }
    if (fromDateNA === null && toDateNA) {
      setFromDateError(true);
      setFromDateHelperText("Please enter from date");
      validationErrors = true;
    }
    if (fromDateNA && fromDateNA > new Date()) {
      setFromDateError(true);
      setFromDateHelperText("From Date not be a future date");
      validationErrors = true;
    }
    if (toDateNA && toDateNA < fromDateNA) {
      setToDateError(true);
      setToDateHelperText("To date not smaller than from date");
      validationErrors = true;
    }
    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  const getOrderRatings = async (id) => {
    setIsOrderRatingFetching(true);
    let params = { orderId: id };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.getOrderRatings,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setFeedbackData(response.data.orderRatings);
        setIsOrderRatingFetching(false);
      } else {
        alert(
          "Something went wrong while get ratings. Please try again later!"
        );
        setIsOrderRatingFetching(false);
      }
    } else {
      alert("Something went wrong while get ratings. Please try again later!!");
      setIsOrderRatingFetching(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Orders History";
  }, []);

  // get orders on page load
  useEffect(() => {
    const getOrderByChef = async () => {
      let checkedOrderStatus = previousStatus
        ?.filter((el) => el.checked === true)
        .map((el) => el.status);

      let params = {
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
        limit,
        startDate: fromDate ? moment(fromDate).format("YYYY-MM-DD") : null,
        endDate: toDate ? moment(toDate).format("YYYY-MM-DD") : null,
        statusList:
          checkedOrderStatus.length > 0
            ? checkedOrderStatus
            : [
                "Cancelled",
                "Cancelled by Chef",
                "Returned",
                "Dispatched",
                "Delivered",
                "Cancelled By The System",
              ],
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getOrdersByChef,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOrdersByChef(response.data.orders);
          if (response.data.orders.length < limit) {
            setShowLoadMore(false);
          }
          setIsOrderByChefFetching(false);
        } else {
          alert(
            "Something went wrong while get orders. Please try again later!"
          );
          setIsOrderByChefFetching(false);
        }
      } else {
        alert(
          "Something went wrong while get orders. Please try again later!!"
        );
        setIsOrderByChefFetching(false);
      }
    };
    if (invokeGetOrders) {
      setInvokeGetOrders(false);
      getOrderByChef();
    }
  }, [
    invokeGetOrders,
    cookies,
    location,
    previousStatus,
    limit,
    toDate,
    fromDate,
  ]);

  // if drawer is open in setting initial states
  useEffect(() => {
    if (isFilterDrawerOpen) {
      setPreviousStatusNA(JSON.parse(JSON.stringify(previousStatus)));
      setFromDateNA(fromDate);
      setToDateNA(toDate);
    }
  }, [isFilterDrawerOpen, previousStatus, fromDate, toDate]);

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

  // get outlets if roles is cloud kitchen owner and trigger get order by chef
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") !== -1) {
        let outletCookieData = cookies[config.preferencesCookie]?.outletData;
        if (outletsData?.cloudKitchenOutlets && outletCookieData !== null) {
          setIsCloudKitchenOwner(true);
          setInvokeGetOrders(true);
        }
      } else if (
        userData?.user.roles.indexOf("Home Chef Owner") !== -1 ||
        userData?.user.roles.indexOf("Chef Manager") !== -1 ||
        userData?.user.roles.indexOf("Outlet Manager") !== -1
      ) {
        setIsCloudKitchenOwner(false);
        setInvokeGetOrders(true);
      } else {
        navigate("/");
      }
    }
  }, [userData, cookies, outletsData, outletCookieData, navigate]);

  return (
    <>
      <Header showOutlets={isCloudKitchenOwner} />

      {isOrderByChefFetching || isOutletsDataFetching ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <Box
          sx={{
            my: "24px",
            mx: "27px",
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs separator="›">
            <Link component={RouterLink} to="/">
              <Box
                component={"img"}
                sx={{ width: "16px", height: "16px", mt: "4px" }}
                src="/media/svg/home-filled-orange.svg"
              />
            </Link>
            <Link
              underline="hover"
              component={RouterLink}
              to="/chef-orders-dashboard"
            >
              Chef Orders Dashboard
            </Link>
            <Typography color="inherit">
              Previous Orders
              {!!cookies[config.preferencesCookie]?.outletData
                ?.cloudKitchenName &&
                !!cookies[config.preferencesCookie]?.outletData?.outletName &&
                " of " +
                  cookies[config.preferencesCookie]?.outletData
                    ?.cloudKitchenName +
                  " - " +
                  cookies[config.preferencesCookie]?.outletData?.outletName}
            </Typography>
          </Breadcrumbs>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Typography variant="header3">Previous Orders</Typography>
            <Button
              variant="outlined"
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filter
            </Button>
          </Box>

          {/* previous order div */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              // // position: "absolute",
              // width: "1311px",
              // height: "1002px",
              // left: "51px",
              // top: "183px",
              mt: 2,
            }}
          >
            {ordersByChef.length > 0 ? (
              <>
                {ordersByChef?.map((el, idx) => (
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
                          height: "300px",
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
                        gap: "15px",
                        width: "100%",
                        mb: "20px",
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
                              el.status === "Delivered" ? "#E5EFED" : "#FEECEB",
                            borderRadius: "20px",
                          }}
                        >
                          <Typography
                            variant="bodymetatag"
                            sx={{
                              color:
                                el.status === "Delivered"
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
                              el.status === "Delivered"
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
                          {/* chef name, price */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "25px",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "15px",
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
                                  {el.userName[0].toUpperCase()}
                                </Typography>
                              </Box>
                              <Typography variant="bodyparagraph">
                                {el.userName}
                              </Typography>
                            </Box>
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
                            {el.deliverySlot}
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
                          {/* {format(
                            new Date(el.deliveredDate ?? el.updatedDate),
                            "LLL dd, yyyy hh:mm a"
                          )} */}
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
                          width: "100%",
                          // whiteSpace: "nowrap",
                          // overflow: "hidden",
                          // textOverflow: "ellipsis",
                        }}
                      >
                        {el.foodItems
                          .map(
                            (item) => item.quantity + " x " + item.foodItemName
                          )
                          .join(", ")}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "30px",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="bodybold">
                          ₹{" "}
                          {el.foodItems
                            .map(
                              (item) =>
                                item.quantity *
                                (item.sellingPrice - item.rebate)
                            )
                            .reduce((sum, val) => sum + val, 0)
                            .toFixed(2)}
                        </Typography>
                        {el.ratingForFood && (
                          <Link
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              getOrderRatings(el.id);
                              setIsFeedbackModalOpen(true);
                            }}
                          >
                            See Feedback
                          </Link>
                        )}
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
                            You have earned ₹50 for this order
                          </Typography>
                        </Box>
                      )} */}
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
            >
              Load more
            </Button>
          )}
        </Box>
      )}
      {/* Drawer for filter status and date */}
      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: {
            width: "40%",
            minWidth: "300px",
            maxWidth: "600px",
            p: "20px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // padding: "20px",
            gap: "10px",
            // position: "absolute",
            // width: "559px",
            // height: "95px",
            // left: "0px",
            // top: "0px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0px",
              // width: "519px",
              // height: "45px",
              flex: "none",
              order: "0",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            <Typography variant="header1" sx={{ fontSize: "22px" }}>
              Filter
            </Typography>
            <Box
              onClick={() => {
                setIsFilterDrawerOpen(false);
                setToDateHelperText("");
                setToDateError(false);
                setFromDateHelperText("");
                setFromDateError(false);
              }}
              component={"img"}
              sx={{ width: "25px", height: "25px", cursor: "pointer" }}
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

        {/* Drawer body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "0px",
            gap: "20px",
            width: "496px",
            // height: "118px",
            flex: "none",
            order: "0",
            flexGrow: "0",
            mt: 3,
          }}
        >
          <Typography variant="header4">Status</Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "20px",
              // gap: "57px",
              // width: "496px",
              // height: "24px",
              flex: "none",
              order: "0",
              flexGrow: "0",
              flexWrap: "wrap",
            }}
          >
            {previousStatusNA?.map((el, idx) => (
              <FormControlLabel
                key={idx}
                label={
                  <Typography
                    variant={
                      el.checked ? "bodyboldhighlighted" : "bodyparagraph"
                    }
                  >
                    {el.status}
                  </Typography>
                }
                value={el.status}
                control={
                  <Checkbox
                    checked={el.checked}
                    onChange={() => handleChangeOrderStatus(idx)}
                  />
                }
              />
            ))}
          </Box>
          <Typography variant="header4">Date</Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "0px",
              gap: "20px",
              // width: "517px",
              // height: "51px",
              flex: "none",
              order: "2",
              alignSelf: "stretch",
              flexGrow: "0",
            }}
          >
            {/* Date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                inputFormat="dd-MM-yyyy"
                mask={"__-__-____"}
                value={fromDateNA}
                onChange={(newValue) => {
                  setFromDateNA(moment(newValue).format("YYYY-MM-DD"));
                  setFromDateError(false);
                  setFromDateHelperText("");
                }}
                inputProps={{ readOnly: true }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="from"
                    label="From Date"
                    error={fromDateError}
                    helperText={fromDateHelperText}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& > fieldset": { borderRadius: "15px" },
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                sx={{ display: "block", top: "34px", left: "0px" }}
                label="To Date"
                inputFormat="dd-MM-yyyy"
                mask={"__-__-____"}
                value={toDateNA}
                onChange={(newValue) => {
                  setToDateNA(moment(newValue).format("YYYY-MM-DD"));
                  setToDateError(false);
                  setToDateHelperText("");
                }}
                inputProps={{ readOnly: true }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // size="small"
                    id="from"
                    label="To Date"
                    error={toDateError}
                    helperText={toDateHelperText}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& > fieldset": { borderRadius: "15px" },
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 25px",
            gap: "10px",
            order: "3",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setPreviousStatusNA([
                { status: "Cancelled", checked: false },
                { status: "Cancelled by Chef", checked: false },
                { status: "Returned", checked: false },
                { status: "Dispatched", checked: false },
                { status: "Delivered", checked: false },
              ]);
              setFromDateNA(null);
              setToDateNA(null);
              setToDateHelperText("");
              setToDateError(false);
              setFromDateHelperText("");
              setFromDateError(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              let validate = validateFromToDates();
              if (validate) {
                setPreviousStatus(JSON.parse(JSON.stringify(previousStatusNA)));
                setOrdersByChef([]);
                setIsOrderByChefFetching(true);
                setShowLoadMore(true);
                setIsFilterDrawerOpen(false);
                setInvokeGetOrders(true);
                setFromDate(fromDateNA);
                setToDate(toDateNA);
              }
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>

      {/* Modal for rating */}
      <Modal open={isFeedbackModalOpen}>
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
            // height: "50%",
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
              Rating for #
              {!!feedbackData &&
                orderNoFormat(feedbackData[0].orderId.toString())}
            </Typography>
            <Box
              onClick={() => {
                setIsFeedbackModalOpen(false);
                setFeedbackData(null);
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
          {!isOrderRatingFetching && !!feedbackData ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "9px",
                gap: "10px",
                // background: "#FFFFFF",
                borderRadius: "0px 0px 20px 20px",
                alignSelf: "stretch",
                maxHeight: "60vh",
                overflow: "scroll",
              }}
            >
              {feedbackData
                ?.filter((el) => el.ratingFor === "food")
                .map((el, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      py: 1,
                      borderBottom: "1px dashed #ccc",
                    }}
                  >
                    <Typography variant="bodybold" color="#FF774C">
                      {el.foodItemName}
                    </Typography>
                    {/* Rating */}
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
                    />
                    {/* Review of rating */}
                    <Typography
                      variant="bodyparagraph"
                      sx={{ textAlign: "justify" }}
                    >
                      {el.review}
                    </Typography>
                  </Box>
                ))}
            </Box>
          ) : (
            <CircularProgress sx={{ margin: "auto" }} />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PreviousOrders;
