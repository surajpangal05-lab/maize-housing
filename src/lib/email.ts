import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationCode(email: string, code: string) {
  const from = process.env.EMAIL_FROM || 'noreply@maizelease.com'

  await transporter.sendMail({
    from: `"MaizeLease" <${from}>`,
    to: email,
    subject: `${code} is your MaizeLease verification code`,
    text: `Your MaizeLease verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00274C; font-size: 24px; margin: 0;">MaizeLease</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Your verification code is:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00274C; padding: 16px 0; font-family: monospace;">
            ${code}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">This code expires in 10 minutes.</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
