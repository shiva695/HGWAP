import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@mui/material";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiList, invokeApi } from "../../../services/apiServices";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Header from "../../general-components/ui-components/Header";

const libraries = ["places"];

const steps = ["Profile Data", "GST Data", "FSSAI Data", "Gallery Data"];

const ReviewCloudKitchenApplication = () => {
  const mapRef = useRef(null);
  const { id: cloudKitchenID } = useParams();
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);

  const [markerPosition, setMarkerPosition] = useState({
    lat: config.defaultMapLocation.latitude,
    lng: config.defaultMapLocation.longitude,
  });
  const [streetAddress, setStreetAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [approve, setApprove] = useState(false);
  const [approveProfile, setApproveProfile] = useState(false);
  const [approveGST, setApproveGST] = useState(false);
  const [approveFSSAI, setApproveFSSAI] = useState(false);
  const [fssaiId, setFssaiId] = useState("");
  const [approveStatusFetching, setApproveStatusFetching] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [approveRemarksError, setApproveRemarksError] = useState(false);
  const [approveRemarksHelperText, setApproveRemarksHelperText] = useState("");

  const [galleryApproveFetching, setGalleryApproveFetching] = useState(false);

  const [galleryImages, setGalleryImages] = useState(null);

  const [outletData, setOutletData] = useState([]);
  const [outletDataStatus, setOutletDataStatus] = useState(true);
  const [isOutletDataFetching, setIsOutletDataFetching] = useState(true);

  let galleryImageApproved = galleryImages?.filter(
    (el) => el.status === "Active"
  );
  let galleryImagePending = galleryImages?.filter(
    (el) => el.status === "Pending"
  );

  // multistep form handle next
  const handleNext = () => {
    setActiveStep((activeStep) => activeStep + 1);
  };

  // multistep form handle back
  const handleBack = () => {
    setActiveStep((activeStep) => activeStep - 1);
  };

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
            <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
              Profile Data
            </Typography>

            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Avatar
                  sx={{ width: 100, height: 100 }}
                  alt="profile_img"
                  src={outletData?.profileImage}
                />
              </Box>
              <Typography variant="Body1" sx={{ mb: 1 }}>
                Restaurant Name: {outletData?.cloudKitchenName}
              </Typography>
              <Typography variant="Body1" sx={{ mb: 1 }}>
                Outlet Name: {outletData?.outletName}
              </Typography>
              <Typography variant="Body1" sx={{ mb: 1 }}>
                Application Status: {outletData?.status}
              </Typography>

              {/* Google maps */}
              <LoadScript
                googleMapsApiKey={config.googleMapsApiKey}
                libraries={libraries}
              >
                <GoogleMap
                  ref={mapRef}
                  onLoad={(map) => {
                    mapRef.current = map;
                    map.setOptions({ draggable: false });
                  }}
                  mapContainerStyle={{ height: "400px" }}
                  center={markerPosition}
                  zoom={17}
                >
                  <Marker position={markerPosition} />
                </GoogleMap>
              </LoadScript>

              <Typography variant="Body1" sx={{ mt: 2 }}>
                Address as per Google: {streetAddress}, {locality}, {city},{" "}
                {state}, {country}, {pincode}.
              </Typography>

              <Typography variant="Body1" sx={{ mt: 2 }}>
                Address filled by Chef: {outletData?.streetAddress},{" "}
                {outletData?.locality}, {outletData?.city}, {outletData?.state},{" "}
                {outletData?.country}, {outletData?.pincode}.
              </Typography>

              {outletData?.profileApprovalStatus === "Pending" ? (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setOpenDialog(true);
                        setApprove(true);
                        setApproveProfile(true);
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
                        setApproveProfile(true);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                  <Typography variant="Body1" sx={{ mt: 2 }}>
                    Please review address in FSSAI certificate before approving
                    the profile.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="Body1" sx={{ mt: 2 }}>
                    Profile Approval Status: {outletData?.profileApprovalStatus}{" "}
                    by {outletData?.profileApprovalActionByEmpName} on{" "}
                    {moment(outletData?.profileApprovalActionOn).format(
                      "DD/MM/YYYY  HH:mm"
                    )}
                  </Typography>
                  <Typography variant="Body1" sx={{ mt: 2 }}>
                    Profile Approval Remarks:{" "}
                    {outletData?.profileApprovalRemarks}
                  </Typography>
                </>
              )}
              {outletData?.status === "Active" && (
                <>
                  <Typography variant="Body1" sx={{ mt: 2 }}>
                    Physical Verification Status: Approved by{" "}
                    {outletData?.physicalVerificationByEmpName} on{" "}
                    {moment(outletData?.physicalVerificationOn).format(
                      "DD/MM/YYYY  HH:mm"
                    )}{" "}
                    at{" "}
                    <Link
                      href={`https://www.google.com/maps/dir/?api=1&origin=${outletData?.verifierLatitude},${outletData?.verifierLongitude}&destination=${outletData?.latitude},${outletData?.longitude}`}
                      target="_blank"
                    >
                      {outletData?.verifierLatitude},
                      {outletData?.verifierLongitude}
                    </Link>
                  </Typography>
                  <Typography variant="Body1" sx={{ mt: 2 }}>
                    Physical Verification Remarks:{" "}
                    {outletData?.physicalVerificationRemarks}
                  </Typography>
                </>
              )}
            </CardContent>
          </Box>
        );
      // GST Data;
      case 1:
        return (
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
              GST Data
            </Typography>

            {outletData?.isGstRegistered === "No" ? (
              <Typography variant="body1" sx={{ mb: 2 }}>
                GST Registered: No
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  GST Number: {outletData?.gstNumber}
                </Typography>
                <Link href={outletData?.gstCertificate} target="_blank">
                  Click here to download GST Certificate
                </Link>
                {outletData?.gstApprovalStatus === "Pending" ? (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => {
                        setOpenDialog(true);
                        setApprove(true);
                        setApproveGST(true);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ ml: 2 }}
                      size="small"
                      onClick={() => {
                        setOpenDialog(true);
                        setApprove(false);
                        setApproveGST(true);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      GST Approval Status: {outletData?.gstApprovalStatus} by{" "}
                      {outletData?.gstApprovalActionByEmpName} on{" "}
                      {moment(outletData?.gstApprovalActionOn).format(
                        "DD/MM/YYYY  HH:mm"
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      GST Approval Remarks: {outletData?.gstApprovalRemarks}
                    </Typography>
                  </>
                )}
              </>
            )}
          </CardContent>
        );
      // FSSAI Data;
      case 2:
        return (
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
              FSSAI Data
            </Typography>

            {outletData?.fssaiLicences.length === 0 ? (
              <Typography variant="body1" sx={{ mb: 2 }}>
                FSSAI data not yet uploaded by chef
              </Typography>
            ) : (
              <>
                {outletData?.fssaiLicences.map((fssai, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid grey",
                      p: 3,
                      m: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Licence Number:
                      </Box>
                      {fssai.fssaiLicenseNumber}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Valid From:
                      </Box>
                      {moment(fssai.fssaiLicenseIssueDate).format("DD/MM/YYYY")}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Valid Upto:
                      </Box>
                      {moment(fssai.fssaiLicenseExpiryDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <Link href={fssai.fssaiCertificate} target="_blank">
                        Click to Download Certificate
                      </Link>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Status:
                      </Box>
                      {fssai.status}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                        Approval Status:
                      </Box>
                      {fssai.fssaiApprovalStatus === "Pending" ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            disabled={
                              outletData?.profileApprovalStatus !== "Approved"
                            }
                            onClick={() => {
                              setOpenDialog(true);
                              setApprove(true);
                              setApproveFSSAI(true);
                              setFssaiId(fssai.id);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ ml: 1 }}
                            size="small"
                            disabled={
                              outletData?.profileApprovalStatus !== "Approved"
                            }
                            onClick={() => {
                              setOpenDialog(true);
                              setApprove(false);
                              setApproveFSSAI(true);
                              setFssaiId(fssai.id);
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
                            {fssai.fssaiApprovalStatus} by{" "}
                            {fssai.fssaiApprovalActionByEmpName} on{" "}
                            {moment(fssai.fssaiApprovalActionOn).format(
                              "DD/MM/YYYY  HH:mm"
                            )}
                          </Typography>

                          <Typography variant="body1" sx={{ mt: 1 }}>
                            <Box
                              component="span"
                              sx={{ fontWeight: 500, mr: 1 }}
                            >
                              Approval Remarks:
                            </Box>
                            {fssai.fssaiApprovalRemarks}
                          </Typography>
                        </Box>
                      )}
                    </Typography>
                    <Box>
                      {fssai.fssaiApprovalStatus === "Pending" &&
                        outletData?.profileApprovalStatus !== "Approved" && (
                          <Typography variant="bodyregular" sx={{ mt: 1 }}>
                            Please review the Profile data before reviewing
                            FSSAI data.
                          </Typography>
                        )}
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </CardContent>
        );
      // Gallery Data
      case 3:
        return (
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
              Gallery Images
            </Typography>

            {galleryImageApproved?.length > 0 && (
              <Typography variant="h6" sx={{ mt: 3 }}>
                Gallery Images (Approved)
              </Typography>
            )}

            <ImageList cols={3}>
              {galleryImageApproved?.map((item, idx) => (
                <ImageListItem key={idx}>
                  <img
                    src={item.image}
                    loading="lazy"
                    alt="gallery-img"
                    style={{ objectFit: "contain", backgroundColor: "#eee" }}
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
                      <Tooltip title="Reject image">
                        <IconButton onClick={() => rejectImage(item.id)}>
                          <DeleteIcon sx={{ color: "white" }}></DeleteIcon>
                        </IconButton>
                      </Tooltip>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>

            {galleryImagePending?.length > 0 && (
              <Typography variant="h6" sx={{ mt: 3 }}>
                Gallery Images (Pending)
              </Typography>
            )}
            <ImageList cols={3}>
              {galleryImagePending.map((item, idx) => (
                <ImageListItem key={idx}>
                  <img
                    src={item.image}
                    loading="lazy"
                    alt="gallery-img"
                    style={{
                      cursor: "pointer",
                      objectFit: "contain",
                      backgroundColor: "#eee",
                    }}
                    onClick={() => window.open(item.image, "_blank")}
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
                      <Tooltip title="Reject image">
                        <IconButton onClick={() => rejectImage(item.id)}>
                          <DeleteIcon sx={{ color: "white" }}></DeleteIcon>
                        </IconButton>
                      </Tooltip>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>

            {galleryImages.some(
              (arr) => arr.status === "Rejected" || arr.status === "Pending"
            ) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  onClick={approvingPendingImageStatus}
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Approve
                  {galleryApproveFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </Box>
            )}
          </CardContent>
        );
      default:
        return <></>;
    }
  };

  // When a image is rejected
  const rejectImage = (id) => {
    if (window.confirm("Are you sure you want to Reject Image?")) {
      let gallImgs = [...galleryImages];
      let filteredImg = gallImgs.filter((arr) => arr.id === id);
      filteredImg[0].status = "Rejected";
      setGalleryImages(gallImgs);
    }
  };

  // Update approve image status
  const approvingPendingImageStatus = async () => {
    if (window.confirm("Are you sure you want to approve all images?")) {
      let gallImgs = [...galleryImages];
      let filterPending = gallImgs.filter((item) => item.status === "Pending");
      filterPending.forEach((arr) => (arr.status = "Approved"));
      setGalleryImages(gallImgs);

      let filterImg = gallImgs.filter((item) => item.status !== "Active");
      setGalleryApproveFetching(true);
      let params = {
        id: atob(cloudKitchenID),
        galleryImages: filterImg.map((item) => ({
          id: item.id,
          status: item.status,
        })),
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.reviewCloudKitchenGallery,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          alert("Approved successfully!!");
          setOutletDataStatus(true);
          setGalleryApproveFetching(false);
        } else {
          alert(
            "Something went wrong while approving gallery images. Please try again later!"
          );
          setGalleryApproveFetching(false);
        }
      } else {
        alert(
          "Something went wrong while approving gallery images. Please try again later!!"
        );
        setGalleryApproveFetching(false);
      }
    }
  };

  // profile approval status
  const handleProfileApproval = async () => {
    if (approveRemarks !== "") {
      setApproveStatusFetching(true);
      let params = {
        id: atob(cloudKitchenID),
        profileApprovalStatus: approve ? "Approved" : "Rejected",
        profileApprovalRemarks: approveRemarks,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.reviewCloudKitchenProfile,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOutletDataStatus(true);
          setOpenDialog(false);
          setApproveRemarks("");
          setApproveStatusFetching(false);
        } else {
          alert(
            "Something went wrong while approving profile data. Please try again later!"
          );
          setApproveStatusFetching(false);
        }
      } else {
        alert(
          "Something went wrong while approving profile data. Please try again later!!"
        );
        setApproveStatusFetching(false);
      }
    } else {
      setApproveRemarksError(true);
      setApproveRemarksHelperText("Please enter remarks");
    }
  };

  // GST approval status
  const handleGstApproval = async () => {
    if (approveRemarks !== "") {
      setApproveStatusFetching(true);
      let params = {
        id: atob(cloudKitchenID),
        gstApprovalStatus: approve ? "Approved" : "Rejected",
        gstApprovalRemarks: approveRemarks,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.reviewCloudKitchenGST,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOutletDataStatus(true);
          setOpenDialog(false);
          setApproveRemarks("");
          setApproveStatusFetching(false);
        } else {
          alert(
            "Something went wrong while approving GST data. Please try again later!"
          );
          setApproveStatusFetching(false);
        }
      } else {
        alert(
          "Something went wrong while approving GST data. Please try again later!!"
        );
        setApproveStatusFetching(false);
      }
    } else {
      setApproveRemarksError(true);
      setApproveRemarksHelperText("Please enter remarks");
    }
  };

  // FSSAI approval status
  const handleFssaiApproval = async () => {
    if (approveRemarks !== "") {
      setApproveStatusFetching(true);
      let params = {
        id: fssaiId,
        fssaiApprovalStatus: approve ? "Approved" : "Rejected",
        fssaiApprovalRemarks: approveRemarks,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.reviewCloudKitchenFssai,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOutletDataStatus(true);
          setOpenDialog(false);
          setApproveRemarks("");
          setApproveStatusFetching(false);
        } else {
          alert(
            "Something went wrong while approving FSSAI data. Please try again later!"
          );
          setApproveStatusFetching(false);
        }
      } else {
        alert(
          "Something went wrong while approving FSSAI data. Please try again later!!"
        );
        setApproveStatusFetching(false);
      }
    } else {
      setApproveRemarksError(true);
      setApproveRemarksHelperText("Please enter remarks");
    }
  };

  // On load
  useEffect(() => {
    document.title =
      config.documentTitle + " | Review Restaurant Application";
  }, []);

  // On load, get the outlet details
  useEffect(() => {
    try {
      let cloudId = parseInt(atob(cloudKitchenID));
      if (cloudId) {
        const getOutletDataById = async () => {
          let params = {
            id: cloudId,
          };

          let response = await invokeApi(
            config.apiDomains.chefService + apiList.getCloudKitchenOutlet,
            params,
            cookies
          );
          if (response.status >= 200 && response.status < 300) {
            if (response.data.responseCode === "200") {
              setOutletData(response.data.cloudKitchenOutlet);
              setMarkerPosition({
                lat: parseFloat(response.data.cloudKitchenOutlet.latitude),
                lng: parseFloat(response.data.cloudKitchenOutlet.longitude),
              });
              let url =
                "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                response.data.cloudKitchenOutlet.latitude +
                "," +
                response.data.cloudKitchenOutlet.longitude +
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
                        } else if (
                          element.types.includes("sublocality_level_1")
                        ) {
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
                      setLocality(localityVal);
                      setCity(cityVal);
                      setState(stateVal);
                      setCountry(countryVal);
                      setPincode(pincodeVal);
                    }
                  }
                  setIsOutletDataFetching(false);
                });
              });
            } else {
              alert(
                "Something went wrong while fetching outlet Data. Please try again later!"
              );
              setIsOutletDataFetching(false);
            }
          } else if (response.status === 401) {
            navigate("/logout");
          } else {
            alert(
              "Something went wrong while fetching outlet Data. Please try again later!!"
            );
            setIsOutletDataFetching(false);
          }
        };
        if (outletDataStatus) {
          setOutletDataStatus(false);
          getOutletDataById();
        }
      } else {
        navigate("/pending-restaurant-applications");
      }
    } catch (error) {
      navigate("/pending-restaurant-applications");
    }
  }, [cloudKitchenID, cookies, outletDataStatus, navigate]);

  useEffect(() => {
    const imagesStatus = outletData?.galleryImages?.map((item) => ({
      id: item.id,
      status: item.status,
      image: item.galleryImage,
    }));
    setGalleryImages(imagesStatus);
  }, [outletData]);

  return (
    <>
      <Header />
      {isOutletDataFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <>
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
            sx={{ width: { xs: 400, sm: 600 }, margin: "auto", my: 3 }}
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
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1}
                >
                  {activeStep === steps.length - 1 ? "Done" : "Next"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
      {/* Dialog */}
      <Dialog open={openDialog}>
        <DialogTitle id="success-title">
          {approve ? "Approve!!" : "Rejected!!"}
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
              setApproveProfile(false);
              setApproveGST(false);
              setApproveFSSAI(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={approveStatusFetching}
            onClick={() => {
              if (approveProfile) {
                handleProfileApproval();
              }
              if (approveGST) {
                handleGstApproval();
              }
              if (approveFSSAI) {
                handleFssaiApproval();
              }
              setApproveProfile(false);
              setApproveGST(false);
              setApproveFSSAI(false);
            }}
          >
            Submit
            {approveStatusFetching ? (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            ) : (
              <></>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewCloudKitchenApplication;
