import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { apiList, invokeApi } from "../../../services/apiServices";
import { toast } from "react-toastify";
import { getUser } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";

const OutletOwnerDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies] = useCookies([config.cookieName]);
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const [getChefOwnerFetching, setGetChefOwnerFetching] = useState(true);
  const [getChefOwnerStatus, setGetChefOwnerStatus] = useState(false);
  const [outletOwnerData, setOutletOwnerData] = useState([]);
  const [isUpdateChefMangerFetching, setIsUpdateChefManagerFetching] =
    useState(false);

  // whatsapp notification checkbox state
  const [preferenceChecked, setPreferenceChecked] = useState(null);

  // update chef manager for resign.
  const updateChefManager = async (id) => {
    setIsUpdateChefManagerFetching(true);
    let params = { id, status: "Resigned" };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.updateChefManager,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Resigned Successfully!");
        dispatch(
          getUser({ id: cookies[config.cookieName].loginUserId, cookies })
        );
        navigate("/");
      } else {
        alert(
          "Something went wrong while resigning as outlet manager. Please try again later!"
        );
        setIsUpdateChefManagerFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while resigning as outlet manager. Please try again later!!"
      );
      setIsUpdateChefManagerFetching(false);
    }
  };

  // Update whats app preferences;
  const updateWhatsAppPreference = async (checked) => {
    let params = {
      managerUserId: outletOwnerData?.managerUserId,
      whatsappPreference: checked === true ? "Yes" : "No",
    };

    let response = await invokeApi(
      config.apiDomains.chefService + apiList.updateWhatsAppPreference,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        toast.success("Whatsapp notification preference has been updated!");
      } else {
        alert(
          "Something went wrong while updating whatsapp preferences. Please try again later!"
        );
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating whatsapp preferences. Please try again later!!"
      );
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Outlet Owner Details";
  }, []);

  // check Chef Manager role. 
  useEffect(() => {
    if (userData) {
      if (userData?.user.roles.indexOf("Cloud Kitchen Owner") > -1) {
        navigate("/restaurant-profile");
      } else if (userData?.user.roles.indexOf("Home Chef Owner") > -1) {
        navigate("/home-chef-profile");
      } else if (userData?.user.roles.indexOf("Outlet Manager") > -1) {
        setGetChefOwnerStatus(true);
      } else if (userData?.user.roles.indexOf("Chef Manager") > -1) {
        navigate("/chef-owner-details");
      } else {
        navigate("/");
      }
    }
  }, [userData, navigate]);

  // Get Chef OWner By managers
  useEffect(() => {
    const getChefOwnerByManager = async () => {
      setGetChefOwnerFetching(true);
      let params = {};
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefOwnerByManager,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setOutletOwnerData(response.data.chefOwner);
          setPreferenceChecked(
            response.data.chefOwner.whatsappPreference === "Yes" ? true : false
          );
          setGetChefOwnerFetching(false);
        } else {
          alert(
            "Something went wrong while fetching outlet owner data. Please try again later!"
          );
          setGetChefOwnerFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/");
      } else {
        alert(
          "Something went wrong while fetching outlet owner data. Please try again later!!"
        );
        setGetChefOwnerFetching(false);
      }
    };

    if (getChefOwnerStatus) {
      setGetChefOwnerStatus(false);
      getChefOwnerByManager();
    }
  }, [cookies, getChefOwnerStatus, navigate]);

  return (
    <>
      <Header />
      {getChefOwnerFetching ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <>
          <Card
            variant="outlined"
            sx={{
              width: { xs: 350, sm: 600 },
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
              <Typography variant="h4" sx={{ textAlign: "center" }}>
                Outlet Owner Details
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 2,
                  p: 2,
                  border: "1px solid lightGrey",
                }}
              >
                <Box>
                  <Typography variant="body1">
                  Restaurant Name : {outletOwnerData?.cloudKitchenName}
                  </Typography>
                  <Typography variant="body1">
                    Outlet Name : {outletOwnerData?.outletName}
                  </Typography>
                  <Typography variant="body1">
                    Mobile : {outletOwnerData?.createdByMobileNumber}
                  </Typography>
                  <Typography variant="body1">
                    Invited On : {outletOwnerData?.invitedOn}
                  </Typography>
                  <Typography variant="body1">
                    Status : {outletOwnerData?.status}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => updateChefManager(outletOwnerData.id)}
                  >
                    Resign
                    {isUpdateChefMangerFetching ? (
                      <CircularProgress size={24} sx={{ ml: 2 }} />
                    ) : (
                      <></>
                    )}
                  </Button>
                </Box>
              </Box>
              {/* Checkbox for allow whatsapp notification */}
              <FormControlLabel
                sx={{ mt: 1 }}
                label={
                  <Typography variant="bodyparagraph">
                    I would like to receive WhatsApp notifications when orders
                    are placed
                  </Typography>
                }
                control={
                  <Checkbox
                    checked={preferenceChecked}
                    onClick={(ev) => {
                      setPreferenceChecked(ev.target.checked);
                      updateWhatsAppPreference(ev.target.checked);
                    }}
                  />
                }
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default OutletOwnerDetails;
