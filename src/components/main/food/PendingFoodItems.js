import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Link,
  Avatar,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Breadcrumbs,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { config } from "../../../config/config";
import { useSelector } from "react-redux";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import moment from "moment";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";

const PendingFoodItems = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);

  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [foodItems, setFoodItems] = useState([]);
  const [chefData, setChefData] = useState([]);
  const [chefId, setChefId] = useState(null);
  const [chefName, setChefName] = useState("");

  const [outletsData, setOutletsData] = useState([]);
  const [outlet, setOutlet] = useState("");
  const [outletId, setOutletId] = useState(null);
  const [outletStatus, setOutletStatus] = useState(false);

  const [cloudKitchens, setCloudKitchens] = useState([]);
  const [cloudKitchenName, setCloudKitchenName] = useState("");
  const [cloudKitchenId, setCloudKitchenId] = useState(null);

  const [invokeFoodItems, setInvokeFoodItems] = useState(true);

  const [isFoodListFetching, setIsFoodListFetching] = useState(true);
  const [loadMoreFetching, setLoadMoreFetching] = useState(false);

  const [showLoadMore, setShowLoadMore] = useState(true);

  const [offset, setOffset] = useState(0);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [switchOnStatus, setSwitchOnStatus] = useState(false);

  const limit = 10;

  const loadMore = () => {
    setOffset((curval) => curval + limit);
    setLoadMoreFetching(true);
    setInvokeFoodItems(true);
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Pending Food Items";
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
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      }
    }
  }, [userData, navigate]);

  // Get food list for chef
  useEffect(() => {
    const getFoodItems = async () => {
      let params = {
        approvalStatus: isSwitchOn ? null : "Pending",
        limit: limit,
        offset: offset,
        homeChefId: chefId ? chefId : null,
        cloudKitchenOutletId: outletId ? outletId : null,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getFoodItems,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (response.data.foodItems.length < 10) {
            setShowLoadMore(false);
          }
          setFoodItems((data) => [...data, ...response.data.foodItems]);
          setLoadMoreFetching(false);
          setIsFoodListFetching(false);
        } else {
          alert(
            "Something went wrong while fetching food items. Please try again later!"
          );
          setIsFoodListFetching(false);
          setLoadMoreFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching food items. Please try again later!!"
        );
        setIsFoodListFetching(false);
        setLoadMoreFetching(false);
      }
    };
    if (invokeFoodItems) {
      setInvokeFoodItems(false);
      getFoodItems();
    }
  }, [
    cookies,
    navigate,
    offset,
    outletId,
    isSwitchOn,
    invokeFoodItems,
    chefId,
  ]);

  // get home chefs on filter by name
  useEffect(() => {
    const getHomeChefs = async () => {
      let params = {
        limit: 20,
        chefName: chefName,
        sortBy: "chefName ASC",
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getHomeChefs,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setChefData(response.data.homeChefs);
        } else {
          alert(
            "Something went wrong while fetching home chefs. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching home chefs. Please try again later!!"
        );
      }
    };
    if (chefName.length >= 3) {
      getHomeChefs();
    }
  }, [cookies, navigate, chefName]);

  // Get names of cloud kitchen on filter by name
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

  // Get outlets data for a selected cloud kitchen
  useEffect(() => {
    const getOutletsData = async () => {
      let params = {
        limit: 100000,
        cloudKitchenId: cloudKitchenId,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getCloudKitchenOutlets,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOutletsData(response.data.cloudKitchenOutlets);
        } else {
          alert(
            "Something went wrong while fetching outlets data. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching outlets data. Please try again later!!"
        );
      }
    };
    if (outletStatus) {
      setOutletStatus(false);
      getOutletsData();
    }
  }, [cookies, navigate, outletStatus, cloudKitchenId]);

  return (
    <>
      <Header />
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
            <Typography color="inherit">Pending Food Items</Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Pending Food Items
          </Typography>

          {/* Filter options */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-end",
              my: 2,
            }}
          >
            {/* Filter by Home Chef */}
            <Autocomplete
              id="autocomplete-chefs"
              size="small"
              clearOnBlur={false}
              options={chefData}
              getOptionLabel={(chefData) => `${chefData.chefName}`}
              noOptionsText={
                chefName.length < 3
                  ? "Please enter atleast 3 characters"
                  : "No matching chefs found"
              }
              isOptionEqualToValue={(option, value) =>
                option.chefName === value.chefName
              }
              renderOption={(props, chefData) => (
                <Box component="li" {...props} key={chefData.id}>
                  {chefData.chefName}
                </Box>
              )}
              sx={{ width: 300, mr: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  value={chefName}
                  onChange={(ev) => {
                    setChefName(ev.target.value);
                  }}
                  label="Filter by Home Chef"
                />
              )}
              onChange={(ev, newValue, reason) => {
                setChefId(newValue?.id);
                setOutletId(null);
                setFoodItems([]);
                setOffset(0);
                setShowLoadMore(true);
                setIsFoodListFetching(true);
                setSwitchOnStatus(true);
                setInvokeFoodItems(true);

                if (reason === "clear") {
                  setChefId(null);
                  setSwitchOnStatus(false);
                  setIsSwitchOn(false);
                  setChefData([]);
                  setOutletsData([]);
                }
              }}
            />

            <Typography sx={{ m: 1 }}>or</Typography>

            <Autocomplete
              id="autocomplete-cloud"
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
                setCloudKitchenId(newValue?.id);
                setOutletStatus(true);
                if (reason === "clear") {
                  setOutletStatus(false);
                  setOutletId(null);
                  setSwitchOnStatus(false);
                  setIsSwitchOn(false);
                  setCloudKitchens([]);
                  setOutletsData([]);
                }
              }}
            />
          </Box>

          {outletsData?.length > 0 && (
            <Box
              sx={{
                marginY: 2,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <FormControl>
                <InputLabel id="demo-simple-select-label">Outlets</InputLabel>
                <Select
                  sx={{ width: 300, mr: 1 }}
                  size="small"
                  id="outlets"
                  value={outlet}
                  label="Outlets"
                  onChange={(ev, id) => {
                    setOutlet(ev.target.value);
                    setOutletId(id.props.id);
                    setChefId(null);
                    setFoodItems([]);
                    setOffset(0);
                    setShowLoadMore(true);
                    setIsFoodListFetching(true);
                    setSwitchOnStatus(true);
                    setInvokeFoodItems(true);
                    setChefName(""); //TODO::check why chef name is not clearing
                  }}
                >
                  {outletsData?.map((el) => (
                    <MenuItem key={el.id} id={el.id} value={el.outletName}>
                      {el.outletName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {switchOnStatus && (
            <FormControlLabel
              sx={{ float: "left" }}
              control={
                <Switch
                  checked={isSwitchOn}
                  onChange={(ev) => {
                    setIsSwitchOn(ev.target.checked);
                    setOffset(0);
                    setFoodItems([]);
                    setIsFoodListFetching(true);
                    setInvokeFoodItems(true);
                  }}
                />
              }
              label="Show all the food items under chef"
            />
          )}

          {isFoodListFetching ? (
            <CircularProgress sx={{ margin: "auto", mt: 5 }} />
          ) : (
            <>
              <Box sx={{ flexGrow: 1, mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Item Name
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Image
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", fontWeight: 700 }}
                    >
                      Status
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

              {foodItems?.map((el, idx) => (
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
                      <Typography
                        sx={{ textAlign: "center", cursor: "pointer" }}
                      >
                        <Link href={`/review-food-item/${window.btoa(el.id)}`}>
                          {el.itemName}
                        </Link>
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Avatar
                        alt="food_img"
                        src={el.image1}
                        sx={{ width: 80, height: 80 }}
                        variant="square"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={2}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Chip
                        label={el.status}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor:
                            el.status === "Active"
                              ? "#76BA99"
                              : el.status === "Pending"
                              ? "orange"
                              : "#F87474",
                        }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {moment(el.createdDate).format("DD/MM/YYYY")}
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
                    variant="outlined"
                    size="small"
                    disabled={loadMoreFetching}
                    sx={{
                      display: "flex",
                      flexDirection: "row",

                      alignItems: "flex-start",
                      m: 2,
                    }}
                    onClick={loadMore}
                  >
                    Load More
                    {loadMoreFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}
          {foodItems.length === 0 && (
            <Typography sx={{ textAlign: "center", mt: 2 }}>
              No data Found
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PendingFoodItems;
