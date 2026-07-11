# مشارکت در پروژه دیکته | Contributing to Dikte

We welcome contributions from the community! This guide will help you get started.

---

## 🐛 گزارش مشکل | Reporting Issues

اگر مشکلی پیدا کردید، لطفاً یک issue جدید در GitHub باز کنید با:

- توضیح واضح مشکل
- مراحل بازتولید
- محیط اجرا (مرورگر، نسخه و غیره)
- اسکرین‌شات در صورت امکان

## 💡 پیشنهاد ویژگی | Feature Requests

ایده‌های خود را در GitHub Issues مطرح کنید. لطفاً موارد زیر را شامل کنید:

- توضیح دقیق ویژگی
- موارد استفاده
- هرگونه نمونه یا مرجع

## 🔧 مشارکت در کد | Contributing Code

### مراحل | Steps

1. **Fork** مخزن
2. یک **branch** جدید بسازید:
   ```bash
   git checkout -b feature/your-feature-name
   # یا
   git checkout -b fix/your-bug-fix
   ```
3. تغییرات خود را **commit** کنید:
   ```bash
   git commit -m "feat: افزودن ویژگی جدید"
   ```
4. به **main** push کنید:
   ```bash
   git push origin feature/your-feature-name
   ```
5. یک **Pull Request** باز کنید

### نام‌گذاری branch‌ها | Branch Naming

| پیشوند | کاربرد |
|---|---|
| `feature/*` | ویژگی‌های جدید |
| `fix/*` | رفع اشکالات |
| `docs/*` | مستندات |
| `ui/*` | تغییرات رابط کاربری |
| `refactor/*` | بازسازی کد |
| `test/*` | تست‌ها |

### سبک commit‌ها | Commit Message Style

از [Conventional Commits](https://www.conventionalcommits.org/) استفاده کنید:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

| نوع | توضیح |
|---|---|
| `feat` | ویژگی جدید |
| `fix` | رفع اشکال |
| `docs` | تغییرات مستندات |
| `ui` | تغییرات رابط کاربری |
| `refactor` | بازسازی کد بدون تغییر عملکرد |
| `test` | افزودن یا اصلاح تست |
| `chore` | کارهای نگهداری |

**مثال‌ها:**
```
feat: افزودن سیستم ردیابی کلمات سخت
fix: رفع مشکل پخش صوت در مرورگر Safari
docs: افزودن راهنمای نصب PWA
ui: بهبود طراحی کارت‌های آمار
```

### استانداردهای کد | Code Standards

- از **RTL** برای تمام متن‌های فارسی استفاده کنید
- از فونت **Vazirmatn** برای متن فارسی استفاده کنید
- از **Tailwind CSS** برای استایل‌ها استفاده کنید
- کد را **تست** کنید قبل از ارسال
- **توضیحات** مناسب برای توابع بنویسید

## 📐 ساختار کد | Code Structure

```
Dikte_App/
├── index.html              # صفحه اصلی
├── manifest.json           # فایل PWA
├── sw.js                   # Service Worker
├── assets/
│   ├── css/
│   │   └── styles.css      # استایل‌های سفارشی
│   └── js/
│       ├── app.js          # کنترلر اصلی
│       ├── storage-manager.js
│       ├── ui-manager.js
│       ├── dikte-manager.js
│       ├── practice-manager.js
│       └── audio-manager.js
```

## ✅ چک‌لیست | Checklist

قبل از ارسال Pull Request:

- [ ] کد تست شده و خطایی ندارد
- [ ] commit message معنادار نوشته شده
- [ ] مستندات به‌روز شده (در صورت نیاز)
- [ ] از encoding UTF-8 استفاده شده
- [ ] جهت RTL در CSS رعایت شده

## 📝 مجوز | License

با مشارکت در این پروژه، شما با شرایط [MIT License](LICENSE) موافقت می‌کنید.

---

با ❤️ برای جامعه فارسی‌زبان — Farzin-CS
