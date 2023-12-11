import { ArrowCircleUp } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import Header from "../../general-components/ui-components/Header";

const FoodItemsSort = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [isFoodListFetching, setIsFoodListFetching] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [foodItemsStatus, setFoodItemsStatus] = useState(false);
  const [sortedFoodItems, setSortedFoodItems] = useState([]);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [isUpdateRankOrderFetching, setIsUpdateRankOrderFetching] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOutlets, setShowOutlets] = useState(false);

  const limit = 1000000;

  const rearrangeCategories = (categoryIdx) => {
    let categories = JSON.parse(JSON.stringify(sortedFoodItems));
    categories[categoryIdx].forEach((foodItem) => {
      foodItem.categoryRankOrder = categoryIdx;
    });
    categories[categoryIdx - 1].forEach((foodItem) => {
      foodItem.categoryRankOrder = categoryIdx + 1;
    });
    [categories[categoryIdx - 1], categories[categoryIdx]] = [
      categories[categoryIdx],
      categories[categoryIdx - 1],
    ];
    setSortedFoodItems(categories);
    setSaveEnabled(true);
  };

  const rearrangeItems = (categoryIdx, itemIdx) => {
    let categories = JSON.parse(JSON.stringify(sortedFoodItems));
    categories[categoryIdx][itemIdx].itemRankOrder = itemIdx;
    categories[categoryIdx][itemIdx - 1].itemRankOrder = itemIdx + 1;
    [categories[categoryIdx][itemIdx - 1], categories[categoryIdx][itemIdx]] = [
      categories[categoryIdx][itemIdx],
      categories[categoryIdx][itemIdx - 1],
    ];
    setSortedFoodItems(categories);
    setSaveEnabled(true);
  };

  const updateRankOrder = async () => {
    setIsUpdateRankOrderFetching(true);
    let params = [];
    sortedFoodItems.forEach((category) => {
      category.forEach((foodItem) => {
        params.push({
          id: foodItem.id,
          categoryRankOrder: foodItem.categoryRankOrder,
          itemRankOrder: foodItem.itemRankOrder,
          category: foodItem.category,
          itemName: foodItem.itemName,
        });
      });
    });

    let response = await invokeApi(
      config.apiDomains.foodService + apiList.updateRankOrder,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Saved successfully!!");
        navigate("/food-items");
      } else {
        alert(
          "Something went wrong while updating sort order. Please try again later!"
        );
        setIsUpdateRankOrderFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating sort order. Please try again later!!"
      );
      setIsUpdateRankOrderFetching(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Sort Food Items";
  }, []);

  // get user Data, if not exists
  // if logged-in user is Cloud Kitchen Owner, check if we have outlet id.
  // Redirect to Outlets list page, if not.
  useEffect(() => {
    if (userData?.user) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
        if (cookies[config.preferencesCookie].outletData) {
          setFoodItemsStatus(true);
          setShowOutlets(true);
          setIsLoading(false);
        }
      } else {
        if (
          userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
          userData?.user.roles.indexOf("Outlet Manager") >= 0 ||
          userData?.user.roles.indexOf("Chef Manager") >= 0
        ) {
          setFoodItemsStatus(true);
          setShowOutlets(false);
          setIsLoading(false);
        } else {
          toast.warning(config.unauthorizedWarning);
          navigate("/");
        }
      }
    }
  }, [dispatch, cookies, userData, navigate]);

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
    if (foodItemsStatus) {
      setFoodItemsStatus(false);
      getFoodList();
    }
  }, [cookies, navigate, foodItemsStatus]);

  // Sort food items list by rank orders
  useEffect(() => {
    let foodItemsGrouped = foodItems
      ?.sort((a, b) => a.categoryRankOrder - b.categoryRankOrder)
      .reduce((group, product) => {
        const { category } = product;
        group[category] = group[category] ?? [];
        group[category].push(product);
        return group;
      }, {});

    let foodItemsSorted = [];
    Object.values(foodItemsGrouped)?.forEach((category) => {
      foodItemsSorted.push(category);
    });

    foodItemsSorted.forEach((category, idx) => {
      category
        .sort((a, b) => a.itemRankOrder - b.itemRankOrder)
        .forEach((foodItem, indx) => {
          foodItemsSorted[idx][indx].categoryRankOrder = idx + 1;
          foodItemsSorted[idx][indx].itemRankOrder = indx + 1;
        });
    });

    setSortedFoodItems(foodItemsSorted);
  }, [foodItems]);

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
              <Typography color="inherit">Sort Food Items</Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ textAlign: "center", mt: 3 }}>
              Sort Food Items
            </Typography>
            <Typography
              variant="bodyregular"
              sx={{ textAlign: "center", mb: 2 }}
            >
              Click on the "Move Up" buttons against the Category or the Food
              Item to rearrange them
            </Typography>

            {sortedFoodItems.length === 0 && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No food items created yet
              </Typography>
            )}

            {sortedFoodItems.map((el, idx) => (
              <Box
                key={idx}
                sx={{
                  m: 2,
                  p: 2,
                  border: "1px solid lightGrey",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">{el[0].category}</Typography>
                  {idx > 0 && (
                    <Box sx={{ mr: 4 }}>
                      <Tooltip title="Move Up">
                        <IconButton
                          sx={{ p: 0, color: "#FE554A" }}
                          onClick={() => rearrangeCategories(idx)}
                        >
                          <ArrowCircleUp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
                {el.map((foodItem, indx) => (
                  <Box
                    key={indx}
                    sx={{
                      m: 2,
                      p: 2,
                      border: "1px solid lightGrey",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{foodItem.itemName}</Typography>
                    {indx > 0 && (
                      <Tooltip title="Move Up">
                        <IconButton
                          sx={{ p: 0, color: "#F28C0E" }}
                          onClick={() => rearrangeItems(idx, indx)}
                        >
                          <ArrowCircleUp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              mr: 3,
              mb: 2,
            }}
          >
            {saveEnabled && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/food-items")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={isUpdateRankOrderFetching}
                  onClick={() => updateRankOrder()}
                >
                  Save
                  {isUpdateRankOrderFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      )}
    </>
  );
};

export default FoodItemsSort;
