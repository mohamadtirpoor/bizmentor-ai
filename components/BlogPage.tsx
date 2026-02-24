import React, { useState } from 'react';
import { ArrowRight, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface BlogPageProps {
  darkMode: boolean;
  onBack: () => void;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
}

const articles: Article[] = [
  {
    id: 'product-management-basics',
    title: 'اصول مدیریت محصول: راهنمای جامع برای مدیران محصول',
    excerpt: 'مدیریت محصول یکی از مهم‌ترین نقش‌ها در کسب‌وکارهای مدرن است. در این مقاله با اصول و تکنیک‌های کلیدی آشنا می‌شوید.',
    category: 'مدیریت محصول',
    readTime: '۸ دقیقه',
    date: '۱۴۰۳/۱۱/۱۵',
    content: `# اصول مدیریت محصول

مدیریت محصول یکی از حیاتی‌ترین نقش‌ها در کسب‌وکارهای امروزی است. مدیر محصول مسئول تعریف چشم‌انداز، استراتژی و نقشه راه محصول است.

## وظایف کلیدی مدیر محصول

### ۱. تحقیق و شناخت بازار
مدیر محصول باید به طور مستمر بازار را تحلیل کند، نیازهای مشتریان را شناسایی کرده و رقبا را بررسی کند.

### ۲. تعریف استراتژی محصول
تعیین اهداف بلندمدت، شناسایی مزیت رقابتی و تعریف ارزش پیشنهادی محصول از وظایف اصلی است.

### ۳. مدیریت نقشه راه
ایجاد و به‌روزرسانی نقشه راه محصول، اولویت‌بندی ویژگی‌ها و هماهنگی با تیم‌های مختلف.

## مهارت‌های ضروری

- تفکر استراتژیک و تحلیلی
- مهارت‌های ارتباطی قوی
- درک عمیق از تکنولوژی
- توانایی تصمیم‌گیری مبتنی بر داده

## ابزارهای مدیریت محصول

برخی از ابزارهای محبوب عبارتند از:
- Jira برای مدیریت پروژه
- Figma برای طراحی
- Google Analytics برای تحلیل داده
- Miro برای همکاری تیمی`
  },
  {
    id: 'marketing-strategy-2024',
    title: 'استراتژی‌های بازاریابی دیجیتال در سال ۲۰۲۴',
    excerpt: 'بازاریابی دیجیتال به سرعت در حال تغییر است. با جدیدترین استراتژی‌ها و روندهای بازاریابی آشنا شوید.',
    category: 'مارکتینگ',
    readTime: '۶ دقیقه',
    date: '۱۴۰۳/۱۱/۱۰',
    content: `# استراتژی‌های بازاریابی دیجیتال

بازاریابی دیجیتال در سال ۲۰۲۴ با چالش‌ها و فرصت‌های جدیدی روبرو است.

## روندهای کلیدی

### ۱. بازاریابی محتوایی
تولید محتوای باکیفیت و ارزشمند برای مخاطبان هدف.

### ۲. سئو و بهینه‌سازی
بهینه‌سازی وب‌سایت برای موتورهای جستجو و افزایش ترافیک ارگانیک.

### ۳. شبکه‌های اجتماعی
استفاده هوشمندانه از پلتفرم‌های اجتماعی برای تعامل با مشتریان.

## کانال‌های بازاریابی موثر

- اینستاگرام و تلگرام برای بازار ایران
- لینکدین برای B2B
- گوگل ادز برای تبلیغات
- ایمیل مارکتینگ برای وفادارسازی

## اندازه‌گیری موفقیت

استفاده از KPIهای مناسب مانند:
- نرخ تبدیل (Conversion Rate)
- هزینه جذب مشتری (CAC)
- ارزش طول عمر مشتری (LTV)
- نرخ بازگشت سرمایه (ROI)`
  },
  {
    id: 'sales-techniques',
    title: 'تکنیک‌های فروش حرفه‌ای: از مذاکره تا بستن قرارداد',
    excerpt: 'فروش یک هنر است که می‌توان آن را یاد گرفت. با تکنیک‌های اثبات شده فروش آشنا شوید.',
    category: 'فروش',
    readTime: '۷ دقیقه',
    date: '۱۴۰۳/۱۱/۰۵',
    content: `# تکنیک‌های فروش حرفه‌ای

فروش موفق نیازمند مهارت، دانش و تمرین مداوم است.

## مراحل فرآیند فروش

### ۱. شناسایی مشتری بالقوه
یافتن افرادی که نیاز به محصول یا خدمات شما دارند.

### ۲. ایجاد ارتباط اولیه
برقراری ارتباط موثر و ایجاد اعتماد با مشتری.

### ۳. شناسایی نیاز
پرسیدن سوالات درست برای فهم عمیق نیازهای مشتری.

### ۴. ارائه راه‌حل
نشان دادن اینکه محصول شما چگونه مشکل مشتری را حل می‌کند.

### ۵. رفع اعتراضات
پاسخ به سوالات و نگرانی‌های مشتری.

### ۶. بستن قرارداد
هدایت مشتری به تصمیم‌گیری نهایی.

## تکنیک‌های مذاکره

- گوش دادن فعال
- همدلی با مشتری
- ارائه ارزش، نه فقط قیمت
- استفاده از داستان‌سرایی
- ایجاد حس فوریت

## اشتباهات رایج در فروش

- صحبت کردن بیش از حد
- عدم آماده‌سازی قبل از جلسه
- تمرکز بر ویژگی‌ها به جای مزایا
- نادیده گرفتن پیگیری`
  },
  {
    id: 'financial-management',
    title: 'مدیریت مالی کسب‌وکار: راهنمای عملی برای کارآفرینان',
    excerpt: 'مدیریت صحیح مالی یکی از عوامل کلیدی موفقیت کسب‌وکار است. اصول مدیریت مالی را بیاموزید.',
    category: 'مالی',
    readTime: '۹ دقیقه',
    date: '۱۴۰۳/۱۰/۲۸',
    content: `# مدیریت مالی کسب‌وکار

مدیریت مالی موثر می‌تواند تفاوت بین موفقیت و شکست کسب‌وکار باشد.

## اصول مدیریت مالی

### ۱. برنامه‌ریزی مالی
تهیه بودجه، پیش‌بینی جریان نقدی و تعیین اهداف مالی.

### ۲. کنترل هزینه‌ها
شناسایی و کاهش هزینه‌های غیرضروری.

### ۳. مدیریت جریان نقدی
اطمینان از وجود نقدینگی کافی برای عملیات روزانه.

### ۴. تحلیل مالی
بررسی صورت‌های مالی و شاخص‌های کلیدی.

## گزارش‌های مالی مهم

- صورت سود و زیان
- ترازنامه
- صورت جریان وجوه نقد
- گزارش بودجه

## نسبت‌های مالی کلیدی

- نسبت جاری (Current Ratio)
- نسبت بدهی به دارایی
- حاشیه سود ناخالص
- بازده دارایی‌ها (ROA)

## نکات مهم

- جداسازی حساب‌های شخصی و کسب‌وکار
- ذخیره‌سازی برای شرایط اضطراری
- استفاده از نرم‌افزارهای حسابداری
- مشاوره با متخصصان مالی`
  },
  {
    id: 'hr-management',
    title: 'مدیریت منابع انسانی: جذب، نگهداری و توسعه استعدادها',
    excerpt: 'منابع انسانی مهم‌ترین دارایی هر سازمان است. با بهترین شیوه‌های مدیریت HR آشنا شوید.',
    category: 'منابع انسانی',
    readTime: '۸ دقیقه',
    date: '۱۴۰۳/۱۰/۲۰',
    content: `# مدیریت منابع انسانی

مدیریت موثر منابع انسانی کلید ایجاد یک سازمان موفق است.

## فرآیند جذب استعداد

### ۱. تعریف نیاز
مشخص کردن دقیق مهارت‌ها و ویژگی‌های مورد نیاز.

### ۲. جذب کاندیدا
استفاده از کانال‌های مختلف برای یافتن بهترین افراد.

### ۳. غربالگری و مصاحبه
ارزیابی دقیق مهارت‌ها و تناسب فرهنگی.

### ۴. انتخاب و استخدام
تصمیم‌گیری نهایی و ارائه پیشنهاد کار.

## نگهداری کارکنان

- ایجاد فرهنگ سازمانی مثبت
- ارائه فرصت‌های رشد و توسعه
- سیستم پاداش و تشویق منصفانه
- تعادل کار و زندگی

## توسعه کارکنان

- برنامه‌های آموزشی
- منتورینگ و کوچینگ
- مسیر شغلی روشن
- بازخورد منظم

## چالش‌های HR

- جذب استعدادهای برتر
- کاهش نرخ ترک کار
- مدیریت عملکرد
- ایجاد تنوع و شمول`
  },
  {
    id: 'business-analytics',
    title: 'تحلیل داده در کسب‌وکار: تصمیم‌گیری مبتنی بر داده',
    excerpt: 'داده‌ها می‌توانند به شما کمک کنند تصمیمات بهتری بگیرید. با تحلیل داده کسب‌وکار آشنا شوید.',
    category: 'تحلیل کسب‌وکار',
    readTime: '۷ دقیقه',
    date: '۱۴۰۳/۱۰/۱۵',
    content: `# تحلیل داده در کسب‌وکار

در عصر دیجیتال، داده‌ها به نفت جدید تبدیل شده‌اند.

## انواع تحلیل داده

### ۱. تحلیل توصیفی
چه اتفاقی افتاده است؟

### ۲. تحلیل تشخیصی
چرا این اتفاق افتاده است؟

### ۳. تحلیل پیش‌بینی
چه اتفاقی خواهد افتاد؟

### ۴. تحلیل تجویزی
چه کاری باید انجام دهیم؟

## ابزارهای تحلیل داده

- Google Analytics برای وب
- Power BI برای گزارش‌گیری
- Excel برای تحلیل‌های ساده
- Python/R برای تحلیل‌های پیشرفته

## KPIهای مهم کسب‌وکار

- نرخ رشد درآمد
- هزینه جذب مشتری (CAC)
- ارزش طول عمر مشتری (LTV)
- نرخ حفظ مشتری
- نرخ تبدیل

## فرآیند تحلیل داده

۱. تعریف سوال کسب‌وکار
۲. جمع‌آوری داده
۳. پاکسازی و آماده‌سازی
۴. تحلیل و مدل‌سازی
۵. تفسیر نتایج
۶. ارائه و اقدام`
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ darkMode, onBack }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');

  const categories = ['همه', 'مدیریت محصول', 'مارکتینگ', 'فروش', 'مالی', 'منابع انسانی', 'تحلیل کسب‌وکار'];

  const filteredArticles = selectedCategory === 'همه' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  if (selectedArticle) {
    return (
      <div className={`h-full overflow-y-auto ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedArticle(null)}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all ${
              darkMode 
                ? 'text-purple-400 hover:bg-purple-500/10' 
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            بازگشت به مقالات
          </button>

          {/* Article Header */}
          <div className="mb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
              darkMode 
                ? 'bg-purple-500/20 text-purple-300' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {selectedArticle.category}
            </span>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedArticle.title}
            </h1>
            <div className={`flex items-center gap-4 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedArticle.readTime}
              </span>
              <span>{selectedArticle.date}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className={`prose prose-lg max-w-none ${
            darkMode ? 'prose-invert' : ''
          }`}>
            <div className="whitespace-pre-line leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all ${
              darkMode 
                ? 'text-purple-400 hover:bg-purple-500/10' 
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            بازگشت
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مقالات آموزشی
              </h1>
            </div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            دانش و تجربیات کسب‌وکار را با ما به اشتراک بگذارید
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? darkMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                    ? 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                darkMode 
                  ? 'bg-[#1a1a2e] hover:bg-[#252538] border border-purple-500/10' 
                  : 'bg-white hover:shadow-lg border border-gray-200'
              }`}
            >
              <span className={`inline-block px-3 py-1 rounded-full text-xs mb-3 ${
                darkMode 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {article.category}
              </span>
              
              <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {article.title}
              </h3>
              
              <p className={`text-sm mb-4 line-clamp-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {article.excerpt}
              </p>
              
              <div className={`flex items-center justify-between text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
                <span>{article.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
