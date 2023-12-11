import "./App.css";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Login from "./components/auth/login/Login";
import Logout from "./components/auth/logout/Logout";
import ProtectedRoute from "./components/general-components/functional-components/ProtectedRoute";
import Footer from "./components/general-components/ui-components/Footer";
import Home from "./components/main/home/Home";
import AddressAdd from "./components/main/profile/AddressAdd";
import ProfileCreate from "./components/main/profile/ProfileCreate";
import ProfileView from "./components/main/profile/ProfileView";
import store from "./global/redux/store";
import UserManagement from "./components/user/UserManagement";
import ChefRegister from "./components/main/chef/ChefRegister";
import HomeChefRegister from "./components/main/chef/HomeChefRegister";
import HomeChefProfileView from "./components/main/chef/HomeChefProfileView";
import PendingHomeChefApplications from "./components/main/chef/PendingHomeChefApplications";
import ReviewHomeChefApplication from "./components/main/chef/ReviewHomeChefApplication";
import ChefManagerInvitation from "./components/main/chef/ChefManagerInvitation";
import ChefManagerOwner from "./components/main/chef/ChefManagerOwner";
import PendingGstApprovals from "./components/main/chef/PendingGstApprovals";
import PendingFssaiApprovals from "./components/main/chef/PendingFssaiApprovals";
import CloudKitchenRegister from "./components/main/chef/CloudKitchenRegister";
import FoodItems from "./components/main/food/FoodItems";
import FoodItemAdd from "./components/main/food/FoodItemAdd";
import CacheBuster from "./components/general-components/functional-components/CacheBuster";
import Dashboard from "./components/main/home/Dashboard";
import FoodItemView from "./components/main/food/FoodItemView";
import PendingFoodItems from "./components/main/food/PendingFoodItems";
import ReviewFoodItem from "./components/main/food/ReviewFoodItem";
import PreorderStock from "./components/main/food/PreorderStock";
import CloudKitchenOutletView from "./components/main/chef/CloudKitchenOutletView";
import FoodItemsSort from "./components/main/food/FoodItemsSort";
import CloudKitchenOutletAdd from "./components/main/chef/CloudKitchenOutletAdd";
import PendingCloudKitchenApplications from "./components/main/chef/PendingCloudKitchenApplications";
import ReviewCloudKitchenApplication from "./components/main/chef/ReviewCloudKitchenApplication";
import OutletManagerInvitation from "./components/main/chef/OutletManagerInvitation";
import OutletOwnerDetails from "./components/main/chef/OutletManagerOwner";
import Managers from "./components/main/chef/Managers";
import PendingGalleryApprovals from "./components/main/chef/PendingGalleryApprovals";
import CuisineManagement from "./components/main/food/CuisineManagement";
import HomeChefDetails from "./components/main/order/HomeChefDetails";
import OutletDetails from "./components/main/order/OutletDetails";
import ThemeTest from "./components/ThemeTest";
import Cart from "./components/main/order/Cart";
import ChefOrdersDashboard from "./components/main/chef/ChefOrdersDashboard";
import MyOrders from "./components/main/order/MyOrders";
import PreviousOrders from "./components/main/order/PreviousOrders";
import ScrollToTop from "./components/general-components/functional-components/ScrollToTop";
import AboutUs from "./components/main/static-pages/AboutUs";
import ContactUs from "./components/main/static-pages/ContactUs";
import TermsOfUse from "./components/main/static-pages/TermsOfUse";
import PrivacyPolicy from "./components/main/static-pages/PrivacyPolicy";
import RefundPolicy from "./components/main/static-pages/RefundPolicy";
import ShippingPolicy from "./components/main/static-pages/ShippingPolicy";
import SearchResults from "./components/main/order/SearchResults";
import PageNotFound from "./components/main/static-pages/PageNotFound";
import CouponManagement from "./components/user/CouponManagement";
import FoodItem from "./components/main/order/FoodItem";
import ChefCouponManagement from "./components/main/chef/ChefCouponManagement";

const theme = createTheme({
  // default breakpoints:
  //   xs, extra-small:    0px+
  //   sm, small:        600px+
  //   md, medium:       900px+
  //   lg, large:       1200px+
  //   xl, extra-large: 1536px+
  palette: {
    primary: {
      main: "#FF774C",
      light: "#F9881F",
      dark: "#FF774C",
      contrastText: "#FCFCFC",
    },
    error: {
      main: "#F44336",
      light: "rgba(244, 67, 54, 0.1)",
      dark: "#F44336",
      contrastText: "#FCFCFC",
    },
    success: {
      main: "#0B735F",
      light: "#E5EFED",
      dark: "#0B735F",
      contrastText: "#FCFCFC",
    },
    text: {
      primary: "#2A3037",
      secondary: "#AAACAE",
      disabled: "#DFE2E5",
    },
  },
  typography: {
    fontFamily: "Montserrat",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          height: "54px",
          minWidth: "100px",
          background: `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)`,
          boxShadow: `0px 10px 30px rgba(202, 66, 17, 0.1)`,
          borderRadius: "15px",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "150%",
          letterSpacing: "-0.01em",
          textTransform: "none",
          "&:hover": {
            background: `linear-gradient(90.55deg, #FF784D 0.47%, #F9881F 99.52%, #FA8820 99.53%)`,
            boxShadow: `0px 10px 30px rgba(202, 66, 17, 0.1)`,
          },
          "&:disabled": {
            background: `rgba(170, 172, 174, 0.3)`,
            color: "#AAACAE",
          },
        },
        outlined: {
          height: "54px",
          minWidth: "100px",
          borderRadius: "15px",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "150%",
          letterSpacing: "-0.01em",
          textTransform: "none",
          background: `linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)`,
          WebkitBackgroundClip: "text",
          // WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          // textFillColor: "transparent",
          "&:hover": {
            background: "#FDF6EB",
          },
          "&:disabled": {
            background: `rgba(170, 172, 174, 0.2)`,
            border: "1px solid #AAACAE",
            color: "#AAACAE",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        header1: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "32px",
          lineHeight: "150%",
        },
        header2: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "28px",
          lineHeight: "150%",
        },
        header3: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "150%",
        },
        header4: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "20px",
          lineHeight: "150%",
        },
        bodybold: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "150%",
        },
        // not in desktop figma, but in a need of this
        bodyboldhighlighted: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: "700",
          fontSize: "16px",
          lineHeight: "150%",
          background:
            "linear-gradient(263.54deg, #FF774C 19.09%, #F9881F 76.91%, #F9881F 76.92%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textFillColor: "transparent",
        },
        bodyparagraph: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "150%",
        },
        // not in desktop figma, but in a need of this
        bodyregular: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "150%",
        },
        bodymetatag: {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "150%",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background:
            "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
        },
        arrow: {
          color: "#FF774C",
          // "linear-gradient(108.73deg, #F9881F 23.73%, #F9881F 23.73%, #FF774C 79.34%)",
        },
      },
    },
    MuiStep: {
      styleOverrides: {
        root: { marginBottom: "8px" },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        colorPrimary: {
          color: "#F44336", // thumb unchecked
          "&.Mui-checked": {
            color: "#0B735F", // thumb checked
          },
        },
        track: {
          backgroundColor: "#F44336", // track unchecked
          ".Mui-checked.Mui-checked + &": {
            backgroundColor: "#0B735F!important", // track checked
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <CacheBuster>
      {({ loading, isLatestVersion, refreshCacheAndReload }) => {
        if (loading) return null;
        if (!loading && !isLatestVersion) {
          // You can decide how and when you want to force reload
          refreshCacheAndReload();
        }

        return (
          <CookiesProvider>
            <Provider store={store}>
              <ThemeProvider theme={theme}>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="themetest" element={<ThemeTest />} />
                    <Route path="login" element={<Login />} />
                    <Route path="logout" element={<Logout />} />
                    <Route
                      path="create-profile"
                      element={
                        <ProtectedRoute>
                          <ProfileCreate />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfileView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add-address"
                      element={
                        <ProtectedRoute>
                          <AddressAdd />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chef-registration"
                      element={
                        <ProtectedRoute>
                          <ChefRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/partner-registration"
                      element={
                        <ProtectedRoute>
                          <ChefRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/home-chef-registration"
                      element={
                        <ProtectedRoute>
                          <HomeChefRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/home-chef-profile"
                      element={
                        <ProtectedRoute>
                          <HomeChefProfileView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-management"
                      element={
                        <ProtectedRoute>
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/coupons"
                      element={
                        <ProtectedRoute>
                          <CouponManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-home-chef-applications"
                      element={
                        <ProtectedRoute>
                          <PendingHomeChefApplications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review-home-chef-application/:id"
                      element={
                        <ProtectedRoute>
                          <ReviewHomeChefApplication />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/managers"
                      element={
                        <ProtectedRoute>
                          <Managers />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/managers/:outletId"
                      element={
                        <ProtectedRoute>
                          <Managers />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/chef-manager-invitation"
                      element={
                        <ProtectedRoute>
                          <ChefManagerInvitation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chef-owner-details"
                      element={
                        <ProtectedRoute>
                          <ChefManagerOwner />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/food-items"
                      element={
                        <ProtectedRoute>
                          <FoodItems />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/food-items/:outletId"
                      element={
                        <ProtectedRoute>
                          <FoodItems />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/sort-food-items"
                      element={
                        <ProtectedRoute>
                          <FoodItemsSort />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/sort-food-items/:outletId"
                      element={
                        <ProtectedRoute>
                          <FoodItemsSort />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/add-food-item"
                      element={
                        <ProtectedRoute>
                          <FoodItemAdd />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/add-food-item/:outletId"
                      element={
                        <ProtectedRoute>
                          <FoodItemAdd />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/food-item/:id"
                      element={
                        <ProtectedRoute>
                          <FoodItemView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-food-items"
                      element={
                        <ProtectedRoute>
                          <PendingFoodItems />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review-food-Item/:id"
                      element={
                        <ProtectedRoute>
                          <ReviewFoodItem />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chef-orders-dashboard"
                      element={
                        <ProtectedRoute>
                          <ChefOrdersDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-gst-approvals"
                      element={
                        <ProtectedRoute>
                          <PendingGstApprovals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-fssai-approvals"
                      element={
                        <ProtectedRoute>
                          <PendingFssaiApprovals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-gallery-approvals"
                      element={
                        <ProtectedRoute>
                          <PendingGalleryApprovals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/preorder-stock-management"
                      element={
                        <ProtectedRoute>
                          <PreorderStock />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/preorder-stock-management/:outletId"
                      element={
                        <ProtectedRoute>
                          <PreorderStock />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/cloud-kitchen-registration"
                      element={
                        <ProtectedRoute>
                          <CloudKitchenRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/restaurant-registration"
                      element={
                        <ProtectedRoute>
                          <CloudKitchenRegister />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="/cloud-kitchen-outlet/:id"
                      element={
                        <ProtectedRoute>
                          <CloudKitchenOutletView />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="/restaurant-profile"
                      element={
                        <ProtectedRoute>
                          <CloudKitchenOutletView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-restaurant-outlet"
                      element={
                        <ProtectedRoute>
                          <CloudKitchenOutletAdd />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-restaurant-applications"
                      element={
                        <ProtectedRoute>
                          <PendingCloudKitchenApplications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review-restaurant-application/:id"
                      element={
                        <ProtectedRoute>
                          <ReviewCloudKitchenApplication />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/outlet-manager-invitation"
                      element={
                        <ProtectedRoute>
                          <OutletManagerInvitation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/outlet-owner-details"
                      element={
                        <ProtectedRoute>
                          <OutletOwnerDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cuisine-management"
                      element={
                        <ProtectedRoute>
                          <CuisineManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute>
                          <Cart />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-orders"
                      element={
                        <ProtectedRoute>
                          <MyOrders />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/previous-orders"
                      element={
                        <ProtectedRoute>
                          <PreviousOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/coupon-management"
                      element={
                        <ProtectedRoute>
                          <ChefCouponManagement />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/chef/:name/:id"
                      element={<HomeChefDetails />}
                    />
                    <Route
                      path="/restaurant/:name/:id"
                      element={<OutletDetails />}
                    />
                    <Route
                      path="/kitchen/:name/:id"
                      element={<OutletDetails />}
                    />
                    <Route
                      path="/food/:chef/:name/:id"
                      element={<FoodItem />}
                    />
                    <Route path="/search/:name" element={<SearchResults />} />

                    <Route path="about-us" element={<AboutUs />} />
                    <Route path="contact-us" element={<ContactUs />} />
                    <Route path="terms-of-use" element={<TermsOfUse />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="refund-policy" element={<RefundPolicy />} />
                    <Route
                      path="shipping-policy"
                      element={<ShippingPolicy />}
                    />
                    <Route path="*" element={<PageNotFound />} />
                  </Routes>

                  <Footer />
                </BrowserRouter>
              </ThemeProvider>
            </Provider>
          </CookiesProvider>
        );
      }}
    </CacheBuster>
  );
};

export default App;
