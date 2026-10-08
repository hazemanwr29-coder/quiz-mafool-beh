نسخة Cloudflare Pages + D1 لاختبار المفعول به

ما الذي تحتويه هذه النسخة؟
- index.html: نفس الاختبار + نفس لوحة المعلم الموجودة أصلًا.
- functions/: وظائف Cloudflare Pages لحفظ النتائج وقراءة لوحة المعلم.
- schema.sql: كود إنشاء جداول D1.
- _routes.json: تشغيل Functions فقط على مسارات API، مع إبقاء الصفحة الرئيسية ثابتة وسريعة.

الخطوات بدون أوامر (بدون Terminal):

1) GitHub
- ارفع محتويات هذا المجلد إلى مستودع GitHub موجود أو جديد.
- يجب أن يكون index.html في جذر المستودع، ومجلد functions في جذر المستودع.

2) Cloudflare Pages
- ادخل Cloudflare > Workers & Pages.
- Create application > Pages > Connect to Git.
- اختر GitHub ثم المستودع.
- Production branch = main.
- Build command = exit 0 (أو اتركه فارغًا إن قبلت الواجهة ذلك).
- Build output directory = . (أو / حسب الواجهة).
- أكمل Create/Save and Deploy.
- استخدم Git integration؛ Cloudflare لا تدعم Direct Upload لمشروع يحتوي Pages Functions.

3) إنشاء قاعدة البيانات D1
- Cloudflare Dashboard > D1 SQL database.
- Create database.
- الاسم المقترح: arabic-quiz-db
- افتح قاعدة البيانات > Console.
- انسخ محتوى schema.sql كله إلى الـConsole وشغّله.

4) ربط D1 بمشروع Pages
- افتح مشروع Pages.
- Settings > Bindings > Add > D1 database.
- Variable name = DB
- اختر قاعدة arabic-quiz-db.
- Save ثم Redeploy للمشروع.

5) كلمة مرور المعلم
- Project > Settings > Variables and Secrets.
- أضف:
  TEACHER_PASSWORD = كلمة مرور لوحة المعلم
- اجعلها Secret.
- يجب أن تكون متاحة للـFunctions/Runtime.
- احفظ ثم Redeploy.

6) الاختبار
- افتح رابط pages.dev.
- نفذ محاولة تجريبية.
- انتظر رسالة حفظ النتيجة.
- افتح لوحة المعلم من نفس الرابط وأدخل كلمة المرور.
- يجب أن تظهر النتيجة في الجدول.

7) التحديثات بعد ذلك
- أي تعديل في GitHub على branch main سيؤدي إلى نشر جديد تلقائيًا بعد تفعيل Git integration.

مهم:
- لا Google Sheets.
- لا Google Apps Script.
- لا Supabase.
- لا Netlify.
- لا تضع TEACHER_PASSWORD في GitHub أو داخل index.html.
