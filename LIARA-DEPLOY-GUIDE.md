# راهنمای دیپلوی و رفع خطای 502

## 🔴 مشکل فعلی:
سایت خطای 502 میده چون DATABASE_URL در لیارا ست نشده.

---

## ✅ راه حل (مرحله به مرحله):

### مرحله 1️⃣: اضافه کردن Environment Variables در لیارا

1. برو به کنسول لیارا:
   👉 https://console.liara.ir/apps/bus-metr/settings

2. پیدا کن بخش **"متغیرهای محیطی"** یا **"Environment Variables"**

3. این متغیرها رو اضافه کن:

```
DATABASE_URL=postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres
```

```
EMAIL_USER=businessmeter.ir@gmail.com
```

```
EMAIL_PASS=hqjm lhfh hmvv loyc
```

4. روی دکمه **"افزودن"** یا **"Add"** بزن

---

### مرحله 2️⃣: Restart اپلیکیشن

1. برگرد به صفحه اصلی اپ:
   👉 https://console.liara.ir/apps/bus-metr

2. روی دکمه **"Restart"** یا **"راه‌اندازی مجدد"** بزن

3. صبر کن تا اپ restart بشه (۱-۲ دقیقه)

---

### مرحله 3️⃣: تست سایت

بعد از restart، این آدرس‌ها رو تست کن:

1. **Health Check:**
   👉 https://businessmeter.ir/health
   
   باید ببینی:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "database": "connected"
   }
   ```

2. **صفحه اصلی:**
   👉 https://businessmeter.ir
   
   باید سایت بالا بیاد

3. **بخش مقالات:**
   👉 کلیک روی دکمه "مقالات"
   
   باید ۶ مقاله رو ببینی

4. **پنل ادمین:**
   👉 https://businessmeter.ir/admin
   
   Username: `mohamad`
   Password: `mohamad.tir1383`

---

## 📊 اطلاعات دیتابیس:

```
Host: businessmeter
Port: 5432
Username: root
Password: jpMjfUFd8b2DlnaMkcSX6ctd
Database: postgres
```

**Connection String:**
```
postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres
```

**اتصال با psql:**
```bash
psql -h businessmeter -p 5432 -U root -W postgres
```

---

## 🐛 اگه هنوز خطا داد:

### چک کردن لاگ‌ها:
1. برو به: https://console.liara.ir/apps/bus-metr/logs
2. ببین چه خطایی میده

### خطاهای رایج:

**1. Database connection failed:**
- چک کن DATABASE_URL درست وارد شده
- مطمئن شو دیتابیس در لیارا فعال هست

**2. Port already in use:**
- Restart کن اپ رو

**3. Module not found:**
- ممکنه dependencies نصب نشده باشن
- توی لاگ‌ها چک کن

---

## 📝 چک‌لیست:

- [ ] DATABASE_URL در Environment Variables اضافه شده
- [ ] EMAIL_USER در Environment Variables اضافه شده  
- [ ] EMAIL_PASS در Environment Variables اضافه شده
- [ ] اپ Restart شده
- [ ] /health جواب میده
- [ ] سایت اصلی بالا اومده
- [ ] بخش مقالات کار میکنه
- [ ] پنل ادمین در دسترس هست

---

## 🎯 بعد از رفع مشکل:

وقتی همه چیز کار کرد:
1. ✅ سایت اصلی: https://businessmeter.ir
2. ✅ مقالات SEO شده: دکمه "مقالات"
3. ✅ پنل ادمین: https://businessmeter.ir/admin
4. ✅ چت هوشمند با AI
5. ✅ ثبت‌نام ساده کاربران
6. ✅ دیتابیس متصل

---

## 💡 نکته مهم:

اگه DATABASE_URL رو ست نکنی، سایت بالا میاد ولی:
- ❌ پنل ادمین کار نمیکنه
- ❌ اطلاعات کاربران ذخیره نمیشه (فقط localStorage)
- ✅ چت و مقالات کار میکنن

پس حتماً DATABASE_URL رو ست کن!
