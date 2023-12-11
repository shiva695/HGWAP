import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { useSelector, useDispatch } from "react-redux";
import { apiList, invokeApi } from "../../../services/apiServices";
import { getUser } from "../../../global/redux/actions";
import { toast } from "react-toastify";
import Header from "../../general-components/ui-components/Header";

const ChefManagerInvitation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [cookies] = useCookies([config.cookieName]);
  const [chefInvitationData, setChefInvitationData] = useState(null);
  const [isGetChefFetching, setIsGetChefFetching] = useState(false);
  const [getChefInvitationStatus, setGetChefInvitationStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Review Chef Manager Invitation.
  const reviewChefInvitation = async (approve) => {
    setIsGetChefFetching(true);
    let params = {
      id: chefInvitationData[0].id,
      invitationApprovalStatus: approve,
    };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.reviewChefManagerInvitation,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setIsGetChefFetching(false);
        if (response.data.chefManager.status === "Active") {
          toast.success("Invitation has been accepted successfully!");
          dispatch(
            getUser({ id: cookies[config.cookieName].loginUserId, cookies })
          );
          navigate("/");
        } else if (response.data.chefManager.status === "Declined") {
          toast.success("Invitation has been declined!");
          navigate("/");
        }
      } else {
        alert(
          "Something went wrong while updating chef manager invitation status. Please try again later!"
        );
        setIsGetChefFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating chef manager invitation status. Please try again later!!"
      );
      setIsGetChefFetching(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Chef Manager Invitation";
  }, []);

  // check if logged in user having Chef Manager role
  useEffect(() => {
    if (userData) {
      if (userData?.user.roles.indexOf("Chef Manager") !== -1) {
        navigate("/chef-owner-details");
      }
      if (userData?.user.roles.indexOf("Outlet Manager") !== -1) {
        navigate("/outlet-owner-details");
      }
      if (
        userData?.user.roles.indexOf("Home Chef Owner") !== -1 ||
        userData?.user.roles.indexOf("Cloud Kitchen Owner") !== -1
      ) {
        navigate("/managers");
      } else {
        if (userData?.user.roles.length > 1) {
          navigate("/");
        }
      }
    }
  }, [userData, navigate]);

  // Get Chef manager invitation details
  useEffect(() => {
    const getChefManagerInvitation = async () => {
      setIsGetChefFetching(true);
      let params = {};
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefManagerInvitation,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          // If user's invitation is for outlet manager, redirect there
          if (response.data.chefManager.length > 0) {
            if (
              !response.data.chefManager[0].homeChefId &&
              !!response.data.chefManager[0].cloudKitchenOutletId
            ) {
              navigate("/outlet-manager-invitation");
            }
          }
          setChefInvitationData(response.data.chefManager);
          setIsLoading(false);
          setIsGetChefFetching(false);
        } else {
          alert(
            "Something went wrong while fetching chef manager invitation data. Please try again later!"
          );
          setIsGetChefFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching chef manager invitation data. Please try again later!!"
        );
        setIsGetChefFetching(false);
      }
    };
    if (getChefInvitationStatus) {
      setGetChefInvitationStatus(false);
      getChefManagerInvitation();
    }
  }, [cookies, getChefInvitationStatus, navigate]);

  return (
    <>
      <Header />
      {isLoading || isGetChefFetching ? (
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
                Chef Manager Invitation
              </Typography>

              {chefInvitationData?.length > 0 ? (
                <>
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    Home Chef{" "}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {chefInvitationData[0]?.homeChefName}
                    </Box>{" "}
                    (
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {chefInvitationData[0].createdByName ? (
                        <>{chefInvitationData[0].createdByName} </>
                      ) : (
                        ""
                      )}
                    </Box>{" "}
                    {chefInvitationData[0].createdByCountryCode}-
                    {chefInvitationData[0].createdByMobileNumber}) has invited
                    you to become Chef Manager. Accept only if you know this
                    chef.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        reviewChefInvitation("Accepted");
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => {
                        reviewChefInvitation("Declined");
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    No invitation exits
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default ChefManagerInvitation;
