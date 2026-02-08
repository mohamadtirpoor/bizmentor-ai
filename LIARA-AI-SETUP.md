# راهنمای تنظیم Liara AI (GPT-4o-mini)

## مراحل دریافت API Key از Liara

### 1. ورود به پنل Liara
- به آدرس https://console.liara.ir بروید
- وارد حساب کاربری خود شوید

### 2. فعال‌سازی سرویس AI
- از منوی سمت راست، روی **AI** کلیک کنید
- اگر سرویس AI فعال نیست، آن را فعال کنید

### 3. دریافت API Key
- در صفحه AI، روی **API Keys** کلیک کنید
- روی **Create New API Key** کلیک کنید
- یک نام برای API Key انتخاب کنید (مثلاً: businessmeter-production)
- API Key را کپی کنید (فقط یک بار نمایش داده می‌شود!)

### 4. تنظیم API Key در Liara

#### روش 1: از طریق داشبورد (توصیه می‌شود)
1. به اپلیکیشن **bus-metr** بروید
2. از منوی سمت چپ، روی **تنظیمات** کلیک کنید
3. به بخش **متغیرهای محیطی** (Environment Variables) بروید
4. یک متغیر جدید اضافه کنید:
   - Key: `LIARA_API_KEY`
   - Value: [API Key که کپی کردید]
5. روی **ذخیره** کلیک کنید
6. اپلیکیشن به صورت خودکار ری‌استارت می‌شود

#### روش 2: از طریق فایل .env.production
1. فایل `.env.production` را باز کنید
2. مقدار `LIARA_API_KEY` را با API Key واقعی جایگزین کنید:
   ```
   LIARA_API_KEY=lrn_xxxxxxxxxxxxxxxxxxxxx
   ```
3. فایل را ذخیره کنید
4. دیپلوی کنید

## مدل‌های موجود در Liara AI

- **gpt-4o-mini**: مدل سریع و کم‌هزینه (توصیه می‌شود)
- **gpt-4o**: مدل قدرتمند‌تر
- **gpt-3.5-turbo**: مدل قدیمی‌تر

## تنظیمات فعلی پروژه

```typescript
// server/index.ts
const LIARA_ENDPOINT = 'https://api.liara.ir/v1';
const LIARA_API_KEY = process.env.LIARA_API_KEY;

const openai = new OpenAI({
  baseURL: LIARA_ENDPOINT,
  apiKey: LIARA_API_KEY,
  timeout: 60000,
  maxRetries: 2
});

// در API chat
model: 'gpt-4o-mini'
```

## تست API

بعد از تنظیم API Key، می‌توانید با ارسال یک پیام در چت، عملکرد را تست کنید.

اگر خطا دریافت کردید، لاگ‌های سرور را بررسی کنید:
```bash
liara logs --app bus-metr
```

## هزینه‌ها

- GPT-4o-mini: حدود 0.15 دلار به ازای هر 1 میلیون توکن ورودی
- GPT-4o: حدود 5 دلار به ازای هر 1 میلیون توکن ورودی

برای مشاهده هزینه‌های دقیق، به بخش Billing در پنل Liara مراجعه کنید.

## پشتیبانی

اگر مشکلی داشتید:
- مستندات Liara AI: https://docs.liara.ir/ai/
- پشتیبانی Liara: support@liara.ir
