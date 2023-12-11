import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";
import { toast } from "react-toastify";

const libraries = ["places"];

const AddressAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);
  const mapRef = useRef(null);

  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;

  const [isAddAddressFetching, setIsAddAddressFetching] = useState(false);

  // formdata values, error, helper text states
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

  const [primary, setPrimary] = useState(false);

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

  const handleAddAddress = async (ev) => {
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

    if (!validationErrors) {
      let addressTag = "";
      if (addressTagHome) {
        addressTag = "Home";
      } else if (addressTagWork) {
        addressTag = "Work";
      } else if (addressTagOthers) {
        addressTag = addressTagOthersText;
      }

      // { axios api call }
      setIsAddAddressFetching(true);
      let params = {
        userId: cookies[config.cookieName].loginUserId,
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
        config.apiDomains.userService + apiList.addAddress,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success("Address added successfully");
          navigate("/profile");
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

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Add Address";
  }, []);

  // On load, check if user data is available
  // If not available, get user data. If available, check if user has profile created.
  useEffect(() => {
    if (userData?.user) {
      if (!userData.user.fullName) {
        if (!!location.state?.redirectTo) {
          navigate("/create-profile", {
            replace: true,
            state: { redirectTo: location.state.redirectTo },
          });
        } else {
          navigate("/create-profile");
        }
      }
    } else {
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );
    }
  }, [userData, navigate, cookies, dispatch, location]);

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

  // On change of markerPosition, set the address fields
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

  return (
    <>
      <Header />
      <Card
        variant="outlined"
        sx={{
          width: { xs: "90%", sm: 550, md: 700 },
          margin: "auto",
          marginY: 2,
        }}
      >
        <form onSubmit={handleAddAddress}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              // justifyContent: "center",
              // alignItems: "center",
            }}
          >
            <Typography variant="header3" sx={{ mb: 2, textAlign: "center" }}>
              Add Address
            </Typography>
            <CardContent>
              {/* Google Maps Come Here */}
              <LoadScript
                googleMapsApiKey={config.googleMapsApiKey}
                libraries={libraries}
              >
                <GoogleMap
                  ref={mapRef}
                  onLoad={(map) => {
                    mapRef.current = map;
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(showPosition);
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
              {/* 
              <TextField
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
                    variant={addressTagOthers ? "bodybold" : "bodyparagraph"}
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

              {/* Mark as Primary */}
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={primary}
                      onChange={(ev) => setPrimary(ev.target.checked)}
                    />
                  }
                  label="Mark as Primary"
                />
              </Box>
            </CardContent>
            <CardActions
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                height: "74px",
                width: "100%",
                mt: 2,
              }}
            >
              <Button
                onClick={() => navigate("/profile")}
                variant="outlined"
                color="primary"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isAddAddressFetching}
                variant="contained"
              >
                Submit
                {isAddAddressFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </form>
      </Card>
    </>
  );
};

export default AddressAdd;
