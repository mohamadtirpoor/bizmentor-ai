import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BookOpen, Trash2, RefreshCw, BarChart3 } from 'lucide-react';

interface LearnedKnowledge {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  qualityScore: number;
  usageCount: number;
  createdAt: string;
}

interface LearningStats {
  totalKnowledge: number;
  averageQuality: number;
  totalUsage: number;
  byCategory: { category: string; count: number }[];
}

interface LearningPanelProps {
  darkMode: boolean;
}

const LearningPanel: React.FC<LearningPanelProps> = ({ darkMode }) => {
  const [knowledge, setKnowledge] = useState<LearnedKnowledge[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'مالی', 'مارکتینگ', 'فروش', 'منابع انسانی', 'مدیریت محصول', 'عمومی'];

  useEffect(() => {
    fetchKnowledge();
    fetchStats();
  }, [selectedCategory]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/learned-knowledge?category=${selectedCategory}&limit=100`);
      const data = await response.json();
      setKnowledge(data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/learning-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const processLearning = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/admin/process-learning', {
        method: 'POST',
      });
      const data = await response.json();
      alert(data.message);
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      console.error('Error processing learning:', error);
      alert('خطا در پردازش یادگیری');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteKnowledge = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این دانش را حذف کنید؟')) return;

    try {
      await fetch(`/api/admin/learned-knowledge/${id}`, {
        method: 'DELETE',
      });
      fetchKnowledge();
      fetchStats();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      alert('خطا در حذف دانش');
    }
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              پنل یادگیری هوش مصنوعی
            </h1>
          </div>
          <button
            onClick={processLearning}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : darkMode
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'در حال پردازش...' : 'پردازش مکالمات جدید'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1a1a2e]' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  کل دانش
                </h3>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalKnowledge}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1a1a2e]' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  میانگین کیفیت
                </h3>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.averageQuality}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1a1a2e]' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  تعداد استفاده
                </h3>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalUsage}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1a1a2e]' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-orange-500" />
                <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  دسته‌بندی‌ها
                </h3>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.byCategory.length}
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#252538]'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'همه' : cat}
            </button>
          ))}
        </div>

        {/* Knowledge List */}
        <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-[#1a1a2e]' : 'bg-white'} shadow-lg`}>
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className={`w-8 h-8 mx-auto mb-4 animate-spin ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>در حال بارگذاری...</p>
            </div>
          ) : knowledge.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                هنوز دانشی یاد گرفته نشده است
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-[#252538]' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      سوال
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      پاسخ
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      دسته
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      کیفیت
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      استفاده
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {knowledge.map((item) => (
                    <tr key={item.id} className={darkMode ? 'hover:bg-[#252538]' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="max-w-md line-clamp-2">{item.question}</div>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="max-w-md line-clamp-2 text-sm">{item.answer}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                          darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.category || 'عمومی'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${
                          item.qualityScore >= 5 ? 'text-green-500' :
                          item.qualityScore >= 2 ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}>
                          {item.qualityScore}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.usageCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteKnowledge(item.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPanel;
