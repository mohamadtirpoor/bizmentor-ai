# راهنمای راه‌اندازی ایمیل (Gmail SMTP)

## ✅ چیزهایی که اضافه شد:

1. **سرویس ایمیل** (`server/emailService.ts`)
2. **API های جدید**:
   - `POST /api/auth/send-code` - ارسال کد تایید
   - `POST /api/auth/verify-code` - تایید کد و ورود/ثبت‌نام
3. **قالب ایمیل زیبا** با HTML

---

## 🔧 راه‌اندازی Gmail SMTP:

### مرحله 1: ساخت App Password

1. برو به حساب گوگل: https://myaccount.google.com/
2. Security → 2-Step Verification (باید فعال باشه)
3. App passwords → Select app: "Mail" → Select device: "Other"
4. نام بده: "BusinessMeter"
5. کد 16 رقمی رو کپی کن

### مرحله 2: تنظیم Environment Variables

در فایل `.env.local`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App Password (16 رقمی)
```

**مهم:** از App Password استفاده کن، نه رمز عادی!

### مرحله 3: تست

```bash
# Start server
npm run server

# Test API
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🎨 نحوه استفاده در Frontend:

### 1. ارسال کد:

```typescript
const response = await fetch('/api/auth/send-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

const data = await response.json();
// { success: true, message: "کد تایید به ایمیل شما ارسال شد" }
```

### 2. تایید کد:

```typescript
const response = await fetch('/api/auth/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    code: '123456',
    name: 'نام کاربر' // اختیاری
  })
});

const data = await response.json();
// { success: true, user: { id, name, email, ... } }
```

---

## 🔄 فلوی کامل:

```
1. کاربر ایمیل رو وارد می‌کنه
   ↓
2. کلیک روی "ارسال کد"
   ↓
3. Backend کد 6 رقمی تولید می‌کنه
   ↓
4. ایمیل با قالب زیبا ارسال میشه
   ↓
5. کاربر کد رو وارد می‌کنه
   ↓
6. Backend کد رو چک می‌کنه
   ↓
7. اگه کاربر وجود داشت → ورود
   اگه کاربر جدید بود → ثبت‌نام
```

---

## 🚀 گزینه‌های دیگه (حرفه‌ای‌تر):

### 1. Mailgun (توصیه می‌شه)
- رایگان تا 5000 ایمیل/ماه
- سریع‌تر و قابل اعتمادتر
- API ساده

```bash
npm install mailgun.js
```

### 2. SendGrid
- رایگان تا 100 ایمیل/روز
- Dashboard عالی
- Analytics

```bash
npm install @sendgrid/mail
```

### 3. AWS SES
- خیلی ارزان (0.10$ per 1000 emails)
- مقیاس‌پذیر
- نیاز به تنظیمات بیشتر

---

## ⚠️ نکات مهم:

1. **Gmail محدودیت داره**: حداکثر 500 ایمیل/روز
2. **برای Production**: از Mailgun یا SendGrid استفاده کن
3. **App Password**: حتماً از App Password استفاده کن، نه رمز عادی
4. **Rate Limiting**: برای جلوگیری از spam، rate limit بذار
5. **Redis**: برای production، کدها رو در Redis ذخیره کن (نه Memory)

---

## 📊 مرحله بعدی:

حالا باید Frontend رو آپدیت کنی که:
1. فرم ورود با ایمیل داشته باشه
2. دکمه "ارسال کد" داشته باشه
3. فیلد ورود کد 6 رقمی داشته باشه
4. تایمر 10 دقیقه‌ای داشته باشه

میخوای Frontend رو هم برات بسازم؟
