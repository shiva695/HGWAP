import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import moment from "moment";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import Header from "../../general-components/ui-components/Header";

const PendingCloudKitchenApplications = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [offset, setOffset] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [outletsData, setOutletsData] = useState([]);
  const [outletStatus, setOutletStatus] = useState(true);
  const [isOutletsDataFetching, setIsOutletDataFetching] = useState(false);

  const [cloudKitchens, setCloudKitchens] = useState([]);
  const [cloudKitchenName, setCloudKitchenName] = useState("");
  const [cloudKitchenId, setCloudKitchenId] = useState(null);

  const limit = 10;

  const loadMore = () => {
    setOffset((offset) => offset + limit);
    setOutletStatus(true);
  };

  // On load
  useEffect(() => {
    document.title =
      config.documentTitle + " | Pending Restaurant Applications";
  }, []);

  // Get home chefs data initially on load and when offset changes to load more
  useEffect(() => {
    const getOutletsData = async () => {
      if (offset === -1) {
        setOutletsData([]);
        setOffset(0);
      } else if (offset >= 0) {
        setIsOutletDataFetching(true);
        let params = {
          status: "Pending Certificates Verification",
          limit: limit,
          offset: offset,
          cloudKitchenId: cloudKitchenId,
        };
        let response = await invokeApi(
          config.apiDomains.chefService + apiList.getCloudKitchenOutlets,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            if (response.data.cloudKitchenOutlets.length < 10) {
              setShowLoadMore(false);
            }
            setOutletsData((data) => [
              ...data,
              ...response.data.cloudKitchenOutlets,
            ]);
            setIsOutletDataFetching(false);
          } else {
            alert(
              "Something went wrong while fetching outlets data. Please try again later!"
            );
            setIsOutletDataFetching(false);
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while fetching outlets data. Please try again later!!"
          );
          setIsOutletDataFetching(false);
        }
      }
    };
    if (outletStatus) {
      setOutletStatus(false);
      getOutletsData();
    }
  }, [limit, offset, cookies, navigate, outletStatus, cloudKitchenId]);

  // check if logged in user having a admin or chef support executive role
  useEffect(() => {
    if (userData) {
      if (
        !(
          userData?.user.roles.indexOf("Admin") > -1 ||
          userData?.user.roles.indexOf("Chef Support Executive") > -1
        )
      ) {
        navigate("/logout");
      }
    }
  }, [userData, navigate]);

  // search by cloud kitchens name and get Id
  useEffect(() => {
    const getCloudKitchens = async () => {
      let params = {
        cloudKitchenName: cloudKitchenName,
        limit: 20,
        sortBy: "cloudKitchenName ASC",
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getCloudKitchens,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCloudKitchens(response.data.cloudKitchens);
        } else {
          alert(
            "Something went wrong while fetching outlets. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching outlets. Please try again later!!"
        );
      }
    };

    if (cloudKitchenName.length >= 3) {
      getCloudKitchens();
    }
  }, [navigate, cookies, cloudKitchenName]);

  return (
    <>
      <Header />
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
            <Typography color="inherit">
              Pending Restaurant Applications
            </Typography>
          </Breadcrumbs>

          <Typography variant="header2" sx={{ mb: 2, textAlign: "center" }}>
            Pending Restaurant Applications
          </Typography>

          <Box sx={{ marginY: 3, display: "flex", justifyContent: "flex-end" }}>
            <Autocomplete
              id="cloud-kitchens"
              size="small"
              clearOnBlur={false}
              options={cloudKitchens}
              getOptionLabel={(cloudKitchen) =>
                `${cloudKitchen.cloudKitchenName}`
              }
              noOptionsText={
                cloudKitchenName.length < 3
                  ? "Please enter atleast 3 characters"
                  : "No matching restaurants found"
              }
              isOptionEqualToValue={(option, value) =>
                option.cloudKitchenName === value.cloudKitchenName
              }
              renderOption={(props, cloudKitchen) => (
                <Box component="li" {...props} key={cloudKitchen.id}>
                  {cloudKitchen.cloudKitchenName}
                </Box>
              )}
              sx={{ width: 300, mr: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  value={cloudKitchenName}
                  onChange={(ev) => {
                    setCloudKitchenName(ev.target.value);
                  }}
                  label="Filter by Restaurant"
                />
              )}
              onChange={(ev, newValue, reason) => {
                setOutletsData([]);
                setCloudKitchenId(newValue?.id);
                setOutletStatus(true);
                setOffset(0);
                if (reason === "clear") {
                  setShowLoadMore(true);
                  setCloudKitchens([]);
                }
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="bodybold">
                  Restaurant - Outlet
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="bodybold">Address</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="bodybold">Submitted On</Typography>
              </Grid>
            </Grid>
          </Box>

          {outletsData?.length === 0 && (
            <Typography
              variant="bodyregular"
              sx={{ textAlign: "center", mt: 2, backgroundColor: "#eee" }}
            >
              No data found
            </Typography>
          )}

          {outletsData?.map((chef, idx) => (
            <Box
              sx={{
                flexGrow: 1,
                borderBottom: "1px solid grey",
                mt: 2,
              }}
              key={idx}
            >
              <Grid
                container
                spacing={2}
                key={idx}
                sx={{
                  dispaly: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Grid item xs={3}>
                  <Link
                    href={`/review-restaurant-application/${window.btoa(
                      chef.id
                    )}`}
                  >
                    <Typography variant="bodyparagraph">
                      {chef.cloudKitchenName} {" - "} {chef.outletName}
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="bodyparagraph">
                    {chef.streetAddress}, {chef.locality}, {chef.city},{" "}
                    {chef.state}, {chef.country}, {chef.pincode}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="bodyparagraph">
                    {moment(chef.createdDate).format("DD/MM/YYYY")}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}

          {showLoadMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isOutletsDataFetching}
                onClick={loadMore}
              >
                Load More
                {isOutletsDataFetching ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <></>
                )}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PendingCloudKitchenApplications;
