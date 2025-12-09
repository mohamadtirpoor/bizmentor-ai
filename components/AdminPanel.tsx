import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Search,
  MoreVertical,
  Save,
  Edit2
} from 'lucide-react';

interface AdminPanelProps {
  plans: any[];
  setPlans: React.Dispatch<React.SetStateAction<any[]>>;
  onLogout?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ plans, setPlans, onLogout }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'plans'>('dashboard');

  // --- Sub-components (Inline for single-file simplicity) ---

  // 1. Dashboard Component
  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+۱۲٪</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">کل کاربران</h3>
          <p className="text-3xl font-bold text-white">۱,۲۳۴</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+۸٪</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">درآمد این ماه</h3>
          <p className="text-3xl font-bold text-white">۴۵,۲۰۰,۰۰۰ <span className="text-sm font-normal text-gray-500">تومان</span></p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">زنده</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">جلسات فعال</h3>
          <p className="text-3xl font-bold text-white">۵۶</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          آمار بازدید و تعامل
        </h3>
        <div className="h-48 flex items-end gap-2 px-2">
          {[40, 65, 30, 80, 55, 90, 70, 45, 60, 100, 75, 50].map((h, i) => (
            <div key={i} className="flex-1 bg-purple-600/30 hover:bg-purple-500/60 rounded-t-lg transition-all relative group" style={{ height: `${h}%` }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {h * 10}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
          <span>فروردین</span>
          <span>اردیبهشت</span>
          <span>خرداد</span>
          <span>تیر</span>
          <span>مرداد</span>
          <span>شهریور</span>
        </div>
      </div>
    </div>
  );

  // 2. Users Component
  const UsersView = () => {
    const mockUsers = [
      { id: 1, name: 'علی رضایی', email: 'ali@example.com', plan: 'Pro Plus', status: 'active', joined: '۱۴۰۲/۰۵/۱۰' },
      { id: 2, name: 'سارا محمدی', email: 'sara@example.com', plan: 'Free', status: 'inactive', joined: '۱۴۰۲/۰۶/۱۲' },
      { id: 3, name: 'امیر حسینی', email: 'amir@example.com', plan: 'Platinum', status: 'active', joined: '۱۴۰۲/۰۶/۱۵' },
      { id: 4, name: 'مریم کریمی', email: 'maryam@example.com', plan: 'Pro', status: 'active', joined: '۱۴۰۲/۰۷/۰۱' },
      { id: 5, name: 'رضا اکبری', email: 'reza@example.com', plan: 'Free', status: 'active', joined: '۱۴۰۲/۰۷/۰۵' },
    ];

    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="جستجو کاربر..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            افزودن کاربر
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-right">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">کاربر</th>
                <th className="px-6 py-4 font-medium">پلن</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium">تاریخ عضویت</th>
                <th className="px-6 py-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockUsers.map((user) => (
                <tr key={user.id} className="text-sm text-gray-300 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.plan === 'Platinum' ? 'bg-amber-500/20 text-amber-400' :
                      user.plan === 'Pro Plus' ? 'bg-purple-500/20 text-purple-400' :
                      user.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. Plan Editor Component
  const PlansView = () => {
    const handleUpdatePlan = (id: string, field: string, value: string) => {
      setPlans(prev => prev.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ));
    };

    return (
      <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
        {plans.map((plan) => (
          <div key={plan.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
             {/* Edit Indicator */}
             <div className="absolute top-4 left-4 p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4 text-gray-400" />
             </div>

             <div className="flex items-start gap-4 mb-6">
               <div className={`p-4 rounded-2xl bg-white/5 ${plan.color}`}>
                 <plan.icon className="w-8 h-8" />
               </div>
               <div className="flex-1 space-y-4">
                 <div>
                   <label className="block text-xs text-gray-500 mb-1">نام پلن</label>
                   <input 
                     type="text" 
                     value={plan.name}
                     onChange={(e) => handleUpdatePlan(plan.id, 'name', e.target.value)}
                     className="bg-transparent border-b border-white/20 pb-1 w-full text-xl font-bold text-white focus:border-purple-500 focus:outline-none transition-colors"
                   />
                 </div>
                 <div>
                   <label className="block text-xs text-gray-500 mb-1">قیمت (تومان)</label>
                   <input 
                     type="text" 
                     value={plan.price}
                     onChange={(e) => handleUpdatePlan(plan.id, 'price', e.target.value)}
                     className="bg-transparent border-b border-white/20 pb-1 w-full text-lg font-mono text-gray-300 focus:border-purple-500 focus:outline-none transition-colors"
                   />
                 </div>
               </div>
             </div>

             <div className="space-y-2">
               <label className="block text-xs text-gray-500">ویژگی‌ها (نمایش فقط‌خواندنی)</label>
               {plan.features.map((f: string, i: number) => (
                 <div key={i} className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-2 rounded-lg">
                   <div className={`w-1.5 h-1.5 rounded-full ${plan.color.replace('text-', 'bg-')}`}></div>
                   {f}
                 </div>
               ))}
             </div>
          </div>
        ))}
        <div className="flex justify-end mt-4">
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20">
              <Save className="w-5 h-5" />
              ذخیره تغییرات
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-l border-white/10 bg-black/40 flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            پنل مدیریت
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeView === 'dashboard' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            داشبورد
          </button>
          <button 
            onClick={() => setActiveView('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeView === 'users' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            کاربران
          </button>
          <button 
            onClick={() => setActiveView('plans')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeView === 'plans' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            مدیریت اشتراک‌ها
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 p-2">
             <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">A</div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white">مدیر سیستم</p>
               <p className="text-xs text-gray-500 truncate">admin@businessmeter.ir</p>
             </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              خروج از پنل مدیریت
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header (Tabs) */}
        <div className="md:hidden flex overflow-x-auto p-4 gap-2 border-b border-white/10">
           <button onClick={() => setActiveView('dashboard')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>داشبورد</button>
           <button onClick={() => setActiveView('users')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'users' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>کاربران</button>
           <button onClick={() => setActiveView('plans')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'plans' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>اشتراک‌ها</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
           <div className="max-w-5xl mx-auto w-full">
             <div className="mb-8">
               <h1 className="text-2xl font-bold text-white mb-2">
                 {activeView === 'dashboard' && 'داشبورد مدیریتی'}
                 {activeView === 'users' && 'لیست کاربران'}
                 {activeView === 'plans' && 'ویرایش طرح‌های درآمدی'}
               </h1>
               <p className="text-gray-400 text-sm">به پنل مدیریت بیزنس‌متر خوش آمدید.</p>
             </div>

             {activeView === 'dashboard' && <DashboardView />}
             {activeView === 'users' && <UsersView />}
             {activeView === 'plans' && <PlansView />}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;