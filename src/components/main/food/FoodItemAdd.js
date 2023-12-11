import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
  TextField,
  Typography,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ClearIcon from "@mui/icons-material/Clear";
import { config } from "../../../config/config";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Header from "../../general-components/ui-components/Header";
import { convertTime12to24, convertTime24to12 } from "../../../common/common";

// Scroll to top on error
const scrollToRef = (ref) => {
  window.scrollTo(0, ref.current.offsetTop - 80);
};

const FoodItemAdd = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const { state } = useLocation();
  const { foodItemData } = state || [];
  const [itemName, setItemName] = useState("");
  const [itemNameError, setItemNameError] = useState(false);
  const [itemNameHelperText, setItemNameHelperText] = useState("");

  const [description, setDescription] = useState("");

  const [cuisine, setCuisine] = useState("");
  const [cuisineHelperText, setCuisineHelperText] = useState("");
  const [cuisinesData, setCuisinesData] = useState(null);
  const [cuisineId, setCuisineId] = useState([]);

  const [category, setCategory] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [categoryHelperText, setCategoryHelperText] = useState("");

  const [weight, setWeight] = useState("");
  const [weightError, setWeightError] = useState(false);
  const [weightHelperText, setWeightHelperText] = useState("");

  const [packingCharges, setPackingCharges] = useState("");
  const [packingChargesError, setPackingChargesError] = useState(false);
  const [packingChargesHelperText, setPackingChargesHelperText] = useState("");

  const [minOrderQuantity, setMinOrderQuantity] = useState(1);
  const [minOrderQuantityError, setMinOrderQuantityError] = useState(false);
  const [minOrderQuantityHelperText, setMinOrderQuantityHelperText] =
    useState("");

  const [isVegOrNonveg, setIsVegOrNonveg] = useState("Veg");

  const [nonVegType, setNonVegType] = useState("");
  const [nonVegTypeHelperText, setNonVegTypeHelperText] = useState("");

  const [spiceLevel, setSpiceLevel] = useState("");
  const [spiceLevelHelperText, setSpiceLevelHelperText] = useState("");

  const [mrp, setMrp] = useState("");
  const [mrpError, setMrpError] = useState(false);
  const [mrpHelperText, setMrpHelperText] = useState("");

  const [sellPriceExclusiveGst, setSellPriceExclusiveGst] = useState(0);

  const [discount, setDiscount] = useState("");
  const [discountError, setDiscountError] = useState(false);
  const [discountHelperText, setDiscountHelperText] = useState("");

  const [rebate, setRebate] = useState("");
  const [rebateError, setRebateError] = useState(false);
  const [rebateHelperText, setRebateHelperText] = useState("");

  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);
  const [isAddFooditemFetching, setIsAddFooditemFetching] = useState(false);

  const [imageUploadStatus, setImageUploadStatus] = useState(false);

  const [foodPreviewFiles, setFoodPreviewFiles] = useState([]);
  const [foodGalleryImages, setFoodGalleryImages] = useState([]);
  const [foodGalleryError, setFoodGalleryError] = useState(false);
  const [foodGalleryHelperText, setFoodGalleryHelperText] = useState("");
  const [foodImageUrls, setFoodImageUrls] = useState([]);

  const [isCuisinesFetching, setIsCuisinesFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [autoTurnOn, setAutoTurnOn] = useState("No");

  // state for radio buttons
  const [allSevenDays, setAllSevenDays] = useState("Yes");

  // state for all seven days
  const [showTimeAllSeven, setShowTimeAllSeven] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [invokeTimeValidation, setInvokeTimeValidation] = useState(false);

  // state for customize seven days ( Monday )
  const [showTimeMonday, setShowTimeMonday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedMondayClosed, setCheckedMondayClosed] = useState(false);
  const [invokeTimeValidMonday, setInvokeTimeValidMonday] = useState(false);

  // state for customize seven days ( Tuesday )
  const [showTimeTuesday, setShowTimeTuesday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedTuesdayClosed, setCheckedTuesdayClosed] = useState(false);
  const [invokeTimeValidTuesday, setInvokeTimeValidTuesday] = useState(false);

  // state for customize seven days ( Wednesday )
  const [showTimeWednesday, setShowTimeWednesday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedWednesdayClosed, setCheckedWednesdayClosed] = useState(false);
  const [invokeTimeValidWednesday, setInvokeTimeValidWednesday] =
    useState(false);

  // state for customize seven days ( Thursday )
  const [showTimeThursday, setShowTimeThursday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedThursdayClosed, setCheckedThursdayClosed] = useState(false);
  const [invokeTimeValidThursday, setInvokeTimeValidThursday] = useState(false);

  // state for customize seven days ( Friday )
  const [showTimeFriday, setShowTimeFriday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedFridayClosed, setCheckedFridayClosed] = useState(false);
  const [invokeTimeValidFriday, setInvokeTimeValidFriday] = useState(false);

  // state for customize seven days ( Saturday )
  const [showTimeSaturday, setShowTimeSaturday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedSaturdayClosed, setCheckedSaturdayClosed] = useState(false);
  const [invokeTimeValidSaturday, setInvokeTimeValidSaturday] = useState(false);

  // state for customize seven days ( Sunday )
  const [showTimeSunday, setShowTimeSunday] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [checkedSundayClosed, setCheckedSundayClosed] = useState(false);
  const [invokeTimeValidSunday, setInvokeTimeValidSunday] = useState(false);

  // Pre order max capacity
  const [maxCapacityTurnOn, setMaxCapacityTurnOn] = useState("No");

  // state for radio buttons
  const [allSevenDaysSlot, setAllSevenDaysSlot] = useState("Yes");

  // state for all seven days
  const [showSlotAllSeven, setShowSlotAllSeven] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [invokeSlotValidation, setInvokeSlotValidation] = useState(false);

  // state for customize seven days ( Monday )
  const [showSlotMonday, setShowSlotMonday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotMondayClosed, setCheckedSlotMondayClosed] = useState(false);
  const [invokeSlotValidMonday, setInvokeSlotValidMonday] = useState(false);

  // state for customize seven days ( Tuesday )
  const [showSlotTuesday, setShowSlotTuesday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotTuesdayClosed, setCheckedSlotTuesdayClosed] =
    useState(false);
  const [invokeSlotValidTuesday, setInvokeSlotValidTuesday] = useState(false);

  // state for customize seven days ( Wednesday )
  const [showSlotWednesday, setShowSlotWednesday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotWednesdayClosed, setCheckedSlotWednesdayClosed] =
    useState(false);
  const [invokeSlotValidWednesday, setInvokeSlotValidWednesday] =
    useState(false);

  // state for customize seven days ( Thursday )
  const [showSlotThursday, setShowSlotThursday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotThursdayClosed, setCheckedSlotThursdayClosed] =
    useState(false);
  const [invokeSlotValidThursday, setInvokeSlotValidThursday] = useState(false);

  // state for customize seven days ( Friday )
  const [showSlotFriday, setShowSlotFriday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotFridayClosed, setCheckedSlotFridayClosed] = useState(false);
  const [invokeSlotValidFriday, setInvokeSlotValidFriday] = useState(false);

  // state for customize seven days ( Saturday )
  const [showSlotSaturday, setShowSlotSaturday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotSaturdayClosed, setCheckedSlotSaturdayClosed] =
    useState(false);
  const [invokeSlotValidSaturday, setInvokeSlotValidSaturday] = useState(false);

  // state for customize seven days ( Sunday )
  const [showSlotSunday, setShowSlotSunday] = useState([
    {
      maxCapacity: "",
      deliverySlot: "7am - 8am",
    },
  ]);
  const [checkedSlotSundayClosed, setCheckedSlotSundayClosed] = useState(false);
  const [invokeSlotValidSunday, setInvokeSlotValidSunday] = useState(false);

  const [hours, setHours] = useState("24");
  const [hoursError, setHoursError] = useState(false);
  const [hoursHelperText, setHoursHelperText] = useState("");

  const [cloneFoodItemStatus, setCloneFoodItemStatus] = useState(true);
  const myRef = useRef(null);
  const executeScroll = () => scrollToRef(myRef);

  const timeFormat = [
    "12:00 AM",
    "12:30 AM",
    "01:00 AM",
    "01:30 AM",
    "02:00 AM",
    "02:30 AM",
    "03:00 AM",
    "03:30 AM",
    "04:00 AM",
    "04:30 AM",
    "05:00 AM",
    "05:30 AM",
    "06:00 AM",
    "06:30 AM",
    "07:00 AM",
    "07:30 AM",
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  const slotFormat = [
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

  const enableTimeSubmitButton = useCallback(() => {
    if (allSevenDays === "Yes") {
      if (showTimeAllSeven.some((el) => !!el.helperText) === true) {
        return false;
      } else {
        return true;
      }
    } else if (allSevenDays === "No") {
      if (
        showTimeMonday.some((el) => !!el.helperText) === true ||
        showTimeTuesday.some((el) => !!el.helperText) === true ||
        showTimeWednesday.some((el) => !!el.helperText) === true ||
        showTimeThursday.some((el) => !!el.helperText) === true ||
        showTimeFriday.some((el) => !!el.helperText) === true ||
        showTimeSaturday.some((el) => !!el.helperText) === true ||
        showTimeSunday.some((el) => !!el.helperText) === true
      ) {
        return false;
      } else {
        return true;
      }
    }
  }, [
    showTimeAllSeven,
    allSevenDays,
    showTimeMonday,
    showTimeTuesday,
    showTimeWednesday,
    showTimeThursday,
    showTimeFriday,
    showTimeSaturday,
    showTimeSunday,
  ]);

  const enableSlotSubmitButton = useCallback(() => {
    if (allSevenDaysSlot === "Yes") {
      if (showSlotAllSeven.some((el) => !!el.helperText) === true) {
        return false;
      } else {
        return true;
      }
    } else if (allSevenDaysSlot === "No") {
      if (
        showSlotMonday.some((el) => !!el.helperText) === true ||
        showSlotTuesday.some((el) => !!el.helperText) === true ||
        showSlotWednesday.some((el) => !!el.helperText) === true ||
        showSlotThursday.some((el) => !!el.helperText) === true ||
        showSlotFriday.some((el) => !!el.helperText) === true ||
        showSlotSaturday.some((el) => !!el.helperText) === true ||
        showSlotSunday.some((el) => !!el.helperText) === true
      ) {
        return false;
      } else {
        return true;
      }
    }
  }, [
    showSlotAllSeven,
    allSevenDaysSlot,
    showSlotMonday,
    showSlotTuesday,
    showSlotWednesday,
    showSlotThursday,
    showSlotFriday,
    showSlotSaturday,
    showSlotSunday,
  ]);

  // upload food gallery
  const foodImageUpload = (ev) => {
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
          setFoodPreviewFiles((prevImages) =>
            prevImages.slice(0, 5).concat(blobURL)
          );
          setFoodGalleryImages((prevImages) =>
            prevImages.slice(0, 5).concat(img)
          );
        }
      });
      if (sizeInvalid) {
        alert("Image size must be less than 2MB");
      }
      if (formatInvalid) {
        alert("Please upload a valid image in jpeg/jpg/png/gif format");
      }
      setFoodGalleryHelperText("");
    }
  };

  // Remove image
  const deleteImageGallery = (idx) => {
    let gllryImages = foodGalleryImages;
    gllryImages.splice(idx, 1);
    setFoodGalleryImages([...gllryImages]);

    let prvwImages = foodPreviewFiles;
    prvwImages.splice(idx, 1);
    setFoodPreviewFiles([...prvwImages]);
  };

  // food details validation
  const validateAddfood = () => {
    let validationErrors = false;

    if (itemName === "") {
      setItemNameError(true);
      setItemNameHelperText("Please enter Item name");
      validationErrors = true;
    }

    if (cuisine === "") {
      setCuisineHelperText("Please select Cuisine type");
      validationErrors = true;
    }

    if (category === "") {
      setCategoryError(true);
      setCategoryHelperText("Please enter Category");
      validationErrors = true;
    }

    if (spiceLevel === "") {
      setSpiceLevelHelperText("Please select Spice level");
      validationErrors = true;
    }

    if (weight === "") {
      setWeightError(true);
      setWeightHelperText("Please enter weight");
      validationErrors = true;
    } else if (+weight === 0) {
      setWeightError(true);
      setWeightHelperText("Weight should be greater than zero");
      validationErrors = true;
    }
    if (minOrderQuantity < 1) {
      setMinOrderQuantityError(true);
      setMinOrderQuantityHelperText(
        "Minimum order quantity should be greater than zero"
      );
      validationErrors = true;
    }
    if (maxCapacityTurnOn === "Yes") {
      if (hours === "" || +hours === 0 || +hours > 72) {
        setHoursError(true);
        setHoursHelperText(
          "Hours should be greater than zero and lesser than 73"
        );
        validationErrors = true;
      }
    }

    if (mrp === "") {
      setMrpError(true);
      setMrpHelperText("Please enter MRP");
      validationErrors = true;
    }

    if (parseInt(mrp) === 0) {
      setMrpError(true);
      setMrpHelperText("MRP should be greater than zero");
      validationErrors = true;
    }

    if (parseInt(mrp) <= parseInt(discount)) {
      setDiscountError(true);
      setDiscountHelperText("Discount should be less than MRP");
      validationErrors = true;
    }

    if (parseInt(mrp) <= parseInt(rebate)) {
      setRebateError(true);
      setRebateHelperText("Rebate should be less than MRP");
      validationErrors = true;
    }

    if (isVegOrNonveg === "Non-Veg" && nonVegType === "") {
      setNonVegTypeHelperText("Please select Non-Veg type");
      validationErrors = true;
    }

    if (foodGalleryImages.length === 0 && foodPreviewFiles.length === 0) {
      setFoodGalleryError(true);
      setFoodGalleryHelperText("Please upload atleast one image");
      validationErrors = true;
    }

    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // handle submit
  const handleSubmit = async () => {
    const foodValid = validateAddfood();
    if (foodValid) {
      if (foodGalleryImages.length > 0) {
        setIsFileUploadFetching(true);
        setImageUploadStatus(false);
        for (let i = 0; i < foodGalleryImages.length; i++) {
          let formDataGallery = new FormData();
          formDataGallery.append("file", foodGalleryImages[i]);
          formDataGallery.append("path", "food_images");

          let responseGall = await invokeFormDataApi(
            config.apiDomains.commonService + apiList.uploadFile,
            formDataGallery,
            cookies
          );
          if (responseGall.status >= 200 && responseGall.status < 300) {
            if (responseGall.data.responseCode === "200") {
              let galleryImgs = foodImageUrls;
              galleryImgs.push(responseGall.data.imageUrl);
              setFoodImageUrls(galleryImgs);
            } else {
              alert(
                "Something went wrong while uploading a food image. Please try again later!"
              );

              setIsFileUploadFetching(false);
              return;
            }
          } else if (responseGall.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while uploading a food image. Please try again later!!"
            );
            setIsFileUploadFetching(false);
            return;
          }
        }
        setFoodGalleryImages([]);
        setImageUploadStatus(true);
        setIsFileUploadFetching(false);
      } else {
        setImageUploadStatus(true);
      }
    }
  };

  // Check for all seven or customize for timings
  const checkAllSevenOrCustomizeTimings = (avail) => {
    if (avail.length < 7) {
      return false;
    } else if (avail.length === 7) {
      for (let i = 0; i < avail.length; i++) {
        let timingI = avail[i].timings;
        for (let j = 1; j < avail.length; j++) {
          let timingJ = avail[j].timings;
          if (JSON.stringify(timingI) !== JSON.stringify(timingJ)) {
            return false;
          }
        }
      }
      return true;
    }
  };

  // Check for all seven or customize for Slots
  const checkAllSevenOrCustomizeSlots = (preOrder) => {
    if (preOrder.length < 7) {
      return false;
    } else if (preOrder.length === 7) {
      for (let i = 0; i < preOrder.length; i++) {
        let maxI = preOrder[i].deliverySlots;
        for (let j = 1; j < preOrder.length; j++) {
          let maxJ = preOrder[j].deliverySlots;
          if (JSON.stringify(maxI) !== JSON.stringify(maxJ)) {
            return false;
          }
        }
      }
      return true;
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Add Food Item";
  }, []);

  // if logged-in user is Cloud Kitchen Owner, set isLoading as false after
  // confirming that we have outletData available in cookies
  useEffect(() => {
    if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
      if (cookies[config.preferencesCookie].outletData) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [userData, cookies, navigate, dispatch]);

  // Api Call for add food items;
  useEffect(() => {
    const invokeAddFoodItemApi = async () => {
      setIsAddFooditemFetching(true);
      let customizeTimings;
      let customizeSlots;
      let availTimingsForSeven = [];
      let availSlotsForSeven = [];

      if (allSevenDays === "Yes") {
        let day = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        for (let i = 0; i < day.length; i++) {
          availTimingsForSeven.push({
            dayName: day[i],
            timings: showTimeAllSeven?.map((el) => ({
              startTime: el.start,
              endTime: el.end,
            })),
          });
        }
      } else if (allSevenDays === "No") {
        customizeTimings = [
          {
            dayName: "Monday",
            timings: checkedMondayClosed
              ? []
              : showTimeMonday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Tuesday",
            timings: checkedTuesdayClosed
              ? []
              : showTimeTuesday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Wednesday",
            timings: checkedWednesdayClosed
              ? []
              : showTimeWednesday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Thursday",
            timings: checkedThursdayClosed
              ? []
              : showTimeThursday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Friday",
            timings: checkedFridayClosed
              ? []
              : showTimeFriday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Saturday",
            timings: checkedSaturdayClosed
              ? []
              : showTimeSaturday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
          {
            dayName: "Sunday",
            timings: checkedSundayClosed
              ? []
              : showTimeSunday?.map((el) => ({
                  startTime: el.start,
                  endTime: el.end,
                })),
          },
        ];
      }
      // For preorder slots
      if (allSevenDaysSlot === "Yes") {
        let day = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        for (let i = 0; i < day.length; i++) {
          availSlotsForSeven.push({
            dayName: day[i],
            deliverySlots: showSlotAllSeven?.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
            })),
          });
        }
      } else if (allSevenDaysSlot === "No") {
        customizeSlots = [
          {
            dayName: "Monday",
            deliverySlots: checkedSlotMondayClosed
              ? []
              : showSlotMonday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Tuesday",
            deliverySlots: checkedSlotTuesdayClosed
              ? []
              : showSlotTuesday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Wednesday",
            deliverySlots: checkedSlotWednesdayClosed
              ? []
              : showSlotWednesday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Thursday",
            deliverySlots: checkedSlotThursdayClosed
              ? []
              : showSlotThursday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Friday",
            deliverySlots: checkedSlotFridayClosed
              ? []
              : showSlotFriday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Saturday",
            deliverySlots: checkedSlotSaturdayClosed
              ? []
              : showSlotSaturday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
          {
            dayName: "Sunday",
            deliverySlots: checkedSlotSundayClosed
              ? []
              : showSlotSunday?.map((el) => ({
                  deliverySlot: el.deliverySlot,
                  maxCapacity: el.maxCapacity !== "" ? el.maxCapacity : 0,
                })),
          },
        ];
      }
      let params = {
        itemName: itemName.trim(),
        description,
        cuisineId: cuisineId[0].id,
        category: category,
        vegNonVeg: isVegOrNonveg,
        nonVegType,
        spiceLevel,
        mrp: parseInt(mrp),
        discount: discount !== "" ? parseInt(discount) : 0,
        sellingPrice: sellPriceExclusiveGst,
        rebate: rebate !== "" ? parseInt(rebate) : 0,
        weight: parseInt(weight),
        minOrderQuantity: parseInt(minOrderQuantity),
        packingCharges: packingCharges !== "" ? parseInt(packingCharges) : 0,
        hoursToPreorder: maxCapacityTurnOn === "Yes" ? hours : null,
        availableTimings:
          autoTurnOn === "No"
            ? []
            : allSevenDays === "Yes"
            ? availTimingsForSeven
            : customizeTimings,
        preorderCapacity:
          maxCapacityTurnOn === "No"
            ? []
            : allSevenDaysSlot === "Yes"
            ? availSlotsForSeven
            : customizeSlots,
      };
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        params.cloudKitchenOutletId =
          cookies[config.preferencesCookie].outletData.id;
      }

      for (let i = 0; i < foodImageUrls.length; i++) {
        params[`image${i + 1}`] = foodImageUrls[i];
      }

      let response = await invokeApi(
        config.apiDomains.foodService + apiList.addFoodItem,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success(
            "Food item added successfully. It is submitted for review."
          );
          navigate("/food-items");
        } else if (response.data.responseCode === "HE007") {
          executeScroll();
          setItemNameError(true);
          setItemNameHelperText("Food item name already exists");
          setIsAddFooditemFetching(false);
        } else {
          alert(
            "Something went wrong while adding food item. Please try again later!"
          );
          setIsAddFooditemFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while adding food item. Please try again later!!"
        );
        setIsAddFooditemFetching(false);
      }
    };

    if (imageUploadStatus) {
      setImageUploadStatus(false);
      invokeAddFoodItemApi();
    }
  }, [
    userData,
    hours,
    autoTurnOn,
    showTimeAllSeven,
    minOrderQuantity,
    allSevenDays,
    showTimeMonday,
    checkedMondayClosed,
    showTimeTuesday,
    checkedTuesdayClosed,
    showTimeWednesday,
    checkedWednesdayClosed,
    showTimeThursday,
    checkedThursdayClosed,
    showTimeFriday,
    checkedFridayClosed,
    showTimeSaturday,
    checkedSaturdayClosed,
    showTimeSunday,
    checkedSundayClosed,
    allSevenDaysSlot,
    showSlotMonday,
    checkedSlotMondayClosed,
    showSlotTuesday,
    checkedSlotTuesdayClosed,
    showSlotWednesday,
    checkedSlotWednesdayClosed,
    showSlotThursday,
    checkedSlotThursdayClosed,
    showSlotFriday,
    checkedSlotFridayClosed,
    showSlotSaturday,
    checkedSlotSaturdayClosed,
    showSlotSunday,
    checkedSlotSundayClosed,
    maxCapacityTurnOn,
    showSlotAllSeven,
    cuisinesData,
    cuisineId,
    description,
    discount,
    foodImageUrls,
    isVegOrNonveg,
    itemName,
    mrp,
    nonVegType,
    weight,
    packingCharges,
    spiceLevel,
    category,
    imageUploadStatus,
    cookies,
    rebate,
    navigate,
    sellPriceExclusiveGst,
  ]);

  // Get cuisines
  useEffect(() => {
    setIsCuisinesFetching(true);
    const getCuisines = async () => {
      let params = { status: "Active" };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getCuisines,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCuisinesData(response.data.cuisines);
          setIsCuisinesFetching(false);
        } else {
          alert(
            "Something went wrong while fetching cuisines. Please try again later!"
          );
          setIsCuisinesFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching cuisines. Please try again later!!"
        );
        setIsCuisinesFetching(false);
      }
    };
    getCuisines();
  }, [cookies, navigate]);

  // Setting up cusuine id;
  useEffect(() => {
    let cusId = cuisinesData?.filter((el) => el.cuisineName === cuisine);
    setCuisineId(cusId);
  }, [cuisine, cuisinesData]);

  // Calculating mrp, and discount prices
  useEffect(() => {
    setSellPriceExclusiveGst(
      parseInt(mrp ? mrp : 0) - parseInt(discount ? discount : 0)
    );
  }, [discount, mrp]);

  useEffect(() => {
    if (userData?.user) {
      if (
        !(
          userData?.user.roles.indexOf("Cloud Kitchen Owner") > -1 ||
          userData?.user.roles.indexOf("Home Chef Owner") > -1 ||
          userData?.user.roles.indexOf("Chef Manager") > -1 ||
          userData?.user.roles.indexOf("Outlet Manager") > -1
        )
      ) {
        navigate("/");
      }
    }
  }, [userData, navigate]);

  // setting food item state for update;
  useEffect(() => {
    const settingFoodItemData = () => {
      if (!!foodItemData) {
        // Available Timings
        if (foodItemData?.availableTimings?.length > 0) {
          setAutoTurnOn("Yes");
        } else {
          setAutoTurnOn("No");
        }
        if (!checkAllSevenOrCustomizeTimings(foodItemData?.availableTimings)) {
          setAllSevenDays("No");
          // setting state for monday
          let filterMonday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Monday"
          );
          if (filterMonday.length > 0) {
            let timingsMon = filterMonday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeMonday(timingsMon);
            setShowTimeAllSeven(timingsMon);
          } else {
            setShowTimeAllSeven([
              {
                start: "09:00",
                end: "18:00",
              },
            ]);
            setCheckedMondayClosed(true);
          }

          // setting state for tuesday
          let filterTuesday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Tuesday"
          );
          if (filterTuesday.length > 0) {
            let timingsTue = filterTuesday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeTuesday(timingsTue);
          } else {
            setCheckedTuesdayClosed(true);
          }

          // setting state for wednesday
          let filterWednesday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Wednesday"
          );
          if (filterWednesday.length > 0) {
            let timingsWed = filterWednesday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeWednesday(timingsWed);
          } else {
            setCheckedWednesdayClosed(true);
          }

          // setting state for thursday
          let filterThursday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Thursday"
          );
          if (filterThursday.length > 0) {
            let timingsThu = filterThursday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeThursday(timingsThu);
          } else {
            setCheckedThursdayClosed(true);
          }

          // setting state for friday
          let filterFriday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Friday"
          );
          if (filterFriday.length > 0) {
            let timingsFri = filterFriday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeFriday(timingsFri);
          } else {
            setCheckedFridayClosed(true);
          }

          // setting state for saturday
          let filterSaturday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Saturday"
          );
          if (filterSaturday.length > 0) {
            let timingsSat = filterSaturday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeSaturday(timingsSat);
          } else {
            setCheckedSaturdayClosed(true);
          }

          // setting state for sunday
          let filterSunday = foodItemData?.availableTimings.filter(
            (el) => el.dayName === "Sunday"
          );
          if (filterSunday.length > 0) {
            let timingsSun = filterSunday[0].timings.map((el) => ({
              start: el.startTime,
              end: el.endTime,
            }));
            setShowTimeSunday(timingsSun);
          } else {
            setCheckedSundayClosed(true);
          }
        } else {
          let timingsAllSeven = foodItemData?.availableTimings[0].timings.map(
            (el) => ({
              start: el.startTime,
              end: el.endTime,
            })
          );
          setShowTimeAllSeven(timingsAllSeven);
          setShowTimeMonday(timingsAllSeven);
          setShowTimeTuesday(timingsAllSeven);
          setShowTimeWednesday(timingsAllSeven);
          setShowTimeThursday(timingsAllSeven);
          setShowTimeFriday(timingsAllSeven);
          setShowTimeSaturday(timingsAllSeven);
          setShowTimeSunday(timingsAllSeven);
          setAllSevenDays("Yes");
        }

        // Preorder maxCapacity
        if (foodItemData?.preorderCapacity?.length > 0) {
          setMaxCapacityTurnOn("Yes");
        } else {
          setMaxCapacityTurnOn("No");
        }

        if (!checkAllSevenOrCustomizeSlots(foodItemData?.preorderCapacity)) {
          setAllSevenDaysSlot("No");
          // setting state for monday
          let filterSlotMonday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Monday"
          );
          if (filterSlotMonday.length > 0) {
            let slotsMon = filterSlotMonday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotMonday(slotsMon);
            setShowSlotAllSeven(slotsMon);
          } else {
            setShowSlotAllSeven([
              {
                maxCapacity: "",
                deliverySlot: "7am - 8am",
              },
            ]);
            setCheckedSlotMondayClosed(true);
          }

          // setting state for tuesday
          let filterSlotTuesday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Tuesday"
          );
          if (filterSlotTuesday.length > 0) {
            let slotsTue = filterSlotTuesday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotTuesday(slotsTue);
          } else {
            setCheckedSlotTuesdayClosed(true);
          }

          // setting state for wednesday
          let filterSlotWednesday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Wednesday"
          );
          if (filterSlotWednesday.length > 0) {
            let slotsWed = filterSlotWednesday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotWednesday(slotsWed);
          } else {
            setCheckedSlotWednesdayClosed(true);
          }

          // setting state for thursday
          let filterSlotThursday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Thursday"
          );
          if (filterSlotThursday.length > 0) {
            let slotsThu = filterSlotThursday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotThursday(slotsThu);
          } else {
            setCheckedSlotThursdayClosed(true);
          }

          // setting state for friday
          let filterSlotFriday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Friday"
          );
          if (filterSlotFriday.length > 0) {
            let slotsFri = filterSlotFriday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotFriday(slotsFri);
          } else {
            setCheckedSlotFridayClosed(true);
          }

          // setting state for saturday
          let filterSlotSaturday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Saturday"
          );
          if (filterSlotSaturday.length > 0) {
            let slotsSat = filterSlotSaturday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotSaturday(slotsSat);
          } else {
            setCheckedSlotSaturdayClosed(true);
          }

          // setting state for sunday
          let filterSlotSunday = foodItemData?.preorderCapacity.filter(
            (el) => el.dayName === "Sunday"
          );
          if (filterSlotSunday.length > 0) {
            let slotsSun = filterSlotSunday[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
            setShowSlotSunday(slotsSun);
          } else {
            setCheckedSlotSundayClosed(true);
          }
        } else {
          let slotsForAllSeven =
            foodItemData?.preorderCapacity[0].deliverySlots.map((el) => ({
              deliverySlot: el.deliverySlot,
              maxCapacity: el.maxCapacity,
            }));
          setShowSlotAllSeven(slotsForAllSeven);
          setShowSlotMonday(slotsForAllSeven);
          setShowSlotTuesday(slotsForAllSeven);
          setShowSlotWednesday(slotsForAllSeven);
          setShowSlotThursday(slotsForAllSeven);
          setShowSlotFriday(slotsForAllSeven);
          setShowSlotSaturday(slotsForAllSeven);
          setShowSlotSunday(slotsForAllSeven);
          setAllSevenDaysSlot("Yes");
        }
        setHours(foodItemData?.hoursToPreorder);
        setDescription(foodItemData.description);
        setCuisine(foodItemData.cuisineName);
        setCategory(foodItemData.category);
        setIsVegOrNonveg(foodItemData.vegNonVeg);
        setNonVegType(foodItemData.nonVegType);
        setSpiceLevel(foodItemData.spiceLevel);
        setMrp(foodItemData.mrp);
        setDiscount(foodItemData.discount);
        setRebate(foodItemData.rebate);
        setWeight(foodItemData.weight);
        setMinOrderQuantity(foodItemData.minOrderQuantity);
        setPackingCharges(foodItemData?.packingCharges);
      }
    };
    if (cloneFoodItemStatus) {
      setCloneFoodItemStatus(false);
      settingFoodItemData();
    }
  }, [foodItemData, cloneFoodItemStatus]);

  // validate timings for all seven days option
  useEffect(() => {
    const validateTimings = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeAllSeven));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeAllSeven(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeAllSeven(timingsData);
        }
      }

      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeAllSeven(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeAllSeven(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeAllSeven(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeAllSeven(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidation) {
      setInvokeTimeValidation(false);
      validateTimings();
    }
  }, [showTimeAllSeven, invokeTimeValidation]);

  // validate timings for Monday
  useEffect(() => {
    const validateTimingMonday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeMonday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeMonday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeMonday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeMonday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeMonday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeMonday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeMonday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidMonday) {
      setInvokeTimeValidMonday(false);
      validateTimingMonday();
    }
  }, [showTimeMonday, invokeTimeValidMonday]);

  // validate timings for Tuesday
  useEffect(() => {
    const validateTimingTuesday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeTuesday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
     
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeTuesday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeTuesday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeTuesday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeTuesday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeTuesday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeTuesday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidTuesday) {
      setInvokeTimeValidTuesday(false);
      validateTimingTuesday();
    }
  }, [showTimeTuesday, invokeTimeValidTuesday]);

  // validate timings for Wednesday
  useEffect(() => {
    const validateTimingWednesday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeWednesday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeWednesday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeWednesday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData?.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeWednesday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeWednesday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeWednesday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeWednesday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidWednesday) {
      setInvokeTimeValidWednesday(false);
      validateTimingWednesday();
    }
  }, [showTimeWednesday, invokeTimeValidWednesday]);

  // validate timings for Thursday
  useEffect(() => {
    const validateTimingThursday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeThursday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeThursday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeThursday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeThursday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeThursday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeThursday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeThursday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidThursday) {
      setInvokeTimeValidThursday(false);
      validateTimingThursday();
    }
  }, [showTimeThursday, invokeTimeValidThursday]);

  // validate timings for Friday
  useEffect(() => {
    const validateTimingFriday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeFriday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeFriday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeFriday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeFriday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeFriday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeFriday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeFriday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidFriday) {
      setInvokeTimeValidFriday(false);
      validateTimingFriday();
    }
  }, [showTimeFriday, invokeTimeValidFriday]);

  // validate timings for Saturday
  useEffect(() => {
    const validateTimingSaturday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeSaturday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeSaturday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeSaturday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeSaturday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeSaturday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeSaturday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeSaturday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidSaturday) {
      setInvokeTimeValidSaturday(false);
      validateTimingSaturday();
    }
  }, [showTimeSaturday, invokeTimeValidSaturday]);

  // validate timings for Sunday
  useEffect(() => {
    const validateTimingSunday = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeSunday));
      let validCheck = true;
      for (let i = 0; i < timingsData.length; i++) {
        if (timingsData[i].start === timingsData[i].end) {
          timingsData[i].helperText = "Start time cannot be same as end time";
          setShowTimeSunday(timingsData);
          validCheck = false;
          break;
        } else {
          timingsData[i].helperText = null;
          setShowTimeSunday(timingsData);
        }
      }
      if (validCheck && timingsData.length > 1) {
        for (let i = 0; i < timingsData.length; i++) {
          for (let j = 0; j < timingsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              timingsData[i].start === timingsData[j].start &&
              timingsData[i].end === timingsData[j].end
            ) {
              timingsData[i].helperText =
                "Start Time and End Time is same for multiple records";
              setShowTimeSunday(timingsData);
              break;
            } else if (timingsData[i].start === timingsData[j].start) {
              timingsData[i].helperText =
                "Start Time is same for multiple records";
              setShowTimeSunday(timingsData);
              break;
            } else if (timingsData[i].end === timingsData[j].end) {
              timingsData[i].helperText =
                "End Time is same for multiple records";
              setShowTimeSunday(timingsData);
              break;
            } else {
              timingsData[i].helperText = null;
              setShowTimeSunday(timingsData);
            }
          }
        }
      }
    };
    if (invokeTimeValidSunday) {
      setInvokeTimeValidSunday(false);
      validateTimingSunday();
    }
  }, [showTimeSunday, invokeTimeValidSunday]);

  // validation for all seven max capacity slots
  useEffect(() => {
    const validateSlots = () => {
      let slotsData = JSON.parse(JSON.stringify(showSlotAllSeven));
      if (slotsData.length > 1) {
        for (let i = 0; i < slotsData.length; i++) {
          for (let j = 0; j < slotsData.length; j++) {
            if (i === j) {
              continue;
            }
            if (slotsData[i].deliverySlot === slotsData[j].deliverySlot) {
              slotsData[i].helperText =
                "Same Delivery slot added more than once";
              setShowSlotAllSeven(slotsData);
              break;
            } else {
              slotsData[i].helperText = null;
              setShowSlotAllSeven(slotsData);
            }
          }
        }
      } else {
        slotsData[0].helperText = null;
        setShowSlotAllSeven(slotsData);
      }
    };
    if (invokeSlotValidation) {
      setInvokeSlotValidation(false);
      validateSlots();
    }
  }, [invokeSlotValidation, showSlotAllSeven]);

  // validation for all seven max capacity slots
  useEffect(() => {
    const validateForCustomiseSlots = () => {
      let slotsMon = JSON.parse(JSON.stringify(showSlotMonday));
      let slotsTue = JSON.parse(JSON.stringify(showSlotTuesday));
      let slotsWed = JSON.parse(JSON.stringify(showSlotWednesday));
      let slotsThu = JSON.parse(JSON.stringify(showSlotThursday));
      let slotsFri = JSON.parse(JSON.stringify(showSlotFriday));
      let slotsSat = JSON.parse(JSON.stringify(showSlotSaturday));
      let slotsSun = JSON.parse(JSON.stringify(showSlotSunday));
      // Monday
      if (invokeSlotValidMonday) {
        if (slotsMon.length > 1) {
          for (let i = 0; i < slotsMon.length; i++) {
            for (let j = 0; j < slotsMon.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsMon[i].deliverySlot === slotsMon[j].deliverySlot) {
                slotsMon[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotMonday(slotsMon);
                break;
              } else {
                slotsMon[i].helperText = null;
                setShowSlotMonday(slotsMon);
              }
            }
          }
        } else {
          slotsMon[0].helperText = null;
          setShowSlotMonday(slotsMon);
        }
      }
      // Tuesday

      if (invokeSlotValidTuesday) {
        if (slotsTue.length > 1) {
          for (let i = 0; i < slotsTue.length; i++) {
            for (let j = 0; j < slotsTue.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsTue[i].deliverySlot === slotsTue[j].deliverySlot) {
                slotsTue[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotTuesday(slotsTue);
                break;
              } else {
                slotsTue[i].helperText = null;
                setShowSlotTuesday(slotsTue);
              }
            }
          }
        } else {
          slotsTue[0].helperText = null;
          setShowSlotTuesday(slotsTue);
        }
      }

      // Wednesday
      if (invokeSlotValidWednesday) {
        if (slotsWed.length > 1) {
          for (let i = 0; i < slotsWed.length; i++) {
            for (let j = 0; j < slotsWed.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsWed[i].deliverySlot === slotsWed[j].deliverySlot) {
                slotsWed[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotWednesday(slotsWed);
                break;
              } else {
                slotsWed[i].helperText = null;
                setShowSlotWednesday(slotsWed);
              }
            }
          }
        } else {
          slotsWed[0].helperText = null;
          setShowSlotWednesday(slotsWed);
        }
      }
      // Thursday
      if (invokeSlotValidThursday) {
        if (slotsThu.length > 1) {
          for (let i = 0; i < slotsThu.length; i++) {
            for (let j = 0; j < slotsThu.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsThu[i].deliverySlot === slotsThu[j].deliverySlot) {
                slotsThu[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotThursday(slotsThu);
                break;
              } else {
                slotsThu[i].helperText = null;
                setShowSlotThursday(slotsThu);
              }
            }
          }
        } else {
          slotsThu[0].helperText = null;
          setShowSlotThursday(slotsThu);
        }
      }
      // Friday
      if (invokeSlotValidFriday) {
        if (slotsFri.length > 1) {
          for (let i = 0; i < slotsFri.length; i++) {
            for (let j = 0; j < slotsFri.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsFri[i].deliverySlot === slotsFri[j].deliverySlot) {
                slotsFri[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotFriday(slotsFri);
                break;
              } else {
                slotsFri[i].helperText = null;
                setShowSlotFriday(slotsFri);
              }
            }
          }
        } else {
          slotsFri[0].helperText = null;
          setShowSlotFriday(slotsFri);
        }
      }

      // Saturday
      if (invokeSlotValidSaturday) {
        if (slotsSat.length > 1) {
          for (let i = 0; i < slotsSat.length; i++) {
            for (let j = 0; j < slotsSat.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsSat[i].deliverySlot === slotsSat[j].deliverySlot) {
                slotsSat[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotSaturday(slotsSat);
                break;
              } else {
                slotsSat[i].helperText = null;
                setShowSlotSaturday(slotsSat);
              }
            }
          }
        } else {
          slotsSat[0].helperText = null;
          setShowSlotSaturday(slotsSat);
        }
      }
      // Sunday
      if (invokeSlotValidSunday) {
        if (slotsSun.length > 1) {
          for (let i = 0; i < slotsSun.length; i++) {
            for (let j = 0; j < slotsSun.length; j++) {
              if (i === j) {
                continue;
              }
              if (slotsSun[i].deliverySlot === slotsSun[j].deliverySlot) {
                slotsSun[i].helperText =
                  "Same Delivery slot added more than once";
                setShowSlotSunday(slotsSun);
                break;
              } else {
                slotsSun[i].helperText = null;
                setShowSlotSunday(slotsSun);
              }
            }
          }
        } else {
          slotsSun[0].helperText = null;
          setShowSlotSunday(slotsSun);
        }
      }
    };
    if (
      invokeSlotValidMonday ||
      invokeSlotValidTuesday ||
      invokeSlotValidWednesday ||
      invokeSlotValidThursday ||
      invokeSlotValidFriday ||
      invokeSlotValidSaturday ||
      invokeSlotValidSunday
    ) {
      setInvokeSlotValidMonday(false);
      setInvokeSlotValidTuesday(false);
      setInvokeSlotValidWednesday(false);
      setInvokeSlotValidThursday(false);
      setInvokeSlotValidFriday(false);
      setInvokeSlotValidSaturday(false);
      setInvokeSlotValidSunday(false);
      validateForCustomiseSlots();
    }
  }, [
    invokeSlotValidMonday,
    invokeSlotValidTuesday,
    invokeSlotValidWednesday,
    invokeSlotValidThursday,
    invokeSlotValidFriday,
    invokeSlotValidSaturday,
    invokeSlotValidSunday,
    showSlotMonday,
    showSlotTuesday,
    showSlotWednesday,
    showSlotThursday,
    showSlotFriday,
    showSlotSaturday,
    showSlotSunday,
  ]);

  return (
    <>
      <Header />
      {isLoading || isCuisinesFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Card
          variant="outlined"
          sx={{ width: { xs: 350, sm: 600 }, mx: "auto", my: 2 }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Breadcrumbs separator="›">
              <Link component={RouterLink} to="/">
                <Box
                  component={"img"}
                  sx={{ width: "16px", height: "16px", mt: "4px" }}
                  src="/media/svg/home-filled-orange.svg"
                />
              </Link>
              <Link underline="hover" component={RouterLink} to="/food-items">
                Food Items
              </Link>
              <Typography color="inherit">
                Add Food Item
                {!!cookies[config.preferencesCookie]?.outletData
                  ?.cloudKitchenName &&
                  !!cookies[config.preferencesCookie]?.outletData?.outletName &&
                  " under " +
                    cookies[config.preferencesCookie]?.outletData
                      ?.cloudKitchenName +
                    " - " +
                    cookies[config.preferencesCookie]?.outletData?.outletName}
              </Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ mt: 3, mb: 2, textAlign: "center" }}>
              Add Food Item
            </Typography>
            <TextField
              ref={myRef}
              id="itemName"
              label="Item Name *"
              value={itemName}
              variant="standard"
              onChange={(ev) => {
                setItemName(ev.target.value.replace(/\s\s+/g, " "));
                setItemNameError(false);
                setItemNameHelperText("");
              }}
              inputProps={{ maxLength: 60 }}
              error={itemNameError}
              helperText={itemNameHelperText}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              id="description"
              label="Description"
              value={description}
              onChange={(ev) => {
                setDescription(ev.target.value);
              }}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              fullWidth
            />
            <Typography variant="body1" sx={{ my: 1, textAlign: "left" }}>
              Images *
            </Typography>
            <Typography variant="bodyregular" sx={{ textAlign: "left" }}>
              You can upload upto 6 images. Atleast one is required.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <label htmlFor="food-gallery">
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="food-gallery"
                  multiple
                  type="file"
                  onClick={(ev) => (ev.target.value = "")}
                  onChange={foodImageUpload}
                />
                {foodPreviewFiles.length < 6 && (
                  <Button color="primary" variant="contained" component="span">
                    <AddAPhotoIcon sx={{ mr: 2 }} />
                    Upload Images
                  </Button>
                )}
              </label>
            </Box>
            {foodGalleryError && (
              <Typography
                variant="caption"
                color={"error"}
                sx={{ mt: 2, textAlign: "left" }}
              >
                {foodGalleryHelperText}
              </Typography>
            )}
            <ImageList cols={3}>
              {foodPreviewFiles.map((items, idx) => (
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
              ))}
            </ImageList>
            <FormControl variant="standard" sx={{ mt: 2 }}>
              <InputLabel>Cuisine Type *</InputLabel>
              <Select
                label="Cuisine"
                value={cuisine}
                onChange={(ev) => {
                  setCuisine(ev.target.value);
                  setCuisineHelperText("");
                }}
              >
                {cuisinesData?.map((el) => (
                  <MenuItem key={el.id} value={el.cuisineName}>
                    {el.cuisineName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error>{cuisineHelperText}</FormHelperText>
            </FormControl>
            <TextField
              id="category"
              label="Category *"
              value={category}
              variant="standard"
              onChange={(ev) => {
                setCategory(ev.target.value.replace(/\s\s+/g, " "));
                setCategoryError(false);
                setCategoryHelperText("");
              }}
              error={categoryError}
              helperText={categoryHelperText}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Veg / Non-Veg
            </Typography>
            <RadioGroup
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
              value={isVegOrNonveg}
              onChange={(e) => {
                setIsVegOrNonveg(e.target.value);
                setNonVegType("");
              }}
            >
              <FormControlLabel label="Veg" value="Veg" control={<Radio />} />
              <FormControlLabel
                label="Non-Veg"
                value="Non-Veg"
                control={<Radio />}
              />
            </RadioGroup>
            {isVegOrNonveg === "Non-Veg" && (
              <FormControl variant="standard" sx={{ mb: 2 }}>
                <InputLabel>Non-Veg Type *</InputLabel>
                <Select
                  label="Non-Veg "
                  value={nonVegType}
                  onChange={(ev) => {
                    setNonVegType(ev.target.value);
                    setNonVegTypeHelperText("");
                  }}
                >
                  <MenuItem value="Egg">Egg</MenuItem>
                  <MenuItem value="Chicken">Chicken</MenuItem>
                  <MenuItem value="Mutton">Mutton</MenuItem>
                  <MenuItem value="Sea Food">Sea Food</MenuItem>
                </Select>
                <FormHelperText error>{nonVegTypeHelperText}</FormHelperText>
              </FormControl>
            )}
            <FormControl variant="standard" sx={{ mb: 2 }}>
              <InputLabel>Spice Level *</InputLabel>
              <Select
                label="Spice-Level"
                value={spiceLevel}
                onChange={(ev) => {
                  setSpiceLevel(ev.target.value);
                  setSpiceLevelHelperText("");
                }}
              >
                <MenuItem value="Not Applicable">Not Applicable</MenuItem>
                <MenuItem value="Mild">Mild</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hot">Hot</MenuItem>
              </Select>
              <FormHelperText error>{spiceLevelHelperText}</FormHelperText>
            </FormControl>
            <TextField
              id="weight"
              label="Weight (in grams) *"
              value={weight}
              variant="standard"
              onChange={(ev) => {
                setWeight(ev.target.value.replace(/\D/, ""));
                setWeightError(false);
                setWeightHelperText("");
              }}
              error={weightError}
              helperText={weightHelperText}
              inputProps={{ maxLength: 5 }}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Enter approximate weight. It will be used to estimate the overall
              delivery weight of the order. It will not be shown to Customers.
            </Typography>
            <TextField
              id="minOrderQuantity"
              label="Minimum Order Quantity *"
              value={minOrderQuantity}
              variant="standard"
              onChange={(ev) => {
                setMinOrderQuantity(ev.target.value.replace(/\D/, ""));
                setMinOrderQuantityError(false);
                setMinOrderQuantityHelperText("");
              }}
              error={minOrderQuantityError}
              helperText={minOrderQuantityHelperText}
              inputProps={{ maxLength: 5 }}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              id="mrp"
              label="MRP exclusive GST *"
              value={mrp}
              variant="standard"
              onChange={(ev) => {
                setMrp(ev.target.value.replace(/\D/, ""));
                setMrpError(false);
                setMrpHelperText("");
              }}
              inputProps={{ maxLength: 5 }}
              error={mrpError}
              helperText={mrpHelperText}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              id="discount"
              label="Discount in Rupees"
              value={discount}
              variant="standard"
              onChange={(ev) => {
                setDiscount(ev.target.value.replace(/\D/, ""));
                setDiscountError(false);
                setDiscountHelperText("");
              }}
              inputProps={{ maxLength: 5 }}
              error={discountError}
              helperText={discountHelperText}
              sx={{ mb: 2 }}
              fullWidth
            />
            <Box sx={{ backgroundColor: "#EEEEEE", p: 2 }}>
              <Typography variant="body1">
                Selling price exclusive GST: {sellPriceExclusiveGst}
              </Typography>
            </Box>
            <TextField
              id="rebate"
              label="Rebate on delivery charges (in rupees per unit)"
              value={rebate}
              variant="standard"
              onChange={(ev) => {
                setRebate(ev.target.value.replace(/\D/, ""));
                setRebateError(false);
                setRebateHelperText("");
              }}
              inputProps={{ maxLength: 3 }}
              error={rebateError}
              helperText={rebateHelperText}
              sx={{ mt: 2 }}
              fullWidth
            />
            <TextField
              id="packingCharges"
              label="Packing Charges"
              value={packingCharges}
              variant="standard"
              onChange={(ev) => {
                setPackingCharges(ev.target.value.replace(/\D/, ""));
                setPackingChargesError(false);
                setPackingChargesHelperText("");
              }}
              error={packingChargesError}
              helperText={packingChargesHelperText}
              inputProps={{ maxLength: 5 }}
              fullWidth
              sx={{ mt: 2 }}
            />

            {/* Auto turn on or off  */}
            <Typography variant="bodybold" sx={{ mt: 2 }}>
              Available Timings (for Instant Orders)
            </Typography>
            <Typography variant="bodymetatag" sx={{ mt: 1 }}>
              Do you want the system to Auto Turn ON and Turn OFF? Leave it as
              No, if you want to handle this manually.
            </Typography>
            <RadioGroup
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
              value={autoTurnOn}
              onChange={(e) => {
                setAutoTurnOn(e.target.value);

                if (e.target.value === "Yes") {
                  setShowTimeAllSeven([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);

                  setShowTimeMonday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedMondayClosed(false);
                  setShowTimeTuesday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedTuesdayClosed(false);
                  setShowTimeWednesday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedWednesdayClosed(false);
                  setShowTimeThursday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedThursdayClosed(false);
                  setShowTimeFriday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedFridayClosed(false);
                  setShowTimeSaturday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedSaturdayClosed(false);
                  setShowTimeSunday([
                    {
                      start: "09:00",
                      end: "18:00",
                    },
                  ]);
                  setCheckedSundayClosed(false);
                }
              }}
            >
              <FormControlLabel label="Yes" value="Yes" control={<Radio />} />
              <FormControlLabel label="No" value="No" control={<Radio />} />
            </RadioGroup>

            {/* Available Timings for Instant Order */}
            {autoTurnOn === "Yes" && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <RadioGroup
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  value={allSevenDays}
                  onChange={(e) => {
                    setAllSevenDays(e.target.value);
                    if (e.target.value === "Yes") {
                      setShowTimeMonday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedMondayClosed(false);
                      setShowTimeTuesday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedTuesdayClosed(false);
                      setShowTimeWednesday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedWednesdayClosed(false);
                      setShowTimeThursday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedThursdayClosed(false);
                      setShowTimeFriday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedFridayClosed(false);
                      setShowTimeSaturday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedSaturdayClosed(false);
                      setShowTimeSunday([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                      setCheckedSundayClosed(false);
                    } else if (e.target.value === "No") {
                      setShowTimeAllSeven([
                        {
                          start: "09:00",
                          end: "18:00",
                        },
                      ]);
                    }
                  }}
                >
                  <FormControlLabel
                    label="All 7 Days"
                    value="Yes"
                    control={<Radio />}
                  />
                  <FormControlLabel
                    label="Customize"
                    value="No"
                    control={<Radio />}
                  />
                </RadioGroup>

                {allSevenDays === "Yes" && (
                  <>
                    {showTimeAllSeven?.map((el, idx) => (
                      <Box key={idx}>
                        <Box
                          sx={{
                            display: "flex",
                            // width: "60%",
                            // justifyContent: "space-between",
                            alignItems: "center",
                            gap: "16px",
                            mb: 1,
                          }}
                        >
                          <FormControl
                            sx={{ width: "120px" }}
                            variant="standard"
                          >
                            <InputLabel id="start-time">Start Time</InputLabel>
                            <Select
                              labelId="start-time"
                              id="start-time"
                              value={convertTime24to12(el.start)}
                              label="Start Time"
                              onChange={(ev) => {
                                let copy = JSON.parse(
                                  JSON.stringify(showTimeAllSeven)
                                );
                                copy[idx].start = convertTime12to24(
                                  ev.target.value
                                );
                                setShowTimeAllSeven(copy);
                                setInvokeTimeValidation(true);
                              }}
                            >
                              {timeFormat?.map((el, idx) => (
                                <MenuItem key={idx} value={el}>
                                  {el}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl
                            sx={{ width: "120px" }}
                            variant="standard"
                          >
                            <InputLabel id="end-time">End Time</InputLabel>
                            <Select
                              labelId="end-time"
                              id="end-time"
                              value={convertTime24to12(el.end)}
                              label="End Time"
                              onChange={(ev) => {
                                let copy = JSON.parse(
                                  JSON.stringify(showTimeAllSeven)
                                );
                                copy[idx].end = convertTime12to24(
                                  ev.target.value
                                );
                                setShowTimeAllSeven(copy);
                                setInvokeTimeValidation(true);
                              }}
                            >
                              {timeFormat?.map((el, idx) => (
                                <MenuItem key={idx} value={el}>
                                  {el}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {showTimeAllSeven?.length > 1 && (
                            <IconButton
                              onClick={() => {
                                let copy = JSON.parse(
                                  JSON.stringify(showTimeAllSeven)
                                );
                                copy.splice(idx, 1);
                                setShowTimeAllSeven(copy);
                                setInvokeTimeValidation(true);
                              }}
                            >
                              <RemoveCircleOutlineIcon
                                sx={{ cursor: "pointer" }}
                                fontSize="medium"
                              />
                            </IconButton>
                          )}

                          {idx === showTimeAllSeven?.length - 1 && (
                            <IconButton
                              onClick={() => {
                                let copy = JSON.parse(
                                  JSON.stringify(showTimeAllSeven)
                                );
                                copy.push({
                                  start: "09:00",
                                  end: "18:00",
                                });
                                setShowTimeAllSeven(copy);
                                setInvokeTimeValidation(true);
                              }}
                            >
                              <AddCircleOutlineIcon
                                sx={{ cursor: "pointer" }}
                                fontSize="medium"
                              />
                            </IconButton>
                          )}
                        </Box>
                        {!!el.helperText && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: "8px",
                              mb: 2,
                            }}
                          >
                            <Box
                              component={"img"}
                              sx={{
                                height: "12px",
                                width: "12px",
                                pt: "3px",
                              }}
                              src="/media/svg/error-exclaim.svg"
                            />
                            <Typography variant="bodymetatag" color="#F44336">
                              {el.helperText}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}

                {/* Customize timings */}
                {allSevenDays === "No" && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Monday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedMondayClosed}
                          control={
                            <Checkbox
                              checked={checkedMondayClosed}
                              onChange={(ev) => {
                                setCheckedMondayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeMonday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedMondayClosed && (
                        <>
                          {showTimeMonday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeMonday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeMonday(copy);
                                      setInvokeTimeValidMonday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeMonday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeMonday(copy);
                                      setInvokeTimeValidMonday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeMonday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeMonday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeMonday(copy);
                                      setInvokeTimeValidMonday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}

                                {idx === showTimeMonday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeMonday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeMonday(copy);
                                      setInvokeTimeValidMonday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Tuesday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedTuesdayClosed}
                          control={
                            <Checkbox
                              checked={checkedTuesdayClosed}
                              onChange={(ev) => {
                                setCheckedTuesdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeTuesday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedTuesdayClosed && (
                        <>
                          {showTimeTuesday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeTuesday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeTuesday(copy);
                                      setInvokeTimeValidTuesday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeTuesday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeTuesday(copy);
                                      setInvokeTimeValidTuesday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeTuesday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeTuesday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeTuesday(copy);
                                      setInvokeTimeValidTuesday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeTuesday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeTuesday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeTuesday(copy);
                                      setInvokeTimeValidTuesday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Wednesday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedWednesdayClosed}
                          control={
                            <Checkbox
                              checked={checkedWednesdayClosed}
                              onChange={(ev) => {
                                setCheckedWednesdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeWednesday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedWednesdayClosed && (
                        <>
                          {showTimeWednesday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="date-select-label">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeWednesday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeWednesday(copy);
                                      setInvokeTimeValidWednesday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="slot-select-label">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeWednesday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeWednesday(copy);
                                      setInvokeTimeValidWednesday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeWednesday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeWednesday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeWednesday(copy);
                                      setInvokeTimeValidWednesday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeWednesday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeWednesday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeWednesday(copy);
                                      setInvokeTimeValidWednesday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Thursday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedThursdayClosed}
                          control={
                            <Checkbox
                              checked={checkedThursdayClosed}
                              onChange={(ev) => {
                                setCheckedThursdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeThursday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedThursdayClosed && (
                        <>
                          {showTimeThursday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeThursday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeThursday(copy);
                                      setInvokeTimeValidThursday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeThursday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeThursday(copy);
                                      setInvokeTimeValidThursday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeThursday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeThursday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeThursday(copy);
                                      setInvokeTimeValidThursday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeThursday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeThursday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeThursday(copy);
                                      setInvokeTimeValidThursday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Friday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedFridayClosed}
                          control={
                            <Checkbox
                              checked={checkedFridayClosed}
                              onChange={(ev) => {
                                setCheckedFridayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeFriday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedFridayClosed && (
                        <>
                          {showTimeFriday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeFriday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeFriday(copy);
                                      setInvokeTimeValidFriday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeFriday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeFriday(copy);
                                      setInvokeTimeValidFriday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeFriday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeFriday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeFriday(copy);
                                      setInvokeTimeValidFriday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeFriday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeFriday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeFriday(copy);
                                      setInvokeTimeValidFriday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Saturday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSaturdayClosed}
                          control={
                            <Checkbox
                              checked={checkedSaturdayClosed}
                              onChange={(ev) => {
                                setCheckedSaturdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeSaturday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSaturdayClosed && (
                        <>
                          {showTimeSaturday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSaturday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeSaturday(copy);
                                      setInvokeTimeValidSaturday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSaturday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeSaturday(copy);
                                      setInvokeTimeValidSaturday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeSaturday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSaturday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeSaturday(copy);
                                      setInvokeTimeValidSaturday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeSaturday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSaturday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeSaturday(copy);
                                      setInvokeTimeValidSaturday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Sunday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSundayClosed}
                          control={
                            <Checkbox
                              checked={checkedSundayClosed}
                              onChange={(ev) => {
                                setCheckedSundayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeSunday([
                                    {
                                      start: "09:00",
                                      end: "18:00",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSundayClosed && (
                        <>
                          {showTimeSunday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="start-time">
                                    Start Time
                                  </InputLabel>
                                  <Select
                                    labelId="start-time"
                                    id="start-time"
                                    value={convertTime24to12(el.start)}
                                    label="Start Time"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSunday)
                                      );
                                      copy[idx].start = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeSunday(copy);
                                      setInvokeTimeValidSunday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl
                                  sx={{ width: "120px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="end-time">
                                    End Time
                                  </InputLabel>
                                  <Select
                                    labelId="end-time"
                                    id="end-time"
                                    value={convertTime24to12(el.end)}
                                    label="Age"
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSunday)
                                      );
                                      copy[idx].end = convertTime12to24(
                                        ev.target.value
                                      );
                                      setShowTimeSunday(copy);
                                      setInvokeTimeValidSunday(true);
                                    }}
                                  >
                                    {timeFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {showTimeSunday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSunday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowTimeSunday(copy);
                                      setInvokeTimeValidSunday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showTimeSunday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showTimeSunday)
                                      );
                                      copy.push({
                                        start: "09:00",
                                        end: "18:00",
                                      });
                                      setShowTimeSunday(copy);
                                      setInvokeTimeValidSunday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Max capacity for pre orders  */}
            <Typography variant="bodybold" sx={{ mt: 2 }}>
              Max Capacity (for Preorders)
            </Typography>
            <Typography variant="bodymetatag" sx={{ mt: 1 }}>
              Do you take preorders for this food item?
            </Typography>
            <RadioGroup
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
              value={maxCapacityTurnOn}
              onChange={(e) => {
                setMaxCapacityTurnOn(e.target.value);

                if (e.target.value === "Yes") {
                  setShowSlotMonday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotMondayClosed(false);
                  setShowSlotTuesday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotTuesdayClosed(false);
                  setShowSlotWednesday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotWednesdayClosed(false);
                  setShowSlotThursday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotThursdayClosed(false);
                  setShowSlotFriday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotFridayClosed(false);
                  setShowSlotSaturday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotSaturdayClosed(false);
                  setShowSlotSunday([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                  setCheckedSlotSundayClosed(false);
                  setShowSlotAllSeven([
                    {
                      maxCapacity: "",
                      deliverySlot: "7am - 8am",
                    },
                  ]);
                }
              }}
            >
              <FormControlLabel label="Yes" value="Yes" control={<Radio />} />
              <FormControlLabel label="No" value="No" control={<Radio />} />
            </RadioGroup>

            {/* Available Timings for Instant Order */}
            {maxCapacityTurnOn === "Yes" && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <RadioGroup
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  value={allSevenDaysSlot}
                  onChange={(e) => {
                    setAllSevenDaysSlot(e.target.value);
                    if (e.target.value === "Yes") {
                      setShowSlotMonday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotMondayClosed(false);
                      setShowSlotTuesday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotTuesdayClosed(false);
                      setShowSlotWednesday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotWednesdayClosed(false);
                      setShowSlotThursday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotThursdayClosed(false);
                      setShowSlotFriday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotFridayClosed(false);
                      setShowSlotSaturday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotSaturdayClosed(false);
                      setShowSlotSunday([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                      setCheckedSlotSundayClosed(false);
                    } else if (e.target.value === "No") {
                      setShowSlotAllSeven([
                        {
                          maxCapacity: "",
                          deliverySlot: "7am - 8am",
                        },
                      ]);
                    }
                  }}
                >
                  <FormControlLabel
                    label="All 7 Days"
                    value="Yes"
                    control={<Radio />}
                  />
                  <FormControlLabel
                    label="Customize"
                    value="No"
                    control={<Radio />}
                  />
                </RadioGroup>

                {allSevenDaysSlot === "Yes" && (
                  <>
                    {showSlotAllSeven?.map((el, idx) => (
                      <Box key={idx}>
                        <Box
                          sx={{
                            display: "flex",
                            // width: "60%",
                            // justifyContent: "space-between",
                            alignItems: "center",
                            gap: "16px",
                            mb: 1,
                          }}
                        >
                          <FormControl
                            sx={{ width: "130px" }}
                            variant="standard"
                          >
                            <InputLabel id="deliverySlot">
                              Delivery Slot
                            </InputLabel>
                            <Select
                              labelId="deliverySlot"
                              id="deliverySlot"
                              value={el.deliverySlot}
                              onChange={(ev) => {
                                let copy = JSON.parse(
                                  JSON.stringify(showSlotAllSeven)
                                );
                                copy[idx].deliverySlot = ev.target.value;
                                setShowSlotAllSeven(copy);
                                setInvokeSlotValidation(true);
                              }}
                            >
                              {slotFormat?.map((el, idx) => (
                                <MenuItem key={idx} value={el}>
                                  {el}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            sx={{ width: "110px" }}
                            variant="standard"
                            id="maxCapacity"
                            value={el.maxCapacity}
                            label="Max Capacity"
                            onChange={(ev) => {
                              let copy = JSON.parse(
                                JSON.stringify(showSlotAllSeven)
                              );
                              copy[idx].maxCapacity = ev.target.value.replace(
                                /\D/,
                                ""
                              );
                              setShowSlotAllSeven(copy);
                              setInvokeSlotValidation(true);
                            }}
                            inputProps={{ maxLength: 3 }}
                          />

                          {showSlotAllSeven?.length > 1 && (
                            <IconButton
                              onClick={() => {
                                let copy = JSON.parse(
                                  JSON.stringify(showSlotAllSeven)
                                );
                                copy.splice(idx, 1);
                                setShowSlotAllSeven(copy);
                                setInvokeSlotValidation(true);
                              }}
                            >
                              <RemoveCircleOutlineIcon
                                sx={{ cursor: "pointer" }}
                                fontSize="medium"
                              />
                            </IconButton>
                          )}
                          {idx === showSlotAllSeven?.length - 1 && (
                            <IconButton
                              onClick={() => {
                                let copy = JSON.parse(
                                  JSON.stringify(showSlotAllSeven)
                                );
                                copy.push({
                                  maxCapacity: "",
                                  deliverySlot: "7am - 8am",
                                });
                                setShowSlotAllSeven(copy);
                                setInvokeSlotValidation(true);
                              }}
                            >
                              <AddCircleOutlineIcon
                                sx={{ cursor: "pointer" }}
                                fontSize="medium"
                              />
                            </IconButton>
                          )}
                        </Box>
                        {!!el.helperText && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: "8px",
                              mb: 2,
                            }}
                          >
                            <Box
                              component={"img"}
                              sx={{
                                height: "12px",
                                width: "12px",
                                pt: "3px",
                              }}
                              src="/media/svg/error-exclaim.svg"
                            />
                            <Typography variant="bodymetatag" color="#F44336">
                              {el.helperText}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}
                {/* Customize timings */}
                {allSevenDaysSlot === "No" && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Monday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotMondayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotMondayClosed}
                              onChange={(ev) => {
                                setCheckedSlotMondayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowSlotMonday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotMondayClosed && (
                        <>
                          {showSlotMonday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotMonday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotMonday(copy);
                                      setInvokeSlotValidMonday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotMonday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotMonday(copy);
                                    setInvokeSlotValidMonday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotMonday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotMonday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotMonday(copy);
                                      setInvokeSlotValidMonday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}

                                {idx === showSlotMonday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotMonday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotMonday(copy);
                                      setInvokeSlotValidMonday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Tuesday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotTuesdayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotTuesdayClosed}
                              onChange={(ev) => {
                                setCheckedSlotTuesdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowSlotTuesday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotTuesdayClosed && (
                        <>
                          {showSlotTuesday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotTuesday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotTuesday(copy);
                                      setInvokeSlotValidTuesday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotTuesday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotTuesday(copy);
                                    setInvokeSlotValidTuesday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotTuesday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotTuesday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotTuesday(copy);
                                      setInvokeSlotValidTuesday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotTuesday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotTuesday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotTuesday(copy);
                                      setInvokeSlotValidTuesday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{ width: "100px" }}
                          variant="bodyparagraph"
                        >
                          Wednesday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotWednesdayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotWednesdayClosed}
                              onChange={(ev) => {
                                setCheckedSlotWednesdayClosed(
                                  ev.target.checked
                                );
                                if (ev.target.checked) {
                                  setShowSlotWednesday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotWednesdayClosed && (
                        <>
                          {showSlotWednesday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotWednesday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotWednesday(copy);
                                      setInvokeSlotValidWednesday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotWednesday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotWednesday(copy);
                                    setInvokeSlotValidWednesday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotWednesday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotWednesday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotWednesday(copy);
                                      setInvokeSlotValidWednesday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotWednesday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotWednesday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotWednesday(copy);
                                      setInvokeSlotValidWednesday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{ width: "100px" }}
                          variant="bodyparagraph"
                        >
                          Thursday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotThursdayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotThursdayClosed}
                              onChange={(ev) => {
                                setCheckedSlotThursdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowTimeThursday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotThursdayClosed && (
                        <>
                          {showSlotThursday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotThursday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotThursday(copy);
                                      setInvokeSlotValidThursday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotThursday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotThursday(copy);
                                    setInvokeSlotValidThursday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotThursday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotThursday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotThursday(copy);
                                      setInvokeSlotValidThursday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotThursday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotThursday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotThursday(copy);
                                      setInvokeSlotValidThursday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Friday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotFridayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotFridayClosed}
                              onChange={(ev) => {
                                setCheckedSlotFridayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowSlotFriday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotFridayClosed && (
                        <>
                          {showSlotFriday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotFriday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotFriday(copy);
                                      setInvokeSlotValidFriday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotFriday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotFriday(copy);
                                    setInvokeSlotValidFriday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotFriday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotFriday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotFriday(copy);
                                      setInvokeSlotValidFriday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotFriday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotFriday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotFriday(copy);
                                      setInvokeSlotValidFriday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Saturday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotSaturdayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotSaturdayClosed}
                              onChange={(ev) => {
                                setCheckedSlotSaturdayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowSlotSaturday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotSaturdayClosed && (
                        <>
                          {showSlotSaturday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSaturday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotSaturday(copy);
                                      setInvokeSlotValidSaturday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotSaturday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotSaturday(copy);
                                    setInvokeSlotValidSaturday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotSaturday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSaturday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotSaturday(copy);
                                      setInvokeSlotValidSaturday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotSaturday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSaturday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotSaturday(copy);
                                      setInvokeSlotValidSaturday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        py: 1,
                        borderBottom: "1px dashed black",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // width: "60%",
                          // justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="bodyparagraph"
                          sx={{ width: "100px" }}
                        >
                          Sunday
                        </Typography>
                        <FormControlLabel
                          label={
                            <Typography variant={"bodyparagraph"}>
                              Closed
                            </Typography>
                          }
                          value={checkedSlotSundayClosed}
                          control={
                            <Checkbox
                              checked={checkedSlotSundayClosed}
                              onChange={(ev) => {
                                setCheckedSlotSundayClosed(ev.target.checked);
                                if (ev.target.checked) {
                                  setShowSlotSunday([
                                    {
                                      maxCapacity: "",
                                      deliverySlot: "7am - 8am",
                                    },
                                  ]);
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      {!checkedSlotSundayClosed && (
                        <>
                          {showSlotSunday?.map((el, idx) => (
                            <Box key={idx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  // width: "60%",
                                  // justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  mb: 1,
                                }}
                              >
                                <FormControl
                                  sx={{ width: "130px" }}
                                  variant="standard"
                                >
                                  <InputLabel id="deliverySlot">
                                    Delivery Slot
                                  </InputLabel>
                                  <Select
                                    labelId="deliverySlot"
                                    id="deliverySlot"
                                    value={el.deliverySlot}
                                    onChange={(ev) => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSunday)
                                      );
                                      copy[idx].deliverySlot = ev.target.value;
                                      setShowSlotSunday(copy);
                                      setInvokeSlotValidSunday(true);
                                    }}
                                  >
                                    {slotFormat?.map((el, idx) => (
                                      <MenuItem key={idx} value={el}>
                                        {el}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  sx={{ width: "110px" }}
                                  variant="standard"
                                  id="maxCapacity"
                                  value={el.maxCapacity}
                                  label="Max Capacity"
                                  onChange={(ev) => {
                                    let copy = JSON.parse(
                                      JSON.stringify(showSlotSunday)
                                    );
                                    copy[idx].maxCapacity =
                                      ev.target.value.replace(/\D/, "");
                                    setShowSlotSunday(copy);
                                    setInvokeSlotValidSunday(true);
                                  }}
                                  inputProps={{ maxLength: 3 }}
                                />
                                {showSlotSunday?.length > 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSunday)
                                      );
                                      copy.splice(idx, 1);
                                      setShowSlotSunday(copy);
                                      setInvokeSlotValidSunday(true);
                                    }}
                                  >
                                    <RemoveCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                                {idx === showSlotSunday?.length - 1 && (
                                  <IconButton
                                    onClick={() => {
                                      let copy = JSON.parse(
                                        JSON.stringify(showSlotSunday)
                                      );
                                      copy.push({
                                        maxCapacity: "",
                                        deliverySlot: "7am - 8am",
                                      });
                                      setShowSlotSunday(copy);
                                      setInvokeSlotValidSunday(true);
                                    }}
                                  >
                                    <AddCircleOutlineIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                    />
                                  </IconButton>
                                )}
                              </Box>
                              {!!el.helperText && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: "10px",
                                    mb: 2,
                                  }}
                                >
                                  <Box
                                    component={"img"}
                                    sx={{
                                      height: "12px",
                                      width: "12px",
                                      pt: "3px",
                                    }}
                                    src="/media/svg/error-exclaim.svg"
                                  />
                                  <Typography
                                    variant="bodymetatag"
                                    color="#F44336"
                                  >
                                    {el.helperText}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                  </>
                )}
                {/* Ḥours for preorder */}
                <Typography variant="bodymetatag" sx={{ mt: 1 }}>
                  How many hours before the delivery slot do you accept
                  preorders for this item?
                </Typography>

                <TextField
                  id="hours"
                  label="Hours *"
                  value={hours}
                  variant="standard"
                  onChange={(ev) => {
                    setHours(ev.target.value.replace(/\D/, ""));
                    setHoursError(false);
                    setHoursHelperText("");
                  }}
                  inputProps={{ maxLength: 3 }}
                  error={hoursError}
                  helperText={hoursHelperText}
                  fullWidth
                />
              </Box>
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
                variant="outlined"
                color="primary"
                onClick={() => {
                  navigate("/food-items");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  isFileUploadFetching ||
                  isAddFooditemFetching ||
                  !enableTimeSubmitButton() ||
                  !enableSlotSubmitButton()
                }
                onClick={() => {
                  handleSubmit();
                }}
              >
                Submit
                {isFileUploadFetching || isAddFooditemFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FoodItemAdd;
