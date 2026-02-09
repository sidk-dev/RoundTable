import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Confirm your email to get started",
      verificationEmailBody: (createCode) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f8fb; padding:24px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:8px; padding:32px; font-family:Arial, sans-serif;">
        
        <tr>
          <td style="font-size:20px; font-weight:bold; color:#111827; padding-bottom:16px;">
            Verify your request 🔐
          </td>
        </tr>

        <tr>
          <td style="font-size:14px; color:#374151; line-height:1.6; padding-bottom:16px;">
            We received a request to continue setting up your account or update your access.
            Please enter the verification code below to proceed.
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:24px 0;">
            <div style="
              display:inline-block;
              padding:14px 24px;
              font-size:22px;
              font-weight:bold;
              letter-spacing:4px;
              color:#111827;
              background-color:#f3f4f6;
              border-radius:6px;
            ">
              ${createCode()}
            </div>
          </td>
        </tr>

        <tr>
          <td style="font-size:13px; color:#6b7280; line-height:1.5;">
            This code will expire shortly for security reasons.
          </td>
        </tr>

        <tr>
          <td style="font-size:13px; color:#6b7280; line-height:1.5; padding-top:12px;">
            If you didn’t request this, you can safely ignore this email.
          </td>
        </tr>

      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; padding-top:16px;">
        <tr>
          <td align="center" style="font-size:12px; color:#9ca3af; font-family:Arial, sans-serif;">
            © ${new Date().getFullYear()} RoundTable. All rights reserved.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

`,
      // Future Addon. (When creating profile using admin pannel - also manage auth.js service)
      //       userInvitation: {
      //         emailSubject: "You’ve been invited — here’s how to log in",
      //         emailBody: (user, code) =>
      //           `
      // Welcome!

      // An account has been created for you, and you’re invited to join the app.

      // Here are your temporary login details:

      // 👤 Username: ${user()}
      // 🔑 Temporary password: ${code()}

      // Log in using these credentials and you’ll be prompted to set a new password right away.

      // If you weren’t expecting this invitation, you can ignore this email.
      //         `.trim(),
      //       },
    },
  },
  userAttributes: {
    email: {
      mutable: false,
      required: true,
    },
    familyName: {
      mutable: true,
      required: true,
    },
    givenName: {
      mutable: true,
      required: true,
    },
  },
  accountRecovery: "EMAIL_ONLY",
  triggers: {
    postConfirmation: postConfirmation,
  },
  // Done (https://docs.amplify.aws/react/build-a-backend/functions/examples/create-user-profile-record/)
  // Future Improvement (https://docs.amplify.aws/react/build-a-backend/functions/examples/email-domain-filtering/)
});
