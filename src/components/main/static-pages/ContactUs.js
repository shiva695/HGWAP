import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const ContactUs = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | Contact Us";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">Contact Us</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "40px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Card sx={{ width: "300px" }}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100px",
                    height: "100px",
                    background: "#FFFFFF",
                    boxShadow: "0px 5px 25px rgba(42, 48, 55, 0.12)",
                    borderRadius: "85px",
                    my: 2,
                    cursor: "pointer",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "60px", height: "60px" }}
                    src="/media/svg/profile.svg"
                  />
                </Box>
                <Typography variant="header4">Customer Care</Typography>
                <a
                  href="mailto:contact@cheffyhub.com"
                  style={{ textDecoration: "none", color: "#FF774C" }}
                >
                  <Typography variant="bodybold">
                    contact@cheffyhub.com
                  </Typography>
                </a>
                <a
                  href="tel:9513878500"
                  style={{ textDecoration: "none", color: "#FF774C" }}
                >
                  <Typography variant="bodybold">+91 951 3878 500</Typography>
                </a>
              </CardContent>
            </Card>
            <Card sx={{ width: "300px" }}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100px",
                    height: "100px",
                    background: "#FFFFFF",
                    boxShadow: "0px 5px 25px rgba(42, 48, 55, 0.12)",
                    borderRadius: "85px",
                    my: 2,
                    cursor: "pointer",
                  }}
                >
                  <Box
                    component={"img"}
                    sx={{ width: "60px", height: "60px" }}
                    src="/media/svg/chef-cap.svg"
                  />
                </Box>
                <Typography variant="header4">Chef / Restaurant Support</Typography>
                <a
                  href="mailto:support@cheffyhub.com"
                  style={{ textDecoration: "none", color: "#FF774C" }}
                >
                  <Typography variant="bodybold">
                    support@cheffyhub.com
                  </Typography>
                </a>
                <a
                  href="tel:9513878500"
                  style={{ textDecoration: "none", color: "#FF774C" }}
                >
                  <Typography variant="bodybold">+91 951 3878 500</Typography>
                </a>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mt: 4, mb: 1, px: 2 }}>
            <Typography variant="bodybold">
              Operational Address:{" "}
              <Typography variant="bodyparagraph">
                No 175 & 176, 4th Floor, Dollars Colony, JP Nagar 4th Phase,
                Bannerghatta Main Road, Bengaluru, Karnataka, 560076
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default ContactUs;
