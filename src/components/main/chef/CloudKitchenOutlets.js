import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOutlets } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";

const CloudKitchenOutlets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const {
    isFetching: isOutletsDataFetching,
    outletsData,
    outletsError,
    logout
  } = globalState.outletsReducer;

  const [isLoading, setIsLoading] = useState(true);

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Restaurant Profile";
  }, []);

   // When USER_LOGOUT action is dispatched, logout
   useEffect(() => {
    if (logout) {
      navigate("/logout");
    }
  }, [logout, navigate]);

  // get outletdatas from redux;
  useEffect(() => {
    if (!outletsData) {
      dispatch(getOutlets({ limit: 100000, cookies }));
      setIsLoading(false);
    }
    setIsLoading(false);
  }, [outletsData, dispatch, cookies]);

  // get outletData Failed;
  useEffect(() => {
    if (outletsError) {
      alert(
        "Something went wrong while fetching outlets. Please try again later!!"
      );
    }
  }, [outletsError]);

  return (
    <>
    <Header />
      {isLoading || isOutletsDataFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Card
          variant="outlined"
          sx={{
            width: { xs: 350, sm: 460 },
            margin: "auto",
            marginY: 2,
            position: "relative",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  backgroundColor: "#eee",
                }}
                alt="profile_img"
                src={outletsData?.cloudKitchenOutlets[0].profileImage}
              />

              <Typography fontWeight={500} sx={{ m: 2 }}>
                {outletsData?.cloudKitchenOutlets[0]?.cloudKitchenName}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Typography fontWeight={400}>Outlets:</Typography>

              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/add-restaurant-outlet")}
                sx={{ mb: 2 }}
              >
                Add Outlet
              </Button>
            </Box>

            {/* Render Address */}
            {outletsData?.cloudKitchenOutlets.map((el, idx) => (
              <Card
                key={idx}
                variant="outlined"
                sx={{
                  width: { xs: 300, sm: 400 },
                  margin: "auto",
                  marginY: 1,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/cloud-kitchen-outlet/${btoa(el.id)}`)}
              >
                <Box sx={{ marginY: 1, marginX: 2 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {el.outletName}
                  </Typography>
                  <Typography variant="bodyregular">
                    {el.streetAddress}, {el.locality}, {el.city}, {el.state},{" "}
                    {el.pincode}
                  </Typography>
                  <Chip label={el.status} size="small" />
                </Box>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CloudKitchenOutlets;
