import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const RefundPolicy = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | Cancellation / Refund Policy";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">
              Cancellation / Refund Policy
            </Typography>
          </Box>
          <Typography variant="bodyparagraph">
            At Uvaan Foods Private Limited (company that owns and operates
            CheffyHub), we understand that sometimes things don't go as planned
            and you may need to cancel or request a refund for your order.
            That's why we have a straightforward cancellation and refund policy
            to ensure that you have a positive experience when using our online
            food ordering app.
            <br />
            <br />
            Cancellation Policy
            <br />
            <br />
            <ul>
              <li>
                For Instant Orders, you may cancel your order at any time before
                it has been accepted by the chef or restaurant. If your order
                has already been accepted and prepared by the chef or
                restaurant, it may not be possible to cancel your order.
                <br />
                <br />
              </li>
              <li>
                For Preorders, you may cancel 2 days before the delivery date
                (even if the chef or restaurant has accepted your order). You
                may cancel later, only if chef or restaurant has not accepted
                your order by then.
                <br />
                <br />
              </li>
              <li>
                2% + GST will be applicable as Cancellation charges, if the
                order is cancelled by you. No charges if the order is cancelled
                by chef or restaurant.
              </li>
            </ul>
            <br />
            Refund Policy
            <br />
            <br />
            If you are not satisfied with your order, please{" "}
            <a href="/contact-us">contact us</a> as soon as possible so that we
            can resolve any issues. We may offer a refund, credit, or
            replacement depending on the circumstances of your request.
            <br />
            <br />
            In order to request a refund, you must provide us with the following
            information:
            <br />
            <ul>
              <li>Your order number</li>
              <li>The reason for your request</li>
              <li>
                Any relevant photos or documents (such as a receipt or proof of
                purchase)
              </li>
            </ul>
            <br />
            We will review your request and determine if a refund is warranted.
            Please note that we may not be able to offer a refund if the issue
            is beyond our control (such as if the chef or restaurant does not
            prepare your order as requested). Refunds may take up to 5 to 7
            business days.
            <br />
            <br />
            We reserve the right to modify or change our refund and cancellation
            policy at any time. We encourage you to review this policy regularly
            to stay informed about our policies and procedures. <br />
            <br />
            Contact Us
            <br />
            <br />
            If you have any questions or concerns about our refund and
            cancellation policy, please contact us at contact@cheffyhub.com.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default RefundPolicy;
