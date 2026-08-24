import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (
  to: string,
  userName: string,
  otpCode: string,
) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>RYDEX Verification</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f4f5;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
  color:#18181b;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:45px 16px;">

        <!-- Main Card -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:560px;
            background:#ffffff;
            border-radius:20px;
            overflow:hidden;
            border:1px solid #e4e4e7;
          "
        >

          <!-- Header -->
          <tr>
            <td align="center" style="
              padding:32px 30px;
              background:#050505;
              border-bottom:1px solid #18181b;
            ">

              <div style="
                font-size:25px;
                font-weight:800;
                letter-spacing:8px;
                color:#ffffff;
              ">
                RYDEX
              </div>

              <div style="
                margin-top:8px;
                font-size:11px;
                color:#a1a1aa;
                letter-spacing:2px;
                text-transform:uppercase;
              ">
                Premium Vehicle Booking
              </div>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:42px 38px;">

              <div style="
                display:inline-block;
                padding:7px 12px;
                border-radius:20px;
                background:#f4f4f5;
                color:#71717a;
                font-size:11px;
                font-weight:600;
                letter-spacing:1px;
                text-transform:uppercase;
              ">
                Email Verification
              </div>

              <h1 style="
                margin:22px 0 10px;
                font-size:27px;
                line-height:1.3;
                font-weight:700;
                color:#18181b;
              ">
                Verify your account
              </h1>

              <p style="
                margin:0 0 30px;
                font-size:15px;
                line-height:1.7;
                color:#71717a;
              ">
                Hello ${userName || "there"},<br><br>

                We received a request to verify your RYDEX account.
                Enter the verification code below to continue.
              </p>

              <!-- OTP -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#09090b;
                  border-radius:16px;
                "
              >
                <tr>
                  <td align="center" style="padding:28px 20px;">

                    <div style="
                      margin-bottom:10px;
                      font-size:10px;
                      color:#a1a1aa;
                      letter-spacing:2px;
                      text-transform:uppercase;
                    ">
                      Verification Code
                    </div>

                    <div style="
                      font-family:'Courier New',Courier,monospace;
                      font-size:38px;
                      line-height:1.2;
                      font-weight:700;
                      letter-spacing:10px;
                      color:#ffffff;
                    ">
                      ${otpCode}
                    </div>

                    <div style="
                      margin-top:14px;
                      font-size:11px;
                      color:#a1a1aa;
                    ">
                      This code expires in 5 minutes
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top:28px;
                  background:#fafafa;
                  border:1px solid #e4e4e7;
                  border-radius:14px;
                "
              >
                <tr>
                  <td style="padding:20px;">

                    <div style="
                      margin-bottom:8px;
                      font-size:13px;
                      font-weight:700;
                      color:#18181b;
                    ">
                      Keep your account secure
                    </div>

                    <div style="
                      font-size:13px;
                      line-height:1.7;
                      color:#71717a;
                    ">
                      Never share this verification code with anyone.
                      RYDEX will never ask you for your OTP or password.
                    </div>

                  </td>
                </tr>
              </table>

              <p style="
                margin:30px 0 0;
                font-size:12px;
                line-height:1.6;
                color:#a1a1aa;
                text-align:center;
              ">
                If you didn't request this verification, you can safely
                ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="
              padding:25px 30px;
              background:#fafafa;
              border-top:1px solid #e4e4e7;
            ">

              <div style="
                font-size:11px;
                font-weight:700;
                letter-spacing:3px;
                color:#18181b;
              ">
                RYDEX
              </div>

              <div style="
                margin-top:8px;
                font-size:11px;
                color:#a1a1aa;
              ">
                Experience the extraordinary.
              </div>

              <div style="
                margin-top:12px;
                font-size:10px;
                color:#d4d4d8;
              ">
                © ${new Date().getFullYear()} RYDEX. All rights reserved.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
  try {
    const info = await transporter.sendMail({
      from: `"RYDEX Security" <${process.env.EMAIL}>`,
      to,
      subject: "RYDEX Verification Code",
      html: htmlTemplate,
    });

    console.log("OTP Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return {
      success: false,
      error,
    };
  }
};
