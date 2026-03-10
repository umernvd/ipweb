import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Initialize Nodemailer transporter with environment variables
 */
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
}

/**
 * Send interviewer onboarding email
 */
export async function sendInterviewerOnboardingEmail(
  interviewerEmail: string,
  interviewerName: string,
  companyName: string,
  authCode: string,
): Promise<void> {
  const html = generateOnboardingEmailHTML(
    interviewerName,
    companyName,
    authCode,
  );

  await sendEmail({
    to: interviewerEmail,
    subject: `Welcome to InterviewPro - Your Auth Code: ${authCode}`,
    html,
  });
}

/**
 * Generate professional HTML email template for interviewer onboarding
 */
function generateOnboardingEmailHTML(
  interviewerName: string,
  companyName: string,
  authCode: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to InterviewPro</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 16px;
      color: #1f2937;
    }
    .greeting strong {
      color: #1e40af;
    }
    .company-info {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .company-info p {
      margin: 0;
      font-size: 14px;
      color: #1e40af;
    }
    .auth-code-section {
      background-color: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .auth-code-label {
      font-size: 12px;
      font-weight: 600;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .auth-code {
      font-size: 32px;
      font-weight: 700;
      color: #b45309;
      font-family: 'Courier New', monospace;
      letter-spacing: 4px;
      margin: 0;
      word-break: break-all;
    }
    .instructions {
      background-color: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .instructions h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .instructions ol {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      color: #4b5563;
    }
    .instructions li {
      margin-bottom: 8px;
    }
    .cta-button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin-top: 16px;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: #2563eb;
    }
    .footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer p {
      margin: 0 0 8px 0;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header {
        padding: 24px 16px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 24px 16px;
      }
      .auth-code {
        font-size: 24px;
        letter-spacing: 2px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Welcome to InterviewPro</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">
        Hi <strong>${interviewerName}</strong>,
      </p>

      <p>
        You've been invited to join <strong>${companyName}</strong> as an interviewer on InterviewPro. We're excited to have you on board!
      </p>

      <!-- Company Info -->
      <div class="company-info">
        <p><strong>Company:</strong> ${companyName}</p>
      </div>

      <!-- Auth Code Section -->
      <div class="auth-code-section">
        <div class="auth-code-label">Your Unique Auth Code</div>
        <p class="auth-code">${authCode}</p>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <h3>Getting Started</h3>
        <ol>
          <li>Download the InterviewPro mobile app from the App Store or Google Play</li>
          <li>Open the app and select "Login as Interviewer"</li>
          <li>Enter your email address and the auth code above</li>
          <li>Complete your profile setup</li>
          <li>Start conducting interviews!</li>
        </ol>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
        If you have any questions or need assistance, please don't hesitate to reach out to your company administrator.
      </p>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        <strong>Important:</strong> Keep your auth code secure and don't share it with anyone. Each code is unique to your account.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© ${new Date().getFullYear()} InterviewPro. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
