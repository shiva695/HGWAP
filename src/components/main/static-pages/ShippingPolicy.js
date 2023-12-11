import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const ShippingPolicy = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | Shipping and Delivery Policy";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">
              Shipping and Delivery Policy
            </Typography>
          </Box>
          <Typography variant="bodyparagraph">
            At Uvaan Foods Private Limited (company that owns and operates
            CheffyHub), we strive to deliver your food as quickly and
            efficiently as possible. Our shipping and delivery policy is
            designed to ensure that you receive your order in a timely and
            satisfactory manner.
            <br />
            <br />
            We aim to offer delivery to a wide range of areas across India. To
            start with, we have launched in Bengaluru. We may use third party
            services for delivery, who ever available and provides best delivery
            services with better pricing. Delivery fees may vary based on the
            distance between your location and the chef or restaurant location.
            Delivery charges are estimated and shown to you while placing order.
            <br />
            <br />
            Delivery times may vary based on the availability of the chef or
            restaurant, the distance to your location, and other factors. We
            will provide you with an estimated delivery time when you place your
            order and will do our best to meet this estimate. However, please
            note that delivery times are only estimates and we cannot guarantee
            the exact time of delivery.
            <br />
            <br />
            If you have any special delivery instructions, please let us know
            when you place your order. We will do our best to accommodate your
            requests, but please note that we cannot guarantee that these
            requests will be fulfilled.
            <br />
            <br />
            If you are not home when your order is delivered, we may leave your
            food with a neighbor or in a secure location at your discretion. If
            you have any concerns about this, please let us know when you place
            your order.
            <br />
            <br />
            We reserve the right to modify or change our shipping and delivery
            policy at any time. We encourage you to review this policy regularly
            to stay informed about our policies and procedures.
            <br />
            <br />
            Contact Us
            <br />
            <br />
            If you have any questions or concerns about our shipping and
            delivery policy, please contact us at contact@cheffyhub.com.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default ShippingPolicy;
