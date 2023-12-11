import React, { useState, useEffect } from "react";
import {
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
import { apiList, invokeApi } from "../../../services/apiServices";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const PendingHomeChefApplications = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [isChefDataFetching, setIsChefDataFetching] = useState(false);
  const [homeChefsData, setHomeChefsData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [chefName, setChefName] = useState("");

  const limit = 10;

  const loadMore = () => {
    setOffset((offset) => offset + limit);
  };

  const handleSearch = async (ev) => {
    ev.preventDefault();
    setOffset(-1);
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Pending Home Chef Applications";
  }, []);

  // Get home chefs data initially on load and when offset changes to load more
  useEffect(() => {
    const getChefData = async () => {
      if (offset === -1) {
        setHomeChefsData([]);
        setOffset(0);
      } else if (offset >= 0) {
        setIsChefDataFetching(true);
        let params = {
          status: "Pending Certificates Verification",
          limit: limit,
          offset: offset,
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
              setShowLoadMore(false);
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
  }, [limit, offset, cookies, navigate, chefName]);

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
              Pending Home Chef Applications
            </Typography>
          </Breadcrumbs>

          <Typography variant="header2" sx={{ mb: 3, textAlign: "center" }}>
            Pending Home Chef Applications
          </Typography>

          <Box sx={{ marginY: 2, display: "flex", justifyContent: "flex-end" }}>
            <form onSubmit={handleSearch}>
              <TextField
                id="chefName"
                label="Search by Chef Name"
                value={chefName}
                variant="outlined"
                onChange={(ev) => {
                  setChefName(ev.target.value);
                  setOffset(-2);
                }}
                inputProps={{ maxLength: 40 }}
                sx={{ mb: 2 }}
              />

              <Button type="submit" variant="contained" sx={{ marginX: 2 }}>
                Search
              </Button>
            </form>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="bodybold">Home Chef Name</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="bodybold">Address</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="bodybold">Submitted On</Typography>
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
                  <Link
                    href={`/review-home-chef-application/${window.btoa(
                      chef.id
                    )}`}
                  >
                    <Typography variant="bodyparagraph">
                      {chef.chefName}
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
                    {moment(chef.createdDate).format("DD-MMM-YYYY")}
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
                m: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isChefDataFetching}
                onClick={loadMore}
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
        </CardContent>
      </Card>
    </>
  );
};

export default PendingHomeChefApplications;
