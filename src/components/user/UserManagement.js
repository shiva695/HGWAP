import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Link,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { config } from "../../config/config";
import { mobileNoValidation } from "../../common/common";
import { apiList, invokeApi } from "../../services/apiServices";
import { useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Header from "../general-components/ui-components/Header";

const UserManagement = () => {
  const [cookies] = useCookies([config.cookieName]);
  const navigate = useNavigate();
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;

  const [empName, setEmpName] = useState("");
  const [empNameError, setEmpNameError] = useState(false);
  const [empNameHelperText, setEmpNameHelperText] = useState("");

  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoError, setMobileNoError] = useState(false);
  const [mobileHelperText, setMobileHelperText] = useState("");
  const [isUserDataFetching, setIsUserDataFetching] = useState(false);
  const [isUpdatesRolesFetching, setIsUpdateRolesFetching] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [newRoles, setNewRoles] = useState([]);
  const [roles, setRoles] = useState({
    admin: false,
    chefSupport: false,
    customerSupport: false,
    salesManager: false,
    accountant: false,
  });
  const { admin, chefSupport, customerSupport, salesManager, accountant } =
    roles;

  const handleChange = (ev) => {
    setRoles({ ...roles, [ev.target.name]: ev.target.checked });
    if (ev.target.checked) {
      let data = newRoles;
      data.push(ev.target.value);
      setNewRoles(data);
    } else {
      let data = newRoles.filter((arr) => arr !== ev.target.value);
      setNewRoles(data);
    }
  };

  // Get user data
  const getUserData = async (ev) => {
    const mobileNoValidate = mobileNoValidation(mobileNo);
    if (mobileNoValidate) {
      setNewRoles([]);
      setIsUserDataFetching(true);

      let params = { countryCode: "+91", mobileNumber: mobileNo };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.getUser,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsUserDataFetching(false);
          setUserDetails(response.data.user);
          let userRoles = response.data.user.roles;
          setRoles({
            admin: userRoles.indexOf("Admin") !== -1 ? true : false,
            chefSupport:
              userRoles.indexOf("Chef Support Executive") !== -1 ? true : false,
            customerSupport:
              userRoles.indexOf("Customer Support Executive") !== -1
                ? true
                : false,
            salesManager:
              userRoles.indexOf("Sales Manager") !== -1 ? true : false,
            accountant: userRoles.indexOf("Accountant") !== -1 ? true : false,
          });

          userRoles = userRoles.filter(
            (role) =>
              role === "Admin" ||
              role === "Chef Support Executive" ||
              role === "Customer Support Executive" ||
              role === "Sales Manager" ||
              role === "Accountant"
          );
          setNewRoles(userRoles);
          setEmpName(
            response.data.user.employeeName
              ? response.data.user.employeeName
              : ""
          );
        } else {
          alert(
            "Something went wrong while fetching user data. Please try again later!"
          );
          setIsUserDataFetching(false);
        }
      } else if (response.status === 404) {
        setUserDetails(null);
        setNewRoles([]);
        setRoles({
          admin: false,
          chefSupport: false,
          customerSupport: false,
          salesManager: false,
          accountant: false,
        });
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

  // validate empname

  const validateEmpName = () => {
    let validationErrors = false;
    if (empName === "") {
      setEmpNameError(true);
      setEmpNameHelperText("Please Enter Employee Name");
      validationErrors = true;
    }
    if (!validationErrors) {
      return true;
    } else {
      return false;
    }
  };

  // update User role.
  const handleUpdateRoles = async (ev) => {
    ev.preventDefault();
    let empvalid = validateEmpName();
    if (empvalid) {
      setIsUpdateRolesFetching(true);
      let params = {
        userId: userDetails.id,
        roles: newRoles,
        employeeName: empName,
      };
      let response = await invokeApi(
        config.apiDomains.userService + apiList.updateRoles,
        params,
        cookies
      );
      if (response.status >= 200 && response.status < 300) {
        if (response.data.responseCode === "200") {
          setIsUpdateRolesFetching(false);
          getUserData();
          setModalOpen(false);
        } else if (response.data.responseCode === "HE006") {
          alert("Chef can't become an employee.");
          setIsUpdateRolesFetching(false);
        } else {
          alert(
            "Something went wrong while update user roles. Please try again later!"
          );
          setIsUpdateRolesFetching(false);
        }
      } else {
        alert(
          "Something went wrong while update user roles. Please try again later!!"
        );
        setIsUpdateRolesFetching(false);
      }
    }
  };

  // On load
  useEffect(() => {
    document.title = config.documentTitle + " | User Management";
  }, []);

  // check if logged in user having a admin role
  useEffect(() => {
    if (userData) {
      if (userData?.user.roles.indexOf("Admin") === -1) {
        navigate("/logout");
      }
      setIsLoading(false);
    }
  }, [userData, navigate]);

  return (
    <>
      {isLoading ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
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
                <Typography color="inherit">User Management</Typography>
              </Breadcrumbs>

              <Typography variant="header2" sx={{ mb: 2, textAlign: "center" }}>
                User Management
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  alignItems: "flex-start",
                  ml: 3,
                }}
              >
                <Typography variant="bodyparagraph" sx={{ mb: 2 }}>
                  Search user by mobile number
                </Typography>
                <TextField
                  id="mobile"
                  label="Mobile Number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                  variant="standard"
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
                  variant="outlined"
                  disabled={isUserDataFetching}
                  sx={{
                    marginY: 2,
                  }}
                  onClick={getUserData}
                >
                  Search
                  {isUserDataFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </Box>

              {searched && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      ml: 3,
                      fontWeight: 500,
                    }}
                  >
                    {!userDetails ? (
                      <Typography variant="body1" color={"error"}>
                        No such user found
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="body1">
                          Mobile: {userDetails?.mobileNumber}
                        </Typography>
                        <Typography variant="body1">
                          Name: {userDetails?.fullName}
                        </Typography>
                        <Typography variant="body1">
                          Roles: {userDetails.roles?.join(", ")}
                        </Typography>
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{
                            marginY: 2,
                          }}
                          onClick={() => setModalOpen(true)}
                        >
                          Update Roles
                        </Button>
                      </>
                    )}
                  </Box>
                </>
              )}
            </CardContent>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "background.paper",
                  width: 400,
                  p: 4,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={handleChange}
                        value="Admin"
                        name="admin"
                      />
                    }
                    label="Admin"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={chefSupport}
                        onChange={handleChange}
                        value="Chef Support Executive"
                        name="chefSupport"
                      />
                    }
                    label="Chef Support Executive"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={customerSupport}
                        onChange={handleChange}
                        value="Customer Support Executive"
                        name="customerSupport"
                      />
                    }
                    label="Customer Support Executive"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={salesManager}
                        onChange={handleChange}
                        value="Sales Manager"
                        name="salesManager"
                      />
                    }
                    label="Sales Manager"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={accountant}
                        onChange={handleChange}
                        value="Accountant"
                        name="accountant"
                      />
                    }
                    label="Accountant"
                  />
                </FormGroup>
                <TextField
                  id="Employee Name"
                  label="Employee Name *"
                  value={empName}
                  variant="standard"
                  onChange={(ev) => {
                    setEmpName(ev.target.value);
                    setEmpNameError(false);
                    setEmpNameHelperText("");
                  }}
                  inputProps={{ maxLength: 40 }}
                  error={empNameError}
                  helperText={empNameHelperText}
                  sx={{ mt: 2 }}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdatesRolesFetching}
                  sx={{
                    mt: 2,
                  }}
                  onClick={handleUpdateRoles}
                >
                  Update
                  {isUpdatesRolesFetching ? (
                    <CircularProgress size={24} sx={{ ml: 2 }} />
                  ) : (
                    <></>
                  )}
                </Button>
              </Box>
            </Modal>
          </Card>
        </>
      )}
    </>
  );
};

export default UserManagement;
