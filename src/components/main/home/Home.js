import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  ClickAwayListener,
  Grid,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState, useRef } from "react";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useSelector, useDispatch } from "react-redux";
import {
  getDistanceFromLatLonInKm,
  ratingsGroup,
} from "../../../common/common";
import { toast } from "react-toastify";
import "../../../App.css";
import Header from "../../general-components/ui-components/Header";
import { loginDrawer } from "../../../global/redux/actions";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies();
  const contentRef = useRef();
  const cuisineRefs = useRef([]);
  const trendingCuisineRefs = useRef([]);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [fetchNewToken, setFetchNewToken] = useState(true);

  const [chefData, setChefData] = useState([]);
  const [isChefDataFetching, setIsChefDataFetching] = useState(false);

  const [kilometers, setKilometers] = useState(null);

  const [isLoginConfirmModalOpen, setIsLoginConfirmModalOpen] = useState(false);

  const [maxDistReached, setMaxDistReached] = useState(false);
  const [trendingChefs, setTrendingChefs] = useState(null);

  const [preferenceCookies, setPreferenceCookies] = useState({});
  const [invokeChef, setInvokeChef] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showToolTip, setShowToolTip] = useState(-1);
  const [showToolTipTrending, setShowToolTipTrending] = useState(-1);

  window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setMaxDistReached(true);
    }
  };
  // console.log("window.scrollY ", window.scrollY, contentRef.current.scrollHeight);

  // handle scroll for append data
  const handleScroll = () => {
    const position = window.scrollY;
    const scrollHeight = contentRef.current.scrollHeight;
    const percent = parseInt(((position / scrollHeight) * 100).toFixed(0));
    setScrollPercent(percent);
  };
  // Add Favaorites
  const handleFavourite = async (id, chefType, favorite, idx) => {
    if (favorite === "Active") {
      let params = {
        homeChefId: chefType === "homeChef" ? id : null,
        cloudKitchenOutletId: chefType === "cloudKitchen" ? id : null,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.removeFavorite,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let copyChefdata = JSON.parse(JSON.stringify(chefData));
          let copyTrendata = JSON.parse(JSON.stringify(trendingChefs));

          let filtChefData = copyChefdata.filter(
            (el) => el.chefType === chefType && el.id === id
          );
          let filtTrendData = copyTrendata.filter(
            (el) => el.chefType === chefType && el.id === id
          );

          if (filtChefData.length > 0 && filtTrendData.length > 0) {
            let findIdxChef = copyChefdata.findIndex(
              (el) => el.id === filtChefData[0].id
            );
            copyChefdata[findIdxChef].isFavorite = "InActive";
            let findIdxTrendChef = copyTrendata.findIndex(
              (el) => el.id === filtTrendData[0].id
            );
            copyTrendata[findIdxTrendChef].isFavorite = "InActive";
            setTrendingChefs(copyTrendata);
            setChefData(copyChefdata);
          } else if (filtChefData.length > 0) {
            let findIdxChef = copyChefdata.findIndex(
              (el) => el.id === filtChefData[0].id
            );
            copyChefdata[findIdxChef].isFavorite = "InActive";
            setChefData(copyChefdata);
          } else if (filtTrendData.length > 0) {
            let findIdxTrendChef = copyTrendata.findIndex(
              (el) => el.id === filtTrendData[0].id
            );
            copyTrendata[findIdxTrendChef].isFavorite = "InActive";
            setTrendingChefs(copyTrendata);
          }

          toast.success("Removed from favourite list!!");
        } else {
          alert(
            "Something went wrong while removing from favourites list. Please try again later!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while removing from favourites list. Please try again later!!"
        );
      }
    } else {
      let params = {
        homeChefId: chefType === "homeChef" ? id : null,
        cloudKitchenOutletId: chefType === "cloudKitchen" ? id : null,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.addFavorite,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          let copyChefdata = JSON.parse(JSON.stringify(chefData));
          let copyTrendata = JSON.parse(JSON.stringify(trendingChefs));

          let filtChefData = copyChefdata.filter(
            (el) => el.chefType === chefType && el.id === id
          );
          let filtTrendData = copyTrendata.filter(
            (el) => el.chefType === chefType && el.id === id
          );

          if (filtChefData.length > 0 && filtTrendData.length > 0) {
            let findIdxChef = copyChefdata.findIndex(
              (el) => el.id === filtChefData[0].id
            );
            copyChefdata[findIdxChef].isFavorite = "Active";
            let findIdxTrendChef = copyTrendata.findIndex(
              (el) => el.id === filtTrendData[0].id
            );
            copyTrendata[findIdxTrendChef].isFavorite = "Active";
            setTrendingChefs(copyTrendata);
            setChefData(copyChefdata);
          } else if (filtChefData.length > 0) {
            let findIdxChef = copyChefdata.findIndex(
              (el) => el.id === filtChefData[0].id
            );
            copyChefdata[findIdxChef].isFavorite = "Active";
            setChefData(copyChefdata);
          } else if (filtTrendData.length > 0) {
            let findIdxTrendChef = copyTrendata.findIndex(
              (el) => el.id === filtTrendData[0].id
            );
            copyTrendata[findIdxTrendChef].isFavorite = "Active";
            setTrendingChefs(copyTrendata);
          }
          toast.success("Added to favourites list!!");
        } else {
          alert(
            "Something went wrong while adding to favourites list. Please try again later!"
          );
        }
      } else if (response.status === 400) {
        // Double click scenarios
        if (
          response.data.responseMessage ===
          "Already chef added to favourite list"
        ) {
          // Just ignore
        } else {
          alert(
            "Something went wrong while adding to favourites list. Please try again later!!"
          );
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while adding to favourites list. Please try again later!!"
        );
      }
    }
  };

  // On load
  useEffect(() => {
    document.title =
      config.documentTitle + " - by the Chefs, for the Foodies. Order food online in India.";
  }, []);

  // window scroll handler
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // When pref cookie data changes, update the state data, reset chefs data and invoke API again
  useEffect(() => {
    if (
      !!JSON.stringify(cookies[config.preferencesCookie]) &&
      JSON.stringify(preferenceCookies) !==
        JSON.stringify(cookies[config.preferencesCookie])
    ) {
      setPreferenceCookies(cookies[config.preferencesCookie]);

      setChefData([]);
      setKilometers(null);
      setScrollPercent(0);
      window.scrollTo(0, 0);
      setMaxDistReached(false);
      setTrendingChefs([]);
      setInvokeChef(true);
    }
  }, [cookies, preferenceCookies]);

  // Get chefs by lat, lng, and any filters if applied
  useEffect(() => {
    const getChefs = async () => {
      setIsChefDataFetching(true);
      let params = {
        latitude:
          cookies[config.preferencesCookie]?.deliveryAddress?.latitude ??
          cookies[config.preferencesCookie]?.deliveryAddress?.lat ??
          config.defaultMapLocation.latitude,
        longitude:
          cookies[config.preferencesCookie]?.deliveryAddress?.longitude ??
          cookies[config.preferencesCookie]?.deliveryAddress?.lng ??
          config.defaultMapLocation.longitude,
        orderType: cookies[config.preferencesCookie]?.orderType ?? "instant",
        preOrderDay:
          cookies[
            config.preferencesCookie
          ]?.preorderData?.preorderDayName?.split(",")[0] ?? null,
        deliverySlot:
          cookies[config.preferencesCookie]?.preorderData?.preorderSlot ?? null,
        chefType:
          cookies[config.preferencesCookie]?.filterData?.chefType ?? null,
        vegNonVeg:
          cookies[config.preferencesCookie]?.filterData?.vegNonVeg ?? null,
        nonVegTypes:
          cookies[config.preferencesCookie]?.filterData?.nonVegTypes ?? null,
        cuisineIds:
          cookies[config.preferencesCookie]?.filterData?.cuisinesData ?? null,
        spiceLevels:
          cookies[config.preferencesCookie]?.filterData?.spiceLevel ?? null,
        rating: cookies[config.preferencesCookie]?.filterData?.rating ?? null,
        minPrice:
          cookies[config.preferencesCookie]?.filterData?.minimumPrice ?? null,
        maxPrice:
          cookies[config.preferencesCookie]?.filterData?.maximumPrice ?? null,
        kms: kilometers,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getChefs,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          if (!response.data.chefs) {
            setMaxDistReached(true);
          } else {
            let chefResponse = response.data.chefs;
            chefResponse?.forEach((item) => {
              let dist = getDistanceFromLatLonInKm(
                cookies[config.preferencesCookie]?.deliveryAddress?.latitude ??
                  cookies[config.preferencesCookie]?.deliveryAddress?.lat,
                cookies[config.preferencesCookie]?.deliveryAddress?.longitude ??
                  cookies[config.preferencesCookie]?.deliveryAddress?.lng,
                item.latitude,
                item.longitude
              );
              item.distance = dist;
            });
            chefResponse?.sort((a, b) => a.distance - b.distance);

            if (invokeChef) {
              setChefData(chefResponse);
              setInvokeChef(false);
            } else {
              // In case of scroll scenario, append the new results
              setChefData((prev) => [...prev, ...chefResponse]);
            }
          }
          setKilometers(response.data.kms);
        } else {
          alert(
            "Something went wrong while fetching chefs. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching chefs. Please try again later!!"
        );
      }
      setIsChefDataFetching(false);
    };

    if (
      !maxDistReached &&
      !isChefDataFetching &&
      (invokeChef || scrollPercent > 60)
    ) {
      getChefs();
    }
    // }
  }, [
    maxDistReached,
    isChefDataFetching,
    scrollPercent,
    cookies,
    invokeChef,
    kilometers,
  ]);

  // get Trending Chefs
  useEffect(() => {
    const getTrendingChefs = async () => {
      let params = {};
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getTrendingChefs,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setTrendingChefs(response.data.chefs);
        } else {
          alert(
            "Something went wrong while fetching chefs. Please try again later!"
          );
        }
      } else {
        alert(
          "Something went wrong while fetching chefs. Please try again later!!"
        );
      }
    };

    if (maxDistReached) {
      // setMaxDistReached(false);
      getTrendingChefs();
    }
  }, [cookies, maxDistReached]);

  // Update cookie with new token every time a logged-in user visits home page
  useEffect(() => {
    const getNewToken = async () => {
      let params = {};
      let response = await invokeApi(
        config.apiDomains.userService + apiList.getNewToken,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setCookie(
            config.cookieName,
            JSON.stringify({
              token: response.data.token,
              loginUserId: cookies[config.cookieName].loginUserId,
            }),
            { path: "/", maxAge: 3000000, sameSite: "strict" }
          );
        } else {
          alert("Something went wrong");
        }
      } else {
        alert("Something went wrong");
      }
    };

    if (cookies[config.cookieName]?.loginUserId && fetchNewToken) {
      setFetchNewToken(false);
      getNewToken();
    }
  }, [cookies, setCookie, fetchNewToken]);

  return (
    <>
      <Header showAddress={true} showPreferences={true} showCuisines={true} />
      {/* Show Chef  main box*/}
      <Box
        ref={contentRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
          ml: "27px",
          mt: "25px",
        }}
      >
        {/* chef near u text  */}
        <Typography variant="header3">Chefs near you</Typography>
        {/* main box */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pr: 3,
            pb: 3,
            width: "calc(100% - 24px)",
          }}
        >
          <Grid container spacing={3}>
            {chefData?.map((el, idx) => (
              <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={idx}>
                {/* Single inner box */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "13px",
                    alignSelf: "stretch",
                    padding: "16px",
                    border: "1px solid #dfe2e6",
                    borderRadius: "13px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (el.chefType === "homeChef") {
                      navigate(
                        `/chef/${el.chefName.replace(/\s+/g, "-")}/${el.id}`
                      );
                    } else if (el.chefType === "cloudKitchen") {
                      navigate(
                        `/restaurant/${el.chefName.replace(/\s+/g, "-")}/${el.id}`
                      );
                    }
                  }}
                >
                  {/* Inner box image name and chef details */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      // alignItems: "center",
                      padding: "0px",
                      gap: "10px",
                      alignSelf: "stretch",
                      position: "relative",
                    }}
                  >
                    {/* Image */}
                    <Box
                      component="img"
                      sx={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "15px",
                        objectFit: "cover",
                        border: "1px solid #d3d3d3",
                      }}
                      src={el.profileImage}
                    />

                    {/* Ribbon tag */}
                    <Box
                      component="img"
                      sx={{
                        position: "absolute",
                        top: "64px",
                        left: "-7px",
                      }}
                      src={
                        el.chefType === "homeChef"
                          ? "/media/svg/home-chef-ribbon.svg"
                          : "/media/svg/restaurant-ribbon.svg"
                      }
                    />

                    {/* right div chef details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "0px",
                        gap: "15px",
                        flexGrow: 1,
                        width: `calc(100% - 100px - 10px)`, // image 100px; gap 10px;
                      }}
                    >
                      {/* chefName and favourite button */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0px",
                          gap: "10px",
                          alignSelf: "stretch",
                        }}
                      >
                        {/* Chef name text */}
                        <Typography
                          variant="header4"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {el.chefName}
                        </Typography>
                        {/* Favourite icon button */}
                        <Box
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (userData?.user) {
                              handleFavourite(
                                el.id,
                                el.chefType,
                                el.isFavorite,
                                idx
                              );
                            } else {
                              setIsLoginConfirmModalOpen(true);
                            }
                          }}
                          component="img"
                          sx={{
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                          }}
                          src={
                            el.isFavorite === "Active"
                              ? "/media/svg/favorite-selected.svg"
                              : "/media/svg/favorite.svg"
                          }
                        />
                      </Box>
                      {/* Rating and kilometers */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "0px",
                          gap: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Rating and star icon div */}
                        {el.noOfRatings >= 10 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "0px",
                              gap: "5px",
                              // width: "97.82px",
                              // height: "24px",
                              flex: "none",
                              order: "0",
                              flexGrow: "0",
                            }}
                          >
                            <Box
                              component="img"
                              sx={{
                                width: "16px",
                                height: "16px",
                              }}
                              src="/media/svg/rating.svg"
                            />
                            <Typography
                              variant="bodyparagraph"
                              sx={{ color: "#4D4D4D" }}
                            >
                              {el.averageRating.toFixed(1)} (
                              {ratingsGroup(el.noOfRatings)})
                            </Typography>
                          </Box>
                        )}

                        {/* Marker icon and kilometers  */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            padding: "0px",
                            gap: "5px",
                          }}
                        >
                          {/* Marker icon */}
                          <Box
                            component="img"
                            sx={{
                              width: "16px",
                              height: "16px",
                            }}
                            src="/media/svg/marker-filled.svg"
                          />
                          {/* Kilometer text */}
                          <Typography
                            variant="bodyparagraph"
                            sx={{ color: "#4D4D4D" }}
                          >
                            {!!el.distance ? el.distance : 0}km
                          </Typography>
                        </Box>
                      </Box>

                      {/* City and locality */}
                      <Typography
                        variant="bodyparagraph"
                        sx={{
                          color: "#4D4D4D",
                          width: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {el.locality + ", " + el.city}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Cuisines list of chef */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <Box
                      ref={(el) => (cuisineRefs.current[idx] = el)}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "0px",
                        gap: "10px",
                        height: "32px",
                        width: "calc(100% - 55px - 5px)", // 55px required for "See all" text; 5px for pl;
                        flexWrap: "wrap",
                        overflow: "hidden",
                      }}
                    >
                      {el.cuisines.map((cuis, idx2) => (
                        <Box
                          key={idx2}
                          sx={{
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            padding: "5px 9px",
                            gap: "10px",
                            // width: "59px",
                            // height: "30px",
                            background: "#FFFFFF",
                            border: "1px solid #535455",
                            borderRadius: "20px",
                          }}
                        >
                          <Typography
                            variant="bodymetatag"
                            sx={{ color: "#4D4D4D" }}
                          >
                            {cuis}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    {cuisineRefs.current[idx] &&
                      cuisineRefs.current[idx]?.clientHeight !==
                        cuisineRefs.current[idx]?.scrollHeight && (
                        <ClickAwayListener
                          onClickAway={() => setShowToolTip(-1)}
                        >
                          <Tooltip
                            arrow
                            placement="top"
                            PopperProps={{
                              disablePortal: true,
                            }}
                            onClose={() => setShowToolTip(-1)}
                            open={showToolTip === idx ? true : false}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title={
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "0px",
                                  background:
                                    "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                }}
                              >
                                {el.cuisines.map((cuis, idx3) => (
                                  <Box
                                    key={idx3}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      padding: "10px",
                                      gap: "10px",
                                    }}
                                  >
                                    <Typography
                                      variant="bodyregular"
                                      sx={{ color: "#FCFCFC" }}
                                    >
                                      {cuis}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            }
                          >
                            <Typography
                              variant="bodybold"
                              sx={{
                                fontSize: "17px",
                                background:
                                  "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                textFillColor: "transparent",
                                cursor: "pointer",
                                alignSelf: "center",
                                pl: "5px",
                              }}
                              onMouseOver={() => setShowToolTip(idx)}
                              onMouseLeave={() => setShowToolTip(-1)}
                              onClick={(ev) => {
                                setShowToolTip(idx);
                                ev.stopPropagation();
                              }}
                            >
                              See all
                            </Typography>
                          </Tooltip>
                        </ClickAwayListener>
                      )}
                  </Box>
                </Box>
              </Grid>
            ))}
            {/* </Box> */}
          </Grid>
        </Box>
      </Box>
      {isChefDataFetching && (
        <CircularProgress sx={{ margin: "auto", pY: 5 }} />
      )}
      {!isChefDataFetching && chefData?.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "22px",
            px: 4,
          }}
        >
          <Box component={"img"} src="/media/svg/chefs-not-found-graphic.svg" />
          <Typography
            variant="bodyparagraph"
            sx={{ textAlign: "center", pb: 2 }}
          >
            Sorry we couldn't find any chefs near you with current preferences.
            <br />
            You may want to try with different location or by modifying your
            preferences.
          </Typography>
        </Box>
      )}

      {/* Trending Chefs */}
      {trendingChefs?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "20px",
            ml: "27px",
            mt: "25px",
          }}
        >
          <Typography variant="header3">Trending chefs</Typography>
          {/* main box */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pr: 3,
              pb: 3,
              width: "calc(100% - 24px)",
            }}
          >
            <Grid container spacing={3}>
              {trendingChefs?.map((el, index) => (
                <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={index}>
                  {/* Single inner box */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      gap: "13px",
                      alignSelf: "stretch",
                      padding: "16px",
                      border: "1px solid #dfe2e6",
                      borderRadius: "13px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (el.chefType === "homeChef") {
                        navigate(
                          `/chef/${el.chefName.replace(/\s+/g, "-")}/${el.id}`
                        );
                      } else if (el.chefType === "cloudKitchen") {
                        navigate(
                          `/restaurant/${el.chefName.replace(/\s+/g, "-")}/${
                            el.id
                          }`
                        );
                      }
                    }}
                  >
                    {/* Inner box image name and chef details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        // alignItems: "center",
                        padding: "0px",
                        gap: "10px",
                        alignSelf: "stretch",
                        position: "relative",
                      }}
                    >
                      {/* Image */}
                      <Box
                        component="img"
                        sx={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "15px",
                          objectFit: "cover",
                          border: "1px solid #d3d3d3",
                        }}
                        src={el.profileImage}
                      />

                      {/* Ribbon tag */}
                      <Box
                        component="img"
                        sx={{
                          position: "absolute",
                          top: "64px",
                          left: "-7px",
                        }}
                        src={
                          el.chefType === "homeChef"
                            ? "/media/svg/home-chef-ribbon.svg"
                            : "/media/svg/restaurant-ribbon.svg"
                        }
                      />

                      {/* right div chef details */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "0px",
                          gap: "15px",
                          flexGrow: 1,
                          width: `calc(100% - 100px - 10px)`, // image 100px; gap 10px;
                        }}
                      >
                        {/* chefName and favourite button */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0px",
                            gap: "10px",
                            alignSelf: "stretch",
                          }}
                        >
                          {/* Chef name text */}
                          <Typography
                            variant="header4"
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {el.chefName}
                          </Typography>
                          {/* Favourite icon button */}
                          <Box
                            onClick={(ev) => {
                              ev.stopPropagation();
                              if (userData?.user) {
                                handleFavourite(
                                  el.id,
                                  el.chefType,
                                  el.isFavorite,
                                  index
                                );
                              } else {
                                setIsLoginConfirmModalOpen(true);
                              }
                            }}
                            component="img"
                            sx={{
                              width: "30px",
                              height: "30px",
                              cursor: "pointer",
                            }}
                            src={
                              el.isFavorite === "Active"
                                ? "/media/svg/favorite-selected.svg"
                                : "/media/svg/favorite.svg"
                            }
                          />
                        </Box>
                        {/* Rating and kilometers */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            padding: "0px",
                            gap: "20px",
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Rating and star icon div */}
                          {el.noOfRatings >= 10 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "0px",
                                gap: "5px",
                                // width: "97.82px",
                                // height: "24px",
                                flex: "none",
                                order: "0",
                                flexGrow: "0",
                              }}
                            >
                              <Box
                                component="img"
                                sx={{
                                  width: "16px",
                                  height: "16px",
                                }}
                                src="/media/svg/rating.svg"
                              />
                              <Typography
                                variant="bodyparagraph"
                                sx={{ color: "#4D4D4D" }}
                              >
                                {el.averageRating.toFixed(1)} (
                                {ratingsGroup(el.noOfRatings)})
                              </Typography>
                            </Box>
                          )}

                          {/* Marker icon and kilometers  */}
                          {/* <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            padding: "0px",
                            gap: "5px",
                          }}
                        > */}
                          {/* Marker icon */}
                          {/* <Box
                            component="img"
                            sx={{
                              width: "16px",
                              height: "16px",
                            }}
                            src="/media/svg/marker-filled.svg"
                          /> */}
                          {/* Kilometer text */}
                          {/* <Typography
                            variant="bodyparagraph"
                            sx={{ color: "#4D4D4D" }}
                          >
                            {!!el.distance ? el.distance : 0}km
                          </Typography> */}
                          {/* </Box> */}
                        </Box>

                        {/* City and locality */}
                        <Typography
                          variant="bodyparagraph"
                          sx={{
                            color: "#4D4D4D",
                            width: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {el.locality + ", " + el.city}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Cuisines list of chef */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <Box
                        ref={(el) => (trendingCuisineRefs.current[index] = el)}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "0px",
                          gap: "10px",
                          height: "32px",
                          width: "calc(100% - 55px - 5px)", // 55px required for "See all" text; 5px for pl;
                          flexWrap: "wrap",
                          overflow: "hidden",
                        }}
                      >
                        {el.cuisines.map((cuis, idx2) => (
                          <Box
                            key={idx2}
                            sx={{
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: "5px 9px",
                              gap: "10px",
                              // width: "59px",
                              // height: "30px",
                              background: "#FFFFFF",
                              border: "1px solid #535455",
                              borderRadius: "20px",
                            }}
                          >
                            <Typography
                              variant="bodymetatag"
                              sx={{ color: "#4D4D4D" }}
                            >
                              {cuis}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      {trendingCuisineRefs.current[index] &&
                        trendingCuisineRefs.current[index]?.clientHeight !==
                          trendingCuisineRefs.current[index]?.scrollHeight && (
                          <ClickAwayListener
                            onClickAway={() => setShowToolTipTrending(-1)}
                          >
                            <Tooltip
                              arrow
                              placement="top"
                              PopperProps={{
                                disablePortal: true,
                              }}
                              onClose={() => setShowToolTipTrending(-1)}
                              open={
                                showToolTipTrending === index ? true : false
                              }
                              disableFocusListener
                              disableHoverListener
                              disableTouchListener
                              title={
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    padding: "0px",
                                    background:
                                      "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                  }}
                                >
                                  {el.cuisines.map((cuis, idx3) => (
                                    <Box
                                      key={idx3}
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        padding: "10px",
                                        gap: "10px",
                                      }}
                                    >
                                      <Typography
                                        variant="bodyregular"
                                        sx={{ color: "#FCFCFC" }}
                                      >
                                        {cuis}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              }
                            >
                              <Typography
                                variant="bodybold"
                                sx={{
                                  fontSize: "17px",
                                  background:
                                    "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                  textFillColor: "transparent",
                                  cursor: "pointer",
                                  alignSelf: "center",
                                  pl: "5px",
                                }}
                                onMouseOver={() =>
                                  setShowToolTipTrending(index)
                                }
                                onMouseLeave={() => setShowToolTipTrending(-1)}
                                onClick={(ev) => {
                                  setShowToolTipTrending(index);
                                  ev.stopPropagation();
                                }}
                              >
                                See all
                              </Typography>
                            </Tooltip>
                          </ClickAwayListener>
                        )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* User confirmation login modal on an action, if not logged-in */}
      <Modal
        open={isLoginConfirmModalOpen}
        onClose={() => setIsLoginConfirmModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: 400,
          }}
        >
          <Card
            variant="outlined"
            sx={{ width: { xs: 300, sm: 400, md: 500 }, margin: "auto" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodyparagraph"
                sx={{ textAlign: "center", my: 1, py: 1 }}
              >
                You must login to perform this action!
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    dispatch(loginDrawer(true));
                    setIsLoginConfirmModalOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsLoginConfirmModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default Home;
