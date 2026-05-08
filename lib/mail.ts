import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = `"Soltec Academy" <${process.env.EMAIL_USER || 'noreply@soltecacademy.com'}>`;
const LOGO_URL = `${APP_URL}/soltec-academy-logo.png`;
const THEME_COLOR = '#4f46e5';

// Helper for professional email wrapper
const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="padding: 32px; text-align: center; background-color: #09090f;">
      <img src="${LOGO_URL}" alt="Soltec Academy" style="height: 48px; width: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 40px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="padding: 32px; background-color: #f1f5f9; text-align: center;">
      <p style="margin: 0; font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Soltec Academy</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Master industry-demand skills with live cohorts.</p>
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 11px; color: #cbd5e1;">&copy; ${new Date().getFullYear()} Soltec Engineering. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendOtpEmail(email: string, name: string, otp: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MAILER MOCK] OTP for ${name} (${email}): ${otp}`);
    return;
  }

  const html = emailWrapper('Verify Your Account', `
    <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 16px 0;">Hi ${name.split(' ')[0]},</h1>
    <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0;">
      Welcome to Soltec Academy! Please use the verification code below to complete your registration.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: ${THEME_COLOR};">${otp}</span>
    </div>
    <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0;">
      This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.
    </p>
  `);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      text: `Hi ${name}, your Soltec Academy verification code is: ${otp}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }
}

export async function sendEnrollmentEmail(email: string, name: string, cohortName: string, amount: string, reference: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MAILER MOCK] Enrollment Receipt for ${name} (${email}): ${cohortName} - ${amount}`);
    return;
  }

  const html = emailWrapper('Enrollment Confirmed', `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px; background-color: #f0fdf4; border-radius: 50%; margin-bottom: 16px;">
        <svg style="width: 32px; height: 32px; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="5 13l4 4L19 7"></path></svg>
      </div>
      <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0;">Enrollment Confirmed!</h1>
    </div>
    
    <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0;">
      Hi ${name.split(' ')[0]}, you have successfully secured your spot in the <strong>${cohortName}</strong> cohort. We're excited to have you!
    </p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h2 style="font-size: 12px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Cohort</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1e293b; text-align: right;">${cohortName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Amount Paid</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1e293b; text-align: right;">${amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Transaction Ref</td>
          <td style="padding: 8px 0; font-size: 14px; font-family: monospace; color: #1e293b; text-align: right;">${reference}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/student/login" style="display: inline-block; background-color: ${THEME_COLOR}; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Go to My Dashboard</a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Success! You are enrolled in ${cohortName}`,
      text: `Hi ${name}, your enrollment in ${cohortName} is confirmed. Ref: ${reference}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send enrollment email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string, role: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MAILER MOCK] Password Reset for ${name} (${email}): ${token}`);
    return;
  }

  const resetLink = `${APP_URL}/reset-password?token=${token}&role=${role}`;
  
  const html = emailWrapper('Reset Your Password', `
    <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 16px 0;">Hi ${name.split(' ')[0]},</h1>
    <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0;">
      We received a request to reset your password for your ${role} account. Click the button below to choose a new one.
    </p>
    
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${resetLink}" style="display: inline-block; background-color: ${THEME_COLOR}; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none;">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0 0 16px 0;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    
    <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0; word-break: break-all;">
      Or copy and paste this link: <br>
      <a href="${resetLink}" style="color: ${THEME_COLOR}; text-decoration: none;">${resetLink}</a>
    </p>
  `);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Soltec Academy password',
      text: `Hi ${name}, reset your password here: ${resetLink}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
  }
}
