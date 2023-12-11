import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { config } from "../../../config/config";
import Header from "../../general-components/ui-components/Header";

const TermsOfUse = () => {
  useEffect(() => {
    document.title = config.documentTitle + " | Terms of Use";
  }, []);

  return (
    <>
      <Header />
      <Card sx={{ my: 2, mx: "10%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="header2">Terms of Use</Typography>
          </Box>
          <Typography variant="bodyparagraph">
            Welcome to CheffyHub (the “App”). The App is owned and operated by
            Uvaan Foods Private Limited (“we,” “us,” or “our”). By accessing or
            using the App, you agree to be bound by these terms of use (the
            “Terms”). If you do not agree to these Terms, do not access or use
            the App.
            <ol>
              <li>
                Eligibility
                <br />
                The App is intended for use by individuals who are at least 18
                years old. By using the App, you represent and warrant that you
                are at least 18 years old. If you are under 18, you may not use
                the App.
                <br />
                <br />
              </li>
              <li>
                User Account
                <br />
                To use the App, you may be required to create a user account.
                You are responsible for maintaining the confidentiality of your
                account information, including the OTPs sent to your mobile
                number, and for all activities that occur under your account.
                You agree to immediately notify us of any unauthorized use of
                your account. We are not responsible for any losses arising out
                of the unauthorized use of your account.
                <br />
                <br />
              </li>
              <li>
                Prohibited Uses
                <br />
                You may use the App only for lawful purposes and in accordance
                with these Terms. You agree not to use the App:
                <ul>
                  <li>
                    In any way that violates any applicable federal, state,
                    local, or international law or regulation
                  </li>
                  <li>
                    To send, knowingly receive, upload, download, use, or re-use
                    any material that does not comply with the App's content
                    standards
                  </li>
                  <li>
                    To transmit, or procure the sending of, any advertising or
                    promotional material, including any “junk mail,” “chain
                    letter,” “spam,” or any other similar solicitation
                  </li>
                  <li>
                    To impersonate or attempt to impersonate the App, a Uvaan
                    Foods Private Limited employee, another user, or any other
                    person or entity
                  </li>
                  <li>
                    To engage in any other conduct that restricts or inhibits
                    anyone's use or enjoyment of the App, or which, as
                    determined by us, may harm the App or users of the App or
                    expose them to liability
                  </li>
                </ul>
                <br />
              </li>
              <li>
                Intellectual Property
                <br />
                The App and its entire contents, features, and functionality
                (including but not limited to all information, software, text,
                displays, images, video, and audio, and the design, selection,
                and arrangement thereof) are owned by us, our licensors, or
                other providers of such material and are protected by national
                and international copyright and trademark laws. The App is
                provided to you solely for your personal, non-commercial use.
                You may not use the App or any of its contents for any other
                purpose without our express written consent. You are not
                permitted to modify, distribute, transmit, display, perform,
                reproduce, publish, license, create derivative works from,
                transfer, or sell any information, software, products, or
                services obtained from the App.
                <br />
                <br />
              </li>
              <li>
                User Content
                <br />
                The App may allow you to submit reviews, ratings, comments, or
                other content (collectively, "User Content"). You are solely
                responsible for your User Content, and you agree not to submit
                any User Content that is illegal, obscene, threatening,
                defamatory, or invasive of privacy. You also agree not to submit
                any User Content that infringes the intellectual property rights
                of any third party. You grant us a perpetual, irrevocable,
                non-exclusive, royalty-free, worldwide license to use,
                reproduce, modify, publish, translate, distribute, and display
                your User Content. We may remove any User Content at any time,
                for any reason.
                <br />
                <br />
              </li>
              <li>
                Disclaimer of Warranties
                <br />
                The App is provided on an “as is” and “as available” basis. We
                make no representations or warranties of any kind, express or
                implied, as to the operation of the App or the information,
                content, materials, or products included on the App. To the full
                extent permissible by applicable law, we disclaim all
                warranties, express or implied, including, but not limited to,
                implied warranties of merchantability and fitness for a
                particular purpose. We will not be liable for any damages of any
                kind arising from the use of the App, including, but not limited
                to, direct, indirect, incidental, punitive, and consequential
                damages.
                <br />
                <br />
              </li>
              <li>
                Limitation of Liability
                <br />
                In no event will we be liable for any loss or damage including
                without limitation, indirect or consequential loss or damage, or
                any loss or damage whatsoever arising from loss of data or
                profits arising out of, or in connection with, the use of the
                App. We will not be liable for any errors or omissions in the
                App or the contents thereof. We will not be responsible for any
                failure to perform, or delay in performance of, any of our
                obligations under these Terms that is caused by events outside
                our reasonable control. Nothing in these Terms shall exclude or
                limit our liability for death or personal injury arising from
                our negligence, or our fraud or fraudulent misrepresentation, or
                any other liability that cannot be excluded or limited by law.
                <br />
                <br />
              </li>
              <li>
                Indemnification
                <br />
                You agree to indemnify and hold us and our suppliers,
                affiliates, directors, officers, agents, and employees, harmless
                from any claim or demand, including reasonable attorneys' fees,
                made by any third party due to or arising out of your use of the
                App, your violation of these Terms, or your violation of any
                rights of another.
                <br />
                <br />
              </li>
              <li>
                Governing Law
                <br />
                These Terms and your use of the App will be governed by and
                construed in accordance with the laws of the State of Karnataka,
                without giving effect to any principles of conflicts of law.
                <br />
                <br />
              </li>
              <li>
                Dispute Resolution
                <br />
                Any dispute arising out of or relating to these Terms or the App
                shall be resolved through binding arbitration in accordance with
                the Commercial Arbitration Rules of the Indian Council
                Arbitration. The arbitration shall be conducted in Bengaluru,
                Karnataka.
                <br />
                <br />
              </li>
              <li>
                Miscellaneous
                <br />
                These Terms constitute the entire agreement between you and us
                regarding the use of the App. Our failure to exercise or enforce
                any right or provision of these Terms shall not constitute a
                waiver of such right or provision. If any provision of these
                Terms is found by a court of competent jurisdiction to be
                invalid, the parties nevertheless agree that the court should
                endeavor to give effect to the parties' intentions as reflected
                in the provision, and the other provisions of these Terms remain
                in full force and effect. You may not assign or transfer these
                Terms or your rights or obligations hereunder, in whole or in
                part, without our prior written consent. We may assign or
                transfer these Terms, in whole or in part, without restriction.
                The section titles in these Terms are for convenience only and
                have no legal or contractual effect. These Terms and any
                policies or operating rules posted by us on the App or in
                respect to the App constitute the entire agreement and
                understanding between you and us. Any prior or contemporaneous
                communications and proposals, whether oral or written, between
                you and us (including, but not limited to, any prior versions of
                the Terms) are superseded by these Terms and are of no force or
                effect.
                <br />
                <br />
              </li>
              <li>
              Changes to These Terms
                <br />
                We reserve the right, at our sole
            discretion, to modify or replace these Terms at any time. If a
            revision is material, we will try to provide at least 30 days'
            notice prior to any new terms taking effect. What constitutes a
            material change will be determined at our sole discretion. By
            continuing to access or use the App after those revisions become
            effective, you agree to be bound by the revised terms. If you do not
            agree to the new terms, please stop using the App.
                <br />
                <br />
              </li>
              <li>
              Contact Us
                <br />
                If
            you have any questions about these Terms, please contact us at
            info@cheffyhub.com
                <br />
              </li>
            </ol>
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default TermsOfUse;
