import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { getUser } from "../../../global/redux/actions";
import { apiList, invokeApi } from "../../../services/apiServices";
import { mobileNoValidation, otpValidation } from "../../../common/common";
// import OtpInput from "react-otp-input";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies([config.cookieName]);

  const globalState = useSelector((state) => state);
  const {
    isFetching: isUserDataFetching,
    userData,
    userError,
  } = globalState.userReducer;

  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoError, setMobileNoError] = useState(false);
  const [mobileHelperText, setMobileHelperText] = useState("");
  const [isSendOtpFetching, setIsSendOtpFetching] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpHelperText, setOtpHelperText] = useState("");
  const [isLoginFetching, setIsLoginFetching] = useState(false);

  const countdownTime = 59;
  const [countdownSeconds, setCountdownSeconds] = useState(countdownTime);
  const otpValidate = otpValidation(otp);
  const mobileNoValidate = mobileNoValidation(mobileNo);

  const handleSendOTP = async (ev) => {
    ev.preventDefault();
    if (mobileNoValidate) {
      setIsSendOtpFetching(true);

      let params = { countryCode: "+91", mobileNumber: mobileNo };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.sendOtp,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setShowMobileInput(false);
          setIsSendOtpFetching(false);
          setCountdownSeconds(countdownTime);
        } else {
          alert(
            "Something went wrong while sending OTP. Please try again later!"
          );
          setIsSendOtpFetching(false);
        }
      } else {
        alert(
          "Something went wrong while sending OTP. Please try again later!!"
        );
        setIsSendOtpFetching(false);
      }
    } else {
      setMobileNoError(true);
      setMobileHelperText("Please enter a valid mobile number");
    }
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (otpValidate) {
      setIsLoginFetching(true);
      let params = { countryCode: "+91", mobileNumber: mobileNo, otp: otp };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.userLogin,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCookie(
            config.cookieName,
            JSON.stringify({
              token: response.data.token,
              loginUserId: response.data.userId,
            }),
            { path: "/", maxAge: 3000000, sameSite: "strict" }
          );
          setIsLoginFetching(false);
        } else if (response.data.responseCode === "HE001") {
          setOtpHelperText("Invalid OTP. Please enter correct OTP.");
          setIsLoginFetching(false);
        } else {
          alert("Something went wrong while login. Please try again later!");
          setIsLoginFetching(false);
        }
      } else {
        alert("Something went wrong while login. Please try again later!!");
        setIsLoginFetching(false);
      }
    } else {
      setOtpHelperText("Please enter a valid OTP");
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Login";
  }, []);

  // On load, check if user is already logged-in.
  // Will also be called, on login success and on get user api call success.
  useEffect(() => {
    if (
      !!cookies[config.cookieName] &&
      !!cookies[config.cookieName].token &&
      !!cookies[config.cookieName].loginUserId
    ) {
      // if get user api success
      if (userData?.responseCode === "200") {
        // if user already has profile data filled
        if (userData.user.fullName) {
          // if user was auto-redirected to login page while accessing protected route
          if (!!location.state?.redirectTo) {
            // then navigate back to previous route
            navigate(location.state.redirectTo);
          } else {
            // else go to home page
            navigate("/");
          }
        }
        // if not, go to create profile page
        else {
          // pass on the previous route if auto-redirected
          if (!!location.state?.redirectTo) {
            navigate("/create-profile", {
              state: { redirectTo: location.state.redirectTo },
            });
          } else {
            navigate("/create-profile");
          }
        }
      }
      // if no info about user data, call get user api
      else {
        dispatch(
          getUser({
            id: cookies[config.cookieName].loginUserId,
            cookies: cookies,
          })
        );
      }
    }
  }, [cookies, userData, navigate, dispatch, location]);

  // On error when get user api is called
  useEffect(() => {
    if (userError) {
      alert(
        "Something went wrong while fetching user details. Please try again later!"
      );
    }
  }, [userError]);

  // when showMobileInput is set to true, start the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!showMobileInput) {
        setCountdownSeconds(countdownSeconds - 1);
      }
    }, 1000);

    if (countdownSeconds <= 0) {
      clearInterval(timer);
      return;
    }

    return () => clearInterval(timer);
  }, [showMobileInput, countdownSeconds]);

  return (
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
        <Box
          component="img"
          src="logo192.png"
          alt="logo"
          sx={{ width: 80, display: "block", marginX: "auto" }}
        />

        <Typography variant="h4" sx={{ textAlign: "center", marginY: 3 }}>
          Login / Signup
        </Typography>

        {showMobileInput ? (
          <form onSubmit={handleSendOTP}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* number input and button */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "20px",
                  flexWrap: "wrap",
                  mx: 2,
                }}
              >
                {/* Mobile input field */}
                <TextField
                  autoFocus={true}
                  sx={{
                    fontWeight: "400",
                    fontSize: "16px",
                    lineHeight: "150%",
                    "& fieldset": {
                      border: "1px solid #AAACAE",
                      borderRadius: "15px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        border: !mobileNoValidate
                          ? "1px solid #AAACAE"
                          : "1px solid #0B735F",
                      },
                    },
                    "& .MuiInputAdornment-root": {
                      mr: "0px",
                    },
                    "& .MuiOutlinedInput-input": {
                      width: "123px",
                    },
                  }}
                  placeholder="Phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <>
                          {/* flag and country code */}
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
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/india-flag.svg"
                            />
                            <Typography
                              variant="bodyparagraph"
                              sx={{
                                color: "text.primary",
                              }}
                            >
                              +91
                            </Typography>
                          </Box>
                          {/* vertical line */}
                          <Box
                            sx={{
                              width: "26px",
                              height: "0px",
                              border: "0.5px solid #AAACAE",
                              transform: "rotate(90deg)",
                            }}
                          />
                        </>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <>
                          {/* green-tick */}
                          {mobileNoValidate ? (
                            <Box
                              component="img"
                              sx={{
                                width: "21px",
                                height: "21px",
                              }}
                              src="/media/svg/tick-circled-green.svg"
                            />
                          ) : (
                            <Box
                              sx={{
                                width: "21px",
                                height: "21px",
                              }}
                            />
                          )}
                        </>
                      </InputAdornment>
                    ),
                  }}
                  value={mobileNo}
                  onChange={(ev) => {
                    setMobileNo(ev.target.value.replace(/\D/, ""));
                    setMobileNoError(false);
                    setMobileHelperText("");
                  }}
                  inputProps={{ maxLength: 10 }}
                  error={mobileNoError}
                  helperText={
                    <Box component={"span"}>
                      {mobileNoError && (
                        <Box
                          component={"span"}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            mt: 1,
                          }}
                        >
                          <Box
                            component="img"
                            sx={{
                              width: "18px",
                              height: "18px",
                              mr: 1,
                            }}
                            src="/media/svg/error-exclaim.svg"
                          />
                          {mobileHelperText}
                        </Box>
                      )}
                    </Box>
                  }
                />

                {/* login Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "0px",
                    gap: "24px",
                    cursor: "pointer",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={mobileNo.length < 10 || isSendOtpFetching}
                    sx={{ width: "149px" }}
                  >
                    Login
                    {isSendOtpFetching && (
                      <CircularProgress
                        size={24}
                        sx={{ ml: 2, color: "text.secondary" }}
                      />
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodyregular"
                sx={{ textAlign: "center", mb: 1 }}
              >
                OTP has been sent to +91 {mobileNo}
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => {
                      setShowMobileInput(true);
                      setOtp("");
                      setOtpHelperText("");
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>

              {/* input for otp div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0px",
                  gap: "11px",
                  flexWrap: "wrap",
                  mx: 2,
                }}
              >
                {/* <OtpInput
                  numInputs={6}
                  inputStyle={{
                    width: "30px",
                    height: "35px",
                    marginRight: "9px",
                    borderRadius: "15px",
                    border: "1px solid #AAACAE",
                    // TODO :: need to implement backgroud color
                  }}
                  focusStyle={{
                    outline: "none",
                  }}
                  isInputNum={true}
                  shouldAutoFocus={true}
                  value={otp}
                  onChange={(otp) => {
                    setOtp(otp);
                    setOtpHelperText("");
                  }}
                /> */}
                <TextField
                  autoFocus={true}
                  autoComplete="off"
                  sx={{
                    "& fieldset": {
                      border: "1px solid #AAACAE",
                      borderRadius: "15px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        border: !!otpHelperText
                          ? "1px solid #F44336"
                          : !otpValidate
                          ? "1px solid #AAACAE"
                          : "1px solid #0B735F",
                      },
                    },
                    "& input::placeholder": {
                      letterSpacing: "0px",
                    },
                  }}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(ev) => {
                    setOtp(ev.target.value.replace(/\D/, ""));
                    setOtpHelperText("");
                  }}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontWeight: 700,
                      letterSpacing: "10px",
                    },
                  }}
                />
                <Typography
                  variant="bodyparagraph"
                  sx={{ textAlign: "center" }}
                  color="error"
                >
                  {otpHelperText}
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={!otpValidate || isLoginFetching || isUserDataFetching}
                sx={{ marginY: 2 }}
              >
                Proceed
                {isLoginFetching || isUserDataFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>

              {!countdownSeconds ? (
                <Typography
                  variant="bodybold"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={handleSendOTP}
                >
                  Resend OTP
                </Typography>
              ) : (
                <Typography
                  variant="bodybold"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Resend OTP in {countdownSeconds} seconds
                </Typography>
              )}
            </Box>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
