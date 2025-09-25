interface ConfirmationEmailProps {
  confirmationUrl: string;
  userEmail: string;
}

export function generateConfirmationEmailHtml({
  confirmationUrl,
  userEmail
}: ConfirmationEmailProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email - NCAT SaaS</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 10px;
        }
        .content {
          text-align: center;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 20px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .info-box {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
        }
        .info-title {
          font-weight: 600;
          margin-bottom: 10px;
          color: #374151;
        }
        .info-list {
          margin: 0;
          padding-left: 20px;
        }
        .info-list li {
          margin-bottom: 5px;
          color: #6b7280;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
        }
        .link {
          color: #3b82f6;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NCAT SaaS</div>
          <div style="color: #6b7280;">No-Code Architects Toolkit</div>
        </div>
        
        <div class="content">
          <h1 class="title">Confirm Your Email Address</h1>
          <p class="subtitle">Welcome to NCAT SaaS! Please confirm your email address to complete your account setup.</p>
          
          <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
          
          <div class="info-box">
            <div class="info-title">What happens next?</div>
            <ul class="info-list">
              <li>Click the button above to verify your email address</li>
              <li>Set up your organization name and preferences</li>
              <li>Start using NCAT SaaS to process and manage your media files</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This confirmation link will expire in 24 hours. If you didn't create an account with NCAT SaaS, 
            you can safely ignore this email.
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">
            If you're having trouble with the button above, you can copy and paste the following link into your browser:
            <br>
            <a href="${confirmationUrl}" class="link">${confirmationUrl}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 NCAT SaaS. All rights reserved.</p>
          <p>This email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateConfirmationEmailText({
  confirmationUrl,
  userEmail
}: ConfirmationEmailProps): string {
  return `
Welcome to NCAT SaaS!

Please confirm your email address by clicking the following link:

${confirmationUrl}

What happens next?
• Click the link above to verify your email address
• Set up your organization name and preferences  
• Start using NCAT SaaS to process and manage your media files

This confirmation link will expire in 24 hours. If you didn't create an account with NCAT SaaS, you can safely ignore this email.

This email was sent to ${userEmail}

© 2024 NCAT SaaS. All rights reserved.
  `;
}
