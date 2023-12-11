import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Link,
  Drawer,
  CardActions,
} from "@mui/material";
import { apiList, invokeApi } from "../../../services/apiServices";
import { getChef } from "../../../global/redux/actions";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { config } from "../../../config/config";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Header from "../../general-components/ui-components/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";

const ChefCouponManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { chefData, chefError, logout: chefLogout } = globalState.chefReducer;
  const { userData } = globalState.userReducer;
  // coupon states
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [couponHelperText, setCouponHelperText] = useState("");

  const [couponIssueDate, setCouponIssueDate] = useState(null);
  const [couponIssueDateError, setCouponIssueDateError] = useState(false);
  const [couponIssueDateHelperText, setCouponIssueDateHelperText] =
    useState("");

  const [couponExpiryDate, setCouponExpiryDate] = useState(null);
  const [couponExpiryDateError, setCouponExpiryDateError] = useState(false);
  const [couponExpiryDateHelperText, setCouponExpiryDateHelperText] =
    useState("");

  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPercentError, setDiscountPercentError] = useState(false);
  const [discountPercentHelperText, setDiscountPercentHelperText] =
    useState("");

  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxDiscountError, setMaxDiscountError] = useState(false);
  const [maxDiscountHelperText, setMaxDiscountHelperText] = useState("");

  const [minOrderValue, setMinOrderValue] = useState("");
  const [minOrderValueError, setMinOrderValueError] = useState(false);
  const [minOrderValueHelperText, setMinOrderValueHelperText] = useState("");

  const [userType, setUserType] = useState("");

  const [availDays, setAvailDays] = useState([
    { day: "Monday", status: false },
    { day: "Tuesday", status: false },
    { day: "Wednesday", status: false },
    { day: "Thursday", status: false },
    { day: "Friday", status: false },
    { day: "Saturday", status: false },
    { day: "Sunday", status: false },
  ]);
  const [userTypeError, setUserTypeError] = useState(false);
  const [userTypeHelperText, setUserTypeHelperText] = useState("");
  const [availDaysError, setAvailDaysError] = useState(false);
  const [availDaysHelperText, setAvailDaysHelperText] = useState("");

  const [showOutlets, setShowOutlets] = useState(false);

  const [couponsData, setCouponsData] = useState(null);
  const [couponDataStatus, setCouponDataStatus] = useState(false);
  const [isCouponDataFetching, setIsCouponDataFetching] = useState(false);

  const [couponDisable, setCouponDisable] = useState(false);

  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [couponId, setCouponId] = useState(null);

  const [resetStatus, setResetStatus] = useState(false);

  // validate chef fssai
  const validateCoupon = () => {
    let validationErrors = false;

    if (!coupon) {
      setCouponError(true);
      setCouponHelperText("Please enter Coupon code");
      validationErrors = true;
    }

    if (coupon && coupon.length < 6) {
      setCouponError(true);
      setCouponHelperText("Atleast enter six characters");
      validationErrors = true;
    }

    if (!couponIssueDate) {
      setCouponIssueDateError(true);
      setCouponIssueDateHelperText("Please enter coupon issue Date");
      validationErrors = true;
    }

    if (!couponExpiryDate) {
      setCouponExpiryDateError(true);
      setCouponExpiryDateHelperText("Please enter coupon expiry Date");
      validationErrors = true;
    }

    if (
      !!couponIssueDate &&
      !!couponExpiryDate &&
      couponIssueDate > couponExpiryDate
    ) {
      setCouponExpiryDateError(true);
      setCouponExpiryDateHelperText(
        "End Date cannot be smaller than start Date"
      );
      validationErrors = true;
    }
    if (!couponDisable) {
      if (
        !!couponIssueDate &&
        format(new Date(couponIssueDate), "yyyy-MM-dd") <
          format(new Date(), "yyyy-MM-dd")
      ) {
        setCouponIssueDateError(true);
        setCouponIssueDateHelperText("Start Date should today or future date");
        validationErrors = true;
      }
    }

    if (!discountPercent) {
      setDiscountPercentError(true);
      setDiscountPercentHelperText("Please enter discount percent");
      validationErrors = true;
    }

    if (discountPercent && (discountPercent <= 0 || discountPercent > 100)) {
      setDiscountPercentError(true);
      setDiscountPercentHelperText(
        "Discount percent more than 0 and less than 100"
      );
      validationErrors = true;
    }

    if (!maxDiscount) {
      setMaxDiscountError(true);
      setMaxDiscountHelperText("Please enter Max discount percent");
      validationErrors = true;
    }
    if (maxDiscount && (maxDiscount <= 0 || maxDiscount > 100)) {
      setMaxDiscountError(true);
      setMaxDiscountHelperText("Max Discount more than 0 and less than 100");
      validationErrors = true;
    }

    if (!minOrderValue) {
      setMinOrderValueError(true);
      setMinOrderValueHelperText("Please enter Minimum order value");
      validationErrors = true;
    }
    if (minOrderValue && minOrderValue <= 0) {
      setMinOrderValueError(true);
      setMinOrderValueHelperText("Minimum order value more than 0");
      validationErrors = true;
    }

    if (userType === "") {
      setUserTypeError(true);
      setUserTypeHelperText("Please select the user type");
      validationErrors = true;
    }

    if (!availDays.some((el) => el.status === true)) {
      setAvailDaysError(true);
      setAvailDaysHelperText("Please select the day");
      validationErrors = true;
    }

    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // add coupon
  const addChefCoupon = async () => {
    let couponVal = validateCoupon();
    if (couponVal) {
      let params = {
        couponCode: coupon,
        homeChefId: chefData?.homeChef.id,
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
        validFrom: format(new Date(couponIssueDate), "yyyy-MM-dd"),
        validTill: format(new Date(couponExpiryDate), "yyyy-MM-dd"),
        discountPercent: discountPercent,
        maxDiscountValue: maxDiscount,
        minOrderValue: minOrderValue,
        usersType: userType,
        availableDays: availDays
          .filter((el) => el.status === true)
          .map((el) => el.day)
          .join(","),
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.addChefCoupon,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success("Coupon added successfully");
          setIsCouponDrawerOpen(false);
          setCouponDataStatus(true);
          setResetStatus(true);
        } else if (response.data.responseCode === "HE014-5") {
          setCouponError(true);
          setCouponHelperText("Coupon code already exits");
        } else {
          alert(
            "Something went wrong while adding coupon. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while adding coupon. Please try again later!!"
        );
      }
    }
  };

  // add coupon
  const updateChefCoupon = async () => {
    let couponVal = validateCoupon();
    if (couponVal) {
      let params = {
        id: couponId,
        couponCode: coupon,
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
        validFrom: format(new Date(couponIssueDate), "yyyy-MM-dd"),
        validTill: format(new Date(couponExpiryDate), "yyyy-MM-dd"),
        discountPercent: discountPercent,
        maxDiscountValue: maxDiscount,
        minOrderValue: minOrderValue,
        usersType: userType,
        availableDays: availDays
          .filter((el) => el.status === true)
          .map((el) => el.day)
          .join(","),
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.updateChefCoupon,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success("Coupon  updated successfully");
          setIsCouponDrawerOpen(false);
          setCouponDataStatus(true);
          setResetStatus(true);
        } else {
          alert(
            "Something went wrong while updating coupon. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while updating coupon. Please try again later!!"
        );
      }
    }
  };

  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        if (cookies[config.preferencesCookie].outletData) {
          setShowOutlets(true);
          setCouponDataStatus(true);
        }
      } else if (userData?.user.roles.indexOf("Home Chef Owner") >= 0) {
        if (!chefData) {
          dispatch(
            getChef({ id: cookies[config.cookieName].loginUserId, cookies })
          );
        } else {
          setShowOutlets(false);
          setCouponDataStatus(true);
        }
      } else if (
        userData?.user.roles.indexOf("Outlet Manager") >= 0 ||
        userData?.user.roles.indexOf("Chef Manager") >= 0
      ) {
        setShowOutlets(false);
        setCouponDataStatus(true);
      } else {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      }
    }
  }, [chefData, dispatch, cookies, userData, navigate]);

  // On failure of chef data fetch
  useEffect(() => {
    if (chefError) {
      alert(
        "Something went wrong while fetching chef details. Please try again later!"
      );
    }
  }, [chefError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (chefLogout) {
      navigate("/logout");
    }
  }, [chefLogout, navigate]);

  // get Coupon
  useEffect(() => {
    const getChefCoupon = async () => {
      setIsCouponDataFetching(true);
      let params = {
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefCoupon,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCouponsData(response.data.chefCoupons);
          setIsCouponDataFetching(false);
        } else {
          alert(
            "Something went wrong while adding coupon. Please try again later!"
          );
          setIsCouponDataFetching(false);
        }
      } else {
        alert(
          "Something went wrong while adding coupon. Please try again later!!"
        );
        setIsCouponDataFetching(false);
      }
    };
    if (couponDataStatus) {
      setCouponDataStatus(false);
      getChefCoupon();
    }
  }, [couponDataStatus, cookies]);

  // reset status
  useEffect(() => {
    const resetStates = () => {
      setCouponId(null);
      setCoupon("");
      setCouponError(false);
      setCouponHelperText("");
      setCouponIssueDate(null);
      setCouponIssueDateError(false);
      setCouponIssueDateHelperText("");
      setCouponExpiryDate(null);
      setCouponExpiryDateError(false);
      setCouponExpiryDateHelperText("");
      setDiscountPercent("");
      setDiscountPercentError(false);
      setDiscountPercentHelperText("");
      setMaxDiscount("");
      setMaxDiscountError(false);
      setMaxDiscountHelperText("");
      setMinOrderValue("");
      setMinOrderValueError(false);
      setMinOrderValueHelperText("");
      setUserType("");
      setUserTypeError(false);
      setUserTypeHelperText("");
      setAvailDaysError(false);
      setAvailDaysHelperText("");
      setAvailDays([
        { day: "Monday", status: false },
        { day: "Tuesday", status: false },
        { day: "Wednesday", status: false },
        { day: "Thursday", status: false },
        { day: "Friday", status: false },
        { day: "Saturday", status: false },
        { day: "Sunday", status: false },
      ]);
      setCouponDisable(false);
    };
    if (resetStatus) {
      setResetStatus(false);
      resetStates();
    }
  }, [resetStatus]);

  return (
    <>
      <Header showOutlets={showOutlets} />
      <Card
        variant="outlined"
        sx={{
          width: "85%",
          margin: "auto",
          marginY: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            p: 3,
          }}
        >
          <Typography sx={{ textAlign: "center", width: "100%" }} variant="h6">
            Coupon Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>Coupon Details</Typography>
            <Button
              variant="contained"
              onClick={() => setIsCouponDrawerOpen(true)}
            >
              Add coupon
            </Button>
          </Box>
          {!isCouponDataFetching ? (
            <>
              {couponsData?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Coupon code</TableCell>
                        <TableCell align="left">Valid from</TableCell>
                        <TableCell align="left">Valid till</TableCell>
                        <TableCell align="left">Discount Percent</TableCell>
                        <TableCell align="left">
                          Maximum Discount Value
                        </TableCell>
                        <TableCell align="left">Minimum Order Value</TableCell>
                        <TableCell align="left">Edit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {couponsData?.map((row, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.couponCode}
                          </TableCell>
                          <TableCell align="left">
                            {format(new Date(row.validFrom), "dd-MMM-yyyy")}
                          </TableCell>
                          <TableCell align="left">
                            {format(new Date(row.validTill), "dd-MMM-yyyy")}
                          </TableCell>
                          <TableCell align="left">
                            {row.discountPercent}
                          </TableCell>
                          <TableCell align="left">
                            {row.maxDiscountValue}
                          </TableCell>
                          <TableCell align="left">
                            {row.minOrderValue}
                          </TableCell>
                          <TableCell align="left">
                            <Link
                              sx={{
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setCouponId(row.id);
                                setCoupon(row.couponCode);
                                setCouponIssueDate(row.validFrom);
                                setCouponExpiryDate(row.validTill);
                                setDiscountPercent(row.discountPercent);
                                setMaxDiscount(row.maxDiscountValue);
                                setMinOrderValue(row.minOrderValue);
                                setUserType(row.usersType);
                                setAvailDays([
                                  {
                                    day: "Monday",
                                    status:
                                      row.availableDays.includes("Monday"),
                                  },
                                  {
                                    day: "Tuesday",
                                    status:
                                      row.availableDays.includes("Tuesday"),
                                  },
                                  {
                                    day: "Wednesday",
                                    status:
                                      row.availableDays.includes("Wednesday"),
                                  },
                                  {
                                    day: "Thursday",
                                    status:
                                      row.availableDays.includes("Thursday"),
                                  },
                                  {
                                    day: "Friday",
                                    status:
                                      row.availableDays.includes("Friday"),
                                  },
                                  {
                                    day: "Saturday",
                                    status:
                                      row.availableDays.includes("Saturday"),
                                  },
                                  {
                                    day: "Sunday",
                                    status:
                                      row.availableDays.includes("Sunday"),
                                  },
                                ]);
                                setCouponDisable(true);
                                setIsCouponDrawerOpen(true);
                              }}
                            >
                              Edit
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="bodyparagraph">
                  No Coupon records found
                </Typography>
              )}
            </>
          ) : (
            <CircularProgress sx={{ margin: "auto" }} />
          )}
        </CardContent>
      </Card>
      {console.log(availDays)}
      {/* add/update fssai drawer */}
      <Drawer anchor="right" open={isCouponDrawerOpen}>
        <Card variant="outlined" sx={{ width: { xs: 400, sm: 500 }, m: 3 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "scroll",
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "center" }}>
              Coupon Details
            </Typography>
            {/* Coupon Management */}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                py: 2,
              }}
            >
              <TextField
                disabled={couponDisable}
                id="couponCode"
                label="Coupon Code *"
                value={coupon}
                variant="standard"
                onChange={(ev) => {
                  setCoupon(
                    ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  );
                  setCouponError(false);
                  setCouponHelperText("");
                }}
                inputProps={{
                  maxLength: 16,
                  style: { WebkitTextFillColor: "#2A3037" },
                }}
                error={couponError}
                helperText={couponHelperText}
                fullWidth
              />
              <Box sx={{ mt: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Validity From"
                    inputFormat="dd-MM-yyyy"
                    mask={"__-__-____"}
                    value={couponIssueDate}
                    onChange={(newValue) => {
                      setCouponIssueDate(newValue);
                      setCouponIssueDateError(false);
                      setCouponIssueDateHelperText("");
                    }}
                    inputProps={{ readOnly: true }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        error={couponIssueDateError}
                        helperText={couponIssueDateHelperText}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Validity upto"
                    inputFormat="dd-MM-yyyy"
                    value={couponExpiryDate}
                    mask={"__-__-____"}
                    onChange={(newValue) => {
                      setCouponExpiryDate(newValue);
                      setCouponExpiryDateError(false);
                      setCouponExpiryDateHelperText("");
                    }}
                    inputProps={{ readOnly: true }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        error={couponExpiryDateError}
                        helperText={couponExpiryDateHelperText}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>
              {/* User Type boxes */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <Typography>User Type</Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "row", gap: "10px" }}
                >
                  <Box
                    onClick={() => {
                      setUserType("New Users");
                      setUserTypeError(false);
                      setUserTypeHelperText("");
                    }}
                    sx={{
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "4px 5px",
                      gap: "6px",
                      width: "175px",
                      height: "55px",
                      border:
                        userType === "New Users"
                          ? "1px solid #FF774C"
                          : "1px solid #AAACAE",
                      borderRadius: "5px",
                      flex: "none",
                      order: "1",
                      flexGrow: "0",
                      cursor: "pointer",
                      background: userType === "New Users" && "#FFEFE9",
                    }}
                  >
                    <Box
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "4px 5px",
                        gap: "6px",
                        width: "175px",
                        height: "55px",
                        color: userType === "New Users" ? "#FF774C" : "#2A3037",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography variant="bodybold">New Users</Typography>
                    </Box>
                  </Box>

                  <Box
                    onClick={() => {
                      setUserType("All Users");
                      setUserTypeError(false);
                      setUserTypeHelperText("");
                    }}
                    sx={{
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "4px 5px",
                      gap: "6px",
                      width: "175px",
                      height: "55px",
                      border:
                        userType === "All Users"
                          ? "1px solid #FF774C"
                          : "1px solid #AAACAE",
                      borderRadius: "5px",
                      flex: "none",
                      order: "1",
                      flexGrow: "0",
                      cursor: "pointer",
                      background: userType === "All Users" && "#FFEFE9",
                    }}
                  >
                    <Box
                      sx={{
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "4px 5px",
                        gap: "6px",
                        width: "175px",
                        height: "55px",
                        color: userType === "All Users" ? "#FF774C" : "#2A3037",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography variant="bodybold">All Users</Typography>
                    </Box>
                  </Box>
                </Box>
                {userTypeError && (
                  <Typography variant="bodymetatag" color="#F44336">
                    {userTypeHelperText}
                  </Typography>
                )}
              </Box>

              <TextField
                id="discountPercent"
                label="Discount Percent*"
                value={discountPercent}
                variant="standard"
                onChange={(ev) => {
                  setDiscountPercent(ev.target.value.replace(/\D/, ""));
                  setDiscountPercentError(false);
                  setDiscountPercentHelperText("");
                }}
                inputProps={{
                  maxLength: 3,
                }}
                error={discountPercentError}
                helperText={discountPercentHelperText}
                fullWidth
              />
              <TextField
                id="maxDiscount"
                label="Max Discount Value*"
                value={maxDiscount}
                variant="standard"
                onChange={(ev) => {
                  setMaxDiscount(ev.target.value.replace(/\D/, ""));
                  setMaxDiscountError(false);
                  setMaxDiscountHelperText("");
                }}
                inputProps={{
                  maxLength: 3,
                }}
                error={maxDiscountError}
                helperText={maxDiscountHelperText}
                fullWidth
              />
              <TextField
                id="minOrderValue"
                label="Minimum Order Value*"
                value={minOrderValue}
                variant="standard"
                onChange={(ev) => {
                  setMinOrderValue(ev.target.value.replace(/\D/, ""));
                  setMinOrderValueError(false);
                  setMinOrderValueHelperText("");
                }}
                inputProps={{
                  maxLength: 5,
                }}
                error={minOrderValueError}
                helperText={minOrderValueHelperText}
                fullWidth
              />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <Typography>Available Days</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  {availDays.map((el, idx) => (
                    <Box
                      key={idx}
                      onClick={() => {
                        let copy = [...availDays];
                        copy[idx].status = !copy[idx].status;
                        setAvailDays(copy);
                        setAvailDaysError(false);
                        setAvailDaysHelperText("");
                      }}
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
                        border: availDays[idx].status
                          ? "1px solid #FF774C"
                          : "1px solid #AAACAE",
                        borderRadius: "5px",
                        flex: "none",
                        order: "1",
                        flexGrow: "0",
                        cursor: "pointer",
                        background: availDays[idx].status && "#FFEFE9",
                      }}
                    >
                      <Box
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
                          color: availDays[idx].status ? "#FF774C" : "#2A3037",
                          borderRadius: "5px",
                        }}
                      >
                        <Typography variant="bodybold">
                          {el.day.slice(0, 3)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                {availDaysError && (
                  <Typography variant="bodymetatag" color="#F44336">
                    {availDaysHelperText}
                  </Typography>
                )}
              </Box>
              <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setResetStatus(true);
                    setIsCouponDrawerOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={couponDisable ? updateChefCoupon : addChefCoupon}
                >
                  Submit
                </Button>
              </CardActions>
            </Box>
          </CardContent>
        </Card>
      </Drawer>
    </>
  );
};

export default ChefCouponManagement;
