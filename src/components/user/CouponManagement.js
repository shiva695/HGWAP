import React, { useState, useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Drawer,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useCookies } from "react-cookie";
import { config } from "../../config/config";
import { apiList, invokeApi } from "../../services/apiServices";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Header from "../general-components/ui-components/Header";
import { useSelector } from "react-redux";

import { format } from "date-fns";

const CouponManagement = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeError, setCouponCodeError] = useState(false);
  const [couponCodeHelperText, setCouponCodeHelperText] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [amountHelperText, setAmountHelperText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [fromDateError, setFromDateError] = useState(false);
  const [fromDateHelperText, setFromDateHelperText] = useState("");
  const [toDate, setToDate] = useState("");
  const [toDateError, setToDateError] = useState(false);
  const [toDateHelperText, setToDateHelperText] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetError, setBudgetError] = useState(false);
  const [budgetHelperText, setBudgetHelperText] = useState("");

  const [couponsData, setCouponsData] = useState(null);
  const [invokeGetCoupons, setInvokeGetCoupons] = useState(false);

  const [isDrawerAddCouponOpen, setIsDrawerAddCouponOpen] = useState(false);
  const [isAddingCouponFetching, setIsAddingCouponFetching] = useState(false);
  const [isCouponDataFetching, setIsCouponDataFetching] = useState(false);

  // handle update cuisien
  const addCouponCode = async () => {
    let validationErrors = false;
    if (couponCode === "") {
      setCouponCodeError(true);
      setCouponCodeHelperText("Please enter a coupon code");
      validationErrors = true;
    }
    if (amount === "") {
      setAmountError(true);
      setAmountHelperText("Please enter a amount");
      validationErrors = true;
    }

    if (budget === "") {
      setBudgetError(true);
      setBudgetHelperText("Please enter a budget");
      validationErrors = true;
    }

    if (!fromDate) {
      setFromDateError(true);
      setFromDateHelperText("Please enter coupon issue Date");
      validationErrors = true;
    }

    if (!toDate) {
      setToDateError(true);
      setToDateHelperText("Please enter coupon expiry Date");
      validationErrors = true;
    }
    if (!!toDate && toDate <= new Date()) {
      setToDateError(true);
      setToDateHelperText("Validity Upto Date must be a future date");
      validationErrors = true;
    }

    if (!!fromDate && !!toDate && fromDate > toDate) {
      setFromDateError(true);
      setFromDateHelperText(
        "Validity From Date cannot be greater than Validity Upto Date"
      );
      validationErrors = true;
    }
    if (!validationErrors) {
      // calling api here
      setIsAddingCouponFetching(true);
      let issueDateFormatted = format(new Date(fromDate), "yyyy-MM-dd");
      let expiryDateFormatted = format(new Date(toDate), "yyyy-MM-dd");
      let params = {
        couponCode,
        validFrom: issueDateFormatted,
        validTill: expiryDateFormatted,
        amount,
        budget,
      };

      let response = await invokeApi(
        config.apiDomains.userService + apiList.createCoupon,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success("Coupon added successfully");
          setCouponCode("");
          setCouponCodeError(false);
          setCouponCodeHelperText("");
          setAmount("");
          setAmountError(false);
          setAmountHelperText("");
          setFromDate("");
          setFromDateError(false);
          setFromDateHelperText("");
          setToDate("");
          setToDateError(false);
          setBudget("");
          setBudgetError(false);
          setBudgetHelperText("");
          setInvokeGetCoupons(true);
          setIsAddingCouponFetching(false);
          setIsDrawerAddCouponOpen(false);
        } else {
          alert(
            "Something went wrong while adding coupon. Please try again later!"
          );
          setIsAddingCouponFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong  while adding coupon. Please try again later!!"
        );
        setIsAddingCouponFetching(false);
      }
    }
  };

  //check user roles having "Admin"
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Admin") === -1) {
        navigate("/");
      } else {
        setInvokeGetCoupons(true);
      }
    }
  }, [navigate, userData]);

  useEffect(() => {
    const getCoupons = async () => {
      setIsCouponDataFetching(true);
      let params = {};
      let response = await invokeApi(
        config.apiDomains.userService + apiList.getCoupons,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCouponsData(response.data.coupons);
          setIsCouponDataFetching(false);
        } else {
          alert(
            "Something went wrong while get coupon. Please try again later!"
          );
          setIsCouponDataFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong  while get coupon. Please try again later!!"
        );
        setIsCouponDataFetching(false);
      }
    };
    if (invokeGetCoupons) {
      setInvokeGetCoupons(false);
      getCoupons();
    }
  }, [invokeGetCoupons, cookies, navigate]);

  return (
    <>
      <Header />
      <Card
        variant="outlined"
        sx={{
          width: { xs: "80%", md: "750px" },
          margin: "auto",
          marginY: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 3,
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
            <Link underline="hover" component={RouterLink} to="/dashboard">
              Dashboard
            </Link>
            <Typography color="inherit"> Coupon Management</Typography>
          </Breadcrumbs>
          <Typography variant="header2" sx={{ textAlign: "center" }}>
            Coupon Management
          </Typography>
          <Box>
            <Button
              onClick={() => setIsDrawerAddCouponOpen(true)}
              variant="contained"
              sx={{ my: 3, float: "right" }}
            >
              Add Coupon
            </Button>
          </Box>
          {!isCouponDataFetching ? (
            <>
              {couponsData?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 650 }}
                    size="small"
                    aria-label="a dense table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Coupon code</TableCell>
                        <TableCell align="left">Amount</TableCell>
                        <TableCell align="left">Valid from</TableCell>
                        <TableCell align="left">Valid till</TableCell>
                        <TableCell align="left">Budget</TableCell>
                        <TableCell align="left">Utilized</TableCell>
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
                          <TableCell align="left">{row.amount}</TableCell>
                          <TableCell align="left">
                            {format(new Date(row.validFrom), "dd-MMM-yyyy")}
                          </TableCell>
                          <TableCell align="left">
                            {format(new Date(row.validTill), "dd-MMM-yyyy")}
                          </TableCell>
                          <TableCell align="left">{row.budget}</TableCell>
                          <TableCell align="left">{row.utilized}</TableCell>
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

      {/* Add Coupon Drawer  */}
      <Drawer
        anchor="right"
        open={isDrawerAddCouponOpen}
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
            <Typography variant="header4">Add Coupon</Typography>
            {/* Cancel icon */}
            <Box
              onClick={() => {
                setCouponCode("");
                setCouponCodeError(false);
                setCouponCodeHelperText("");
                setAmount("");
                setAmountError(false);
                setAmountHelperText("");
                setFromDate("");
                setFromDateError(false);
                setFromDateHelperText("");
                setToDate("");
                setToDateError(false);
                setToDateHelperText("");
                setBudget("");
                setBudgetError(false);
                setBudgetHelperText("");
                setIsDrawerAddCouponOpen(false);
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
          <TextField
            id="couponcode"
            label="Coupon Code *"
            value={couponCode}
            variant="standard"
            onChange={(ev) => {
              setCouponCode(
                ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
              );
              setCouponCodeError(false);
              setCouponCodeHelperText("");
            }}
            inputProps={{ maxLength: 15 }}
            error={couponCodeError}
            helperText={couponCodeHelperText}
            fullWidth
          />

          <TextField
            id="amount"
            label="Amount *"
            value={amount}
            variant="standard"
            onChange={(ev) => {
              setAmount(ev.target.value.replace(/\D/, ""));
              setAmountError(false);
              setAmountHelperText("");
            }}
            inputProps={{ maxLength: 4 }}
            error={amountError}
            helperText={amountHelperText}
            fullWidth
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "0px",
              gap: "27px",
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Validity From *"
                inputFormat="dd-MM-yyyy"
                mask={"__-__-____"}
                value={fromDate}
                onChange={(newValue) => {
                  setFromDate(newValue);
                  setFromDateError(false);
                  setFromDateHelperText("");
                }}
                inputProps={{ readOnly: true }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    error={fromDateError}
                    helperText={fromDateHelperText}
                  />
                )}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Validity Till *"
                inputFormat="dd-MM-yyyy"
                value={toDate}
                mask={"__-__-____"}
                onChange={(newValue) => {
                  setToDate(newValue);
                  setToDateError(false);
                  setToDateHelperText("");
                }}
                inputProps={{ readOnly: true }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    error={toDateError}
                    helperText={toDateHelperText}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>

          <TextField
            id="budget"
            label="Budget *"
            value={budget}
            variant="standard"
            onChange={(ev) => {
              setBudget(ev.target.value.replace(/\D/, ""));
              setBudgetError(false);
              setBudgetHelperText("");
            }}
            inputProps={{ maxLength: 6 }}
            error={budgetError}
            helperText={budgetHelperText}
            fullWidth
          />

          <CardActions
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              mt: 2,
              gap: "16px",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setCouponCode("");
                setCouponCodeError(false);
                setCouponCodeHelperText("");
                setAmount("");
                setAmountError(false);
                setAmountHelperText("");
                setFromDate("");
                setFromDateError(false);
                setFromDateHelperText("");
                setToDate("");
                setToDateError(false);
                setToDateHelperText("");
                setBudget("");
                setBudgetError(false);
                setBudgetHelperText("");
                setIsDrawerAddCouponOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isAddingCouponFetching}
              onClick={addCouponCode}
            >
              Submit
              {isAddingCouponFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </CardActions>
        </Box>
      </Drawer>
    </>
  );
};

export default CouponManagement;
