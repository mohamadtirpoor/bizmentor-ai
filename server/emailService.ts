import nodemailer from 'nodemailer';

// تنظیمات SMTP (باید در .env قرار بگیرن)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // ایمیل گوگل شما
    pass: process.env.EMAIL_PASS, // App Password (نه رمز عادی!)
  },
});

// تولید کد تصادفی 6 رقمی
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ارسال کد تایید
export async function sendVerificationEmail(
  toEmail: string,
  code: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `بیزنس‌متر <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'کد تایید ورود به بیزنس‌متر',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .code-box {
              background: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              color: #dc3545;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 بیزنس‌متر</h1>
            </div>
            <div class="content">
              <h2>کد تایید شما</h2>
              <p>برای ورود به حساب کاربری خود، کد زیر را وارد کنید:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p>این کد تا <strong>10 دقیقه</strong> معتبر است.</p>
              <p class="warning">⚠️ این کد را با هیچ‌کس به اشتراک نگذارید!</p>
            </div>
            <div class="footer">
              <p>اگر شما درخواست این کد را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
              <p>© 2026 بیزنس‌متر - مشاور هوشمند کسب‌وکار</p>
              <p><a href="https://businessmeter.ir" style="color: #667eea;">businessmeter.ir</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}
