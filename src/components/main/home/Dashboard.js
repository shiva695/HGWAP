import { Box, Card, CardContent, Link, Typography } from "@mui/material";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { config } from "../../../config/config";
import { getUser } from "../../../global/redux/actions";
import Header from "../../general-components/ui-components/Header";

const Dashboard = () => {
  const [cookies] = useCookies([config.cookieName]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData, userError, logout } = globalState.userReducer;

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | Dashboard";
  }, []);

  // get user Data, if not exists
  useEffect(() => {
    if (cookies[config.cookieName]?.loginUserId && !userData?.user) {
      dispatch(
        getUser({ id: cookies[config.cookieName].loginUserId, cookies })
      );
    } else {
      if (userData?.user.roles.length === 1) {
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
          <Typography variant="header2" sx={{ mb: 2, textAlign: "center" }}>
            Dashboard
          </Typography>

          {userData?.user.roles.indexOf("Admin") >= 0 && (
            <Box>
              <Typography variant="header4">Admin</Typography>
              <ul>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/user-management"
                    underline="none"
                  >
                    User Management
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/cuisine-management"
                    underline="none"
                  >
                    Cuisine Management
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link component={RouterLink} to="/coupons" underline="none">
                    Coupon Management
                  </Link>
                </li>
              </ul>
            </Box>
          )}

          {(userData?.user.roles.indexOf("Admin") >= 0 ||
            userData?.user.roles.indexOf("Chef Support Executive") >= 0) && (
            <Box>
              <Typography variant="header4">Reports</Typography>
              <ul>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-home-chef-applications"
                    underline="none"
                  >
                    Pending Home Chef Applications
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-restaurant-applications"
                    underline="none"
                  >
                    Pending Restaurant Applications
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-gst-approvals"
                    underline="none"
                  >
                    Pending GST Approvals
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-fssai-approvals"
                    underline="none"
                  >
                    Pending FSSAI Approvals
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-gallery-approvals"
                    underline="none"
                  >
                    Pending Gallery Approvals
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/pending-food-items"
                    underline="none"
                  >
                    Pending Food Items
                  </Link>
                </li>
              </ul>
            </Box>
          )}

          {(userData?.user.roles.indexOf("Home Chef Owner") >= 0 ||
            userData?.user.roles.indexOf("Chef Manager") >= 0) && (
            <Box>
              <Typography variant="h6">Chef</Typography>
              <ul>
                {userData?.user.roles.indexOf("Home Chef Owner") >= 0 && (
                  <>
                    <li style={{ marginBottom: "8px" }}>
                      <Link
                        component={RouterLink}
                        to="/home-chef-profile"
                        underline="none"
                      >
                        Chef Profile
                      </Link>
                    </li>
                    <li style={{ marginBottom: "8px" }}>
                      <Link
                        component={RouterLink}
                        to="/managers"
                        underline="none"
                      >
                        Chef Managers
                      </Link>
                    </li>
                  </>
                )}
                {userData?.user.roles.indexOf("Chef Manager") >= 0 && (
                  <li style={{ marginBottom: "8px" }}>
                    <Link
                      component={RouterLink}
                      to="/chef-owner-details"
                      underline="none"
                    >
                      Chef Owner Details
                    </Link>
                  </li>
                )}

                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/food-items"
                    underline="none"
                  >
                    Food Items
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/preorder-stock-management"
                    underline="none"
                  >
                    Preorder Stock Management
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/chef-orders-dashboard"
                    underline="none"
                  >
                    Orders Dashboard
                  </Link>
                </li>
              </ul>
            </Box>
          )}

          {userData?.user.roles.indexOf("Cloud Kitchen Owner") >= 0 && (
            <Box>
              <Typography variant="h6">Restaurant</Typography>
              <ul>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/restaurant-profile"
                    underline="none"
                  >
                    Restaurant Outlets
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/chef-orders-dashboard"
                    underline="none"
                  >
                    Orders Dashboard
                  </Link>
                </li>
              </ul>
            </Box>
          )}

          {userData?.user.roles.indexOf("Outlet Manager") >= 0 && (
            <Box>
              <Typography variant="h6">Restaurant Outlet</Typography>
              <ul>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/outlet-owner-details"
                    underline="none"
                  >
                    Owner Details
                  </Link>
                </li>

                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/food-items"
                    underline="none"
                  >
                    Food Items
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link
                    component={RouterLink}
                    to="/preorder-stock-management"
                    underline="none"
                  >
                    Preorder Stock Management
                  </Link>
                </li>
              </ul>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;
