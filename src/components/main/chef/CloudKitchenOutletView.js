import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { config } from "../../../config/config";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { getOutlet } from "../../../global/redux/actions";
import { fssaiValidation, gstValidation } from "../../../common/common";
import Drawer from "@mui/material/Drawer";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../general-components/ui-components/Header";
import { toast } from "react-toastify";
import { format } from "date-fns";
import InfoIcon from "@mui/icons-material/Info";

const libraries = ["places"];

const CloudKitchenOutletView = () => {
  const mapRef = useRef(null);
  const mapRefView = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);

  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const {
    isFetching: isOutletDataFetching,
    outletData,
    outletError,
    logout: outletLogout,
  } = globalState.outletReducer;

  // Chef Profile pic
  const [previewFile, setPreviewFile] = useState("");
  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);

  // Chef addresss state
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

  const [invokeGetChefManagers, setInvokeGetChefManagers] = useState(true);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isUpdateChefProfileFetching, setIsUpdateChefProfileFetching] =
    useState(false);

  // Chef Gallery pics
  const [galleryImageURLs, setGalleryImageURLs] = useState([]);
  const [newImageURLs, setNewImageURLs] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [secondaryImageStatus, setSecondaryImageStatus] = useState(false);

  // Gst Upload
  const [isGstRegistered, setIsGstRegistered] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [gstNumberError, setGstNumberError] = useState(false);
  const [gstNumberHelperText, setGstNumberHelperText] = useState("");
  const [gstUploadFile, setGstUploadFile] = useState(null);
  const [gstCertificateFile, setGstCertificateFile] = useState(null);
  const [gstCertHelperText, setGstCertHelperText] = useState("");

  const [gstCertUploadStatus, setGstCertUploadStatus] = useState(false);
  const [isUpdateGstFetching, setIsUpdateGstFetching] = useState(false);

  // Fssai upload
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiNumberError, setFssaiNumberError] = useState(false);
  const [fssaiNumberHelperText, setFssaiNumberHelperText] = useState("");
  const [fssaiId, setFssaiId] = useState("");
  const [issueDate, setIssueDate] = useState(null);
  const [issueDateError, setIssueDateError] = useState(false);
  const [issueDateHelperText, setIssueDateHelperText] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [expiryDateError, setExpiryDateError] = useState(false);
  const [expiryDateHelperText, setExpiryDateHelperText] = useState("");
  const [fssaiUploadFile, setFssaiUploadFile] = useState(null);
  const [fssaiCertificateFile, setFssaiCertificateFile] = useState(null);
  const [fssaiCertHelperText, setFssaiCertHelperText] = useState("");

  const [fssaiCertUploadStatus, setFssaiCertUploadStatus] = useState(false);
  const [isUpdateFssaiFetching, setIsUpdateFssaiFetching] = useState(false);

  const [markerPosition, setMarkerPosition] = useState({
    lat: config.defaultMapLocation.latitude,
    lng: config.defaultMapLocation.longitude,
  });

  const [markerPositionView, setMarkerPositionView] = useState({
    lat: config.defaultMapLocation.latitude,
    lng: config.defaultMapLocation.longitude,
  });

  const [chefImages, setChefImages] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // Drawers
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [isGstDrawerOpen, setIsGstDrawerOpen] = useState(false);
  const [isFssaiDrawerOpen, setIsFssaiDrawerOpen] = useState(false);

  // switch
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  // Dialog
  const [isDialogAddressOpen, setIsDialogAddressOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  // whatsapp notification checkbox state
  const [preferenceChecked, setPreferenceChecked] = useState(null);
  const [phoneNumberData, setPhoneNumberData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isOrderAccepted, setIsOrderAccepted] = useState("Yes");
  const [defaultNumber, setDefaultNumber] = useState(null);

  const [isGetChefFetching, setIsGetChefFetching] = useState(false);
  const [showToolTip, setShowToolTip] = useState(false);

  const [coPlatformFee, setCoPlatformFee] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(false);

  const [platformFee, setPlatformFee] = useState(null);
  const [invokeGetConfig, setInvokeGetConfig] = useState(true);

  const [isOutletConfigFetching, setIsOutletConfigFetching] = useState(false);

  const maxImgsLen = 15;
  let approvedImageFilter = chefImages?.filter((el) => el.status === "Active");
  let pendingImageFilter = chefImages?.filter((el) => el.status === "Pending");
  let allowedNewImgsLen =
    maxImgsLen - approvedImageFilter?.length - pendingImageFilter?.length;

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

  const onAutoCompleteLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null && !!autocomplete.getPlace().geometry?.location) {
      setMarkerPosition({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  // validate chef address
  const validateCloudKitchenAddress = () => {
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

    return !validationErrors;
  };

  // Update whats app preferences;
  const updateWhatsAppPreference = async (checked) => {
    let params = {
      cloudKitchenOutletId: outletData?.cloudKitchenOutlet.id,
      whatsappPreference: checked === true ? "Yes" : "No",
    };

    let response = await invokeApi(
      config.apiDomains.chefService + apiList.updateWhatsAppPreference,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Whatsapp notification preference has been updated!");
      } else {
        alert(
          "Something went wrong while updating whatsapp preferences. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating whatsapp preferences. Please try again later!!"
      );
    }
  };

  // Update cloud kitchen address;
  const updateCloudKitchenAddress = async () => {
    let validateProfile = validateCloudKitchenAddress();
    if (validateProfile) {
      setIsUpdateChefProfileFetching(true);
      let params = {
        id: outletData?.cloudKitchenOutlet.id,
        streetAddress,
        locality,
        city,
        state,
        country,
        pincode,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
      };

      let response = await invokeApi(
        config.apiDomains.chefService + apiList.updateCloudKitchenAddress,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          // dispatch(getOutlets({ cookies }));
          setIsAddressDrawerOpen(false);
          setIsUpdateChefProfileFetching(false);
          dispatch(
            getOutlet({
              id: cookies[config.preferencesCookie]?.outletData?.id,
              cookies,
            })
          );
        } else {
          alert(
            "Something went wrong while updating outlet address. Please try again later!"
          );
          setIsUpdateChefProfileFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating outlet address. Please try again later!!"
        );
        setIsUpdateChefProfileFetching(false);
      }
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

  // GST fields validation
  const validateGST = () => {
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

    if (isGstRegistered === "Yes" && !gstUploadFile && !gstCertificateFile) {
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

  // Gst upload file;
  const uploadGstCertificate = async () => {
    let gstValid = validateGST();
    if (gstUploadFile) {
      if (gstValid) {
        setGstCertUploadStatus(false);
        setIsUpdateGstFetching(true);

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
            setIsUpdateGstFetching(false);
          } else {
            alert(
              "Something went wrong while uploading GST Certificate. Please try again later!"
            );
            setIsUpdateGstFetching(false);
            setGstCertUploadStatus(false);
          }
        } else if (responseGst.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading GST Certificate. Please try again later!!"
          );
          setIsUpdateGstFetching(false);
          setGstCertUploadStatus(false);
        }
      }
    } else {
      if (gstValid) {
        setGstCertUploadStatus(true);
      }
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

  // validate chef fssai
  const validateFssai = () => {
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

    if (!fssaiUploadFile && !fssaiCertificateFile) {
      setFssaiCertHelperText("Please upload FSSAI Certificate");
      validationErrors = true;
    }

    if (fssaiUploadFile && fssaiUploadFile.size > 5242880) {
      setFssaiCertHelperText(
        "Please upload certificate having less than 5MB size"
      );
      validationErrors = true;
    }
    if (!!expiryDate && expiryDate <= format(new Date(), "yyyy-MM-dd")) {
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

  // fssai upload file;
  const uploadFssaiCertificate = async () => {
    let fssaiVal = false;
    fssaiVal = validateFssai();

    if (fssaiUploadFile) {
      if (fssaiVal) {
        setFssaiCertUploadStatus(false);
        setIsUpdateFssaiFetching(true);

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
          } else {
            alert(
              "Something went wrong while uploading FSSAI Certificate. Please try again later!"
            );
            setIsUpdateFssaiFetching(false);
            setFssaiCertUploadStatus(false);
          }
        } else if (responseFssai.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading FSSAI Certificate. Please try again later!!"
          );
          setIsUpdateFssaiFetching(false);
          setFssaiCertUploadStatus(false);
        }
      }
    } else {
      if (fssaiVal) {
        setFssaiCertUploadStatus(true);
      }
    }
  };

  // when user deletes any Active/Pending gallery image
  const deleteGalleryImage = (id) => {
    if (window.confirm("Are you sure to delete the image?")) {
      let gallImgs = [...chefImages];
      let filterImg = gallImgs.filter((el) => el.id === id);
      filterImg[0].status = "Deleted";
      setChefImages(gallImgs);
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
          setNewImageURLs((prevImages) =>
            prevImages.slice(0, allowedNewImgsLen - 1).concat(blobURL)
          );
          setNewImages((prevImages) =>
            prevImages.slice(0, allowedNewImgsLen - 1).concat(img)
          );
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

  // Remove new image when user deletes before submitting
  const deleteImageGallery = (idx) => {
    let newImgs = newImages;
    newImgs.splice(idx, 1);
    setNewImages([...newImgs]);

    let newImgURLs = newImageURLs;
    newImgURLs.splice(idx, 1);
    setNewImageURLs([...newImgURLs]);
  };

  // Final submit of gallery changes
  const submitGalleryChanges = async () => {
    setSecondaryImageStatus(false);
    let galleryImgs = galleryImageURLs;
    let deletedImgs = chefImages?.filter((arr) => arr.status === "Deleted");
    deletedImgs.map((arr) => {
      galleryImgs.push({
        id: arr.id,
        status: arr.status,
      });
      return 1;
    });
    setGalleryImageURLs(galleryImgs);

    // Secondary / new images
    if (newImages) {
      setIsFileUploadFetching(true);

      for (let i = 0; i < newImages.length; i++) {
        let formDataGallery = new FormData();
        formDataGallery.append("file", newImages[i]);
        formDataGallery.append("path", "chef_images");

        let responseGall = await invokeFormDataApi(
          config.apiDomains.commonService + apiList.uploadFile,
          formDataGallery,
          cookies
        );
        if (responseGall.status >= 200 && responseGall.status < 300) {
          if (responseGall.data.responseCode === "200") {
            let galleryImgs = galleryImageURLs;
            galleryImgs.push({
              galleryImage: responseGall.data.imageUrl,
            });
            setGalleryImageURLs(galleryImgs);
          } else {
            alert(
              "Something went wrong while uploading outlet images. Please try again later!"
            );

            setIsFileUploadFetching(false);
          }
        } else if (responseGall.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading outlet images. Please try again later!!"
          );
          setIsFileUploadFetching(false);
        }
      }
      setSecondaryImageStatus(true);
    } else {
      setSecondaryImageStatus(true);
    }
  };

  // Home chef config
  const updateOutletConfig = async () => {
    setIsOutletConfigFetching(true);
    let params = {
      id: outletData?.cloudKitchenOutlet.id,
      deliveryCallsUserId: userId,
      deliveryAssignmentAction:
        isOrderAccepted === "Yes" ? "orderAccepted" : "orderPacked",
      coPlatformFee: coPlatformFee,
    };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.updateOutletConfig,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Changes updated successfully");
        setIsOutletConfigFetching(false);
      } else {
        alert(
          "Something went wrong while updating preference. Please try again later!"
        );
        setIsOutletConfigFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/");
    } else {
      alert(
        "Something went wrong while updating preference. Please try again later!!"
      );
      setIsOutletConfigFetching(false);
    }
  };

  // get config
  useEffect(() => {
    const getConfig = async () => {
      let params = {
        configKey: "Platform_Fee",
      };
      let response = await invokeApi(
        config.apiDomains.commonService + apiList.getConfig,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setPlatformFee(response.data.config.configValue);
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
    };
    if (invokeGetConfig) {
      setInvokeGetConfig(false);
      getConfig();
    }
  }, [invokeGetConfig, cookies]);

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Outlet Profile";
  }, []);

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

  // check role access and get outlet Data
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") === -1) {
        navigate("/partner-registration");
      } else {
        if (!outletData && cookies[config.preferencesCookie].outletData) {
          dispatch(
            getOutlet({
              id: cookies[config.preferencesCookie].outletData.id,
              cookies,
            })
          );
        } else {
          setPreferenceChecked(
            outletData?.cloudKitchenOutlet.whatsappPreference === "Yes"
              ? true
              : false
          );
          setIsOrderAccepted(
            outletData?.cloudKitchenOutlet.deliveryAssignmentAction ===
              "orderAccepted"
              ? "Yes"
              : "No"
          );
          setCoPlatformFee(outletData?.cloudKitchenOutlet.coPlatformFee);
        }
      }
    }
  }, [userData, outletData, dispatch, cookies, navigate]);

  // Get Chef managers
  useEffect(() => {
    const getChefManagers = async () => {
      setIsGetChefFetching(true);
      let params = {
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefManagers,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let copy = [];
          let filterActiveManagers = response.data.chefManagers.filter(
            (el) => el.status === "Active"
          );
          if (outletData?.cloudKitchenOutlet) {
            copy.push({
              userId: outletData?.cloudKitchenOutlet.userId,
              mobileNumber: `${
                outletData?.cloudKitchenOutlet.userFullName ?? ""
              } - ${outletData?.cloudKitchenOutlet.userMobileNumber}`,
            });
          }
          if (filterActiveManagers.length > 0) {
            filterActiveManagers?.map((el) =>
              copy.push({
                userId: el.managerUserId,
                mobileNumber: `${el.managerUserName} - ${el.managerUserMobileNumber}`,
              })
            );
          }
          let defaultNo = copy.filter(
            (el) =>
              el.userId === outletData?.cloudKitchenOutlet.deliveryCallsUserId
          );
          if (defaultNo.length > 0) {
            setDefaultNumber(defaultNo[0].mobileNumber);
          }
          setPhoneNumberData(copy);
          setIsGetChefFetching(false);
        } else {
          alert(
            "Something went wrong while fetching managers data. Please try again later!"
          );
          setIsGetChefFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/");
      } else {
        alert(
          "Something went wrong while fetching managers data. Please try again later!!"
        );
        setIsGetChefFetching(false);
      }
    };

    if (
      invokeGetChefManagers &&
      outletData?.cloudKitchenOutlet &&
      !isOutletDataFetching &&
      !isGetChefFetching
    ) {
      setInvokeGetChefManagers(false);
      getChefManagers();
    }
  }, [
    outletData,
    cookies,
    isGetChefFetching,
    invokeGetChefManagers,
    isOutletDataFetching,
    phoneNumberData,
    navigate,
  ]);

  // navigate if roles are not there
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") > -1) {
        // staying on this page
      } else if (userData?.user.roles.indexOf("Home Chef Owner") > -1) {
        navigate("/home-chef-profile");
      } else if (userData?.user.roles.indexOf("Chef Manager") > -1) {
        navigate("/chef-owner-details");
      } else if (userData?.user.roles.indexOf("Outlet Manger") > -1) {
        navigate("/outlet-owner-details");
      } else if (userData?.user.roles.length > 1) {
        navigate("/");
      }
    }
  }, [dispatch, cookies, userData, navigate]);

  // changes in cookies outletdata trigger get outlet
  useEffect(() => {
    if (cookies[config.preferencesCookie].outletData) {
      dispatch(
        getOutlet({
          id: cookies[config.preferencesCookie].outletData.id,
          cookies,
        })
      );
      setInvokeGetChefManagers(true);
    }
  }, [cookies, dispatch]);

  // On error when get outlet api is called
  useEffect(() => {
    if (outletError) {
      alert(
        "Something went wrong while fetching outlet details. Please try again later!"
      );
    }
  }, [outletError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (outletLogout) {
      navigate("/logout");
    }
  }, [outletLogout, navigate]);

  // setting initial state of chefData
  useEffect(() => {
    if (outletData?.cloudKitchenOutlet) {
      setPreviewFile(outletData?.cloudKitchenOutlet.profileImage);

      setMarkerPositionView({
        lat: parseFloat(outletData?.cloudKitchenOutlet.latitude),
        lng: parseFloat(outletData?.cloudKitchenOutlet.longitude),
      });

      setMarkerPosition({
        lat: parseFloat(outletData?.cloudKitchenOutlet.latitude),
        lng: parseFloat(outletData?.cloudKitchenOutlet.longitude),
      });

      // GST data for drawer
      setGstNumber(outletData?.cloudKitchenOutlet.gstNumber);
      setIsGstRegistered(outletData?.cloudKitchenOutlet.isGstRegistered);
      setGstCertificateFile(outletData?.cloudKitchenOutlet.gstCertificate);

      // Chef gallery images
      const allGalleryImgs = outletData?.cloudKitchenOutlet.galleryImages.map(
        (item) => ({
          id: item.id,
          status: item.status,
          galleryImage: item.galleryImage,
        })
      );
      setChefImages(allGalleryImgs);
      setIsLoading(false);
    }
  }, [outletData]);

  // update homechef gst data, when cert upload is done
  useEffect(() => {
    const updateHomechefGst = async () => {
      setIsUpdateGstFetching(true);
      let params = {
        id: outletData?.cloudKitchenOutlet.id,
        isGstRegistered,
        gstNumber,
        gstCertificate: gstCertificateFile,
      };

      let response = await invokeApi(
        config.apiDomains.chefService + apiList.updateCloudKitchenGST,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsUpdateGstFetching(false);
          setIsGstDrawerOpen(false);
          dispatch(
            getOutlet({
              id: cookies[config.preferencesCookie].outletData.id,
              cookies,
            })
          );
        } else {
          alert(
            "Something went wrong while updating GST data. Please try again later!"
          );
          setIsUpdateGstFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong updating GST data. Please try again later!!"
        );
        setIsUpdateGstFetching(false);
      }
    };
    if (gstCertUploadStatus) {
      setGstCertUploadStatus(false);
      updateHomechefGst();
    }
  }, [
    gstCertUploadStatus,
    navigate,
    dispatch,
    gstCertificateFile,
    gstNumber,
    cookies,
    isGstRegistered,
    outletData,
  ]);

  // setting fssai data to display in drawer, based on clicked record
  useEffect(() => {
    if (fssaiId) {
      let fssaiArray = outletData?.cloudKitchenOutlet.fssaiLicences.filter(
        (item) => item.id === fssaiId
      );
      let fssaiData = fssaiArray[0];
      setFssaiNumber(fssaiData?.fssaiLicenseNumber);
      setIssueDate(
        fssaiData?.fssaiLicenseIssueDate
          ? fssaiData?.fssaiLicenseIssueDate
          : null
      );
      setExpiryDate(
        fssaiData?.fssaiLicenseExpiryDate
          ? fssaiData?.fssaiLicenseExpiryDate
          : null
      );
      setFssaiCertificateFile(fssaiData?.fssaiCertificate);
    }
  }, [fssaiId, outletData]);

  // update homechef fssai data, when cert upload is done
  useEffect(() => {
    const updateHomechefFssai = async () => {
      setIsUpdateFssaiFetching(true);
      let issueDateFormatted = format(new Date(issueDate), "yyyy-MM-dd");
      let expiryDateFormatted = format(new Date(expiryDate), "yyyy-MM-dd");
      let params = {
        id: fssaiId,
        cloudKitchenOutletId: outletData?.cloudKitchenOutlet.id,
        fssaiLicenseNumber: fssaiNumber,
        fssaiLicenseIssueDate: issueDateFormatted,
        fssaiLicenseExpiryDate: expiryDateFormatted,
        fssaiCertificate: fssaiCertificateFile,
      };

      let response = await invokeApi(
        config.apiDomains.chefService + apiList.updateCloudKitchenFSSAI,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsFssaiDrawerOpen(false);
          setFssaiUploadFile(null);
          setIsUpdateFssaiFetching(false);
          setFssaiId("");
          setFssaiNumber("");
          setIssueDate(null);
          setExpiryDate(null);
          setFssaiCertificateFile(null);
          dispatch(
            getOutlet({
              id: cookies[config.preferencesCookie].outletData.id,
              cookies,
            })
          );
        } else {
          alert(
            "Something went wrong while updating FSSAI data. Please try again later!"
          );
          setIsUpdateFssaiFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating FSSAI data. Please try again later!!"
        );
        setIsUpdateFssaiFetching(false);
      }
    };
    if (fssaiCertUploadStatus) {
      setFssaiCertUploadStatus(false);
      updateHomechefFssai();
    }
  }, [
    fssaiCertUploadStatus,
    fssaiId,
    navigate,
    dispatch,
    fssaiCertificateFile,
    expiryDate,
    issueDate,
    fssaiNumber,
    cookies,
    outletData,
  ]);

  //  Update chef gallery images;
  useEffect(() => {
    const updateImages = async () => {
      setIsFileUploadFetching(true);

      let params = {
        id: outletData?.cloudKitchenOutlet.id,
        galleryImages: galleryImageURLs,
      };

      let response = await invokeApi(
        config.apiDomains.chefService + apiList.updateCloudKitchenGalleryImages,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setGalleryImageURLs([]);
          setNewImageURLs([]);
          setNewImages([]);
          setIsSwitchOn(false);
          dispatch(
            getOutlet({
              id: cookies[config.preferencesCookie].outletData.id,
              cookies,
            })
          );
          setIsFileUploadFetching(false);
        } else {
          alert(
            "Something went wrong while updating gallery images. Please try again later!"
          );
          setIsFileUploadFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating gallery images. Please try again later!!"
        );
        setIsFileUploadFetching(false);
      }
    };

    if (secondaryImageStatus) {
      setSecondaryImageStatus(false);
      updateImages();
    }
  }, [
    secondaryImageStatus,
    cookies,
    galleryImageURLs,
    navigate,
    dispatch,
    outletData,
  ]);

  // On marker position change, fetch the address details
  useEffect(() => {
    if (isAddressDrawerOpen) {
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
  }, [markerPosition, isAddressDrawerOpen]);

  return (
    <>
      <Header showOutlets={true} />
      {isLoading ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            background: "#FCFCFC",
            my: 3,
            alignItems: "center",
            px: 2,
            width: "calc(100% - 48px)",
          }}
        >
          {/* Profile data */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
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
                  width: "100px",
                  height: "100px",
                  borderRadius: "15px",
                  objectFit: "cover",
                  border: "1px solid #d3d3d3",
                }}
                src={previewFile}
              />

              {/* Ribbon tag */}
              <Box
                component="img"
                sx={{
                  position: "absolute",
                  top: "64px",
                  left: "-7px",
                }}
                src="/media/svg/restaurant-ribbon.svg"
              />
            </Box>

            <Typography variant="bodyparagraph">
              Application Status: {outletData?.cloudKitchenOutlet.status}
            </Typography>
            {outletData?.cloudKitchenOutlet.physicalVerificationStatus ===
              "Rejected" && (
              <>
                <Typography variant="bodyparagraph">
                  Physical verification status:{" "}
                  {outletData?.cloudKitchenOutlet.physicalVerificationStatus}
                </Typography>
                <Typography variant="bodyparagraph">
                  Physical verification Remarks:{" "}
                  {outletData?.cloudKitchenOutlet.physicalVerificationRemarks}
                </Typography>
              </>
            )}
            <Typography variant="header1" sx={{ mt: 1, textAlign: "center" }}>
              {outletData?.cloudKitchenOutlet.cloudKitchenName} -{" "}
              {outletData?.cloudKitchenOutlet.outletName}
            </Typography>
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
                    Address Details
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
                    GST Details
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
                    FSSAI Details
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
                    Images
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
              <Tab
                label={
                  <Typography
                    variant="bodybold"
                    sx={
                      tabIndex === 4
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
                    Preferences
                  </Typography>
                }
                sx={{
                  background:
                    tabIndex === 4
                      ? "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)"
                      : "",
                  borderRadius: "20px",
                  textTransform: "none",
                }}
                onClick={() => setTabIndex(4)}
              />
            </Tabs>
          </Box>

          {/* My Account tab data */}
          {tabIndex === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                // height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: { xs: "100%", sm: "90%", md: "80%" },
                my: 1,
                p: 2,
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  width: "auto",
                }}
              >
                <Typography variant="header4">Address Details</Typography>

                <Button
                  variant="text"
                  sx={{
                    textTransform: "none",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    outletData?.cloudKitchenOutlet.status === "Active"
                      ? setIsDialogAddressOpen(true)
                      : setIsAddressDrawerOpen(true);
                  }}
                >
                  <Typography variant="bodybold">Edit</Typography>
                </Button>
              </Box>
              {/* Profile details  */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "20px",
                  // width: "1251px",
                  // height: "282px",
                  flex: "none",
                  order: "0",
                  flexGrow: "0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "20px",
                    // width: "1251px",
                    // height: "232px",
                    flex: "none",
                    order: "1",
                    flexGrow: "0",
                  }}
                >
                  {/* streetAddress and locality */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "30px",
                      // width: "1251px",
                      // height: "64px",
                      flex: "none",
                      order: "0",
                      flexGrow: "0",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="bodyparagraph">
                      {outletData?.cloudKitchenOutlet.streetAddress},{" "}
                      {outletData?.cloudKitchenOutlet.locality},{" "}
                      {outletData?.cloudKitchenOutlet.city},{" "}
                      {outletData?.cloudKitchenOutlet.state},{" "}
                      {outletData?.cloudKitchenOutlet.pincode}
                    </Typography>
                  </Box>
                  <Typography variant="bodyparagraph">
                    Profile Status:{" "}
                    {outletData?.cloudKitchenOutlet.profileApprovalStatus}
                  </Typography>
                  {outletData?.cloudKitchenOutlet.profileApprovalStatus ===
                    "Rejected" && (
                    <Typography variant="bodyparagraph">
                      Rejection Remarks:{" "}
                      {outletData?.cloudKitchenOutlet.profileApprovalRemarks}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  // alignItems: "flex-start",
                  padding: "0px",
                  gap: "15px",
                  // width: "1251px",
                  // height: "477px",
                  flex: "none",
                  order: "0",
                  alignSelf: "stretch",
                  flexGrow: "0",
                }}
              >
                <LoadScript
                  googleMapsApiKey={config.googleMapsApiKey}
                  libraries={libraries}
                >
                  <GoogleMap
                    ref={mapRefView}
                    onLoad={(map) => {
                      mapRefView.current = map;
                      map.setOptions({ draggable: false });
                    }}
                    mapContainerStyle={{ height: "432px" }}
                    center={markerPositionView}
                    zoom={17}
                  >
                    <Marker position={markerPositionView} />
                  </GoogleMap>
                </LoadScript>
              </Box>
            </Box>
          )}

          {/* GST tab data */}
          {tabIndex === 1 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                // height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: { xs: "100%", sm: "90%", md: "80%" },
                my: 1,
                p: 2,
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="header4">GST Details</Typography>
                {outletData?.cloudKitchenOutlet.gstNumber ? (
                  <Button
                    variant="text"
                    sx={{
                      textTransform: "none",
                      textDecoration: "underline",
                    }}
                    onClick={() => setIsGstDrawerOpen(true)}
                  >
                    <Typography variant="bodybold">Edit</Typography>
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    sx={{
                      textTransform: "none",
                      textDecoration: "underline",
                    }}
                    onClick={() => {
                      setIsGstRegistered("Yes");
                      setIsGstDrawerOpen(true);
                    }}
                  >
                    <Typography variant="bodybold">Add GST</Typography>
                  </Button>
                )}
              </Box>

              {/* GST Details */}
              {outletData?.cloudKitchenOutlet.gstNumber ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0px",
                    gap: "30px",
                    // width: "1251px",
                    // height: "64px",
                    flex: "none",
                    order: "0",
                    flexGrow: "0",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="bodyparagraph">
                    GST Number: {outletData?.cloudKitchenOutlet.gstNumber}
                  </Typography>
                  <Typography variant="bodyparagraph">
                    GST Status:{" "}
                    {outletData?.cloudKitchenOutlet.gstApprovalStatus}
                  </Typography>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => {
                        window.open(
                          outletData?.cloudKitchenOutlet.gstCertificate,
                          "_blank"
                        );
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Typography variant="bodyparagraph">
                  No GST Registered
                </Typography>
              )}
              {outletData?.cloudKitchenOutlet.gstApprovalStatus ===
                "Rejected" && (
                <Typography variant="bodyparagraph">
                  Rejection Remarks:{" "}
                  {outletData?.cloudKitchenOutlet.gstApprovalRemarks}
                </Typography>
              )}
            </Box>
          )}

          {/* Fssai tab data */}
          {tabIndex === 2 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                // height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: { xs: "100%", sm: "90%", md: "80%" },
                my: 1,
                p: 2,
                gap: "8px",
              }}
            >
              {/* FSSAI details  */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="header4">FSSAI Details</Typography>
                {/* {outletData?.cloudKitchenOutlet.fssaiLicences.length === 0 && ( */}
                <Button
                  variant="text"
                  sx={{
                    textTransform: "none",
                    textDecoration: "underline",
                  }}
                  onClick={() => setIsFssaiDrawerOpen(true)}
                >
                  <Typography variant="bodybold">Add FSSAI</Typography>
                </Button>
                {/* )} */}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0px",
                  gap: "20px",
                  // width: "1251px",
                  // height: "282px",
                  flex: "none",
                  order: "0",
                  flexGrow: "0",
                }}
              >
                {outletData?.cloudKitchenOutlet.fssaiLicences.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table
                      sx={{ minWidth: 650 }}
                      size="small"
                      aria-label="a dense table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">FSSAI Number</TableCell>
                          <TableCell align="left">Valid from</TableCell>
                          <TableCell align="left">Valid till</TableCell>
                          <TableCell align="left">Approval Status</TableCell>
                          <TableCell align="left">Download</TableCell>
                          <TableCell align="left">Edit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {outletData?.cloudKitchenOutlet.fssaiLicences?.map(
                          (row, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.fssaiLicenseNumber}
                              </TableCell>
                              <TableCell align="left">
                                {format(
                                  new Date(row.fssaiLicenseIssueDate),
                                  "dd-MM-yyyy"
                                )}
                              </TableCell>
                              <TableCell align="left">
                                {format(
                                  new Date(row.fssaiLicenseExpiryDate),
                                  "dd-MM-yyyy"
                                )}
                              </TableCell>
                              <TableCell align="left">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <>{row.fssaiApprovalStatus}</>
                                  {row.fssaiApprovalStatus === "Rejected" && (
                                    <Tooltip
                                      open={showToolTip}
                                      onOpen={() => setShowToolTip(true)}
                                      onClose={() => setShowToolTip(false)}
                                      title={row.fssaiApprovalRemarks}
                                    >
                                      <InfoIcon
                                        onClick={() =>
                                          setShowToolTip(!showToolTip)
                                        }
                                        color={"error"}
                                        fontSize="small"
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="left">
                                <IconButton
                                  onClick={() => {
                                    window.open(row.fssaiCertificate, "_blank");
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                              <TableCell align="left">
                                <Link
                                  sx={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    row.status === "Active"
                                      ? setIsDialogOpen(true)
                                      : setIsFssaiDrawerOpen(true);
                                    setFssaiId(row.id);
                                  }}
                                >
                                  Edit
                                </Link>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="bodyparagraph">
                    No FSSAI Registered
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Gallery images data */}
          {tabIndex === 3 && (
            <Box
              sx={{
                boxSizing: "border-box",
                // height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: { xs: "100%", sm: "90%", md: "80%" },
                my: 1,
                p: 2,
              }}
            >
              <Typography variant="header4">Gallery Images</Typography>
              {chefImages?.some(
                (arr) => arr.status === "Pending" || arr.status === "Active"
              ) && (
                <FormControlLabel
                  sx={{ float: "right" }}
                  control={
                    <Switch
                      checked={isSwitchOn}
                      onChange={(ev) => setIsSwitchOn(ev.target.checked)}
                    />
                  }
                  label="Edit Images"
                />
              )}
              {allowedNewImgsLen > 0 && (
                <Typography>
                  You can add upto {allowedNewImgsLen} image(s)
                </Typography>
              )}

              {approvedImageFilter?.length > 0 && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Approved Images
                </Typography>
              )}
              <ImageList
                sx={{
                  mt: 3,
                  objectFit: "contain",
                  // backgroundColor: "#eee",
                }}
                cols={3}
              >
                {approvedImageFilter?.map((item, idx) => (
                  <ImageListItem key={idx}>
                    <Box
                      component={"img"}
                      sx={{
                        objectFit: "contain",
                        // backgroundColor: "#eee",
                        width: "292.76px",
                        height: "167.57px",
                      }}
                      src={item.galleryImage}
                      loading="lazy"
                      alt="gallery_img"
                    />
                    {isSwitchOn && (
                      <ImageListItemBar
                        sx={{
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                            "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                        }}
                        position="top"
                        actionPosition="right"
                        actionIcon={
                          <IconButton
                            onClick={() => deleteGalleryImage(item.id)}
                          >
                            <DeleteIcon sx={{ color: "white" }}></DeleteIcon>
                          </IconButton>
                        }
                      />
                    )}
                  </ImageListItem>
                ))}
              </ImageList>

              {pendingImageFilter?.length > 0 && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Pending Images
                </Typography>
              )}
              <ImageList
                sx={{
                  mt: 3,
                }}
                cols={3}
              >
                {pendingImageFilter?.map((item, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={item.galleryImage}
                      loading="lazy"
                      alt="chef_img"
                      style={{
                        objectFit: "contain",
                        // backgroundColor: "#eee",
                      }}
                    />
                    {isSwitchOn && (
                      <ImageListItemBar
                        sx={{
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                            "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                        }}
                        position="top"
                        actionPosition="right"
                        actionIcon={
                          <IconButton
                            onClick={() => deleteGalleryImage(item.id)}
                          >
                            <DeleteIcon sx={{ color: "white" }}></DeleteIcon>
                          </IconButton>
                        }
                      />
                    )}
                  </ImageListItem>
                ))}
              </ImageList>

              {newImageURLs.length > 0 && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                  New Images
                </Typography>
              )}
              <ImageList cols={3}>
                {newImageURLs.map((items, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={items}
                      loading="lazy"
                      alt="gallery-img"
                      style={{
                        objectFit: "contain",
                        // backgroundColor: "#eee",
                      }}
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
                ))}
              </ImageList>

              <Box
                sx={{
                  m: 2,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
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
                  {allowedNewImgsLen > newImages.length && (
                    <Button
                      color="primary"
                      variant="contained"
                      component="span"
                    >
                      Add Images
                    </Button>
                  )}
                </label>
                {(newImageURLs.length > 0 ||
                  // uploadedFile ||
                  chefImages?.some((arr) => arr.status === "Deleted")) && (
                  <Button
                    onClick={submitGalleryChanges}
                    type="submit"
                    disabled={isFileUploadFetching}
                    variant="outlined"
                    sx={{ ml: 2 }}
                  >
                    Update
                    {isFileUploadFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                )}
              </Box>
              {isFileUploadFetching && (
                <Typography variant="caption" sx={{ float: "right", mb: 1 }}>
                  Hold on, this might not take too long...
                </Typography>
              )}
            </Box>
          )}

          {/* Preferences */}
          {tabIndex === 4 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxSizing: "border-box",
                // height: "325px",
                background: "#FCFCFC",
                border: "1px solid #DFE2E6",
                borderRadius: "20px",
                width: { xs: "100%", sm: "90%", md: "80%" },
                my: 1,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="bodyparagraph">
                  Person who attends Delivery calls:
                </Typography>

                {/* Setting mobile numbers */}
                <FormControl sx={{ width: "250px" }} variant="standard">
                  <InputLabel id="phoneNumber">Phone Numbers</InputLabel>
                  <Select
                    labelId="phoneNumber"
                    id="phoneNumber"
                    value={defaultNumber}
                    label="phone Numbers"
                    onChange={(ev, id) => {
                      setUserId(id.props.id);
                      setDefaultNumber(ev.target.value);
                      setSubmitStatus(true);
                    }}
                  >
                    {phoneNumberData?.map((el, idx) => (
                      <MenuItem
                        key={idx}
                        id={el.userId}
                        value={el.mobileNumber}
                      >
                        {el.mobileNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <Typography variant="bodyparagraph" sx={{ mt: 1 }}>
                  When should we notify the Delivery Partner for Instant Order
                  pickup?
                </Typography>

                <RadioGroup
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  value={isOrderAccepted}
                  onChange={(e) => {
                    setIsOrderAccepted(e.target.value);
                    setSubmitStatus(true);
                  }}
                >
                  <FormControlLabel
                    label="Order Accepted"
                    value="Yes"
                    control={<Radio />}
                  />
                  <FormControlLabel
                    label="Food Packed"
                    value="No"
                    control={<Radio />}
                  />
                </RadioGroup>
              </Box>

              {/* co-platform fee */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <Box sx={{ display: "flex", gap: "10px" }}>
                  <Typography variant="bodyparagraph">
                    Co-Platform Fee:
                  </Typography>
                  <input
                    value={coPlatformFee}
                    style={{
                      width: "40px",
                      outline: "none",
                      border: "1px solid #ccc",
                      padding: "5px",
                    }}
                    onChange={(ev) => {
                      setCoPlatformFee(ev.target.value.replace(/\D/, ""));
                      setSubmitStatus(true);
                    }}
                    type="number"
                    min={0}
                  />
                </Box>
                <Typography variant="bodymetatag">
                  A platform fee of ₹{platformFee} will be charged to customers
                  on each order. If you want to bear full or partial of that
                  amount, please enter above.
                </Typography>
              </Box>

              {/* Checkbox for allow whatsapp notification */}
              <FormControlLabel
                sx={{ mt: 1 }}
                label={
                  <Typography variant="bodyparagraph">
                    I would like to receive WhatsApp notifications when orders
                    are placed
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={preferenceChecked}
                    onClick={(ev) => {
                      setPreferenceChecked(ev.target.checked);
                      updateWhatsAppPreference(ev.target.checked);
                    }}
                  />
                }
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  disabled={!submitStatus}
                  onClick={() => {
                    updateOutletConfig();
                    setSubmitStatus(false);
                  }}
                  variant="contained"
                >
                  {isOutletConfigFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                  Submit
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
      {/* Update cloud kitchen address drawer */}
      <Drawer anchor="right" open={isAddressDrawerOpen}>
        <Card
          variant="outlined"
          sx={{ width: { xs: 300, sm: 500 }, m: 1, overflow: "auto" }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
              Update Outlet Address
            </Typography>

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
            <CardActions
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                onClick={() => {
                  setIsAddressDrawerOpen(false);
                  setMarkerPositionView({
                    lat: parseFloat(outletData?.cloudKitchenOutlet.latitude),
                    lng: parseFloat(outletData?.cloudKitchenOutlet.longitude),
                  });

                  setMarkerPosition({
                    lat: parseFloat(outletData?.cloudKitchenOutlet.latitude),
                    lng: parseFloat(outletData?.cloudKitchenOutlet.longitude),
                  });
                }}
                variant="outlined"
                color="primary"
              >
                Cancel
              </Button>

              <Button
                onClick={updateCloudKitchenAddress}
                type="submit"
                disabled={isUpdateChefProfileFetching}
                variant="contained"
              >
                Submit
                {isUpdateChefProfileFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </Drawer>

      {/* Dialog for active Address */}
      <Dialog open={isDialogAddressOpen}>
        <DialogTitle>Are you sure you want to update Address?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Updating an existing active Address may lead to your profile status
            changed to 'Pending for Review'. Customers will not be able to see
            you until the changes are approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogAddressOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsDialogAddressOpen(false);
              setIsAddressDrawerOpen(true);
            }}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* update GST Drawer */}
      <Drawer anchor="right" open={isGstDrawerOpen}>
        <Card variant="outlined" sx={{ width: { xs: 400, sm: 500 }, m: 1 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
              Update GST Details
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
                      Update GST Certificate
                    </Button>
                  </label>
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    {gstUploadFile ? gstUploadFile.name : null}
                  </Typography>
                </Box>

                <Typography
                  variant="bodyparagraph"
                  color={"error"}
                  sx={{ mt: 1 }}
                >
                  {gstCertHelperText}
                </Typography>
              </Box>
            ) : (
              <></>
            )}

            <CardActions
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                onClick={() => {
                  setIsGstDrawerOpen(false);
                  setGstNumberError(false);
                  setGstNumberHelperText("");
                  setGstCertHelperText("");
                  setGstUploadFile(null);
                  setGstNumber(outletData?.cloudKitchenOutlet.gstNumber);
                }}
                variant="outlined"
                size="small"
                color="primary"
              >
                Cancel
              </Button>
              <Button
                size="small"
                onClick={uploadGstCertificate}
                type="submit"
                disabled={isUpdateGstFetching}
                variant="contained"
              >
                Submit
                {isUpdateGstFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </Drawer>

      {/* Dialog for active fssai */}
      <Dialog open={isDialogOpen}>
        <DialogTitle>Are you sure you want to update FSSAI?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Updating an existing active FSSAI license may lead to your profile
            status changed to 'Pending for Review'. Customers will not be able
            to see you until the changes are approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setIsFssaiDrawerOpen(true);
            }}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* add/update fssai drawer */}
      <Drawer anchor="right" open={isFssaiDrawerOpen}>
        <Card variant="outlined" sx={{ width: { xs: 400, sm: 500 }, m: 1 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
              FSSAI Details
            </Typography>

            {/* fssai Content here */}
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
                    setIssueDate(format(new Date(newValue), "yyyy-MM-dd"));
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
                    setExpiryDate(format(new Date(newValue), "yyyy-MM-dd"));
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

            <CardActions
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                onClick={() => {
                  setFssaiNumber("");
                  setFssaiCertHelperText("");
                  setFssaiNumberError(false);
                  setFssaiId("");
                  setIssueDate(null);
                  setIssueDateError(false);
                  setIssueDateHelperText("");
                  setExpiryDate(null);
                  setExpiryDateError(false);
                  setExpiryDateHelperText("");
                  setFssaiCertificateFile(null);
                  setFssaiCertHelperText("");
                  setIsFssaiDrawerOpen(false);
                  setFssaiUploadFile(null);
                  setFssaiNumberHelperText("");
                }}
                variant="outlined"
                size="small"
                color="primary"
              >
                Cancel
              </Button>
              <Button
                size="small"
                onClick={uploadFssaiCertificate}
                type="submit"
                disabled={isUpdateFssaiFetching}
                variant="contained"
              >
                Submit
                {isUpdateFssaiFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </Drawer>
    </>
  );
};

export default CloudKitchenOutletView;
