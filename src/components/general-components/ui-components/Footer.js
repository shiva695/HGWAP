import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Footer = () => {
  const globalState = useSelector((state) => state);
  const { userData } = globalState.userReducer;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        padding: "17px 27px",
        background: "#2A3037",
        flexWrap: "wrap",
        gap: "30px",
        mt: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {(!userData ||  (userData?.user.roles.length === 1 &&
          userData?.user.roles.indexOf("Customer") !== -1)) && (
            <>
              <Link
                component={RouterLink}
                to="/partner-registration"
                underline="none"
              >
                <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
                  Register&nbsp;as&nbsp;Partner
                </Typography>
              </Link>
              <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
                &nbsp;|&nbsp;
              </Typography>
            </>
          )}

        <Link component={RouterLink} to="/about-us" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            About&nbsp;us
          </Typography>
        </Link>
        <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
          &nbsp;|&nbsp;
        </Typography>
        <Link component={RouterLink} to="/contact-us" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            Contact&nbsp;us
          </Typography>
        </Link>
        <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
          &nbsp;|&nbsp;
        </Typography>
        <Link component={RouterLink} to="/terms-of-use" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            Terms&nbsp;of&nbsp;Use
          </Typography>
        </Link>
        <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
          &nbsp;|&nbsp;
        </Typography>
        <Link component={RouterLink} to="/privacy-policy" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            Privacy&nbsp;Policy
          </Typography>
        </Link>
        <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
          &nbsp;|&nbsp;
        </Typography>
        <Link component={RouterLink} to="/refund-policy" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            Refund&nbsp;Policy
          </Typography>
        </Link>
        <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
          &nbsp;|&nbsp;
        </Typography>
        <Link component={RouterLink} to="/shipping-policy" underline="none">
          <Typography variant="bodyregular" sx={{ color: "#FCFCFC" }}>
            Shipping&nbsp;Policy
          </Typography>
        </Link>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        <Typography variant="bodyparagraph" sx={{ color: "#FCFCFC" }}>
          ©&nbsp;2022&nbsp;-&nbsp;{new Date().getFullYear()}
          &nbsp;CheffyHub&nbsp;
        </Typography>
        <Typography variant="bodyparagraph" sx={{ color: "#FCFCFC" }}>
          A&nbsp;product&nbsp;by&nbsp;
          <a
            href="http://uvaanfoods.com"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#FF774C" }}
          >
            Uvaan&nbsp;Foods
          </a>
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          // padding: "10px",
          gap: "10px",
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0px",
            gap: "20px",
          }}
        >
          <Typography
            variant="bodyparagraph"
            sx={{ color: "#FCFCFC", width: "101px" }}
          >
            Available&nbsp;on
          </Typography>
          <Box
            component={"img"}
            sx={{ width: "30px", height: "30px" }}
            src="/media/svg/playstore.svg"
          />
          <Box
            component={"img"}
            sx={{ width: "30px", height: "30px" }}
            src="/media/svg/appstore.svg"
          />
        </Box>
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
          <Typography
            variant="bodyparagraph"
            sx={{ color: "#FCFCFC", width: "101px" }}
          >
            Follow&nbsp;us&nbsp;on
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "20px",
            }}
          >
          <a
            href="https://facebook.com/CheffyHub"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <Box
              component={"img"}
              sx={{ width: "30px", height: "30px" }}
              src="/media/svg/facebook.svg"
            />
          </a>
          <a
            href="https://twitter.com/CheffyHub"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <Box
              component={"img"}
              sx={{ width: "30px", height: "30px" }}
              src="/media/svg/twitter.svg"
            />
          </a>
          <a
            href="https://instagram.com/CheffyHub"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <Box
              component={"img"}
              sx={{ width: "30px", height: "30px" }}
              src="/media/svg/instagram.svg"
            />
          </a>
          <a
            href="https://www.youtube.com/@CheffyHub"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <Box
              component={"img"}
              sx={{ width: "30px", height: "30px" }}
              src="/media/svg/youtube.svg"
            />
          </a>
        </Box>
      </Box>
    </Box>
    </Box>
  );
};

export default Footer;
