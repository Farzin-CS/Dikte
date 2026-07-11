# دیکته — اپلیکیشن تمرین دیکته فارسی

<!-- Badges -->
[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Stable-brightgreen?style=flat-square)]()

## Persian Dictation Practice App

A professional Persian (Farsi) dictation web application designed to help learners improve their spelling and writing skills through interactive practice sessions.

---

## 📖 Description | توضیحات

**دیکته** یک اپلیکیشن وب حرفه‌ای برای تمرین دیکته فارسی است. این برنامه با ارائه تمرینات تعاملی، بازخورد فوری و پیگیری پیشرفت، به شما کمک می‌کند تا مهارت‌های نوشتاری خود را بهبود بخشید.

**Dikte** is a professional web application for practicing Persian dictation. Through interactive exercises, instant feedback, and progress tracking, it helps learners improve their Persian spelling and writing skills.

## ✨ Features | ویژگی‌ها

| | |
|---|---|
| 🎯 | **تمرین تعاملی** — سیستم تمرین کلمه به کلمه با بازخورد فوری |
| 📊 | **داشبورد هوشمند** — آمار تمرین، نرخ موفقیت، بهترین رکورد |
| 🔥 | **ردیابی روزstreak** — پیگیری تمرین روزانه با شمارندهstreak |
| 📝 | **ایجاد دیکته** — ساخت دیکته‌های سفارشی با دسته‌بندی و سطح دشواری |
| 🗂️ | **تاریخچه کامل** — ثبت و مرور تمام تمرینات انجام‌شده |
| 🔊 | **پشتیبانی صوتی** — تبدیل متن به گفتار با تنظیمات قابل تنظیم |
| 🌙 | **حالت تاریک** — پشتیبانی کامل از تم روشن و تاریک |
| 📱 | **طراحی واکنش‌گرا** — سازگار با موبایل، تبلت و دسکتاپ |
| ⚡ | **PWA + آفلاین** — کارکرد کامل بدون اینترنت، قابل نصب روی دستگاه |
| ⌨️ | **میانبرهای کیبورد** — کنترل سریع با Ctrl/Cmd + کلیدها |
| 📤 | **درون‌ریزی/برون‌ریزی** — پشتیبان‌گیری و بازیابی داده‌ها |
| 🎯 | **تمرین سریع** — تمرین ۵ کلمه تصادفی از کلمات سخت |
| 📈 | **کلمات سخت** — شناسایی و تمرین کلماتی که بیشتر اشتباه می‌شوند |

## 🛠️ Tech Stack | فناوری‌ها

| فناوری | توضیح |
|---|---|
| **Tailwind CSS** | فریم‌ورک CSS برای طراحی رابط کاربری |
| **Vazirmatn** | فونت فارسی با پشتیبانی کامل از حروف و اعداد |
| **PWA / Service Worker** | کارکرد آفلاین و نصب به عنوان اپلیکیشن |
| **IndexedDB + localStorage** | ذخیره‌سازی داده‌ها به صورت محلی |
| **Web Speech API** | تبدیل متن به گفتار |
| **PureClaw Connect** | زیرساخت و اتوماسیون |

## 📸 Screenshots | تصاویر

![screenshot](https://via.placeholder.com/800x400?text=Dikte+Screenshot)

## 🚀 Installation & Usage | نصب و استفاده

### استفاده آنلاین
برای دسترسی سریع، فایل `index.html` را در مرورگر باز کنید یا از [Netlify Deploy](#) استفاده کنید.

### نصب محلی

```bash
# کلون کردن پروژه
git clone https://github.com/Farzin-CS/Dikte.git
cd Dikte/Dikte_App

# باز کردن در مرورگر
# (نیازی به نصب نیست - مستقیم باز کنید)
open index.html

# یا استفاده از سرور محلی
npx serve .
```

### نصب به عنوان PWA

1. فایل `index.html` را در مرورگر باز کنید
2. در Chrome/Edge: روی آیکون نصب در نوار آدرس کلیک کنید
3. در Safari iOS: روی **اشتراک‌گذاری → افزودن به صفحه اصلی** بزنید

## 🤝 Contributing | مشارکت

برای مشارکت در این پروژه، لطفاً [CONTRIBUTING.md](CONTRIBUTING.md) را مطالعه کنید.

### نام‌گذاری branch‌ها
- `main` — شاخه اصلی
- `feature/*` — ویژگی‌های جدید
- `fix/*` — رفع اشکالات
- `docs/*` — مستندات

### سبک commit‌ها
```
docs: افزودن مستندات
feat: ویژگی جدید
ui: تغییرات رابط کاربری
fix: رفع اشکال
refactor: بازسازی کد
```

## 📄 License | مجوز

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

ساخته شده با ❤️ برای جامعه فارسی‌زبان
