/**
 * Email helper functions for sending transactional emails via Resend API
 * Shared across all Edge Functions
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using the Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = "NCAT SaaS <noreply@ncat-saas.com>"
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return { success: false, error: "Email service not configured" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Resend API Error:", errorData);
      return { success: false, error: `Email send failed: ${response.status}` };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Send email error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Template variables for workspace member joined email
 */
interface MemberJoinedEmailParams {
  memberName: string;
  memberEmail: string;
  workspaceName: string;
  memberRole: string;
  joinedDate: string;
  workspaceURL: string;
  settingsURL: string;
}

/**
 * Send notification email when a new member joins workspace
 */
export async function sendMemberJoinedEmail(
  recipientEmails: string[],
  params: MemberJoinedEmailParams
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Team Member</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse">
      <tr>
        <td align="center" style="padding: 40px 0">
          <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center">
                <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a">🎉 New Team Member!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 40px 40px">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a">
                  Great news! A new member has joined your workspace on <strong>NCAT SaaS</strong>.
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <tr>
                    <td style="padding: 20px">
                      <table role="presentation" style="width: 100%; border-collapse: collapse">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px">Member:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600">${params.memberName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px">Email:</td>
                          <td style="padding: 8px 0; color: #2563eb; font-size: 14px">${params.memberEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px">Workspace:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px">${params.workspaceName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px">Role:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px">
                            <span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 13px; font-weight: 500">${params.memberRole}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px">Joined:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px">${params.joinedDate}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; font-size: 15px; line-height: 1.6; color: #4a4a4a">
                  Welcome them to the team and help them get started with your workspace!
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0">
                  <tr>
                    <td align="center">
                      <a href="${params.workspaceURL}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500">View Workspace</a>
                    </td>
                  </tr>
                </table>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280">
                  You received this email because you're a member of <strong>${params.workspaceName}</strong>.
                  To manage your notification preferences, visit your <a href="${params.settingsURL}" style="color: #2563eb; text-decoration: underline">settings page</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="margin: 0; font-size: 13px; text-align: center; color: #6b7280">© 2025 NCAT SaaS. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const result = await sendEmail({
    to: recipientEmails,
    subject: `New member joined ${params.workspaceName}`,
    html
  });

  return result;
}

/**
 * Template variables for workspace member removed email
 */
interface MemberRemovedEmailParams {
  memberName: string;
  workspaceName: string;
  previousRole: string;
  removedDate: string;
  myWorkspaceURL: string;
  supportURL: string;
}

/**
 * Send notification email when a member is removed from workspace
 */
export async function sendMemberRemovedEmail(
  recipientEmail: string,
  params: MemberRemovedEmailParams
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workspace Access Removed</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse">
      <tr>
        <td align="center" style="padding: 40px 0">
          <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center">
                <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a">Workspace Access Removed</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 40px 40px">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a">Hi ${params.memberName},</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a">
                  We're writing to let you know that your access to <strong>${params.workspaceName}</strong> has been removed by a workspace administrator.
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                  <tr>
                    <td style="padding: 20px">
                      <table role="presentation" style="width: 100%; border-collapse: collapse">
                        <tr>
                          <td style="padding: 8px 0; color: #991b1b; font-size: 14px; width: 140px">Workspace:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600">${params.workspaceName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #991b1b; font-size: 14px">Removal Date:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px">${params.removedDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #991b1b; font-size: 14px">Previous Role:</td>
                          <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px">
                            <span style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #991b1b; border-radius: 12px; font-size: 13px; font-weight: 500">${params.previousRole}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0; font-size: 15px; line-height: 1.6; color: #4a4a4a"><strong>What this means:</strong></p>
                <ul style="margin: 10px 0 20px 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #4a4a4a">
                  <li>You can no longer access files, projects, or content in this workspace</li>
                  <li>Any ongoing jobs or tasks in this workspace have been stopped</li>
                  <li>Your personal workspace and account remain active</li>
                  <li>Your NCAT SaaS account is unaffected</li>
                </ul>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
                <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: #4a4a4a"><strong>What you can do:</strong></p>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4a4a4a">
                  If you believe this was done in error or have questions about this change, please reach out to the workspace administrator directly or contact our support team.
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0">
                  <tr>
                    <td align="center">
                      <table role="presentation" style="border-collapse: collapse">
                        <tr>
                          <td style="padding: 0 10px">
                            <a href="${params.myWorkspaceURL}" style="display: inline-block; padding: 14px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500">Go to My Workspace</a>
                          </td>
                          <td style="padding: 0 10px">
                            <a href="${params.supportURL}" style="display: inline-block; padding: 14px 24px; background-color: #f3f4f6; color: #1f2937; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; border: 1px solid #d1d5db">Contact Support</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280">
                  Thank you for using NCAT SaaS. If you have any concerns about this change, our support team is here to help at
                  <a href="mailto:support@ncat-saas.com" style="color: #2563eb">support@ncat-saas.com</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="margin: 0; font-size: 13px; text-align: center; color: #6b7280">© 2025 NCAT SaaS. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Your access to ${params.workspaceName} has been removed`,
    html
  });

  return result;
}
