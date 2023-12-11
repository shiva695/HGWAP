import React, { useRef, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { getCart, getUser } from "../../../global/redux/actions";
import { reset } from "../../../global/redux/actions";
import EditIcon from "@mui/icons-material/Edit";
// import ShareIcon from "@mui/icons-material/Share";
import {
  emailValidation,
  mobileNoValidation,
  mobileNumHideFormat,
  orderNoFormat,
  otpValidation,
  ratingsGroup,
} from "../../../common/common";
import Header from "../../general-components/ui-components/Header";
import { toast } from "react-toastify";
import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { format } from "date-fns";

const libraries = ["places"];

const ProfileView = () => {
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies();

  const globalState = useSelector((state) => state);
  const {
    isFetching: isUserDataFetching,
    userData,
    userError,
    logout,
  } = globalState.userReducer;
  const { cartData } = globalState.cartReducer;

  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState("");
  const [maxFileSizeErr, setMaxFileSizeErr] = useState("");

  const [deleteAddressId, setDeleteAddressId] = useState("");
  const [deleteAddressElement, setDeleteAddressElement] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [updateAddressModal, setUpdateAddressModal] = useState(false);
  const [deleteAddressSuccess, setDeleteAddressSuccess] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [mobileNum, setMobileNum] = useState("");
  const [mobileNumError, setMobileNumError] = useState(false);
  const [mobileNumHelperText, setMobileNumHelperText] = useState("");
  const [isVerifyMobileFetching, setIsVerifyMobileFetching] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpValidError, setOtpValidError] = useState(false);
  const [otpHelperText, setOtpHelperText] = useState("");
  const [isSendOtpFetching, setIsSendOtpFetching] = useState(false);
  const [isChangeNumFetching, setIsChangeNumFetching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [accountEdit, setAccountEdit] = useState(false);
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState(false);
  const [fullNameHelperText, setFullNameHelperText] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");
  const [isUpdateUserFetching, setIsUpdateUserFetching] = useState(false);
  const [isDeleteAddressFetching, setIsDeleteAddressFetching] = useState(false);

  const [favouritesChefsData, setFavouritesChefData] = useState([]);
  const [invokeFavouriteChefs, setInvokeFavouriteChefs] = useState(true);
  const [isFavouriteChefFetching, setIsFavouriteChefFetching] = useState(false);

  const [updateAddressElement, setUpdateAddressElement] = useState(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [streetAddressError, setStreetAddressError] = useState(false);
  const [streetAddressHelperText, setStreetAddressHelperText] = useState("");

  const [locality, setLocality] = useState("");
  const [localityError, setLocalityError] = useState(false);
  const [localityHelperText, setLocalityHelperText] = useState("");

  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState(false);
  const [cityHelperText, setCityHelperText] = useState("");

  const [state, setState] = useState("");
  const [stateError, setStateError] = useState(false);
  const [stateHelperText, setStateHelperText] = useState("");

  const [country, setCountry] = useState("");

  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState(false);
  const [pincodeHelperText, setPincodeHelperText] = useState("");

  const [addressTagOthersText, setAddressTagOthersText] = useState("");
  const [addressTagError, setAddressTagError] = useState(false);
  const [addressTagHelperText, setAddressTagHelperText] = useState("");

  const [markerPosition, setMarkerPosition] = useState({
    lat: null,
    lng: null,
  });
  const [autocomplete, setAutocomplete] = useState(null);
  const [isUpdateAddressFetching, setIsUpdateAddressFetching] = useState(false);
  const [addressTag, setAddressTag] = useState(null);

  const [primary, setPrimary] = useState(false);
  const [showPrimary, setShowPrimary] = useState(true);

  const countdownTime = 59;
  const [countdownSeconds, setCountdownSeconds] = useState(countdownTime);

  const [referralCode, setReferralCode] = useState("");
  const [referralCodeError, setReferralCodeError] = useState(false);
  const [referralCodeHelperText, setReferralCodeHelperText] = useState("");
  const [isUpdateReferralFetching, setIsUpdateReferralFetching] =
    useState(false);

  const [invokeRewardsCount, setInvokeRewardsCount] = useState(true);
  const [invokeRewards, setInvokeRewards] = useState(true);
  const [rewardsCount, setRewardsCount] = useState(null);
  const [rewardsHistory, setRewardsHistory] = useState(null);

  const [invokeGetConfig, setInvokeGetConfig] = useState(true);
  const [configDiscount, setConfigDiscount] = useState(null);
  const [configReferral, setConfigReferral] = useState(null);

  // share link
  // const handleShare = () => {
  //   if (navigator.share) {
  //     navigator.share({
  //       title: "Referral Code",
  //       text: "CheffyHub is an online food-ordering platform built for Home Chefs (without a dining facility) and homemade food lovers.",
  //       url: "https://cheffyhub.com/",
  //     });
  //   }
  // };

  // deleting address if user added to cart having same;
  const deleteAddressInCart = async () => {
    if (openDeleteModal) {
      let findAddressInCart = cartData?.findIndex(
        (el) => el.userAddressId === deleteAddressElement.id
      );
      if (findAddressInCart > -1) {
        cartData.splice(findAddressInCart, 1);
        let params = {
          cartData: JSON.stringify(cartData),
        };
        let response = await invokeApi(
          config.apiDomains.orderService + apiList.updateCart,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            dispatch(getCart({ cookies }));
            deleteAddress();
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
      } else {
        deleteAddress();
      }
    }
  };

  // if profileImage icon is not their showing letter Icon
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
          width: 100,
          height: 100,
          fontSize: 48,
        },
        children: `${name.split(" ")[0][0]}`,
      };
    }
  };

  // Upload file to S3, get the URL and update user profile pic with this URL.
  const handleFileUpload = async (ev) => {
    const fileUploaded = ev.target.files[0];
    let acceptProfileFileTypes = fileUploaded.type.match(
      /^image\/(jpe?g|png|gif)/
    );
    if (fileUploaded && acceptProfileFileTypes) {
      if (fileUploaded.size < 5242880) {
        setPreviewFile(window.URL.createObjectURL(fileUploaded));
        setMaxFileSizeErr("");

        // File upload
        let formData = new FormData();
        formData.append("file", fileUploaded);
        formData.append("path", "profile_pictures");

        let response = await invokeFormDataApi(
          config.apiDomains.commonService + apiList.uploadFile,
          formData,
          cookies
        );

        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            // Update user profile image
            let params = {
              id: cookies[config.cookieName].loginUserId,
              fullName: userData.user.fullName,
              profileImage: response.data.imageUrl,
            };

            let updateUserResponse = await invokeApi(
              config.apiDomains.userService + apiList.updateUser,
              params,
              cookies
            );
            if (
              updateUserResponse.status >= 200 &&
              updateUserResponse.status < 300
            ) {
              if (updateUserResponse.data.responseCode === "200") {
                dispatch(
                  getUser({
                    id: cookies[config.cookieName].loginUserId,
                    cookies,
                  })
                );
              } else {
                alert(
                  "Something went wrong while updating profile picture. Please try again later!"
                );
              }
            } else if (updateUserResponse.status === 401) {
              navigate("/logout");
            } else {
              alert(
                "Something went wrong while updating profile picture. Please try again later!!"
              );
            }
          } else {
            alert(
              "Something went wrong while uploading profile picture. Please try again later!"
            );
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading profile picture. Please try again later!!"
          );
        }
      } else {
        setMaxFileSizeErr("Please upload an image having less than 5MB size");
      }
    } else {
      setMaxFileSizeErr(
        "Please upload a valid image in jpeg/jpg/png/gif format"
      );
    }
  };

  // Verify Mobile Number
  const verifyMobileNumber = async (ev) => {
    ev.preventDefault(ev);

    const mobileNoValidate = mobileNoValidation(mobileNum);

    if (mobileNoValidate) {
      setIsVerifyMobileFetching(true);
      let params = {
        countryCode: "+91",
        mobileNumber: mobileNum,
      };

      let response = await invokeApi(
        config.apiDomains.userService + apiList.verifyMobile,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (response.data.responseMessage === "Already exist") {
            setMobileNumHelperText(
              "A different account already exists for this mobile number"
            );
            setMobileNumError(true);
            setIsVerifyMobileFetching(false);
          } else if (response.data.responseMessage === "Does not exist") {
            setMobileNumHelperText("");
            setMobileNumError(false);
            setIsVerifyMobileFetching(false);

            // call send otp if mobile number doesn't exists
            handleSendOTP();
          } else {
            alert(
              "Something went wrong while verifying new mobile number. Please try again later!"
            );
            setIsVerifyMobileFetching(false);
          }
        } else {
          alert(
            "Something went wrong while verifying new mobile number. Please try again later!!"
          );
          setIsVerifyMobileFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while verifying new mobile number. Please try again later!!!"
        );
        setIsVerifyMobileFetching(false);
      }
    } else {
      setMobileNumError(true);
      setMobileNumHelperText("Please enter a valid mobile number");
    }
  };

  // Send / Resend otp
  const handleSendOTP = async () => {
    const mobileNoValidate = mobileNoValidation(mobileNum);
    if (mobileNoValidate) {
      setIsSendOtpFetching(true);

      let params = {
        countryCode: "+91",
        mobileNumber: mobileNum,
        actionType: "ChangeMobile",
      };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.sendOtp,
        params
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
      setMobileNumError(true);
      setMobileNumHelperText("Please enter a valid mobile number");
    }
  };

  // Change mobile number
  const changeMobileNumber = async (ev) => {
    ev.preventDefault(ev);
    const otpValidate = otpValidation(otp);
    if (otpValidate) {
      setIsChangeNumFetching(true);
      let params = {
        countryCode: "+91",
        mobileNumber: mobileNum,
        otp: otp,
        actionType: "ChangeMobile",
      };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.changeMobile,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsChangeNumFetching(false);
          setModalOpen(false);
          setDialogOpen(true);
        } else if (response.data.responseCode === "HE001") {
          setOtpValidError(true);
          setOtpHelperText("Invalid OTP. Please enter correct OTP.");
          setIsChangeNumFetching(false);
        } else {
          alert(
            "Something went wrong while changing mobile number. Please try again later!"
          );
          setIsChangeNumFetching(false);
        }
      } else {
        alert(
          "Something went wrong while changing mobile number. Please try again later!!"
        );
        setIsChangeNumFetching(false);
      }
    } else {
      setOtpValidError(true);
      setOtpHelperText("Please enter a valid OTP");
    }
  };

  const deleteAddress = async () => {
    setIsDeleteAddressFetching(true);
    setDeleteAddressSuccess(false);
    let params = {
      id: deleteAddressId,
    };

    let response = await invokeApi(
      config.apiDomains.userService + apiList.deleteAddress,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        if (
          deleteAddressId ===
          cookies[config.preferencesCookie]?.deliveryAddress.id
        ) {
          let filterPrimaryAddress = userData?.user.addresses.filter(
            (el) => el.isPrimary === "Yes"
          );
          if (filterPrimaryAddress.length > 0) {
            setCookie(
              config.preferencesCookie,
              JSON.stringify({
                ...cookies[config.preferencesCookie],
                deliveryAddress: {
                  id: filterPrimaryAddress[0].id,
                  streetAddress: filterPrimaryAddress[0].streetAddress,
                  city: filterPrimaryAddress[0].city,
                  state: filterPrimaryAddress[0].state,
                  locality: filterPrimaryAddress[0].locality,
                  country: filterPrimaryAddress[0].country,
                  pincode: filterPrimaryAddress[0].pincode,
                  latitude: filterPrimaryAddress[0].latitude,
                  longitude: filterPrimaryAddress[0].longitude,
                  addressTag: filterPrimaryAddress[0].addressTag,
                  isPrimary: "Yes",
                },
              }),
              {
                path: "/",
                maxAge: 3000000,
                sameSite: "strict",
              }
            );
          }
        }
        setDeleteAddressSuccess(true);
        setOpenDeleteModal(false);
        setIsDeleteAddressFetching(false);
      } else {
        alert(
          "Something went wrong while deleting address. Please try again later!"
        );
        setIsDeleteAddressFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while deleting address. Please try again later!!"
      );
      setIsDeleteAddressFetching(false);
    }
  };

  const updateReferral = async (ev) => {
    ev.preventDefault();
    setIsUpdateReferralFetching(true);
    let params = {
      referralCode,
    };
    let response = await invokeApi(
      config.apiDomains.userService + apiList.updateReferralCode,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setIsUpdateReferralFetching(false);
        setReferralModalOpen(false);
        dispatch(
          getUser({ id: cookies[config.cookieName].loginUserId, cookies })
        );
      } else if (response.data.responseCode === "HE013") {
        setReferralCodeError(true);
        setReferralCodeHelperText(
          "Referral code already exist. Please try another."
        );
        setIsUpdateReferralFetching(false);
      } else {
        alert(
          "Something went wrong while updating referral code. Please try again later!"
        );
        setIsUpdateReferralFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating referral code. Please try again later!!"
      );
      setIsUpdateReferralFetching(false);
    }
  };

  // Relogin function while changing mobile number
  const reLoginHandler = () => {
    removeCookie(config.cookieName);
    dispatch(reset());
    setDialogOpen(false);
    navigate("/login", { replace: true });
  };

  // handle update profile
  const handleUpdateProfile = async (ev) => {
    ev.preventDefault();
    let validationErrors = false;

    if (fullName.trim().length < 3) {
      setFullNameError(true);
      setFullNameHelperText("Please enter a valid name");
      validationErrors = true;
    }

    if (email) {
      const emailValidate = emailValidation(email);
      if (!emailValidate) {
        setEmailError(true);
        setEmailHelperText("Please enter valid email address");
        validationErrors = true;
      }
    }

    // When no validation errors
    if (!validationErrors) {
      setIsUpdateUserFetching(true);
      let params = {
        id: cookies[config.cookieName].loginUserId,
        fullName,
        email,
        profileImage: userData.user?.profileImage ?? null,
      };

      let response = await invokeApi(
        config.apiDomains.userService + apiList.updateUser,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          dispatch(
            getUser({ id: cookies[config.cookieName].loginUserId, cookies })
          );
          setAccountEdit(false);
          setIsUpdateUserFetching(false);
        } else {
          alert(
            "Something went wrong while updating profile.Please try again later!"
          );
          setIsUpdateUserFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating profile.Please try again later!!"
        );
        setIsUpdateUserFetching(false);
      }
    }
  };

  // remove favourite
  const removeFavourite = async (id, chefType) => {
    let params = {
      homeChefId: chefType === "homeChef" ? id : null,
      cloudKitchenOutletId: chefType === "cloudKitchen" ? id : null,
    };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.removeFavorite,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Removed from favourite list!!");
        setInvokeFavouriteChefs(true);
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
  };

  const onMarkerDragEnd = (coords) => {
    setMarkerPosition({
      lat: coords.latLng.lat(),
      lng: coords.latLng.lng(),
    });
  };

  const mapCenterMoved = () => {
    setMarkerPosition({
      lat: mapRef.current.getCenter().lat(),
      lng: mapRef.current.getCenter().lng(),
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null && !!autocomplete.getPlace().geometry?.location) {
      setMarkerPosition({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  const onAutoCompleteLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  // handle update address
  const handleUpdateAddress = async (ev) => {
    ev.preventDefault();
    let validationErrors = false;

    if (!streetAddress) {
      setStreetAddressError(true);
      setStreetAddressHelperText("Please enter your street address");
      validationErrors = true;
    }

    if (!city) {
      setCityError(true);
      setCityHelperText("Please enter your city");
      validationErrors = true;
    }

    if (!locality) {
      setLocalityError(true);
      setLocalityHelperText("Please enter your locality");
      validationErrors = true;
    }

    if (!state) {
      setStateError(true);
      setStateHelperText("Please select your state");
      validationErrors = true;
    }

    if (!pincode) {
      setPincodeError(true);
      setPincodeHelperText("Please enter your pincode");
      validationErrors = true;
    }

    if (!country || !markerPosition.lat || !markerPosition.lng) {
      validationErrors = true;
    }

    if (addressTag !== "Home" && addressTag !== "Work" && addressTag === "") {
      setAddressTagError(true);
      setAddressTagHelperText("Please enter address type");
      validationErrors = true;
    }

    if (!validationErrors) {
      setIsUpdateAddressFetching(true);
      let params = {
        id: updateAddressElement?.id,
        streetAddress: streetAddress,
        city: city,
        state: state,
        locality: locality,
        country: country,
        pincode: pincode,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
        addressTag: addressTag,
        isPrimary: primary === true ? "Yes" : "No",
      };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.updateAddress,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (
            updateAddressElement?.id ===
            cookies[config.preferencesCookie]?.deliveryAddress.id
          ) {
            setCookie(
              config.preferencesCookie,
              JSON.stringify({
                ...cookies[config.preferencesCookie],
                deliveryAddress: {
                  id: updateAddressElement?.id,
                  streetAddress: streetAddress,
                  city: city,
                  state: state,
                  locality: locality,
                  country: country,
                  pincode: pincode,
                  latitude: markerPosition.lat,
                  longitude: markerPosition.lng,
                  addressTag: addressTag,
                  isPrimary: primary === true ? "Yes" : "No",
                },
              }),
              {
                path: "/",
                maxAge: 3000000,
                sameSite: "strict",
              }
            );
          }
          dispatch(
            getUser({ id: cookies[config.cookieName].loginUserId, cookies })
          );
          toast.success("Address updated successfully");
          setIsUpdateAddressFetching(false);
          setUpdateAddressModal(false);
        } else {
          alert(
            "Something went wrong while updating address. Please try again later!"
          );
          setIsUpdateAddressFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating address. Please try again later!!"
        );
        setIsUpdateAddressFetching(false);
      }
    }
  };

  // get gst config
  useEffect(() => {
    const configKey = ["ReferralDiscount", "ReferrerRewards"];
    const getConfig = async () => {
      for (let i = 0; i < configKey.length; i++) {
        let params = {
          configKey: configKey[i],
        };
        let response = await invokeApi(
          config.apiDomains.commonService + apiList.getConfig,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            configKey[i] === "ReferralDiscount" &&
              setConfigDiscount(response.data.config.configValue);
            configKey[i] === "ReferrerRewards" &&
              setConfigReferral(response.data.config.configValue);
          } else {
            alert(
              "Something went wrong while fetching config. Please try again later!"
            );
          }
        } else {
          alert(
            "Something went wrong while fetching config. Please try again later!!"
          );
        }
      }
    };
    if (invokeGetConfig) {
      setInvokeGetConfig(false);
      getConfig();
    }
  }, [invokeGetConfig, cookies]);

  // getRewardsCount
  useEffect(() => {
    const getRewardsCount = async () => {
      let params = {};
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getRewardsCount,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setRewardsCount(response.data.totalRewardCount);
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

  // getRewards Data
  useEffect(() => {
    const getRewards = async () => {
      let params = { limit: 999999 };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getRewards,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setRewardsHistory(response.data.rewards);
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
    if (invokeRewards) {
      setInvokeRewards(false);
      getRewards();
    }
  }, [cookies, invokeRewards]);
  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Profile";
  }, []);

  // On load, get user
  useEffect(() => {
    dispatch(getUser({ id: cookies[config.cookieName].loginUserId, cookies }));
  }, [cookies, dispatch]);

  // on user data fetch, if user has profile data, stop loading.
  // If not, take user to create profile page
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.fullName) {
        setFullName(userData.user.fullName);
        setEmail(userData.user.email);
        setReferralCode(userData?.user.referralCode);
        setIsLoading(false);
      } else {
        navigate("/create-profile", { replace: true });
      }
    }
  }, [userData, navigate]);

  // On failure of user data fetch
  useEffect(() => {
    if (userError) {
      alert("Something went wrong while fetching user details");
    }
  }, [userError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

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

  // On delete address success, get user details
  // todo :: check what happens if user deletes the address that is currently selected as delivery address on home
  useEffect(() => {
    if (deleteAddressSuccess) {
      setDeleteAddressSuccess(false);
      toast.success("Address deleted successfully");
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );
    }
  }, [deleteAddressSuccess, cookies, dispatch]);

  // Get favourites chefs
  useEffect(() => {
    const getFavoritesChefs = async () => {
      setIsFavouriteChefFetching(true);
      let params = {};
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getFavorites,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setFavouritesChefData(response.data.favoriteChefs);
          setIsFavouriteChefFetching(false);
        } else {
          alert(
            "Something went wrong while get Active Orders By User. Please try again later!"
          );
          setIsFavouriteChefFetching(false);
        }
      } else {
        alert(
          "Something went wrong while get Active Orders By User. Please try again later!!"
        );
        setIsFavouriteChefFetching(false);
      }
    };
    if (invokeFavouriteChefs) {
      setInvokeFavouriteChefs(false);
      getFavoritesChefs();
    }
  }, [invokeFavouriteChefs, cookies]);

  // Populate the update address form data when modal opens
  useEffect(() => {
    if (updateAddressModal && updateAddressElement) {
      setStreetAddress(updateAddressElement?.streetAddress);
      setLocality(updateAddressElement?.locality);
      setCity(updateAddressElement?.city);
      setState(updateAddressElement?.state);
      setCountry(updateAddressElement?.country);
      setPincode(updateAddressElement?.pincode);
      setMarkerPosition({
        lat: parseFloat(updateAddressElement?.latitude),
        lng: parseFloat(updateAddressElement?.longitude),
      });
      setAddressTag(updateAddressElement?.addressTag);
      if (
        updateAddressElement?.addressTag !== "Work" &&
        updateAddressElement?.addressTag !== "Home"
      ) {
        setAddressTagOthersText(updateAddressElement?.addressTag);
      }
      setPrimary(updateAddressElement?.isPrimary === "Yes" ? true : false);
      setShowPrimary(updateAddressElement?.isPrimary === "Yes" ? true : false);
    }
  }, [updateAddressElement, updateAddressModal]);

  // On change of markerPosition, set the address fields
  useEffect(() => {
    if (markerPosition.lat && markerPosition.lng) {
      let url =
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        markerPosition.lat +
        "," +
        markerPosition.lng +
        "&key=" +
        config.googleMapsApiKey;

      fetch(url, {
        method: "get",
      }).then((response) => {
        response.json().then((res) => {
          if (res.results.length > 0) {
            let data = res.results[0].address_components;
            if (data.length > 0) {
              let address = [];
              let stateVal = "";
              let cityVal = "";
              let localityVal = "";
              let pincodeVal = "";
              let countryVal = "";

              data.forEach((element) => {
                if (element.types.includes("country")) {
                  countryVal = element.long_name;
                } else if (element.types.includes("postal_code")) {
                  pincodeVal = element.long_name;
                } else if (
                  element.types.includes("administrative_area_level_1")
                ) {
                  stateVal = element.long_name;
                } else if (element.types.includes("sublocality_level_1")) {
                  localityVal = element.long_name;
                } else if (element.types.includes("locality")) {
                  cityVal = element.long_name;
                } else if (
                  element.types.includes("premise") ||
                  element.types.includes("street_number") ||
                  element.types.includes("route") ||
                  element.types.includes("sublocality")
                ) {
                  address = [...address, element.long_name];
                }
              });

              setStreetAddress(address.join(", "));
              setStreetAddressError(false);
              setStreetAddressHelperText("");
              setLocality(localityVal);
              setLocalityError(false);
              setLocalityHelperText("");
              setCity(cityVal);
              setCityError(false);
              setCityHelperText("");
              setState(stateVal);
              setStateError(false);
              setStateHelperText("");
              setCountry(countryVal);
              setPincode(pincodeVal);
              setPincodeError(false);
              setPincodeHelperText("");
            }
          }
        });
      });
    }
  }, [markerPosition]);

  return (
    <>
      <Header />
      {isLoading ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            background: "#FCFCFC",
            mt: 3,
            alignItems: "center",
          }}
        >
          {/* Profile data */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "6px",
            }}
          >
            {userData?.user.profileImage || previewFile ? (
              <Box
                sx={{
                  width: "100px",
                  height: "108px",
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
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    // top: "0px",
                  }}
                  src={!!previewFile ? previewFile : userData.user.profileImage}
                />
                {/* <Box
                  component="img"
                  sx={{
                    position: "absolute",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    top: "8px",
                    opacity: "0.3",
                    filter: `blur(8.5px)`,
                  }}
                  src={!!previewFile ? previewFile : userData.user.profileImage}
                /> */}
              </Box>
            ) : (
              <Avatar
                {...stringAvatar(userData?.user.fullName.toUpperCase())}
              />
            )}

            <Box>
              <Typography variant="bodyregular" color={"error"}>
                {maxFileSizeErr}
              </Typography>

              <input
                id="profile-pic"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />

              <label htmlFor="profile-pic">
                <Typography
                  variant="bodyparagraph"
                  sx={{
                    textDecorationLine: "underline",
                    cursor: "pointer",
                  }}
                >
                  Change your Picture
                </Typography>
              </label>
            </Box>

            {/* Name and phone number */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px",
                gap: "16px",
              }}
            >
              <Typography variant="header3">
                {userData.user.fullName}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px",
                  gap: "16px",
                }}
              >
                <Typography variant="header4">
                  +91 {userData.user.mobileNumber}
                </Typography>
                <Button
                  variant="text"
                  sx={{ textTransform: "none" }}
                  onClick={() => setModalOpen(true)}
                >
                  <Typography variant="bodybold" sx={{ fontSize: "14px" }}>
                    Change
                  </Typography>
                </Button>
              </Box>
            </Box>
          </Box>
          {/* Tabs */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Tabs
              value={tabIndex}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab
                label={
                  <Typography
                    variant="bodybold"
                    sx={
                      tabIndex === 0
                        ? {
                            fontSize: "14px",
                            color: "#FCFCFC",
                          }
                        : {
                            fontWeight: "500",
                            fontSize: "14px",
                            color: "text.primary",
                          }
                    }
                  >
                    My Account
                  </Typography>
                }
                sx={{
                  background:
                    tabIndex === 0
                      ? "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)"
                      : "",
                  borderRadius: "20px",
                  textTransform: "none",
                }}
                onClick={() => setTabIndex(0)}
              />
              <Tab
                label={
                  <Typography
                    variant="bodybold"
                    sx={
                      tabIndex === 1
                        ? {
                            fontSize: "14px",
                            color: "#FCFCFC",
                          }
                        : {
                            fontWeight: "500",
                            fontSize: "14px",
                            color: "text.primary",
                          }
                    }
                  >
                    Address
                  </Typography>
                }
                sx={{
                  background:
                    tabIndex === 1
                      ? "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)"
                      : "",
                  borderRadius: "20px",
                  textTransform: "none",
                }}
                onClick={() => setTabIndex(1)}
              />
              <Tab
                label={
                  <Typography
                    variant="bodybold"
                    sx={
                      tabIndex === 2
                        ? {
                            fontSize: "14px",
                            color: "#FCFCFC",
                          }
                        : {
                            fontWeight: "500",
                            fontSize: "14px",
                            color: "text.primary",
                          }
                    }
                  >
                    Rewards
                  </Typography>
                }
                sx={{
                  background:
                    tabIndex === 2
                      ? "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)"
                      : "",
                  borderRadius: "20px",
                  textTransform: "none",
                }}
                onClick={() => setTabIndex(2)}
              />
              <Tab
                label={
                  <Typography
                    variant="bodybold"
                    sx={
                      tabIndex === 3
                        ? {
                            fontSize: "14px",
                            color: "#FCFCFC",
                          }
                        : {
                            fontWeight: "500",
                            fontSize: "14px",
                            color: "text.primary",
                          }
                    }
                  >
                    Favourites
                  </Typography>
                }
                sx={{
                  background:
                    tabIndex === 3
                      ? "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)"
                      : "",
                  borderRadius: "20px",
                  textTransform: "none",
                }}
                onClick={() => setTabIndex(3)}
              />
            </Tabs>
          </Box>
          {/* My Account tab data */}
          {tabIndex === 0 && (
            <Box
              sx={{
                boxSizing: "border-box",
                height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: "90%",
                my: 1,
                p: 2,
              }}
            >
              <form onSubmit={handleUpdateProfile}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="header4">Personal Details</Typography>
                  {!accountEdit && (
                    <Button
                      variant="text"
                      sx={{
                        textTransform: "none",
                        textDecoration: "underline",
                      }}
                      onClick={() => setAccountEdit(true)}
                    >
                      <Typography variant="bodybold">Edit</Typography>
                    </Button>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                    maxWidth: "500px",
                    // py: 2,
                  }}
                >
                  <TextField
                    id="fullName"
                    label="Name *"
                    value={fullName}
                    variant="standard"
                    onChange={(ev) => {
                      setFullName(ev.target.value);
                      setFullNameError(false);
                      setFullNameHelperText("");
                    }}
                    error={fullNameError}
                    helperText={fullNameHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
                    disabled={!accountEdit}
                    inputProps={{
                      maxLength: 30,
                      style: { WebkitTextFillColor: "#2A3037" },
                    }}
                    InputLabelProps={{
                      style: { color: "#2A3037" },
                    }}
                  />

                  <TextField
                    id="email"
                    label="Email"
                    value={email}
                    variant="standard"
                    onChange={(ev) => {
                      setEmail(ev.target.value);
                      setEmailError(false);
                      setEmailHelperText("");
                    }}
                    error={emailError}
                    helperText={emailHelperText}
                    sx={{ mt: 1, mb: 2 }}
                    fullWidth
                    disabled={!accountEdit}
                    inputProps={{ style: { WebkitTextFillColor: "#2A3037" } }}
                    InputLabelProps={{
                      style: { color: "#2A3037" },
                    }}
                  />
                </Box>

                {/* Cancel and Save buttons */}
                {accountEdit && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      padding: "25px 30px",
                      gap: "20px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setAccountEdit(false);
                        setFullName(userData.user.fullName);
                        setEmail(userData.user.email);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isUpdateUserFetching}
                    >
                      Save
                      {isUpdateUserFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  </Box>
                )}
              </form>
            </Box>
          )}
          {/* Address tab data */}
          {tabIndex === 1 && (
            <Box
              sx={{
                boxSizing: "border-box",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: "90%",
                my: 1,
                p: 2,
              }}
            >
              {/* Heading */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pb: 2,
                }}
              >
                <Typography variant="header4">Saved Address</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/add-address")}
                >
                  Add New Address
                </Button>
              </Box>

              {/* Addresses main box */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Grid
                  container
                  direction="row"
                  alignItems="stretch"
                  spacing={2}
                >
                  {userData?.user.addresses.map((el, idx) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      xl={4}
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Single inner box */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          gap: "15px",
                          alignSelf: "stretch",
                          padding: "16px",
                          background: "#FCFCFC",
                          border: "1px solid #DFE2E6",
                          borderRadius: "15px",
                          position: "relative",
                          flexGrow: 1,
                        }}
                      >
                        {/* Primary tag */}
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

                        {/* Address content */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "15px",
                            alignSelf: "stretch",
                            flexGrow: 1,
                          }}
                        >
                          {/* Icon and address tag */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "10px",
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
                          <Typography variant="bodyregular">
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

                          {/* Edit and Delete */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              width: "100%",
                              mt: "auto",
                            }}
                          >
                            {/* Edit */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "10px",
                                gap: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setUpdateAddressModal(true);
                                setUpdateAddressElement(el);
                              }}
                            >
                              <Box
                                component={"img"}
                                sx={{ width: "20px", height: "20px" }}
                                src="/media/svg/edit-filled-orange.svg"
                              />
                              <Typography
                                variant="bodybold"
                                sx={{ color: "primary.main" }}
                              >
                                Edit
                              </Typography>
                            </Box>

                            {/* Delete */}
                            {el.isPrimary === "Yes" ? (
                              <></>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  padding: "10px",
                                  gap: "10px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setDeleteAddressId(el.id);
                                  setDeleteAddressElement(el);
                                  setOpenDeleteModal(true);
                                }}
                              >
                                <Box
                                  component={"img"}
                                  sx={{ width: "20px", height: "20px" }}
                                  src="/media/svg/delete-filled-orange.svg"
                                />
                                <Typography
                                  variant="bodybold"
                                  sx={{ color: "primary.main" }}
                                >
                                  Delete
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}
          {/* Rewards tab data */}
          {tabIndex === 2 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxSizing: "border-box",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: "90%",
                my: 1,
                p: 5,
              }}
            >
              {/* Refferal Code */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "30px",
                }}
              >
                <TextField
                  id="referralCode"
                  label="Referral Code"
                  value={userData?.user?.referralCode}
                  disabled={true}
                  InputProps={{
                    readOnly: true,
                  }}
                  inputProps={{ style: { WebkitTextFillColor: "#2A3037" } }}
                  InputLabelProps={{
                    style: { color: "#2A3037" },
                  }}
                  variant="standard"
                />
                <Button
                  variant="text"
                  sx={{ textTransform: "none" }}
                  onClick={() => setReferralModalOpen(true)}
                >
                  <Typography variant="bodybold" sx={{ fontSize: "14px" }}>
                    Change Referral Code
                  </Typography>
                </Button>
              </Box>

              {/* <Card variant="outlined" sx={{ backgroundColor: "#fcb160" }}>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Typography variant="bodybold" color={"#fff"}>
                    Share your referral code with your friends. They will get
                    ₹100 discount on their first order. You will get ₹50 for
                    every referral.
                  </Typography>
                  <ShareIcon sx={{ cursor: "pointer" }} onClick={handleShare} />
                </CardContent>
              </Card> */}
              <Typography variant="bodyregular">
                Share this referral code with your friends. They will get ₹
                {configDiscount} discount on their first order. You will get ₹
                {configReferral} for every referral.
              </Typography>

              {!!rewardsCount && (
                <Typography variant="bodyparagraph">
                  Available Rewards :{" "}
                  <Typography
                    variant="bodybold"
                    sx={{ color: rewardsCount > 0 ? "green" : "black" }}
                  >
                    {rewardsCount.toFixed(2)}
                  </Typography>
                </Typography>
              )}

              {rewardsHistory?.length > 0 && (
                <>
                  <Typography variant="header4">Rewards History</Typography>
                  <TableContainer component={Paper}>
                    <Table
                      sx={{ minWidth: 650 }}
                      size="small"
                      aria-label="a dense table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Date</TableCell>
                          <TableCell align="right">Rewards</TableCell>
                          <TableCell align="left">Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rewardsHistory?.map((row, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {format(new Date(row.createdDate), "dd-MMM-yyyy")}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="bodybold"
                                sx={{ color: row.reward > 0 ? "green" : "red" }}
                              >
                                {row.reward.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="left">
                              <Typography variant="bodyregular">
                                {!!row.encashedForOrder &&
                                  `Encashed for order #${orderNoFormat(
                                    row.encashedForOrder.toString()
                                  )}`}
                                {!!row.referringMobileNumber &&
                                  `For referring ${mobileNumHideFormat(
                                    row.referringMobileNumber
                                  )}`}
                                {!!row.adjCommForOrder &&
                                  `Adjusted commission for order #${orderNoFormat(
                                    row.adjCommForOrder.toString()
                                  )}`}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}

          {/* Favourites tab data */}
          {tabIndex === 3 && (
            <Box
              sx={{
                boxSizing: "border-box",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: "90%",
                my: 1,
                p: 2,
              }}
            >
              {isFavouriteChefFetching ? (
                <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
                  <CircularProgress sx={{ display: "flex", margin: "auto" }} />
                </Box>
              ) : favouritesChefsData.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Grid
                    container
                    direction="row"
                    alignItems="stretch"
                    spacing={2}
                  >
                    {favouritesChefsData?.map((el, idx) => (
                      <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={idx}>
                        {/* Single inner box */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            gap: "13px",
                            // alignSelf: "stretch",
                            padding: "16px",
                            background: "#FCFCFC",
                            border: "1px solid #DFE2E6",
                            borderRadius: "13px",
                            cursor: "pointer",
                            // flexGrow: 1,
                          }}
                          onClick={() => {
                            if (el.homeChefId) {
                              navigate(
                                `/chef/${el.homeChefName.replace(
                                  /\s+/g,
                                  "-"
                                )}/${el.homeChefId}`
                              );
                            } else if (el.cloudKitchenOutletId) {
                              navigate(
                                `/restaurant/${el.cloudKitchenName.replace(
                                  /\s+/g,
                                  "-"
                                )}/${el.cloudKitchenOutletId}`
                              );
                            }
                          }}
                        >
                          {/* Inner box image name and chef details */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              gap: "10px",
                              // alignSelf: "stretch",
                              // flexGrow: 1,
                              position: "relative",
                              width: "100%",
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
                              src={el.profilePicture}
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
                                el.homeChefName
                                  ? "/media/svg/home-chef-ribbon.svg"
                                  : "/media/svg/cloud-kitchen-ribbon.svg"
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
                              {/* chefName and favourite button */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0px",
                                  gap: "10px",
                                  alignSelf: "stretch",
                                }}
                              >
                                {/* Chef name text */}
                                <Typography
                                  variant="header4"
                                  sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {el.homeChefName ?? el.cloudKitchenName}
                                </Typography>
                                {/* Favourite icon button */}
                                <Box
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    removeFavourite(
                                      el.homeChefId ?? el.cloudKitchenOutletId,
                                      el.homeChefId
                                        ? "homeChef"
                                        : el.cloudKitchenOutletId
                                        ? "cloudKitchen"
                                        : null
                                    );
                                  }}
                                  component="img"
                                  sx={{
                                    width: "30px",
                                    height: "30px",
                                    cursor: "pointer",
                                  }}
                                  src="/media/svg/favorite-selected.svg"
                                />
                              </Box>
                              {/* Rating */}
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
                              </Box>

                              {/* City and locality */}
                              <Typography
                                variant="bodyparagraph"
                                sx={{ color: "#4D4D4D" }}
                              >
                                {el.locality + ", " + el.city}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <Typography>No favourite chefs found!</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Modal Box for Delete address */}
      <Modal open={openDeleteModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: 400,

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
              alignItems: "flex-start",
              padding: "20px",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: `calc(100% - 40px)`,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="header3">Delete the Address</Typography>
            <Box
              onClick={() => setOpenDeleteModal(false)}
              component={"img"}
              sx={{
                height: "24px",
                width: "24px",
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
              alignItems: "center",
              padding: "0px 10px 40px",
              gap: "24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 20px 0px",
                gap: "20px",
              }}
            >
              <Box
                component={"img"}
                sx={{
                  // width: "111.22px",
                  height: "124px",
                }}
                src="/media/svg/delete-address-graphic.svg"
              />
              <Typography variant="bodybold" sx={{ textAlign: "center" }}>
                {cartData?.filter(
                  (el) => el.userAddressId === deleteAddressElement.id
                ).length > 0
                  ? `Your cart has some items to be delivered to this address. Deleting this address will remove those items from your cart and delete this address from your address book. Are you sure to delete?`
                  : `Are you sure you want to delete the address from the address
                book?`}
              </Typography>
              {/* Address tag icon and address tag  */}
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
                  sx={{ width: "20px", height: "20px" }}
                  src={
                    deleteAddressElement.addressTag === "Home"
                      ? "/media/svg/home.svg"
                      : deleteAddressElement.addressTag === "Work"
                      ? "/media/svg/work.svg"
                      : "/media/svg/marker.svg"
                  }
                />
                <Typography variant="header4">
                  {deleteAddressElement.addressTag}
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0px",
                gap: "24px",
              }}
            >
              <Button
                variant="outlined"
                disabled={isDeleteAddressFetching}
                onClick={() => {
                  deleteAddressInCart();
                }}
              >
                {isDeleteAddressFetching && (
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                )}
                Delete Address
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenDeleteModal(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Modal Box for update address */}
      <Modal open={updateAddressModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#FCFCFC",
            border: "1px solid #DFE2E6",
            borderRadius: "20px",
            maxHeight: "90%",
            overflowY: "scroll",
            width: "90%",
            maxWidth: "600px",
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: "20px",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: `calc(100% - 40px)`,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="header3">Update Address</Typography>
            <Box
              onClick={() => {
                setUpdateAddressModal(false);
                setAddressTagOthersText("");
                setAddressTagHelperText("");
                setAddressTagError(false);
              }}
              component={"img"}
              sx={{
                height: "24px",
                width: "24px",
                cursor: "pointer",
              }}
              src="/media/svg/cross-circled.svg"
            />
          </Box>

          {/* Modal Body */}
          <form onSubmit={handleUpdateAddress} style={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px 20px 20px",
                gap: "25px",
                width: "calc(100% - 40px)",
              }}
            >
              {/* Modal upper div */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  // alignItems: "center",
                  padding: "0px",
                  gap: "25px",
                  width: "100%",
                }}
              >
                {/* Google maps */}
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
                    center={markerPosition}
                    zoom={17}
                    onDragEnd={mapCenterMoved}
                  >
                    <Marker
                      position={markerPosition}
                      draggable
                      onDragEnd={onMarkerDragEnd}
                    />
                    <Autocomplete
                      onLoad={onAutoCompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        id="gmap-autocomplete"
                        placeholder="Search for your location"
                        style={{
                          boxSizing: `border-box`,
                          border: `1px solid transparent`,
                          width: `240px`,
                          height: `32px`,
                          padding: `0 12px`,
                          borderRadius: `3px`,
                          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                          fontSize: `14px`,
                          outline: `none`,
                          textOverflow: `ellipses`,
                          position: "absolute",
                          left: "50%",
                          marginLeft: "-120px",
                        }}
                        onKeyDown={(ev) => {
                          ev.key === "Enter" && ev.preventDefault();
                        }}
                      />
                    </Autocomplete>
                  </GoogleMap>
                </LoadScript>

                {/* address details */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "15px",
                  }}
                >
                  <Typography variant="header4">Address Details</Typography>
                  {/* streer address */}
                  <TextField
                    id="streetAddress"
                    label="Street Address *"
                    value={streetAddress}
                    onChange={(ev) => {
                      setStreetAddress(ev.target.value);
                      setStreetAddressError(false);
                      setStreetAddressHelperText("");
                    }}
                    error={streetAddressError}
                    helperText={streetAddressHelperText}
                    variant="standard"
                    sx={{ mt: 2 }}
                    fullWidth
                  />
                  {/* locality */}
                  <TextField
                    id="locality"
                    label="Locality *"
                    variant="standard"
                    value={locality}
                    onChange={(ev) => {
                      setLocality(ev.target.value);
                      setLocalityError(false);
                      setLocalityHelperText("");
                    }}
                    error={localityError}
                    helperText={localityHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
                  />
                  {/* city */}
                  <TextField
                    id="city"
                    label="City *"
                    variant="standard"
                    value={city}
                    onChange={(ev) => {
                      setCity(ev.target.value);
                      setCityError(false);
                      setCityHelperText("");
                    }}
                    error={cityError}
                    helperText={cityHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
                  />
                  {/* state */}
                  {/* <TextField
                    id="state"
                    label="State *"
                    variant="standard"
                    value={state}
                    onChange={(ev) => {
                      setState(ev.target.value);
                      setStateError(false);
                      setStateHelperText("");
                    }}
                    error={stateError}
                    helperText={stateHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
                  /> */}

                  <FormControl fullWidth sx={{ mt: 1 }} variant="standard">
                    <InputLabel id="states">State *</InputLabel>
                    <Select
                      labelId="states"
                      id="states"
                      value={state}
                      label="State *"
                      onChange={(ev) => {
                        setState(ev.target.value);
                        setStateError(false);
                        setStateHelperText("");
                      }}
                    >
                      {config.states?.map((el, idx) => (
                        <MenuItem key={idx} value={el}>
                          {el}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {stateError && (
                    <Typography
                      variant="bodymetatag"
                      sx={{ color: "#F44336", mt: 0.5 }}
                    >
                      {stateHelperText}
                    </Typography>
                  )}

                  {/* pincode */}
                  <TextField
                    id="pincode"
                    label="Pincode *"
                    variant="standard"
                    value={pincode}
                    onChange={(ev) => {
                      setPincode(ev.target.value.replace(/\D/, ""));
                      setPincodeError(false);
                      setPincodeHelperText("");
                    }}
                    inputProps={{ maxLength: 6 }}
                    error={pincodeError}
                    helperText={pincodeHelperText}
                    sx={{ marginY: 2 }}
                    fullWidth
                  />
                </Box>

                {/* Address Tag */}
                <Box>
                  <Typography
                    variant="bodyregular"
                    sx={{ color: "text.secondary" }}
                  >
                    Tag this address as *
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "16px",
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={
                        addressTag === "Home"
                          ? {
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              // height: "54px",
                              background:
                                "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                          : {
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              height: "54px",
                              border: "1px solid #AAACAE",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                      }
                      onClick={() => {
                        setAddressTag("Home");
                        setAddressTagOthersText("");
                      }}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTag === "Home"
                            ? "/media/svg/home-filled-white.svg"
                            : "/media/svg/home.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={
                          addressTag === "Home" ? "bodybold" : "bodyparagraph"
                        }
                        sx={{
                          color:
                            addressTag === "Home" ? "#FCFCFC" : "text.primary",
                        }}
                      >
                        Home
                      </Typography>
                    </Box>

                    <Box
                      sx={
                        addressTag === "Work"
                          ? {
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              // height: "54px",
                              background:
                                "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                          : {
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              height: "54px",
                              border: "1px solid #AAACAE",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                      }
                      onClick={() => {
                        setAddressTag("Work");
                        setAddressTagOthersText("");
                        setAddressTagHelperText("");
                        setAddressTagError(false);
                      }}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTag === "Work"
                            ? "/media/svg/work-filled-white.svg"
                            : "/media/svg/work.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={
                          addressTag === "Work" ? "bodybold" : "bodyparagraph"
                        }
                        sx={{
                          color:
                            addressTag === "Work" ? "#FCFCFC" : "text.primary",
                        }}
                      >
                        Work
                      </Typography>
                    </Box>

                    <Box
                      sx={
                        addressTag !== "Work" && addressTag !== "Home"
                          ? {
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              // height: "54px",
                              background:
                                "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                          : {
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "15px 20px",
                              gap: "8px",
                              height: "54px",
                              border: "1px solid #AAACAE",
                              borderRadius: "15px",
                              cursor: "pointer",
                            }
                      }
                      onClick={() => {
                        setAddressTag(addressTagOthersText);
                      }}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTag !== "Work" && addressTag !== "Home"
                            ? "/media/svg/marker-filled-white.svg"
                            : "/media/svg/marker.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={
                          addressTag !== "Work" && addressTag !== "Home"
                            ? "bodybold"
                            : "bodyparagraph"
                        }
                        sx={{
                          color:
                            addressTag !== "Work" && addressTag !== "Home"
                              ? "#FCFCFC"
                              : "text.primary",
                        }}
                      >
                        Others
                      </Typography>
                    </Box>
                  </Box>
                  {addressTag !== "Work" && addressTag !== "Home" ? (
                    <TextField
                      id="addressTagOthersText"
                      label="Save address as *"
                      value={addressTag}
                      variant="standard"
                      onChange={(ev) => {
                        setAddressTag(ev.target.value);
                        setAddressTagError(false);
                        setAddressTagHelperText("");
                      }}
                      error={addressTagError}
                      helperText={addressTagHelperText}
                      sx={{ marginY: 2 }}
                      fullWidth
                    />
                  ) : (
                    <></>
                  )}

                  {/* Mark as Primary */}
                  {!showPrimary && (
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={primary}
                            onChange={(ev) => {
                              setPrimary(ev.target.checked);
                            }}
                          />
                        }
                        label="Mark as Primary"
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Modal footer */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  height: "74px",
                  width: "100%",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setUpdateAddressModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isUpdateAddressFetching}
                >
                  Update address
                  {isUpdateAddressFetching && (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal for Edit Mobile Number */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            p: 4,
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
                Change Mobile Number
              </Typography>

              {showMobileInput ? (
                <form onSubmit={verifyMobileNumber}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      autoFocus
                      id="mobile"
                      label="Enter New Mobile Number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">+91</InputAdornment>
                        ),
                      }}
                      variant="standard"
                      value={mobileNum}
                      onChange={(ev) => {
                        setMobileNum(ev.target.value.replace(/\D/, ""));
                        setMobileNumError(false);
                        setMobileNumHelperText("");
                      }}
                      inputProps={{ maxLength: 10 }}
                      error={mobileNumError}
                      helperText={mobileNumHelperText}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isVerifyMobileFetching || isSendOtpFetching}
                      sx={{ mt: 2 }}
                    >
                      Send OTP
                      {isVerifyMobileFetching || isSendOtpFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  </Box>
                </form>
              ) : (
                <form onSubmit={changeMobileNumber}>
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
                      OTP has been sent to +91 {mobileNum}
                      <Tooltip title="Edit">
                        <IconButton onClick={() => setShowMobileInput(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>

                    <TextField
                      autoFocus
                      id="otp"
                      label="OTP"
                      variant="standard"
                      value={otp}
                      onChange={(ev) => {
                        setOtp(ev.target.value.replace(/\D/, ""));
                        setOtpValidError(false);
                        setOtpHelperText("");
                      }}
                      inputProps={{ maxLength: 6 }}
                      error={otpValidError}
                      helperText={otpHelperText}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isChangeNumFetching || isUserDataFetching}
                      sx={{ marginY: 2 }}
                    >
                      Submit
                      {isChangeNumFetching || isUserDataFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>

                    {!countdownSeconds ? (
                      <Typography
                        variant="bodyregular"
                        color="primary"
                        sx={{ cursor: "pointer" }}
                        onClick={handleSendOTP}
                      >
                        Resend OTP
                      </Typography>
                    ) : (
                      <Typography variant="bodyregular" color="#6c757d">
                        Resend OTP in {countdownSeconds} seconds
                      </Typography>
                    )}
                  </Box>
                </form>
              )}
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* Modal for Edit Referral Code*/}
      <Modal open={referralModalOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            p: 4,
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
                Update Referral Code
              </Typography>
              <form
                onSubmit={(ev) => {
                  referralCode !== userData?.user.referralCode
                    ? updateReferral(ev)
                    : setReferralModalOpen(false);
                }}
              >
                <TextField
                  id="referralCode"
                  label="Referral Code"
                  value={referralCode}
                  onChange={(ev) => {
                    setReferralCode(
                      ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                    );
                    setReferralCodeError(false);
                    setReferralCodeHelperText("");
                  }}
                  inputProps={{
                    maxLength: 6,
                  }}
                  error={referralCodeError}
                  helperText={referralCodeHelperText}
                  sx={{ mt: 2, mb: 3, width: "200px" }}
                />
                <Box sx={{ display: "flex", gap: "15px" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setReferralModalOpen(false);
                      setReferralCode(userData?.user.referralCode);
                      setReferralCodeError(false);
                      setReferralCodeHelperText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={
                      isUpdateReferralFetching || referralCode.length < 6
                    }
                  >
                    Update
                    {isUpdateReferralFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      {/* Dialog for Alert Message */}
      <Dialog open={dialogOpen}>
        <DialogTitle id="success-title">Success!</DialogTitle>
        <DialogContent>
          <DialogContentText id="success-description">
            Your mobile number has been changed Succesfully.
            <br />
            Please login with new mobile number.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={reLoginHandler}>Login</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileView;
