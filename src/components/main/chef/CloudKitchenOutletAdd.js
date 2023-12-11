import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  StepLabel,
  Step,
  Button,
  Stepper,
  Box,
  IconButton,
  CircularProgress,
  TextField,
  FormControlLabel,
  Chip,
  ImageList,
  ImageListItem,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogActions,
  ImageListItemBar,
  DialogContent,
  DialogContentText,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { config } from "../../../config/config";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ClearIcon from "@mui/icons-material/Clear";
import { useSelector, useDispatch } from "react-redux";
import { fssaiValidation, gstValidation } from "../../../common/common";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { getOutlets } from "../../../global/redux/actions";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";
import { format } from "date-fns";

const libraries = ["places"];

const steps = [
  "Chef Profile",
  "GST Details",
  "FSSAI Details",
  "Image Gallery",
  "Preview",
];

const scrollToRef = (ref) => {
  window.scrollTo(0, ref.current.offsetTop - 200);
};

const CloudKitchenOutletAdd = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const {
    isFetching: isOutletDataFetching,
    outletsData,
    outletsError,
    logout,
  } = globalState.outletsReducer;

  const [activeStep, setActiveStep] = useState(0);

  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);

  const [outletName, setOutletName] = useState("");
  const [outletNameError, setOutletNameError] = useState(false);
  const [outletNameHelperText, setOutletNameHelperText] = useState("");

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
  const [markerPosition, setMarkerPosition] = useState({
    lat: config.defaultMapLocation.latitude,
    lng: config.defaultMapLocation.longitude,
  });

  const [isGstRegistered, setIsGstRegistered] = useState("No");
  const [gstNumber, setGstNumber] = useState("");
  const [gstNumberError, setGstNumberError] = useState(false);
  const [gstNumberHelperText, setGstNumberHelperText] = useState("");
  const [gstUploadFile, setGstUploadFile] = useState(null);
  const [gstCertificateFile, setGstCertificateFile] = useState(null);
  const [gstCertHelperText, setGstCertHelperText] = useState("");

  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiNumberError, setFssaiNumberError] = useState(false);
  const [fssaiNumberHelperText, setFssaiNumberHelperText] = useState("");
  const [issueDate, setIssueDate] = useState(null);
  const [issueDateError, setIssueDateError] = useState(false);
  const [issueDateHelperText, setIssueDateHelperText] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [expiryDateError, setExpiryDateError] = useState(false);
  const [expiryDateHelperText, setExpiryDateHelperText] = useState("");
  const [fssaiUploadFile, setFssaiUploadFile] = useState(null);
  const [fssaiCertificateFile, setFssaiCertificateFile] = useState(null);
  const [fssaiCertHelperText, setFssaiCertHelperText] = useState("");

  const [previewImages, setPreviewImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImageURLs, setGalleryImageURLs] = useState([]);

  const [gstCertUploadStatus, setGstCertUploadStatus] = useState(false);
  const [fssaiCertUploadStatus, setFssaiCertUploadStatus] = useState(false);
  const [galleryImagesUploadStatus, setGalleryImagesUploadStatus] =
    useState(false);
  const [submitChefRegistration, setSubmitChefRegistration] = useState(false);

  const [isRegisterChefFetching, setRegisterChefFetching] = useState(false);

  const [autocomplete, setAutocomplete] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);

  // whatsapp notification checkbox state
  const [preferenceChecked, setPreferenceChecked] = useState(true);

  const myRef = useRef(null);
  const executeScroll = () => scrollToRef(myRef);

  const getStepsContent = (steps) => {
    switch (steps) {
      // Chef Profile
      case 0:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              Add Outlet
            </Typography>

            <CardContent>
              <Typography variant="body1" sx={{ textAlign: "left", mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                Restaurant Name:{" "}
                </Box>
                {outletsData?.cloudKitchenOutlets[0].cloudKitchenName}
              </Typography>
              <TextField
                ref={myRef}
                id="outletName"
                label="Outlet Name (Branch Name) *"
                value={outletName}
                variant="standard"
                onChange={(ev) => {
                  setOutletName(ev.target.value.replace(/\s\s+/g, " "));
                  setOutletNameError(false);
                  setOutletNameHelperText("");
                }}
                inputProps={{ maxLength: 40 }}
                error={outletNameError}
                helperText={outletNameHelperText}
                sx={{ mb: 2 }}
                fullWidth
              />

              {/* Google maps */}
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
            </CardContent>
          </Box>
        );
      // GST Details
      case 1:
        return (
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
              GST Details
            </Typography>

            <Typography variant="body1">
              Are you a registered GST business?
            </Typography>

            <RadioGroup
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
              value={isGstRegistered}
              onChange={(e) => {
                setIsGstRegistered(e.target.value);
                if (e.target.value === "No") {
                  setGstNumber("");
                  setGstNumberError(false);
                  setGstNumberHelperText("");
                  setGstUploadFile(null);
                  setGstCertificateFile("");
                  setGstCertHelperText("");
                }
              }}
            >
              <FormControlLabel label="Yes" value="Yes" control={<Radio />} />
              <FormControlLabel label="No" value="No" control={<Radio />} />
            </RadioGroup>

            {isGstRegistered === "Yes" ? (
              <Box>
                <TextField
                  id="GST Number"
                  label="GST Number *"
                  value={gstNumber}
                  variant="standard"
                  onChange={(ev) => {
                    setGstNumber(ev.target.value.toUpperCase());
                    setGstNumberError(false);
                    setGstNumberHelperText("");
                  }}
                  inputProps={{ maxLength: 15 }}
                  error={gstNumberError}
                  helperText={gstNumberHelperText}
                  sx={{ mt: 2 }}
                  fullWidth
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    mt: 3,
                  }}
                >
                  <label htmlFor="gst-cert">
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      id="gst-cert"
                      type="file"
                      onChange={handleGstCertUpload}
                    />
                    <Button variant="outlined" component="span">
                      Upload GST Certificate
                    </Button>
                  </label>
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    {gstUploadFile ? gstUploadFile.name : null}
                  </Typography>
                </Box>

                <Typography
                  variant="bodyregular"
                  color={"error"}
                  sx={{ mt: 1 }}
                >
                  {gstCertHelperText}
                </Typography>
              </Box>
            ) : (
              <></>
            )}
          </CardContent>
        );
      // FSSAI Licence details
      case 2:
        return (
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "Column",
              }}
            >
              <Typography variant="h4" sx={{ textAlign: "center" }}>
                FSSAI License details
              </Typography>
              <Chip
                label="Skip for now"
                onClick={() => {
                  setFssaiNumber("");
                  setFssaiNumberError(false);
                  setFssaiNumberHelperText("");
                  setIssueDate(null);
                  setIssueDateError(false);
                  setIssueDateHelperText("");
                  setExpiryDate(null);
                  setExpiryDateError(false);
                  setExpiryDateHelperText("");
                  setFssaiUploadFile(null);
                  setFssaiCertHelperText("");
                  setActiveStep((activeStep) => activeStep + 1);
                }}
                sx={{ ml: "auto" }}
                size="small"
              />
              <TextField
                id="FSSAI License Number"
                label="FSSAI License Number *"
                value={fssaiNumber}
                variant="standard"
                onChange={(ev) => {
                  setFssaiNumber(ev.target.value.replace(/\D/, ""));
                  setFssaiNumberError(false);
                  setFssaiNumberHelperText("");
                }}
                inputProps={{ maxLength: 14 }}
                error={fssaiNumberError}
                helperText={fssaiNumberHelperText}
                sx={{ mt: 2 }}
                fullWidth
              />

              <Box
                sx={{
                  mt: 2,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Validity From"
                    inputFormat="dd-MM-yyyy"
                    mask={"__-__-____"}
                    value={issueDate}
                    onChange={(newValue) => {
                      setIssueDate(newValue);
                      setIssueDateError(false);
                      setIssueDateHelperText("");
                    }}
                    inputProps={{ readOnly: true }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        error={issueDateError}
                        helperText={issueDateHelperText}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              <Box
                sx={{
                  mt: 2,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Validity Upto"
                    inputFormat="dd-MM-yyyy"
                    value={expiryDate}
                    mask={"__-__-____"}
                    onChange={(newValue) => {
                      setExpiryDate(newValue);
                      setExpiryDateError(false);
                      setExpiryDateHelperText("");
                    }}
                    inputProps={{ readOnly: true }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        error={expiryDateError}
                        helperText={expiryDateHelperText}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  mt: 3,
                }}
              >
                <label htmlFor="fssai-cert">
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    id="fssai-cert"
                    type="file"
                    onChange={handleFssaiCertUpload}
                  />
                  <Button variant="outlined" component="span">
                    Upload FSSAI certificate
                  </Button>
                </label>

                <Typography variant="body1" sx={{ ml: 2 }}>
                  {fssaiUploadFile ? fssaiUploadFile.name : null}
                </Typography>
              </Box>
              <Typography variant="caption" color={"error"} sx={{ mt: 1 }}>
                {fssaiCertHelperText}
              </Typography>
            </Box>
          </CardContent>
        );
      // Image Gallery
      case 3:
        return (
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                Image Gallery
              </Typography>

              <Typography variant="bodyregular">
                You can upload multiple images (max 15)
              </Typography>
              {previewImages.length !== 15 && (
                <Box sx={{ mt: 2 }}>
                  <label htmlFor="image-gallery">
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="image-gallery"
                      multiple
                      type="file"
                      onClick={(ev) => (ev.target.value = "")}
                      onChange={handleImageGalleryUpload}
                    />
                    <Button
                      color="primary"
                      variant="contained"
                      component="span"
                    >
                      <AddAPhotoIcon sx={{ mr: 2 }} />
                      Upload Images
                    </Button>
                  </label>
                </Box>
              )}

              <ImageList cols={3}>
                {previewImages.map((items, idx) => (
                  <>
                    <ImageListItem key={idx}>
                      <img src={items} loading="lazy" alt="gallery-img" />
                      <ImageListItemBar
                        sx={{
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                            "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                        }}
                        position="top"
                        actionPosition="right"
                        actionIcon={
                          <IconButton onClick={() => deleteImageGallery(idx)}>
                            <ClearIcon sx={{ color: "white" }}></ClearIcon>
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  </>
                ))}
              </ImageList>
            </Box>
          </CardContent>
        );
      // Final Preview
      case 4:
        return (
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" sx={{ textAlign: "center" }}>
                Preview
              </Typography>

              <Typography variant="h6">
                {outletsData?.cloudKitchenOutlets[0]?.cloudKitchenName}
              </Typography>
              <Typography variant="body1" fontWeight={400}>
                {outletName}
              </Typography>

              <Typography variant="body1">
                {streetAddress}, {locality},<br /> {city}, {state}, {country},{" "}
                {pincode}.
              </Typography>

              {gstNumber ? (
                <Typography sx={{ mt: 2 }} variant="body1">
                  GST Number : {gstNumber}
                </Typography>
              ) : null}

              {fssaiNumber ? (
                <Typography sx={{ mt: 2 }} variant="body1">
                  FSSAI Number : {fssaiNumber} <br />
                  Issue Date : {format(new Date(issueDate), "dd/MM/yyyy")}{" "}
                  <br />
                  Expiry Date : {format(new Date(expiryDate), "dd/MM/yyyy")}
                </Typography>
              ) : null}

              <ImageList sx={{ mt: 3 }} cols={3}>
                {previewImages.map((item, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={item}
                      loading="lazy"
                      alt="chef_img"
                      style={{ objectFit: "contain", backgroundColor: "#eee" }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
            {/* Checkbox for allow whatsapp notification */}
            <FormControlLabel
              sx={{ float: "right" }}
              label={
                <Typography variant="bodyparagraph">
                  I would like to receive WhatsApp notifications when orders are
                  placed
                </Typography>
              }
              control={
                <Checkbox
                  checked={preferenceChecked}
                  onChange={(ev) => setPreferenceChecked(ev.target.checked)}
                />
              }
            />
          </CardContent>
        );
      default:
        return <></>;
    }
  };

  const handleNext = () => {
    let next = false;
    switch (activeStep) {
      case 0:
        next = validateStep0();
        if (next) {
          setActiveStep((activeStep) => activeStep + 1);
        }
        break;
      case 1:
        next = validateStep1();
        if (next) {
          setActiveStep((activeStep) => activeStep + 1);
        }
        break;
      case 2:
        next = validateStep2();
        if (next) {
          setActiveStep((activeStep) => activeStep + 1);
        }
        break;
      case 3:
        setActiveStep((activeStep) => activeStep + 1);
        break;
      default:
        return "unKnown Steps";
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Profile fields validation
  const validateStep0 = () => {
    let validationErrors = false;

    if (outletName.trim().length < 3) {
      setOutletNameError(true);
      setOutletNameHelperText("Please enter a valid outlet name");
      validationErrors = true;
    }

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

    if (!validationErrors) {
      return true;
    } else {
      executeScroll();
      return false;
    }
  };

  // GST fields validation
  const validateStep1 = () => {
    let validationErrors = false;

    if (isGstRegistered === "Yes" && !gstNumber) {
      setGstNumberError(true);
      setGstNumberHelperText("Please enter GST number");
      validationErrors = true;
    }

    if (gstNumber) {
      const gstValidate = gstValidation(gstNumber);
      if (!gstValidate) {
        setGstNumberError(true);
        setGstNumberHelperText("Please enter a Valid GST number");
        validationErrors = true;
      }
    }

    if (isGstRegistered === "Yes" && !gstUploadFile) {
      setGstCertHelperText("Please upload GST certificate");
      validationErrors = true;
    }

    if (gstUploadFile && gstUploadFile.size > 5242880) {
      setGstCertHelperText(
        "Please upload certificate having less than 5MB size"
      );
      validationErrors = true;
    }

    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // FSSAI fields validation
  const validateStep2 = () => {
    let validationErrors = false;

    if (fssaiNumber) {
      const fssaiValidate = fssaiValidation(fssaiNumber);
      if (!fssaiValidate) {
        setFssaiNumberError(true);
        setFssaiNumberHelperText("Please enter a valid FSSAI number");
        validationErrors = true;
      }
    } else {
      setFssaiNumberError(true);
      setFssaiNumberHelperText("Please enter FSSAI number");
      validationErrors = true;
    }

    if (!issueDate) {
      setIssueDateError(true);
      setIssueDateHelperText("Please enter Validity From Date");
      validationErrors = true;
    }

    if (!expiryDate) {
      setExpiryDateError(true);
      setExpiryDateHelperText("Please enter Validity Upto Date");
      validationErrors = true;
    }

    if (!fssaiUploadFile) {
      setFssaiCertHelperText("Please upload FSSAI Certificate");
      validationErrors = true;
    }

    if (fssaiUploadFile && fssaiUploadFile.size > 5242880) {
      setFssaiCertHelperText(
        "Please upload certificate having less than 5MB size"
      );
      validationErrors = true;
    }

    if (!!expiryDate && expiryDate <= new Date()) {
      setExpiryDateError(true);
      setExpiryDateHelperText("Validity Upto Date must be a future date");
      validationErrors = true;
    }

    if (!!issueDate && !!expiryDate && issueDate > expiryDate) {
      setIssueDateError(true);
      setIssueDateHelperText(
        "Validity From Date cannot be greater than Validity Upto Date"
      );
      validationErrors = true;
    }

    if (
      format(new Date(issueDate), "dd/MM/yyyy") ===
      format(new Date(expiryDate), "dd/MM/yyyy")
    ) {
      setIssueDateError(true);
      setIssueDateHelperText("Issue date and Expire should not be same");
      validationErrors = true;
    }

    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // GST certificate file upload
  const handleGstCertUpload = (e) => {
    let gstCertificate = e.target.files[0];
    let acceptGstFileTypes = gstCertificate.type.match(
      /^image\/(jpe?g|png)$|^application\/(pdf)/
    );

    if (gstCertificate && acceptGstFileTypes) {
      if (gstCertificate.size < 5242880) {
        setGstUploadFile(gstCertificate);
        setGstCertHelperText("");
      } else {
        setGstCertHelperText(
          "Please upload a GST certificate having less than 5MB size"
        );
        setGstUploadFile(null);
      }
    } else {
      setGstCertHelperText(
        "Please upload a valid certificate in pdf/jpeg/jpg/png format"
      );
      setGstUploadFile(null);
    }
  };

  // fssai certificate file upload
  const handleFssaiCertUpload = (e) => {
    let fssaiCertificate = e.target.files[0];
    let acceptFssaiFileTypes = fssaiCertificate.type.match(
      /^image\/(jpe?g|png)$|^application\/(pdf)/
    );

    if (fssaiCertificate && acceptFssaiFileTypes) {
      if (fssaiCertificate.size < 5242880) {
        setFssaiUploadFile(fssaiCertificate);
        setFssaiCertHelperText("");
      } else {
        setFssaiUploadFile(null);
        setFssaiCertHelperText(
          "Please upload an FSSAI certificate having less than 5MB size"
        );
      }
    } else {
      setFssaiCertHelperText(
        "Please upload a valid certificate in pdf/jpeg/jpg/png format"
      );
      setFssaiUploadFile(null);
    }
  };

  // image gallery files upload
  const handleImageGalleryUpload = (ev) => {
    if (ev.target.files) {
      let images = ev.target.files;
      let sizeInvalid = false;
      let formatInvalid = false;
      Object.values(images).forEach((img) => {
        let sizeValid = img.size <= 2097152;
        let acceptGalleyImageTypes = img.type.match(/^image\/(jpe?g|png|gif)/);
        if (!sizeValid) {
          sizeInvalid = true;
        }
        if (!acceptGalleyImageTypes) {
          formatInvalid = true;
        }
        if (sizeValid && acceptGalleyImageTypes) {
          let blobURL = URL.createObjectURL(img);
          setPreviewImages((prevImages) =>
            prevImages.slice(0, 14).concat(blobURL)
          );
          setGalleryImages((prevImages) => prevImages.slice(0, 14).concat(img));
        }
      });
      if (sizeInvalid) {
        alert("Image size must be less than 2MB");
      }
      if (formatInvalid) {
        alert("Please upload a valid image in jpeg/jpg/png/gif format");
      }
    }
  };

  // Remove image
  const deleteImageGallery = (idx) => {
    let gllryImages = galleryImages;
    gllryImages.splice(idx, 1);
    setGalleryImages([...gllryImages]);

    let prvwImages = previewImages;
    prvwImages.splice(idx, 1);
    setPreviewImages([...prvwImages]);
  };

  // MultiStep form submit
  const handleSubmit = async () => {
    // Profile image upload
    setIsFileUploadFetching(true);
    if (gstUploadFile) {
      setGstCertUploadStatus(false);
      setIsFileUploadFetching(true);

      let formDataGst = new FormData();
      formDataGst.append("file", gstUploadFile);
      formDataGst.append("path", "gst_certs");

      let responseGst = await invokeFormDataApi(
        config.apiDomains.commonService + apiList.uploadFile,
        formDataGst,
        cookies
      );
      if (responseGst.status >= 200 && responseGst.status < 300) {
        if (responseGst.data.responseCode === "200") {
          setGstCertificateFile(responseGst.data.imageUrl);
          setGstCertUploadStatus(true);
          setIsFileUploadFetching(false);
        } else {
          alert(
            "Something went wrong while uploading GST Certificate. Please try again later!"
          );
          setIsFileUploadFetching(false);
          setGstCertUploadStatus(false);
        }
      } else if (responseGst.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while uploading GST Certificate. Please try again later!!"
        );
        setIsFileUploadFetching(false);
        setGstCertUploadStatus(false);
      }
    } else {
      setGstCertUploadStatus(true);
    }

    if (fssaiUploadFile) {
      setFssaiCertUploadStatus(false);
      setIsFileUploadFetching(true);
      let formDataFssai = new FormData();
      formDataFssai.append("file", fssaiUploadFile);
      formDataFssai.append("path", "fssai_certs");

      let responseFssai = await invokeFormDataApi(
        config.apiDomains.commonService + apiList.uploadFile,
        formDataFssai,
        cookies
      );
      if (responseFssai.status >= 200 && responseFssai.status < 300) {
        if (responseFssai.data.responseCode === "200") {
          setFssaiCertificateFile(responseFssai.data.imageUrl);
          setFssaiCertUploadStatus(true);
          setIsFileUploadFetching(false);
        } else {
          alert(
            "Something went wrong while uploading FSSAI Certificate. Please try again later!"
          );
          setFssaiCertUploadStatus(false);

          setIsFileUploadFetching(false);
        }
      } else if (responseFssai.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while uploading FSSAI Certificate. Please try again later!!"
        );
        setIsFileUploadFetching(false);
        setFssaiCertUploadStatus(false);
      }
    } else {
      setFssaiCertUploadStatus(true);
    }

    if (galleryImages) {
      setIsFileUploadFetching(true);
      setGalleryImagesUploadStatus(false);
      for (let i = 0; i < galleryImages.length; i++) {
        let formDataGallery = new FormData();
        formDataGallery.append("file", galleryImages[i]);
        formDataGallery.append("path", "chef_images");

        let responseGall = await invokeFormDataApi(
          config.apiDomains.commonService + apiList.uploadFile,
          formDataGallery,
          cookies
        );
        if (responseGall.status >= 200 && responseGall.status < 300) {
          if (responseGall.data.responseCode === "200") {
            setGalleryImageURLs((prevState) => [
              ...prevState,
              {
                galleryImage: responseGall.data.imageUrl,
              },
            ]);
          } else {
            alert(
              "Something went wrong while uploading outlet images. Please try again later!"
            );

            setIsFileUploadFetching(false);
            setGalleryImagesUploadStatus(false);
          }
        } else if (responseGall.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading outlet imges. Please try again later!!"
          );
          setIsFileUploadFetching(false);
          setGalleryImagesUploadStatus(false);
        }
      }

      setGalleryImagesUploadStatus(true);
      setIsFileUploadFetching(false);
    } else {
      setGalleryImagesUploadStatus(true);
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

  // expiry date and issue date helper text error handling
  useEffect(() => {
    if (!!expiryDate && expiryDate <= new Date()) {
      setExpiryDateError(true);
      setExpiryDateHelperText("Validity Upto Date must be a future date");
    } else {
      setExpiryDateError(false);
      setExpiryDateHelperText("");
    }

    if (!!issueDate && !!expiryDate && issueDate > expiryDate) {
      setIssueDateError(true);
      setIssueDateHelperText(
        "Validity From Date cannot be greater than Validity Upto Date"
      );
    } else {
      setIssueDateError(false);
      setIssueDateHelperText("");
    }
  }, [expiryDate, issueDate]);

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Add Outlet";
  }, []);

  // check role access and get outlets Data, if not exists
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") === -1) {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      } else if (!outletsData) {
        dispatch(getOutlets({ cookies }));
      }
    }
  }, [cookies, navigate, userData, dispatch, outletsData]);

  // On error when get user api is called
  useEffect(() => {
    if (outletsError) {
      alert(
        "Something went wrong while fetching Restaurant details. Please try again later!"
      );
    }
  }, [outletsError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

  // To check if we are ready to make Api Call for chef register api
  useEffect(() => {
    if (
      gstCertUploadStatus &&
      fssaiCertUploadStatus &&
      galleryImagesUploadStatus
    ) {
      setSubmitChefRegistration(true);
    } else {
      setSubmitChefRegistration(false);
    }
  }, [gstCertUploadStatus, fssaiCertUploadStatus, galleryImagesUploadStatus]);

  // Api Call for chef register api
  useEffect(() => {
    const invokeChefRegistrationApi = async () => {
      setRegisterChefFetching(true);
      let issueDateFormatted = format(new Date(issueDate), "yyyy-MM-dd");
      let expiryDateFormatted = format(new Date(expiryDate), "yyyy-MM-dd");
      let params = {
        cloudKitchenId: outletsData?.cloudKitchenOutlets[0].cloudKitchenId,
        outletName: outletName.trim(),
        streetAddress,
        locality,
        city,
        state,
        country,
        pincode,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
        isGstRegistered,
        gstNumber: gstNumber ? gstNumber : null,
        gstCertificate: gstCertificateFile,
        fssaiLicenseNumber: fssaiNumber ? fssaiNumber : null,
        fssaiLicenseIssueDate: issueDateFormatted,
        fssaiLicenseExpiryDate: expiryDateFormatted,
        fssaiCertificate: fssaiCertificateFile,
        galleryImages: galleryImageURLs,
        whatsappPreference: preferenceChecked === true ? "Yes" : "No",
      };

      let response = await invokeApi(
        config.apiDomains.chefService + apiList.addCloudKitchenOutlet,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setRegisterChefFetching(false);
          setOpenDialog(true);
        } else if (response.data.responseCode === "HE008") {
          setOutletNameError(true);
          setOutletNameHelperText(
            "Outlet Name Already Exists Under Same Restaurant"
          );
          setActiveStep(0);
          setRegisterChefFetching(false);
          setGstCertUploadStatus(false);
          setFssaiCertUploadStatus(false);
          setGalleryImagesUploadStatus(false);
          setGalleryImageURLs([]);
        } else {
          alert(
            "Something went wrong while adding outlet. Please try again later!"
          );
          setRegisterChefFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while adding outlet. Please try again later!!"
        );
        setRegisterChefFetching(false);
      }
    };

    if (submitChefRegistration) {
      invokeChefRegistrationApi();
    }
  }, [
    submitChefRegistration,
    preferenceChecked,
    streetAddress,
    outletName,
    outletsData,
    locality,
    city,
    state,
    country,
    pincode,
    markerPosition.lat,
    markerPosition.lng,
    isGstRegistered,
    gstNumber,
    gstCertificateFile,
    fssaiNumber,
    issueDate,
    expiryDate,
    fssaiCertificateFile,
    galleryImageURLs,
    cookies,
    navigate,
  ]);

  // Scroll to top when navigating between steps
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

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

  return (
    <>
      <Header />
      <Stepper
        sx={{
          mt: 2,
          mx: 5,
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

      <Card
        variant="outlined"
        sx={{ width: { xs: 400, sm: 600, md: 700 }, margin: "auto", my: 3 }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {getStepsContent(activeStep)}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button
              disabled={isFileUploadFetching || isRegisterChefFetching}
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }
            >
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
              {isFileUploadFetching ||
              isRegisterChefFetching ||
              isOutletDataFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </Box>

          {isFileUploadFetching || isRegisterChefFetching ? (
            <Typography variant="caption" sx={{ textAlign: "right" }}>
              Hold on, this might not take too long...
            </Typography>
          ) : (
            <></>
          )}
          {/* Dialog Box */}
          <Dialog open={openDialog}>
            <DialogTitle id="success-title">Success!!</DialogTitle>
            <DialogContent>
              <DialogContentText id="success-description">
                New Outlet application has been submitted
                successfully.
                <br />
                Our team will get back to you for further steps.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  dispatch(getOutlets({ cookies }));
                  setOpenDialog(false);
                  navigate("/restaurant-profile");
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default CloudKitchenOutletAdd;
