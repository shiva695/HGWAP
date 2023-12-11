import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Link,
  FormControlLabel,
  Switch,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { getChef, getOutlet } from "../../../global/redux/actions";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";

const FoodItems = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { chefData, chefError, logout: chefLogout } = globalState.chefReducer;
  const { userData } = globalState.userReducer;
  const {
    outletData,
    outletError,
    logout: outletLogout,
  } = globalState.outletReducer;

  const [isLoading, setIsLoading] = useState(true);
  const [isFoodListFetching, setIsFoodListFetching] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [invokeFoodItems, setInvokeFoodItems] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkAvailForAll, setCheckAvailForAll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [ownerByManger, setOwnerByManager] = useState(null);

  const [showOutlets, setShowOutlets] = useState(false);

  let outletCookie = cookies[config.preferencesCookie]?.outletData;

  const limit = 1000000;

  // Group food items by categories.
  let groupedFoodItems = foodItems
    ?.sort((a, b) => a.categoryRankOrder - b.categoryRankOrder)
    .reduce((group, product) => {
      const { category } = product;
      group[category] = group[category] ?? [];
      group[category].push(product);
      return group;
    }, {});

  // change availability of a food item
  const handleAvailabilityChange = async (catgegoryIdx, itemIdx) => {
    let curAvail = groupedFoodItems[catgegoryIdx][itemIdx].currentAvailability;
    let newAvailability = curAvail === "On" ? "Off" : "On";

    groupedFoodItems[catgegoryIdx][itemIdx].currentAvailability =
      newAvailability;
    let params = {
      id: groupedFoodItems[catgegoryIdx][itemIdx].id,
      currentAvailability: newAvailability,
    };
    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateAvailability,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setCheckAvailForAll(true);
      } else {
        alert(
          "Something went wrong while updating food item availability. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating food item availability. Please try again later!!"
      );
    }
  };

  // update availabilty for all
  const updateAvailabilityForAll = async (checkedAll) => {
    let params = {
      currentAvailability: checkedAll ? "On" : "Off",
      cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
    };
    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateAvailabilityForAll,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setInvokeFoodItems(true);
      } else {
        alert(
          "Something went wrong while updating food items availability. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating food items availability. Please try again later!!"
      );
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Food Items";
  }, []);

  // get chef data, and outlet data if not available
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        if (cookies[config.preferencesCookie].outletData) {
          setInvokeFoodItems(true);
          setShowOutlets(true);
          setIsLoading(false);
        }
      } else if (userData?.user.roles.indexOf("Home Chef Owner") >= 0) {
        if (!chefData) {
          dispatch(
            getChef({ id: cookies[config.cookieName].loginUserId, cookies })
          );
        } else {
          setInvokeFoodItems(true);
          setShowOutlets(false);
          setIsLoading(false);
        }
      } else if (
        userData?.user.roles.indexOf("Outlet Manager") >= 0 ||
        userData?.user.roles.indexOf("Chef Manager") >= 0
      ) {
        setInvokeFoodItems(true);
        setIsLoading(false);
      } else {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      }
    }
  }, [chefData, dispatch, cookies, userData, navigate]);

  // On failure of chef data fetch
  useEffect(() => {
    if (chefError) {
      alert(
        "Something went wrong while fetching chef details. Please try again later!"
      );
    }
  }, [chefError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (chefLogout) {
      navigate("/logout");
    }
  }, [chefLogout, navigate]);

  // Get food items list
  useEffect(() => {
    const getFoodList = async () => {
      setIsFoodListFetching(true);
      let params = {
        limit,
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getFoodItems,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setFoodItems(response.data.foodItems);
          setIsFoodListFetching(false);
          setCheckAvailForAll(true);
        } else {
          alert(
            "Something went wrong while fetching food items. Please try again later!"
          );
          setIsFoodListFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching food items. Please try again later!!"
        );
        setIsFoodListFetching(false);
      }
    };
    if (invokeFoodItems) {
      setInvokeFoodItems(false);
      getFoodList();
    }
  }, [cookies, navigate, invokeFoodItems]);

  // to check if all items are available, so that Availability for all can be set to true
  useEffect(() => {
    const checkAvail = () => {
      let avail = true;
      Object.keys(groupedFoodItems).forEach((key) => {
        let filtData = groupedFoodItems[key].filter(
          (el) => el.status === "Active" && el.currentAvailability === "Off"
        );
        if (filtData.length > 0) {
          avail = false;
        }
      });
      setChecked(avail);
    };

    if (checkAvailForAll) {
      setCheckAvailForAll(false);
      checkAvail();
    }
  }, [checkAvailForAll, groupedFoodItems]);

  //  get chef owner by manager.
  useEffect(() => {
    const getChefOwnerByManager = async () => {
      let params = {};
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefOwnerByManager,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOwnerByManager(response.data.chefOwner);
          setIsLoading(false);
        } else {
          alert(
            "Something went wrong while fetching owner details. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching owner details. Please try again later!!"
        );
      }
    };
    if (
      userData?.user.roles.indexOf("Chef Manager") >= 0 ||
      userData?.user.roles.indexOf("Outlet Manager") >= 0
    ) {
      getChefOwnerByManager();
    }
  }, [cookies, navigate, userData]);

  // calling outlet for button handling;
  useEffect(() => {
    if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
      dispatch(
        getOutlet({
          id: outletCookie?.id,
          cookies,
        })
      );
    }
  }, [cookies, dispatch, outletCookie, userData]);

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

  return (
    <>
      <Header showOutlets={showOutlets} />
      {isLoading || isFoodListFetching ? (
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
            <Box>
              <Typography variant="h4" sx={{ textAlign: "center" }}>
                Food Items
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
                      navigate(`/sort-food-items`);
                    }}
                  >
                    Sort Food Items
                  </MenuItem>
                </Menu>
              </Typography>
            </Box>

            {chefData?.homeChef && (
              <>
                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={chefData?.homeChef.status !== "Active"}
                    onClick={() => navigate("/add-food-item")}
                    sx={{ float: "right", mt: 1 }}
                  >
                    New Food Item
                  </Button>
                </Box>
                <Box>
                  {chefData?.homeChef.status !== "Active" && (
                    <Typography variant="bodyregular" sx={{ mt: 1 }}>
                      Your chef application status is{" "}
                      {chefData?.homeChef.status}. You can create food items
                      only after the status becomes Active.
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {ownerByManger !== null && (
              <>
                {ownerByManger?.cloudKitchenOutletStatus && (
                  <Box sx={{ mt: 2 }}>
                    <Typography>
                      Restaurant Name: {ownerByManger?.cloudKitchenName}
                    </Typography>
                    <Typography>
                      Outlet Name: {ownerByManger?.outletName}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={
                      ownerByManger?.homeChefStatus !== "Active" &&
                      ownerByManger?.cloudKitchenOutletStatus !== "Active"
                    }
                    onClick={() => navigate("/add-food-item")}
                    sx={{ float: "right", mt: 2 }}
                  >
                    New Food Item
                  </Button>
                </Box>
                <Box>
                  {ownerByManger?.homeChefStatus !== "Active" &&
                    ownerByManger?.cloudKitchenOutletStatus !== "Active" && (
                      <Typography variant="bodyregular" sx={{ mt: 1 }}>
                        Your chef application status is{" "}
                        {ownerByManger?.homeChefStatus ||
                          ownerByManger?.cloudKitchenOutletStatus}
                        . You can create food items only after the status
                        becomes Active.
                      </Typography>
                    )}
                </Box>
              </>
            )}

            {cookies[config.preferencesCookie].outletData && (
              <>
                <Box sx={{ mt: 2 }}>
                  <Typography>
                    Restaurant Name:{" "}
                    {
                      cookies[config.preferencesCookie].outletData
                        .cloudKitchenName
                    }
                  </Typography>
                  <Typography>
                    Outlet Name:{" "}
                    {cookies[config.preferencesCookie].outletData.outletName}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={
                      outletData?.cloudKitchenOutlet.status !== "Active"
                    }
                    onClick={() => {
                      navigate(`/add-food-item`);
                    }}
                    sx={{ float: "right", mt: 2 }}
                  >
                    New Food Item
                  </Button>
                </Box>
                <Box>
                  {outletData?.cloudKitchenOutlet?.status !== "Active" && (
                    <Typography variant="bodyregular" sx={{ mt: 1 }}>
                      Your Outlet application status is{" "}
                      {outletData?.cloudKitchenOutlet?.status}. You can create
                      food items only after the status becomes Active.
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {foodItems.length === 0 && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No food items created yet
              </Typography>
            )}

            {/* show the ALL switch only if we have atleast one active food item */}
            {foodItems?.some((el) => el.status === "Active") && (
              <FormControlLabel
                sx={{ justifyContent: "flex-end", mt: 2 }}
                control={
                  <Switch
                    checked={checked}
                    onChange={(ev) => {
                      setChecked(ev.target.checked);
                      updateAvailabilityForAll(ev.target.checked);
                    }}
                  />
                }
                label={checked ? "Turn OFF All" : "Turn ON All"}
              />
            )}
            {Object.values(groupedFoodItems)?.map((el, idx) => (
              <Accordion defaultExpanded key={idx} sx={{ mt: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="food-item-content"
                  id="food-item-header"
                >
                  <Typography variant="h6">{el[0].category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {el
                    .sort((a, b) => a.itemRankOrder - b.itemRankOrder)
                    .map((foodItem, indx) => (
                      <Box
                        key={indx}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          border: "1px solid lightGrey",
                          m: 1,
                          p: 2,
                        }}
                      >
                        <Link
                          variant="body1"
                          sx={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/food-item/${btoa(foodItem.id)}`)
                          }
                        >
                          {foodItem.itemName}
                        </Link>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Chip
                            label={foodItem.status}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor:
                                foodItem.status === "Active"
                                  ? "#76BA99"
                                  : foodItem.status === "Pending"
                                  ? "orange"
                                  : "#F87474",
                            }}
                          />

                          {foodItem.status === "Active" && (
                            <FormControlLabel
                              sx={{ justifyContent: "flex-end" }}
                              control={
                                <Switch
                                  checked={
                                    foodItem.currentAvailability === "On"
                                      ? true
                                      : false
                                  }
                                  onChange={() => {
                                    handleAvailabilityChange(
                                      el[0].category,
                                      indx
                                    );
                                  }}
                                />
                              }
                              label={
                                foodItem.currentAvailability === "On"
                                  ? "Turn OFF"
                                  : "Turn ON"
                              }
                            />
                          )}
                        </Box>
                      </Box>
                    ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FoodItems;
