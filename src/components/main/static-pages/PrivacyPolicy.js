import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | Privacy Policy";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">Privacy Policy</Typography>
          </Box>
          <Typography variant="bodyparagraph">
            Welcome to CheffyHub (the “App”). The App is owned and operated by
            Uvaan Foods Private Limited (“we,” “us,” or “our”). We are committed
            to protecting the privacy of our suppliers, customers and users. We
            understand that when you use the App, you trust us with your
            personal information. That's why we take the protection of your
            personal data very seriously and strive to ensure that it is handled
            with care.
            <br />
            <br />
            This Privacy Policy applies to the personal information that we
            collect, use, and share when you use the App and our website. It
            explains what information we collect, how we use it, and the choices
            you have about how your information is used.
            <br />
            <br />
            Please read this Privacy Policy carefully to understand how we
            collect, use, and share your personal information. By using the App
            and our website, you agree to the collection, use, and sharing of
            your personal information as described in this Privacy Policy. If
            you do not agree with our policies and practices, do not use the App
            or our website.
            <br />
            <br />
            Information We Collect
            <br />
            <br />
            We collect personal information from you when you use the App and
            our website. This information may include:
            <br />
            <ul>
              <li>Your name, email address, and phone number</li>
              <li>Your billing and shipping address</li>
              <li>
                Your payment information (such as your credit or debit card
                number)
              </li>
              <li>Your order history and preferences</li>
              <li>Your location data</li>
              <li>
                Your device information (such as your IP address and device
                type)
              </li>
            </ul>
            Cookies: We use data collection devices such as "cookies" on certain
            pages of our website to help analyse Our web page flow, measure
            promotional effectiveness, and promote trust and safety. "Cookies"
            are small files placed on your hard drive that assist Us in
            providing Our Services. We offer certain features that are only
            available through the use of a "cookie". Most cookies are "session
            cookies," meaning that they are automatically deleted from your hard
            drive at the end of a session. You are always free to decline our
            cookies if your browser permits. Additionally, you may encounter
            "cookies" or other similar devices on certain pages of the Website
            that are placed by Third Parties. We do not control the use of
            cookies by Third Parties.
            <br />
            <br />
            How We Use Your Personal Information
            <br />
            <br />
            We use the personal information we collect from you for the
            following purposes:
            <br />
            <ul>
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and account</li>
              <li>
                To personalize your experience on our app and website (such as
                suggesting chefs or dishes based on your order history)
              </li>
              <li>
                To improve our app and website (such as by analyzing user data
                to identify trends and areas for improvement)
              </li>
              <li>To detect and prevent fraud or other illegal activities</li>
            </ul>
            We may also use your personal information for marketing and
            promotional purposes, such as sending you emails or push
            notifications about new features, special offers, and other updates.
            If you do not want to receive marketing communications from us, you
            can opt out by following the unsubscribe instructions in the
            communication or by contacting us directly.
            <br />
            <br />
            Sharing Your Personal
            <br />
            <br />
            Information We may share your personal information with third
            parties for the following purposes:
            <br />
            <ul>
              <li>
                To process and fulfill your orders (such as sharing your name,
                email address, and phone number with the chef or restaurant you are ordering
                from)
              </li>
              <li>
                To provide customer support and resolve disputes (such as
                sharing your order history with a chef or restaurant to resolve a dispute)
              </li>
              <li>
                To comply with legal obligations (such as disclosing your
                personal information to authorities if required by law)
              </li>
              <li>
                To protect the rights and safety of our customers and users
                (such as sharing your information with law enforcement to
                investigate fraud or other illegal activities)
              </li>
            </ul>
            We may also share your personal information with third-party service
            providers, such as payment processors and analytics providers, to
            assist us in providing and improving the App and website. These
            service providers are only permitted to use your personal
            information for the purpose of providing these services to us and
            are not allowed to use your personal information for their own
            marketing or promotional purposes.
            <br />
            <br />
            Data Security and Retention
            <br />
            <br />
            We take reasonable measures to protect your personal information
            from unauthorized access, use, or disclosure. However, no security
            measures are perfect and we cannot guarantee the security of your
            personal information.
            <br />
            We will retain your personal information for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law.
            <br />
            Your Choices and Rights You have the following choices and rights
            regarding your personal information:
            <br />
            <ul>
              <li>
                You can access, review, and update your personal information
                through your account settings on our app or website.
              </li>
              <li>
                You can choose whether or not to receive marketing
                communications from us by opting out through the unsubscribe
                instructions in the communication or by contacting us directly.
              </li>
              <li>
                You can request that we delete your personal information by
                contacting us directly. Please note that we may not be able to
                delete your information if it is necessary for legal or business
                purposes.
              </li>
              <li>
                You can object to the processing of your personal information or
                request that we restrict the processing of your personal
                information by contacting us directly.
              </li>
              <li>
                You can request a copy of your personal information by
                contacting us directly.
              </li>
            </ul>
            Please note that certain personal information, such as your name and
            billing and shipping address, is necessary for us to process and
            fulfill your orders. If you do not provide this information, you may
            not be able to use the App and website.
            <br />
            <br />
            Children's Privacy
            <br />
            <br />
            The App and website are not intended for children under the age of
            18. We do not knowingly collect personal information from children
            under the age of 18. If we become aware that we have collected
            personal information from a child under the age of 18, we will take
            steps to delete such information.
            <br />
            <br />
            Changes to This Privacy Policy
            <br />
            <br />
            We may update this Privacy Policy from time to time to reflect
            changes to our practices or for other operational, legal, or
            regulatory purposes. We encourage you to review this Privacy Policy
            regularly for any updates or changes.
            <br />
            <br />
            Contact Us
            <br />
            <br />
            If you have any questions or concerns about this Privacy Policy or
            how we handle your personal information, please contact us at
            contact@cheffyhub.com
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default PrivacyPolicy;
