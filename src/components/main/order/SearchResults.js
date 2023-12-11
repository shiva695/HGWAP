import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useParams, useNavigate } from "react-router-dom";
import { getDistanceFromLatLonInKm } from "../../../common/common";
import Header from "../../general-components/ui-components/Header";

const SearchResults = () => {
  const navigate = useNavigate();
  const { name: food } = useParams();
  const [cookies] = useCookies();
  const [invokeSearchResults, setInvokeSearchResults] = useState(true);
  const [isSearchResultsFetching, setIsSearchResultsFetching] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  // getSearchResults
  useEffect(() => {
    const getSearchResults = async () => {
      let params = {
        foodItemName: food.replace(/-/g, " "),
        city: cookies[config.preferencesCookie]?.deliveryAddress?.city,
        state: cookies[config.preferencesCookie]?.deliveryAddress?.state,
      };
      let response = await invokeApi(
        config.apiDomains.orderService + apiList.getSearchResults,
        params,
        cookies
      );

      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setSearchResults(
            response.data.searchResults?.reduce((group, product) => {
              const { chefName } = product;
              group[chefName] = group[chefName] ?? [];
              group[chefName].push(product);
              return group;
            }, {})
          );
          setIsSearchResultsFetching(false);
        } else {
          alert(
            "Something went wrong while searching food item. Please try again later!"
          );
          setIsSearchResultsFetching(false);
        }
      } else {
        alert(
          "Something went wrong while searching food item. Please try again later!"
        );
        setIsSearchResultsFetching(false);
      }
    };
    if (invokeSearchResults) {
      setInvokeSearchResults(false);
      getSearchResults();
    }
  }, [cookies, invokeSearchResults, food]);

  return (
    <div>
      <Header />

      {/* Food items box */}
      {isSearchResultsFetching ? (
        <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
          <CircularProgress sx={{ display: "flex", margin: "auto" }} />
        </Box>
      ) : (
        <Box
          sx={{
            // display: "flex",
            // flexDirection: "row",
            // alignItems: "flex-start",
            padding: "0px",
            mx: "27px",
            mt: "29px",
            // flexWrap: "wrap",
            // gap: "30px",
          }}
        >
          {Object.values(searchResults)?.length > 0 && (
            <Typography variant="header2">
              {Object.values(searchResults)?.length} Results found for “{food}”
            </Typography>
          )}

          <Grid item>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0px 0px 20px",
                gap: "16px",
              }}
            >
              {Object.values(searchResults)?.length > 0 ? (
                <>
                  {Object.values(searchResults)?.map((el, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "90%",
                        background: "#FCFCFC",
                        border: "1px solid #DFE2E6",
                        borderRadius: "20px",
                        padding: "20px",
                        cursor: "pointer",
                        gap: "21px",
                      }}
                      onClick={() => {
                        if (el[0].chefType === "homeChef") {
                          navigate(
                            `/chef/${el[0].chefName.replace(/\s+/g, "-")}/${
                              el[0].chefId
                            }`
                          );
                        } else if (el[0].chefType === "cloudKitchen") {
                          navigate(
                            `/restaurant/${el[0].chefName.replace(/\s+/g, "-")}/${
                              el[0].chefId
                            }`
                          );
                        }
                      }}
                    >
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
                          }}
                          src={el[0].profileImage}
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
                            el[0].chefType === "homeChef"
                              ? "/media/svg/home-chef-ribbon.svg"
                              : "/media/svg/cloud-kitchen-ribbon.svg"
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
                              {el[0].chefName}
                            </Typography>
                            {/* Favourite icon button */}
                            {/* <Box
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
                            /> */}
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
                            {/* {el.noOfRatings >= 10 && (
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
                          )} */}

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
                                {getDistanceFromLatLonInKm(
                                  cookies[config.preferencesCookie]
                                    ?.deliveryAddress?.latitude,
                                  cookies[config.preferencesCookie]
                                    ?.deliveryAddress?.longitude,
                                  el[0].latitude,
                                  el[0].longitude
                                )}{" "}
                                Km
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      {/* Food list */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "15px",
                        }}
                      >
                        {el[0].foodItems.map((item, indx) => (
                          <Box
                            key={indx}
                            sx={{
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "20px",
                              gap: "9px",
                              width: "320px",
                              background: "#FCFCFC",
                              border: "1px solid #DFE2E6",
                              borderRadius: "20px",
                            }}
                          >
                            {/* Food item details */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                width: "278px", // 320 box - 40 padding - 2 border
                                height: "65px",
                                gap: "20px",
                              }}
                            >
                              {/* Food item image */}
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "60px",
                                }}
                              >
                                <Box
                                  component="img"
                                  sx={{
                                    position: "absolute",
                                    width: "60px",
                                    height: "60px",
                                    top: "-31px",
                                    left: "3px",
                                    borderRadius: "50%",
                                  }}
                                  src={item.image1}
                                />
                                <Box
                                  component="img"
                                  sx={{
                                    position: "absolute",
                                    width: "60px",
                                    height: "60px",
                                    top: "-29px",
                                    left: "3px",
                                    borderRadius: "50%",
                                    opacity: "0.52",
                                    filter: `blur(8.5px)`,
                                  }}
                                  src={item.image1}
                                />
                              </Box>

                              {/* Food item name and metadata */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  padding: "0px",
                                  gap: "9px",
                                  width: "198px", // 288 - 60 img - 20 gap
                                }}
                              >
                                {/* food type icon and name */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "10px",
                                    width: "198px", // same as parent box
                                  }}
                                >
                                  {/* veg / non-veg icon */}
                                  <Box
                                    component="img"
                                    sx={{
                                      width: "21px",
                                      height: "21px",
                                    }}
                                    src={
                                      item.vegNonVeg === "Veg"
                                        ? "/media/svg/veg.svg"
                                        : "/media/svg/non-veg.svg"
                                    }
                                  />
                                  {/* Food item name */}
                                  <Typography
                                    variant="bodybold"
                                    sx={{
                                      maxWidth: "167px", // 198 - 21 icon - 10 gap
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {item.itemName}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* rating and spice level */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "198px",
                              }}
                            >
                              {/* rating */}
                              {/* todo :: show real data; add min 10 ratings logic; */}
                              {/* <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  padding: "0px",
                                  gap: "7px",
                                }}
                              >
                                <Box
                                  component="img"
                                  sx={{
                                    width: "18px",
                                    height: "18px",
                                  }}
                                  src="/media/svg/rating.svg"
                                />
                                <Typography
                                  variant="bodyparagraph"
                                  sx={{ color: "#4D4D4D" }}
                                >
                                  4.0 (100+)
                                </Typography>
                              </Box> */}

                              {/* mrp */}

                              {item.mrp > item.sellingPrice ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: "0px",
                                    gap: "6px",
                                    // width: "53.77px",
                                    // height: "41px",
                                  }}
                                >
                                  <Typography
                                    variant="bodyregular"
                                    sx={{
                                      textDecorationLine: "line-through",
                                    }}
                                  >
                                    ₹ {item.mrp}
                                  </Typography>
                                  <Typography variant="bodybold">
                                    ₹ {item.sellingPrice}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="bodybold">
                                  ₹ {item.sellingPrice}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </>
              ) : (
                <Typography variant="bodybold" sx={{ margin: "auto" }}>
                  No Results found for “{food}”
                </Typography>
              )}
            </Box>
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default SearchResults;
