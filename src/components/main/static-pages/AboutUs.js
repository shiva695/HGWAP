import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const AboutUs = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | About Us";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">About Us</Typography>
          </Box>
          <Typography variant="bodyparagraph">
            CheffyHub, a product by Uvaan Foods Private Limited, is an online
            food ordering app that connects you with your favourite home chefs
            and restaurants. Our mission is to make it easy for you to order
            food from the best chefs and restaurants in your area, all from the
            comfort of your own home.
            <br />
            <br />
            We aim to provide you with a wide selection of chefs and restaurants
            to choose from who will cook your dishes from your favourite
            authentic cuisines.
            <br />
            <br />
            Our user-friendly app makes it easy to browse menus, place orders,
            and pay online for your food. You can even track your order in
            real-time and get updates when your food is on its way.
            <br />
            <br />
            We believe that everyone should have access to delicious food, no
            matter where they are. That's why we aim to offer delivery to a wide
            range of areas. We also offer self-pickup options for those who
            prefer to pick up their food from the nearest chef or restaurant.
            <br />
            <br />
            We are committed to providing excellent customer service and strive
            to ensure that every order is delivered on time and to your
            satisfaction. If you have any questions or concerns about your
            order, our customer service team is always here to help.
            <br />
            <br />
            Thank you for choosing CheffyHub for all of your food delivery
            needs. We hope you enjoy your meal!
            <br />
            <br />
            Uvaan Foods Private Limited
            <br />
            CIN: U74999KA2022PTC159016
            <br />
            FSSAI License Number: 11223999000208
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default AboutUs;
