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
import { useDropzone } from "react-dropzone";
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
import { format } from "date-fns";
import { getUser } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";

const libraries = ["places"];

const steps = ["Profile", "GST", "FSSAI", "Images", "Preview"];

const HomeChefRegistration = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const inputRefGst = useRef(null);
  const inputRefFssai = useRef(null);
  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;

  const [activeStep, setActiveStep] = useState(0);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState("");
  const [previewFileError, setPreviewFileError] = useState("");
  const [maxFileSizeErr, setMaxFileSizeErr] = useState("");
  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);

  const [chefName, setChefName] = useState("");
  const [chefNameError, setChefNameError] = useState(false);
  const [chefNameHelperText, setChefNameHelperText] = useState("");

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
  const [galleryImageURLs, setGalleryImageURLs] = useState(null);

  const [profileImgUploadStatus, setProfileImgUploadStatus] = useState(false);
  const [gstCertUploadStatus, setGstCertUploadStatus] = useState(false);
  const [fssaiCertUploadStatus, setFssaiCertUploadStatus] = useState(false);
  const [galleryImagesUploadStatus, setGalleryImagesUploadStatus] =
    useState(false);
  const [submitChefRegistration, setSubmitChefRegistration] = useState(false);

  const [isRegisterChefFetching, setRegisterChefFetching] = useState(false);

  const [autocomplete, setAutocomplete] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);

  // Drag and drop
  const [filesGst, setFilesGst] = useState([]);
  const [filesFssai, setFilesFssai] = useState([]);

  // whatsapp notification checkbox state
  const [preferenceChecked, setPreferenceChecked] = useState(true);

  const {
    acceptedFiles: gstAcceptFile,
    fileRejections: gstRejectFile,
    getRootProps: gstRootProps,
    getInputProps: gstInputProps,
    isFocused: isGstFocused,
    isDragAccept: isGstDragAccept,
    isDragReject: isGstDragReject,
  } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/jpg": [],
      "application/pdf": [],
    },
    maxFiles: 1,
  });

  const {
    acceptedFiles: fssaiAcceptFile,
    fileRejections: fssaiRejectFile,
    getRootProps: fssaiRootProps,
    getInputProps: fssaiInputProps,
    isFocused: isFssaiFocused,
    isDragAccept: isFssaiDragAccept,
    isDragReject: isFssaiDragReject,
  } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/jpg": [],
      "application/pdf": [],
    },
    maxFiles: 1,
  });

  const getStepsContent = (steps) => {
    switch (steps) {
      // Chef Profile
      case 0:
        return (
          <Box sx={{ width: { xs: "90%", md: "750px" } }}>
            {/* Profile Picture */}
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "140px",
                      height: "140px",
                      background: "#FFFFFF",
                      boxShadow: "0px 5px 25px rgba(42, 48, 55, 0.12)",
                      borderRadius: "85px",
                      mb: 1,
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      src={previewFile}
                    />
                  </Box>
                </label>
              ) : (
                <>
                  <label htmlFor="profile-pic">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "140px",
                        height: "140px",
                        background: "#FFFFFF",
                        boxShadow: "0px 5px 25px rgba(42, 48, 55, 0.12)",
                        borderRadius: "85px",
                        mb: 1,
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        component={"img"}
                        sx={{ width: "60px", height: "60px" }}
                        src="/media/svg/camera.svg"
                      />
                    </Box>
                  </label>
                  {maxFileSizeErr || previewFileError ? (
                    <Typography variant="bodyregular" color={"error"}>
                      {maxFileSizeErr || previewFileError}
                    </Typography>
                  ) : (
                    <Typography variant="bodyregular">
                      Upload profile picture *
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <TextField
              id="chefName"
              label="Chef Name *"
              value={chefName}
              variant="standard"
              onChange={(ev) => {
                setChefName(ev.target.value.replace(/\s\s+/g, " "));
                setChefNameError(false);
                setChefNameHelperText("");
              }}
              onKeyUp={() => verifyHomeChefName()}
              inputProps={{ maxLength: 40 }}
              error={chefNameError}
              helperText={chefNameHelperText}
              sx={{ mb: 2 }}
              fullWidth
            />

            <Typography variant="header4">Address Details</Typography>

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
        );
      // GST Details
      case 1:
        return (
          <Box
            sx={{
              width: { xs: "90%", md: "750px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "27px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px",
                gap: "21px",
              }}
            >
              <Box
                component={"img"}
                sx={{ height: "100px" }}
                src="/media/svg/certificate-graphic.svg"
              />
              <Typography variant="header4">
                Are you a registered GST business?
              </Typography>
            </Box>

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
                  setFilesGst([]);
                  setGstUploadFile(null);
                  gstAcceptFile.length = 0;
                  setGstCertificateFile("");
                  setGstCertHelperText("");
                }
              }}
            >
              <FormControlLabel label="Yes" value="Yes" control={<Radio />} />
              <FormControlLabel label="No" value="No" control={<Radio />} />
            </RadioGroup>

            {isGstRegistered === "Yes" ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  width: "100%",
                }}
              >
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
                  sx={{ mt: 2, mb: 2 }}
                  fullWidth
                />

                {/* Drag and Drop */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "15px",
                    width: "100%",
                  }}
                >
                  <Typography variant="header4">GST Certificate *</Typography>
                  <input {...gstInputProps()} ref={inputRefGst} type="file" />
                  {gstUploadFile?.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "0px",
                        gap: "26px",
                        width: "100%",
                      }}
                    >
                      {/* Preview here */}
                      {filesGst[0].type === "application/pdf" ? (
                        <Box
                          component={"img"}
                          sx={{
                            width: "110px",
                            height: "122px",
                            border: "1px solid #DFE2E6",
                            filter:
                              "drop-shadow(0px -10px 20px rgba(0, 0, 0, 0.1))",
                            borderRadius: "15px",
                          }}
                          src="/media/png/pdf-icon.png"
                        />
                      ) : (
                        <Box
                          component={"img"}
                          sx={{
                            width: "110px",
                            height: "122px",
                            border: "1px solid #DFE2E6",
                            filter:
                              "drop-shadow(0px -10px 20px rgba(0, 0, 0, 0.1))",
                            borderRadius: "15px",
                            objectFit: "contain",
                          }}
                          src={filesGst[0].preview}
                        />
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          // gap: "20px",
                          // width: "212px",
                          height: "118px",
                          justifyContent: "space-around",
                          width: "calc(100% - 110px - 26px)",
                        }}
                      >
                        <Typography
                          variant="bodybold"
                          sx={{
                            maxWidth: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {gstUploadFile[0]?.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            // padding: "0px",
                            // gap: "20px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="text"
                            sx={{ textTransform: "none", mr: "20px" }}
                            onClick={() => inputRefGst.current.click()}
                            startIcon={
                              <Box
                                sx={{ width: "16px", height: "16px" }}
                                component={"img"}
                                src="/media/svg/edit-filled-orange.svg"
                              />
                            }
                          >
                            <Typography variant="bodybold">Reupload</Typography>
                          </Button>
                          <Button
                            variant="text"
                            sx={{ textTransform: "none" }}
                            onClick={() => {
                              setGstUploadFile(null);
                              gstAcceptFile.length = 0;
                            }}
                            startIcon={
                              <Box
                                sx={{ width: "16px", height: "16px" }}
                                component={"img"}
                                src="/media/svg/delete-filled-orange.svg"
                              />
                            }
                          >
                            <Typography variant="bodybold">Delete</Typography>
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      {...gstRootProps()}
                      onClick={() => inputRefGst.current.click()}
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "259px",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        borderWidth: 4,
                        width: "calc(100% - 48px)",
                        borderStyle: "dashed",
                        outline: "none",
                        transition: "border .24s ease-in-out",
                        background:
                          "linear-gradient(0deg, rgba(255, 120, 77, 0.06) 0%, rgba(252, 252, 252, 0) 100%)",
                        borderRadius: "20px",
                        borderColor: isGstFocused
                          ? "#2196f3"
                          : isGstDragAccept
                          ? "#00e676"
                          : isGstDragReject
                          ? "#ff1744"
                          : "#FA8820",
                        gap: "12px",
                      }}
                    >
                      <Box
                        component={"img"}
                        sx={{ width: "48px", height: "48px" }}
                        src="/media/svg/file-upload-filled-light-orange.svg"
                      />
                      <Typography variant="header4">
                        Drag and drop your file
                      </Typography>
                      <Typography
                        variant="bodyparagraph"
                        sx={{ color: "#AAACAE" }}
                      >
                        Or
                      </Typography>
                      <Button variant="contained">Browse Files</Button>
                    </Box>
                  )}

                  <Typography
                    variant="bodyregular"
                    color={"error"}
                    sx={{ mt: 1 }}
                  >
                    {gstCertHelperText}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <></>
            )}
          </Box>
        );
      // FSSAI Licence details
      case 2:
        return (
          <Box
            sx={{
              width: { xs: "90%", md: "750px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "27px",
            }}
          >
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
                fssaiAcceptFile.length = 0;
                setFssaiCertHelperText("");
                setActiveStep((activeStep) => activeStep + 1);
              }}
              sx={{ ml: "auto" }}
              size="small"
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px",
                gap: "21px",
              }}
            >
              <Box
                component={"img"}
                sx={{ height: "100px" }}
                src="/media/svg/certificate-graphic.svg"
              />
              <Typography variant="header4">
                Please enter your FSSAI License details
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px",
                gap: "15px",
                width: "100%",
              }}
            >
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

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Validity Upto *"
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

              {/* Drag and Drop */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  width: "100%",
                }}
              >
                <Typography variant="header4">FSSAI Certificate *</Typography>
                <input {...fssaiInputProps()} ref={inputRefFssai} type="file" />
                {fssaiUploadFile?.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "26px",
                      width: "100%",
                    }}
                  >
                    {/* Preview here */}
                    {filesFssai[0].type === "application/pdf" ? (
                      <Box
                        component={"img"}
                        sx={{
                          width: "110px",
                          height: "122px",
                          border: "1px solid #DFE2E6",
                          filter:
                            "drop-shadow(0px -10px 20px rgba(0, 0, 0, 0.1))",
                          borderRadius: "15px",
                        }}
                        src="/media/png/pdf-icon.png"
                      />
                    ) : (
                      <Box
                        component={"img"}
                        sx={{
                          width: "110px",
                          height: "122px",
                          border: "1px solid #DFE2E6",
                          filter:
                            "drop-shadow(0px -10px 20px rgba(0, 0, 0, 0.1))",
                          borderRadius: "15px",
                          objectFit: "contain",
                        }}
                        src={filesFssai[0].preview}
                      />
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "0px",
                        // gap: "20px",
                        // width: "212px",
                        height: "118px",
                        justifyContent: "space-around",
                        width: "calc(100% - 110px - 26px)",
                      }}
                    >
                      <Typography
                        variant="bodybold"
                        sx={{
                          maxWidth: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {fssaiUploadFile[0]?.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          // padding: "0px",
                          // gap: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="text"
                          sx={{ textTransform: "none", mr: "20px" }}
                          onClick={() => inputRefFssai.current.click()}
                          startIcon={
                            <Box
                              sx={{ width: "16px", height: "16px" }}
                              component={"img"}
                              src="/media/svg/edit-filled-orange.svg"
                            />
                          }
                        >
                          <Typography variant="bodybold">Reupload</Typography>
                        </Button>
                        <Button
                          variant="text"
                          sx={{ textTransform: "none" }}
                          onClick={() => {
                            setFssaiUploadFile(null);
                            fssaiAcceptFile.length = 0;
                          }}
                          startIcon={
                            <Box
                              sx={{ width: "16px", height: "16px" }}
                              component={"img"}
                              src="/media/svg/delete-filled-orange.svg"
                            />
                          }
                        >
                          <Typography variant="bodybold">Delete</Typography>
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    {...fssaiRootProps()}
                    onClick={() => inputRefFssai.current.click()}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: "259px",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                      borderWidth: 4,
                      width: "calc(100% - 48px)",
                      borderStyle: "dashed",
                      outline: "none",
                      transition: "border .24s ease-in-out",
                      background:
                        "linear-gradient(0deg, rgba(255, 120, 77, 0.06) 0%, rgba(252, 252, 252, 0) 100%)",
                      borderRadius: "20px",
                      borderColor: isFssaiFocused
                        ? "#2196f3"
                        : isFssaiDragAccept
                        ? "#00e676"
                        : isFssaiDragReject
                        ? "#ff1744"
                        : "#FA8820",
                      gap: "12px",
                    }}
                  >
                    <Box
                      component={"img"}
                      sx={{ width: "48px", height: "48px" }}
                      src="/media/svg/file-upload-filled-light-orange.svg"
                    />
                    <Typography variant="header4">
                      Drag and drop your file
                    </Typography>
                    <Typography
                      variant="bodyparagraph"
                      sx={{ color: "#AAACAE" }}
                    >
                      Or
                    </Typography>
                    <Button variant="contained">Browse Files</Button>
                  </Box>
                )}

                <Typography
                  variant="bodyregular"
                  color={"error"}
                  sx={{ mt: 1 }}
                >
                  {fssaiCertHelperText}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      // Image Gallery
      case 3:
        return (
          <Box
            sx={{
              width: { xs: "90%", md: "750px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "27px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Typography variant="header4">Image Gallery</Typography>
              <Typography variant="bodyregular">
                You can upload multiple images (max 15)
              </Typography>
            </Box>
            {previewImages.length !== 15 && (
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
                <Button color="primary" variant="contained" component="span">
                  <AddAPhotoIcon sx={{ mr: 2 }} />
                  Upload Images
                </Button>
              </label>
            )}

            <ImageList cols={3}>
              {previewImages.map((items, idx) => (
                <>
                  <ImageListItem key={idx} sx={{ m: 1 }}>
                    <img
                      src={items}
                      loading="lazy"
                      style={{
                        objectFit: "contain",
                        backgroundColor: "#eee",
                      }}
                      alt="gallery-img"
                    />
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
        );
      // Final Preview
      case 4:
        return (
          <Box
            sx={{
              width: { xs: "90%", md: "750px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "27px",
            }}
          >
            <Typography variant="header4">Preview</Typography>
            <Box
              component="img"
              src={previewFile}
              alt="profile"
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <Typography variant="bodybold">{chefName}</Typography>
            <Typography variant="bodyparagraph">
              {streetAddress}, {locality},<br /> {city}, {state}, {country},{" "}
              {pincode}.
            </Typography>
            {gstNumber ? (
              <Typography variant="bodyparagraph">
                GST Number: {gstNumber}
              </Typography>
            ) : null}
            {fssaiNumber ? (
              <Typography variant="bodyparagraph">
                FSSAI Number: {fssaiNumber} <br />
                Validity From: {format(new Date(issueDate), "dd/MM/yyyy")}{" "}
                <br />
                Validity Upto: {format(new Date(expiryDate), "dd/MM/yyyy")}
              </Typography>
            ) : null}

            {previewImages?.length > 0 && (
              <ImageList cols={3}>
                {previewImages.map((item, idx) => (
                  <ImageListItem key={idx} sx={{ m: 1 }}>
                    <img
                      src={item}
                      loading="lazy"
                      alt="chef_img"
                      style={{
                        objectFit: "contain",
                        backgroundColor: "#eee",
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            {/* Checkbox for allow whatsapp notification */}
            <FormControlLabel
              sx={{ alignSelf: "flex-start" }}
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
          </Box>
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
        // next = validateStep3();
        next = true;
        if (next) {
          setActiveStep((activeStep) => activeStep + 1);
        }
        break;
      default:
        return "unKnown Steps";
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate("/partner-registration");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  // verify chef name to check uniqueness
  const verifyHomeChefName = async () => {
    if (chefName.trim().length >= 3) {
      let params = {
        chefName: chefName.trim(),
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.verifyHomeChefName,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (
          response.data.responseCode === "200" &&
          response.data.responseMessage === "Does not exist"
        ) {
          setChefNameError(false);
          setChefNameHelperText("");
        } else if (
          response.data.responseCode === "200" &&
          response.data.responseMessage === "Already exist"
        ) {
          setChefNameError(true);
          setChefNameHelperText(
            "This name is already taken. Please try with a different name."
          );
        } else {
          alert(
            "Something went wrong while checking home chef name. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while checking home chef name. Please try again later!!"
        );
      }
    }
  };

  // Profile fields validation
  const validateStep0 = () => {
    let validationErrors = false;

    if (!previewFile) {
      setPreviewFileError("Please upload profile picture");
      validationErrors = true;
    }

    if (chefName.trim().length < 3) {
      setChefNameError(true);
      setChefNameHelperText("Please enter a valid name");
      validationErrors = true;
    }
    if (chefNameError) {
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
      window.scrollTo(0, 0);
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
      setIssueDateHelperText("Please enter certificate issue Date");
      validationErrors = true;
    }

    if (!expiryDate) {
      setExpiryDateError(true);
      setExpiryDateHelperText("Please enter certificate expiry Date");
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

  // const validateStep3 = () => {
  //   let validationErrors = false;

  //   if (!previewFile) {
  //     setPreviewFileError("Please upload profile picture");
  //     validationErrors = true;
  //   }

  //   if (!validationErrors) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // profile pic upload
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

  // GST certificate file upload
  // const handleGstCertUpload = (e) => {
  //   let gstCertificate = e.target.files[0];
  //   let acceptGstFileTypes = gstCertificate.type.match(
  //     /^image\/(jpe?g|png)$|^application\/(pdf)/
  //   );

  //   if (gstCertificate && acceptGstFileTypes) {
  //     if (gstCertificate.size < 5242880) {
  //       setGstUploadFile(gstCertificate);
  //       setGstCertHelperText("");
  //     } else {
  //       setGstCertHelperText(
  //         "Please upload a GST certificate having less than 5MB size"
  //       );
  //       setGstUploadFile(null);
  //     }
  //   } else {
  //     setGstCertHelperText(
  //       "Please upload a valid certificate in pdf/jpeg/jpg/png format"
  //     );
  //     setGstUploadFile(null);
  //   }
  // };

  // fssai certificate file upload
  // const handleFssaiCertUpload = (e) => {
  //   let fssaiCertificate = e.target.files[0];
  //   let acceptFssaiFileTypes = fssaiCertificate.type.match(
  //     /^image\/(jpe?g|png)$|^application\/(pdf)/
  //   );

  //   if (fssaiCertificate && acceptFssaiFileTypes) {
  //     if (fssaiCertificate.size < 5242880) {
  //       setFssaiUploadFile(fssaiCertificate);
  //       setFssaiCertHelperText("");
  //     } else {
  //       setFssaiUploadFile(null);
  //       setFssaiCertHelperText(
  //         "Please upload an FSSAI certificate having less than 5MB size"
  //       );
  //     }
  //   } else {
  //     setFssaiCertHelperText(
  //       "Please upload a valid certificate in pdf/jpeg/jpg/png format"
  //     );
  //     setFssaiUploadFile(null);
  //   }
  // };

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
    setProfileImgUploadStatus(false);

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
        setGalleryImageURLs([
          { galleryImage: response.data.imageUrl, imageType: "Primary" },
        ]);
        setProfileImgUploadStatus(true);
        setIsFileUploadFetching(false);
      } else {
        alert(
          "Something went wrong while uploading profile picture. Please try again later!"
        );
        setProfileImgUploadStatus(false);
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

    if (gstUploadFile) {
      setGstCertUploadStatus(false);
      setIsFileUploadFetching(true);

      let formDataGst = new FormData();
      formDataGst.append("file", gstUploadFile[0]);
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
      } else if (response.status === 401) {
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
      formDataFssai.append("file", fssaiUploadFile[0]);
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
                imageType: "Secondary",
              },
            ]);
          } else {
            alert(
              "Something went wrong while uploading chef images. Please try again later!"
            );

            setIsFileUploadFetching(false);
            setGalleryImagesUploadStatus(false);
          }
        } else if (responseGall.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading chef imges. Please try again later!!"
          );
          setIsFileUploadFetching(false);
          setGalleryImagesUploadStatus(false);
        }
      }

      setGalleryImagesUploadStatus(true);
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
    document.title = config.documentTitle + " | Register as Home Chef";
  }, []);

  // get user Data, if not exists
  useEffect(() => {
    if (!userData?.user) {
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );
    } else {
      if (userData?.user.roles.indexOf("Home Chef Owner") > -1) {
        navigate("/home-chef-profile");
      } else if (userData?.user.roles.indexOf("Cloud Kitchen Owner") > -1) {
        navigate("/restaurant-profile");
      } else if (userData?.user.roles.indexOf("Chef Manager") > -1) {
        navigate("/chef-owner-details");
      } else if (userData?.user.roles.indexOf("Outlet Manger") > -1) {
        navigate("/outlet-owner-details");
      } else if (userData?.user.roles.length > 1) {
        navigate("/");
      }
    }
  }, [dispatch, cookies, userData, navigate]);

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

  // Gst Upload file handler
  useEffect(() => {
    if (isGstRegistered === "Yes") {
      if (gstAcceptFile.length > 0) {
        if (gstAcceptFile[0].size < 5242880) {
          setGstUploadFile(gstAcceptFile);
          setGstCertHelperText("");
          setFilesGst(
            gstAcceptFile.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file),
              })
            )
          );
        } else {
          setGstCertHelperText(
            "Please upload a GST certificate having less than 5MB size"
          );
        }
      }
      if (gstRejectFile.length > 0) {
        setGstCertHelperText(
          "Please upload a valid certificate in pdf/jpeg/jpg/png format"
        );
      }
    }
  }, [gstAcceptFile, gstRejectFile, isGstRegistered]);

  // Fssai Upload file handler
  useEffect(() => {
    if (fssaiAcceptFile.length > 0) {
      if (fssaiAcceptFile[0].size < 5242880) {
        setFssaiUploadFile(fssaiAcceptFile);
        setFssaiCertHelperText("");
        setFilesFssai(
          fssaiAcceptFile.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      } else {
        setFssaiCertHelperText(
          "Please upload a GST certificate having less than 5MB size"
        );
      }
    }
    if (fssaiRejectFile.length > 0) {
      setFssaiCertHelperText(
        "Please upload a valid certificate in pdf/jpeg/jpg/png format"
      );
    }
  }, [fssaiAcceptFile, fssaiRejectFile]);

  // To check if we are ready to make Api Call for chef register api
  useEffect(() => {
    if (
      profileImgUploadStatus &&
      gstCertUploadStatus &&
      fssaiCertUploadStatus &&
      galleryImagesUploadStatus
    ) {
      setSubmitChefRegistration(true);
    } else {
      setSubmitChefRegistration(false);
    }
  }, [
    profileImgUploadStatus,
    gstCertUploadStatus,
    fssaiCertUploadStatus,
    galleryImagesUploadStatus,
  ]);

  // Api Call for chef register api
  useEffect(() => {
    const invokeChefRegistrationApi = async () => {
      setRegisterChefFetching(true);
      let issueDateFormatted = format(new Date(issueDate), "yyyy-MM-dd");
      let expiryDateFormatted = format(new Date(expiryDate), "yyyy-MM-dd");
      let params = {
        chefName: chefName.trim(),
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
        config.apiDomains.chefService + apiList.registerHomeChef,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setRegisterChefFetching(false);
          setOpenDialog(true);
        } else {
          alert(
            "Something went wrong while registering home chef. Please try again later!"
          );
          setRegisterChefFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong  while registering home chef. Please try again later!!"
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
    chefName,
    streetAddress,
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
      <Card
        variant="outlined"
        sx={{
          width: "90%",
          mx: "auto",
          my: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "20px 25px",
            boxShadow: "inset 0px -1px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Typography variant="header4">Create Chef Profile</Typography>
        </Box>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "calc(100% - 32px)",
          }}
        >
          <Stepper
            sx={{
              display: "flex",
              flexWrap: "wrap",
              // mt: 2,
              // mx: 5,
              // py: 1,
              padding: "16px 25px",
              width: "calc(100% - 50px)",
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0px",
              gap: "16px",
              margin: "auto",
              my: 3,
              width: "100%",
            }}
          >
            {getStepsContent(activeStep)}

            {isFileUploadFetching || isRegisterChefFetching ? (
              <Typography variant="bodymetatag" sx={{ alignSelf: "flex-end" }}>
                Hold on, this might not take too long...
              </Typography>
            ) : (
              <></>
            )}
            {/* Success Dialog Box */}
            <Dialog open={openDialog}>
              <DialogTitle id="success-title">Success!!</DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0px",
                    gap: "21px",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "115px" }}
                    src="/media/svg/chef-profile-success-graphic.svg"
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Typography variant="bodybold">
                      Home Chef registration form has been submitted
                      successfully.
                    </Typography>
                    <Typography variant="bodyparagraph">
                      Our team will get back to you for further steps.
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    dispatch(
                      getUser({
                        id: cookies[config.cookieName].loginUserId,
                        cookies,
                      })
                    );
                    setOpenDialog(false);
                    navigate("/home-chef-profile");
                  }}
                >
                  View Profile
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          {/* Footer buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px 25px",
              gap: "10px",
              width: "calc(100% - 50px)",
            }}
          >
            <Button
              variant="text"
              onClick={handleBack}
              sx={{ mr: 1, textTransform: "none" }}
            >
              <Typography variant="bodybold">Back</Typography>
            </Button>
            <Button
              variant="contained"
              disabled={isFileUploadFetching || isRegisterChefFetching}
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }
            >
              {activeStep === steps.length - 1 ? "Submit" : "Proceed"}
              {isFileUploadFetching || isRegisterChefFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default HomeChefRegistration;
