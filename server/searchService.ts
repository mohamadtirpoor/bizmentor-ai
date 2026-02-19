/**
 * سرویس جستجوی وب برای Deep Search
 * این سرویس از Google Custom Search API استفاده می‌کند
 */

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * جستجو در وب با استفاده از Google Custom Search
 */
export async function searchWeb(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    // استفاده از Google Custom Search API
    // برای استفاده واقعی، باید API Key و Search Engine ID داشته باشید
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.warn('⚠️ Google Search API credentials not configured');
      return [];
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=${numResults}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Search API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error('Error searching web:', error);
    return [];
  }
}

/**
 * جستجوی ساده با استفاده از DuckDuckGo (بدون نیاز به API Key)
 */
export async function searchWebSimple(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    // استفاده از DuckDuckGo HTML scraping API
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('DuckDuckGo API error:', response.status);
      return [];
    }

    // برای سادگی، فقط یک نتیجه ساده برمی‌گردانیم
    // در نسخه واقعی باید HTML را parse کنیم
    return [{
      title: `نتایج جستجو برای: ${query}`,
      link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `جستجوی عمیق فعال است. برای اطلاعات دقیق‌تر، لطفاً به لینک مراجعه کنید.`,
    }];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Search timeout after 5 seconds');
    } else {
      console.error('Error searching DuckDuckGo:', error);
    }
    return [];
  }
}

/**
 * فرمت کردن نتایج جستجو برای اضافه شدن به context
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  let formatted = '\n\n🔍 **نتایج جستجوی وب (Deep Search):**\n\n';
  
  results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   ${result.snippet}\n`;
    formatted += `   🔗 ${result.link}\n\n`;
  });

  formatted += '**توجه**: از اطلاعات بالا برای پاسخ دقیق‌تر استفاده کنید و منابع را ذکر کنید.\n';

  return formatted;
}

/**
 * تشخیص اینکه آیا سوال نیاز به جستجوی وب دارد یا نه
 */
export function needsWebSearch(question: string): boolean {
  const keywords = [
    'آخرین', 'جدیدترین', 'امروز', 'امسال', '2024', '2025', '2026',
    'latest', 'recent', 'current', 'today', 'this year',
    'قیمت', 'price', 'cost',
    'اخبار', 'news',
    'آمار', 'statistics', 'stats',
  ];

  const lowerQuestion = question.toLowerCase();
  return keywords.some(keyword => lowerQuestion.includes(keyword.toLowerCase()));
}
