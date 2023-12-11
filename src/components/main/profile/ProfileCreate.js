import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { emailValidation } from "../../../common/common";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { getUser } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";

const libraries = ["places"];

const ProfileCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies([config.cookieName]);

  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState("");
  const [maxFileSizeErr, setMaxFileSizeErr] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState(false);
  const [fullNameHelperText, setFullNameHelperText] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");
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
  const [addressTagHome, setAddressTagHome] = useState(false);
  const [addressTagWork, setAddressTagWork] = useState(false);
  const [addressTagOthers, setAddressTagOthers] = useState(false);
  const [addressTagOthersText, setAddressTagOthersText] = useState("");
  const [addressTagError, setAddressTagError] = useState(false);
  const [addressTagHelperText, setAddressTagHelperText] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    lat: config.defaultMapLocation.latitude,
    lng: config.defaultMapLocation.longitude,
  });
  const [autocomplete, setAutocomplete] = useState(null);
  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [isUpdateUserFetching, setIsUpdateUserFetching] = useState(false);
  const [isAddAddressFetching, setIsAddAddressFetching] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const mapRef = useRef(null);

  const steps = ["Profile Details", "Address Details", "Confirmation"];

  const handleFileUpload = (ev) => {
    const fileUploaded = ev.target.files[0];
    let acceptProfileFileTypes = fileUploaded.type.match(
      /^image\/(jpe?g|png|gif)/
    );
    if (fileUploaded && acceptProfileFileTypes) {
      if (fileUploaded.size < 5242880) {
        setUploadedFile(fileUploaded);
        setPreviewFile(window.URL.createObjectURL(fileUploaded));
        setMaxFileSizeErr("");
      } else {
        setMaxFileSizeErr("Please upload an image having less than 5MB size");
      }
    } else {
      setMaxFileSizeErr(
        "Please upload a valid image in jpeg/jpg/png/gif format"
      );
    }
  };

  const handleAddressTag = (selectedChip) => {
    if (selectedChip === "home") {
      setAddressTagHome(true);
      setAddressTagWork(false);
      setAddressTagOthers(false);
      setAddressTagOthersText("");
      setAddressTagError(false);
      setAddressTagHelperText("");
    } else if (selectedChip === "work") {
      setAddressTagHome(false);
      setAddressTagWork(true);
      setAddressTagOthers(false);
      setAddressTagOthersText("");
      setAddressTagError(false);
      setAddressTagHelperText("");
    } else if (selectedChip === "others") {
      setAddressTagHome(false);
      setAddressTagWork(false);
      setAddressTagOthers(true);
    }
  };

  const handleProfileDetails = async (ev) => {
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
      // upload the profile pic first, if exist
      if (uploadedFile) {
        setIsFileUploadFetching(true);
        let formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("path", "profile_pictures");

        let response = await invokeFormDataApi(
          config.apiDomains.commonService + apiList.uploadFile,
          formData,
          cookies
        );

        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            setActiveStep(1);
            setProfileImage(response.data.imageUrl);
            setIsFileUploadFetching(false);
          } else {
            alert(
              "Something went wrong while uploading profile picture. Please try again later!"
            );
            setIsFileUploadFetching(false);
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading profile picture. Please try again later!!"
          );
          setIsFileUploadFetching(false);
        }
      }
      // if not, move to next step
      else {
        setActiveStep(1);
      }
    }
  };

  const handleCreateProfile = async (ev) => {
    ev.preventDefault();
    let validationErrors = false;

    if (!streetAddress) {
      setStreetAddressError(true);
      setStreetAddressHelperText("Please enter your street address");
      validationErrors = true;
    }

    if (!locality) {
      setLocalityError(true);
      setLocalityHelperText("Please enter your locality");
      validationErrors = true;
    }

    if (!city) {
      setCityError(true);
      setCityHelperText("Please enter your city");
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

    if (
      // none of the address tags are selected
      !(addressTagHome || addressTagWork || addressTagOthers) ||
      // or Others is selected but others text is not typed
      (addressTagOthers && !addressTagOthersText)
    ) {
      setAddressTagError(true);
      setAddressTagHelperText("Please select address type");
      validationErrors = true;
    }

    // When no validation errors
    if (!validationErrors) {
      setIsUpdateUserFetching(true);
      let params = {
        id: cookies[config.cookieName].loginUserId,
        fullName,
        email: email ? email : null,
        profileImage,
        referralCode: userData?.user.referralCode,
      };

      let response = await invokeApi(
        config.apiDomains.userService + apiList.updateUser,
        params,
        cookies
      );

      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsUpdateUserFetching(false);
          setIsAddAddressFetching(true);
          let addressTag = "";
          if (addressTagHome) {
            addressTag = "Home";
          } else if (addressTagWork) {
            addressTag = "Work";
          } else if (addressTagOthers) {
            addressTag = addressTagOthersText;
          }

          let params = {
            userId: cookies[config.cookieName].loginUserId,
            streetAddress,
            locality,
            city,
            state,
            country,
            pincode,
            latitude: markerPosition.lat,
            longitude: markerPosition.lng,
            addressTag: addressTag,
            isPrimary: "Yes",
          };

          let response = await invokeApi(
            config.apiDomains.userService + apiList.addAddress,
            params,
            cookies
          );

          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              setActiveStep(2);
              setCookie(
                config.preferencesCookie,
                JSON.stringify({
                  ...cookies[config.preferencesCookie],
                  deliveryAddress: {
                    id: response.data.address.id,
                    streetAddress: streetAddress,
                    city: city,
                    state: state,
                    locality: locality,
                    country: country,
                    pincode: pincode,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                    addressTag: addressTag,
                    isPrimary: "Yes",
                  },
                }),
                {
                  path: "/",
                  maxAge: 3000000,
                  sameSite: "strict",
                }
              );
            } else {
              alert(
                "Something went wrong while adding address. Please try again later!"
              );
              setIsAddAddressFetching(false);
            }
          } else if (response.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while adding address. Please try again later!!"
            );
            setIsAddAddressFetching(false);
          }
        } else {
          alert(
            "Something went wrong while updating user data. Please try again later!"
          );
          setIsUpdateUserFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating user data. Please try again later!!"
        );
        setIsUpdateUserFetching(false);
      }
    }
  };

  const onMarkerDragEnd = (coords) => {
    setMarkerPosition({
      lat: coords.latLng.lat(),
      lng: coords.latLng.lng(),
    });
  };

  const showPosition = (position) => {
    if (position.coords.latitude && position.coords.longitude) {
      setMarkerPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    }
  };

  const mapCenterMoved = () => {
    setMarkerPosition({
      lat: mapRef.current.getCenter().lat(),
      lng: mapRef.current.getCenter().lng(),
    });
  };

  const onAutoCompleteLoad = (ac) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null && !!autocomplete.getPlace().geometry?.location) {
      setMarkerPosition({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Create Profile";
  }, []);

  // On load, check if user already has a profile
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.fullName) {
        navigate("/profile");
      }
    } else {
      dispatch(
        getUser({
          id: cookies[config.cookieName].loginUserId,
          cookies: cookies,
        })
      );
    }
  }, [userData, cookies, dispatch, navigate]);

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

  // On marker position change, fetch the address details
  useEffect(() => {
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
  }, [markerPosition]);

  // Scroll to top when navigating between steps
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

  return (
    <>
      <Header />
      <Card
        variant="outlined"
        sx={{
          width: "90%",
          mx: "auto",
          my: 3,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px",
            gap: "40px",
            background: "#FCFCFC",
          }}
        >
          {/* Heading */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              pt: "10px",
              pb: "20px",
              px: "20px",
              boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.15)",
              width: "100%",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <Typography variant="header3" sx={{ ml: 2 }}>
              Please fill your details
            </Typography>
            {(activeStep === 0 || activeStep === 1) && (
              <Chip
                label="Skip for now"
                onClick={() => {
                  if (!!location.state?.redirectTo) {
                    navigate(location.state.redirectTo);
                  } else {
                    navigate("/");
                  }
                }}
                size="small"
                sx={{ mr: 2 }}
              />
            )}
          </Box>

          {/* Stepper and content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "25px",
              width: "100%",
            }}
          >
            <Stepper
              sx={{
                display: "flex",
                flexWrap: "wrap",
                mx: 5,
                py: 1,
                width: "80%",
              }}
              activeStep={activeStep}
            >
              {steps.map((label, index) => {
                return (
                  <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {activeStep === 0 && (
              <form onSubmit={handleProfileDetails} style={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0px",
                    gap: "10px",
                  }}
                >
                  {/* File upload */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="profile-pic"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />

                    {uploadedFile && !maxFileSizeErr ? (
                      <label htmlFor="profile-pic">
                        <IconButton component="span">
                          <Box
                            component="img"
                            src={previewFile}
                            alt="profile"
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                              objectFit: "cover",
                              boxShadow: "0px 5px 25px rgba(42, 48, 55, 0.12)",
                            }}
                          />
                        </IconButton>
                      </label>
                    ) : (
                      <>
                        <label htmlFor="profile-pic">
                          <IconButton component="span">
                            <Avatar
                              sx={{
                                width: 100,
                                height: 100,
                                background: "#FFFFFF",
                                boxShadow:
                                  "0px 5px 25px rgba(42, 48, 55, 0.12)",
                              }}
                            >
                              <Box
                                component={"img"}
                                src="/media/svg/camera.svg"
                                sx={{ width: 56, height: 56 }}
                              />
                            </Avatar>
                          </IconButton>
                        </label>
                        <Typography variant="bodyregular" color={"error"}>
                          {maxFileSizeErr}
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Typography variant="bodyparagraph">
                    Upload your picture
                  </Typography>
                </Box>

                {/* Input fields */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "25px 30px",
                    alignSelf: "flex-start",
                    gap: "15px",
                    width: "80%",
                  }}
                >
                  <Typography variant="header4">Personal Details</Typography>
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
                    inputProps={{ maxLength: 30 }}
                    error={fullNameError}
                    helperText={fullNameHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
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
                    sx={{ mt: 2, mb: 3 }}
                    fullWidth
                  />
                </Box>

                {/* Next button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    padding: "0px 30px",
                    alignSelf: "flex-end",
                    width: "80%",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isFileUploadFetching}
                  >
                    Next
                    {isFileUploadFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              </form>
            )}

            {activeStep === 1 && (
              <form onSubmit={handleCreateProfile} style={{ width: "100%" }}>
                {/* Map */}
                <Box sx={{ px: "30px" }}>
                  <LoadScript
                    googleMapsApiKey={config.googleMapsApiKey}
                    libraries={libraries}
                  >
                    <GoogleMap
                      ref={mapRef}
                      onLoad={(map) => {
                        mapRef.current = map;
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            showPosition
                          );
                        }
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
                </Box>

                {/* Address input fields */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "25px 30px",
                    gap: "15px",
                    width: "80%",
                  }}
                >
                  <Typography variant="header4">Address Details</Typography>

                  <TextField
                    id="streetAddress"
                    label="Street Address *"
                    value={streetAddress}
                    variant="standard"
                    onChange={(ev) => {
                      setStreetAddress(ev.target.value);
                      setStreetAddressError(false);
                      setStreetAddressHelperText("");
                    }}
                    error={streetAddressError}
                    helperText={streetAddressHelperText}
                    sx={{ mt: 2 }}
                    fullWidth
                  />

                  <TextField
                    id="locality"
                    label="Locality *"
                    value={locality}
                    variant="standard"
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

                  <TextField
                    id="city"
                    label="City *"
                    value={city}
                    variant="standard"
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

                  {/* <TextField
                    id="state"
                    label="State *"
                    value={state}
                    variant="standard"
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

                  <TextField
                    id="pincode"
                    label="Pincode *"
                    value={pincode}
                    variant="standard"
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
                <Box sx={{ px: "30px" }}>
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
                    }}
                  >
                    <Box
                      sx={
                        addressTagHome
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
                      onClick={() => handleAddressTag("home")}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTagHome
                            ? "/media/svg/home-filled-white.svg"
                            : "/media/svg/home.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={addressTagHome ? "bodybold" : "bodyparagraph"}
                        sx={{
                          color: addressTagHome ? "#FCFCFC" : "text.primary",
                        }}
                      >
                        Home
                      </Typography>
                    </Box>

                    <Box
                      sx={
                        addressTagWork
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
                      onClick={() => handleAddressTag("work")}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTagWork
                            ? "/media/svg/work-filled-white.svg"
                            : "/media/svg/work.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={addressTagWork ? "bodybold" : "bodyparagraph"}
                        sx={{
                          color: addressTagWork ? "#FCFCFC" : "text.primary",
                        }}
                      >
                        Work
                      </Typography>
                    </Box>

                    <Box
                      sx={
                        addressTagOthers
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
                      onClick={() => handleAddressTag("others")}
                    >
                      <Box
                        component={"img"}
                        src={
                          addressTagOthers
                            ? "/media/svg/marker-filled-white.svg"
                            : "/media/svg/marker.svg"
                        }
                        sx={{ width: "16px", height: "16px" }}
                      />
                      <Typography
                        variant={
                          addressTagOthers ? "bodybold" : "bodyparagraph"
                        }
                        sx={{
                          color: addressTagOthers ? "#FCFCFC" : "text.primary",
                        }}
                      >
                        Others
                      </Typography>
                    </Box>
                  </Box>
                  {!addressTagOthers && addressTagError ? (
                    <Typography variant="bodyregular" color={"error"}>
                      {addressTagHelperText}
                    </Typography>
                  ) : (
                    <></>
                  )}
                  {addressTagOthers ? (
                    <TextField
                      id="addressTagOthersText"
                      label="Save address as *"
                      value={addressTagOthersText}
                      variant="standard"
                      onChange={(ev) => {
                        setAddressTagOthersText(ev.target.value);
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
                </Box>

                {/* Previous and Next buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: "25px 30px",
                  }}
                >
                  <Button variant="outlined" onClick={() => setActiveStep(0)}>
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUpdateUserFetching || isAddAddressFetching}
                  >
                    Next
                    {isUpdateUserFetching || isAddAddressFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              </form>
            )}

            {activeStep === 2 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0px",
                  gap: "25px",
                }}
              >
                <Box
                  component={"img"}
                  src="/media/svg/user-profile-success-graphic.svg"
                />
                <Typography variant="header4">
                  Congratulations, your account has been created successfully!
                </Typography>
                <Typography variant="bodyparagraph">
                  Please order food from your favourite chef and enjoy your meal
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    dispatch(
                      getUser({
                        id: cookies[config.cookieName].loginUserId,
                        cookies,
                      })
                    );

                    if (!!location.state?.redirectTo) {
                      navigate(location.state.redirectTo);
                    } else {
                      navigate("/");
                    }
                  }}
                >
                  Start ordering food
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileCreate;
