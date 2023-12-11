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
  Tab,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import moment from "moment";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Header from "../../general-components/ui-components/Header";

const PendingGstApprovals = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [isChefDataFetching, setIsChefDataFetching] = useState(false);
  const [homeChefsData, setHomeChefsData] = useState([]);

  const [offsetChef, setOffsetChef] = useState(0);
  const [offsetCloud, setOffsetCloud] = useState(0);

  const [showLoadMoreChef, setShowLoadMoreChef] = useState(true);
  const [showLoadMoreCloud, setShowLoadMoreCloud] = useState(true);
  const [chefName, setChefName] = useState("");
  const [tab, setTab] = useState(0);

  const [outletsData, setOutletsData] = useState([]);
  const [outletStatus, setOutletStatus] = useState(true);
  const [isOutletsDataFetching, setIsOutletDataFetching] = useState(false);

  const [cloudKitchens, setCloudKitchens] = useState([]);
  const [cloudKitchenName, setCloudKitchenName] = useState("");
  const [cloudKitchenId, setCloudKitchenId] = useState(null);
  const limitChef = 10;
  const limitCloud = 10;

  const loadMoreChef = () => {
    setOffsetChef((offsetChef) => offsetChef + limitChef);
  };
  const loadMoreCloud = () => {
    setOffsetCloud((offsetCloud) => offsetCloud + limitCloud);
    setOutletStatus(true);
  };

  const handleSearchChef = async (ev) => {
    ev.preventDefault();
    setOffsetChef(-1);
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Pending GST Approvals";
  }, []);

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

  // Get home chefs data initially on load and when offset changes to load more
  useEffect(() => {
    const getChefData = async () => {
      if (offsetChef === -1) {
        setHomeChefsData([]);
        setOffsetChef(0);
      } else if (offsetChef >= 0) {
        setIsChefDataFetching(true);
        let params = {
          status: "Active",
          gstApprovalStatus: "Pending",
          limit: limitChef,
          offset: offsetChef,
          chefName: chefName,
        };
        let response = await invokeApi(
          config.apiDomains.chefService + apiList.getHomeChefs,
          params,
          cookies
        );
        if (response.status >= 200 && response.status < 300) {
          if (response.data.responseCode === "200") {
            if (response.data.homeChefs.length < 10) {
              setShowLoadMoreChef(false);
            }
            setHomeChefsData((data) => [...data, ...response.data.homeChefs]);
            setIsChefDataFetching(false);
          } else {
            alert(
              "Something went wrong while fetching home chefs data. Please try again later!"
            );
            setIsChefDataFetching(false);
          }
        } else if (response.status === 401) {
          navigate("/logout");
        } else {
          alert(
            "Something went wrong while fetching home chefs data. Please try again later!!"
          );
          setIsChefDataFetching(false);
        }
      }
    };

    getChefData();
  }, [limitChef, offsetChef, cookies, navigate, chefName]);

  // Get outlets data initially on load and when offset changes to load more
  useEffect(() => {
    const getOutletsData = async () => {
      if (offsetCloud === -1) {
        setOutletsData([]);
        setOffsetCloud(0);
      } else if (offsetCloud >= 0) {
        setIsOutletDataFetching(true);
        let params = {
          status: "Active",
          gstApprovalStatus: "Pending",
          limit: limitCloud,
          offset: offsetCloud,
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
              setShowLoadMoreCloud(false);
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
  }, [
    limitCloud,
    offsetCloud,
    cookies,
    navigate,
    outletStatus,
    cloudKitchenId,
  ]);

  // Get names of Restaurant on filter by name
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
          width: { xs: 400, sm: 600, md: 700 },
          margin: "auto",
          marginY: 2,
        }}
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
            <Typography color="inherit">Pending GST Approvals</Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
            Pending GST Approvals
          </Typography>

          <Box
            sx={{
              width: "100%",
              mb: 2,
            }}
          >
            <TabContext value={tab} sx={{ alignItems: "left" }}>
              <TabList
                TabIndicatorProps={{
                  style: {
                    display: "none",
                  },
                }}
                onChange={(ev, newValue) => setTab(newValue)}
              >
                <Tab
                  style={{
                    background: tab === 0 ? "#EEEEEE" : "",
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                  }}
                  label="Home Chefs"
                  value={0}
                />
                <Tab
                  sx={{
                    background: tab === 1 ? "#EEEEEE" : "",
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                  }}
                  label="Restaurants"
                  value={1}
                />
              </TabList>
            </TabContext>
          </Box>

          {tab === 0 ? (
            <Box
              sx={{ marginY: 2, display: "flex", justifyContent: "flex-end" }}
            >
              <form onSubmit={handleSearchChef}>
                <TextField
                  id="chefName"
                  label="Search by Chef Name"
                  value={chefName}
                  variant="outlined"
                  size="small"
                  onChange={(ev) => {
                    setChefName(ev.target.value);
                    setOffsetChef(-2);
                  }}
                  inputProps={{ maxLength: 40 }}
                  sx={{ mb: 2 }}
                />

                <Button type="submit" variant="contained" sx={{ marginX: 2 }}>
                  Search
                </Button>
              </form>
            </Box>
          ) : (
            <Box
              sx={{ marginY: 2, display: "flex", justifyContent: "flex-end" }}
            >
              <Autocomplete
                id="combo-box-demo"
                size="small"
                clearOnBlur={false}
                options={cloudKitchens}
                getOptionLabel={(cloudKitchen) =>
                  `${cloudKitchen.cloudKitchenName}`
                }
                noOptionsText={
                  cloudKitchenName.length < 3
                    ? "Please enter atleast 3 characters"
                    : "No matching chefs found"
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
                  setOffsetCloud(0);
                  setOutletStatus(true);
                  if (reason === "clear") {
                    setShowLoadMoreCloud(true);
                    setCloudKitchens([]);
                  }
                }}
              />
            </Box>
          )}
          {tab === 0 && (
            <>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Home Chef Name
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Address
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Submitted On
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {homeChefsData.length === 0 && (
                <Typography
                  variant="bodyregular"
                  sx={{ textAlign: "center", mt: 2, backgroundColor: "#eee" }}
                >
                  No data found
                </Typography>
              )}

              {homeChefsData?.map((chef, idx) => (
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
                      <Typography sx={{ textAlign: "center" }}>
                        <Link
                          href={`/review-home-chef-application/${window.btoa(
                            chef.id
                          )}`}
                        >
                          {chef.chefName}
                        </Link>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ textAlign: "center" }}>
                        {chef.streetAddress}, {chef.locality}, {chef.city},{" "}
                        {chef.state}, {chef.country}, {chef.pincode}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {moment(chef.createdDate).format("DD/MM/YYYY")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {showLoadMoreChef && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={isChefDataFetching}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      m: 2,
                    }}
                    onClick={loadMoreChef}
                  >
                    Load More
                    {isChefDataFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}

          {tab === 1 && (
            <>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Restaurant - Outlet
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Address
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Submitted On
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {outletsData.length === 0 && (
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
                      <Typography sx={{ textAlign: "center" }}>
                        <Link
                          href={`/review-restaurant-application/${window.btoa(
                            chef.id
                          )}`}
                        >
                          {chef.cloudKitchenName}
                          {" - "}
                          {chef.outletName}
                        </Link>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ textAlign: "center" }}>
                        {chef.streetAddress}, {chef.locality}, {chef.city},{" "}
                        {chef.state}, {chef.country}, {chef.pincode}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {moment(chef.createdDate).format("DD/MM/YYYY")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {showLoadMoreCloud && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={isOutletsDataFetching}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      m: 2,
                    }}
                    onClick={loadMoreCloud}
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
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PendingGstApprovals;
