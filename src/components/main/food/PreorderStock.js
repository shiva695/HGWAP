import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  // Tab,
  TextField,
  Typography,
} from "@mui/material";
// import TabContext from "@mui/lab/TabContext";
// import TabList from "@mui/lab/TabList";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";

const PreorderStock = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const {
    outletData,
    outletError,
    logout: outletLogout,
  } = globalState.outletReducer;

  // const [preorderSlots, setPreorderSlots] = useState([]);
  // const [isPreorderSlotsFetching, setIsPreorderSlotsFetching] = useState(false);
  const [isFoodListFetching, setIsFoodListFetching] = useState(false);
  const [isUpdateCapacityFetching, setIsUpdateCapacityFetching] =
    useState(false);
  const [isMaxCapacityFetching, setIsMaxCapacityFetching] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [foodItemStatus, setFoodItemsStatus] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState([]);

  const [dayName, setDayName] = useState("Monday");
  const [slot, setSlot] = useState("7am - 8am");

  const [updatedMaxCapacity, setUpdatedMaxCapacity] = useState([]);

  const dayNameFormat = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
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

  const [showOutlets, setShowOutlets] = useState(false);

  const limit = 1000000;

  const handleCapacityChange = (ev, indx) => {
    let val = ev.target.value.replace(/\D/g, "");
    let copy = [...updatedMaxCapacity];
    copy[indx].maxCapacity = val !== "" ? parseInt(val) : "";
    setUpdatedMaxCapacity(copy);
  };

  // // update get max capacity
  const updateMaxCapacity = async () => {
    setIsUpdateCapacityFetching(true);
    let params = {
      maxCapacityData: updatedMaxCapacity,
      dayName,
      deliverySlot: slot,
      cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
    };
    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateMaxCapacity,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setIsUpdateCapacityFetching(false);
        toast.success("Updated successfully!!");
      } else {
        alert(
          "Something went wrong while updating max capacity data. Please try again later!"
        );
      }
      setIsUpdateCapacityFetching(false);
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating max capacity data. Please try again later!!"
      );
      setIsUpdateCapacityFetching(false);
    }
  };

  useEffect(() => {
    document.title = config.documentTitle + " | Preorder Stock Management";
  }, []);

  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        if (cookies[config.preferencesCookie].outletData) {
          setFoodItemsStatus(true);
          setShowOutlets(true);
        }
      } else if (
        userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
        userData?.user.roles.indexOf("Outlet Manager") >= 0 ||
        userData?.user.roles.indexOf("Chef Manager") >= 0
      ) {
        setFoodItemsStatus(true);
        setShowOutlets(false);
      } else {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      }
    }
  }, [userData, outletData, navigate, dispatch, cookies]);

  // On failure of outlet data fetch
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
    if (foodItemStatus) {
      setFoodItemsStatus(false);
      getFoodList();
    }
  }, [cookies, navigate, foodItemStatus, outletData]);

  // Get Max capacity
  useEffect(() => {
    setIsMaxCapacityFetching(true);
    const getMaxCapacity = async () => {
      let params = {
        dayName: dayName,
        deliverySlot: slot,
        limit: limit,
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      };
      let response = await invokeApi(
        config.apiDomains.foodService + apiList.getMaxCapacity,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setMaxCapacity(response.data.maxCapacityData);
          setIsMaxCapacityFetching(false);
        } else {
          alert(
            "Something went wrong while fetching max capacity. Please try again later!"
          );
          setIsMaxCapacityFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching max capacity. Please try again later!!"
        );
        setIsMaxCapacityFetching(false);
      }
    };

    if (slot && dayName) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        if (!!cookies[config.preferencesCookie].outletData) {
          getMaxCapacity();
        }
      } else if (
        userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
        userData?.user.roles.indexOf("Outlet Manager") >= 0 ||
        userData?.user.roles.indexOf("Chef Manager") >= 0
      ) {
        getMaxCapacity();
      }
    }
  }, [cookies, navigate, slot, dayName, outletData, userData]);

  useEffect(() => {
    // Group food items by categories and sort by category rank order.
    let groupedFoodItems = foodItems
      ?.sort((a, b) => a.categoryRankOrder - b.categoryRankOrder)
      ?.sort((a, b) => a.itemRankOrder - b.itemRankOrder)
      .reduce((group, product) => {
        const { category } = product;
        group[category] = group[category] ?? [];
        group[category].push(product);
        return group;
      }, {});

    // Sort food items by item rank order under each category
    // TODO:: check this food have correct sort order compared to food items
    let sortedFoodItems = [];
    Object.values(groupedFoodItems)
      // ?.sort((a, b) => a.itemRankOrder - b.itemRankOrder)
      .map((el) => {
        return el.map((elm) =>
          sortedFoodItems.push({
            foodItemId: elm.id,
            name: elm.itemName,
            dayName: dayName,
            deliverySlot: slot,
            maxCapacity: parseInt(0),
          })
        );
      });

    // set initial max capacity data
    maxCapacity?.forEach((el) => {
      let findIndex = sortedFoodItems?.findIndex(
        (x) => x.foodItemId === el.foodItemId
      );
      if (findIndex > -1) {
        sortedFoodItems[findIndex].maxCapacity = parseInt(el.maxCapacity);
        sortedFoodItems[findIndex].id = el.id;
      }
    });
    setUpdatedMaxCapacity(sortedFoodItems);
  }, [dayName, slot, maxCapacity, foodItems]);

  return (
    <>
      <Header showOutlets={showOutlets} />
      <Card
        variant="outlined"
        sx={{ maxWidth: "600px", margin: "auto", my: 3, p: 1 }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" sx={{ textAlign: "center", mb: 1 }}>
            Preorder Stock Management
          </Typography>

          {cookies[config.preferencesCookie].outletData && (
            <Box sx={{ my: 2 }}>
              <Typography>
                Restaurant Name:{" "}
                {cookies[config.preferencesCookie].outletData.cloudKitchenName}
              </Typography>
              <Typography>
                Outlet Name:{" "}
                {cookies[config.preferencesCookie].outletData.outletName}
              </Typography>
            </Box>
          )}

          {/* Dayname Tabs */}
          {/* <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="body1" sx={{ mr: 1, fontWeight: 500 }}>
              Day:{" "}
            </Typography>
            <TabContext value={dayName} sx={{ alignItems: "left" }}>
              <TabList
                variant="scrollable"
                onChange={(ev, newValue) => setDayName(newValue)}
              >
                {dayTab.map((el, idx) => (
                  <Tab
                    key={idx}
                    sx={{ border: "1px solid lightGrey" }}
                    label={el.label}
                    value={el.value}
                  />
                ))}
              </TabList>
            </TabContext>
          </Box> */}

          {/* Slot Tabs */}
          {/* <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              bgcolor: "background.paper",
              mt: 2,
            }}
          >
            <Typography variant="body1" sx={{ m1: 2, fontWeight: 500 }}>
              Slot:{" "}
            </Typography>

            <TabContext value={slot}>
              <TabList
                variant="scrollable"
                onChange={(ev, newValue) => setSlot(newValue)}
              >
                {preorderSlots?.map((el, idx) => (
                  <Tab
                    key={idx}
                    sx={{ border: "1px solid lightGrey" }}
                    label={el.slot}
                    value={el.id}
                  />
                ))}
              </TabList>
            </TabContext>
          </Box> */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "28px",
            }}
          >
            <FormControl sx={{ width: "120px" }} variant="standard">
              <InputLabel id="start-time">Day</InputLabel>
              <Select
                labelId="dayname"
                id="dayname"
                value={dayName}
                label="Day"
                onChange={(ev) => {
                  setDayName(ev.target.value);
                }}
              >
                {dayNameFormat?.map((el, idx) => (
                  <MenuItem key={idx} value={el}>
                    {el}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: "120px" }} variant="standard">
              <InputLabel id="end-time">Delivery Slot</InputLabel>
              <Select
                labelId="deliverySlot"
                id="deliverySlot"
                value={slot}
                label="Delivery Slot"
                onChange={(ev) => {
                  setSlot(ev.target.value);
                }}
              >
                {slotFormat?.map((el, idx) => (
                  <MenuItem key={idx} value={el}>
                    {el}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Food Items list with capacity data */}
          {isFoodListFetching ||
          isMaxCapacityFetching ? (
            <CircularProgress sx={{ margin: "auto", my: 2 }} />
          ) : (
            <>
              <Accordion defaultExpanded sx={{ mt: 2 }}>
                <AccordionDetails>
                  {updatedMaxCapacity?.map((foodItem, indx) => (
                    <Box
                      key={indx}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid lightGrey",
                        m: 1,
                        p: 1,
                      }}
                    >
                      <Typography variant="body1">{foodItem.name}</Typography>
                      <TextField
                        variant="outlined"
                        autoComplete="off"
                        sx={{ width: 100 }}
                        inputProps={{
                          maxLength: 5,
                          style: { textAlign: "right" },
                        }}
                        size="small"
                        value={foodItem.maxCapacity}
                        onChange={(ev) => handleCapacityChange(ev, indx)}
                      />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </>
          )}
          <CardActions
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={updateMaxCapacity}
              disabled={isUpdateCapacityFetching || foodItems.length === 0}
            >
              Submit
              {isUpdateCapacityFetching ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <></>
              )}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </>
  );
};

export default PreorderStock;
