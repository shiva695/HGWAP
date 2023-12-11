import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  getCart,
  getUser,
  loginDrawer,
  getOutlets,
} from "../../../global/redux/actions";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { v4 as uuidv4 } from "uuid";
// import OtpInput from "react-otp-input";
import { mobileNoValidation, otpValidation } from "../../../common/common";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
// import moment from "moment";
import { format } from "date-fns";

// left arrow for cuisine slider;
const LeftArrow = () => {
  const {
    getPrevElement,
    isFirstItemVisible,
    scrollToItem,
    visibleElements,
    initComplete,
  } = useContext(VisibilityContext);

  const [disabled, setDisabled] = useState(
    !initComplete || (initComplete && isFirstItemVisible)
  );

  useEffect(() => {
    // NOTE: detect if whole component visible
    if (visibleElements.length) {
      setDisabled(isFirstItemVisible);
    }
  }, [isFirstItemVisible, visibleElements]);

  const clickHandler = () => scrollToItem(getPrevElement(), "smooth", "center");

  return (
    <Box
      onClick={clickHandler}
      component={"img"}
      sx={{
        position: "absolute",
        left: "10px",
        bottom: "0px",
        top: "0px",
        marginBottom: "auto",
        marginTop: "auto",
        height: "44px",
        width: "44px",
        cursor: "pointer",
        zIndex: 1,
        opacity: disabled ? "0" : "1",
      }}
      src="/media/svg/back-arrow-circled-filled-white.svg"
    />
  );
};

// right arrow for cuisine slider;
const RightArrow = () => {
  const { getNextElement, isLastItemVisible, scrollToItem, visibleElements } =
    useContext(VisibilityContext);

  const [disabled, setDisabled] = useState(
    !visibleElements.length && isLastItemVisible
  );

  useEffect(() => {
    if (visibleElements.length) {
      setDisabled(isLastItemVisible);
    }
  }, [isLastItemVisible, visibleElements]);

  const clickHandler = () => scrollToItem(getNextElement(), "smooth", "center");

  return (
    <Box
      onClick={clickHandler}
      component={"img"}
      sx={{
        position: "absolute",
        right: "10px",
        bottom: "0px",
        top: "0px",
        marginBottom: "auto",
        marginTop: "auto",
        height: "44px",
        width: "44px",
        cursor: "pointer",
        opacity: disabled ? "0" : "1",
      }}
      src="/media/svg/forward-arrow-circled-filled-white.svg"
    />
  );
};

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

const Header = ({
  showAddress,
  showPreferences,
  showCuisines,
  showOutlets,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies();
  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;
  const { loginState } = globalState.loginDrawerReducer;
  const { cartData } = globalState.cartReducer;
  const {
    isFetching: isOutletsDataFetching,
    outletsData,
    outletsError,
  } = globalState.outletsReducer;

  const [firstLoad, setFirstLoad] = useState(true);

  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    latitude: null,
    longitude: null,
  });
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isAddressFetching, setIsAddressFetching] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [fetchPrimaryAddress, setFetchPrimaryAddress] = useState(true);
  const [checkProfile, setCheckProfile] = useState(false);

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openDashboardMenu, setOpenDashboardMenu] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOutletsModalOpen, setIsOutletsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [invokeDrawerOpen, setInvokeDrawerOpen] = useState(false);

  const [invokeCookies, setInvokeCookies] = useState(false);

  const [orderType, setOrderType] = useState("instant");
  // Pre-order states
  const [preorderSelected, setPreorderSelected] = useState(true);
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  const [preOrderWeek, setPreOrderWeek] = useState([]);
  // const [preorderSlots, setPreorderSlots] = useState(null);
  const [preorderDayName, setPreorderDayName] = useState(null);
  const [preorderDayNameNA, setPreorderDayNameNA] = useState(null);
  // const [slot, setSlot] = useState("");
  // const [slotNA, setSlotNA] = useState("");
  // const [slotId, setSlotId] = useState(null);
  // const [preorderDay, setPreorderDay] = useState(null);

  // Filter
  // chef type
  const [homeChefChecked, setHomeChefChecked] = useState(false);
  const [homeChefCheckedNA, setHomeChefCheckedNA] = useState(false);
  const [cloudKitchenChecked, setCloudKitchenChecked] = useState(false);
  const [cloudKitchenCheckedNA, setCloudKitchenCheckedNA] = useState(false);

  //  veg / Non-veg  level states
  const [vegNonVegCheck, setVegNonVegCheck] = useState(null);
  const [vegNonVegCheckNA, setVegNonVegCheckNA] = useState(null);
  const [nonVegTypes, setNonVegTypes] = useState([
    { name: "Egg", checked: false },
    { name: "Chicken", checked: false },
    { name: "Mutton", checked: false },
    { name: "Sea Food", checked: false },
  ]);
  const [nonVegTypesNA, setNonVegTypesNA] = useState([]);

  const [cuisinesData, setCuisinesData] = useState([]);
  const [cuisinesDataNA, setCuisinesDataNA] = useState([]);

  //  Spice level states
  const [spiceLevels, setSpiceLevels] = useState([
    { name: "Mild", checked: false },
    { name: "Medium", checked: false },
    { name: "Hot", checked: false },
  ]);
  const [spiceLevelsNA, setSpiceLevelsNA] = useState([]);

  const [ratingFourPlus, setRatingFourPlus] = useState(false);
  const [ratingFourPlusNA, setRatingFourPlusNA] = useState(false);

  const [ratingThreePlus, setRatingThreePlus] = useState(false);
  const [ratingThreePlusNA, setRatingThreePlusNA] = useState(false);

  // price range
  const [minimumPrice, setMinimumPrice] = useState("");
  const [minimumPriceNA, setMinimumPriceNA] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [maximumPriceNA, setMaximumPriceNA] = useState("");

  const [filtersApplied, setFiltersApplied] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchSuggestionData, setSearchSuggestionData] = useState([]);
  // const [invokeSearchSuggestion, setInvokeSearchSuggestion] = useState(false);

  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoError, setMobileNoError] = useState(false);
  const [mobileHelperText, setMobileHelperText] = useState("");
  const [isSendOtpFetching, setIsSendOtpFetching] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(true);

  const [otpValidError, setOtpValidError] = useState(false);
  const [otpHelperText, setOtpHelperText] = useState("");
  const [isLoginFetching, setIsLoginFetching] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isResendOtpClicked, setIsResendOtpClicked] = useState(false);

  const countdownTime = 59;
  const [countdownSeconds, setCountdownSeconds] = useState(countdownTime);
  const mobileNoValidate = mobileNoValidation(mobileNo);
  const otpValidate = otpValidation(otpValue);

  const [cartQuantity, setCartQuantity] = useState(0);

  const [deliverySlotsToday, setDeliverySlotsToday] = useState([
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
  ]);

  const [deliverySlotIndex, setDeliverySlotIndex] = useState(0);
  const [triggerDeliverySlot, setTriggerDeliverSlot] = useState(false);

  const [deliverySlotTimeNA, setDeliverySlotTimeNA] = useState(null);

  useEffect(() => {
    const formatAMPM = () => {
      let copy = JSON.parse(JSON.stringify(deliverySlotsToday));

      let hours = new Date().getHours();
      let ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      let currentTime = hours + ampm;

      // if preordering for today, remove the passed timings (also current hour and next hour)
      if (preorderDayNameNA?.split(",")[2] === format(new Date(), "dd")) {
        for (let i = 0; i < copy.length; i++) {
          if (copy[i].split(" ")[0] === currentTime) {
            copy.splice(0, i + 2);
            setDeliverySlotsToday(copy);
            setDeliverySlotIndex(0);
            setDeliverySlotTimeNA(copy[0]);
            break;
          }
        }
        setDeliverySlotIndex(0);
        setDeliverySlotTimeNA(copy[0]);
      }

      // set the index of delivery slot that matches with current time
      if (preorderDayNameNA?.split(",")[2] !== format(new Date(), "dd")) {
        for (let i = 0; i < deliverySlots.length; i++) {
          const item = deliverySlots[i];
          if (item.split(" ")[0] === currentTime) {
            setDeliverySlotIndex(i);
            setDeliverySlotTimeNA(deliverySlots[i]);
            break;
          }
        }
      }
    };
    if (triggerDeliverySlot) {
      setTriggerDeliverSlot(false);
      formatAMPM();
    }
  }, [preorderDayNameNA, deliverySlotsToday, triggerDeliverySlot]);

  const [deliverySlotTime, setDeliverySlotTime] = useState("12am - 1am");

  // handle veg / non-veg
  const handleChangeNonVeg = (idx) => {
    let copy = JSON.parse(JSON.stringify(nonVegTypesNA));
    copy[idx].checked = !copy[idx].checked;
    setNonVegTypesNA(copy);
  };

  // clear all cuisine selections
  const clearCuisineChecked = () => {
    let copy = JSON.parse(JSON.stringify(cuisinesDataNA));
    copy.map((el) => (el.checked = false));
    setCuisinesDataNA(copy);
  };

  // handle cuisine change
  const handleChangeCuisine = (idx) => {
    let copy = JSON.parse(JSON.stringify(cuisinesDataNA));
    copy[idx].checked = !copy[idx].checked;
    setCuisinesDataNA(copy);
  };

  // handle spice level change
  const handleChangeSpiceLevel = (idx) => {
    let copy = JSON.parse(JSON.stringify(spiceLevelsNA));
    copy[idx].checked = !copy[idx].checked;
    setSpiceLevelsNA(copy);
  };

  // single cusine select handler
  const handleSingleCuisineSelected = (idx) => {
    let copy = JSON.parse(JSON.stringify(cuisinesData));
    copy.map((el) => (el.checked = false));
    copy[idx].checked = true;
    setCuisinesData(copy);
    setInvokeCookies(true);
  };

  // single cusine remove handler
  const handleSingleCuisineRemoved = (idx) => {
    let copy = JSON.parse(JSON.stringify(cuisinesData));
    copy[idx].checked = false;
    setCuisinesData(copy);
    setInvokeCookies(true);
  };

  // handle send otp
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

  // handle login
  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (otpValidate) {
      setIsLoginFetching(true);
      let params = {
        countryCode: "+91",
        mobileNumber: mobileNo,
        otp: otpValue,
      };
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
          dispatch(loginDrawer(false));
          setIsLoginFetching(false);
          setFetchPrimaryAddress(true);
          setCheckProfile(true);
        } else if (response.data.responseCode === "HE001") {
          setIsResendOtpClicked(false);
          setOtpValidError(true);
          setOtpHelperText("Invalid OTP");
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
      setOtpValidError(true);
      setOtpHelperText("Please enter a valid OTP");
    }
  };

  // if header icon is not their showing letter Icon
  const stringToColor = (string) => {
    if (userData?.user.fullName) {
      let hash = 0;
      let i;
      for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
      }
      return color;
    }
  };

  const stringAvatar = (name) => {
    if (userData?.user.fullName) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: `${name.split(" ")[0][0]}`,
      };
    }
  };

  // Debouncing for autocomplete
  const debounce = (func) => {
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 500);
    };
  };

  // search suggestions
  const searchSuggestion = async (text) => {
    let params = {
      keyword: text,
      city: cookies[config.preferencesCookie]?.deliveryAddress?.city,
      state: cookies[config.preferencesCookie]?.deliveryAddress?.state,
    };
    let response = await invokeApi(
      config.apiDomains.orderService + apiList.getSearchSuggestions,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        let removeDup = response.data.searchSuggestions.reduce((arr, obj) => {
          if (!arr.some((el) => el.name === obj.name && el.type === obj.type)) {
            arr.push(obj);
          }
          return arr;
        }, []);

        setSearchSuggestionData(removeDup);
      } else {
        alert(
          "Something went wrong while fetching search suggestions. Please try again later!"
        );
      }
    } else {
      alert(
        "Something went wrong while fetching search suggestions. Please try again later!!"
      );
    }
  };

  // eslint-disable-next-line
  const getSearchSuggestions = useCallback(debounce(searchSuggestion), [
    cookies,
  ]);

  // setting cartquantity
  useEffect(() => {
    setCartQuantity(
      cartData
        ?.map((el) => el.foodItems.map((el) => el.quantity))
        .flat(1)
        .reduce((sum, val) => sum + val, 0)
    );
  }, [cartData]);

  // Applying conditional data to state variables on first time load
  useEffect(() => {
    const getCuisines = async () => {
      let params = { status: "Active" };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getCuisines,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let cuisinesList = response.data.cuisines;
          cuisinesList.forEach((el) => {
            el.checked =
              cookies[
                config.preferencesCookie
              ]?.filterData?.cuisinesData?.includes(el.id) ?? false;
          });
          setCuisinesData(cuisinesList);
        } else {
          alert(
            "Something went wrong while fetching cuisines. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching cuisines. Please try again later!!"
        );
      }
    };

    if (firstLoad) {
      setFirstLoad(false);
      getCuisines();

      setOrderType(cookies[config.preferencesCookie]?.orderType ?? "instant");

      if (!!cookies[config.preferencesCookie]?.preorderData?.preorderDayName) {
        setPreorderDayName(
          cookies[config.preferencesCookie].preorderData.preorderDayName
        );
        // setPreorderDay(
        //   cookies[config.preferencesCookie].preorderData.preorderDayName.split(
        //     ","
        //   )[0]
        // );
      }

      setDeliveryAddress(
        cookies[config.preferencesCookie]?.deliveryAddress ?? null
      );

      setHomeChefChecked(
        cookies[config.preferencesCookie]?.filterData?.chefType === "homeChef"
          ? true
          : false
      );
      setCloudKitchenChecked(
        cookies[config.preferencesCookie]?.filterData?.chefType ===
          "cloudKitchen"
          ? true
          : false
      );
      setVegNonVegCheck(
        cookies[config.preferencesCookie]?.filterData?.vegNonVeg === "Veg"
          ? "Veg"
          : cookies[config.preferencesCookie]?.filterData?.vegNonVeg ===
            "Non-Veg"
          ? "Non-Veg"
          : null
      );
      setNonVegTypes([
        {
          name: "Egg",
          checked:
            cookies[
              config.preferencesCookie
            ]?.filterData?.nonVegTypes?.includes("Egg") ?? false,
        },
        {
          name: "Chicken",
          checked:
            cookies[
              config.preferencesCookie
            ]?.filterData?.nonVegTypes?.includes("Chicken") ?? false,
        },
        {
          name: "Mutton",
          checked:
            cookies[
              config.preferencesCookie
            ]?.filterData?.nonVegTypes?.includes("Mutton") ?? false,
        },
        {
          name: "Sea Food",
          checked:
            cookies[
              config.preferencesCookie
            ]?.filterData?.nonVegTypes?.includes("Sea Food") ?? false,
        },
      ]);
      setSpiceLevels([
        {
          name: "Mild",
          checked:
            cookies[config.preferencesCookie]?.filterData?.spiceLevel?.includes(
              "Mild"
            ) ?? false,
        },
        {
          name: "Medium",
          checked:
            cookies[config.preferencesCookie]?.filterData?.spiceLevel?.includes(
              "Medium"
            ) ?? false,
        },
        {
          name: "Hot",
          checked:
            cookies[config.preferencesCookie]?.filterData?.spiceLevel?.includes(
              "Hot"
            ) ?? false,
        },
      ]);
      setRatingThreePlus(
        cookies[config.preferencesCookie]?.filterData?.rating === 3
          ? true
          : false
      );
      setRatingFourPlus(
        cookies[config.preferencesCookie]?.filterData?.rating === 4
          ? true
          : false
      );
      setMinimumPrice(
        cookies[config.preferencesCookie]?.filterData?.minimumPrice ?? ""
      );
      setMaximumPrice(
        cookies[config.preferencesCookie]?.filterData?.maximumPrice ?? ""
      );
    }
  }, [firstLoad, cookies]);

  // get user Data, if not exists
  useEffect(() => {
    if (cookies[config.cookieName]?.loginUserId && !userData?.user) {
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );

      dispatch(getCart({ cookies }));
    }
  }, [dispatch, cookies, userData]);

  // On error when get user api is called
  useEffect(() => {
    if (userError) {
      alert(
        "Something went wrong while fetching user details. Please try again later!"
      );
    }
  }, [userError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

  // Generate sessionId, if not exists
  useEffect(() => {
    if (
      !cookies[config.sessionCookie] ||
      !cookies[config.sessionCookie].sessionId
    ) {
      let sessionId = uuidv4();
      setCookie(
        config.sessionCookie,
        JSON.stringify({
          sessionId: sessionId,
        }),
        { path: "/", maxAge: 3000000, sameSite: "strict" }
      );
    }
  }, [cookies, setCookie]);

  //  Address selection; if user not having address, try to fetch current location
  useEffect(() => {
    const getAddressCurrentLocation = (lat, lng) => {
      let url =
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        lat +
        "," +
        lng +
        "&key=" +
        config.googleMapsApiKey;

      fetch(url, {
        method: "get",
      }).then((response) => {
        response.json().then((res) => {
          if (res.results.length > 0) {
            let data = res.results[0].address_components;
            if (data.length > 0) {
              let cityVal = "";
              let localityVal = "";
              let stateVal = "";
              data.forEach((element) => {
                if (element.types.includes("sublocality_level_1")) {
                  localityVal = element.long_name;
                } else if (element.types.includes("locality")) {
                  cityVal = element.long_name;
                } else if (
                  element.types.includes("administrative_area_level_1")
                ) {
                  stateVal = element.long_name;
                }
              });
              setCurrentAddress({
                locality: localityVal,
                city: cityVal,
                state: stateVal,
              });
              setCurrentPosition({
                latitude: lat,
                longitude: lng,
              });
              setIsAddressFetching(false);
              setInvokeCookies(true);
            }
          }
        });
      });
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissionDenied(false);
            // setCurrentPosition({
            //   lat: position.coords.latitude,
            //   lng: position.coords.longitude,
            // });
            getAddressCurrentLocation(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          // failure call back
          (error) => {
            setPermissionDenied(true);
            getAddressCurrentLocation(
              config.defaultMapLocation.latitude,
              config.defaultMapLocation.longitude
            );
            console.log(error);
          }
        );
      } else {
        setPermissionDenied(true);
        getAddressCurrentLocation(
          config.defaultMapLocation.latitude,
          config.defaultMapLocation.longitude
        );
      }
    };

    const getPrimaryAddress = () => {
      if (userData?.user) {
        if (userData.user.addresses.length > 0) {
          let filterPrimaryAddress = userData.user.addresses.filter(
            (el) => el.isPrimary === "Yes"
          );
          if (filterPrimaryAddress.length > 0) {
            setDeliveryAddress(filterPrimaryAddress[0]);
          } else {
            setDeliveryAddress(userData.user.addresses[0]);
          }
          setIsAddressFetching(false);
          setInvokeCookies(true);
        } else {
          getCurrentLocation();
        }
      } else {
        // keep waiting till user reducer is available
        setFetchPrimaryAddress(true);
      }
    };

    if (fetchPrimaryAddress) {
      setFetchPrimaryAddress(false);
      if (cookies[config.cookieName]?.loginUserId) {
        if (cookies[config.preferencesCookie]?.deliveryAddress?.streetAddress) {
          setIsAddressFetching(false);
        } else {
          getPrimaryAddress();
        }
      } else {
        getCurrentLocation();
      }
    }
  }, [fetchPrimaryAddress, userData, cookies]);

  // Check if we need to redirect to Profile page, when user has not filled it yet
  useEffect(() => {
    const getProfile = () => {
      if (userData?.user) {
        if (userData.user.addresses.length === 0) {
          navigate("/create-profile");
        }
      } else {
        // keep waiting till user reducer is available
        setCheckProfile(true);
      }
    };

    if (checkProfile) {
      setCheckProfile(false);
      getProfile();
    }
  }, [checkProfile, navigate, userData]);

  // Pre order date schedule; set main variables on page load; set main data to NA variables on modal load;
  useEffect(() => {
    if (preorderSelected) {
      setPreorderSelected(false);
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

      // if current time is above 10pm, remove today's date from preorder
      if (new Date().getHours() >= 22) {
        results.splice(0, 1);
      }
      setPreOrderWeek(results);

      let resetPreorderDate = false;
      if (!!cookies[config.preferencesCookie]?.preorderData?.preorderDayName) {
        // if cookie having old preorder date, reset it
        if (
          format(
            new Date(
              cookies[
                config.preferencesCookie
              ]?.preorderData?.preorderDayName.split(",")[3]
            ).getTime(),
            "yyyy-MM-dd"
          ) < format(new Date().getTime(), "yyyy-MM-dd")
        ) {
          resetPreorderDate = true;
        } else {
          // set from cookie, if not set already
          if (!preorderDayName) {
            setPreorderDayName(
              cookies[config.preferencesCookie].preorderData.preorderDayName
            );
            setPreorderDayNameNA(
              cookies[config.preferencesCookie].preorderData.preorderDayName
            );
            // setPreorderDay(
            //   cookies[
            //     config.preferencesCookie
            //   ].preorderData.preorderDayName.split(",")[0]
            // );
            setDeliverySlotTime(
              cookies[config.preferencesCookie].preorderData.preorderSlot
            );
            setTriggerDeliverSlot(true);
          }
        }
      } else {
        resetPreorderDate = true;
      }

      if (resetPreorderDate) {
        setPreorderDayName(results[1].dayName);
        setPreorderDayNameNA(results[1].dayName);
        // setPreorderDay(results[0].dayName.split(",")[0]);
        setDeliverySlotTime(deliverySlots[deliverySlotIndex]);
        setDeliverySlotTimeNA("12am - 1am");
        setInvokeCookies(true);
      }

      // if (!slot && !!preorderSlots) {
      //   setSlot(preorderSlots[0].slot);
      //   setSlotNA(preorderSlots[0].slot);
      // } else {
      //   setSlotNA(slot);
      // }
    }
  }, [cookies, preorderSelected, preorderDayName, deliverySlotIndex]);

  // To highlight filter button when filters are applied
  useEffect(() => {
    let filterApplied = false;
    if (cookies[config.preferencesCookie]?.filterData) {
      if (
        cookies[config.preferencesCookie]?.filterData?.chefType !== null ||
        cookies[config.preferencesCookie]?.filterData?.cuisinesData?.length >
          0 ||
        cookies[config.preferencesCookie]?.filterData?.spiceLevel?.length > 0 ||
        cookies[config.preferencesCookie]?.filterData?.vegNonVeg !== null ||
        cookies[config.preferencesCookie]?.filterData?.nonVegTypes !== null ||
        cookies[config.preferencesCookie]?.filterData?.rating !== null ||
        cookies[config.preferencesCookie]?.filterData?.minimumPrice !== "" ||
        cookies[config.preferencesCookie]?.filterData?.maximumPrice !== ""
      ) {
        filterApplied = true;
      }
      if (filterApplied) {
        setFiltersApplied(true);
      } else {
        setFiltersApplied(false);
      }
    }
  }, [cookies]);

  // set address and filters data in cookies
  useEffect(() => {
    const setCookies = () => {
      // Check if getCuisines call and getPreorderSlots call are done; If not, wait till they are done;
      if (cuisinesData?.length > 0) {
        // Check if outlets data is available in reducer for CK Owner; If not, wait till data is available;
        if (
          userData?.user.roles.indexOf("Cloud Kitchen Owner") !== -1 &&
          outletsData?.cloudKitchenOutlets.length === 0
        ) {
          setInvokeCookies(true);
        } else {
          let filteredCuisinesIds = cuisinesData
            ?.filter((el) => el.checked === true)
            .map((el) => el.id);

          let filteredSpiceLevels = spiceLevels
            ?.filter((el) => el.checked === true)
            .map((el) => el.name);

          let filteredNonVegTypes = nonVegTypes
            ?.filter((el) => el.checked === true)
            .map((el) => el.name);
          setCookie(
            config.preferencesCookie,
            JSON.stringify({
              deliveryAddress: deliveryAddress
                ? deliveryAddress
                : currentAddress
                ? { ...currentAddress, ...currentPosition }
                : null,
              orderType: orderType ?? "instant",
              preorderData: {
                // preorderDay: preorderDay,
                preorderSlot: deliverySlotTime ?? "12am - 1am",
                preorderDayName: preorderDayName,
              },
              filterData: {
                chefType:
                  homeChefChecked && cloudKitchenChecked
                    ? null
                    : homeChefChecked
                    ? "homeChef"
                    : cloudKitchenChecked
                    ? "cloudKitchen"
                    : null,
                vegNonVeg: vegNonVegCheck,
                nonVegTypes:
                  filteredNonVegTypes.length > 0 ? filteredNonVegTypes : null,
                cuisinesData: filteredCuisinesIds,
                spiceLevel:
                  filteredSpiceLevels?.length > 0 ? filteredSpiceLevels : null,
                rating: ratingThreePlus ? 3 : ratingFourPlus ? 4 : null,
                minimumPrice: minimumPrice,
                maximumPrice: maximumPrice,
              },
              outletData: outletsData?.cloudKitchenOutlets[0] ?? null,
            }),
            { path: "/", maxAge: 3000000, sameSite: "strict" }
          );
        }
      } else {
        setInvokeCookies(true);
      }
    };
    if (invokeCookies) {
      setInvokeCookies(false);
      setCookies();
    }
  }, [
    deliverySlotTime,
    invokeCookies,
    cuisinesData,
    spiceLevels,
    nonVegTypes,
    userData,
    deliveryAddress,
    currentAddress,
    currentPosition,
    orderType,
    // preorderDay,
    // slotId,
    // preorderSlots,
    // slot,
    preorderDayName,
    homeChefChecked,
    cloudKitchenChecked,
    vegNonVegCheck,
    ratingThreePlus,
    ratingFourPlus,
    maximumPrice,
    minimumPrice,
    outletsData,
    setCookie,
  ]);

  // Set main filters data to temp (NA) variables on open of the filters drawer
  useEffect(() => {
    const resetFiltersNaData = () => {
      setHomeChefCheckedNA(homeChefChecked);
      setCloudKitchenCheckedNA(cloudKitchenChecked);
      setVegNonVegCheckNA(vegNonVegCheck);
      setNonVegTypesNA(JSON.parse(JSON.stringify(nonVegTypes)));
      setCuisinesDataNA(JSON.parse(JSON.stringify(cuisinesData)));
      setSpiceLevelsNA(JSON.parse(JSON.stringify(spiceLevels)));
      setRatingFourPlusNA(ratingFourPlus);
      setRatingThreePlusNA(ratingThreePlus);
      setMinimumPriceNA(minimumPrice);
      setMaximumPriceNA(maximumPrice);
    };
    if (invokeDrawerOpen) {
      setInvokeDrawerOpen(false);
      resetFiltersNaData();
    }
  }, [
    invokeDrawerOpen,
    homeChefChecked,
    cloudKitchenChecked,
    vegNonVegCheck,
    nonVegTypes,
    cuisinesData,
    spiceLevels,
    ratingFourPlus,
    ratingThreePlus,
    minimumPrice,
    maximumPrice,
  ]);

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

  // get outlets if role is cloud kitchen owner
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") !== -1) {
        if (!outletsData) {
          dispatch(getOutlets({ limit: 100000, cookies }));
        }
      }
    }
  }, [userData, cookies, outletsData, dispatch]);

  // invoke cookies if outlet data is there
  useEffect(() => {
    if (
      outletsData?.cloudKitchenOutlets?.length > 0 &&
      !cookies[config.preferencesCookie].outletData
    ) {
      setInvokeCookies(true);
    }
  }, [outletsData, cookies]);

  // get outletData Failed;
  useEffect(() => {
    if (outletsError) {
      alert(
        "Something went wrong while fetching outlets. Please try again later!!"
      );
    }
  }, [outletsError]);

  return (
    <>
      {/* Top Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          width: "100%",
          background: "#FCFCFC",
          zIndex: "100",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            minHeight: "56px",
            padding: "24px 24px 0px 24px",
            gap: "24px",
            flexWrap: "wrap",
            width: "calc(100% - 48px)",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "0px",
              gap: "30px",
              order: 0,
              // flex: { xs: 0.5, sm: 0.5, md: 0.333 },
              width: { xs: "48px", sm: "47%", md: "31%" },
            }}
          >
            <Link component={RouterLink} to="/">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px",
                  gap: "10px",
                }}
              >
                {/* Logo image */}
                <Box
                  component="img"
                  sx={{
                    height: "40px",
                  }}
                  src="/media/svg/logo.svg"
                />
                {/* Logo text */}
                <Box
                  component="img"
                  sx={{
                    height: "30px",
                    pt: "5px",
                    width: { xs: "0px", sm: "auto" },
                  }}
                  src="/media/svg/logo-text.svg"
                />
              </Box>
            </Link>
          </Box>

          {/* Address or Outlet */}
          {(showAddress || showOutlets) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0px",
                gap: "30px",
                order: { xs: 2, sm: 2, md: 1 },
                // flex: { xs: 0.5, sm: 1, md: 0.333 },
                width: { xs: "94%", sm: "94%", md: "31%" },
              }}
            >
              {/* Adddress */}
              {showAddress &&
                (isAddressFetching ? (
                  <Typography variant="bodyparagraph">
                    Fetching addresses...
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: 0,
                      gap: "5px",
                      justifyContent: "center",
                    }}
                  >
                    {/* Address line 1 */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 0,
                        gap: "10px",
                      }}
                    >
                      {/* Address icon */}
                      <Box
                        component="img"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                        src={
                          cookies?.chub_pref?.deliveryAddress?.addressTag ===
                          "Home"
                            ? "/media/svg/home.svg"
                            : cookies?.chub_pref?.deliveryAddress
                                ?.addressTag === "Work"
                            ? "/media/svg/work.svg"
                            : "/media/svg/marker.svg"
                        }
                      />

                      {/* Address Tag name and dropdown icon */}
                      <Box
                        onClick={() => setIsAddressModalOpen(true)}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          gap: "5px",
                          cursor: "pointer",
                        }}
                      >
                        {/* Address Tag name */}
                        <Typography
                          variant="bodybold"
                          sx={{
                            maxWidth: {
                              xs: "250px",
                              sm: "500px",
                              md: "250px",
                              lg: "350px",
                            },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cookies?.chub_pref?.deliveryAddress?.addressTag
                            ? cookies?.chub_pref?.deliveryAddress?.addressTag
                            : permissionDenied
                            ? "Bengaluru"
                            : "Current Location"}
                        </Typography>
                        {/* Drop down icon */}
                        <Box
                          component="img"
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                          src="/media/svg/dropdown.svg"
                        />
                      </Box>
                    </Box>

                    {/* Address line 2 */}
                    <Typography
                      variant="bodyregular"
                      sx={{
                        maxWidth: {
                          xs: "250px",
                          sm: "500px",
                          md: "250px",
                          lg: "350px",
                        },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cookies?.chub_pref?.deliveryAddress?.streetAddress
                        ? `${
                            cookies?.chub_pref?.deliveryAddress?.streetAddress +
                            ", " +
                            cookies?.chub_pref?.deliveryAddress?.locality +
                            ", " +
                            cookies?.chub_pref?.deliveryAddress?.city
                          }`
                        : `${currentAddress?.locality}, ${currentAddress?.city}`}
                    </Typography>
                  </Box>
                ))}

              {/* Show outlets */}
              {showOutlets &&
                !showAddress &&
                (isOutletsDataFetching ? (
                  <Typography variant="bodyparagraph">
                    Fetching Outlets...
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: 0,
                      gap: "5px",
                      justifyContent: "center",
                    }}
                  >
                    {/* Address line 1 */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 0,
                        gap: "10px",
                      }}
                    >
                      {/* Address icon */}
                      <Box
                        component="img"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                        src="/media/svg/marker.svg"
                      />

                      {/* Outlet Name and outlets dropdown */}
                      <Box
                        onClick={() => setIsOutletsModalOpen(true)}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 0,
                          gap: "5px",
                          cursor: "pointer",
                        }}
                      >
                        {/* Outlet name */}
                        <Typography
                          variant="bodybold"
                          sx={{
                            maxWidth: {
                              xs: "250px",
                              sm: "500px",
                              md: "250px",
                              lg: "350px",
                            },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {
                            cookies[config.preferencesCookie]?.outletData
                              ?.outletName
                          }
                        </Typography>
                        {/* Drop down icon */}
                        <Box
                          component="img"
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                          src="/media/svg/dropdown.svg"
                        />
                      </Box>
                    </Box>

                    {/* Address line 2 */}
                    <Typography
                      variant="bodyregular"
                      sx={{
                        maxWidth: {
                          xs: "250px",
                          sm: "500px",
                          md: "250px",
                          lg: "350px",
                        },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {
                        cookies[config.preferencesCookie]?.outletData
                          ?.streetAddress
                      }
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}

          {/* Header right */}
          {cookies[config.cookieName]?.token &&
          cookies[config.cookieName]?.loginUserId ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                order: { xs: 1, sm: 1, md: 2 },
                gap: "15px",
                justifyContent: "right",
                // flex: { xs: 0.5, sm: 0.5, md: 0.333 },
                width: { xs: "176px", sm: "47%", md: "31%" },
              }}
            >
              {/* Cart */}
              <Box
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  width: "24px",
                  height: "24px",
                }}
                onClick={() => navigate("/cart")}
              >
                {/* cart icon */}
                <Box
                  component="img"
                  sx={{
                    width: "24px",
                    height: "24px",
                  }}
                  src="/media/svg/cart.svg"
                />

                {cartData?.length > 0 && (
                  <Box
                    sx={{
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "10px",
                      gap: "10px",
                      position: "absolute",
                      width: "17px",
                      height: "17px",
                      left: "12px",
                      top: "-8px",
                      background:
                        "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography
                      variant="bodybold"
                      sx={{ color: "#FCFCFC", fontSize: "9px" }}
                    >
                      {cartQuantity}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Chef Menu */}
              {((userData?.user.roles.length > 1 &&
                userData?.user.roles.indexOf("Home Chef Owner") >= 0) ||
                userData?.user.roles.indexOf("Chef Manager") >= 0 ||
                userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0 ||
                userData?.user.roles.indexOf("Outlet Manager")) >= 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    component={"img"}
                    onClick={(ev) => setOpenDashboardMenu(ev.currentTarget)}
                    sx={{ width: "24px", height: "24px", cursor: "pointer" }}
                    src="/media/svg/chef-cap.svg"
                  />
                </Box>
              )}

              <Menu
                anchorEl={openDashboardMenu}
                id="dashboard-menu"
                open={Boolean(openDashboardMenu)}
                onClose={() => setOpenDashboardMenu(false)}
                onClick={() => setOpenDashboardMenu(false)}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    overflowY: "scroll",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    // width: 380,
                    background: "#FCFCFC",
                    border: "1px solid #DFE2E6",
                    boxShadow: "0px 10px 20px rgba(42, 48, 55, 0.12)",
                    borderRadius: "7px",
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {(userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
                  userData?.user.roles.indexOf("Chef Manager") >= 0) && (
                  <Box>
                    {userData?.user.roles.indexOf("Home Chef Owner") >= 0 && (
                      <>
                        <MenuItem
                          onClick={() => navigate("/home-chef-profile")}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: "14px 16px",
                              gap: "10px",
                            }}
                          >
                            {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                            <Typography variant="bodyparagraph">
                              Chef Profile
                            </Typography>
                          </Box>
                        </MenuItem>

                        <MenuItem onClick={() => navigate("/managers")}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: "14px 16px",
                              gap: "10px",
                            }}
                          >
                            {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                            <Typography variant="bodyparagraph">
                              Chef Managers
                            </Typography>
                          </Box>
                        </MenuItem>
                      </>
                    )}
                    {userData?.user.roles.indexOf("Chef Manager") >= 0 && (
                      <MenuItem onClick={() => navigate("/chef-owner-details")}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            padding: "14px 16px",
                            gap: "10px",
                          }}
                        >
                          {/* <Box
                            component={"img"}
                            sx={{ width: "24px", height: "24px" }}
                            src="/media/svg/chef-cap.svg"
                          /> */}
                          <Typography variant="bodyparagraph">
                            Chef Owner Details
                          </Typography>
                        </Box>
                      </MenuItem>
                    )}

                    <MenuItem onClick={() => navigate("/food-items")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Food Items
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem onClick={() => navigate("/coupon-management")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                        <Typography variant="bodyparagraph">
                          Coupon Management
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate("/preorder-stock-management")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Preorder Stock Management
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate("/chef-orders-dashboard")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Orders Dashboard
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Box>
                )}

                {(userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0 ||
                  userData?.user.roles.indexOf("Outlet Manager") >= 0) && (
                  <Box>
                    {userData?.user.roles.indexOf("Cloud Kitchen Owner") >=
                      0 && (
                      <>
                        <MenuItem
                          onClick={() => navigate("/restaurant-profile")}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: "14px 16px",
                              gap: "10px",
                            }}
                          >
                            {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                            <Typography variant="bodyparagraph">
                              Restaurant Profile
                            </Typography>
                          </Box>
                        </MenuItem>

                        <MenuItem onClick={() => navigate("/managers")}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: "14px 16px",
                              gap: "10px",
                            }}
                          >
                            {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                            <Typography variant="bodyparagraph">
                              Outlet Managers
                            </Typography>
                          </Box>
                        </MenuItem>
                      </>
                    )}
                    {userData?.user.roles.indexOf("Outlet Manager") >= 0 && (
                      <MenuItem
                        onClick={() => navigate("/outlet-owner-details")}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            padding: "14px 16px",
                            gap: "10px",
                          }}
                        >
                          {/* <Box
                            component={"img"}
                            sx={{ width: "24px", height: "24px" }}
                            src="/media/svg/chef-cap.svg"
                          /> */}
                          <Typography variant="bodyparagraph">
                            Outlet Owner Details
                          </Typography>
                        </Box>
                      </MenuItem>
                    )}

                    <MenuItem onClick={() => navigate("/food-items")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Food Items
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem onClick={() => navigate("/coupon-management")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                              component={"img"}
                              sx={{ width: "24px", height: "24px" }}
                              src="/media/svg/chef-cap.svg"
                            /> */}
                        <Typography variant="bodyparagraph">
                          Coupon Management
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate("/preorder-stock-management")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Preorder Stock Management
                        </Typography>
                      </Box>
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate("/chef-orders-dashboard")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        {/* <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/chef-cap.svg"
                        /> */}
                        <Typography variant="bodyparagraph">
                          Orders Dashboard
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Box>
                )}
              </Menu>

              {/* User Profile Menu */}
              <Box
                onClick={(ev) => setOpenProfileMenu(ev.currentTarget)}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 0,
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                {/* User image */}
                {userData?.user.profileImage ? (
                  <Box
                    component="img"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    src={userData?.user.profileImage}
                  />
                ) : (
                  <Avatar
                    {...stringAvatar(userData?.user.fullName?.toUpperCase())}
                  />
                )}

                {/* Dropdown icon */}
                <Box
                  component="img"
                  style={{
                    width: "24px",
                    height: "24px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                  src="/media/svg/dropdown.svg"
                />
              </Box>

              <Menu
                anchorEl={openProfileMenu}
                id="account-menu"
                open={Boolean(openProfileMenu)}
                onClose={() => setOpenProfileMenu(false)}
                onClick={() => setOpenProfileMenu(false)}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    overflowY: "scroll",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    width: 250,
                    background: "#FCFCFC",
                    border: "1px solid #DFE2E6",
                    boxShadow: "0px 10px 20px rgba(42, 48, 55, 0.12)",
                    borderRadius: "7px",
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px 35px 20px",
                  }}
                >
                  <Typography variant="bodyparagraph">Logged in as</Typography>
                  <Typography variant="bodybold">
                    {userData?.user?.fullName ??
                      userData?.user.countryCode +
                        " " +
                        userData?.user.mobileNumber}
                  </Typography>
                </Box>

                <MenuItem onClick={() => navigate("/profile")}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      gap: "10px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{ width: "24px", height: "24px" }}
                      src="/media/svg/profile.svg"
                    />
                    <Typography variant="bodyparagraph">Profile</Typography>
                  </Box>
                </MenuItem>

                <MenuItem onClick={() => navigate("/my-orders")}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      gap: "10px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{ width: "24px", height: "24px" }}
                      src="/media/svg/order-icon.svg"
                    />
                    <Typography variant="bodyparagraph">Orders</Typography>
                  </Box>
                </MenuItem>

                {userData?.user.roles.length > 1 &&
                  (userData?.user.roles.indexOf("Admin") >= 0 ||
                    userData?.user.roles.indexOf("Chef Support Executive") >=
                      0 ||
                    userData?.user.roles.indexOf(
                      "Customer Support Executive"
                    ) >= 0 ||
                    userData?.user.roles.indexOf("Sales Manager") >= 0 ||
                    userData?.user.roles.indexOf("Accountant")) >= 0 && (
                    <MenuItem onClick={() => navigate("/dashboard")}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          gap: "10px",
                        }}
                      >
                        <Box
                          component={"img"}
                          sx={{ width: "24px", height: "24px" }}
                          src="/media/svg/dashboard.svg"
                        />
                        <Typography variant="bodyparagraph">
                          Dashboard
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}

                {userData?.user.roles.length === 1 && (
                  <MenuItem onClick={() => navigate("/partner-registration")}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "14px 16px",
                        gap: "10px",
                      }}
                    >
                      <Box
                        component={"img"}
                        sx={{ width: "24px", height: "24px" }}
                        src="/media/svg/chef-cap.svg"
                      />
                      <Typography variant="bodyparagraph">
                        Register as Partner
                      </Typography>
                    </Box>
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    // setDeliveryAddress(null);
                    // removeCookie(config.preferencesCookie);
                    // setInvokeCookies(true);
                    navigate("/logout");
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      gap: "10px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{ width: "24px", height: "24px" }}
                      src="/media/svg/logout.svg"
                    />
                    <Typography variant="bodyparagraph">Logout</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                order: { xs: 1, sm: 1, md: 2 },
                justifyContent: "right",
                // flex: { xs: 0.5, sm: 0.5, md: 0.333 },
                width: { xs: "104px", sm: "47%", md: "31%" },
              }}
            >
              <Button
                variant="outlined"
                onClick={() => dispatch(loginDrawer(true))}
                sx={{
                  minWidth: { xs: "100px", md: "162px" },
                  height: "48px",
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Preferences Header */}
      {showPreferences && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 0,
            gap: "17px",
            // position: "absolute",
            minHeight: "56px",
            ml: "27px",
            mt: "23px",
            mr: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Order type */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 0,
              height: "56px",
              background: "#FCFCFC",
              border: "1px solid #AAACAE",
              borderRadius: "20px",
              flex: "none",
              order: 0,
              flexGrow: 0,
            }}
          >
            {/* Instant Order */}
            <Box
              onClick={() => {
                setOrderType("instant");
                setInvokeCookies(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: "136px", sm: "154px" },
                height: "56px",
                background:
                  orderType === "instant"
                    ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                    : "",
                boxShadow:
                  orderType === "instant"
                    ? "0px 10px 30px rgba(255, 120, 77, 0.33)"
                    : "",
                borderRadius: "19px",
                flex: "none",
                order: 0,
                alignSelf: "stretch",
                flexGrow: 1,
                cursor: "pointer",
              }}
            >
              {/* Instant Order text */}
              <Typography
                variant={orderType === "instant" ? "bodybold" : "bodyparagraph"}
                sx={{
                  fontWeight: orderType === "instant" ? 700 : 400,
                  color: orderType === "instant" ? "#FCFCFC" : "text.primary",
                }}
              >
                Instant Order
              </Typography>
            </Box>
            {/* Preorder */}
            <Box
              onClick={() => {
                setOrderType("preorder");
                setPreorderSelected(true);
                setIsPreorderModalOpen(true);
                setInvokeCookies(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: "136px", sm: "154px" },
                height: "56px",
                background:
                  orderType === "preorder"
                    ? "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)"
                    : "",
                boxShadow:
                  orderType === "preorder"
                    ? "0px 10px 30px rgba(255, 120, 77, 0.33)"
                    : "",
                borderRadius: "19px",
                flex: "none",
                order: 1,
                alignSelf: "stretch",
                flexGrow: 1,
                cursor: "pointer",
              }}
            >
              {/* Preorder text */}
              <Typography
                variant={
                  orderType === "preorder" ? "bodybold" : "bodyparagraph"
                }
                sx={{
                  fontWeight: orderType === "preorder" ? 700 : 400,
                  color: orderType === "preorder" ? "#FCFCFC" : "text.primary",
                }}
              >
                Preorder
              </Typography>
            </Box>
          </Box>

          {/* Pre-order day and time slot */}
          {orderType === "preorder" && (
            <Box
              onClick={() => {
                setPreorderSelected(true);
                setIsPreorderModalOpen(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: "0px",
                gap: "15px",
                //  width: "453px",
                height: "56px",
                flex: "none",
                //  order: "1",
                // flexGrow: "1",
                cursor: "pointer",
                maxWidth: "310px",
              }}
            >
              <Box
                sx={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "15px 20px",
                  gap: "15px",
                  //  width: "453px",
                  height: "56px",
                  background: "#FCFCFC",
                  border: "1px solid #535455",
                  borderRadius: "15px",
                  //  flex: "none",
                  order: "0",
                  flexGrow: "1",
                }}
              >
                {/* Calender icon and text */}
                <Box
                  component="img"
                  sx={{
                    width: "16px",
                    height: "16px",
                    flex: "none",
                    order: "0",
                    flexGrow: "0",
                  }}
                  src="/media/svg/calendar.svg"
                />
                <Typography variant="bodyregular">
                  {/* Sample format: Oct 14, Fri (12pm-1pm) */}
                  {/* {preorderDayName?.split(",")[1].slice(0, 3)}{" "}
                  {preorderDayName?.split(",")[2]}
                  {", "}
                  {preorderDayName?.split(",")[0].slice(0, 3)}
                  {" ("}
                  {deliverySlotTime}
                  {")"} */}
                  {cookies[
                    config.preferencesCookie
                  ]?.preorderData?.preorderDayName
                    ?.split(",")[1]
                    .slice(0, 3)}{" "}
                  {
                    cookies[
                      config.preferencesCookie
                    ]?.preorderData?.preorderDayName?.split(",")[2]
                  }
                  {", "}
                  {cookies[
                    config.preferencesCookie
                  ]?.preorderData?.preorderDayName
                    ?.split(",")[0]
                    .slice(0, 3)}
                  {" ("}
                  {
                    cookies[config.preferencesCookie]?.preorderData
                      ?.preorderSlot
                  }
                  {")"}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Search Box */}
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              alignSelf: "center",
              height: "51px",
              minWidth: "200px",
            }}
          >
            <Autocomplete
              id="autocomplete-suggestion"
              sx={{
                width: "100%",
                "& fieldset": {
                  borderRadius: "15px",
                  border: "1px solid #535455",
                },
                "& .MuiOutlinedInput-input": {
                  height: "auto",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    border: "1px solid #535455",
                  },
                  lineHeight: "inherit",
                },
              }}
              clearOnBlur={false}
              options={searchText.length < 3 ? [] : searchSuggestionData}
              getOptionLabel={(searchSuggestion) => `${searchSuggestion.name}`}
              noOptionsText={
                searchText.length < 3
                  ? "Please enter atleast 3 characters"
                  : "No results found"
              }
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              PaperComponent={({ children }) => (
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    // alignItems: "flex-start",
                    padding: "0px",
                    // position: "absolute",
                    // width: "383px",
                    // height: "276px",
                    // left: "485px",
                    // top: "154px",
                    background: "#FCFCFC",
                    border: "1px solid #535455",
                    boxShadow: "10px 10px 20px rgba(83, 84, 85, 0.14)",
                    borderRadius: "15px",
                    "ul::-webkit-scrollbar": { width: 0, height: 0 },
                  }}
                >
                  {children}
                </Paper>
              )}
              renderOption={(props, searchSuggestion) => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "10px",
                    // width: "383px",
                    // height: "69px",
                    flex: "none",
                    order: "0",
                    alignSelf: "stretch",
                    flexGrow: "0",
                  }}
                >
                  <Box
                    {...props}
                    key={searchSuggestion.id}
                    sx={{
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
                        gap: "10px",
                        // width: "363px",
                        // height: "49px",
                        // flex: "none",
                        // order: "0",
                        // flexGrow: "1",
                      }}
                    >
                      <Typography variant="bodyparagraph">
                        {searchSuggestion.name}
                      </Typography>
                      <Typography variant="bodymetatag">
                        {searchSuggestion.type === "foodItem"
                          ? "Food Item"
                          : searchSuggestion.type === "homeChef"
                          ? "Home Chef"
                          : searchSuggestion.type === "cloudKitchen"
                          ? "Restaurant"
                          : searchSuggestion.type}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  value={searchText}
                  onChange={(ev) => {
                    setSearchText(ev.target.value);
                    // setInvokeSearchSuggestion(true);
                    ev.target.value.length >= 3 &&
                      getSearchSuggestions(ev.target.value);
                  }}
                  placeholder="Search"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          component="img"
                          sx={{
                            width: "16px",
                            height: "16px",
                            flex: "none",
                            order: 0,
                            flexGrow: 0,
                            pl: "6px",
                          }}
                          src="/media/svg/search.svg"
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              onChange={(ev, newValue, reason) => {
                if (newValue?.type === "homeChef") {
                  navigate(
                    `/chef/${newValue?.name.replace(/\s+/g, "-")}/${
                      newValue.id
                    }`
                  );
                } else if (newValue?.type === "cloudKitchen") {
                  navigate(
                    `/restaurant/${newValue?.name.replace(/\s+/g, "-")}/${
                      newValue?.id
                    }`
                  );
                } else if (newValue?.type === "foodItem") {
                  navigate(`/search/${newValue?.name.replace(/\s+/g, "-")}`);
                }
                if (reason === "clear") {
                  setSearchSuggestionData([]);
                }
              }}
            />
          </Box>

          {/* Filter button */}
          <Box
            onClick={() => {
              setIsDrawerOpen(true);
              setInvokeDrawerOpen(true);
            }}
            sx={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px 20px",
              gap: "10px",
              // width: "106px",
              height: "51px",
              border: filtersApplied
                ? "1px solid #F9881F"
                : "1px solid #535455",
              borderRadius: "15px",
              flex: "none",
              order: 2,
              flexGrow: 0,
              cursor: "pointer",
              background: filtersApplied ? "#FDF6EB" : "none",
            }}
          >
            {/* Filter text */}
            <Typography
              variant="bodyregular"
              sx={
                filtersApplied
                  ? {
                      background:
                        "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                    }
                  : { color: "#535455" }
              }
            >
              Filter
            </Typography>
            {/* Filter icon */}
            <Box
              component="img"
              sx={{
                width: "20px",
                height: "20px",
              }}
              src={
                filtersApplied
                  ? "/media/svg/filter-orange.svg"
                  : "/media/svg/filter.svg"
              }
            />
          </Box>

          {/* Veg button */}
          <Box
            onClick={() => {
              setVegNonVegCheck("Veg");
              setInvokeCookies(true);
            }}
            sx={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px 20px",
              gap: "10px",
              // width: "105px",
              height: "51px",
              border:
                vegNonVegCheck === "Veg"
                  ? "1px solid #F9881F"
                  : "1px solid #535455",
              borderRadius: "15px",
              flex: "none",
              order: 3,
              flexGrow: 0,
              background: vegNonVegCheck === "Veg" ? "#FDF6EB" : "none",
              cursor: "pointer",
            }}
          >
            {/* Veg text */}
            <Typography
              variant="bodyregular"
              sx={
                vegNonVegCheck === "Veg"
                  ? {
                      background:
                        "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                    }
                  : { color: "#535455" }
              }
            >
              Veg
            </Typography>
            {vegNonVegCheck === "Veg" && (
              <Box
                component={"img"}
                src="/media/svg/cross-orange.svg"
                sx={{
                  width: "10px",
                  height: "10px",
                  cursor: "pointer",
                }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setVegNonVegCheck(null);
                  setInvokeCookies(true);
                }}
              />
            )}
          </Box>

          {/* Rating button */}
          <Box
            onClick={() => {
              setRatingFourPlus(true);
              setInvokeCookies(true);
            }}
            sx={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px 20px",
              gap: "10px",
              // width: "105px",
              height: "51px",
              border: ratingFourPlus
                ? "1px solid #F9881F"
                : "1px solid #535455",
              borderRadius: "15px",
              flex: "none",
              order: 3,
              flexGrow: 0,
              background: ratingFourPlus ? "#FDF6EB" : "none",
              cursor: "pointer",
            }}
          >
            {/* Rating text */}
            <Typography
              variant="bodyregular"
              sx={
                ratingFourPlus
                  ? {
                      background:
                        "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                    }
                  : { color: "#535455" }
              }
            >
              Rating 4+
            </Typography>
            {ratingFourPlus && (
              <Box
                component={"img"}
                src="/media/svg/cross-orange.svg"
                sx={{
                  width: "10px",
                  height: "10px",
                  cursor: "pointer",
                }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setRatingFourPlus(false);
                  setInvokeCookies(true);
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Cuisines */}
      {showCuisines && (
        <>
          <Typography variant="header3" sx={{ ml: "27px", mt: "25px" }}>
            Browse by Cuisines
          </Typography>

          {/* Cuisine List */}
          {cuisinesData?.length > 0 && (
            <Box
              sx={{
                position: "relative",
                ml: "30px",
                mt: "20px",
                mr: "24px",
              }}
            >
              <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                {cuisinesData?.map((el, idx) => (
                  <Box
                    key={idx}
                    onClick={() => {
                      handleSingleCuisineSelected(idx);
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "15px 20px",
                      gap: "5px",
                      width: "108px",
                      height: "118px",
                      background:
                        cuisinesData?.filter((el) => el.checked === true)
                          .length === 1 && el.checked === true
                          ? "#FFF8F5"
                          : "#FCFCFC",
                      border:
                        cuisinesData?.filter((el) => el.checked === true)
                          .length === 1 && el.checked === true
                          ? "1px solid #FA8820"
                          : "1px solid #DFE2E6",
                      // borderImageSource: el.checked ? `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)` : "",
                      borderRadius: "15px",
                      flex: "none",
                      order: 0,
                      flexGrow: 0,
                      cursor: "pointer",
                      mr: "15px",
                    }}
                  >
                    <Box
                      sx={{
                        width: "75px",
                        height: "83px",
                        flex: "none",
                        order: 0,
                        flexGrow: 0,
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        sx={{
                          position: "absolute",
                          width: "75px",
                          height: "75px",
                          // left: "37.5px",
                          // top: "20.5px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        src={el.image}
                      />
                      {/* <Box
                        component="img"
                        sx={{
                          position: "absolute",
                          width: "75px",
                          height: "75px",
                          // left: "37.5px",
                          top: "8px",
                          opacity: "0.52",
                          filter: `blur(8.5px)`,
                          borderRadius: "50%",
                        }}
                        src={el.image}
                      /> */}
                      {cuisinesData.filter((el) => el.checked === true)
                        .length === 1 &&
                        el.checked === true && (
                          <Box
                            component="img"
                            sx={{
                              position: "absolute",
                              width: "16px",
                              height: "16px",
                              right: "-25px",
                              top: "-8px",
                              cursor: "pointer",
                            }}
                            src="/media/svg/cross-filled-orange.svg"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleSingleCuisineRemoved(idx);
                            }}
                          />
                        )}
                    </Box>
                    <Typography
                      variant="bodyparagraph"
                      sx={
                        cuisinesData?.filter((el) => el.checked === true)
                          .length === 1 && el.checked === true
                          ? {
                              textAlign: "center",
                              maxWidth: "108px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              background:
                                "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              textFillColor: "transparent",
                            }
                          : {
                              textAlign: "center",
                              maxWidth: "108px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }
                      }
                    >
                      {el.cuisineName}
                    </Typography>
                  </Box>
                ))}
              </ScrollMenu>
            </Box>
          )}
        </>
      )}

      {/* Modal for address drop down */}
      <Modal
        open={isAddressModalOpen}
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
              gap: "20px",
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
              onClick={() => setIsAddressModalOpen(false)}
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
                    {permissionDenied && (
                      <Typography variant="bodyparagraph">
                        Please allow location permission and reload
                      </Typography>
                    )}
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
                            setIsAddressModalOpen(false);
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
                  {userData?.user.addresses.length > 0 ? (
                    <Grid container>
                      {userData?.user.addresses.map((el, idx) => (
                        <Grid
                          item
                          key={idx}
                          sm={11}
                          md={5.5}
                          sx={{
                            background: "#FCFCFC",
                            border: "1px solid #DFE2E6",
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
                              setDeliveryAddress(el);
                              setInvokeCookies(true);
                              setIsAddressModalOpen(false);
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
                              cursor: "pointer",
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
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Modal for Outlets */}
      <Modal
        open={isOutletsModalOpen}
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
            <Typography variant="header4">Choose the Outlet</Typography>
            {/* Modal close button */}
            <Box
              component="img"
              onClick={() => setIsOutletsModalOpen(false)}
              sx={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>
          <Box sx={{ width: "100%" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsOutletsModalOpen(false);
                navigate("/add-restaurant-outlet");
              }}
              sx={{ float: "right" }}
            >
              Add Outlet
            </Button>
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
              {/* Addresses group */}
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
                  {outletsData?.cloudKitchenOutlets.length > 0 && (
                    <Grid container>
                      {outletsData?.cloudKitchenOutlets.map((el, idx) => (
                        <Grid
                          item
                          key={idx}
                          sm={11}
                          md={5.5}
                          sx={{
                            background:
                              cookies[config.preferencesCookie]?.outletData
                                ?.id === el.id
                                ? "#FFF8F5"
                                : "#FCFCFC",
                            boxShadow:
                              cookies[config.preferencesCookie]?.outletData
                                ?.id === el.id &&
                              "0px -10px 20px rgba(249, 136, 31, 0.1)",
                            border:
                              cookies[config.preferencesCookie]?.outletData
                                ?.id === el.id
                                ? "1px solid #F28C0E"
                                : "1px solid #DFE2E6",
                            borderRadius: "15px",
                            m: 1,
                            position: "relative",
                          }}
                        >
                          <Box
                            onClick={() => {
                              setCookie(
                                config.preferencesCookie,
                                JSON.stringify({
                                  ...cookies[config.preferencesCookie],
                                  outletData: el,
                                }),
                                {
                                  path: "/",
                                  maxAge: 3000000,
                                  sameSite: "strict",
                                }
                              );
                              setIsOutletsModalOpen(false);
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
                              cursor: "pointer",
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
                                  // alignItems: "center",
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
                                    cookies[config.preferencesCookie]
                                      ?.outletData?.id === el.id
                                      ? "/media/svg/marker-filled-orange.svg"
                                      : "/media/svg/marker.svg"
                                  }
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    flexDirection: "column",
                                  }}
                                >
                                  <Typography
                                    variant="bodybold"
                                    sx={{
                                      color:
                                        cookies[config.preferencesCookie]
                                          ?.outletData?.id === el.id
                                          ? "#F28C0E"
                                          : "#4D4D4D",
                                    }}
                                  >
                                    {el.outletName}
                                  </Typography>
                                  <Typography
                                    variant="bodyparagraph"
                                    sx={{
                                      color:
                                        cookies[config.preferencesCookie]
                                          ?.outletData?.id === el.id
                                          ? "#F28C0E"
                                          : "#4D4D4D",
                                    }}
                                  >
                                    {el.streetAddress +
                                      ", " +
                                      el.locality +
                                      ", " +
                                      el.city}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Login drawer */}
      <Drawer
        anchor="right"
        open={loginState}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: {
            width: "50%",
            minWidth: "300px",
            maxWidth: "600px",
            background: "#FCFCFC",
          },
        }}
      >
        {showMobileInput ? (
          <form onSubmit={handleSendOTP}>
            <Box
              sx={{
                background: "#FCFCFC",
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
                    Please verify your Phone Number
                  </Typography>
                  {/* Cancel icon */}
                  <Box
                    onClick={() => {
                      dispatch(loginDrawer(false));
                      setMobileNo("");
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
              {/* Login drawer body */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "20px",
                  mt: "70px",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    height: "200px",
                  }}
                  src="/media/svg/phone-input-graphic.svg"
                />

                <Typography
                  variant="bodyparagraph"
                  sx={{
                    textAlign: "center",
                    mx: 3,
                  }}
                >
                  Enter the phone number, on which you would like to login /
                  register
                </Typography>
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
            </Box>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <Box
              sx={{
                background: "#FCFCFC",
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
                    alignItems: "center",
                    padding: "0px",
                    width: "100%",
                  }}
                >
                  {/* Back icon */}
                  <Box
                    component={"img"}
                    sx={{
                      width: "24px",
                      height: "24px",
                      alignSelf: "flex-start",
                      px: "10px",
                      mt: "4px",
                      cursor: "pointer",
                    }}
                    src="/media/svg/back-arrow-filled.svg"
                    onClick={() => {
                      setShowMobileInput(true);
                      setIsResendOtpClicked(false);
                      setOtpValue("");
                      setOtpValidError(false);
                      setOtpHelperText("");
                    }}
                  />
                  {/* header text */}
                  <Typography
                    variant="header4"
                    sx={{
                      flexGrow: 1,
                    }}
                  >
                    Phone verification
                  </Typography>
                  {/* Cancel icon */}
                  <Box
                    onClick={() => {
                      dispatch(loginDrawer(false));
                      setShowMobileInput(true);
                      setMobileNo("");
                      setOtpValue("");
                      setIsResendOtpClicked(false);
                      setOtpValidError(false);
                      setOtpHelperText("");
                    }}
                    component={"img"}
                    sx={{
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      alignSelf: "flex-start",
                      mt: "5px",
                      mr: "5px",
                    }}
                    src="/media/svg/cross-circled.svg"
                  />
                </Box>
                {/* Line */}
                <Box
                  sx={{
                    height: "0px",
                    border: "1px solid #2A3037",
                    alignSelf: "stretch",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "20px",
                  mt: "70px",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    height: "200px",
                  }}
                  src={
                    isResendOtpClicked
                      ? "/media/svg/otp-resent-graphic.svg"
                      : "/media/svg/otp-input-graphic.svg"
                  }
                />

                {otpValidError ? (
                  <Typography
                    variant="bodyparagraph"
                    sx={{
                      textAlign: "center",
                      mx: 3,
                    }}
                  >
                    The OTP you have entered is invalid please re-enter the OTP
                    sent to your number +91&nbsp;{mobileNo}
                    &nbsp;
                    <Box
                      onClick={() => {
                        setShowMobileInput(true);
                        setOtpValue("");
                        setIsResendOtpClicked(false);
                        setOtpValidError(false);
                        setOtpHelperText("");
                      }}
                      component="span"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Edit&nbsp;number
                    </Box>
                  </Typography>
                ) : (
                  <Typography
                    variant="bodyparagraph"
                    sx={{
                      textAlign: "center",
                      mx: 3,
                    }}
                  >
                    We have {isResendOtpClicked ? "resent" : "initiated"} an OTP
                    to your number +91&nbsp;{mobileNo}
                    &nbsp;
                    <Box
                      onClick={() => {
                        setShowMobileInput(true);
                        setOtpValue("");
                        setIsResendOtpClicked(false);
                      }}
                      component="span"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Edit&nbsp;number
                    </Box>
                  </Typography>
                )}
                {/* input for otp div */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "flext-start",
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
                    value={otpValue}
                    onChange={(otp) => {
                      setOtpValue(otp);
                    }}
                  /> */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
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
                            border: otpValidError
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
                      value={otpValue}
                      onChange={(ev) => {
                        setOtpValue(ev.target.value.replace(/\D/, ""));
                        setOtpValidError(false);
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
                      {otpValidError ? otpHelperText : ""}
                    </Typography>
                  </Box>

                  {/* Proceed button */}
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!otpValidate || isLoginFetching}
                  >
                    Proceed
                    {isLoginFetching && (
                      <CircularProgress
                        size={24}
                        sx={{ ml: 2, color: "text.secondary" }}
                      />
                    )}
                  </Button>
                </Box>

                {/* Text for resend otp */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="bodyparagraph">
                    Didn't receive OTP?
                  </Typography>
                  {!countdownSeconds ? (
                    <Box
                      component="span"
                      onClick={(ev) => {
                        handleSendOTP(ev);
                        setIsResendOtpClicked(true);
                        setOtpValue("");
                        setOtpHelperText("");
                        setOtpValidError(false);
                      }}
                      sx={{
                        color: "text.secondary",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      <Typography variant="bodybold">Resend OTP</Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="bodybold"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      Resend OTP in {countdownSeconds} Seconds
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </form>
        )}
      </Drawer>

      {/* pre-order date and time modal */}
      <Modal
        open={isPreorderModalOpen}
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
            gap: "10px",
            maxHeight: "90%",
            background: "#FCFCFC",
            border: "1px solid #DFE2E6",
            borderRadius: "20px",
            overflowY: "scroll",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {/* Modal header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "20px",
              // width: "655px",
              // height: "71px",
              // background: "#FCFCFC",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              flex: "none",
              order: "0",
              alignSelf: "stretch",
              flexGrow: "0",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="header3">
              Select the date and time for Delivery
            </Typography>
            {/* Cancel icon */}
            <Box
              component="img"
              sx={{
                width: "24px",
                height: "24px",
                flex: "none",
                order: "1",
                flexGrow: "0",
                alignSelf: "flex-start",
                mt: "5px",
                cursor: "pointer",
              }}
              src="/media/svg/cross-circled.svg"
              onClick={() => {
                setIsPreorderModalOpen(false);
                setPreorderDayNameNA(preorderDayName);
                setDeliverySlotTimeNA(deliverySlotTime);
              }}
            />
          </Box>

          {/* Modal Body */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0px",
              gap: "25px",
              // width: "655px",
              // height: "300px",
              flex: "none",
              order: "1",
              flexGrow: "0",
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
              <Typography variant="bodybold">
                Choose the delivery date
              </Typography>
              {/* Calender box */}
              <Tabs
                value={preorderDayNameNA}
                onChange={(ev, newValue) => {
                  setPreorderDayNameNA(newValue);
                  setTriggerDeliverSlot(true);
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

                        <Typography variant="bodyparagraph">
                          {el.date}
                        </Typography>
                      </Box>
                    }
                    value={el.dayName}
                  ></Tab>
                ))}
              </Tabs>
            </Box>

            {/* time slot */}
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
              <Typography variant="bodybold">
                Choose the delivery slot
              </Typography>
              {/* <Tabs
                value={slotNA}
                onChange={(ev, newValue) => {
                  setSlotNA(newValue);
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
                      color: slotNA === el.slot ? "#FF774C" : "#2A3037",
                    }}
                    label={
                      <Typography variant="bodyparagraph">{el.slot}</Typography>
                    }
                    value={el.slot}
                  />
                ))}
              </Tabs> */}
              <FormControl sx={{ width: "180px" }}>
                <InputLabel id="phoneNumber">Delivery Slot</InputLabel>
                <Select
                  labelId="deliverySlots"
                  id="deliverySlots"
                  value={deliverySlotTimeNA}
                  label="Delivery Slots"
                  onChange={(ev) => {
                    setDeliverySlotTimeNA(ev.target.value);
                  }}
                >
                  {preorderDayNameNA?.split(",")[2] === format(new Date(), "dd")
                    ? deliverySlotsToday?.map((el, idx) => (
                        <MenuItem key={idx} value={el}>
                          {el}
                        </MenuItem>
                      ))
                    : deliverySlots?.map((el, idx) => (
                        <MenuItem key={idx} value={el}>
                          {el}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Box>

            {/* Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "0px 20px 20px",
                gap: "15px",
                // width: "655px",
                // height: "54px",
                flex: "none",
                order: "2",
                alignSelf: "stretch",
                flexGrow: "0",
              }}
            >
              <Button
                variant="text"
                sx={{ textTransform: "none" }}
                onClick={() => {
                  setIsPreorderModalOpen(false);
                  setPreorderDayNameNA(preorderDayName);
                  setDeliverySlotTimeNA(deliverySlotTime);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ width: "110px" }}
                onClick={() => {
                  setPreorderDayName(preorderDayNameNA);
                  // setPreorderDay(preorderDayNameNA?.split(",")[0]);
                  // setSlot(slotNA);
                  setDeliverySlotTime(deliverySlotTimeNA);
                  // let slotID = preorderSlots?.filter(
                  //   (el) => el.slot === slotNA
                  // );
                  // setSlotId(slotID[0].id);
                  setInvokeCookies(true);
                  setIsPreorderModalOpen(false);
                }}
              >
                Done
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* filters drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        // onClose={() => setIsDrawerOpen(false)}
        sx={{
          backgroundColor: `rgba(0,0,0,0.6)`,
        }}
        PaperProps={{
          sx: { width: "50%", minWidth: "300px", maxWidth: "600px" },
        }}
      >
        <Box
          sx={{
            // position: "absolute",
            // width: "559px",
            // height: "765px",
            // left: "807px",
            // top: "0px",
            background: "#FCFCFC",
          }}
        >
          {/* Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "20px",
              gap: "10px",
              position: "absolute",
              // width: "560px",
              // height: "96px",
              // left: "0px",
              // top: "669px",
              bottom: 0,
              width: `calc(100% - 40px)`,
              height: "54px",
              background: "#FCFCFC",
              boxShadow: "0px -6px 24px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Button for clear */}
            <Button
              variant="outlined"
              sx={{ width: `calc(100% - 30px)` }}
              onClick={() => {
                setHomeChefCheckedNA(false);
                setCloudKitchenCheckedNA(false);
                setVegNonVegCheckNA(null);
                setNonVegTypesNA([
                  { name: "Egg", checked: false },
                  { name: "Chicken", checked: false },
                  { name: "Mutton", checked: false },
                  { name: "Sea Food", checked: false },
                ]);
                clearCuisineChecked();
                setSpiceLevelsNA([
                  { name: "Mild", checked: false },
                  { name: "Medium", checked: false },
                  { name: "Hot", checked: false },
                ]);
                setRatingFourPlusNA(false);
                setRatingThreePlusNA(false);
                setMinimumPriceNA("");
                setMaximumPriceNA("");
              }}
            >
              Clear
            </Button>

            {/* Button for apply */}
            <Button
              variant="contained"
              onClick={() => {
                setIsDrawerOpen(false);
                setHomeChefChecked(homeChefCheckedNA);
                setCloudKitchenChecked(cloudKitchenCheckedNA);
                setVegNonVegCheck(vegNonVegCheckNA);
                setNonVegTypes(JSON.parse(JSON.stringify(nonVegTypesNA)));
                setCuisinesData(JSON.parse(JSON.stringify(cuisinesDataNA)));
                setSpiceLevels(JSON.parse(JSON.stringify(spiceLevelsNA)));
                setRatingFourPlus(ratingFourPlusNA);
                setRatingThreePlus(ratingThreePlusNA);
                setMinimumPrice(minimumPriceNA);
                setMaximumPrice(maximumPriceNA);
                setInvokeCookies(true);
              }}
              sx={{ width: `calc(100% - 30px)` }}
            >
              Apply
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              height: `calc(100% - 94px)`,
              width: "100%",
              background: "#FCFCFC",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            {/* Filter head */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
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
                  padding: "0px",
                  // width: "519px",
                  // height: "45px",
                  flex: "none",
                  order: 0,
                  alignSelf: "stretch",
                  flexGrow: 0,
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                {/* Filters text */}
                <Typography variant="header1">Filters</Typography>
                {/* cancel-icon */}
                <Box
                  component="img"
                  onClick={() => {
                    setIsDrawerOpen(false);
                  }}
                  sx={{
                    width: "24px",
                    height: "24px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                    cursor: "pointer",
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
                  flex: "none",
                  order: 1,
                  alignSelf: "stretch",
                  flexGrow: 0,
                }}
              />
            </Box>

            {/* Drawer Body */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px 20px",
                gap: "25px",
                // position: "absolute",
                // width: "518px",
                // height: "983px",
                // left: "21px",
                // top: "95px",
              }}
            >
              {/* chefType checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "119px",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                {/* Chef type text */}
                <Typography variant="header4">Chef type</Typography>

                {/* Chef type checkbox div */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    // gap: "15px",
                    // width: "185px",
                    // height: "63px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {/* Chef type checkbox  */}
                  <FormControlLabel
                    label={
                      <Typography
                        variant={
                          homeChefCheckedNA
                            ? "bodyboldhighlighted"
                            : "bodyparagraph"
                        }
                      >
                        Home Chefs
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={homeChefCheckedNA}
                        onChange={(ev) => {
                          setHomeChefCheckedNA(ev.target.checked);
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    label={
                      <Typography
                        variant={
                          cloudKitchenCheckedNA
                            ? "bodyboldhighlighted"
                            : "bodyparagraph"
                        }
                      >
                        Restaurants
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={cloudKitchenCheckedNA}
                        onChange={(ev) => {
                          setCloudKitchenCheckedNA(ev.target.checked);
                        }}
                      />
                    }
                  />
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Veg-Nonveg checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "119px",
                  flex: "none",
                  order: 1,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                {/* Veg non veg text */}
                <Typography variant="header4">Veg/Non-Veg</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    // gap: "15px",
                    // width: "137px",
                    // height: "63px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {/* <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          gap: "15px",
                          // width: "97px",
                          // height: "63px",
                          /* Inside auto layout 
                          flex: "none",
                          order: 0,
                          flexGrow: 0,
                        }}
                      > */}
                  <RadioGroup
                    // sx={{
                    //   gap: "15px",
                    // }}
                    value={vegNonVegCheckNA}
                    onChange={(ev) => {
                      setVegNonVegCheckNA(ev.target.value);
                      if (ev.target.value === "Veg") {
                        setNonVegTypesNA([
                          { name: "Egg", checked: false },
                          { name: "Chicken", checked: false },
                          { name: "Mutton", checked: false },
                          { name: "Sea Food", checked: false },
                        ]);
                      }
                    }}
                  >
                    <FormControlLabel
                      label={
                        <Typography
                          variant={
                            vegNonVegCheckNA === "Veg"
                              ? "bodyboldhighlighted"
                              : "bodyparagraph"
                          }
                        >
                          Veg
                        </Typography>
                      }
                      value="Veg"
                      control={<Radio />}
                    />

                    <FormControlLabel
                      label={
                        <Typography
                          variant={
                            vegNonVegCheckNA === "Non-Veg"
                              ? "bodyboldhighlighted"
                              : "bodyparagraph"
                          }
                        >
                          Non Veg
                        </Typography>
                      }
                      value="Non-Veg"
                      control={<Radio />}
                    />
                  </RadioGroup>

                  {vegNonVegCheckNA === "Non-Veg" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        // alignItems: "flex-start",
                        padding: "0px 30px",
                        // gap: "15px",
                        // width: "185px",
                        // height: "63px",
                        flex: "none",
                        order: 1,
                        flexGrow: 0,
                      }}
                    >
                      {nonVegTypesNA?.map((el, idx) => (
                        <FormControlLabel
                          key={idx}
                          label={
                            <Typography
                              variant={
                                el.checked
                                  ? "bodyboldhighlighted"
                                  : "bodyparagraph"
                              }
                            >
                              {el.name}
                            </Typography>
                          }
                          value={el.name}
                          control={
                            <Checkbox
                              checked={el.checked}
                              onChange={() => handleChangeNonVeg(idx)}
                            />
                          }
                        />
                      ))}
                    </Box>
                  )}
                  {/* </Box> */}
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Cuisine type checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "158px",
                  flex: "none",
                  order: 2,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                {/* cuisine type text */}
                <Typography variant="header4">Cuisines</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    // gap: "15px",
                    // width: "139px",
                    // height: "102px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {cuisinesDataNA?.map((el, idx) => (
                    <FormControlLabel
                      key={idx}
                      label={
                        <Typography
                          variant={
                            el.checked ? "bodyboldhighlighted" : "bodyparagraph"
                          }
                        >
                          {el.cuisineName}
                        </Typography>
                      }
                      value={el.cuisineName}
                      control={
                        <Checkbox
                          checked={el.checked ? true : false}
                          onChange={() => handleChangeCuisine(idx)}
                        />
                      }
                    />
                  ))}
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Spice level checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "158px",
                  flex: "none",
                  order: 2,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                {/* Spice level text */}
                <Typography variant="header4">Spice level</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    // gap: "15px",
                    // width: "139px",
                    // height: "102px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {/* <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          gap: "15px",
                          // width: "99px",
                          // height: "102px",
                          flex: "none",
                          order: 0,
                          flexGrow: 0,
                        }}
                      > */}
                  {spiceLevelsNA.map((el, idx) => (
                    <FormControlLabel
                      key={idx}
                      label={
                        <Typography
                          variant={
                            el.checked ? "bodyboldhighlighted" : "bodyparagraph"
                          }
                        >
                          {el.name}
                        </Typography>
                      }
                      value={el.name}
                      control={
                        <Checkbox
                          checked={el.checked}
                          onChange={() => handleChangeSpiceLevel(idx)}
                        />
                      }
                    />
                  ))}
                  {/* </Box> */}
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Rating checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "119px",
                  flex: "none",
                  order: 3,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                <Typography variant="header4">Rating</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    // gap: "15px",
                    // width: "167px",
                    // height: "63px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {/* <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          gap: "15px",
                          // width: "127px",
                          // height: "63px",
                          flex: "none",
                          order: 0,
                          flexGrow: 0,
                        }}
                      > */}

                  <FormControlLabel
                    label={
                      <Typography
                        variant={
                          ratingFourPlusNA
                            ? "bodyboldhighlighted"
                            : "bodyparagraph"
                        }
                      >
                        Rating 4+
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={ratingFourPlusNA}
                        onChange={(ev) => {
                          setRatingFourPlusNA(ev.target.checked);
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    label={
                      <Typography
                        variant={
                          ratingThreePlusNA
                            ? "bodyboldhighlighted"
                            : "bodyparagraph"
                        }
                      >
                        Rating 3+
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={ratingThreePlusNA}
                        onChange={(ev) => {
                          setRatingThreePlusNA(ev.target.checked);
                        }}
                      />
                    }
                  />
                  {/* </Box> */}
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>

              {/* Price range checkbox div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "518px",
                  // height: "119px",
                  flex: "none",
                  order: 3,
                  flexGrow: 0,
                  width: "100%",
                }}
              >
                <Typography variant="header4">Price Range</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px 20px",
                    gap: "15px",
                    // width: "167px",
                    // height: "63px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                  }}
                >
                  {/* Price range textfield */}
                  {/* <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          gap: "15px",
                          // width: "127px",
                          // height: "63px",
                          flex: "none",
                          order: 0,
                          flexGrow: 0,
                        }}
                      > */}
                  <TextField
                    id="minimum"
                    label="Minimum Price"
                    value={minimumPriceNA}
                    onChange={(ev) =>
                      setMinimumPriceNA(ev.target.value.replace(/\D/, ""))
                    }
                    // variant="outlined"
                    // sx={{ mt: 2, width: 150 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& > fieldset": { borderRadius: "15px" },
                      },
                    }}
                    inputProps={{ maxLength: 5 }}
                  />
                  <TextField
                    id="minimum"
                    label="Maximum Price"
                    value={maximumPriceNA}
                    onChange={(ev) =>
                      setMaximumPriceNA(ev.target.value.replace(/\D/, ""))
                    }
                    // variant="outlined"
                    inputProps={{ maxLength: 5 }}
                    // sx={{ mt: 2, width: 150 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& > fieldset": { borderRadius: "15px" },
                      },
                    }}
                  />
                  {/* </Box> */}
                </Box>
                <Box
                  sx={{
                    // width: "260px",
                    height: "0px",
                    border: "1px dashed #AAACAE",
                    flex: "none",
                    order: 2,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    width: "100%",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
