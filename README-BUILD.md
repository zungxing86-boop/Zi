# Zi Atlas — نسخه مستقل ویندوز و اندروید

این مخزن شامل اطلس تعاملی فارسی مخاطرات و امنیت زیستی است که با React/Vite ساخته شده است. دو پوسته بومی برای همان داده‌ها و صفحات اضافه شده‌اند:

- **Windows / Electron**: فایل نصب Zi-Setup-*.exe و نسخه قابل‌حمل Zi-Portable-*.exe
- **Android / Capacitor**: فایل نصب app-debug.apk برای آزمایش روی اندروید

تمام داده‌های اصلی و قلم‌های فارسی از داخل بسته بارگذاری می‌شوند؛ اجرای اطلس نیازی به سرور یا اینترنت ندارد. لینک‌های خارجی، در صورت استفاده، به اینترنت نیاز خواهند داشت.

## دریافت فایل‌های نصب

۱. به تب **Actions** مخزن بروید.
۲. اجرای موفق **Build Windows EXE and Android APK** را باز کنید.
۳. از بخش **Artifacts** خروجی Zi-Windows-EXE یا Zi-Android-APK را دانلود و از ZIP استخراج کنید.
۴. ویندوز: Zi-Portable را مستقیم اجرا کنید یا Zi-Setup را نصب کنید. اندروید: app-debug.apk را نصب کنید.

**توجه:** خروجی‌ها فعلاً امضای تجاری ندارند. Windows SmartScreen ممکن است هشدار ناشر ناشناس نشان دهد. APK با کلید توسعه (debug) امضا می‌شود و برای آزمایش مناسب است، نه انتشار عمومی در Google Play.

## ساخت محلی

Node.js 24 و npm لازم است. دستورهای آغازین:

    npm install
    npm run lint
    npm run build

ساخت EXE روی ویندوز:

    npm run dist:win

خروجی‌ها در پوشه release قرار می‌گیرند.

اندروید (به همراه Android SDK و Java 21):

    npm run build
    npx cap add android
    npx cap sync android
    cd android
    ./gradlew assembleDebug

خروجی APK در android/app/build/outputs/apk/debug/app-debug.apk ساخته می‌شود.

برای توسعه وب: npm run dev

## نکات فنی

- تنظیم Vite با base: './' برای بارگذاری صحیح محلی لازم است.
- فونت‌ها از بسته‌های @fontsource و داخل خروجی بارگذاری می‌شوند؛ Google Fonts خارجی حذف شده است.
- خروجی CSV روی اندروید با Capacitor Filesystem + Share به گزینه‌های ذخیره/اشتراک‌گذاری سیستم فرستاده می‌شود.
- پوشه native اندروید در CI ساخته می‌شود و به نگهداری دستی پروژه Android Studio نیاز ندارد.
- هر دو خروجی از همان فایل‌های src و داده‌های موجود استفاده می‌کنند.
