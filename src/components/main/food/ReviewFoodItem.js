import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Link,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Breadcrumbs,
} from "@mui/material";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { config } from "../../../config/config";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import ClearIcon from "@mui/icons-material/Clear";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import moment from "moment";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Header from "../../general-components/ui-components/Header";

const ReviewFoodItem = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);
  const { id: foodItemId } = useParams();

  const [openDialog, setOpenDialog] = useState(false);
  const [approve, setApprove] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("");

  // response for getFoodItem set in this state
  const [foodItem, setFoodItem] = useState(null);
  const [snapShot, setSnapShot] = useState(null);

  const [isFoodDataFetching, setIsFoodDataFetching] = useState(true);
  const [isFoodReviewFetching, setIsFoodReviewFetching] = useState(false);
  const [foodFetchStatus, setFoodFetchStatus] = useState(true);
  const [approveRemarksError, setApproveRemarksError] = useState(false);
  const [approveRemarksHelperText, setApproveRemarksHelperText] = useState("");

  const [gstPercent, setGstPercent] = useState(null);
  const [isGetGstFetching, setIsGetGstFetching] = useState(false);

  // take all image1 - image6 and set in this array;
  const [foodImages, setFoodImages] = useState([]);

  // for preview new images;
  const [newImagePreviewURLs, setNewImagePreviewURLs] = useState([]);

  // for upload new images
  const [newImages, setNewImages] = useState([]);

  // foodImageURLs
  const [foodImageURLs, setFoodImageURLs] = useState([]);
  const [isRearrangeImagesFetching, setIsRearrangeImagesFetching] =
    useState(false);

  // response imageURL set tothis array;
  const [newImageURLs, setNewImageURLs] = useState([]);

  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);

  // Modal
  const [rearrangeModalOpen, setRearrangeModalOpen] = useState(false);

  let availableImgs = foodImages.filter((el) => el.url !== undefined);

  let maxImgsLength = 6;

  let allowedImgsLen = maxImgsLength - availableImgs.length;

  // Create table for compare data;
  const createData = (field, previousData, updatedData) => {
    return { field, previousData, updatedData };
  };
  const rows = [
    createData("Description", snapShot?.description, foodItem?.description),
    createData("Image-1", snapShot?.image1, foodItem?.image1),
    createData("Image-2", snapShot?.image2, foodItem?.image2),
    createData("Image-3", snapShot?.image3, foodItem?.image3),
    createData("Image-4", snapShot?.image4, foodItem?.image4),
    createData("Image-5", snapShot?.image5, foodItem?.image5),
    createData("Image-6", snapShot?.image6, foodItem?.image6),

    createData("Cuisine Type", snapShot?.cuisineName, foodItem?.cuisineName),
    createData("Category", snapShot?.category, foodItem?.category),
    createData("Veg / Non-Veg", snapShot?.vegNonVeg, foodItem?.vegNonVeg),
    createData("Non-Veg Type", snapShot?.nonVegType, foodItem?.nonVegType),
    createData("Spice Level", snapShot?.spiceLevel, foodItem?.spiceLevel),
    createData("Weight", snapShot?.weight, foodItem?.weight),

    createData("MRP exclusive GST", foodItem?.mrp, foodItem?.mrp),
    createData(
      `MRP inclusive GST (${gstPercent}%)`,
      foodItem?.mrp ? (foodItem.mrp * (100 + parseInt(gstPercent))) / 100 : "",
      foodItem?.mrp ? (foodItem.mrp * (100 + parseInt(gstPercent))) / 100 : ""
    ),
    createData("Discount in Rupees", foodItem?.discount, foodItem?.discount),
    createData(
      "Selling price exclusive GST",
      foodItem?.sellingPrice,
      foodItem?.sellingPrice
    ),
    createData(
      `Selling price inclusive GST (${gstPercent}%)`,
      foodItem?.sellingPrice
        ? (foodItem.sellingPrice * (100 + parseInt(gstPercent))) / 100
        : "",
      foodItem?.sellingPrice
        ? (foodItem.sellingPrice * (100 + parseInt(gstPercent))) / 100
        : ""
    ),
    createData(
      "Rebate on delivery charges (per unit)",
      foodItem?.rebate,
      foodItem?.rebate
    ),
  ];

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
    }
  };

  // Rearrange image
  const rearrangeImages = async () => {
    setIsRearrangeImagesFetching(true);
    let newImg = newImageURLs;
    foodImageURLs.push(...newImg);
    setFoodImageURLs(newImg);

    let params = {
      id: foodItem?.id,
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
        setFoodFetchStatus(true);
        setNewImagePreviewURLs([]);
        setNewImageURLs([]);
        setNewImages([]);
        setFoodImageURLs([]);
        setIsRearrangeImagesFetching(false);
        setRearrangeModalOpen(false);
        setFoodFetchStatus(true);
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

  // Remove new image when user deletes before submitting
  const deleteImageGallery = (idx) => {
    let newImgs = newImages;
    newImgs.splice(idx, 1);
    setNewImages([...newImgs]);

    let newImgURLs = newImagePreviewURLs;
    newImgURLs.splice(idx, 1);
    setNewImagePreviewURLs([...newImgURLs]);
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

  // Remove image while rearranging the order
  const removeRearrangeImage = (idx) => {
    let rmvImg = foodImageURLs;
    rmvImg.splice(idx, 1);
    setFoodImageURLs([...rmvImg]);
  };

  // Review Food items
  const reviewFoodHandler = async (id) => {
    if (approveRemarks !== "") {
      setIsFoodReviewFetching(true);
      let params = {
        id,
        approvalStatus: approve ? "Approved" : "Rejected",
        approvalRemarks: approveRemarks,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.reviewFoodItem,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setFoodFetchStatus(true);
          setApproveRemarks("");
          setApproveRemarksError(false);
          setApproveRemarksHelperText("");
          setIsFoodReviewFetching(false);
          setOpenDialog(false);
        } else {
          alert(
            "Something went wrong while reviewing food item. Please try again later!"
          );
          setIsFoodReviewFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while reviewing food item. Please try again later!!"
        );
        setIsFoodReviewFetching(false);
      }
    } else {
      setApproveRemarksError(true);
      setApproveRemarksHelperText("Please enter remarks");
    }
  };

  // handle submit of update food item
  const handleSubmit = async () => {
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
            "Something went wrong while uploading chef images. Please try again later!"
          );

          setIsFileUploadFetching(false);
          return;
        }
      } else if (responseGall.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while uploading chef images. Please try again later!!"
        );
        setIsFileUploadFetching(false);
        return;
      }
    }

    setIsFileUploadFetching(false);
    rearrangeImages();
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Review Food Item";
  }, []);

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

  // Get food list
  useEffect(() => {
    try {
      let fdId = parseInt(atob(foodItemId));
      if (fdId) {
        const getFood = async () => {
          setIsFoodDataFetching(true);
          let params = {
            id: fdId,
          };
          let response = await invokeApi(
            config.apiDomains.foodService + apiList.getFoodItem,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              setFoodItem(response.data.foodItem);
              if (!!response.data.foodItemSnapshot) {
                setSnapShot(response.data.foodItemSnapshot);
              }
              setIsFoodDataFetching(false);
            } else {
              alert(
                "Something went wrong while fetching food item. Please try again later!"
              );
              setIsFoodDataFetching(false);
            }
          } else if (response.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while fetching food item. Please try again later!!"
            );
            setIsFoodDataFetching(false);
          }
        };
        if (foodFetchStatus) {
          setFoodFetchStatus(false);
          getFood();
        }
      } else {
        navigate("/pending-food-items");
      }
    } catch (error) {
      navigate("/pending-food-items");
    }
  }, [cookies, navigate, foodFetchStatus, foodItemId]);

  // setting food item image;
  useEffect(() => {
    if (foodItem) {
      setFoodImages([
        { id: 1, url: foodItem.image1 },
        { id: 2, url: foodItem.image2 },
        { id: 3, url: foodItem.image3 },
        { id: 4, url: foodItem.image4 },
        { id: 5, url: foodItem.image5 },
        { id: 6, url: foodItem.image6 },
      ]);
    }
  }, [foodItem, snapShot]);

  return (
    <>
      <Header />
      {isFoodDataFetching || isGetGstFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Card
          variant="outlined"
          sx={{ width: { xs: 400, sm: 600, md: 700 }, margin: "auto", my: 2 }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Breadcrumbs */}
            <Breadcrumbs separator="›">
              <Link component={RouterLink} to="/">
                <Box
                  component={"img"}
                  sx={{ width: "16px", height: "16px", mt: "4px" }}
                  src="/media/svg/home-filled-orange.svg"
                />
              </Link>
              <Link underline="hover" component={RouterLink} to="/dashboard">
                Dashboard
              </Link>
              <Link
                underline="hover"
                component={RouterLink}
                to="/pending-food-items"
              >
                Pending Food Items
              </Link>
              <Typography color="inherit">Review Food Item</Typography>
            </Breadcrumbs>
            <Box>
              <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
                Review Food Item
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
                {foodItem?.homeChefName ??
                  `${foodItem?.cloudKitchenName} - ${foodItem?.outletName}`}
              </Typography>
              <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                {foodItem?.itemName}
              </Typography>
            </Box>

            {!snapShot || foodItem.status !== "Pending" ? (
              <>
                <Box sx={{ textAlign: "left", m: 3 }}>
                  <Chip
                    label={foodItem.status}
                    size="small"
                    sx={{
                      float: "right",
                      background:
                        foodItem.status === "Active"
                          ? "#76BA99"
                          : foodItem.status === "Pending"
                          ? "orange"
                          : "#F87474",
                    }}
                  />

                  <Typography>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Description:{" "}
                    </Box>
                    {foodItem.description}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Cuisine Type:{" "}
                    </Box>
                    {foodItem.cuisineName}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Category:{" "}
                    </Box>
                    {foodItem.category}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Veg / Non-Veg:{" "}
                    </Box>
                    {foodItem.vegNonVeg}
                  </Typography>
                  {foodItem.vegNonVeg === "Non-Veg" && (
                    <Typography sx={{ mt: 1 }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Non-Veg Type:{" "}
                      </Box>
                      {foodItem.nonVegType}
                    </Typography>
                  )}
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Spice Level:{" "}
                    </Box>
                    {foodItem.spiceLevel}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Weight:{" "}
                    </Box>
                    {foodItem.weight}
                  </Typography>

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
                      {availableImgs.length + newImagePreviewURLs.length <
                        6 && (
                        <>
                          <Typography>
                            <Typography
                              variant="h6"
                              sx={{ mt: 1, textAlign: "left" }}
                            >
                              You can add upto {allowedImgsLen} image(s)
                            </Typography>
                          </Typography>
                          <Button
                            color="primary"
                            variant="contained"
                            component="span"
                          >
                            <AddAPhotoIcon sx={{ mr: 2 }} />
                            Upload Images
                          </Button>
                        </>
                      )}
                    </label>
                  </Box>

                  <ImageList cols={3}>
                    {availableImgs.map((items, idx) => (
                      <>
                        <ImageListItem key={idx}>
                          <img src={items.url} loading="lazy" alt="food_img" />
                        </ImageListItem>
                      </>
                    ))}
                  </ImageList>
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
                      <Typography variant="caption">
                        Rearrange Images
                      </Typography>
                    </Link>
                  )}

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
                  {newImagePreviewURLs.length > 0 && (
                    <Button
                      sx={{
                        mt: 1,
                      }}
                      disabled={isFileUploadFetching}
                      onClick={handleSubmit}
                      variant="outlined"
                      size="small"
                    >
                      Save
                      {isFileUploadFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  )}

                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      MRP exclusive GST:{" "}
                    </Box>
                    {foodItem?.mrp}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      MRP inclusive GST ({gstPercent}%):{" "}
                    </Box>
                    {foodItem?.mrp
                      ? (foodItem.mrp * (100 + parseInt(gstPercent))) / 100
                      : ""}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Discount in Rupees:{" "}
                    </Box>
                    {foodItem?.discount}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Selling price exclusive GST:{" "}
                    </Box>
                    {foodItem?.sellingPrice}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">
                      <Box component="span" sx={{ fontWeight: 500 }}>
                        Selling price inclusive GST ({gstPercent}%):{" "}
                      </Box>
                      {foodItem?.sellingPrice
                        ? (foodItem.sellingPrice *
                            (100 + parseInt(gstPercent))) /
                          100
                        : ""}
                    </Typography>
                  </Box>
                  <Typography sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Rebate on delivery charges (per unit):{" "}
                    </Box>
                    {foodItem?.rebate}
                  </Typography>
                </Box>
                {foodItem.status === "Pending" ? (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setOpenDialog(true);
                        setApprove(true);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ ml: 2 }}
                      onClick={() => {
                        setOpenDialog(true);
                        setApprove(false);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="body1">
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Approval Status:
                      </Box>
                      {foodItem?.approvalStatus} by{" "}
                      {foodItem?.approvalActionByEmpName} on{" "}
                      {moment(foodItem?.approvalActionOn).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Typography>

                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Approval Remarks:
                      </Box>
                      {foodItem?.approvalRemarks}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                <TableContainer>
                  <Chip
                    label={foodItem.status}
                    size="small"
                    sx={{
                      float: "right",
                      background:
                        foodItem.status === "Active"
                          ? "#76BA99"
                          : foodItem.status === "Pending"
                          ? "orange"
                          : "#F87474",
                    }}
                  />
                  <Table sx={{ minWidth: 650 }} aria-label="food item table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Field</TableCell>
                        <TableCell align="left">Previous Data</TableCell>
                        <TableCell align="left">Updated Data</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            backgroundColor:
                              row.previousData !== row.updatedData
                                ? "#FFEAE9"
                                : "",
                          }}
                        >
                          <TableCell align="left" sx={{ fontWeight: 500 }}>
                            {row.field}
                          </TableCell>
                          <TableCell align="left">
                            {row.field.startsWith("Image-") ? (
                              !!row.previousData ? (
                                <img
                                  src={row.previousData}
                                  height={80}
                                  width={80}
                                  alt="food_img"
                                />
                              ) : (
                                "Not uploaded"
                              )
                            ) : (
                              row.previousData
                            )}
                          </TableCell>
                          <TableCell align="left">
                            {row.field.startsWith("Image-") ? (
                              !!row.updatedData ? (
                                <img
                                  src={row.updatedData}
                                  height={80}
                                  width={80}
                                  alt="food_img"
                                />
                              ) : (
                                "Not uploaded"
                              )
                            ) : (
                              row.updatedData
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box>
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
                      {availableImgs.length + newImagePreviewURLs.length <
                        6 && (
                        <>
                          <Typography>
                            <Typography
                              variant="h6"
                              sx={{ mt: 1, textAlign: "left" }}
                            >
                              You can add upto {allowedImgsLen} image(s)
                            </Typography>
                          </Typography>
                          <Button
                            color="primary"
                            variant="contained"
                            component="span"
                          >
                            <AddAPhotoIcon sx={{ mr: 2 }} />
                            Upload Images
                          </Button>
                        </>
                      )}
                    </label>
                  </Box>

                  <ImageList cols={3}>
                    {availableImgs.map((items, idx) => (
                      <>
                        <ImageListItem key={idx}>
                          <img src={items.url} loading="lazy" alt="food_img" />
                        </ImageListItem>
                      </>
                    ))}
                  </ImageList>

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
                      <Typography variant="caption">
                        Rearrange Images
                      </Typography>
                    </Link>
                  )}

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
                  {newImagePreviewURLs.length > 0 && (
                    <Button
                      sx={{
                        mt: 1,
                      }}
                      disabled={isFileUploadFetching}
                      onClick={handleSubmit}
                      variant="outlined"
                      size="small"
                    >
                      Save
                      {isFileUploadFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  )}
                  {foodItem.status === "Pending" ? (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setOpenDialog(true);
                          setApprove(true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          setOpenDialog(true);
                          setApprove(false);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="body1">
                        <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                          Approval Status:
                        </Box>
                        {foodItem?.approvalStatus} by{" "}
                        {foodItem?.approvalActionByEmpName} on{" "}
                        {moment(foodItem?.approvalActionOn).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Typography>

                      <Typography variant="body1" sx={{ mt: 1 }}>
                        <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                          Approval Remarks:
                        </Box>
                        {foodItem?.approvalRemarks}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
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
                    <Typography variant="h6">
                      Drag to rearrange the images
                    </Typography>
                    <DragDropContext onDragEnd={handleDrop}>
                      <Droppable droppableId="list-container">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
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

            {/* Dialog */}
            <Dialog open={openDialog}>
              <DialogTitle id="success-title">
                {approve ? "Approve!!" : "Reject!!"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="success-description" sx={{ mb: 2 }}>
                  {approve
                    ? "Are you sure you want to approve?"
                    : "Are you sure you want to reject?"}
                </DialogContentText>
                <TextField
                  id="outlined-multiline-flexible"
                  label={approve ? "Approval remarks *" : "Rejection remarks *"}
                  value={approveRemarks}
                  onChange={(ev) => {
                    setApproveRemarks(ev.target.value);
                    setApproveRemarksError(false);
                    setApproveRemarksHelperText("");
                  }}
                  error={approveRemarksError}
                  helperText={approveRemarksHelperText}
                  multiline
                  rows={4}
                  style={{ width: 400 }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenDialog(false);
                    setApproveRemarks("");
                    setApproveRemarksError(false);
                    setApproveRemarksHelperText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isFoodReviewFetching}
                  onClick={() => {
                    reviewFoodHandler(foodItem.id);
                  }}
                >
                  Submit
                  {isFoodReviewFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ReviewFoodItem;
