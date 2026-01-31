# راهنمای آپلود PDF ها به لیارا

## وضعیت فعلی
- ✅ کد دیپلوی شده: https://businessmeter.ir
- ❌ PDF ها آپلود نشده (270MB+)
- ❌ سیستم RAG فعال نیست

## راه‌حل: استفاده از Liara Disk

### مرحله 1: ایجاد Disk
1. برو به: https://console.liara.ir/apps/bus-metr/disks
2. کلیک روی "ایجاد دیسک جدید"
3. تنظیمات:
   - **نام**: `pdf-storage`
   - **حجم**: 1 GB
   - **مسیر Mount**: `/app/Sorce`
4. ذخیره کن

### مرحله 2: آپلود فایل‌ها با FTP

#### گزینه A: استفاده از FileZilla (توصیه می‌شه)
1. دانلود FileZilla: https://filezilla-project.org/
2. از پنل لیارا اطلاعات FTP رو بگیر:
   - Apps > bus-metr > Console > FTP Access
3. در FileZilla وصل شو
4. پوشه `Sorce` رو با تمام زیرپوشه‌ها آپلود کن:
   ```
   Sorce/
   ├── Finance/
   ├── HR/
   ├── Marketing/
   ├── product/
   └── Seles/
   ```

#### گزینه B: استفاده از Liara CLI
```bash
# نصب Liara CLI (اگه نصب نیست)
npm install -g @liara/cli

# لاگین
liara login

# دسترسی به Shell
liara shell --app bus-metr

# در Shell لیارا:
cd /app
mkdir -p Sorce/Finance Sorce/HR Sorce/Marketing Sorce/product Sorce/Seles
```

سپس با FTP فایل‌ها رو آپلود کن.

### مرحله 3: تست سیستم RAG
بعد از آپلود، برو به سایت و یک سوال تخصصی بپرس تا ببینی RAG کار می‌کنه.

## راه‌حل جایگزین: Object Storage

اگه Disk کار نکرد، می‌تونی از Object Storage استفاده کنی:

1. ایجاد Object Storage در لیارا
2. آپلود PDF ها
3. تغییر کد برای خواندن از URL

(این روش پیچیده‌تره، فقط در صورت نیاز استفاده کن)

## بررسی لاگ‌ها

برای دیدن لاگ‌های سرور:
```bash
liara logs --app bus-metr -f
```

یا از پنل: https://console.liara.ir/apps/bus-metr/logs

## نکات مهم

- ✅ حجم کل PDF ها: ~270MB
- ✅ Disk 1GB کافیه
- ✅ بعد از آپلود، نیازی به دیپلوی مجدد نیست
- ✅ فقط یکبار باید آپلود کنی
