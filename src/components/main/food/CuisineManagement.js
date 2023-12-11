import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  Link,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { config } from "../../../config/config";
import {
  apiList,
  invokeApi,
  invokeFormDataApi,
} from "../../../services/apiServices";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useCookies } from "react-cookie";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";

const CuisineManagement = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  // cuisine image handler state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState("");
  const [previewFileError, setPreviewFileError] = useState("");
  const [maxFileSizeErr, setMaxFileSizeErr] = useState("");

  const [cuisinesData, setCuisinesData] = useState(null);
  const [cuisineId, setCuisineId] = useState(null);

  const [cuisineName, setCuisineName] = useState("");
  const [cuisineNameError, setCuisineNameError] = useState(false);
  const [cuisineNameHelperText, setCuisineNameHelperText] = useState("");

  const [cuisineRankOrder, setCuisineRankOrder] = useState("");
  const [cuisineRankError, setCuisineRankError] = useState(false);
  const [cuisineRankHelperText, setCuisineRankHelperText] = useState("");

  const [cuisineImage, seCuisineImage] = useState(null);
  const [cuisineStatus, setCuisineStatus] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(false);

  // Drawers
  const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);
  const [isDrawerEditOpen, setIsDrawerEditOpen] = useState(false);
  const [isDrawerAddOpen, setIsDrawerAddOpen] = useState(false);

  const [isCuisinesFetching, setIsCuisinesFetching] = useState(false);
  const [isFileUploadFetching, setIsFileUploadFetching] = useState(false);
  const [isUpdateCuisineFetching, setIsUpdateCuisineFetching] = useState(false);

  const [triggerUpdateCuisine, setTriggerUpdateCuisine] = useState(false);
  const [triggerAddCuisine, setTriggerAddCuisine] = useState(false);

  // handle image uoload
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

  // handle update cuisien
  const handleUpdateCuisine = async (ev) => {
    let validationErrors = false;
    if (cuisineName.trim().length === 0) {
      setCuisineNameError(true);
      setCuisineNameHelperText("Please enter a cuisine name");
      validationErrors = true;
    }
    if (cuisineNameError) {
      validationErrors = true;
    }

    if (cuisineRankOrder === "") {
      setCuisineRankError(true);
      setCuisineRankHelperText("Please enter cuisine rank order");
      validationErrors = true;
    }

    if (!validationErrors) {
      if (uploadedFile) {
        setIsFileUploadFetching(true);
        let formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("path", "cuisine_images");

        let response = await invokeFormDataApi(
          config.apiDomains.commonService + apiList.uploadFile,
          formData,
          cookies
        );

        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            seCuisineImage(response.data.imageUrl);
            setIsFileUploadFetching(false);
            setTriggerUpdateCuisine(true);
          } else {
            alert(
              "Something went wrong while uploading cuisine image. Please try again later!"
            );
            setIsFileUploadFetching(false);
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while uploading cuisine image. Please try again later!!"
          );
          setIsFileUploadFetching(false);
        }
      } else {
        setTriggerUpdateCuisine(true);
      }
    }
  };

  // handle add cuisine
  const handleAddCuisine = async (ev) => {
    let validationErrors = false;
    if (cuisineName.trim().length === 0) {
      setCuisineNameError(true);
      setCuisineNameHelperText("Please enter a cuisine name");
      validationErrors = true;
    }
    if (cuisineRankOrder === "") {
      setCuisineRankError(true);
      setCuisineRankHelperText("Please enter cuisine rank order");
      validationErrors = true;
    }

    if (!previewFile) {
      setPreviewFileError("Please upload cuisine image");
      validationErrors = true;
    }
    // When no validation errors
    if (!validationErrors) {
      setIsFileUploadFetching(true);
      let formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("path", "cuisine_images");

      let response = await invokeFormDataApi(
        config.apiDomains.commonService + apiList.uploadFile,
        formData,
        cookies
      );

      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          seCuisineImage(response.data.imageUrl);
          setIsFileUploadFetching(false);
          setTriggerAddCuisine(true);
        } else {
          alert(
            "Something went wrong while uploading cuisine image. Please try again later!"
          );
          setIsFileUploadFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while uploading cuisine image. Please try again later!!"
        );
        setIsFileUploadFetching(false);
      }
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Cuisine Management";
  }, []);

  // check if logged in user having Admin role
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Admin") >= 0) {
        setCuisineStatus(true);
      } else {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      }
    }
  }, [userData, navigate]);

  // Get cuisines
  useEffect(() => {
    const getCuisines = async () => {
      setIsCuisinesFetching(true);
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
    if (cuisineStatus) {
      setCuisineStatus(false);
      getCuisines();
    }
  }, [cookies, navigate, cuisineStatus]);

  // trigger update cuisine;
  useEffect(() => {
    const updateCuisine = async () => {
      setIsUpdateCuisineFetching(true);

      let params = {
        id: cuisineId,
        cuisineName,
        image: cuisineImage ? cuisineImage : previewFile,
        rankOrder: cuisineRankOrder,
        status: deleteStatus ? "Deleted" : null,
      };

      let response = await invokeApi(
        config.apiDomains.foodService + apiList.updateCuisine,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success(
            `Cuisine ${deleteStatus ? "deleted" : "updated"} successfully`
          );
          setCuisineId(null);
          setCuisineName("");
          setCuisineRankOrder("");
          setPreviewFile("");
          setUploadedFile(null);
          setIsUpdateCuisineFetching(false);
          setIsDrawerEditOpen(false);
          setIsDrawerViewOpen(false);
          setUploadedFile(null);
          setDeleteStatus(false);
          seCuisineImage(null);
          setCuisineStatus(true);
        } else if (response.data.responseCode === "HE009") {
          setCuisineNameError(true);
          setCuisineNameHelperText("Cuisine Name Already Exists");
          setDeleteStatus(false);
          setIsUpdateCuisineFetching(false);
        } else {
          alert(
            "Something went wrong while updating cuisine. Please try again later!"
          );
          setIsUpdateCuisineFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while updating cuisine. Please try again later!!"
        );
        setIsUpdateCuisineFetching(false);
      }
    };

    if (triggerUpdateCuisine) {
      setTriggerUpdateCuisine(false);
      if (deleteStatus) {
        if (window.confirm("Are you sure to delete the cuisine?")) {
          updateCuisine();
        } else {
          setDeleteStatus(false);
        }
      } else {
        updateCuisine();
      }
    }
  }, [
    triggerUpdateCuisine,
    cookies,
    cuisineId,
    cuisineImage,
    cuisineRankOrder,
    deleteStatus,
    cuisineName,
    previewFile,
    navigate,
  ]);

  // trigger add cuisine;
  useEffect(() => {
    const addCuisine = async () => {
      setIsUpdateCuisineFetching(true);
      let params = {
        cuisineName,
        image: cuisineImage,
        rankOrder: cuisineRankOrder,
      };

      let response = await invokeApi(
        config.apiDomains.foodService + apiList.addCuisine,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          toast.success("Cuisine added successfully");
          setIsUpdateCuisineFetching(false);
          setIsDrawerAddOpen(false);
          seCuisineImage(null);
          setCuisineName("");
          setCuisineRankOrder("");
          setPreviewFile("");
          setUploadedFile(null);
          setCuisineStatus(true);
        } else if (response.data.responseCode === "HE009") {
          setCuisineNameError(true);
          setCuisineNameHelperText("Cuisine Name Already Exists");
          setIsUpdateCuisineFetching(false);
        } else {
          alert(
            "Something went wrong while adding cuisine. Please try again later!"
          );
          setIsUpdateCuisineFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while adding cuisine. Please try again later!!"
        );
        setIsUpdateCuisineFetching(false);
      }
    };

    if (triggerAddCuisine) {
      setTriggerAddCuisine(false);
      addCuisine();
    }
  }, [
    triggerAddCuisine,
    cookies,
    cuisineImage,
    cuisineRankOrder,
    cuisineName,
    navigate,
  ]);

  // setting state for update.
  useEffect(() => {
    if (cuisinesData) {
      let cuiId = cuisinesData?.filter((el) => el.id === cuisineId);
      if (cuiId.length > 0) {
        setCuisineName(cuiId[0]?.cuisineName);
        setPreviewFile(cuiId[0]?.image);
        setCuisineRankOrder(cuiId[0]?.rankOrder);
      }
    }
  }, [cuisinesData, cuisineId]);

  return (
    <>
      <Header />
      {isCuisinesFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Card
          variant="outlined"
          sx={{
            width: { xs: "80%", md: "750px" },
            margin: "auto",
            marginY: 2,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 3,
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
              <Typography color="inherit"> Cuisine Management</Typography>
            </Breadcrumbs>
            <Typography variant="header2" sx={{ textAlign: "center" }}>
              Cuisine Management
            </Typography>
            <Box>
              <Button
                onClick={() => setIsDrawerAddOpen(true)}
                variant="contained"
                sx={{ my: 3, float: "right" }}
              >
                Add Cuisine
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  <Typography variant="bodybold">Name</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  <Typography variant="bodybold">Image</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  <Typography variant="bodybold">Rank Order</Typography>
                </Grid>
              </Grid>
            </Box>
            {cuisinesData?.map((el, idx) => (
              <Box
                key={idx}
                sx={{
                  flexGrow: 1,
                  borderBottom: "1px solid grey",
                  mt: 2,
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
                    <Link
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setCuisineId(el.id);
                        setIsDrawerViewOpen(true);
                      }}
                    >
                      <Typography variant="bodyparagraph">
                        {el.cuisineName}
                      </Typography>
                    </Link>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Avatar
                      alt="food_img"
                      src={el.image}
                      sx={{ width: 80, height: 80, borderRadius: "50%" }}
                      variant="square"
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Typography variant="bodyparagraph">
                      {el.rankOrder}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}

            {/* Drawer cuisine view */}
            <Drawer anchor="right" open={isDrawerViewOpen}>
              <Card
                variant="outlined"
                sx={{ width: { xs: 300, sm: 500 }, m: 3 }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="header3"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    Cuisine Details
                  </Typography>

                  <Tooltip title="Close">
                    <IconButton
                      sx={{
                        cursor: "pointer",
                        position: "absolute",
                        right: 15,
                        top: 15,
                      }}
                      onClick={() => {
                        setCuisineName("");
                        setCuisineNameError(false);
                        setCuisineNameHelperText("");
                        setCuisineRankOrder("");
                        setCuisineRankError(false);
                        setCuisineRankHelperText("");
                        setPreviewFile("");
                        setCuisineId(null);
                        setIsDrawerViewOpen(false);
                      }}
                    >
                      <CloseIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>

                  <Typography
                    variant="bodybold"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    {cuisineName}
                  </Typography>

                  <Avatar
                    alt="food_img"
                    src={previewFile}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      margin: "auto",
                    }}
                  />

                  <Typography
                    variant="bodyparagraph"
                    sx={{ mt: 2, textAlign: "center" }}
                  >
                    Rank Order: {cuisineRankOrder}
                  </Typography>
                  <CardActions
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      mt: 2,
                      gap: "16px",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        setIsDrawerEditOpen(true);
                        setIsDrawerViewOpen(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleUpdateCuisine();
                        setDeleteStatus(true);
                      }}
                      disabled={isUpdateCuisineFetching}
                    >
                      Delete
                      {isUpdateCuisineFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </Drawer>

            {/* Edit Cuisine Drawer  */}
            <Drawer anchor="right" open={isDrawerEditOpen}>
              <Card
                variant="outlined"
                sx={{ width: { xs: 300, sm: 500 }, m: 3 }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="header3"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    Update Cuisine
                  </Typography>

                  {/* cuisine image */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="cuisine-pic"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />

                    {(previewFile || uploadedFile) && !maxFileSizeErr ? (
                      <Tooltip title="Change Image">
                        <label htmlFor="cuisine-pic">
                          <IconButton component="span">
                            <Box
                              component="img"
                              src={previewFile}
                              alt="profile"
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                              }}
                            />
                          </IconButton>
                        </label>
                      </Tooltip>
                    ) : (
                      <>
                        <label htmlFor="cuisine-pic">
                          <IconButton component="span">
                            <Avatar sx={{ width: 100, height: 100 }}>
                              <PhotoCameraIcon sx={{ width: 56, height: 56 }} />
                            </Avatar>
                          </IconButton>
                        </label>
                        <Typography variant="bodyregular" color={"error"}>
                          {maxFileSizeErr || previewFileError}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <TextField
                    id="cuisineName"
                    label="Cuisine Name *"
                    value={cuisineName}
                    variant="standard"
                    onChange={(ev) => {
                      setCuisineName(ev.target.value.replace(/\s\s+/g, " "));
                      setCuisineNameError(false);
                      setCuisineNameHelperText("");
                    }}
                    inputProps={{ maxLength: 60 }}
                    error={cuisineNameError}
                    helperText={cuisineNameHelperText}
                    sx={{ mb: 2 }}
                    fullWidth
                  />

                  <TextField
                    id="rankOrder"
                    label="Rank Order *"
                    value={cuisineRankOrder}
                    variant="standard"
                    onChange={(ev) => {
                      setCuisineRankOrder(ev.target.value.replace(/\D/, ""));
                      setCuisineRankError(false);
                      setCuisineRankHelperText("");
                    }}
                    inputProps={{ maxLength: 4 }}
                    error={cuisineRankError}
                    helperText={cuisineRankHelperText}
                    sx={{ mb: 2 }}
                    fullWidth
                  />
                  <CardActions
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      mt: 2,
                      gap: "16px",
                    }}
                  >
                    <Button
                      onClick={() => {
                        setCuisineName("");
                        setCuisineNameError(false);
                        setCuisineNameHelperText("");
                        setCuisineRankOrder("");
                        setCuisineRankError(false);
                        setCuisineRankHelperText("");
                        setPreviewFile("");
                        setCuisineId(null);
                        setIsDrawerEditOpen(false);
                      }}
                      variant="outlined"
                      color="primary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateCuisine}
                      type="submit"
                      variant="contained"
                      disabled={isUpdateCuisineFetching || isFileUploadFetching}
                    >
                      Submit
                      {isUpdateCuisineFetching || isFileUploadFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </Drawer>

            {/* Add Cuisine Drawer  */}
            <Drawer anchor="right" open={isDrawerAddOpen}>
              <Card
                variant="outlined"
                sx={{ width: { xs: 300, sm: 500 }, m: 3 }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="header3"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    Add Cuisine
                  </Typography>

                  {/* cuisine image */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="cuisine-pic"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />

                    {previewFile && !maxFileSizeErr ? (
                      <label htmlFor="cuisine-pic">
                        <IconButton component="span">
                          <Box
                            component="img"
                            src={previewFile}
                            alt="profile"
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                            }}
                          />
                        </IconButton>
                      </label>
                    ) : (
                      <>
                        <label htmlFor="cuisine-pic">
                          <IconButton component="span">
                            <Avatar sx={{ width: 100, height: 100 }}>
                              <PhotoCameraIcon sx={{ width: 56, height: 56 }} />
                            </Avatar>
                          </IconButton>
                        </label>
                        <Typography variant="bodyregular" color={"error"}>
                          {maxFileSizeErr || previewFileError}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <TextField
                    id="cuisineName"
                    label="Cuisine Name *"
                    value={cuisineName}
                    variant="standard"
                    onChange={(ev) => {
                      setCuisineName(ev.target.value.replace(/\s\s+/g, " "));
                      setCuisineNameError(false);
                      setCuisineNameHelperText("");
                    }}
                    inputProps={{ maxLength: 60 }}
                    error={cuisineNameError}
                    helperText={cuisineNameHelperText}
                    sx={{ mb: 2 }}
                    fullWidth
                  />

                  <TextField
                    id="rankOrder"
                    label="Rank Order *"
                    value={cuisineRankOrder}
                    variant="standard"
                    onChange={(ev) => {
                      setCuisineRankOrder(ev.target.value.replace(/\D/, ""));
                      setCuisineRankError(false);
                      setCuisineRankHelperText("");
                    }}
                    inputProps={{ maxLength: 4 }}
                    error={cuisineRankError}
                    helperText={cuisineRankHelperText}
                    sx={{ mb: 2 }}
                    fullWidth
                  />
                  <CardActions
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      mt: 2,
                      gap: "16px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCuisineName("");
                        setCuisineNameError(false);
                        setCuisineNameHelperText("");
                        setCuisineRankOrder("");
                        setCuisineRankError(false);
                        setCuisineRankHelperText("");
                        setPreviewFile("");
                        setCuisineId(null);
                        setPreviewFileError("");
                        setMaxFileSizeErr("");
                        setIsDrawerAddOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAddCuisine}
                      type="submit"
                      disabled={isUpdateCuisineFetching || isFileUploadFetching}
                    >
                      Submit
                      {isUpdateCuisineFetching || isFileUploadFetching ? (
                        <CircularProgress size={24} sx={{ ml: 2 }} />
                      ) : (
                        <></>
                      )}
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </Drawer>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CuisineManagement;
