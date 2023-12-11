import React, { useEffect } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../global/redux/actions";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const ChefRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);

  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Register as Partner";
  }, []);

  // get user Data, if not exists
  useEffect(() => {
    if (!userData?.user) {
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );
    } else {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") > -1) {
        navigate("/restaurant-profile");
      } else if (userData?.user.roles.indexOf("Home Chef Owner") > -1) {
        navigate("/home-chef-profile");
      } else if (userData?.user.roles.indexOf("Chef Manager") > -1) {
        navigate("/chef-owner-details");
      } else if (userData?.user.roles.indexOf("Outlet Manger") > -1) {
        navigate("/outlet-owner-details");
      } else if (userData?.user.roles.length > 1) {
        navigate("/");
      }
    }
  }, [dispatch, cookies, userData, navigate]);

  // On error when get user api is called
  useEffect(() => {
    if (userError) {
      alert(
        "Something went wrong while fetching user details. Please try again later!"
      );
    }
  }, [userError]);

  // When USER_LOGOUT action is dispatched, logout
  useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

  return (
    <>
      <Header />
      <Card
        variant="outlined"
        sx={{
          width: "90%",
          mx: "auto",
          my: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "20px 25px",
            boxShadow: "inset 0px -1px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Typography variant="header4">Create Partner Profile</Typography>
        </Box>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Chef Type selection */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              gap: "27px",
            }}
          >
            {/* Graphic and heading */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0px",
                gap: "21px",
              }}
            >
              <Box component={"img"} src="/media/svg/chef-type-graphic.svg" />
              <Typography variant="header4">Choose the Partner Type</Typography>
            </Box>
            {/* Options */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "32px",
                flexWrap: "wrap",
              }}
            >
              {/* Home Chef */}
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "20px 25px",
                  gap: "15px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "20px",
                  height: "64px",
                }}
                onClick={() => navigate("/home-chef-registration")}
              >
                <Box
                  component={"img"}
                  sx={{ height: "24px", width: "24px" }}
                  src="/media/svg/home-chef-orange.svg"
                />
                <Typography variant="bodyparagraph">Home Chef</Typography>
              </Button>

              {/* Cloud Kitchen */}
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "20px 25px",
                  gap: "15px",
                  background: "#FCFCFC",
                  border: "1px solid #DFE2E6",
                  borderRadius: "20px",
                  height: "64px",
                }}
                onClick={() => navigate("/restaurant-registration")}
              >
                <Box
                  component={"img"}
                  sx={{ height: "24px", width: "24px" }}
                  src="/media/svg/cloud-kitchen-orange.svg"
                />
                <Typography variant="bodyparagraph">Restaurant</Typography>
              </Button>
            </Box>
          </Box>

          {/* Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Typography variant="bodymetatag">
              * Home Chef is a registered individual who cooks at home
            </Typography>
            <Typography variant="bodymetatag">
              * Restaurant / Cloud Kitchen is a registered business entity who
              can have one or more outlets
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default ChefRegister;
