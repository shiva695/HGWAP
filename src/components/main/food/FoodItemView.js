import React, { useState, useEffect, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Checkbox,
  Drawer,
  Chip,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Menu,
  Switch,
  Modal,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
} from "@mui/material";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import ClearIcon from "@mui/icons-material/Clear";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import Header from "../../general-components/ui-components/Header";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { convertTime12to24, convertTime24to12 } from "../../../common/common";
import { toast } from "react-toastify";

const FoodItemView = () => {
  const { id: foodItemId } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { outletData } = globalState.outletReducer;
  const { userData } = globalState.userReducer;

  const [foodItemData, setFoodItemData] = useState(null);
  const [isFoodItemFetching, setIsFoodItemFetching] = useState(false);

  const [description, setDescription] = useState("");

  const [cuisine, setCuisine] = useState("");
  const [cuisineHelperText, setCuisineHelperText] = useState("");
  const [cuisineData, setCuisineData] = useState(null);
  const [isGetCuisineFetching, setIsGetCuisineFetching] = useState(false);
  const [cuisineId, setCuisineId] = useState([]);

  const [gstPercent, setGstPercent] = useState(null);
  const [isGetGstFetching, setIsGetGstFetching] = useState(false);

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

  const [isFoodUpdatePriceFetching, setIsFoodUpdatePriceFetching] =
    useState(false);

  const [foodItemStatus, setFoodItemStatus] = useState(true);

  const [isFoodDrawerOpen, setIsFoodDrawerOpen] = useState(false);
  const [isFoodPriceDrawerOpen, setIsFoodPriceDrawerOpen] = useState(false);
  const [isFoodAvailTimeDrawerOpen, setIsFoodAvailTimeDrawerOpen] =
    useState(false);
  const [isPreorderMaxDrawerOpen, setIsPreorderMaxDrawerOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [checked, setChecked] = useState(true);

  // take all image1 - image6 and set in this array;
  const [foodImages, setFoodImages] = useState([]);

  // for preview new images;
  const [newImagePreviewURLs, setNewImagePreviewURLs] = useState([]);

  // for upload new images
  const [newImages, setNewImages] = useState([]);

  const [foodGalleryError, setFoodGalleryError] = useState(false);
  const [foodGalleryHelperText, setFoodGalleryHelperText] = useState("");

  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);
  const [isAddFooditemFetching, setIsAddFooditemFetching] = useState(false);

  const [imageUploadStatus, setImageUploadStatus] = useState(false);

  // response imageURL set tothis array;
  const [newImageURLs, setNewImageURLs] = useState([]);

  // Modal
  const [rearrangeModalOpen, setRearrangeModalOpen] = useState(false);

  // foodImageURLs
  const [foodImageURLs, setFoodImageURLs] = useState([]);
  const [isRearrangeImagesFetching, setIsRearrangeImagesFetching] =
    useState(false);

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Available timings and state
  // state for radio buttons
  const [allSevenDays, setAllSevenDays] = useState("Yes");

  // state for all seven days
  const [showTimeAllSeven, setShowTimeAllSeven] = useState([
    {
      start: "09:00",
      end: "18:00",
    },
  ]);

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

  const [autoTurnOn, setAutoTurnOn] = useState("No");

  // Preorder maxcapacity states

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

  const [invokeTimeValidation, setInvokeTimeValidation] = useState(false);

  const [isUpdateTimingFetching, setIsUpdateTimingFetching] = useState(false);
  const [isUpdateMaxCapacityFetching, setIsUpdateMaxCapacityFetching] =
    useState(false);

  const [resetFoodItemData, setResetFoodItemData] = useState(false);

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

  const [hours, setHours] = useState("24");
  const [hoursError, setHoursError] = useState(false);
  const [hoursHelperText, setHoursHelperText] = useState("");

  let availableImgs = foodImages.filter((el) => el.url !== undefined);

  let maxImgsLength = 6;

  let allowedImgsLen = maxImgsLength - availableImgs.length;

  const sortByDay = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

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

  // disable/enable food item;
  const updateFoodItemStatus = async (id, status) => {
    if (
      window.confirm(
        `Are you sure to ${
          status === "Active" ? "disable" : "enable"
        } the food item?`
      )
    ) {
      let params = {
        id: id,
        status: status === "Active" ? "Disabled" : "Enabled",
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.updateFoodItemStatus,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setFoodItemStatus(true);
        } else {
          alert(
            "Something went wrong while updating food item status. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating food item status. Please try again later!!"
        );
      }
    }
  };

  // delete food handler
  const deleteFoodHandler = async (id) => {
    if (window.confirm("Are you sure to delete the food item?")) {
      let params = {
        id: id,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.deleteFoodItem,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          navigate("/food-items");
        } else {
          alert(
            "Something went wrong while deleting food item. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while deleting food item. Please try again later!!"
        );
      }
    }
  };

  // update current availablilty
  const updateAvailability = async (check, id) => {
    let params = {
      id: id,
      currentAvailability: check ? "On" : "Off",
    };
    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateAvailability,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
      } else {
        alert(
          "Something went wrong while updating current availabilty. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating current availabilty. Please try again later!!"
      );
    }
  };

  // Function to update list on drop
  const handleDrop = (droppedItem) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;

    var updatedList = [...foodImageURLs];
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    // Update State
    setFoodImageURLs(updatedList);
  };

  // New image gallery files upload
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
          setNewImagePreviewURLs((prevImages) =>
            prevImages.slice(0, allowedImgsLen - 1).concat(blobURL)
          );
          setNewImages((prevImages) =>
            prevImages.slice(0, allowedImgsLen - 1).concat(img)
          );
        }
      });
      if (sizeInvalid) {
        alert("Image size must be less than 2MB");
      }
      if (formatInvalid) {
        alert("Please upload a valid image in jpeg/jpg/png/gif format");
      }
      setFoodGalleryError(false);
      setFoodGalleryHelperText("");
    }
  };

  // Delete image (existing)
  const deleteFoodimage = (id) => {
    let delImg = [...foodImages];
    let filteredImg = delImg.filter((el) => el.id !== id);
    setFoodImages(filteredImg);
  };

  // Remove new image when user deletes before submitting
  const deleteImageGallery = (idx) => {
    let newImgs = newImages;
    newImgs.splice(idx, 1);
    setNewImages([...newImgs]);

    let newImgURLs = newImagePreviewURLs;
    newImgURLs.splice(idx, 1);
    setNewImagePreviewURLs([...newImgURLs]);
  };

  // Remove image while rearranging the order
  const removeRearrangeImage = (idx) => {
    let rmvImg = foodImageURLs;
    rmvImg.splice(idx, 1);
    setFoodImageURLs([...rmvImg]);
  };

  // validate food details
  const validateFoodDetails = () => {
    let validationErrors = false;

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
        "Minimum order quantity to be greater than one or not be empty"
      );
      validationErrors = true;
    }

    if (isVegOrNonveg === "Non-Veg" && nonVegType === "") {
      setNonVegTypeHelperText("Please select Non-Veg type");
      validationErrors = true;
    }
    if (availableImgs.length === 0 && newImagePreviewURLs.length === 0) {
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

  // handle submit of update food item
  const handleSubmit = async () => {
    const foodValid = validateFoodDetails();
    if (newImages.length > 0) {
      if (foodValid) {
        setIsFileUploadFetching(true);
        for (let i = 0; i < newImages.length; i++) {
          let formDataGallery = new FormData();
          formDataGallery.append("file", newImages[i]);
          formDataGallery.append("path", "food_images");

          let responseGall = await invokeFormDataApi(
            config.apiDomains.commonService + apiList.uploadFile,
            formDataGallery,
            cookies
          );
          if (responseGall.status >= 200 && responseGall.status < 300) {
            if (responseGall.data.responseCode === "200") {
              let galleryImgs = newImageURLs;
              galleryImgs.push(responseGall.data.imageUrl);
              setNewImageURLs(galleryImgs);
            } else {
              alert(
                "Something went wrong while uploading food item images. Please try again later!"
              );

              setIsFileUploadFetching(false);
              return;
            }
          } else if (responseGall.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while uploading food item images. Please try again later!!"
            );
            setIsFileUploadFetching(false);
            return;
          }
        }

        setImageUploadStatus(true);
        setIsFileUploadFetching(false);
      }
    } else {
      if (foodValid) {
        setImageUploadStatus(true);
      }
    }
  };

  // validate food prices
  const validateFoodPrice = () => {
    let validationErrors = false;

    if (mrp === "") {
      setMrpError(true);
      setMrpHelperText("MRP should not be empty");
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

    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // update price details;
  const updateFoodPriceHandler = async () => {
    const validPrice = validateFoodPrice();
    if (validPrice) {
      setIsFoodUpdatePriceFetching(true);
      let params = {
        id: foodItemData.id,
        mrp: parseInt(mrp),
        discount: discount !== "" ? parseInt(discount) : 0,
        sellingPrice: sellPriceExclusiveGst,
        rebate: rebate !== "" ? parseInt(rebate) : 0,
        packingCharges: packingCharges !== "" ? parseInt(packingCharges) : 0,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.updateFoodItemPrice,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsFoodPriceDrawerOpen(false);
          setFoodItemStatus(true);
          setIsFoodUpdatePriceFetching(false);
        } else {
          alert(
            "Something went wrong while updating price details. Please try again later!"
          );
          setIsFoodUpdatePriceFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating price details. Please try again later!!"
        );
        setIsFoodUpdatePriceFetching(false);
      }
    }
  };

  // Rearrange image
  const rearrangeImages = async () => {
    setIsRearrangeImagesFetching(true);
    let params = {
      id: foodItemData?.id,
    };
    for (let i = 0; i < foodImageURLs.length; i++) {
      params[`image${i + 1}`] = foodImageURLs[i];
    }
    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateImagesOrder,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setFoodItemStatus(true);
        setIsRearrangeImagesFetching(false);
        setRearrangeModalOpen(false);
      } else {
        alert(
          "Something went wrong while updating images order. Please try again later!"
        );
        setIsRearrangeImagesFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating images order. Please try again later!!"
      );
      setIsRearrangeImagesFetching(false);
    }
  };

  // Api Call for update food item timings;
  const updateFoodItemTiming = async () => {
    setIsUpdateTimingFetching(true);
    let customizeTimings;
    let availTimingsForSeven = [];

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
    let params = {
      id: atob(foodItemId),
      availableTimings:
        autoTurnOn === "No"
          ? []
          : allSevenDays === "Yes"
          ? availTimingsForSeven
          : customizeTimings,
    };

    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateFoodItemTiming,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Food item timings updated successfully.");
        setIsUpdateTimingFetching(false);
        setIsFoodAvailTimeDrawerOpen(false);
        setFoodItemStatus(true);
      } else {
        alert(
          "Something went wrong while updating availabilty timings. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating availabilty timings. Please try again later!!"
      );
      setIsUpdateTimingFetching(false);
    }
  };

  const validateFoodItemMaxCapacityHours = () => {
    if (maxCapacityTurnOn === "Yes") {
      if (hours === "" || +hours === 0 || +hours > 72) {
        setHoursError(true);
        setHoursHelperText(
          "Hours should be greater than zero and lesser than 73"
        );
      } else {
        setHoursError(false);
        setHoursHelperText("");
        updateFoodItemMaxCapacity();
      }
    } else {
      updateFoodItemMaxCapacity();
    }
  };

  // Api Call for update food item timings;
  const updateFoodItemMaxCapacity = async () => {
    setIsUpdateMaxCapacityFetching(true);
    let customizeSlots;
    let availSlotsForSeven = [];

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
      id: atob(foodItemId),
      hoursToPreorder: maxCapacityTurnOn === "Yes" ? hours : null,
      preorderCapacity:
        maxCapacityTurnOn === "No"
          ? []
          : allSevenDaysSlot === "Yes"
          ? availSlotsForSeven
          : customizeSlots,
    };

    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateFoodItemMaxCapacity,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Food item Max capacity updated successfully.");
        setIsUpdateMaxCapacityFetching(false);
        setIsPreorderMaxDrawerOpen(false);
        setFoodItemStatus(true);
      } else {
        alert(
          "Something went wrong while updating preorder max capacity. Please try again later!"
        );
        setIsUpdateMaxCapacityFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating preorder max capacity. Please try again later!!"
      );
      setIsUpdateMaxCapacityFetching(false);
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
    document.title = config.documentTitle + " | Food Item";
  }, []);

  // Get food item
  useEffect(() => {
    try {
      let fdId = parseInt(atob(foodItemId));
      if (fdId) {
        const getFoodList = async () => {
          setIsFoodItemFetching(true);
          let params = { id: fdId };
          let response = await invokeApi(
            config.apiDomains.foodService + apiList.getFoodItem,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              setFoodItemData(response.data.foodItem);
              setResetFoodItemData(true);
              // setFoodItemStatus(false);
              setIsFoodItemFetching(false);
            } else {
              alert(
                "Something went wrong while fetching food item. Please try again later!"
              );
              setIsFoodItemFetching(false);
            }
          } else if (response.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while fetching food item. Please try again later!!"
            );
            setIsFoodItemFetching(false);
          }
        };
        if (foodItemStatus) {
          setFoodItemStatus(false);
          getFoodList();
        }
      } else {
        navigate("/food-items");
      }
    } catch (error) {
      navigate("/food-items");
    }
  }, [cookies, navigate, foodItemId, foodItemStatus]);

  // setting food item state for update;
  useEffect(() => {
    const settingFoodItemData = () => {
      if (foodItemData) {
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
        setFoodImages([
          { id: 1, url: foodItemData.image1 },
          { id: 2, url: foodItemData.image2 },
          { id: 3, url: foodItemData.image3 },
          { id: 4, url: foodItemData.image4 },
          { id: 5, url: foodItemData.image5 },
          { id: 6, url: foodItemData.image6 },
        ]);
        setChecked(foodItemData.currentAvailability === "On" ? true : false);
      }
    };
    if (resetFoodItemData) {
      setResetFoodItemData(false);
      settingFoodItemData();
    }
  }, [foodItemData, resetFoodItemData]);

  // rearrange image state setup
  useEffect(() => {
    setFoodImageURLs(
      foodImages.filter((el) => el.url !== undefined).map((el) => el.url)
    );
  }, [foodImages]);

  // Get Config gst percenaget
  useEffect(() => {
    setIsGetGstFetching(true);
    const getConfig = async () => {
      let params = { configKey: "GST_Percentage" };
      let response = await invokeApi(
        config.apiDomains.commonService + apiList.getConfig,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setGstPercent(response.data.config.configValue);
          setIsGetGstFetching(false);
        } else {
          alert(
            "Something went wrong while fetching GST config. Please try again later!"
          );
          setIsGetGstFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching GST config. Please try again later!!"
        );
        setIsGetGstFetching(false);
      }
    };
    getConfig();
  }, [cookies, navigate]);

  // Calculating mrp, and discount prices
  useEffect(() => {
    setSellPriceExclusiveGst(
      parseInt(mrp ? mrp : 0) - parseInt(discount ? discount : 0)
    );
  }, [discount, mrp]);

  // Get cuisines
  useEffect(() => {
    setIsGetCuisineFetching(true);
    const getCuisines = async () => {
      let params = { status: "Active" };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getCuisines,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCuisineData(response.data.cuisines);
          setIsGetCuisineFetching(false);
        } else {
          alert(
            "Something went wrong while fetching cuisines. Please try again later!"
          );
          setIsGetCuisineFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching cuisines. Please try again later!!"
        );
        setIsGetCuisineFetching(false);
      }
    };
    getCuisines();
  }, [cookies, navigate]);

  // Setting up cusuine id;
  useEffect(() => {
    setCuisineId(cuisineData?.filter((el) => el.cuisineName === cuisine));
  }, [cuisine, cuisineData]);

  // Api Call for update food item
  useEffect(() => {
    const invokeUpdateFoodItemApi = async () => {
      setIsAddFooditemFetching(true);
      let imgUrl = availableImgs.map((el) => el.url);
      let galleryImages = newImageURLs;
      galleryImages.unshift(...imgUrl);
      setNewImageURLs(galleryImages);

      let params = {
        id: foodItemData.id,
        description,
        cuisineId: cuisineId[0].id,
        category: category,
        vegNonVeg: isVegOrNonveg,
        nonVegType,
        spiceLevel,
        weight: weight !== "" ? parseInt(weight) : 0,
        minOrderQuantity: parseInt(minOrderQuantity),
      };
      for (let i = 0; i < galleryImages.length; i++) {
        params[`image${i + 1}`] = galleryImages[i];
      }
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.updateFoodItem,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setNewImageURLs([]);
          setNewImagePreviewURLs([]);
          setFoodImages([]);
          setNewImages([]);
          setIsAddFooditemFetching(false);
          setIsFoodDrawerOpen(false);
          setFoodItemStatus(true);
        } else {
          alert(
            "Something went wrong while edit food items. Please try again later!"
          );
          setIsAddFooditemFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong  while edit Food items. Please try again later!!"
        );
        setIsAddFooditemFetching(false);
      }
    };

    if (imageUploadStatus) {
      setImageUploadStatus(false);
      invokeUpdateFoodItemApi();
    }
  }, [
    cuisineId,
    availableImgs,
    minOrderQuantity,
    weight,
    foodImages,
    foodItemData,
    description,
    newImageURLs,
    isVegOrNonveg,
    nonVegType,
    spiceLevel,
    category,
    imageUploadStatus,
    cookies,
    navigate,
  ]);

  // validate timings for all seven days
  useEffect(() => {
    const validateTimings = () => {
      let timingsData = JSON.parse(JSON.stringify(showTimeAllSeven));
      let validCheck = true;
      for (let i = 0; i < timingsData?.length; i++) {
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
      for (let i = 0; i < timingsData?.length; i++) {
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
      for (let i = 0; i < timingsData?.length; i++) {
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
      if (validCheck && timingsData?.length > 1) {
        for (let i = 0; i < timingsData?.length; i++) {
          for (let j = 0; j < timingsData?.length; j++) {
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
      for (let i = 0; i < timingsData?.length; i++) {
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
          for (let j = 0; j < timingsData?.length; j++) {
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
            if (i === j) {
              continue;
            }
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
      {isFoodItemFetching || isGetCuisineFetching || isGetGstFetching ? (
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
                {foodItemData?.itemName}
                {!!foodItemData?.cloudKitchenName &&
                  !!foodItemData?.outletName &&
                  " (" +
                    foodItemData.cloudKitchenName +
                    " - " +
                    foodItemData.outletName +
                    ")"}
              </Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ mt: 3, textAlign: "center" }}>
              {foodItemData?.itemName}
              <IconButton
                sx={{ float: "right" }}
                onClick={(ev) => setIsMenuOpen(ev.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={isMenuOpen}
                open={Boolean(isMenuOpen)}
                onClose={() => setIsMenuOpen(false)}
                onClick={() => setIsMenuOpen(false)}
              >
                <MenuItem
                  onClick={() => {
                    foodItemData?.status === "Active"
                      ? setIsDialogOpen(true)
                      : setIsFoodDrawerOpen(true);
                  }}
                >
                  Edit
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setIsFoodPriceDrawerOpen(true);
                  }}
                >
                  Edit Price
                </MenuItem>
                <MenuItem onClick={() => setIsFoodAvailTimeDrawerOpen(true)}>
                  Edit Timings
                </MenuItem>
                <MenuItem onClick={() => setIsPreorderMaxDrawerOpen(true)}>
                  Edit Max Capacity
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    navigate("/add-food-item", { state: { foodItemData } })
                  }
                >
                  Clone Food Item
                </MenuItem>
                {(foodItemData?.status === "Active" ||
                  foodItemData?.status === "Disabled") && (
                  <MenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      updateFoodItemStatus(
                        foodItemData?.id,
                        foodItemData?.status
                      );
                    }}
                  >
                    {foodItemData?.status === "Active" ? "Disable" : "Enable"}
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteFoodHandler(foodItemData?.id);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </Typography>

            {/* Dialog for active food details update */}
            <Dialog open={isDialogOpen}>
              <DialogTitle>
                Are you sure you want to update Food Item details?
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Updating an active Food item will lead its status changed to
                  Pending. Customers will not be able to see it until the
                  changes are approved.
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
                    setIsFoodDrawerOpen(true);
                  }}
                >
                  Proceed
                </Button>
              </DialogActions>
            </Dialog>

            <Box sx={{ textAlign: "left", m: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={foodItemData?.status}
                  size="small"
                  sx={{
                    background:
                      foodItemData?.status === "Active"
                        ? "#76BA99"
                        : foodItemData?.status === "Pending"
                        ? "orange"
                        : "#F87474",
                  }}
                />
                {foodItemData?.status === "Active" && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={checked}
                        onChange={(ev) => {
                          setChecked(ev.target.checked);
                          updateAvailability(
                            ev.target.checked,
                            foodItemData?.id
                          );
                        }}
                      />
                    }
                    label={checked ? "Turn OFF" : "Turn ON"}
                  />
                )}
              </Box>

              <Typography sx={{ mt: 2 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Description:{" "}
                </Box>
                {foodItemData?.description}
              </Typography>

              {/* Images */}
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                Images
              </Typography>
              <Grid container sx={{ mt: 2 }}>
                {foodItemData?.image1 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image1}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
                {foodItemData?.image2 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image2}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
                {foodItemData?.image3 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image3}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
              </Grid>
              <Grid container>
                {foodItemData?.image4 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image4}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
                {foodItemData?.image5 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image5}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
                {foodItemData?.image6 && (
                  <Grid item xs={4}>
                    <img
                      height={80}
                      width={80}
                      src={foodItemData?.image6}
                      alt="food_img"
                      style={{ objectFit: "contain" }}
                    />
                  </Grid>
                )}
              </Grid>
              {foodImageURLs.length > 1 && (
                <Link
                  onClick={() => setRearrangeModalOpen(true)}
                  variant="contained"
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 2,
                    cursor: "pointer",
                  }}
                >
                  <Typography variant="caption">Rearrange Images</Typography>
                </Link>
              )}

              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Cuisine:{" "}
                </Box>
                {foodItemData?.cuisineName}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Category:{" "}
                </Box>
                {foodItemData?.category}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Veg / Non-Veg:{" "}
                </Box>
                {foodItemData?.vegNonVeg}
              </Typography>
              {foodItemData?.vegNonVeg === "Non-Veg" && (
                <Typography sx={{ mt: 1 }}>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    Non-Veg Type:{" "}
                  </Box>
                  {foodItemData?.nonVegType}
                </Typography>
              )}
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Spice Level:{" "}
                </Box>
                {foodItemData?.spiceLevel}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Weight in (grams):{" "}
                </Box>
                {foodItemData?.weight}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Minimum order Quantity:{" "}
                </Box>
                {foodItemData?.minOrderQuantity}
              </Typography>
              <Typography variant="h6" sx={{ textAlign: "center", mt: 3 }}>
                Price Details
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  MRP exclusive GST:{" "}
                </Box>
                {foodItemData?.mrp}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  MRP inclusive GST ({gstPercent}%):{" "}
                </Box>
                {mrp ? (mrp * (100 + parseInt(gstPercent))) / 100 : ""}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Discount in Rupees:{" "}
                </Box>
                {foodItemData?.discount}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Rebate on delivery charges (per unit):{" "}
                </Box>
                {foodItemData?.rebate}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>
                  Selling price exclusive GST:{" "}
                </Box>
                {foodItemData?.sellingPrice}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body1">
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    Selling price inclusive GST ({gstPercent}%):{" "}
                  </Box>
                  {foodItemData?.sellingPrice
                    ? (foodItemData.sellingPrice *
                        (100 + parseInt(gstPercent))) /
                      100
                    : ""}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    Packing Charges:{" "}
                  </Box>
                  {foodItemData?.packingCharges}
                </Typography>
              </Box>

              {/* Available Timings  */}
              {foodItemData?.availableTimings.length > 0 ? (
                <Box sx={{ mt: 2, border: "1px solid" }}>
                  <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
                    Available Timings (for Instant Orders)
                  </Typography>
                  <Box
                    sx={{
                      flexGrow: 1,
                      width: "100%",
                      textAlign: "center",
                      mt: 2,
                      pb: 1,
                      border: "1px dashed #F9881F",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">Day Name</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">Start Time</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">End Time</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  {foodItemData?.availableTimings
                    .sort((a, b) => sortByDay[a.dayName] - sortByDay[b.dayName])
                    .map((el, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          flexGrow: 1,
                          mt: 1,
                          borderBottom: "1px dashed #F9881F",
                        }}
                      >
                        <Grid
                          container
                          spacing={2}
                          sx={{
                            dispaly: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            <Typography variant="bodyparagraph">
                              {el.dayName}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            {el.timings.map((start, indx1) => (
                              <Box key={indx1}>
                                <Typography variant="bodyparagraph">
                                  {convertTime24to12(start.startTime)}
                                </Typography>
                              </Box>
                            ))}
                          </Grid>
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            {el.timings.map((end, indx2) => (
                              <Box key={indx2}>
                                <Typography variant="bodyparagraph">
                                  {convertTime24to12(end.endTime)}
                                </Typography>
                              </Box>
                            ))}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="bodyparagraph">
                    Auto Turn On and Turn Off for Instant Orders?: No
                  </Typography>
                </Box>
              )}

              {/* Max Capacity (for Preorders)  */}
              {foodItemData?.preorderCapacity.length > 0 ? (
                <Box sx={{ mt: 3, border: "1px solid" }}>
                  <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
                    Max Capacity (for Preorders)
                  </Typography>
                  <Box
                    sx={{
                      flexGrow: 1,
                      width: "100%",
                      textAlign: "center",
                      mt: 2,
                      pb: 1,
                      borderBottom: "1px dashed #F9881F",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">Day Name</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">
                          Delivery Slot
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="bodybold">Max Capacity</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  {foodItemData?.preorderCapacity
                    .sort((a, b) => sortByDay[a.dayName] - sortByDay[b.dayName])
                    .map((el, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          flexGrow: 1,
                          mt: 1,
                          borderBottom: "1px dashed #F9881F",
                        }}
                      >
                        <Grid
                          container
                          spacing={2}
                          sx={{
                            dispaly: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            <Typography variant="bodyparagraph">
                              {el.dayName}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            {el.deliverySlots.map((el, indx1) => (
                              <Box key={indx1}>
                                <Typography variant="bodyparagraph">
                                  {el.deliverySlot}
                                </Typography>
                              </Box>
                            ))}
                          </Grid>
                          <Grid item xs={4} sx={{ textAlign: "center" }}>
                            {el.deliverySlots.map((ele, indx2) => (
                              <Box key={indx2}>
                                <Typography variant="bodyparagraph">
                                  {ele.maxCapacity}
                                </Typography>
                              </Box>
                            ))}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  <Box sx={{ m: 1 }}>
                    <Typography variant="bodyparagraph">
                      How many hours before the delivery slot do you accept
                      preorders for this item?: {hours}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="bodyparagraph">
                    Do you take preorders for this food item?: No
                  </Typography>
                </Box>
              )}
              <Button
                variant="outlined"
                size="small"
                sx={{ float: "right", mt: 2 }}
                onClick={() => navigate(`/food-items`)}
              >
                Back
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Drawer for setting available timings */}
      <Drawer
        anchor="right"
        open={isFoodAvailTimeDrawerOpen}
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
            <Typography variant="header4">Update Available Timings</Typography>
            {/* Cancel icon */}
            <Box
              onClick={() => {
                setIsFoodAvailTimeDrawerOpen(false);
                setResetFoodItemData(true);
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
        {/* Drawer body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            // alignItems: "center",
            gap: "25px",
            px: "25px",
            pb: "25px",
            width: "calc(100% - 50px)",
          }}
        >
          <Typography variant="bodybold">
            Available Timings (for Instant Orders)
          </Typography>
          <Typography variant="bodymetatag">
            Fill this if you want the system to Auto Turn ON and Turn OFF. No
            need to fill, if you want to handle this manually.
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
                setAllSevenDays("Yes");
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
              } else if (e.target.value === "No") {
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
                  // if (e.target.value === "Yes") {
                  // setShowTimeMonday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedMondayClosed(false);
                  // setShowTimeTuesday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedTuesdayClosed(false);
                  // setShowTimeWednesday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedWednesdayClosed(false);
                  // setShowTimeThursday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedThursdayClosed(false);
                  // setShowTimeFriday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedFridayClosed(false);
                  // setShowTimeSaturday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedSaturdayClosed(false);
                  // setShowTimeSunday([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // setCheckedSundayClosed(false);
                  // } else if (e.target.value === "No") {
                  // setShowTimeAllSeven([
                  //   {
                  //     start: "09:00",
                  //     end: "18:00",
                  //   },
                  // ]);
                  // }
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
                        <FormControl sx={{ width: "120px" }} variant="standard">
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

                        <FormControl sx={{ width: "120px" }} variant="standard">
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
                      <Typography variant="bodyparagraph">Monday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                      <Typography variant="bodyparagraph">Tuesday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                      <Typography variant="bodyparagraph">Wednesday</Typography>
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
                      <Typography variant="bodyparagraph">Thursday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                      <Typography variant="bodyparagraph">Friday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                      <Typography variant="bodyparagraph">Saturday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                      <Typography variant="bodyparagraph">Sunday</Typography>
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
                                <InputLabel id="end-time">End Time</InputLabel>
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
                setIsFoodAvailTimeDrawerOpen(false);
                setResetFoodItemData(true);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isUpdateTimingFetching || !enableTimeSubmitButton()}
              onClick={() => {
                updateFoodItemTiming();
              }}
            >
              Submit
              {isUpdateTimingFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </CardActions>
        </Box>
      </Drawer>

      {/* Drawer for setting preorder maxcapacity */}
      <Drawer
        anchor="right"
        open={isPreorderMaxDrawerOpen}
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
            <Typography variant="header4">
              Update Preorder Max Capacity
            </Typography>
            {/* Cancel icon */}
            <Box
              onClick={() => {
                setIsPreorderMaxDrawerOpen(false);
                setResetFoodItemData(true);
                setHoursError(false);
                setHoursHelperText("");
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
        {/* Drawer body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            // alignItems: "center",
            // gap: "25px",
            px: "25px",
            pb: "25px",
            width: "calc(100% - 50px)",
          }}
        >
          {/* Max capacity for pre orders  */}
          <Typography variant="bodybold" sx={{ mt: 2 }}>
            Max Capacity (for Preorders)
          </Typography>
          <Typography variant="bodyparagraph" sx={{ mt: 1 }}>
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

              if (e.target.value === "No") {
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
                  // if (e.target.value === "Yes") {
                  //   setShowSlotMonday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotMondayClosed(false);
                  //   setShowSlotTuesday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotTuesdayClosed(false);
                  //   setShowSlotWednesday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotWednesdayClosed(false);
                  //   setShowSlotThursday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotThursdayClosed(false);
                  //   setShowSlotFriday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotFridayClosed(false);
                  //   setShowSlotSaturday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotSaturdayClosed(false);
                  //   setShowSlotSunday([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  //   setCheckedSlotSundayClosed(false);
                  // } else if (e.target.value === "No") {
                  //   setShowSlotAllSeven([
                  //     {
                  //       maxCapacity: "",
                  //       deliverySlot: "7am - 8am",
                  //     },
                  //   ]);
                  // }
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
                        <FormControl sx={{ width: "130px" }} variant="standard">
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
                              setCheckedSlotWednesdayClosed(ev.target.checked);
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
              <Typography variant="bodyparagraph">
                How many hours before the delivery slot do you accept preorders
                for this item?
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
                sx={{ mt: 1 }}
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
                setResetFoodItemData(true);
                setHoursError(false);
                setHoursHelperText("");
                setIsPreorderMaxDrawerOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isUpdateMaxCapacityFetching || !enableSlotSubmitButton()
              }
              onClick={() => {
                validateFoodItemMaxCapacityHours();
              }}
            >
              Submit
              {isUpdateMaxCapacityFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </CardActions>
        </Box>
      </Drawer>

      {/* Update food details */}
      <Drawer anchor="right" open={isFoodDrawerOpen}>
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
              Update Food Item
            </Typography>
            <Typography
              variant="bodyparagraph"
              sx={{ mb: 2, textAlign: "center" }}
            >
              {`(${foodItemData?.itemName})`}
            </Typography>
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

            <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
              Images
            </Typography>
            {availableImgs.length + newImagePreviewURLs.length < 6 && (
              <Typography variant="h6" sx={{ mb: 1, textAlign: "left" }}>
                Add upto 6 images
              </Typography>
            )}
            {foodGalleryError && (
              <Typography
                variant="body1"
                color={"error"}
                sx={{ mb: 1, textAlign: "left" }}
              >
                {foodGalleryHelperText}
              </Typography>
            )}

            <Box>
              <label htmlFor="food-gallery">
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="food-gallery"
                  multiple
                  type="file"
                  onClick={(ev) => (ev.target.value = "")}
                  onChange={handleImageGalleryUpload}
                />
                {availableImgs.length + newImagePreviewURLs.length < 6 && (
                  <Button color="primary" variant="contained" component="span">
                    <AddAPhotoIcon sx={{ mr: 2 }} />
                    Upload Images
                  </Button>
                )}
              </label>
            </Box>

            <ImageList cols={3}>
              {availableImgs.map((items, idx) => (
                <ImageListItem key={idx}>
                  <img src={items.url} loading="lazy" alt="food_img" />
                  <ImageListItemBar
                    sx={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                        "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 80%)",
                    }}
                    position="top"
                    actionPosition="right"
                    actionIcon={
                      <IconButton onClick={() => deleteFoodimage(items.id)}>
                        <ClearIcon sx={{ color: "white" }}></ClearIcon>
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>

            {newImagePreviewURLs.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                New Images
              </Typography>
            )}
            <ImageList cols={3}>
              {newImagePreviewURLs.map((items, idx) => (
                <ImageListItem key={idx}>
                  <img
                    src={items}
                    loading="lazy"
                    alt="gallery-img"
                    style={{
                      objectFit: "contain",
                      backgroundColor: "#eee",
                    }}
                  />
                  <ImageListItemBar
                    sx={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                        "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 80%)",
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
                {cuisineData?.map((el) => (
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
              variant="standard"
              value={category}
              onChange={(ev) => {
                setCategory(ev.target.value);
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
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" sx={{ mb: 1 }}>
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
          </CardContent>
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
                setDescription(foodItemData.description);
                setCuisine(foodItemData.cuisineName);
                setCategory(foodItemData.category);
                setIsVegOrNonveg(foodItemData.vegNonVeg);
                setNonVegType(foodItemData.nonVegType);
                setSpiceLevel(foodItemData.spiceLevel);
                setFoodImages([
                  { id: 1, url: foodItemData.image1 },
                  { id: 2, url: foodItemData.image2 },
                  { id: 3, url: foodItemData.image3 },
                  { id: 4, url: foodItemData.image4 },
                  { id: 5, url: foodItemData.image5 },
                  { id: 6, url: foodItemData.image6 },
                ]);
                setNewImagePreviewURLs([]);
                setIsFoodDrawerOpen(false);
                setFoodGalleryError(false);
                setNonVegTypeHelperText("");
                setFoodGalleryHelperText("");
                setCategoryError(false);
                setCategoryHelperText("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isFileUploadFetching || isAddFooditemFetching}
              onClick={handleSubmit}
            >
              Submit
              {isFileUploadFetching || isAddFooditemFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </CardActions>
        </Card>
      </Drawer>

      {/* Update food price details */}
      <Drawer anchor="right" open={isFoodPriceDrawerOpen}>
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
              Update Price Details
            </Typography>

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

            <Typography
              variant="body1"
              sx={{ mb: 1, backgroundColor: "#EEEEEE", p: 2 }}
            >
              MRP inclusive GST ({gstPercent}%):{" "}
              {mrp ? (mrp * (100 + parseInt(gstPercent))) / 100 : ""}
            </Typography>

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

            <Box sx={{ backgroundColor: "#EEEEEE", p: 2 }}>
              <Typography variant="body1">
                Selling price exclusive GST: {sellPriceExclusiveGst}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Selling price inclusive GST ({gstPercent}%):{" "}
                {sellPriceExclusiveGst
                  ? (sellPriceExclusiveGst * (100 + parseInt(gstPercent))) / 100
                  : ""}
              </Typography>
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
            </Box>

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
                  setIsFoodPriceDrawerOpen(false);
                  setMrp(foodItemData?.mrp);
                  setMrpError(false);
                  setMrpHelperText("");
                  setDiscount(foodItemData?.discount);
                  setDiscountError(false);
                  setDiscountHelperText("");
                  setRebate(foodItemData?.rebate);
                  setRebateError(false);
                  setRebateHelperText("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isFoodUpdatePriceFetching}
                onClick={updateFoodPriceHandler}
              >
                Submit
                {isFoodUpdatePriceFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </Drawer>

      {/* Modal to rearrange images */}
      <Modal open={rearrangeModalOpen} sx={{ overflow: "scroll" }}>
        <Box
          sx={{
            margin: "auto",
            width: 400,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              width: { xs: 300, sm: 400 },
              margin: "auto",
              overflow: "auto",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Drag to rearrange the images</Typography>
              <DragDropContext onDragEnd={handleDrop}>
                <Droppable droppableId="list-container">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <ImageList cols={1} sx={{ overflow: "hidden" }}>
                        {foodImageURLs.map((item, index) => (
                          <Draggable
                            key={item}
                            draggableId={item}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                              >
                                <ImageListItem
                                  sx={{
                                    height: 200,
                                    width: 200,
                                  }}
                                >
                                  <img
                                    src={item}
                                    loading="lazy"
                                    alt="gallery-img"
                                    sx={{ objectFit: "contain" }}
                                  />
                                  {foodImageURLs.length !== 1 && (
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
                                          onClick={() =>
                                            removeRearrangeImage(index)
                                          }
                                        >
                                          <ClearIcon
                                            sx={{ color: "white" }}
                                          ></ClearIcon>
                                        </IconButton>
                                      }
                                    />
                                  )}
                                </ImageListItem>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </ImageList>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Button
                  onClick={() => {
                    setRearrangeModalOpen(false);
                    setFoodImageURLs(
                      foodImages
                        .filter((el) => el.url !== undefined)
                        .map((el) => el.url)
                    );
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={rearrangeImages}
                  variant="contained"
                  size="small"
                  disabled={isRearrangeImagesFetching}
                  sx={{ mt: 1, ml: 1 }}
                >
                  Update
                  {isRearrangeImagesFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default FoodItemView;
