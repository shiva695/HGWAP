import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Drawer,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { config } from "../../../config/config";
import { mobileNoValidation } from "../../../common/common";
import { apiList, invokeApi } from "../../../services/apiServices";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getChef, getOutlet } from "../../../global/redux/actions";
import { toast } from "react-toastify";
import moment from "moment";
import Header from "../../general-components/ui-components/Header";

const Managers = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  const { chefData, chefError, logout: chefLogout } = globalState.chefReducer;
  const {
    outletData,
    outletError,
    logout: outletLogout,
  } = globalState.outletReducer;

  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoError, setMobileNoError] = useState(false);
  const [mobileHelperText, setMobileHelperText] = useState("");
  const [isUserDataFetching, setIsUserDataFetching] = useState(false);
  const [isInviteChefFetching, setIsInviteChefFetching] = useState(false);
  const [sendInviteHelperText, setSendInviteHelperText] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const [isgetChefFetching, setIsgetChefFetching] = useState(false);
  const [chefManagers, setChefManagers] = useState(null);
  const [getChefManagersData, setGetChefManagersData] = useState(false);
  const [chefMangerId, setChefManagerId] = useState(null);

  const [isUpdateChefMangerFetching, setIsUpdateChefManagerFetching] =
    useState(false);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState("");

  const [showOutlets, setShowOutlets] = useState(false);

  // Varaibles for filtering invitations
  let pendingInvitations = chefManagers?.filter(
    (el) => el.status === "Pending"
  );
  let activeInvitations = chefManagers?.filter((el) => el.status === "Active");

  let otherInvitations = chefManagers?.filter(
    (el) => el.status !== "Active" && el.status !== "Pending"
  );

  let outletCookie = cookies[config.preferencesCookie]?.outletData;

  // Get user data based on searched mobile number
  const getUserData = async (ev) => {
    ev.preventDefault();
    const mobileNoValidate = mobileNoValidation(mobileNo);
    if (mobileNoValidate) {
      setIsUserDataFetching(true);

      let params = { countryCode: "+91", mobileNumber: mobileNo };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.getUser,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setUserDetails(response.data.user);
          setIsUserDataFetching(false);
          setSendInviteHelperText("");
        } else {
          alert(
            "Something went wrong while fetching user data. Please try again later!"
          );
          setIsUserDataFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else if (response.status === 404) {
        setUserDetails(null);
        setUserDetailsError("No such user found");
        setIsUserDataFetching(false);
      } else {
        alert(
          "Something went wrong while fetching user data. Please try again later!!"
        );
        setIsUserDataFetching(false);
      }
    } else {
      setMobileNoError(true);
      setMobileHelperText("Please enter a valid mobile number");
    }
    setSearched(true);
  };

  // send invite chef manager
  const sendInvite = async () => {
    setIsInviteChefFetching(true);
    let params = {
      homeChefId: chefData?.homeChef.id,
      cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      managerUserId: userDetails?.id,
    };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.inviteChefManager,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setIsDrawerOpen(false);
        toast.success("Your invitation has been sent successfully!");
        setGetChefManagersData(true);
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-1") {
        toast.error("This user is already an active Manager under you.");
        setSendInviteHelperText(
          "This user is already an active Manager under you."
        );
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-2") {
        toast.error(
          "This user is already a Manager under someone else. Your invitation is not sent."
        );
        setSendInviteHelperText(
          "This user is already a Manager under someone else. Your invitation is not sent."
        );
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-3") {
        toast.error(
          "You have sent an invitation to this user before. You can ask the user to accept it."
        );
        setSendInviteHelperText(
          "You have sent an invitation to this user before. You can ask the user to accept it."
        );
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-4") {
        toast.error(
          "Manager invitation already sent to this user by someone else. You can ask the user to decline it before you try to resend."
        );
        setSendInviteHelperText(
          "Manager invitation already sent to this user by someone else. You can ask the user to decline it before you try to resend."
        );
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-5") {
        toast.error(
          "This user is already a Owner. Manager invitations can't be send to Owners."
        );
        setSendInviteHelperText(
          "This user is already a Owner. Manager invitations can't be send to Owners."
        );
        setIsInviteChefFetching(false);
      } else if (response.data.responseCode === "HE004-6") {
        toast.error(
          "This user is an employee of CheffyHub. Manager invitations can't be send to employees."
        );
        setSendInviteHelperText(
          "This user is an employee of CheffyHub. Manager invitations can't be send to employees."
        );
        setIsInviteChefFetching(false);
      } else {
        alert(
          "Something went wrong while sending invitation. Please try again later!!"
        );
        setIsInviteChefFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while sending invitation. Please try again later!!"
      );
      setIsInviteChefFetching(false);
    }
  };

  // update chef manager
  const updateChefManager = async (id) => {
    setChefManagerId(id);
    setIsUpdateChefManagerFetching(true);
    let params = { id, status: "Revoked" };
    let response = await invokeApi(
      config.apiDomains.chefService + apiList.updateChefManager,
      params,
      cookies
    );
    if (response.status >= 200 && response.status < 300) {
      if (response.data.responseCode === "200") {
        setGetChefManagersData(true);
        setIsUpdateChefManagerFetching(false);
      } else {
        alert(
          "Something went wrong while updating manager access. Please try again later!"
        );
        setIsUpdateChefManagerFetching(false);
      }
    } else if (response.status === 401) {
      navigate("/logout");
    } else {
      alert(
        "Something went wrong while updating manager access. Please try again later!!"
      );
      setIsUpdateChefManagerFetching(false);
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Managers";
  }, []);

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

  // role access check and get data if not available
  useEffect(() => {
    if (userData?.user) {
      if (
        !(
          userData?.user.roles.indexOf("Home Chef Owner") === -1 ||
          userData?.user.roles.indexOf("Cloud Kitchen Owner") === -1
        )
      ) {
        toast.warning(config.unauthorizedWarning);
        navigate("/");
      } else {
        if (userData?.user.roles.indexOf("Home Chef Owner") >= 0) {
          if (!chefData) {
            dispatch(
              getChef({ id: cookies[config.cookieName].loginUserId, cookies })
            );
          } else {
            setGetChefManagersData(true);
            setShowOutlets(false);
            setIsLoading(false);
          }
        } else if (userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0) {
          if (cookies[config.preferencesCookie].outletData) {
            setGetChefManagersData(true);
            setShowOutlets(true);
            setIsLoading(false);
          }
        }
      }
    }
  }, [userData, cookies, navigate, dispatch, chefData]);

  //  get outlet
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

  // Get Chef managers
  useEffect(() => {
    const getChefManagers = async () => {
      setIsgetChefFetching(true);
      let params = {
        cloudKitchenOutletId: cookies[config.preferencesCookie]?.outletData?.id,
      };
      let response = await invokeApi(
        config.apiDomains.chefService + apiList.getChefManagers,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setChefManagers(response.data.chefManagers);
          setIsgetChefFetching(false);
        } else {
          alert(
            "Something went wrong while fetching managers data. Please try again later!"
          );
          setIsgetChefFetching(false);
        }
      } else if (response.status === 401) {
        navigate("/logout");
      } else {
        alert(
          "Something went wrong while fetching managers data. Please try again later!!"
        );
        setIsgetChefFetching(false);
      }
    };

    if (getChefManagersData) {
      setGetChefManagersData(false);
      getChefManagers();
    }
  }, [chefData, cookies, getChefManagersData, navigate]);

  return (
    <>
      <Header showOutlets={showOutlets} />
      {isLoading ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Card
          variant="outlined"
          sx={{
            width: { xs: 350, sm: 460, md: 600 },
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
            <Box>
              <Typography variant="h4" sx={{ textAlign: "center" }}>
                {chefData?.homeChef ? "Chef Managers" : "Outlet Managers"}
              </Typography>
              {cookies[config.preferencesCookie].outletData && (
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
              )}

              {!!chefData?.homeChef && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setIsDrawerOpen(true)}
                  disabled={
                    chefData?.homeChef.status !== "Active" || isgetChefFetching
                  }
                  sx={{ float: "right", mt: 1 }}
                >
                  New Invitation
                </Button>
              )}
              {outletData?.cloudKitchenOutlet && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setIsDrawerOpen(true)}
                  disabled={
                    outletData?.cloudKitchenOutlet.status !== "Active" ||
                    isgetChefFetching
                  }
                  sx={{ float: "right", mt: 1 }}
                >
                  New Invitation
                </Button>
              )}
            </Box>
            {chefData?.homeChef.status !== "Active" &&
              outletData?.cloudKitchenOutlet.status !== "Active" && (
                <Typography variant="bodyregular" sx={{ mt: 2 }}>
                  You can send new invitation only after your profile becomes
                  active
                </Typography>
              )}
            {chefManagers?.length === 0 && (
              <Typography variant="bodyregular" sx={{ mt: 2 }}>
                No invitations sent yet
              </Typography>
            )}

            {/* Active chefManagers  */}
            {activeInvitations?.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Active Managers
              </Typography>
            )}

            {activeInvitations?.map((el, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  mt: 2,
                  p: 2,
                  border: "1px solid lightGrey",
                }}
              >
                <Typography>
                  {el.managerUserName ? el.managerUserName : " "}{" "}
                  {`(${el.managerUserCountryCode}`}{" "}
                  {`${el.managerUserMobileNumber})`}
                </Typography>
                <Typography>{el.status}</Typography>
                <Button
                  size="small"
                  disabled={
                    isUpdateChefMangerFetching && chefMangerId === el.id
                  }
                  onClick={() => updateChefManager(el.id)}
                >
                  Revoke
                  {isUpdateChefMangerFetching && chefMangerId === el.id ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </Box>
            ))}

            {/* Pending ChefManagers */}
            {pendingInvitations?.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Pending Invitations
              </Typography>
            )}
            {pendingInvitations?.map((el, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  mt: 2,
                  p: 2,
                  border: "1px solid lightGrey",
                }}
              >
                {/* <Box sx={{ display: "flex", flexDirection: "column" }}> */}
                <Typography>
                  {el.managerUserName ? el.managerUserName : " "}{" "}
                </Typography>
                <Typography>
                  {`(${el.managerUserCountryCode}`}{" "}
                  {`${el.managerUserMobileNumber})`}
                </Typography>
                {/* </Box> */}

                <Typography>{el.status}</Typography>
                <Button size="small" onClick={() => updateChefManager(el.id)}>
                  Revoke
                </Button>
              </Box>
            ))}

            {/* Others */}
            {otherInvitations?.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Other Invitations
              </Typography>
            )}

            {otherInvitations?.map(
              (el, idx) =>
                el.status !== "Pending" &&
                el.status !== "Active" && (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      mt: 2,
                      p: 2,
                      border: "1px solid lightGrey",
                    }}
                  >
                    <Typography>
                      {el.managerUserName ? el.managerUserName : " "}{" "}
                      {`(${el.managerUserCountryCode}`}{" "}
                      {`${el.managerUserMobileNumber})`}
                    </Typography>
                    <Typography>
                      {el.status} on{" "}
                      {moment(el.updatedDate).format("DD/MM/YYYY  HH:mm A")}
                    </Typography>
                  </Box>
                )
            )}

            {/* Drawer for invite chef managers */}
            <Drawer anchor="right" open={isDrawerOpen}>
              <Card
                variant="outlined"
                sx={{ width: { xs: 300, sm: 500 }, m: 2, overflow: "auto" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                    Invite Manager
                  </Typography>

                  <form onSubmit={getUserData}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                        alignItems: "flex-start",
                        ml: 3,
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Search user by mobile number
                      </Typography>
                      <TextField
                        id="mobile"
                        label="Mobile Number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              +91
                            </InputAdornment>
                          ),
                        }}
                        variant="standard"
                        autoFocus
                        value={mobileNo}
                        onChange={(ev) => {
                          setMobileNo(ev.target.value.replace(/\D/, ""));
                          setMobileNoError(false);
                          setMobileHelperText("");
                        }}
                        inputProps={{ maxLength: 10 }}
                        error={mobileNoError}
                        helperText={mobileHelperText}
                      />

                      <Button
                        type="submit"
                        size="small"
                        variant="outlined"
                        disabled={isUserDataFetching}
                        sx={{
                          marginY: 2,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        Search
                        {isUserDataFetching ? (
                          <CircularProgress size={24} sx={{ ml: 2 }} />
                        ) : (
                          <></>
                        )}
                      </Button>
                    </Box>
                  </form>
                  {searched && (
                    <>
                      <Box>
                        {!userDetails ? (
                          <Typography variant="body1" color={"error"}>
                            {userDetailsError}
                          </Typography>
                        ) : (
                          <>
                            <Box sx={{ flexGrow: 1, width: "100%" }}>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      textAlign: "center",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Name
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      textAlign: "center",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Mobile
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      textAlign: "center",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Action
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Box
                              sx={{
                                flexGrow: 1,
                                mt: 1,
                              }}
                            >
                              <Grid
                                container
                                spacing={2}
                                sx={{
                                  dispaly: "flex",
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Grid item xs={4} sx={{ textAlign: "center" }}>
                                  <Typography>
                                    {userDetails?.fullName}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4} sx={{ textAlign: "center" }}>
                                  <Typography>
                                    {userDetails?.countryCode}{" "}
                                    {userDetails?.mobileNumber}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4} sx={{ textAlign: "center" }}>
                                  <Button
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    onClick={sendInvite}
                                  >
                                    Invite
                                    {isInviteChefFetching ? (
                                      <CircularProgress
                                        size={24}
                                        sx={{ ml: 2 }}
                                      />
                                    ) : (
                                      <></>
                                    )}
                                  </Button>
                                </Grid>
                              </Grid>
                              <Typography variant="bodyregular" color={"error"}>
                                {sendInviteHelperText}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
                <CardActions
                  sx={{
                    float: "right",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setMobileNo("");
                      setMobileNoError(false);
                      setMobileHelperText("");
                      setUserDetailsError("");
                      setUserDetails(null);
                    }}
                  >
                    Close
                  </Button>
                </CardActions>
              </Card>
            </Drawer>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Managers;
