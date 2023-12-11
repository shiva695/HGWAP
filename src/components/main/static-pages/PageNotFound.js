import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../general-components/ui-components/Header";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
          gap: "10px",
        }}
      >
        <Typography variant="header1" sx={{ fontSize: 50 }}>
          404
        </Typography>
        <Typography variant="header3">Page not found</Typography>
        <Typography variant="bodyparagraph">
          Looks like the page you are trying to access, doesn't exist. Please
          start afresh.
        </Typography>

        <Button variant="text" onClick={() => navigate("/")}>
          Go to home
        </Button>
      </Box>
    </div>
  );
};

export default PageNotFound;
